// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SOS system...');
    initializeApp();
});

function initializeApp() {
    const SOSButton = document.getElementById('sosButton');
    const statusDiv = document.getElementById('status');
    const transcriptionText = document.getElementById('transcriptionText');
    const timerDiv = document.getElementById('timer');
    const userIdInput = document.getElementById('userId');
    const callStatusDiv = document.getElementById('callStatus');
    const callTranscriptDiv = document.getElementById('callTranscript');
    const callTranscriptContent = document.getElementById('callTranscriptContent');
    let currentEventSource = null;

    if (!SOSButton || !statusDiv) {
        console.error('Required DOM elements not found!');
        return;
    }

    let recognition = null;
    let recordingTimer = null;
    let timeLeft = 10;
    let transcribedText = '';

    // Helper function to add punctuation to transcribed text
    function addPunctuation(text) {
        if (!text || text.trim().length === 0) return text;
        
        let processed = text.trim();
        
        // Capitalize first letter
        if (processed.length > 0) {
            processed = processed.charAt(0).toUpperCase() + processed.slice(1);
        }
        
        // Add commas after connecting words when they appear mid-sentence
        // Pattern: word + connector + word (add comma before connector)
        processed = processed.replace(/\s+(but|and|or|so|however|therefore|then)\s+/gi, (match, connector, offset, full) => {
            // Don't add comma if connector is at the start or already has punctuation nearby
            const before = full.substring(0, offset);
            const after = full.substring(offset + match.length);
            
            // If there's meaningful text before and after, add comma
            if (before.trim().length > 0 && after.trim().length > 0) {
                // Check if comma already exists nearby
                const recentText = before.slice(-10);
                if (!recentText.includes(',') && !before.match(/[.!?]$/)) {
                    return ', ' + connector + ' ';
                }
            }
            return ' ' + connector + ' ';
        });
        
        // Add commas after longer pauses (multiple spaces)
        processed = processed.replace(/\s{2,}/g, ', ');
        
        // Add period at the end if no punctuation exists
        if (processed.length > 0 && !processed.match(/[.!?]$/)) {
            processed += '.';
        }
        
        // Clean up punctuation issues
        processed = processed.replace(/[.,]{2,}/g, '.');
        processed = processed.replace(/,\s*\./g, '.');
        processed = processed.replace(/\s+([.,!?])/g, '$1'); // Remove space before punctuation
        
        return processed;
    }

    // Helper function to update status
    function updateStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    // Initialize status
    updateStatus('Emergency Portal Ready • Press SOS to activate', 'idle');
    
    // Siren sound functionality
    let sirenAudioContext = null;
    let sirenOscillator = null;
    let sirenInterval = null;
    
    function playSiren() {
        try {
            // Create audio context if it doesn't exist
            if (!sirenAudioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                sirenAudioContext = new AudioContext();
            }
            
            // Resume audio context (in case it was suspended)
            if (sirenAudioContext.state === 'suspended') {
                sirenAudioContext.resume();
            }
            
            // Stop existing oscillator if running
            stopSiren();
            
            // Create new oscillator for siren effect
            sirenOscillator = sirenAudioContext.createOscillator();
            const gainNode = sirenAudioContext.createGain();
            
            // Configure siren sound (alternating frequency)
            sirenOscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, sirenAudioContext.currentTime);
            
            sirenOscillator.connect(gainNode);
            gainNode.connect(sirenAudioContext.destination);
            
            // Create continuous siren effect
            let currentTime = sirenAudioContext.currentTime;
            const sirenDuration = 1.0; // 1 second cycle
            
            // Schedule frequency changes for continuous siren effect
            const scheduleSirenCycle = () => {
                if (!sirenOscillator || !SOSButton.classList.contains('recording')) {
                    return;
                }
                
                sirenOscillator.frequency.setValueAtTime(800, currentTime);
                sirenOscillator.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.5);
                sirenOscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 1.0);
                currentTime += sirenDuration;
            };
            
            sirenOscillator.start();
            
            // Schedule periodic updates
            sirenInterval = setInterval(() => {
                if (SOSButton.classList.contains('recording') && sirenOscillator) {
                    scheduleSirenCycle();
                } else {
                    stopSiren();
                }
            }, 1000);
            
            // Initial schedule
            scheduleSirenCycle();
            
        } catch (err) {
            console.log('Siren sound error:', err);
        }
    }
    
    function stopSiren() {
        if (sirenInterval) {
            clearInterval(sirenInterval);
            sirenInterval = null;
        }
        
        if (sirenOscillator) {
            try {
                sirenOscillator.stop();
                sirenOscillator.disconnect();
                sirenOscillator = null;
            } catch (err) {
                console.log('Error stopping siren:', err);
            }
        }
    }

    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    console.log('Final transcript:', transcript);
                } else {
                    interimTranscript += transcript;
                    console.log('Interim transcript:', transcript);
                }
            }

            // Only append final transcripts to avoid duplicates
            if (finalTranscript) {
                transcribedText += finalTranscript;
            }
            
            // Display both final and interim with punctuation
            let displayText = transcribedText + interimTranscript;
            if (displayText.trim()) {
                // Apply punctuation to the display text
                displayText = addPunctuation(displayText);
                transcriptionText.textContent = displayText;
                transcriptionText.style.color = 'rgba(255, 255, 255, 0.9)';
            } else {
                transcriptionText.textContent = 'AI is listening...';
                transcriptionText.style.color = 'rgba(255, 255, 255, 0.5)';
            }
            
            console.log('Current full transcription:', transcribedText);
            console.log('Interim:', interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error, event);
            
            // Handle specific errors
            if (event.error === 'no-speech') {
                console.log('No speech detected, continuing...');
                // Don't reset on no-speech, user might still be talking
                return;
            } else if (event.error === 'audio-capture') {
                updateStatus('No microphone found. Please check your microphone.', 'error');
                resetButton();
            } else if (event.error === 'not-allowed') {
                updateStatus('Microphone permission denied. Please allow microphone access.', 'error');
                resetButton();
            } else {
                updateStatus('Speech recognition error: ' + event.error, 'error');
                // Don't reset on minor errors, allow recovery
                if (event.error === 'network' || event.error === 'aborted') {
                    console.log('Network/abort error, will continue if still recording');
                    return;
                }
            }
        };

        recognition.onstart = () => {
            console.log('Speech recognition started');
            updateStatus('Recording... Speak now!', 'recording');
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            // Only auto-restart if we're still supposed to be recording
            if (SOSButton.classList.contains('recording') && timeLeft > 0) {
                console.log('Auto-restarting recognition...');
                try {
                    recognition.start();
                } catch (e) {
                    console.log('Recognition already started or error:', e);
                }
            }
        };
    } else {
        updateStatus('Speech recognition not supported in this browser. Please use Chrome or Edge.', 'error');
        SOSButton.disabled = true;
        SOSButton.style.opacity = '0.5';
    }

    // Start recording when SOS button is pressed
    SOSButton.addEventListener('click', async () => {
        console.log('SOS button clicked!');
        
        if (SOSButton.classList.contains('recording')) {
            console.log('Already recording, ignoring click');
            return; // Already recording
        }
        
        // Play siren sound
        playSiren();

        const userId = userIdInput.value.trim() || 'user1';
        console.log('Starting SOS alert for user:', userId);
        
        // Reset state
        transcribedText = '';
        transcriptionText.textContent = 'AI is listening...';
        callStatusDiv.classList.remove('active');
        timeLeft = 10;
        
        // Reset timer first
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        timeLeft = 10;
        const timerValue = timerDiv.querySelector('.timer-value');
        if (timerValue) {
            timerValue.textContent = formatTime(timeLeft);
        }
        
        // Start recording UI state
        startRecording();
        
        // Fetch user data from database (async, won't block)
        fetchUserData(userId);
        
        // Start timer immediately
        startTimer();
        
        // Start speech recognition
        if (recognition) {
            try {
                // Stop any existing recognition first
                try {
                    recognition.stop();
                } catch (e) {
                    // Ignore if not running
                }
                
                console.log('Starting speech recognition...');
                // Small delay to ensure clean start
                setTimeout(() => {
                    recognition.start();
                }, 100);
            } catch (error) {
                console.error('Error starting recognition:', error);
                if (error.message && error.message.includes('already started')) {
                    // If already started, just continue
                    console.log('Recognition already running, continuing...');
                } else {
                    updateStatus('Error starting speech recognition: ' + error.message, 'error');
                    resetButton();
                }
            }
        } else {
            console.error('Speech recognition not available');
            updateStatus('Speech recognition not available. Please use Chrome or Edge browser.', 'error');
        }
    });

    function startRecording() {
        SOSButton.classList.add('recording');
        SOSButton.classList.remove('processing', 'success');
        updateStatus('🚨 SOS ACTIVE • Speak your emergency message', 'recording');
    }

    function startTimer() {
        // Clear any existing timer first
        if (recordingTimer) {
            clearInterval(recordingTimer);
        }
        
        const timerValue = timerDiv.querySelector('.timer-value');
        
        // Initialize timer display
        timerValue.textContent = formatTime(timeLeft);
        
        // Start countdown
        recordingTimer = setInterval(() => {
            timeLeft--;
            timerValue.textContent = formatTime(timeLeft);
            console.log('Timer:', timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(recordingTimer);
                recordingTimer = null;
                stopRecording();
            }
        }, 1000);
    }

    function formatTime(seconds) {
        return `00:${seconds.toString().padStart(2, '0')}`;
    }

    function stopRecording() {
        console.log('Stopping recording...');
        
        // Clear timer
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        
        // Stop speech recognition
        if (recognition) {
            try {
                recognition.stop();
                console.log('Speech recognition stopped');
            } catch (e) {
                console.log('Error stopping recognition (may already be stopped):', e);
            }
        }
        
        // Update UI
        SOSButton.classList.remove('recording');
        SOSButton.classList.add('processing');
        updateStatus('AI Processing • Analyzing emergency & contacting services...', 'processing');
        
        // Wait a moment for any final transcription to complete
        setTimeout(() => {
            // Get final transcription and add punctuation
            let finalMessage = transcribedText || 'Emergency SOS alert activated.';
            finalMessage = addPunctuation(finalMessage);
            console.log('Final transcribed message:', finalMessage);
            
            // Make the call
            makeCall(finalMessage);
        }, 500);
    }

    async function fetchUserData(userId) {
        try {
            const response = await fetch(`/api/user/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                return userData;
            } else {
                console.error('User not found, using default');
                return {
                    name: 'Unknown User',
                    age: 'Unknown',
                    sex: 'Unknown',
                    emergencyContact: 'Not provided',
                    location: 'Not provided'
                };
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            return {
                name: 'Unknown User',
                age: 'Unknown',
                sex: 'Unknown',
                emergencyContact: 'Not provided',
                location: 'Not provided'
            };
        }
    }

    async function makeCall(message) {
        const userId = userIdInput.value.trim() || 'user1';
        
        try {
            const response = await fetch('/api/make-call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    transcribedMessage: message,
                    phoneNumber: '+13614259843' // Target number
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                SOSButton.classList.remove('processing');
                SOSButton.classList.add('success');
                updateStatus('Call initiated successfully!', 'success');
                
                callStatusDiv.innerHTML = `
                    <p>✓ AI call successfully initiated</p>
                    <p style="font-size: 0.85em; opacity: 0.7; margin-top: 8px;">Emergency services are being contacted...</p>
                `;
                callStatusDiv.classList.add('success', 'active');
                
                // Show call transcript container and start SSE connection
                if (data.callId) {
                    callTranscriptDiv.style.display = 'block';
                    startTranscriptListener(data.callId);
                }
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    resetButton();
                }, 3000);
            } else {
                const errorMsg = data.details || data.error || 'Failed to make call';
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Error making call:', error);
            SOSButton.classList.remove('processing');
            
            let errorDisplay = error.message;
            if (error.message.includes('API key') || error.message.includes('BLAND')) {
                errorDisplay = `
                    <p>✗ <strong>Configuration Error</strong></p>
                    <p>${error.message}</p>
                    <p style="margin-top: 10px; font-size: 0.9em;">
                        Please check your BLAND_AI_API_KEY in the .env file.
                    </p>
                `;
            }
            
            updateStatus('Error making call', 'error');
            
            callStatusDiv.innerHTML = errorDisplay;
            callStatusDiv.classList.add('error', 'active');
            
            resetButton();
        }
    }

    function resetButton() {
        SOSButton.classList.remove('recording', 'processing', 'success');
        updateStatus('Emergency Portal Ready • Press SOS to activate', 'idle');
        timerDiv.querySelector('.timer-value').textContent = '00:10';
        transcriptionText.textContent = 'Ready to process your emergency message...';
        transcriptionText.style.color = 'rgba(255, 255, 255, 0.7)';
        transcribedText = '';
        timeLeft = 10;
        
        // Stop siren sound
        stopSiren();
        
        // Close transcript connection
        if (currentEventSource) {
            currentEventSource.close();
            currentEventSource = null;
        }
        
        // Hide transcript container
        callTranscriptDiv.style.display = 'none';
        callTranscriptContent.innerHTML = '<p class="call-transcript-placeholder">Waiting for call to connect...</p>';
        
        // Clear any remaining timers
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
    }
    
    // Start listening to live call transcript via Server-Sent Events
    function startTranscriptListener(callId) {
        // Close existing connection if any
        if (currentEventSource) {
            currentEventSource.close();
        }
        
        const eventSource = new EventSource(`/api/call-transcript/${callId}`);
        currentEventSource = eventSource;
        
        eventSource.onmessage = (event) => {
            try {
                const transcriptData = JSON.parse(event.data);
                updateTranscriptDisplay(transcriptData);
            } catch (error) {
                console.error('Error parsing transcript data:', error);
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            // Try to reconnect after a delay if call is still active
            setTimeout(() => {
                if (callTranscriptDiv.style.display !== 'none') {
                    startTranscriptListener(callId);
                }
            }, 3000);
        };
    }
    
    // Update the transcript display with new messages
    function updateTranscriptDisplay(transcriptData) {
        if (!transcriptData.messages || transcriptData.messages.length === 0) {
            callTranscriptContent.innerHTML = '<p class="call-transcript-placeholder">Waiting for conversation to start...</p>';
            return;
        }
        
        let html = '';
        
        transcriptData.messages.forEach((msg, index) => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            const isAI = msg.type === 'ai';
            const isUser = msg.type === 'user';
            const isTranscript = msg.type === 'transcript';
            
            if (isAI) {
                html += `
                    <div class="transcript-message ai-message">
                        <div class="transcript-message-header">
                            <span class="transcript-speaker">🤖 AI Agent</span>
                            <span class="transcript-time">${time}</span>
                        </div>
                        <div class="transcript-message-content">${escapeHtml(msg.content)}</div>
                    </div>
                `;
            } else if (isUser) {
                html += `
                    <div class="transcript-message user-message">
                        <div class="transcript-message-header">
                            <span class="transcript-speaker">👤 Operator</span>
                            <span class="transcript-time">${time}</span>
                        </div>
                        <div class="transcript-message-content">${escapeHtml(msg.content)}</div>
                    </div>
                `;
            } else if (isTranscript) {
                html += `
                    <div class="transcript-message transcript-message">
                        <div class="transcript-message-content">${escapeHtml(msg.content)}</div>
                    </div>
                `;
            }
        });
        
        // Add status indicator
        if (transcriptData.status) {
            const statusText = transcriptData.status === 'active' ? '🔴 Live' : 
                             transcriptData.status === 'ended' ? '✓ Call Ended' :
                             transcriptData.status === 'completed' ? '✓ Call Completed' :
                             transcriptData.status;
            html += `<div class="transcript-status">${statusText}</div>`;
        }
        
        callTranscriptContent.innerHTML = html;
        
        // Auto-scroll to bottom
        callTranscriptContent.scrollTop = callTranscriptContent.scrollHeight;
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

