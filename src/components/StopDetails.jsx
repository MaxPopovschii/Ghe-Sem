import { useEffect, useState } from 'react';
import { X, Bus, Train, TramFront, MapPin, Clock, AlertCircle, Navigation } from 'lucide-react';
import useStore from '../store/useStore';
import transportAPI from '../services/transportAPI';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const StopDetails = () => {
  const { selectedStop, setSelectedStop } = useStore();
  const [arrivals, setArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedStop) {
      loadArrivals();
      // Refresh ogni 30 secondi
      const interval = setInterval(loadArrivals, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedStop]);

  const loadArrivals = async () => {
    if (!selectedStop) return;
    
    setIsLoading(true);
    try {
      const data = await transportAPI.getStopArrivals(selectedStop.id);
      setArrivals(data);
    } catch (error) {
      console.error('Error loading arrivals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'metro':
        return <Train className="w-4 h-4" />;
      case 'tram':
        return <TramFront className="w-4 h-4" />;
      case 'bus':
        return <Bus className="w-4 h-4" />;
      default:
        return <Bus className="w-4 h-4" />;
    }
  };

  const getDelayColor = (delay) => {
    if (delay <= 0) return 'text-green-400';
    if (delay <= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!selectedStop) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-cyber-dark/95 backdrop-blur-lg border-l border-milano-yellow/20 z-[1001] animate-slide-in-from-right overflow-hidden flex flex-col">
      {/* Header */}
      <div className="glass-panel-strong p-4 border-b border-milano-yellow/20">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-milano-yellow/10 rounded-lg">
              <MapPin className="w-5 h-5 text-milano-yellow" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white mb-1">{selectedStop.name}</h2>
              <div className="flex flex-wrap gap-1">
                {selectedStop.lines?.map((lineId) => (
                  <span
                    key={lineId}
                    className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyber-slate text-white border border-milano-yellow/30"
                  >
                    {lineId}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedStop(null)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {selectedStop.distance && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
            <Navigation className="w-4 h-4" />
            <span>{selectedStop.distance.toFixed(2)} km da te</span>
          </div>
        )}
      </div>

      {/* Arrivals List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading && arrivals.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-20 rounded-lg"></div>
            ))}
          </div>
        ) : arrivals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <Clock className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-center">Nessun arrivo previsto al momento</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {arrivals.map((arrival, idx) => (
              <div
                key={`${arrival.lineId}-${arrival.vehicleId}-${idx}`}
                className="glass-panel p-4 hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  {/* Line Badge */}
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg font-bold text-sm shadow-lg"
                    style={{
                      backgroundColor: arrival.lineColor + '20',
                      borderColor: arrival.lineColor,
                      borderWidth: '2px',
                      color: arrival.lineColor,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      {getVehicleIcon(arrival.lineType)}
                      <span className="text-xs mt-0.5">{arrival.lineName}</span>
                    </div>
                  </div>

                  {/* Arrival Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {arrival.destination}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {arrival.scheduledTime.toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {arrival.realtime && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                              LIVE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time to arrival */}
                      <div className="text-right ml-3">
                        <div className="text-2xl font-bold text-milano-yellow">
                          {arrival.minutesAway}'
                        </div>
                        {arrival.delay !== 0 && (
                          <div className={`text-xs ${getDelayColor(arrival.delay)}`}>
                            {arrival.delay > 0 ? '+' : ''}{arrival.delay}'
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vehicle ID (subtle) */}
                    {arrival.vehicleId && (
                      <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Veicolo: {arrival.vehicleId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delay Warning */}
                {arrival.delay > 3 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 rounded-lg p-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>Ritardo significativo</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="glass-panel-strong p-3 border-t border-milano-yellow/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Aggiornato {formatDistanceToNow(new Date(), { addSuffix: true, locale: it })}</span>
          </div>
          <button
            onClick={loadArrivals}
            disabled={isLoading}
            className="px-3 py-1.5 bg-milano-yellow/10 hover:bg-milano-yellow/20 text-milano-yellow rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Aggiornamento...' : 'Aggiorna'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StopDetails;
