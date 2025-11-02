import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import AuthModal from './AuthModal';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-4 hover:opacity-90 transition-all duration-300 group">
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="bAI Watch Logo" 
                className="w-12 h-12 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center font-black text-white text-lg shadow-sm group-hover:shadow-md transition-all">
                🤖
              </div>
            )}
            <div className="text-left">
              <h1 className="text-xl font-black text-slate-800">bAI Watch</h1>
              <div className="text-xs text-slate-600 font-medium">Smarter monitoring. Safer community</div>
            </div>
          </button>
          
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/resources')}
              className="hidden sm:block text-sm text-slate-700 hover:text-blue-500 font-medium transition-colors"
            >
              Browse Resources
            </button>
            <div className="w-px h-6 bg-slate-300/50 hidden sm:block"></div>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm px-4 py-2 bg-white text-slate-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline">{user.displayName || user.email?.split('@')[0]}</span>
                  <svg className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-slate-200">
                    <div className="px-4 py-2 border-b border-slate-200">
                      <div className="text-sm font-semibold text-slate-900">
                        {user.displayName || 'User'}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {user.email}
                      </div>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition rounded">
                      Profile
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/alerts');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition rounded"
                    >
                      🔔 Alert Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition rounded">
                      Settings
                    </button>
                    <div className="border-t border-slate-200 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition rounded"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
