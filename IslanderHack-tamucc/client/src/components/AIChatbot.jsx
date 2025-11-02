import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiService } from '../services/apiService';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI Emergency Assistant. I can help you with:\n\n• Emergency preparedness tips\n• Weather hazard information\n• Evacuation planning\n• Supply checklist guidance\n• Real-time safety alerts\n\nHow can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);


  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || isStreaming) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare messages for OpenAI (format: { role, content })
      const messagesForAPI = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add empty assistant message that will be streamed into
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      }]);

      setIsTyping(false);
      setIsStreaming(true);
      setStreamingContent('');

      let accumulatedContent = '';

      // Stream response from OpenAI
      await apiService.streamChatMessage(messagesForAPI, (chunk) => {
        accumulatedContent += chunk;
        setStreamingContent(accumulatedContent);
      });

      // Finalize the message with accumulated content
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.isStreaming) {
          lastMessage.content = accumulatedContent;
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });
      setStreamingContent('');
      setIsStreaming(false);

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove the empty streaming message on error
      setMessages(prev => prev.filter((msg, idx) => 
        !(idx === prev.length - 1 && msg.isStreaming)
      ));
      
      const errorMsg = error.message || 'Failed to get response';
      if (errorMsg.includes('API key') || errorMsg.includes('OpenAI')) {
        toast.error('OpenAI API not configured. Please check server settings.');
      } else {
        toast.error(errorMsg.includes('Rate limit') ? 'Rate limit exceeded. Please try again later.' : 'Failed to get response. Please try again.');
      }
      setIsTyping(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const quickActions = [
    { icon: '🌀', label: 'Hurricane Tips', query: 'Tell me about hurricane safety' },
    { icon: '🚗', label: 'Evacuation Routes', query: 'Help me plan evacuation' },
    { icon: '📋', label: 'Supply Checklist', query: 'What supplies do I need?' },
    { icon: '🌦️', label: 'Weather Alerts', query: 'Check weather alerts' }
  ];

  // Get the last message to check if it's streaming
  const lastMessage = messages[messages.length - 1];
  const isLastMessageStreaming = lastMessage && lastMessage.isStreaming;

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl transition-all duration-300 ease-out border border-slate-200 dark:border-slate-700 ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Emergency Assistant</h3>
              <p className="text-xs text-white/80">
                {isTyping || isStreaming ? 'Typing...' : 'Online • Ready to help'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="h-[420px] overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 scroll-smooth">
          {messages.map((msg, idx) => {
            const isCurrentlyStreaming = idx === messages.length - 1 && isLastMessageStreaming && isStreaming;
            const displayContent = isCurrentlyStreaming ? streamingContent : msg.content;
            
            return (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl transition-all ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {displayContent}
                    {isCurrentlyStreaming && (
                      <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                    )}
                  </p>
                  {!isCurrentlyStreaming && (
                    <p className="text-xs opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && !isStreaming && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && !isTyping && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMessage(action.query);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-xs font-medium transition flex items-center gap-1"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isTyping && !isStreaming && handleSendMessage()}
              placeholder="Ask me anything..."
              disabled={isTyping || isStreaming}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping || isStreaming}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
