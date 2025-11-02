
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { calculateScore, setChecklist, setLocation } from '../store/store'
import { apiService } from '../services/apiService'
import { toast } from 'react-toastify'
import Header from '../components/Header'
import ScoreCard from '../components/ScoreCard'
import ChecklistModal from '../components/ChecklistModal'
import AIChatbot from '../components/AIChatbot'
import WeatherRiskAnalysis from '../components/WeatherRiskAnalysis'

function HeroSection({ onStartWizard }) {
  return (
    <section className="relative py-20 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-white"></div>
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="bAI Watch Logo" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback if logo not found
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="inline-block px-5 py-2 bg-white rounded-full text-slate-700 text-sm font-medium mb-6 border border-slate-200 shadow-sm">
          🤖 bAI Watch
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-800 leading-tight">
          Smarter monitoring.<br />Safer community.
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
          Preparing Corpus Christi, One Alert at a Time. Get your personalized emergency action plan in minutes with our dedicated Action Plan Agent, which analyzes your household, location, and needs to create custom evacuation routes, supply checklists, and real-time alerts for all hazards—while the SOS AI Voice Calling Agent automatically sends interactive SOS voice calls to family, authorities, or emergency resources during crises, guiding them with real-time updates and two-way communication.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-600 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            Real-time weather data
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            Multi-hazard alerts
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            24/7 notifications
          </div>
        </div>
      </div>
    </section>
  )
}

function StepWizard({ onComplete }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    zip: '',
    adults: 1,
    kids: 0,
    elderly: 0,
    pets: 0,
    medical: [],
    vehicle: true
  })

  const steps = [
    { id: 1, title: 'Location', icon: '📍' },
    { id: 2, title: 'Household', icon: '👨‍👩‍👧‍👦' },
    { id: 3, title: 'Medical', icon: '💊' },
    { id: 4, title: 'Transport', icon: '🚗' },
  ]

  function handleNext() {
    if (step < 4) setStep(step + 1)
    else onComplete(formData)
  }

  return (
    <div className="glass-card rounded-3xl shadow-2xl p-8 md:p-10 max-w-2xl mx-auto border border-white/50">
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center flex-1 group">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                s.id === step 
                  ? 'gradient-primary text-white shadow-xl scale-110 ring-4 ring-blue-200' 
                  : s.id < step 
                    ? 'gradient-success text-white shadow-lg scale-105' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                {s.icon}
              </div>
              <div className={`text-xs mt-3 font-semibold transition-colors ${step >= s.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                {s.title}
              </div>
            </div>
          ))}
        </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      <div className="min-h-60">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2">What's your location?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">We'll use this to find your evacuation zone and local shelters.</p>
            <input
              type="text"
              placeholder="Enter ZIP code"
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              className="w-full px-4 py-3 glass-card rounded-xl focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2">Tell us about your household</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">This helps us customize your supply checklist.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Adults</label>
                <input type="number" min="0" value={formData.adults} onChange={(e) => setFormData({ ...formData, adults: +e.target.value })} className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Children</label>
                <input type="number" min="0" value={formData.kids} onChange={(e) => setFormData({ ...formData, kids: +e.target.value })} className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Elderly</label>
                <input type="number" min="0" value={formData.elderly} onChange={(e) => setFormData({ ...formData, elderly: +e.target.value })} className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pets</label>
                <input type="number" min="0" value={formData.pets} onChange={(e) => setFormData({ ...formData, pets: +e.target.value })} className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2">Any medical needs?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">Select all that apply to ensure proper planning.</p>
            <div className="space-y-3">
              {['Oxygen', 'Dialysis', 'Insulin', 'Daily medications', 'Mobility assistance'].map(item => (
                <label key={item} className="flex items-center gap-3 p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-indigo-400 cursor-pointer transition">
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2">Transportation</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">Do you have access to a vehicle for evacuation?</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-indigo-400 cursor-pointer transition">
                <input type="radio" name="vehicle" checked={formData.vehicle} onChange={() => setFormData({ ...formData, vehicle: true })} className="w-5 h-5 accent-indigo-600" />
                <div>
                  <div className="font-semibold">Yes, I have a vehicle</div>
                  <div className="text-sm text-slate-500">We'll provide driving routes and fuel stations</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-indigo-400 cursor-pointer transition">
                <input type="radio" name="vehicle" checked={!formData.vehicle} onChange={() => setFormData({ ...formData, vehicle: false })} className="w-5 h-5 accent-indigo-600" />
                <div>
                  <div className="font-semibold">No vehicle available</div>
                  <div className="text-sm text-slate-500">We'll locate public transport and shelter options</div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-2 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-600 transition"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="glass-button px-8 py-3 text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-105 transition-all"
        >
          {step === 4 ? 'Generate Plan' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, action }) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const score = useSelector((s) => s.preparedness.score)
  const [showWizard, setShowWizard] = useState(false)
  const [generatingChecklist, setGeneratingChecklist] = useState(false)
  const [checklistError, setChecklistError] = useState(null)
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [checklistData, setChecklistData] = useState(null)
  const [requestingLocation, setRequestingLocation] = useState(false)

  const seedChecklist = [
    '3-day water supply (1 gal/person/day)',
    '3-day medication supply',
    'Flashlights + batteries',
    'Portable phone chargers',
    'Important documents in waterproof bag',
    'Pet supplies',
    'Vehicle fuel',
    'Evacuation plan & routes',
  ]

  // Request browser location access
  const handleRequestLocation = async () => {
    setRequestingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('❌ Geolocation is not supported by your browser');
      setRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get zip code
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBoI4Es0phAjBLJy0bVoljkqGpfFkWCEgI'}`
          );
          const data = await response.json();
          
          if (data.results && data.results[0]) {
            const addressComponents = data.results[0].address_components;
            const zipComponent = addressComponents.find(
              component => component.types.includes('postal_code')
            );
            
            if (zipComponent) {
              dispatch(setLocation({ 
                zip: zipComponent.long_name,
                latitude,
                longitude
              }));
              toast.success(`✅ Location set: ${zipComponent.long_name}`);
            } else {
              toast.warning('⚠️ Could not determine ZIP code from location');
            }
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          toast.error('❌ Failed to get location details');
        }
        
        setRequestingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        let errorMessage = '❌ Failed to access location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '❌ Location access denied. Please enable in browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '❌ Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = '❌ Location request timed out';
            break;
        }
        
        toast.error(errorMessage);
        setRequestingLocation(false);
      }
    );
  };

  // Generate AI-powered checklist
  const handleGenerateChecklist = async () => {
    setGeneratingChecklist(true)
    setChecklistError(null)

    try {
      // For now, generate a custom checklist without user profile
      // You can later integrate with actual user data
      const response = await apiService.generateCustomChecklist({
        household_composition: {
          kids: 0,
          elderly: 0,
          pets: []
        },
        current_supplies: {},
        medical_needs: {},
        language: 'en'
      })

      if (response.success && response.checklist) {
        // Store the full response for the modal
        setChecklistData(response)
        
        // Parse the AI-generated checklist text into an array
        const checklistItems = response.checklist
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(item => item.length > 0 && !item.startsWith('#'))

        // Update Redux store with AI-generated checklist
        dispatch(setChecklist(checklistItems.length > 0 ? checklistItems : seedChecklist))
        dispatch(calculateScore())

        // Show the modal with the checklist
        setShowChecklistModal(true)

        console.log('AI Checklist generated:', {
          model: response.modelUsed,
          itemCount: checklistItems.length
        })
      } else {
        throw new Error('Failed to generate checklist')
      }
    } catch (error) {
      console.error('Error generating AI checklist:', error)
      setChecklistError('Could not generate AI checklist. Using default.')
      
      // Fallback to seed checklist
      dispatch(setChecklist(seedChecklist))
      dispatch(calculateScore())
    } finally {
      setGeneratingChecklist(false)
    }
  }

  function handleWizardComplete(data) {
    console.log('Plan data:', data)
    dispatch(setChecklist(seedChecklist))
    dispatch(calculateScore())
    setShowWizard(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      
      {!showWizard ? (
        <>
          <HeroSection onStartWizard={() => setShowWizard(true)} />
          
          <main className="max-w-7xl mx-auto px-6 py-16">
            {/* Error Banner for Checklist Generation */}
            {checklistError && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium">AI Service Unavailable</p>
                  <p className="text-sm">{checklistError}</p>
                </div>
                <button 
                  onClick={() => setChecklistError(null)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <FeatureCard
                icon="🗺️"
                title="Smart Evacuation Routes"
                description="Real-time traffic, road closures, and safe routes for hurricanes, floods, wildfires, and other emergencies."
                action={<button onClick={() => navigate('/evacuation')} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline">View Routes →</button>}
              />
              <FeatureCard
                icon="📋"
                title="Custom Preparedness Checklist"
                description="AI-generated supply list for all hazards, tailored to your household size, pets, and medical needs."
                action={
                  <button
                    onClick={handleGenerateChecklist}
                    disabled={generatingChecklist}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generatingChecklist ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        🤖 Generate with AI
                      </>
                    )}
                  </button>
                }
              />
              <FeatureCard
                icon="⚠️"
                title="Multi-Hazard Risk Analysis"
                description="Assess your risk for hurricanes, floods, tornadoes, severe storms, and other regional hazards."
                action={<button className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline">Check Risk →</button>}
              />
              <FeatureCard
                icon="📱"
                title="Emergency Alerts"
                description="Receive critical alerts for all hazard types via SMS, push notifications, and email in your preferred language."
                action={<button onClick={() => navigate('/alerts')} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline">Enable Alerts →</button>}
              />
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700 h-full flex flex-col">
                <ScoreCard score={score} />
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700 h-full flex flex-col">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="text-xl">⚡</span> Quick Start
                </h4>
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  <button 
                    onClick={() => setShowWizard(true)} 
                    className="w-full text-left px-4 py-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span>1. Complete 2-min survey</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button 
                    onClick={handleRequestLocation}
                    disabled={requestingLocation}
                    className="w-full text-left px-4 py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {requestingLocation ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Getting location...
                          </span>
                        ) : (
                          '2. Connect location'
                        )}
                      </span>
                      {!requestingLocation && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
              <div className="flex items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Still have questions?</h3>
                  <p className="text-slate-600 dark:text-slate-400">Can't find what you're looking for? Our AI assistant is here to help with personalized guidance.</p>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-slate-800 dark:text-white">
                    <span className="text-3xl">🤖</span> AI Emergency Assistant
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">Ask questions, get personalized advice, and receive instant answers about emergency preparedness for any hazard.</p>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0"></div>
                      <div className="bg-indigo-500 text-white rounded-2xl rounded-tl-none px-4 py-3 text-sm">
                        Hi! I'm your AI emergency preparedness assistant. What would you like to know?
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask about any emergency..."
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      ) : (
        <div className="py-16 px-6">
          <button
            onClick={() => setShowWizard(false)}
            className="max-w-7xl mx-auto mb-6 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition flex items-center gap-2"
          >
            ← Back to home
          </button>
          <StepWizard onComplete={handleWizardComplete} />
        </div>
      )}
      
      {/* Checklist Modal */}
      <ChecklistModal 
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        checklistData={checklistData}
      />

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  )
}
