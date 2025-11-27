// Componente BottomSheet con fermate vicine e arrivi real-time
import React, { useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  ChevronUp,
  Footprints,
  Star,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import useStore from '../store/useStore';

const BottomSheet = () => {
  const {
    nearbyStops,
    isBottomSheetExpanded,
    toggleBottomSheet,
    setSelectedStop,
    selectedStop,
    refreshStopArrivals,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
  } = useStore();

  const handleStopClick = (stop) => {
    setSelectedStop(selectedStop?.id === stop.id ? null : stop);
  };

  const handleRefresh = (e, stopId) => {
    e.stopPropagation();
    refreshStopArrivals(stopId);
  };

  const handleToggleFavorite = (e, stop) => {
    e.stopPropagation();
    if (isFavorite(stop.id)) {
      removeFavorite(stop.id);
    } else {
      addFavorite({ id: stop.id, type: 'stop', name: stop.name, ...stop });
    }
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        isBottomSheetExpanded ? 'h-[70vh]' : 'h-64'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98))',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 215, 0, 0.2)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
      }}
    >
      <div className="h-full flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={toggleBottomSheet}
            className="w-12 h-1.5 bg-gray-500 rounded-full hover:bg-milano-yellow transition-colors"
          />
        </div>

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <MapPin className="text-milano-yellow" size={24} />
            <div>
              <h2 className="text-lg font-bold text-white">Fermate Vicine</h2>
              <p className="text-xs text-gray-400">
                {nearbyStops.length} {nearbyStops.length === 1 ? 'fermata' : 'fermate'} nelle vicinanze
              </p>
            </div>
          </div>
          <ChevronUp 
            className={`text-gray-400 transition-transform ${isBottomSheetExpanded ? 'rotate-180' : ''}`} 
            size={20} 
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isLoading && nearbyStops.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="animate-spin text-milano-yellow" size={32} />
            </div>
          ) : nearbyStops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle size={48} className="mb-3" />
              <p>Nessuna fermata nelle vicinanze</p>
            </div>
          ) : (
            nearbyStops.map(stop => (
              <StopCard
                key={stop.id}
                stop={stop}
                isExpanded={selectedStop?.id === stop.id}
                onClick={() => handleStopClick(stop)}
                onRefresh={(e) => handleRefresh(e, stop.id)}
                onToggleFavorite={(e) => handleToggleFavorite(e, stop)}
                isFavorite={isFavorite(stop.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Card singola fermata
const StopCard = ({ stop, isExpanded, onClick, onRefresh, onToggleFavorite, isFavorite }) => {
  return (
    <div 
      onClick={onClick}
      className="rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
      style={{
        background: isExpanded 
          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        border: isExpanded 
          ? '1px solid rgba(255, 215, 0, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header fermata */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-base mb-1">{stop.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Footprints size={12} />
              <span>{stop.distance.toFixed(2)} km</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={16} className="text-gray-400" />
            </button>
            <button
              onClick={onToggleFavorite}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Star 
                size={16} 
                className={isFavorite ? 'text-milano-yellow fill-milano-yellow' : 'text-gray-400'} 
              />
            </button>
          </div>
        </div>

        {/* Prime 3 linee preview */}
        {!isExpanded && stop.arrivals && stop.arrivals.length > 0 && (
          <div className="space-y-1">
            {stop.arrivals.slice(0, 3).map((arrival, idx) => (
              <ArrivalRow key={idx} arrival={arrival} compact />
            ))}
          </div>
        )}
      </div>

      {/* Arrivi espansi */}
      {isExpanded && stop.arrivals && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-3 mt-2">
          {stop.arrivals.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Nessun arrivo previsto
            </p>
          ) : (
            stop.arrivals.map((arrival, idx) => (
              <ArrivalRow key={idx} arrival={arrival} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Riga singolo arrivo
const ArrivalRow = ({ arrival, compact = false }) => {
  const getLineTypeIcon = (type) => {
    switch (type) {
      case 'metro': return 'M';
      case 'tram': return 'T';
      case 'bus': return 'B';
      default: return 'L';
    }
  };

  return (
    <div className={`flex items-center justify-between ${compact ? 'text-sm' : 'text-base'}`}>
      <div className="flex items-center gap-2 flex-1">
        {/* Badge linea */}
        <span 
          className={`${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} rounded-md font-bold text-white shadow-sm`}
          style={{ backgroundColor: arrival.lineColor }}
        >
          {arrival.lineName}
        </span>
        
        {/* Destinazione */}
        <span className={`text-gray-300 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
          → {arrival.destination}
        </span>
      </div>

      {/* Tempo arrivo */}
      <div className="flex items-center gap-2">
        {arrival.realtime && (
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
        <span className={`font-bold ${arrival.minutesAway <= 2 ? 'text-milano-red' : 'text-milano-yellow'} ${compact ? 'text-sm' : 'text-base'}`}>
          {arrival.minutesAway < 1 ? 'Arr' : `${arrival.minutesAway}'`}
        </span>
      </div>
    </div>
  );
};

export default BottomSheet;
