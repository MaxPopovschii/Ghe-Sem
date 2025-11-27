// Implementazioni API reali per ATM Milano
// Questo file contiene le integrazioni con le API ufficiali

import axios from 'axios';

/**
 * GUIDA INTEGRAZIONE API REALI ATM MILANO
 * 
 * 1. API GTFS Realtime (Posizioni veicoli, arrivi)
 *    - Endpoint: https://giromilano.atm.it/proxy.ashx
 *    - Autenticazione: Richiede API Key
 *    - Registrazione: https://developer.atm.it
 *    - Formato: Protocol Buffers (GTFS-RT)
 * 
 * 2. API Open Data Comune Milano
 *    - Endpoint: https://dati.comune.milano.it/api/3/action
 *    - Dataset: gtfs_rt_vehicle_position, gtfs_rt_trip_update
 *    - Formato: JSON
 *    - Gratuito ma con rate limiting
 * 
 * 3. API Muoversi a Milano (GTFS Statico)
 *    - Endpoint: https://geoapi.trasportimilano.it/api
 *    - Dati: Fermate, linee, orari programmati
 *    - No autenticazione per dati statici
 */

const REAL_API_CONFIG = {
  ATM_BASE: 'https://giromilano.atm.it/proxy.ashx',
  OPENDATA_BASE: 'https://dati.comune.milano.it/api/3/action',
  GTFS_STATIC: 'https://geoapi.trasportimilano.it/api',
  API_KEY: import.meta.env.VITE_ATM_API_KEY || '',
};

class RealTransportAPI {
  constructor() {
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Ottieni posizioni veicoli real-time da Open Data Milano
   */
  async getVehiclePositionsFromOpenData() {
    try {
      const response = await this.client.get(`${REAL_API_CONFIG.OPENDATA_BASE}/datastore_search`, {
        params: {
          resource_id: 'gtfs_rt_vehicle_position',
          limit: 100,
        },
      });

      if (!response.data.success) {
        throw new Error('API returned error');
      }

      // Trasforma dati GTFS-RT in formato app
      return response.data.result.records.map(record => ({
        id: record.vehicle_id || record.trip_id,
        lineId: record.route_id,
        lineName: record.route_short_name,
        lineType: this.getVehicleType(record.route_type),
        lineColor: this.getLineColor(record.route_id),
        lat: parseFloat(record.latitude),
        lon: parseFloat(record.longitude),
        heading: parseInt(record.bearing) || 0,
        speed: parseInt(record.speed) || 0,
        destination: record.trip_headsign || 'Sconosciuto',
        lastUpdate: new Date(record.timestamp * 1000),
        occupancy: this.parseOccupancy(record.occupancy_status),
      }));
    } catch (error) {
      console.error('Error fetching vehicle positions from Open Data:', error);
      throw error;
    }
  }

  /**
   * Ottieni aggiornamenti arrivi real-time
   */
  async getTripUpdatesFromOpenData() {
    try {
      const response = await this.client.get(`${REAL_API_CONFIG.OPENDATA_BASE}/datastore_search`, {
        params: {
          resource_id: 'gtfs_rt_trip_update',
          limit: 200,
        },
      });

      if (!response.data.success) {
        throw new Error('API returned error');
      }

      return response.data.result.records;
    } catch (error) {
      console.error('Error fetching trip updates:', error);
      throw error;
    }
  }

  /**
   * Ottieni fermate da GTFS statico
   */
  async getStopsFromGTFS(lat, lon, radius = 500) {
    try {
      // Nota: questo endpoint potrebbe non esistere, è un esempio
      // Verifica la documentazione ufficiale dell'API
      const response = await this.client.get(`${REAL_API_CONFIG.GTFS_STATIC}/stops`, {
        params: {
          lat,
          lon,
          radius,
        },
      });

      return response.data.map(stop => ({
        id: stop.stop_id,
        name: stop.stop_name,
        lat: parseFloat(stop.stop_lat),
        lon: parseFloat(stop.stop_lon),
        distance: this.calculateDistance(lat, lon, stop.stop_lat, stop.stop_lon),
        lines: stop.routes || [],
        type: this.getStopType(stop.location_type),
      }));
    } catch (error) {
      console.error('Error fetching stops from GTFS:', error);
      throw error;
    }
  }

  /**
   * Ottieni arrivi per una fermata specifica usando trip updates
   */
  async getStopArrivalsReal(stopId) {
    try {
      const tripUpdates = await this.getTripUpdatesFromOpenData();
      
      // Filtra aggiornamenti per questa fermata
      const arrivals = [];
      
      tripUpdates.forEach(update => {
        if (update.stop_id === stopId) {
          arrivals.push({
            lineId: update.route_id,
            lineName: update.route_short_name,
            lineType: this.getVehicleType(update.route_type),
            lineColor: this.getLineColor(update.route_id),
            destination: update.trip_headsign,
            scheduledTime: new Date(update.arrival_time * 1000),
            estimatedTime: new Date((update.arrival_time + update.arrival_delay) * 1000),
            minutesAway: Math.round((update.arrival_time + update.arrival_delay - Date.now() / 1000) / 60),
            delay: Math.round(update.arrival_delay / 60),
            realtime: true,
            vehicleId: update.vehicle_id,
          });
        }
      });

      return arrivals.sort((a, b) => a.minutesAway - b.minutesAway);
    } catch (error) {
      console.error('Error fetching stop arrivals:', error);
      throw error;
    }
  }

  /**
   * Metodo con ATM API ufficiale (richiede API Key)
   */
  async getVehiclePositionsFromATM() {
    if (!REAL_API_CONFIG.API_KEY) {
      throw new Error('ATM API Key non configurata. Ottienila su https://developer.atm.it');
    }

    try {
      const response = await this.client.get(`${REAL_API_CONFIG.ATM_BASE}/vehiclePositions`, {
        headers: {
          'X-API-Key': REAL_API_CONFIG.API_KEY,
        },
      });

      // Nota: Il formato dipende dall'API specifica
      // Questo è un esempio generico da adattare
      return response.data;
    } catch (error) {
      console.error('Error fetching from ATM API:', error);
      throw error;
    }
  }

  // ==================== UTILITY ====================

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio Terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distanza in km
  }

  getVehicleType(routeType) {
    // GTFS route_type mapping
    switch (routeType) {
      case 0: return 'tram';
      case 1: return 'metro';
      case 3: return 'bus';
      case 11: return 'bus'; // trolleybus
      case 800: return 'bus'; // trolleybus
      default: return 'bus';
    }
  }

  getLineColor(routeId) {
    // Colori linee ATM Milano
    if (routeId?.startsWith('M1')) return '#E30613'; // M1 Rossa
    if (routeId?.startsWith('M2')) return '#00843D'; // M2 Verde
    if (routeId?.startsWith('M3')) return '#FFD700'; // M3 Gialla
    if (routeId?.startsWith('M5')) return '#6E3AA7'; // M5 Lilla
    
    // Tram: giallo
    if (parseInt(routeId) <= 30) return '#FFD700';
    
    // Bus: blu
    return '#007ACC';
  }

  parseOccupancy(status) {
    // GTFS-RT OccupancyStatus enum
    switch (status) {
      case 0: return 'EMPTY';
      case 1: return 'MANY_SEATS';
      case 2: return 'FEW_SEATS';
      case 3: return 'STANDING';
      case 4: return 'CRUSHED_STANDING';
      case 5: return 'FULL';
      default: return 'UNKNOWN';
    }
  }

  getStopType(locationType) {
    // GTFS location_type
    switch (locationType) {
      case 0: return 'stop';
      case 1: return 'station';
      case 2: return 'entrance';
      case 3: return 'node';
      default: return 'stop';
    }
  }
}

export default new RealTransportAPI();
