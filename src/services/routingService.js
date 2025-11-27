// Servizio di routing per calcolare percorsi da A a B
import transportAPI from './transportAPI';

class RoutingService {
  constructor() {
    this.cache = new Map();
  }

  // Calcola percorso ottimale da origine a destinazione
  async calculateRoute(origin, destination, preferences = {}) {
    const {
      mode = 'balanced', // 'fastest' | 'balanced' | 'least_transfers' | 'walking'
      maxWalkingDistance = 1000, // metri
      avoidLines = [],
      preferredTransport = null, // 'metro' | 'tram' | 'bus' | null
    } = preferences;

    const cacheKey = this.getCacheKey(origin, destination, mode);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // In produzione: chiamata all'API di routing
      // const response = await axios.post('/api/route', { origin, destination, preferences });
      
      // Mock: genera 3 alternative realistiche
      const routes = this.generateMockRoutes(origin, destination, mode);
      
      this.cache.set(cacheKey, routes);
      
      // Pulisci cache dopo 5 minuti
      setTimeout(() => this.cache.delete(cacheKey), 300000);
      
      return routes;
    } catch (error) {
      console.error('Routing error:', error);
      throw error;
    }
  }

  // Genera percorsi mock realistici
  generateMockRoutes(origin, destination, mode) {
    const baseTime = Math.floor(Math.random() * 20) + 15; // 15-35 min
    
    const routes = [
      // Percorso 1: Più veloce
      {
        id: 'route-1',
        type: 'fastest',
        duration: baseTime,
        walkingDistance: 600,
        transfers: 1,
        price: 2.00,
        steps: [
          {
            type: 'walk',
            duration: 3,
            distance: 250,
            from: origin,
            to: { name: 'Duomo M1/M3', lat: 45.4640, lon: 9.1900 },
            instructions: 'Cammina verso Duomo',
          },
          {
            type: 'transit',
            mode: 'metro',
            line: 'M1',
            lineColor: '#E30613',
            duration: 8,
            stops: 5,
            from: { name: 'Duomo M1', lat: 45.4640, lon: 9.1900 },
            to: { name: 'Cadorna M1', lat: 45.4690, lon: 9.1740 },
            departure: new Date(Date.now() + 2 * 60000),
            arrival: new Date(Date.now() + 10 * 60000),
            headsign: 'Bisceglie',
          },
          {
            type: 'walk',
            duration: 2,
            distance: 150,
            from: { name: 'Cadorna M1', lat: 45.4690, lon: 9.1740 },
            to: { name: 'Cadorna M2', lat: 45.4690, lon: 9.1740 },
            instructions: 'Cambia linea',
          },
          {
            type: 'transit',
            mode: 'metro',
            line: 'M2',
            lineColor: '#00843D',
            duration: 6,
            stops: 4,
            from: { name: 'Cadorna M2', lat: 45.4690, lon: 9.1740 },
            to: destination,
            departure: new Date(Date.now() + 12 * 60000),
            arrival: new Date(Date.now() + 18 * 60000),
            headsign: 'Cologno Nord',
          },
          {
            type: 'walk',
            duration: 1,
            distance: 100,
            from: destination,
            to: destination,
            instructions: 'Arrivo a destinazione',
          },
        ],
        emissions: 120, // grammi CO2
        calories: 45,
      },
      
      // Percorso 2: Meno cambi
      {
        id: 'route-2',
        type: 'least_transfers',
        duration: baseTime + 5,
        walkingDistance: 800,
        transfers: 0,
        price: 2.00,
        steps: [
          {
            type: 'walk',
            duration: 5,
            distance: 400,
            from: origin,
            to: { name: 'Cordusio M1', lat: 45.4650, lon: 9.1850 },
            instructions: 'Cammina verso Cordusio',
          },
          {
            type: 'transit',
            mode: 'tram',
            line: '1',
            lineColor: '#FFD700',
            duration: 15,
            stops: 12,
            from: { name: 'Cordusio', lat: 45.4650, lon: 9.1850 },
            to: destination,
            departure: new Date(Date.now() + 3 * 60000),
            arrival: new Date(Date.now() + 18 * 60000),
            headsign: 'Lodi',
          },
          {
            type: 'walk',
            duration: 2,
            distance: 150,
            from: destination,
            to: destination,
            instructions: 'Arrivo a destinazione',
          },
        ],
        emissions: 80,
        calories: 60,
      },
      
      // Percorso 3: A piedi + trasporto
      {
        id: 'route-3',
        type: 'balanced',
        duration: baseTime + 3,
        walkingDistance: 450,
        transfers: 1,
        price: 2.00,
        steps: [
          {
            type: 'walk',
            duration: 4,
            distance: 300,
            from: origin,
            to: { name: 'San Babila M1', lat: 45.4620, lon: 9.1970 },
            instructions: 'Cammina verso San Babila',
          },
          {
            type: 'transit',
            mode: 'bus',
            line: '54',
            lineColor: '#007ACC',
            duration: 10,
            stops: 8,
            from: { name: 'San Babila', lat: 45.4620, lon: 9.1970 },
            to: { name: 'Loreto M1/M2', lat: 45.4850, lon: 9.2150 },
            departure: new Date(Date.now() + 4 * 60000),
            arrival: new Date(Date.now() + 14 * 60000),
            headsign: 'Loreto',
          },
          {
            type: 'transit',
            mode: 'metro',
            line: 'M1',
            lineColor: '#E30613',
            duration: 5,
            stops: 3,
            from: { name: 'Loreto M1', lat: 45.4850, lon: 9.2150 },
            to: destination,
            departure: new Date(Date.now() + 16 * 60000),
            arrival: new Date(Date.now() + 21 * 60000),
            headsign: 'Sesto FS',
          },
          {
            type: 'walk',
            duration: 1,
            distance: 80,
            from: destination,
            to: destination,
            instructions: 'Arrivo a destinazione',
          },
        ],
        emissions: 100,
        calories: 50,
      },
    ];

    // Ordina in base alla preferenza
    if (mode === 'fastest') {
      return routes.sort((a, b) => a.duration - b.duration);
    } else if (mode === 'least_transfers') {
      return routes.sort((a, b) => a.transfers - b.transfers);
    }
    
    return routes;
  }

  // Calcola percorso del veicolo (per tracking)
  async getVehicleRoute(vehicleId, lineId) {
    try {
      // In produzione: API call per shape della linea
      return this.getMockVehicleRoute(lineId);
    } catch (error) {
      console.error('Vehicle route error:', error);
      return null;
    }
  }

  getMockVehicleRoute(lineId) {
    // Genera un percorso circolare realistico
    const center = [45.4642, 9.1900];
    const radius = 0.03;
    const points = [];
    
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI;
      points.push({
        lat: center[0] + radius * Math.cos(angle),
        lon: center[1] + radius * Math.sin(angle),
        stopName: i % 4 === 0 ? `Fermata ${Math.floor(i / 4) + 1}` : null,
      });
    }
    
    return {
      lineId,
      points,
      totalStops: 5,
      distance: 8500, // metri
    };
  }

  // Ottieni prossime fermate per un veicolo
  async getUpcomingStops(vehicleId, lineId) {
    try {
      // Mock: prossime 5 fermate
      return [
        { name: 'Duomo M1/M3', eta: new Date(Date.now() + 2 * 60000), distance: 500 },
        { name: 'Cordusio M1', eta: new Date(Date.now() + 4 * 60000), distance: 1200 },
        { name: 'Cairoli M1', eta: new Date(Date.now() + 6 * 60000), distance: 1800 },
        { name: 'Cadorna M1/M2', eta: new Date(Date.now() + 9 * 60000), distance: 2500 },
        { name: 'Conciliazione', eta: new Date(Date.now() + 12 * 60000), distance: 3200 },
      ];
    } catch (error) {
      console.error('Upcoming stops error:', error);
      return [];
    }
  }

  // Utility
  getCacheKey(origin, destination, mode) {
    return `${origin.lat},${origin.lon}-${destination.lat},${destination.lon}-${mode}`;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }
}

export const routingService = new RoutingService();
export default routingService;
