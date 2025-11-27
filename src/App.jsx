// App principale - Versione professionale con tutte le features Yandex Transport
import React, { useEffect } from 'react';
import useStore from './store/useStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import BottomSheet from './components/BottomSheet';
import ServiceAlerts from './components/ServiceAlerts';
import VehicleToast from './components/VehicleToast';
import StopDetails from './components/StopDetails';
import 'leaflet/dist/leaflet.css';

function App() {
  const { loadServiceAlerts, serviceAlerts } = useStore();

  useEffect(() => {
    // Carica alert al mount
    loadServiceAlerts();
    
    // Aggiorna alert ogni 5 minuti
    const interval = setInterval(() => {
      loadServiceAlerts();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [loadServiceAlerts]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-cyber-dark">
      {/* Header */}
      <Header hasAlerts={serviceAlerts.length > 0} />

      {/* Sidebar */}
      <Sidebar />

      {/* Service Alerts */}
      <ServiceAlerts />

      {/* Vehicle Toast */}
      <VehicleToast />

      {/* Stop Details Panel */}
      <StopDetails />

      {/* Mappa principale */}
      <MapView />

      {/* Bottom Sheet con fermate */}
      <BottomSheet />
    </div>
  );
}

export default App;
