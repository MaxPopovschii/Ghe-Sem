// Componente mappa con veicoli real-time e interazioni
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { Navigation, Locate, Layers, Target } from 'lucide-react';
import L from 'leaflet';
import useStore from '../store/useStore';
import VehicleTracker from './VehicleTracker';
import 'leaflet/dist/leaflet.css';

// Fix icone Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icone personalizzate
const createVehicleIcon = (vehicle) => {
  const size = 36;
  const color = vehicle.lineColor;
  
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        <div class="absolute w-full h-full rounded-full animate-ping opacity-20" style="background: ${color};"></div>
        <div class="relative flex items-center justify-center rounded-full text-white font-bold shadow-lg z-10" 
             style="width: ${size}px; height: ${size}px; background: ${color}; border: 2px solid rgba(255,255,255,0.4); transform: rotate(${vehicle.heading}deg);">
          <span style="transform: rotate(-${vehicle.heading}deg); font-size: 11px;">${vehicle.lineName}</span>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-full h-full rounded-full bg-blue-500 animate-ping opacity-30"></div>
        <div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createStopIcon = (stop) => {
  return L.divIcon({
    className: 'stop-marker',
    html: `
      <div class="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-cyber-slate shadow-md">
        <div class="w-2 h-2 rounded-full bg-milano-red"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Componente per centrare la mappa
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

// Layer veicoli
const VehicleLayer = () => {
  const { vehicles, setSelectedVehicle, trackVehicle, filters } = useStore();
  
  // Filtra veicoli in base ai filtri attivi
  const filteredVehicles = vehicles.filter(vehicle => {
    if (vehicle.lineType === 'metro') return filters.showMetro;
    if (vehicle.lineType === 'tram') return filters.showTram;
    if (vehicle.lineType === 'bus') return filters.showBus;
    return true;
  });
  
  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleVehicleDoubleClick = (vehicle) => {
    trackVehicle(vehicle);
  };
  
  return (
    <>
      {filteredVehicles.map(vehicle => (
        <Marker
          key={vehicle.id}
          position={[vehicle.lat, vehicle.lon]}
          icon={createVehicleIcon(vehicle)}
          eventHandlers={{
            click: () => handleVehicleClick(vehicle),
            dblclick: () => handleVehicleDoubleClick(vehicle),
          }}
        >
          <Popup>
            <div className="text-center p-1">
              <p className="font-bold text-lg mb-1" style={{ color: vehicle.lineColor }}>
                Linea {vehicle.lineName}
              </p>
              <p className="text-sm text-gray-700 mb-1">→ {vehicle.destination}</p>
              <p className="text-xs text-gray-500">
                Velocità: {vehicle.speed} km/h
              </p>
              <p className="text-xs text-gray-500">
                Affollamento: {getOccupancyLabel(vehicle.occupancy)}
              </p>
              <button
                onClick={() => handleVehicleDoubleClick(vehicle)}
                className="mt-2 px-3 py-1 bg-milano-yellow text-black rounded text-xs font-bold hover:bg-yellow-400"
              >
                Segui veicolo
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

// Layer fermate
const StopsLayer = () => {
  const { nearbyStops, setSelectedStop, filters } = useStore();
  
  return (
    <>
      {nearbyStops.map(stop => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lon]}
          icon={createStopIcon(stop)}
          eventHandlers={{
            click: () => setSelectedStop(stop),
          }}
        >
          <Popup>
            <div className="text-center p-1">
              <p className="font-bold text-base mb-1">{stop.name}</p>
              <p className="text-xs text-gray-600 mb-2">{stop.distance.toFixed(2)} km di distanza</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {stop.lines.slice(0, 6).map((line, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-200 text-xs rounded">
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

// Layer per percorso selezionato
const RouteLayer = () => {
  const { selectedRoute } = useStore();
  
  if (!selectedRoute) return null;
  
  // Estrai tutti i punti del percorso
  const routePoints = [];
  selectedRoute.steps.forEach(step => {
    if (step.from) {
      routePoints.push([step.from.lat, step.from.lon]);
    }
    if (step.to) {
      routePoints.push([step.to.lat, step.to.lon]);
    }
  });
  
  return (
    <>
      {routePoints.length > 1 && (
        <Polyline
          positions={routePoints}
          pathOptions={{
            color: '#FFD700',
            weight: 5,
            opacity: 0.8,
          }}
        />
      )}
      
      {/* Marker origine e destinazione */}
      {selectedRoute.steps.length > 0 && (
        <>
          <Marker
            position={[
              selectedRoute.steps[0].from.lat,
              selectedRoute.steps[0].from.lon
            ]}
            icon={createRouteMarkerIcon('A', '#00FF00')}
          />
          <Marker
            position={[
              selectedRoute.steps[selectedRoute.steps.length - 1].to.lat,
              selectedRoute.steps[selectedRoute.steps.length - 1].to.lon
            ]}
            icon={createRouteMarkerIcon('B', '#FF0000')}
          />
        </>
      )}
    </>
  );
};

// Icona per marker origine/destinazione
const createRouteMarkerIcon = (label, color) => {
  return L.divIcon({
    className: 'route-marker',
    html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold shadow-lg border-2 border-white"
           style="background: ${color};">
        ${label}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

// Layer posizione utente
const UserLocationLayer = () => {
  const { userLocation } = useStore();
  
  if (!userLocation) return null;
  
  return (
    <>
      <Marker
        position={[userLocation.lat, userLocation.lon]}
        icon={createUserLocationIcon()}
      >
        <Popup>
          <div className="text-center p-1">
            <p className="font-semibold">La tua posizione</p>
            {userLocation.accuracy && (
              <p className="text-xs text-gray-600">
                Precisione: ±{Math.round(userLocation.accuracy)}m
              </p>
            )}
          </div>
        </Popup>
      </Marker>
      
      {userLocation.accuracy && (
        <Circle
          center={[userLocation.lat, userLocation.lon]}
          radius={userLocation.accuracy}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
      )}
    </>
  );
};

// Componente principale mappa
const MapView = () => {
  const { 
    userLocation, 
    requestLocation,
    loadVehicles,
    isLoadingLocation,
    trackedVehicle,
    selectedRoute,
  } = useStore();
  
  const [mapCenter, setMapCenter] = useState([45.4642, 9.1900]);
  const [mapZoom, setMapZoom] = useState(14);
  const [showStops, setShowStops] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    // Richiedi posizione al mount
    requestLocation();
    
    // Carica veicoli
    loadVehicles();
    
    // Aggiorna veicoli ogni 10 secondi
    const interval = setInterval(() => {
      loadVehicles();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lon]);
    }
  }, [userLocation]);

  // Segui veicolo tracciato
  useEffect(() => {
    if (trackedVehicle) {
      setMapCenter([trackedVehicle.lat, trackedVehicle.lon]);
      setMapZoom(16);
    }
  }, [trackedVehicle]);

  // Centra su percorso selezionato
  useEffect(() => {
    if (selectedRoute && selectedRoute.steps.length > 0) {
      const firstStep = selectedRoute.steps[0];
      setMapCenter([firstStep.from.lat, firstStep.from.lon]);
      setMapZoom(13);
    }
  }, [selectedRoute]);

  const handleCenterOnUser = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lon]);
      setMapZoom(16);
    } else {
      requestLocation();
    }
  };

  const handleCenterOnTracked = () => {
    if (trackedVehicle) {
      setMapCenter([trackedVehicle.lat, trackedVehicle.lon]);
      setMapZoom(16);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Mappa */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        zoomControl={false}
        ref={mapRef}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <UserLocationLayer />
        {showStops && <StopsLayer />}
        {showVehicles && <VehicleLayer />}
        <RouteLayer />
        
        {/* Vehicle Tracker Component */}
        <VehicleTracker />
      </MapContainer>

      {/* Controlli mappa */}
      <div className="absolute top-20 right-4 z-[999] flex flex-col gap-2">
        {/* Center su utente */}
        <button
          onClick={handleCenterOnUser}
          disabled={isLoadingLocation}
          className="p-3 rounded-full bg-cyber-slate/90 backdrop-blur-md border border-white/20 shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          {isLoadingLocation ? (
            <div className="w-6 h-6 border-2 border-milano-yellow border-t-transparent rounded-full animate-spin" />
          ) : (
            <Locate className="text-white" size={24} />
          )}
        </button>

        {/* Center su veicolo tracciato */}
        {trackedVehicle && (
          <button
            onClick={handleCenterOnTracked}
            className="p-3 rounded-full bg-milano-yellow backdrop-blur-md border border-white/20 shadow-lg hover:scale-110 transition-transform animate-pulse"
          >
            <Target className="text-black" size={24} />
          </button>
        )}

        {/* Toggle layers */}
        <button
          onClick={() => setShowStops(!showStops)}
          className={`p-3 rounded-full backdrop-blur-md border border-white/20 shadow-lg transition-all ${
            showStops ? 'bg-milano-yellow text-black' : 'bg-cyber-slate/90 text-white'
          }`}
        >
          <Layers size={24} />
        </button>
      </div>
    </div>
  );
};

// Utility
const getOccupancyLabel = (occupancy) => {
  const labels = {
    EMPTY: 'Vuoto',
    MANY_SEATS: 'Posti disponibili',
    FEW_SEATS: 'Pochi posti',
    STANDING: 'In piedi',
    FULL: 'Pieno',
  };
  return labels[occupancy] || 'Sconosciuto';
};

export default MapView;
