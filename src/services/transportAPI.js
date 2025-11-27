// Servizio per interagire con le API dei trasporti pubblici
// Utilizziamo l'API GTFS di Milano (Open Data) e Muoversi a Milano API
import axios from 'axios';
import realAPI from './realAPI';
import gtfsSimulator from './gtfsSimulator';

const API_CONFIG = {
  // API Open Data Milano - GTFS Real-time
  GTFS_REALTIME_BASE: 'https://giromilano.atm.it/proxy.ashx',
  
  // API Muoversi a Milano (dati statici GTFS)
  GTFS_STATIC_BASE: 'https://geoapi.trasportimilano.it/api',
  
  // API Open Data Comune Milano
  OPENDATA_BASE: 'https://dati.comune.milano.it/api/3/action',
  
  // Usa simulatore GTFS intelligente (veicoli su percorsi reali con orari veri)
  USE_MOCK_DATA: true,
  USE_GTFS_SIMULATOR: true, // Nuova opzione: simula veicoli basandosi su orari reali
  
  // Configurazione API Key (da ottenere su https://developer.atm.it)
  API_KEY: import.meta.env.VITE_ATM_API_KEY || '',
};

// Servizio API principale
class TransportAPI {
  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Ottieni fermate vicine alla posizione dell'utente
  async getNearbyStops(lat, lon, radius = 500) {
    if (API_CONFIG.USE_MOCK_DATA) {
      return this.getMockNearbyStops(lat, lon);
    }
    
    try {
      // In produzione: chiamata all'API reale
      // const response = await this.client.get(`${API_CONFIG.GTFS_BASE}/stops/nearby`, {
      //   params: { lat, lon, radius }
      // });
      // return response.data;
      
      return this.getMockNearbyStops(lat, lon);
    } catch (error) {
      console.error('Error fetching nearby stops:', error);
      return this.getMockNearbyStops(lat, lon);
    }
  }

  // Ottieni arrivi previsti per una fermata
  async getStopArrivals(stopId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      return this.getMockStopArrivals(stopId);
    }
    
    try {
      // Prova API reale con Open Data Milano
      const arrivals = await realAPI.getStopArrivalsReal(stopId);
      return arrivals;
    } catch (error) {
      console.error('Error fetching stop arrivals from real API, falling back to mock:', error);
      return this.getMockStopArrivals(stopId);
    }
  }

  // Ottieni posizioni veicoli in tempo reale
  async getVehiclePositions(lineIds = []) {
    // Opzione 1: Simulatore GTFS (veicoli su percorsi reali con orari)
    if (API_CONFIG.USE_GTFS_SIMULATOR) {
      const vehicles = gtfsSimulator.generateActiveVehicles();
      
      // Filtra per linee specifiche se richiesto
      if (lineIds.length > 0) {
        return vehicles.filter(v => lineIds.includes(v.lineId));
      }
      
      return vehicles;
    }
    
    // Opzione 2: Mock data (completamente random)
    if (API_CONFIG.USE_MOCK_DATA) {
      return this.getMockVehiclePositions();
    }
    
    // Opzione 3: API reali
    try {
      const vehicles = await realAPI.getVehiclePositionsFromOpenData();
      
      if (lineIds.length > 0) {
        return vehicles.filter(v => lineIds.includes(v.lineId));
      }
      
      return vehicles;
    } catch (error) {
      console.error('Error fetching vehicle positions from real API, falling back to simulator:', error);
      return gtfsSimulator.generateActiveVehicles();
    }
  }

  // Cerca linee per nome/numero
  async searchLines(query) {
    if (API_CONFIG.USE_MOCK_DATA) {
      return this.getMockLines().filter(line => 
        line.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    try {
      // const response = await this.client.get(`${API_CONFIG.GTFS_BASE}/lines/search`, {
      //   params: { q: query }
      // });
      // return response.data;
      
      return this.getMockLines();
    } catch (error) {
      console.error('Error searching lines:', error);
      return [];
    }
  }

  // Ottieni info su scioperi/interruzioni servizio
  async getServiceAlerts() {
    if (API_CONFIG.USE_MOCK_DATA) {
      return this.getMockServiceAlerts();
    }
    
    try {
      // const response = await this.client.get(`${API_CONFIG.GTFS_BASE}/alerts`);
      // return response.data;
      
      return this.getMockServiceAlerts();
    } catch (error) {
      console.error('Error fetching service alerts:', error);
      return [];
    }
  }

  // ==================== MOCK DATA ====================
  
  getMockNearbyStops(lat, lon) {
    // Fermate di metro, tram e bus principali ATM (simulate)
    const allStops = [
      // Metro
      { id: 'stop_duomo', name: 'Duomo M1/M3', lat: 45.4640, lon: 9.1900, lines: ['M1', 'M3'], type: 'metro' },
      { id: 'stop_cadorna', name: 'Cadorna M1/M2', lat: 45.4690, lon: 9.1740, lines: ['M1', 'M2'], type: 'metro' },
      { id: 'stop_repubblica', name: 'Repubblica M3', lat: 45.4810, lon: 9.1990, lines: ['M3'], type: 'metro' },
      { id: 'stop_porta_venezia', name: 'Porta Venezia M1', lat: 45.4750, lon: 9.2050, lines: ['M1'], type: 'metro' },
      { id: 'stop_san_babila', name: 'San Babila M1', lat: 45.4620, lon: 9.1970, lines: ['M1'], type: 'metro' },
      { id: 'stop_lanza', name: 'Lanza M2', lat: 45.4730, lon: 9.1870, lines: ['M2'], type: 'metro' },
      // Tram
      { id: 'stop_greco', name: 'Greco', lat: 45.5012, lon: 9.2156, lines: ['1'], type: 'tram' },
      { id: 'stop_bausan', name: 'Bausan', lat: 45.4520, lon: 9.1680, lines: ['2'], type: 'tram' },
      { id: 'stop_gratosoglio', name: 'Gratosoglio', lat: 45.4245, lon: 9.1456, lines: ['3'], type: 'tram' },
      { id: 'stop_niguarda', name: 'Niguarda', lat: 45.5186, lon: 9.1867, lines: ['4'], type: 'tram' },
      { id: 'stop_cimitero', name: 'Cimitero Maggiore', lat: 45.4985, lon: 9.1625, lines: ['5', '14'], type: 'tram' },
      { id: 'stop_roserio', name: 'Roserio', lat: 45.5245, lon: 9.1780, lines: ['12', '15'], type: 'tram' },
      { id: 'stop_castello', name: 'Piazza Castello', lat: 45.4701, lon: 9.1795, lines: ['10'], type: 'tram' },
      { id: 'stop_genova', name: 'Porta Genova', lat: 45.4535, lon: 9.1685, lines: ['9'], type: 'tram' },
      // Bus
      { id: 'stop_precotto', name: 'Precotto M1', lat: 45.5156, lon: 9.2378, lines: ['54'], type: 'bus' },
      { id: 'stop_romolo', name: 'Romolo M2', lat: 45.4456, lon: 9.1678, lines: ['54'], type: 'bus' },
      { id: 'stop_lambrate', name: 'Lambrate', lat: 45.4865, lon: 9.2467, lines: ['61'], type: 'bus' },
      { id: 'stop_bisceglie', name: 'Bisceglie M1', lat: 45.4675, lon: 9.1245, lines: ['61'], type: 'bus' },
      { id: 'stop_linate', name: 'Linate Aeroporto', lat: 45.4456, lon: 9.2756, lines: ['90'], type: 'bus' },
      { id: 'stop_forlanini', name: 'Forlanini', lat: 45.4598, lon: 9.2556, lines: ['90'], type: 'bus' },
      { id: 'stop_lampugnano', name: 'Lampugnano M1', lat: 45.5023, lon: 9.1267, lines: ['91'], type: 'bus' },
      { id: 'stop_portello', name: 'Portello', lat: 45.4820, lon: 9.1480, lines: ['91'], type: 'bus' },
      { id: 'stop_famagosta', name: 'Famagosta M2', lat: 45.4378, lon: 9.1567, lines: ['94'], type: 'bus' },
      { id: 'stop_crocetta', name: 'Crocetta M3', lat: 45.4598, lon: 9.2045, lines: ['94'], type: 'bus' },
    ];

    // Calcola distanza e filtra per raggio
    const stopsWithDistance = allStops.map(stop => ({
      ...stop,
      distance: this.calculateDistance(lat, lon, stop.lat, stop.lon) / 1000, // km
    }));

    // Mostra le fermate più vicine (entro 3km, max 20)
    return stopsWithDistance
      .filter(s => s.distance < 3)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);
  }

  getMockStopArrivals(stopId) {
    const now = new Date();
    const arrivals = [];
    
    // Genera arrivi casuali ma realistici
    const lines = this.getMockLines();
    const stopLines = this.getMockNearbyStops(45.4642, 9.1900)
      .find(s => s.id === stopId)?.lines || ['1', '2', '3'];
    
    stopLines.forEach((lineId, idx) => {
      const line = lines.find(l => l.id === lineId) || {
        id: lineId,
        name: lineId,
        type: lineId.startsWith('M') ? 'metro' : (parseInt(lineId) <= 20 ? 'tram' : 'bus'),
        color: lineId.startsWith('M') ? '#E30613' : (parseInt(lineId) <= 20 ? '#FFD700' : '#007ACC'),
      };
      
      // Aggiungi 2-3 arrivi per linea
      for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
        const minutesAway = Math.floor(Math.random() * 15) + 1 + (i * 5);
        const arrivalTime = new Date(now.getTime() + minutesAway * 60000);
        
        arrivals.push({
          lineId: line.id,
          lineName: line.name,
          lineType: line.type,
          lineColor: line.color,
          destination: this.getRandomDestination(line.type),
          scheduledTime: arrivalTime,
          estimatedTime: arrivalTime,
          minutesAway,
          delay: Math.floor(Math.random() * 3) - 1, // -1, 0, 1, 2 minuti
          realtime: Math.random() > 0.3, // 70% ha dati real-time
          vehicleId: `${line.id}-${Math.floor(Math.random() * 100)}`,
        });
      }
    });
    
    return arrivals.sort((a, b) => a.minutesAway - b.minutesAway);
  }

  getMockVehiclePositions() {
    // Genera veicoli realistici in movimento su Milano
    const vehicles = [];
    const lines = this.getMockLines();
    
    // Centro Milano bounds
    const bounds = {
      north: 45.520,
      south: 45.420,
      west: 9.120,
      east: 9.260,
    };
    
    // Genera 30-50 veicoli casuali
    const vehicleCount = Math.floor(Math.random() * 20) + 30;
    
    for (let i = 0; i < vehicleCount; i++) {
      const line = lines[Math.floor(Math.random() * lines.length)];
      
      // Solo tram e bus (metro è sotto terra)
      if (line.type === 'metro') continue;
      
      vehicles.push({
        id: `vehicle-${line.id}-${i}`,
        lineId: line.id,
        lineName: line.name,
        lineType: line.type,
        lineColor: line.color,
        lat: bounds.south + Math.random() * (bounds.north - bounds.south),
        lon: bounds.west + Math.random() * (bounds.east - bounds.west),
        heading: Math.floor(Math.random() * 360),
        speed: Math.floor(Math.random() * 40) + 10, // 10-50 km/h
        destination: this.getRandomDestination(line.type),
        lastUpdate: new Date(),
        occupancy: ['EMPTY', 'MANY_SEATS', 'FEW_SEATS', 'STANDING', 'FULL'][Math.floor(Math.random() * 5)],
      });
    }
    
    return vehicles;
  }

  getMockLines() {
    return [
      // Metro
      { id: 'M1', name: 'M1', type: 'metro', color: '#E30613', fullName: 'Linea M1 (Rossa)' },
      { id: 'M2', name: 'M2', type: 'metro', color: '#00843D', fullName: 'Linea M2 (Verde)' },
      { id: 'M3', name: 'M3', type: 'metro', color: '#FFD700', fullName: 'Linea M3 (Gialla)' },
      { id: 'M5', name: 'M5', type: 'metro', color: '#8B4EBE', fullName: 'Linea M5 (Lilla)' },
      
      // Tram principali
      { id: '1', name: '1', type: 'tram', color: '#FFD700', fullName: 'Tram 1' },
      { id: '2', name: '2', type: 'tram', color: '#FFD700', fullName: 'Tram 2' },
      { id: '3', name: '3', type: 'tram', color: '#FFD700', fullName: 'Tram 3' },
      { id: '4', name: '4', type: 'tram', color: '#FFD700', fullName: 'Tram 4' },
      { id: '5', name: '5', type: 'tram', color: '#FFD700', fullName: 'Tram 5' },
      { id: '9', name: '9', type: 'tram', color: '#FFD700', fullName: 'Tram 9' },
      { id: '10', name: '10', type: 'tram', color: '#FFD700', fullName: 'Tram 10' },
      { id: '12', name: '12', type: 'tram', color: '#FFD700', fullName: 'Tram 12' },
      { id: '14', name: '14', type: 'tram', color: '#FFD700', fullName: 'Tram 14' },
      { id: '15', name: '15', type: 'tram', color: '#FFD700', fullName: 'Tram 15' },
      { id: '16', name: '16', type: 'tram', color: '#FFD700', fullName: 'Tram 16' },
      { id: '19', name: '19', type: 'tram', color: '#FFD700', fullName: 'Tram 19' },
      
      // Bus principali
      { id: '54', name: '54', type: 'bus', color: '#007ACC', fullName: 'Bus 54' },
      { id: '57', name: '57', type: 'bus', color: '#007ACC', fullName: 'Bus 57' },
      { id: '58', name: '58', type: 'bus', color: '#007ACC', fullName: 'Bus 58' },
      { id: '60', name: '60', type: 'bus', color: '#007ACC', fullName: 'Bus 60' },
      { id: '61', name: '61', type: 'bus', color: '#007ACC', fullName: 'Bus 61' },
      { id: '73', name: '73', type: 'bus', color: '#007ACC', fullName: 'Bus 73' },
      { id: '90', name: '90', type: 'bus', color: '#007ACC', fullName: 'Bus 90/91 Circolare' },
      { id: '94', name: '94', type: 'bus', color: '#007ACC', fullName: 'Bus 94' },
    ];
  }

  getMockServiceAlerts() {
    // Simula alert casuali
    if (Math.random() > 0.7) {
      return [
        {
          id: 'alert-1',
          type: 'STRIKE',
          severity: 'HIGH',
          title: 'Sciopero trasporto pubblico',
          description: 'Servizio ATM ridotto dalle 8:45 alle 15:00 e dalle 18:00 a fine servizio. Garantite solo le fasce di garanzia.',
          affectedLines: ['M1', 'M2', 'M3', 'M5'],
          startTime: new Date(),
          endTime: new Date(Date.now() + 86400000),
        },
      ];
    }
    
    if (Math.random() > 0.5) {
      return [
        {
          id: 'alert-2',
          type: 'DELAY',
          severity: 'MEDIUM',
          title: 'Rallentamenti linea M2',
          description: 'Possibili ritardi sulla linea M2 per guasto tecnico a Centrale.',
          affectedLines: ['M2'],
          startTime: new Date(),
          endTime: null,
        },
      ];
    }
    
    return [];
  }

  // Utility
  getRandomDestination(lineType) {
    const destinations = {
      metro: ['Sesto FS', 'Bisceglie', 'San Donato', 'Comasina', 'Abbiategrasso', 'Lilla'],
      tram: ['Roserio', 'Lodi', 'Gratosoglio', 'Precotto', 'Cimitero Maggiore', 'Cascina Gobba'],
      bus: ['Cadorna', 'Loreto', 'Lambrate', 'Bonola', 'Famagosta', 'Romolo'],
    };
    
    const list = destinations[lineType] || destinations.bus;
    return list[Math.floor(Math.random() * list.length)];
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Raggio Terra in metri
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

export const transportAPI = new TransportAPI();
export default transportAPI;
