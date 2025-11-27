// Store globale con Zustand per gestire lo stato dell'app
import { create } from 'zustand';
import transportAPI from '../services/transportAPI';
import routingService from '../services/routingService';

const useStore = create((set, get) => ({
  // Stato utente
  userLocation: null,
  locationPermission: 'prompt', // 'prompt' | 'granted' | 'denied'
  isLoadingLocation: false,
  
  // Dati trasporto
  nearbyStops: [],
  vehicles: [],
  selectedStop: null,
  selectedVehicle: null,
  trackedVehicle: null, // Veicolo seguito sulla mappa
  vehicleRoute: null, // Percorso del veicolo seguito
  upcomingStops: [], // Prossime fermate del veicolo seguito
  serviceAlerts: [],
  
  // Routing
  routeOrigin: null,
  routeDestination: null,
  routes: [], // Percorsi calcolati
  selectedRoute: null,
  isCalculatingRoute: false,
  
  // UI State
  isBottomSheetExpanded: false,
  isSidebarOpen: false,
  activeView: 'map', // 'map' | 'stops' | 'lines' | 'favorites' | 'route'
  activeSidebarTab: 'routes', // 'routes' | 'lines' | 'favorites' | 'settings'
  searchQuery: '',
  isLoading: false,
  error: null,
  
  // Filtri
  filters: {
    showMetro: true,
    showTram: true,
    showBus: true,
    selectedLines: [],
  },
  
  // Preferenze utente
  favorites: JSON.parse(localStorage.getItem('ghe-sem-favorites') || '[]'),
  recentSearches: JSON.parse(localStorage.getItem('ghe-sem-recent') || '[]'),
  recentRoutes: JSON.parse(localStorage.getItem('ghe-sem-routes') || '[]'),
  notifications: JSON.parse(localStorage.getItem('ghe-sem-notifications') || '[]'),
  
  // Actions - Geolocalizzazione
  requestLocation: async () => {
    set({ isLoadingLocation: true, error: null });
    
    if (!navigator.geolocation) {
      set({ 
        error: 'Geolocalizzazione non supportata dal browser',
        isLoadingLocation: false,
        locationPermission: 'denied',
      });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        
        set({ 
          userLocation,
          locationPermission: 'granted',
          isLoadingLocation: false,
        });
        
        // Carica automaticamente fermate vicine
        await get().loadNearbyStops();
      },
      (error) => {
        console.error('Geolocation error:', error);
        set({ 
          error: 'Impossibile ottenere la posizione',
          isLoadingLocation: false,
          locationPermission: 'denied',
        });
        
        // Fallback: usa centro Milano
        set({ 
          userLocation: { lat: 45.4642, lon: 9.1900, accuracy: null },
        });
        get().loadNearbyStops();
      }
    );
  },

  watchLocation: () => {
    if (!navigator.geolocation) return null;
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        set({ 
          userLocation: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
    
    return watchId;
  },
  
  // Actions - Dati trasporto
  loadNearbyStops: async () => {
    const { userLocation } = get();
    if (!userLocation) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const stops = await transportAPI.getNearbyStops(
        userLocation.lat, 
        userLocation.lon
      );
      
      // Carica arrivi per ogni fermata
      const stopsWithArrivals = await Promise.all(
        stops.map(async (stop) => {
          const arrivals = await transportAPI.getStopArrivals(stop.id);
          return { ...stop, arrivals };
        })
      );
      
      set({ nearbyStops: stopsWithArrivals, isLoading: false });
    } catch (error) {
      console.error('Error loading nearby stops:', error);
      set({ error: 'Errore caricamento fermate', isLoading: false });
    }
  },

  loadVehicles: async (lineIds = []) => {
    try {
      const vehicles = await transportAPI.getVehiclePositions(lineIds);
      set({ vehicles });
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  },

  loadServiceAlerts: async () => {
    try {
      const alerts = await transportAPI.getServiceAlerts();
      set({ serviceAlerts: alerts });
    } catch (error) {
      console.error('Error loading service alerts:', error);
    }
  },

  refreshStopArrivals: async (stopId) => {
    try {
      const arrivals = await transportAPI.getStopArrivals(stopId);
      const nearbyStops = get().nearbyStops.map(stop => 
        stop.id === stopId ? { ...stop, arrivals } : stop
      );
      set({ nearbyStops });
    } catch (error) {
      console.error('Error refreshing arrivals:', error);
    }
  },
  
  // Actions - UI
  setBottomSheetExpanded: (isExpanded) => {
    set({ isBottomSheetExpanded: isExpanded });
  },

  toggleBottomSheet: () => {
    set({ isBottomSheetExpanded: !get().isBottomSheetExpanded });
  },

  setActiveView: (view) => {
    set({ activeView: view });
  },

  setSelectedStop: (stop) => {
    set({ selectedStop: stop });
    if (stop) {
      get().refreshStopArrivals(stop.id);
    }
  },

  setSelectedVehicle: (vehicle) => {
    set({ selectedVehicle: vehicle });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  // Actions - Preferenze
  addFavorite: (item) => {
    const favorites = [...get().favorites, item];
    set({ favorites });
    localStorage.setItem('ghe-sem-favorites', JSON.stringify(favorites));
  },

  removeFavorite: (itemId) => {
    const favorites = get().favorites.filter(f => f.id !== itemId);
    set({ favorites });
    localStorage.setItem('ghe-sem-favorites', JSON.stringify(favorites));
  },

  isFavorite: (itemId) => {
    return get().favorites.some(f => f.id === itemId);
  },

  addRecentSearch: (search) => {
    const recentSearches = [search, ...get().recentSearches.filter(s => s !== search)].slice(0, 10);
    set({ recentSearches });
    localStorage.setItem('ghe-sem-recent', JSON.stringify(recentSearches));
  },

  // Actions - Routing
  setRouteOrigin: (location) => {
    set({ routeOrigin: location });
  },

  setRouteDestination: (location) => {
    set({ routeDestination: location });
  },

  calculateRoute: async (mode = 'balanced') => {
    const { routeOrigin, routeDestination, filters } = get();
    
    if (!routeOrigin || !routeDestination) {
      set({ error: 'Seleziona origine e destinazione' });
      return;
    }

    set({ isCalculatingRoute: true, error: null });

    try {
      const routes = await routingService.calculateRoute(
        routeOrigin,
        routeDestination,
        { mode, preferredTransport: get().getPreferredTransport() }
      );

      set({ 
        routes,
        selectedRoute: routes[0],
        isCalculatingRoute: false,
        activeView: 'route',
      });

      // Salva in cronologia
      get().addRecentRoute({
        from: routeOrigin,
        to: routeDestination,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Route calculation error:', error);
      set({ 
        error: 'Errore nel calcolo del percorso',
        isCalculatingRoute: false,
      });
    }
  },

  setSelectedRoute: (route) => {
    set({ selectedRoute: route });
  },

  clearRoute: () => {
    set({ 
      routeOrigin: null,
      routeDestination: null,
      routes: [],
      selectedRoute: null,
    });
  },

  swapRoutePoints: () => {
    const { routeOrigin, routeDestination } = get();
    set({ 
      routeOrigin: routeDestination,
      routeDestination: routeOrigin,
    });
  },

  addRecentRoute: (route) => {
    const recentRoutes = [route, ...get().recentRoutes].slice(0, 20);
    set({ recentRoutes });
    localStorage.setItem('ghe-sem-routes', JSON.stringify(recentRoutes));
  },

  // Actions - Vehicle Tracking
  trackVehicle: async (vehicle) => {
    set({ trackedVehicle: vehicle, selectedVehicle: null });
    
    try {
      const route = await routingService.getVehicleRoute(vehicle.id, vehicle.lineId);
      const upcomingStops = await routingService.getUpcomingStops(vehicle.id, vehicle.lineId);
      
      set({ vehicleRoute: route, upcomingStops });
    } catch (error) {
      console.error('Vehicle tracking error:', error);
    }
  },

  stopTrackingVehicle: () => {
    set({ 
      trackedVehicle: null,
      vehicleRoute: null,
      upcomingStops: [],
    });
  },

  // Actions - Filtri
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  toggleLineFilter: (lineId) => {
    const { filters } = get();
    const selectedLines = filters.selectedLines.includes(lineId)
      ? filters.selectedLines.filter(id => id !== lineId)
      : [...filters.selectedLines, lineId];
    
    set({ filters: { ...filters, selectedLines } });
  },

  getPreferredTransport: () => {
    const { filters } = get();
    if (filters.showMetro && !filters.showTram && !filters.showBus) return 'metro';
    if (filters.showTram && !filters.showMetro && !filters.showBus) return 'tram';
    if (filters.showBus && !filters.showMetro && !filters.showTram) return 'bus';
    return null;
  },

  // Actions - Notifiche
  addNotification: (notification) => {
    const notifications = [...get().notifications, { ...notification, id: Date.now() }];
    set({ notifications });
    localStorage.setItem('ghe-sem-notifications', JSON.stringify(notifications));
    
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
      });
    }
  },

  removeNotification: (id) => {
    const notifications = get().notifications.filter(n => n.id !== id);
    set({ notifications });
    localStorage.setItem('ghe-sem-notifications', JSON.stringify(notifications));
  },

  requestNotificationPermission: async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  },

  // Actions - Sidebar
  setSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen });
  },

  toggleSidebar: () => {
    set({ isSidebarOpen: !get().isSidebarOpen });
  },

  setActiveSidebarTab: (tab) => {
    set({ activeSidebarTab: tab });
  },
  
  // Cleanup
  clearError: () => {
    set({ error: null });
  },
}));

export default useStore;
