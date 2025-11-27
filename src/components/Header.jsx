// Componente Header principale con ricerca e azioni
import React, { useState } from 'react';
import { 
  TramFront, 
  Search, 
  Menu, 
  AlertTriangle,
  X
} from 'lucide-react';
import useStore from '../store/useStore';

const Header = ({ hasAlerts }) => {
  const { toggleSidebar } = useStore();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95), rgba(10, 10, 15, 0.85))',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
      }}
    >
      {/* Header normale */}
      {!showSearch && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu className="text-white" size={24} />
              </button>
              <div className="flex items-center gap-2">
                <TramFront className="text-milano-yellow" size={28} />
                <h1 className="text-2xl font-black text-white tracking-tight">
                  GHE <span className="text-milano-yellow">SEM</span>
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {hasAlerts && (
                <div className="relative">
                  <AlertTriangle className="text-milano-red animate-pulse" size={20} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-milano-red rounded-full animate-ping" />
                </div>
              )}
              
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Search className="text-white" size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cerca linea, fermata..."
                autoFocus
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-milano-yellow transition-colors"
              />
            </div>
            <button
              onClick={() => setShowSearch(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="text-white" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
