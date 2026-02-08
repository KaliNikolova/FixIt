
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-2 flex items-center justify-between">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">FixIt</h1>
      </div>

      <nav className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            location.pathname === '/' || location.pathname.includes('step') || location.pathname.includes('analysis')
              ? 'bg-blue-50 text-blue-600' 
              : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          New Repair
        </button>
        <button 
          onClick={() => navigate('/feed')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            location.pathname === '/feed'
              ? 'bg-blue-50 text-blue-600' 
              : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          Community
        </button>
      </nav>
    </header>
  );
};

export default Header;
