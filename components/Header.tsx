
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../theme';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.includes('step') || location.pathname.includes('analysis');
    }
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ borderBottom: `2px solid ${colors.primary.orange}` }}>
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <h1 className="text-2xl font-black tracking-tight" style={{ color: colors.secondary.steelBlue }}>FixIt</h1>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: colors.secondary.steelBlue }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.primary.orange}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.secondary.steelBlue}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsMenuOpen(false)}
          style={{ top: '57px' }}
        />
      )}

      {/* Sidebar Menu */}
      <div 
        className="fixed top-0 right-0 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300 z-40"
        style={{ 
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          marginTop: '57px',
        }}
      >
        <div className="pt-6 px-6 space-y-4">
          <button 
            onClick={() => handleNavigation('/')}
            className="w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-sm"
            style={{
              color: isActive('/') ? colors.primary.orange : colors.secondary.steelBlue,
              backgroundColor: isActive('/') ? colors.background.orangeLight15 : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive('/')) {
                e.currentTarget.style.backgroundColor = colors.background.orangeLight8;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/')) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span>New Repair</span>
            </div>
          </button>

          <button 
            onClick={() => handleNavigation('/feed')}
            className="w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-sm"
            style={{
              color: isActive('/feed') ? colors.primary.orange : colors.secondary.steelBlue,
              backgroundColor: isActive('/feed') ? colors.background.orangeLight15 : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive('/feed')) {
                e.currentTarget.style.backgroundColor = colors.background.orangeLight8;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/feed')) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Community</span>
            </div>
          </button>

          <div className="border-t border-slate-200 pt-4 mt-4">
            <button 
              className="w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-sm"
              style={{
                color: colors.secondary.steelBlue,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.orangeLight8;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
