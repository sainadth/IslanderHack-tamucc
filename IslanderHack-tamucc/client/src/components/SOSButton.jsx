import { toast } from 'react-toastify'

export default function SOSButton() {
  const handleSOSClick = () => {
    // Open the SOS Call System server in a new window sized like a phone
    const phoneWidth = 390  // iPhone width
    const phoneHeight = 844 // iPhone height
    const left = (screen.width - phoneWidth) / 2
    const top = (screen.height - phoneHeight) / 2
    
    window.open(
      'http://localhost:3000',
      '_blank',
      `width=${phoneWidth},height=${phoneHeight},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no,location=no`
    )
    toast.info('🚨 Opening Emergency SOS Portal...', { autoClose: 2000 })
  }

  return (
    <button
      onClick={handleSOSClick}
      className="fixed top-1/2 -translate-y-1/2 right-6 z-50 group animate-pulse"
      title="Emergency SOS - Click to open SOS Call System"
      aria-label="Emergency SOS Button"
    >
      <div className="relative">
        {/* Pulsing rings for attention */}
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
        <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse"></span>
        
        {/* Main button */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-3 border-2 border-red-400">
          {/* SOS Icon */}
          <span className="text-2xl">🚨</span>
          
          {/* Text */}
          <span className="text-lg font-black tracking-wide">SOS</span>
          
          {/* Active indicator */}
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          
          {/* Phone icon SVG */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
          </svg>
        </div>
      </div>
    </button>
  )
}
