// Vehicle Tracker - Segui un veicolo sulla mappa
import React, { useEffect } from 'react';
import { X, MapPin, Clock, Navigation2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import useStore from '../store/useStore';
import { Polyline } from 'react-leaflet';

const VehicleTracker = () => {
  const {
    trackedVehicle,
    vehicleRoute,
    upcomingStops,
    stopTrackingVehicle,
  } = useStore();

  if (!trackedVehicle) return null;

  return (
    <>
      {/* Route Polyline on map */}
      {vehicleRoute && vehicleRoute.points && (
        <Polyline
          positions={vehicleRoute.points.map(p => [p.lat, p.lon])}
          pathOptions={{
            color: trackedVehicle.lineColor,
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
          }}
        />
      )}

      {/* Tracking Panel */}
      <div className="fixed bottom-72 left-4 right-4 z-[1002] max-w-md mx-auto">
        <div
          className="rounded-2xl p-4 shadow-2xl backdrop-blur-md border-2 animate-in slide-in-from-bottom duration-300"
          style={{
            background: `linear-gradient(135deg, ${trackedVehicle.lineColor}dd, ${trackedVehicle.lineColor}99)`,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-3 py-1 rounded-lg text-white font-bold text-lg"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                  {trackedVehicle.lineName}
                </span>
                <span className="text-white text-sm opacity-90">
                  {trackedVehicle.lineType}
                </span>
              </div>
              <p className="text-white font-semibold">
                → {trackedVehicle.destination}
              </p>
            </div>
            <button
              onClick={stopTrackingVehicle}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="text-white" size={20} />
            </button>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <VehicleStat
              icon={Navigation2}
              value={`${trackedVehicle.speed} km/h`}
              label="Velocità"
            />
            <VehicleStat
              icon={Users}
              value={getOccupancyIcon(trackedVehicle.occupancy)}
              label="Affollamento"
            />
            <VehicleStat
              icon={Clock}
              value="Live"
              label="Aggiornato"
            />
          </div>

          {/* Upcoming Stops */}
          {upcomingStops && upcomingStops.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm opacity-90">
                Prossime fermate
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {upcomingStops.map((stop, idx) => (
                  <UpcomingStopRow key={idx} stop={stop} isNext={idx === 0} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Vehicle Stat
const VehicleStat = ({ icon: Icon, value, label }) => {
  return (
    <div className="flex flex-col items-center text-center bg-white/10 rounded-lg p-2">
      <Icon size={16} className="text-white mb-1" />
      <span className="text-white text-xs font-bold">{value}</span>
      <span className="text-white/70 text-xs">{label}</span>
    </div>
  );
};

// Upcoming Stop Row
const UpcomingStopRow = ({ stop, isNext }) => {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg ${
        isNext ? 'bg-white/20' : 'bg-white/10'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <MapPin size={14} className={`text-white flex-shrink-0 ${isNext ? 'animate-pulse' : ''}`} />
        <span className={`text-white text-sm truncate ${isNext ? 'font-bold' : ''}`}>
          {stop.name}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-white text-xs">
          {formatDistanceToNow(stop.eta, { addSuffix: true, locale: it })}
        </span>
        <span className="text-white/70 text-xs">
          {stop.distance}m
        </span>
      </div>
    </div>
  );
};

// Utility
const getOccupancyIcon = (occupancy) => {
  const icons = {
    EMPTY: '🟢',
    MANY_SEATS: '🟢',
    FEW_SEATS: '🟡',
    STANDING: '🟠',
    FULL: '🔴',
  };
  return icons[occupancy] || '⚪';
};

export default VehicleTracker;
