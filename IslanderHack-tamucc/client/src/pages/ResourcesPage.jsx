import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResourcesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const resourceCategories = [
    {
      title: '🌀 Hurricane & Evacuation',
      icon: '🌀',
      color: 'from-blue-500 to-cyan-500',
      resources: [
        {
          name: 'Texas Emergency Management',
          description: 'Official state emergency management and disaster response',
          url: 'https://tdem.texas.gov/',
          tags: ['Official', 'State']
        },
        {
          name: 'Texas Hurricane Evacuation Guide',
          description: 'Comprehensive evacuation routes and planning information',
          url: 'https://www.txdot.gov/safety/hurricane-evacuation.html',
          tags: ['Evacuation', 'Routes']
        },
        {
          name: 'TxDOT Hurricane Evacuation Routes',
          description: 'Interactive map of evacuation routes across Texas',
          url: 'https://www.txdot.gov/driver/weather/hurricane-evacuation.html',
          tags: ['Maps', 'Routes']
        },
        {
          name: 'Corpus Christi Emergency Management',
          description: 'Local emergency information and evacuation zones',
          url: 'https://www.cctexas.com/departments/emergency-management',
          tags: ['Local', 'Corpus Christi']
        },
        {
          name: 'National Hurricane Center',
          description: 'Official hurricane forecasts, warnings, and tracking',
          url: 'https://www.nhc.noaa.gov/',
          tags: ['Weather', 'Federal']
        }
      ]
    },
    {
      title: '⚠️ Emergency Alerts & Warnings',
      icon: '⚠️',
      color: 'from-orange-500 to-red-500',
      resources: [
        {
          name: 'Texas Alerts Portal',
          description: 'Sign up for emergency alerts in your area',
          url: 'https://www.dps.texas.gov/emergency-preparedness/texas-alerts',
          tags: ['Alerts', 'Registration']
        },
        {
          name: 'National Weather Service - Corpus Christi',
          description: 'Local weather forecasts, warnings, and radar',
          url: 'https://www.weather.gov/crp/',
          tags: ['Weather', 'Local']
        },
        {
          name: 'FEMA Emergency Alerts',
          description: 'Federal emergency alert information and resources',
          url: 'https://www.fema.gov/emergency-managers/practitioners/integrated-public-alert-warning-system',
          tags: ['Federal', 'FEMA']
        },
        {
          name: 'Nueces County Emergency Management',
          description: 'County-level emergency alerts and information',
          url: 'https://www.nuecesco.com/emergency-services',
          tags: ['County', 'Local']
        }
      ]
    },
    {
      title: '🏠 Shelters & Safe Zones',
      icon: '🏠',
      color: 'from-green-500 to-emerald-500',
      resources: [
        {
          name: 'Texas Shelter Finder',
          description: 'Find emergency shelters across Texas',
          url: 'https://tdem.texas.gov/shelter/',
          tags: ['Shelters', 'State']
        },
        {
          name: 'American Red Cross - South Texas',
          description: 'Red Cross shelter locations and disaster assistance',
          url: 'https://www.redcross.org/local/texas/south-texas.html',
          tags: ['Red Cross', 'Shelters']
        },
        {
          name: 'Corpus Christi Evacuation Zones',
          description: 'Interactive map of evacuation zones and shelters',
          url: 'https://www.cctexas.com/departments/police-department/emergency-operations-center/hurricane-information',
          tags: ['Zones', 'Local']
        }
      ]
    },
    {
      title: '🌊 Flood & Storm Information',
      icon: '🌊',
      color: 'from-blue-600 to-indigo-600',
      resources: [
        {
          name: 'Texas Flood Information',
          description: 'Real-time flood warnings and river levels',
          url: 'https://www.weather.gov/ewx/flood',
          tags: ['Flood', 'Weather']
        },
        {
          name: 'Texas Flood Preparedness',
          description: 'Flood safety tips and emergency planning',
          url: 'https://tdem.texas.gov/flood-information/',
          tags: ['Preparedness', 'Flood']
        },
        {
          name: 'NOAA Storm Prediction Center',
          description: 'Severe weather forecasts and warnings',
          url: 'https://www.spc.noaa.gov/',
          tags: ['Weather', 'Federal']
        }
      ]
    },
    {
      title: '📱 Emergency Services',
      icon: '📱',
      color: 'from-purple-500 to-pink-500',
      resources: [
        {
          name: 'Texas 2-1-1',
          description: 'Free information and referral hotline for health & human services',
          url: 'https://www.211texas.org/',
          tags: ['Hotline', 'Services']
        },
        {
          name: 'FEMA Disaster Assistance',
          description: 'Apply for federal disaster assistance',
          url: 'https://www.disasterassistance.gov/',
          tags: ['FEMA', 'Assistance']
        },
        {
          name: 'Texas Health & Human Services',
          description: 'Emergency healthcare and social services',
          url: 'https://www.hhs.texas.gov/services/safety/disaster-assistance',
          tags: ['Health', 'Services']
        }
      ]
    },
    {
      title: '📚 Preparedness Guides',
      icon: '📚',
      color: 'from-yellow-500 to-orange-500',
      resources: [
        {
          name: 'Ready.gov - Texas',
          description: 'Federal emergency preparedness resources for Texans',
          url: 'https://www.ready.gov/texas',
          tags: ['Preparedness', 'Guide']
        },
        {
          name: 'Texas Hurricane Guide',
          description: 'Comprehensive hurricane preparedness handbook',
          url: 'https://tdem.texas.gov/hurricane-preparedness/',
          tags: ['Hurricane', 'Guide']
        },
        {
          name: 'FEMA Emergency Supply List',
          description: 'Essential supplies for emergency kits',
          url: 'https://www.fema.gov/pdf/library/f&web.pdf',
          tags: ['Supplies', 'Checklist']
        },
        {
          name: 'CDC Emergency Preparedness',
          description: 'Health and safety guidelines for emergencies',
          url: 'https://www.cdc.gov/cpr/preparedness/',
          tags: ['Health', 'Safety']
        }
      ]
    }
  ];

  // Emergency contacts section
  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', description: 'Police, Fire, Medical Emergency' },
    { name: 'Poison Control', number: '1-800-222-1222', description: '24/7 poison emergency hotline' },
    { name: 'Texas 2-1-1', number: '211', description: 'Health & human services information' },
    { name: 'FEMA Helpline', number: '1-800-621-3362', description: 'Federal disaster assistance' },
    { name: 'Red Cross Disaster Helpline', number: '1-800-733-2767', description: 'Disaster relief and support' },
    { name: 'Corpus Christi Police (Non-Emergency)', number: '(361) 886-2600', description: 'Non-emergency police services' },
    { name: 'Nueces County Sheriff', number: '(361) 887-2222', description: 'County law enforcement' },
    { name: 'Texas DPS Emergency', number: '1-800-525-5555', description: 'State police and highway patrol' }
  ];

  const filteredCategories = resourceCategories.map(category => ({
    ...category,
    resources: category.resources.filter(resource =>
      searchQuery === '' ||
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.resources.length > 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50">
      {/* Header Section */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            📚 Emergency Resources
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Essential links and resources for emergency preparedness, evacuation planning, and disaster response in Texas and the Gulf Coast region.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources, guides, or emergency services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-xl text-slate-900 placeholder-slate-400 shadow-lg focus:ring-4 focus:ring-white/30 outline-none"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map((category, idx) => (
              <div key={idx} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${category.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {category.title}
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.resources.map((resource, resourceIdx) => (
                    <a
                      key={resourceIdx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group glass p-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {resource.name}
                        </h3>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-4">
                        {resource.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No resources found</h3>
            <p className="text-slate-600">Try adjusting your search query</p>
          </div>
        )}

        {/* Emergency Contacts Section */}
        <div className="mt-16 glass p-8 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
              📞
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Emergency Contacts
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-1">
                  📞
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 mb-1">{contact.name}</h3>
                  <a
                    href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                    className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors mb-1 block"
                  >
                    {contact.number}
                  </a>
                  <p className="text-sm text-slate-600">{contact.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h4 className="font-bold text-red-900 mb-1">Life-Threatening Emergency?</h4>
                <p className="text-sm text-red-800">
                  Call <strong>911</strong> immediately for police, fire, or medical emergencies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
