// Toast per mostrare info veicolo selezionato
import React, { useEffect } from 'react';
import { Bus, TramFront, X } from 'lucide-react';
import useStore from '../store/useStore';

const VehicleToast = () => {
  const { selectedVehicle, setSelectedVehicle } = useStore();

  useEffect(() => {
    if (selectedVehicle) {
      const timer = setTimeout(() => {
        setSelectedVehicle(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedVehicle, setSelectedVehicle]);

  if (!selectedVehicle) return null;

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'tram':
        return <TramFront size={24} />;
      case 'bus':
        return <Bus size={24} />;
      default:
        return <Bus size={24} />;
    }
  };

  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[1002] max-w-sm animate-in slide-in-from-top duration-300"
    >
      <div
        className="px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border-2"
        style={{
          background: `linear-gradient(135deg, ${selectedVehicle.lineColor}dd, ${selectedVehicle.lineColor}99)`,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 text-white">
            {getVehicleIcon(selectedVehicle.lineType)}
          </div>
          
          <div className="flex-1 text-white">
            <p className="font-bold text-lg mb-0.5">
              Linea {selectedVehicle.lineName}
            </p>
            <p className="text-sm opacity-90">
              → {selectedVehicle.destination}
            </p>
            <p className="text-xs opacity-75 mt-1">
              {selectedVehicle.speed} km/h • {getOccupancyLabel(selectedVehicle.occupancy)}
            </p>
          </div>

          <button
            onClick={() => setSelectedVehicle(null)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="text-white" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const getOccupancyLabel = (occupancy) => {
  const labels = {
    EMPTY: '🟢 Vuoto',
    MANY_SEATS: '🟢 Posti liberi',
    FEW_SEATS: '🟡 Pochi posti',
    STANDING: '🟠 In piedi',
    FULL: '🔴 Pieno',
  };
  return labels[occupancy] || '';
};

export default VehicleToast;
