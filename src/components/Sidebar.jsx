// Sidebar stile Yandex Transport con tabs multiple
import React from 'react';
import { 
  X, 
  Route, 
  ListFilter, 
  Heart, 
  Settings,
  MapPin,
  Navigation2,
  Clock,
  Star,
  Trash2,
  Bell,
  Filter,
  Calendar
} from 'lucide-react';
import useStore from '../store/useStore';
import RoutePlanner from './RoutePlanner';
import LinesView from './LinesView';
import FavoritesView from './FavoritesView';
import TripPlanner from './TripPlanner';

const Sidebar = () => {
  const { 
    isSidebarOpen, 
    setSidebarOpen, 
    activeSidebarTab, 
    setActiveSidebarTab 
  } = useStore();

  if (!isSidebarOpen) return null;

  const tabs = [
    { id: 'routes', label: 'Percorsi', icon: Route },
    { id: 'planned', label: 'Programmati', icon: Calendar },
    { id: 'lines', label: 'Linee', icon: ListFilter },
    { id: 'favorites', label: 'Preferiti', icon: Heart },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[1100] animate-in fade-in duration-200"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-full max-w-md z-[1101] animate-in slide-in-from-left duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98))',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Ghe Sem</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-white/5">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeSidebarTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSidebarTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-milano-yellow text-black' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeSidebarTab === 'routes' && <RoutePlanner />}
            {activeSidebarTab === 'planned' && <TripPlanner />}
            {activeSidebarTab === 'lines' && <LinesView />}
            {activeSidebarTab === 'favorites' && <FavoritesView />}
            {activeSidebarTab === 'settings' && <SettingsView />}
          </div>
        </div>
      </div>
    </>
  );
};

// Settings View
const SettingsView = () => {
  const { 
    filters, 
    setFilters,
    requestNotificationPermission,
    notifications 
  } = useStore();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      await requestNotificationPermission();
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Sorgente Dati API */}
      <div>
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Settings size={20} className="text-milano-yellow" />
          Sorgente Dati
        </h3>
        
        <div className="glass-panel p-3 space-y-3">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎭</span>
              <div>
                <p className="text-white font-medium">Modalità Attuale: Mock Data</p>
                <p className="text-xs text-gray-400">Simulazione realistica per demo</p>
              </div>
            </div>
          </div>
          
          <div className="text-xs space-y-2">
            <div className="p-2 bg-milano-yellow/10 border border-milano-yellow/30 rounded-lg">
              <p className="text-milano-yellow font-medium mb-1">💡 Vuoi usare dati reali?</p>
              <p className="text-gray-300 mb-2">
                L'app supporta API Open Data Milano (gratis) o ATM Developer API
              </p>
              <a 
                href="https://github.com/MaxPopovschii/Ghe-Sem/blob/main/REAL_API_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1.5 bg-milano-yellow text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                📖 Leggi la Guida
              </a>
            </div>
            
            <details className="bg-cyber-slate/50 rounded-lg">
              <summary className="p-2 cursor-pointer text-white hover:bg-white/5 rounded-lg">
                ⚡ Quick Start (API Reali)
              </summary>
              <div className="p-3 text-xs text-gray-300 space-y-2">
                <p className="font-medium text-white">Opzione 1: Open Data Milano (Gratuita)</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Apri <code className="bg-black/30 px-1 py-0.5 rounded">src/services/transportAPI.js</code></li>
                  <li>Cambia <code className="bg-black/30 px-1 py-0.5 rounded">USE_MOCK_DATA: false</code></li>
                  <li>Riavvia <code className="bg-black/30 px-1 py-0.5 rounded">npm run dev</code></li>
                </ol>
                
                <p className="font-medium text-white mt-3">Opzione 2: ATM API (Con Key)</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Registrati su <a href="https://developer.atm.it" target="_blank" rel="noopener noreferrer" className="text-milano-yellow hover:underline">developer.atm.it</a></li>
                  <li>Ottieni API Key GTFS Realtime</li>
                  <li>Crea file <code className="bg-black/30 px-1 py-0.5 rounded">.env</code> con la key</li>
                  <li>Cambia <code className="bg-black/30 px-1 py-0.5 rounded">USE_MOCK_DATA: false</code></li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      </div>
      
      {/* Filtri Mappa */}
      <div>
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Filter size={20} className="text-milano-yellow" />
          Filtri Mappa
        </h3>
        
        <div className="space-y-2">
          <ToggleOption
            label="Mostra Metro"
            checked={filters.showMetro}
            onChange={(checked) => setFilters({ showMetro: checked })}
            color="#E30613"
          />
          <ToggleOption
            label="Mostra Tram"
            checked={filters.showTram}
            onChange={(checked) => setFilters({ showTram: checked })}
            color="#FFD700"
          />
          <ToggleOption
            label="Mostra Bus"
            checked={filters.showBus}
            onChange={(checked) => setFilters({ showBus: checked })}
            color="#007ACC"
          />
        </div>
      </div>

      {/* Notifiche */}
      <div>
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Bell size={20} className="text-milano-yellow" />
          Notifiche
        </h3>
        
        <ToggleOption
          label="Abilita notifiche browser"
          checked={notificationsEnabled}
          onChange={handleToggleNotifications}
        />
        
        {notifications.length > 0 && (
          <div className="mt-3 text-xs text-gray-400">
            {notifications.length} notifiche attive
          </div>
        )}
      </div>

      {/* Info App */}
      <div className="pt-6 border-t border-white/10">
        <div className="text-center text-gray-400 text-sm space-y-1">
          <p className="font-semibold text-white">Ghe Sem v2.0</p>
          <p>Trasporto pubblico Milano</p>
          <p className="text-xs">Made with ❤️ for Milano</p>
        </div>
      </div>
    </div>
  );
};

// Toggle Option Component
const ToggleOption = ({ label, checked, onChange, color }) => {
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      <span className="text-white text-sm">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-milano-yellow' : 'bg-gray-600'
        }`}
        style={checked && color ? { backgroundColor: color } : {}}
      >
        <div 
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );
};

export default Sidebar;
