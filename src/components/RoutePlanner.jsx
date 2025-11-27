// Route Planner - Calcola percorsi da A a B
import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ArrowRight, 
  Clock,
  Footprints,
  TramFront,
  Bus,
  RefreshCw,
  ArrowLeftRight,
  Zap,
  Leaf,
  Euro
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import useStore from '../store/useStore';

const RoutePlanner = () => {
  const {
    routeOrigin,
    routeDestination,
    routes,
    selectedRoute,
    isCalculatingRoute,
    setRouteOrigin,
    setRouteDestination,
    calculateRoute,
    setSelectedRoute,
    clearRoute,
    swapRoutePoints,
    userLocation,
  } = useStore();

  const [mode, setMode] = useState('balanced');
  const [departureType, setDepartureType] = useState('now'); // 'now', 'depart', 'arrive'
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  const handleUseMyLocation = () => {
    if (userLocation) {
      setRouteOrigin({
        name: 'La mia posizione',
        lat: userLocation.lat,
        lon: userLocation.lon,
      });
    }
  };

  const handleCalculate = () => {
    calculateRoute(mode);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Input Origine/Destinazione */}
      <div className="space-y-3">
        {/* Origine */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-green-400" size={20} />
          <input
            type="text"
            placeholder="Da dove parti?"
            value={routeOrigin?.name || ''}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-milano-yellow transition-colors"
            readOnly
          />
          {!routeOrigin && (
            <button
              onClick={handleUseMyLocation}
              className="absolute right-3 top-3 text-milano-yellow text-xs hover:underline"
            >
              Usa posizione
            </button>
          )}
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            onClick={swapRoutePoints}
            disabled={!routeOrigin || !routeDestination}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <ArrowLeftRight className="text-white" size={20} />
          </button>
        </div>

        {/* Destinazione */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-milano-red" size={20} />
          <input
            type="text"
            placeholder="Dove vuoi andare?"
            value={routeDestination?.name || ''}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-milano-yellow transition-colors"
            readOnly
          />
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-2">
        <ModeButton
          icon={Zap}
          label="Veloce"
          active={mode === 'fastest'}
          onClick={() => setMode('fastest')}
        />
        <ModeButton
          icon={RefreshCw}
          label="Bilanciato"
          active={mode === 'balanced'}
          onClick={() => setMode('balanced')}
        />
        <ModeButton
          icon={ArrowRight}
          label="Diretto"
          active={mode === 'least_transfers'}
          onClick={() => setMode('least_transfers')}
        />
      </div>

      {/* Departure Time Selection (Yandex-style) */}
      <div className="glass-panel p-3 space-y-2">
        <div className="flex items-center gap-2 text-white text-sm font-medium mb-2">
          <Clock size={16} className="text-milano-yellow" />
          <span>Quando vuoi partire?</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setDepartureType('now');
              setShowDateTimePicker(false);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              departureType === 'now'
                ? 'bg-milano-yellow text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Adesso
          </button>
          
          <button
            onClick={() => {
              setDepartureType('depart');
              setShowDateTimePicker(true);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              departureType === 'depart'
                ? 'bg-milano-yellow text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Partenza
          </button>
          
          <button
            onClick={() => {
              setDepartureType('arrive');
              setShowDateTimePicker(true);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              departureType === 'arrive'
                ? 'bg-milano-yellow text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Arrivo
          </button>
        </div>

        {/* DateTime Picker */}
        {showDateTimePicker && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Data</label>
                <input
                  type="date"
                  value={selectedDateTime.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(selectedDateTime);
                    const inputDate = new Date(e.target.value);
                    newDate.setFullYear(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
                    setSelectedDateTime(newDate);
                  }}
                  className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-milano-yellow"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Ora</label>
                <input
                  type="time"
                  value={selectedDateTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(selectedDateTime);
                    newDate.setHours(parseInt(hours), parseInt(minutes));
                    setSelectedDateTime(newDate);
                  }}
                  className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-milano-yellow"
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-400">
              {departureType === 'depart' ? '🚀 Partenza:' : '🎯 Arrivo:'} {selectedDateTime.toLocaleString('it-IT', { 
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={!routeOrigin || !routeDestination || isCalculatingRoute}
        className="w-full py-3 rounded-xl bg-milano-yellow text-black font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isCalculatingRoute ? (
          <>
            <RefreshCw className="animate-spin" size={20} />
            Calcolo...
          </>
        ) : (
          <>
            <Navigation size={20} />
            Trova Percorso
          </>
        )}
      </button>

      {/* Routes Results */}
      {routes.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">
              {routes.length} {routes.length === 1 ? 'percorso trovato' : 'percorsi trovati'}
            </h3>
            <button
              onClick={clearRoute}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancella
            </button>
          </div>

          {routes.map((route, idx) => (
            <RouteCard
              key={route.id}
              route={route}
              isSelected={selectedRoute?.id === route.id}
              onClick={() => setSelectedRoute(route)}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Mode Button
const ModeButton = ({ icon: Icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-all ${
        active 
          ? 'bg-milano-yellow text-black' 
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

// Route Card
const RouteCard = ({ route, isSelected, onClick, index }) => {
  const getTypeLabel = (type) => {
    const labels = {
      fastest: '⚡ Più veloce',
      least_transfers: '🎯 Meno cambi',
      balanced: '⚖️ Bilanciato',
    };
    return labels[type] || 'Percorso';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-milano-yellow/20 to-milano-yellow/10 border-2 border-milano-yellow'
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-bold ${isSelected ? 'text-milano-yellow' : 'text-gray-400'}`}>
          {getTypeLabel(route.type)}
        </span>
        <span className="text-white text-lg font-bold">
          {route.duration} min
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat icon={RefreshCw} value={route.transfers} label="cambi" />
        <Stat icon={Footprints} value={`${route.walkingDistance}m`} label="a piedi" />
        <Stat icon={Euro} value={`€${route.price.toFixed(2)}`} label="" />
      </div>

      {/* Steps Preview */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {route.steps.map((step, idx) => (
          <StepIcon key={idx} step={step} />
        ))}
      </div>

      {/* Environmental Info */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
        <span className="flex items-center gap-1">
          <Leaf size={12} className="text-green-400" />
          {route.emissions}g CO₂
        </span>
        <span className="flex items-center gap-1">
          🔥 {route.calories} kcal
        </span>
      </div>

      {/* Expanded Details */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          {route.steps.map((step, idx) => (
            <StepDetail key={idx} step={step} />
          ))}
        </div>
      )}
    </div>
  );
};

// Stat Component
const Stat = ({ icon: Icon, value, label }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon size={14} className="text-gray-400 mb-1" />
      <span className="text-white text-sm font-semibold">{value}</span>
      {label && <span className="text-xs text-gray-400">{label}</span>}
    </div>
  );
};

// Step Icon
const StepIcon = ({ step }) => {
  if (step.type === 'walk') {
    return (
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
        <Footprints size={12} className="text-white" />
      </div>
    );
  }

  const color = step.lineColor || '#666';
  
  return (
    <div
      className="flex-shrink-0 px-2 py-1 rounded text-white text-xs font-bold"
      style={{ backgroundColor: color }}
    >
      {step.line}
    </div>
  );
};

// Step Detail
const StepDetail = ({ step }) => {
  if (step.type === 'walk') {
    return (
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <Footprints size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm">{step.instructions}</p>
          <p className="text-xs text-gray-400 mt-1">
            {step.distance}m • {step.duration} min a piedi
          </p>
        </div>
      </div>
    );
  }

  const Icon = step.mode === 'metro' ? TramFront : Bus;

  return (
    <div className="flex items-start gap-3">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: step.lineColor }}
      >
        <Icon size={16} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="px-2 py-0.5 rounded text-white text-xs font-bold"
            style={{ backgroundColor: step.lineColor }}
          >
            {step.line}
          </span>
          <span className="text-white text-sm">→ {step.headsign}</span>
        </div>
        <p className="text-xs text-gray-400">
          {step.from.name} → {step.to.name}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {step.stops} {step.stops === 1 ? 'fermata' : 'fermate'} • {step.duration} min
        </p>
        <p className="text-xs text-milano-yellow mt-1">
          Partenza: {formatDistanceToNow(step.departure, { addSuffix: true, locale: it })}
        </p>
      </div>
    </div>
  );
};

export default RoutePlanner;
