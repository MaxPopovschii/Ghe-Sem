// Simulatore real-time basato su GTFS statico
// Calcola posizioni veicoli realistiche seguendo orari e percorsi veri

class GTFSSimulator {
  constructor() {
    this.routes = this.getATMRoutes();
    this.schedules = this.getATMSchedules();
    this.activeVehicles = new Map();
  }

  /**
   * Calcola posizione veicolo in base all'orario corrente
   */
  getVehiclePosition(tripId, currentTime) {
    const trip = this.schedules.get(tripId);
    if (!trip) return null;

    // Trova tra quali fermate si trova ora
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    for (let i = 0; i < trip.stopTimes.length - 1; i++) {
      const currentStop = trip.stopTimes[i];
      const nextStop = trip.stopTimes[i + 1];
      
      if (currentMinutes >= currentStop.time && currentMinutes < nextStop.time) {
        // Interpola posizione tra le due fermate
        const progress = (currentMinutes - currentStop.time) / (nextStop.time - currentStop.time);
        
        return {
          lat: currentStop.lat + (nextStop.lat - currentStop.lat) * progress,
          lon: currentStop.lon + (nextStop.lon - currentStop.lon) * progress,
          heading: this.calculateHeading(currentStop, nextStop),
          speed: this.calculateSpeed(currentStop, nextStop),
          nextStopId: nextStop.id,
          progress,
        };
      }
    }
    
    return null;
  }

  /**
   * Genera veicoli attivi basati su orari GTFS
   */
  generateActiveVehicles(currentTime = new Date()) {
    const vehicles = [];
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const currentDay = currentTime.getDay(); // 0 = domenica, 1 = lunedì, etc.
    
    // Per ogni linea ATM
    this.routes.forEach(route => {
      // Calcola quante corse sono attive ora
      const activeTrips = this.getActiveTripsForRoute(route.id, currentMinutes, currentDay);
      
      activeTrips.forEach(trip => {
        const position = this.getVehiclePosition(trip.id, currentTime);
        
        if (position) {
          vehicles.push({
            id: `${route.id}-${trip.id}`,
            lineId: route.id,
            lineName: route.name,
            lineType: route.type,
            lineColor: route.color,
            lat: position.lat,
            lon: position.lon,
            heading: position.heading,
            speed: position.speed,
            destination: trip.headsign,
            lastUpdate: currentTime,
            occupancy: this.estimateOccupancy(currentMinutes),
            tripId: trip.id,
            nextStopId: position.nextStopId,
          });
        }
      });
    });
    
    return vehicles;
  }

  /**
   * Trova corse attive per una linea in un dato momento
   */
  getActiveTripsForRoute(routeId, currentMinutes, dayOfWeek) {
    const trips = [];
    const schedule = this.schedules.get(routeId);
    
    if (!schedule) return trips;
    
    // Determina tipo di servizio (feriale/festivo)
    const serviceType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';
    
    schedule.trips.forEach(trip => {
      if (trip.serviceType !== serviceType) return;
      
      // Verifica se la corsa è attiva ora
      const firstStopTime = trip.stopTimes[0].time;
      const lastStopTime = trip.stopTimes[trip.stopTimes.length - 1].time;
      
      if (currentMinutes >= firstStopTime && currentMinutes <= lastStopTime) {
        trips.push(trip);
      }
    });
    
    return trips;
  }

  /**
   * Calcola heading tra due punti
   */
  calculateHeading(from, to) {
    const dLon = (to.lon - from.lon) * Math.PI / 180;
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const heading = Math.atan2(y, x) * 180 / Math.PI;
    
    return (heading + 360) % 360;
  }

  /**
   * Calcola velocità media tra fermate
   */
  calculateSpeed(from, to) {
    const distance = this.calculateDistance(from.lat, from.lon, to.lat, to.lon);
    const timeMinutes = to.time - from.time;
    
    if (timeMinutes <= 0) return 0;
    
    // km/h
    const speed = (distance / timeMinutes) * 60;
    return Math.min(Math.max(speed, 10), 50); // Limita tra 10-50 km/h
  }

  /**
   * Stima affollamento in base all'orario
   */
  estimateOccupancy(currentMinutes) {
    // Ora di punta mattina: 7:30-9:30
    if (currentMinutes >= 450 && currentMinutes <= 570) {
      return Math.random() > 0.3 ? 'FULL' : 'STANDING';
    }
    // Ora di punta sera: 17:30-19:30
    if (currentMinutes >= 1050 && currentMinutes <= 1170) {
      return Math.random() > 0.3 ? 'STANDING' : 'FEW_SEATS';
    }
    // Ore normali
    if (currentMinutes >= 360 && currentMinutes <= 1320) {
      return ['MANY_SEATS', 'FEW_SEATS', 'STANDING'][Math.floor(Math.random() * 3)];
    }
    // Ore serali/notturne
    return Math.random() > 0.5 ? 'MANY_SEATS' : 'EMPTY';
  }

  /**
   * Calcola distanza tra due coordinate (km)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Database linee ATM Milano (principali)
   */
  getATMRoutes() {
    return new Map([
      // Metro
      ['M1', { id: 'M1', name: 'M1', type: 'metro', color: '#E30613' }],
      ['M2', { id: 'M2', name: 'M2', type: 'metro', color: '#00843D' }],
      ['M3', { id: 'M3', name: 'M3', type: 'metro', color: '#FFD700' }],
      ['M5', { id: 'M5', name: 'M5', type: 'metro', color: '#6E3AA7' }],
      
      // Tram principali
      ['1', { id: '1', name: '1', type: 'tram', color: '#FFD700' }],
      ['2', { id: '2', name: '2', type: 'tram', color: '#FFD700' }],
      ['3', { id: '3', name: '3', type: 'tram', color: '#FFD700' }],
      ['4', { id: '4', name: '4', type: 'tram', color: '#FFD700' }],
      ['5', { id: '5', name: '5', type: 'tram', color: '#FFD700' }],
      ['9', { id: '9', name: '9', type: 'tram', color: '#FFD700' }],
      ['10', { id: '10', name: '10', type: 'tram', color: '#FFD700' }],
      ['12', { id: '12', name: '12', type: 'tram', color: '#FFD700' }],
      ['14', { id: '14', name: '14', type: 'tram', color: '#FFD700' }],
      ['15', { id: '15', name: '15', type: 'tram', color: '#FFD700' }],
      ['16', { id: '16', name: '16', type: 'tram', color: '#FFD700' }],
      ['19', { id: '19', name: '19', type: 'tram', color: '#FFD700' }],
      
      // Bus principali
      ['50', { id: '50', name: '50', type: 'bus', color: '#007ACC' }],
      ['54', { id: '54', name: '54', type: 'bus', color: '#007ACC' }],
      ['57', { id: '57', name: '57', type: 'bus', color: '#007ACC' }],
      ['60', { id: '60', name: '60', type: 'bus', color: '#007ACC' }],
      ['61', { id: '61', name: '61', type: 'bus', color: '#007ACC' }],
      ['73', { id: '73', name: '73', type: 'bus', color: '#007ACC' }],
      ['90', { id: '90', name: '90', type: 'bus', color: '#007ACC' }],
      ['91', { id: '91', name: '91', type: 'bus', color: '#007ACC' }],
      ['94', { id: '94', name: '94', type: 'bus', color: '#007ACC' }],
    ]);
  }

  /**
   * Database orari semplificato (basato su frequenze reali ATM)
   */
  getATMSchedules() {
    const schedules = new Map();
    
    // Tram 1 (Duomo - Greco)
    schedules.set('1', {
      trips: this.generateTripsForRoute('1', [
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_cordusio', lat: 45.4655, lon: 9.1845, name: 'Cordusio' },
        { id: 'stop_cairoli', lat: 45.4685, lon: 9.1850, name: 'Cairoli' },
        { id: 'stop_moscova', lat: 45.4730, lon: 9.1870, name: 'Moscova' },
        { id: 'stop_centrale', lat: 45.4867, lon: 9.2040, name: 'Stazione Centrale' },
        { id: 'stop_greco', lat: 45.5012, lon: 9.2156, name: 'Greco' },
      ], 7, 'Greco'),
    });
    
    // Tram 2 (Bausan - Piola)
    schedules.set('2', {
      trips: this.generateTripsForRoute('2', [
        { id: 'stop_bausan', lat: 45.4520, lon: 9.1680, name: 'Bausan' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_repubblica', lat: 45.4810, lon: 9.1990, name: 'Repubblica' },
        { id: 'stop_lanza', lat: 45.4730, lon: 9.1870, name: 'Lanza' },
        { id: 'stop_piola', lat: 45.4785, lon: 9.2358, name: 'Piola' },
      ], 8, 'Piola'),
    });
    
    // Tram 3 (Gratosoglio - Affori)
    schedules.set('3', {
      trips: this.generateTripsForRoute('3', [
        { id: 'stop_gratosoglio', lat: 45.4245, lon: 9.1456, name: 'Gratosoglio' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_repubblica', lat: 45.4810, lon: 9.1990, name: 'Repubblica' },
        { id: 'stop_affori', lat: 45.5125, lon: 9.1868, name: 'Affori' },
      ], 9, 'Affori'),
    });
    
    // Tram 4 (Niguarda - Foro Bonaparte)
    schedules.set('4', {
      trips: this.generateTripsForRoute('4', [
        { id: 'stop_niguarda', lat: 45.5186, lon: 9.1867, name: 'Niguarda' },
        { id: 'stop_monumentale', lat: 45.4856, lon: 9.1806, name: 'Monumentale' },
        { id: 'stop_cairoli', lat: 45.4685, lon: 9.1850, name: 'Cairoli' },
        { id: 'stop_foro', lat: 45.4725, lon: 9.1820, name: 'Foro Bonaparte' },
      ], 10, 'Foro Bonaparte'),
    });
    
    // Tram 5 (Cimitero Maggiore - Piazza Cimitero Maggiore)
    schedules.set('5', {
      trips: this.generateTripsForRoute('5', [
        { id: 'stop_cimitero', lat: 45.4985, lon: 9.1625, name: 'Cimitero Maggiore' },
        { id: 'stop_cadorna', lat: 45.4690, lon: 9.1740, name: 'Cadorna' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_porta_venezia', lat: 45.4750, lon: 9.2050, name: 'Porta Venezia' },
      ], 8, 'Porta Venezia'),
    });
    
    // Tram 9 (Stazione Centrale - Porta Genova)
    schedules.set('9', {
      trips: this.generateTripsForRoute('9', [
        { id: 'stop_centrale', lat: 45.4867, lon: 9.2040, name: 'Stazione Centrale' },
        { id: 'stop_repubblica', lat: 45.4810, lon: 9.1990, name: 'Repubblica' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_genova', lat: 45.4535, lon: 9.1685, name: 'Porta Genova' },
      ], 7, 'Porta Genova'),
    });
    
    // Tram 10 (Piazza Castello - Segesta)
    schedules.set('10', {
      trips: this.generateTripsForRoute('10', [
        { id: 'stop_castello', lat: 45.4701, lon: 9.1795, name: 'Piazza Castello' },
        { id: 'stop_cairoli', lat: 45.4685, lon: 9.1850, name: 'Cairoli' },
        { id: 'stop_lanza', lat: 45.4730, lon: 9.1870, name: 'Lanza' },
        { id: 'stop_segesta', lat: 45.4820, lon: 9.1480, name: 'Segesta' },
      ], 9, 'Segesta'),
    });
    
    // Tram 12 (Roserio - Piazza Fontana)
    schedules.set('12', {
      trips: this.generateTripsForRoute('12', [
        { id: 'stop_roserio', lat: 45.5245, lon: 9.1780, name: 'Roserio' },
        { id: 'stop_monumentale', lat: 45.4856, lon: 9.1806, name: 'Monumentale' },
        { id: 'stop_moscova', lat: 45.4730, lon: 9.1870, name: 'Moscova' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
      ], 8, 'Piazza Fontana'),
    });
    
    // Tram 14 (Cimitero Maggiore - Piazza Bausan)
    schedules.set('14', {
      trips: this.generateTripsForRoute('14', [
        { id: 'stop_cimitero', lat: 45.4985, lon: 9.1625, name: 'Cimitero Maggiore' },
        { id: 'stop_cadorna', lat: 45.4690, lon: 9.1740, name: 'Cadorna' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_bausan', lat: 45.4520, lon: 9.1680, name: 'Bausan' },
      ], 10, 'Bausan'),
    });
    
    // Tram 15 (Roserio - Piazza Fontana)
    schedules.set('15', {
      trips: this.generateTripsForRoute('15', [
        { id: 'stop_roserio', lat: 45.5245, lon: 9.1780, name: 'Roserio' },
        { id: 'stop_portello', lat: 45.4820, lon: 9.1480, name: 'Portello' },
        { id: 'stop_cadorna', lat: 45.4690, lon: 9.1740, name: 'Cadorna' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
      ], 9, 'Piazza Fontana'),
    });
    
    // Bus 54 (Precotto - Romolo)
    schedules.set('54', {
      trips: this.generateTripsForRoute('54', [
        { id: 'stop_precotto', lat: 45.5156, lon: 9.2378, name: 'Precotto M1' },
        { id: 'stop_centrale', lat: 45.4867, lon: 9.2040, name: 'Stazione Centrale' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_sant_ambrogio', lat: 45.4625, lon: 9.1745, name: 'Sant Ambrogio' },
        { id: 'stop_romolo', lat: 45.4456, lon: 9.1678, name: 'Romolo M2' },
      ], 10, 'Romolo'),
    });
    
    // Bus 60 (Roserio - Loreto)
    schedules.set('60', {
      trips: this.generateTripsForRoute('60', [
        { id: 'stop_roserio', lat: 45.5245, lon: 9.1780, name: 'Roserio' },
        { id: 'stop_monumentale', lat: 45.4856, lon: 9.1806, name: 'Monumentale' },
        { id: 'stop_repubblica', lat: 45.4810, lon: 9.1990, name: 'Repubblica' },
        { id: 'stop_loreto', lat: 45.4787, lon: 9.2187, name: 'Loreto' },
      ], 12, 'Loreto'),
    });
    
    // Bus 61 (Lambrate - Bisceglie)
    schedules.set('61', {
      trips: this.generateTripsForRoute('61', [
        { id: 'stop_lambrate', lat: 45.4865, lon: 9.2467, name: 'Lambrate' },
        { id: 'stop_centrale', lat: 45.4867, lon: 9.2040, name: 'Stazione Centrale' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_bisceglie', lat: 45.4675, lon: 9.1245, name: 'Bisceglie M1' },
      ], 11, 'Bisceglie'),
    });
    
    // Bus 90 (Linate - San Babila)
    schedules.set('90', {
      trips: this.generateTripsForRoute('90', [
        { id: 'stop_linate', lat: 45.4456, lon: 9.2756, name: 'Linate Aeroporto' },
        { id: 'stop_forlanini', lat: 45.4598, lon: 9.2556, name: 'Forlanini' },
        { id: 'stop_san_babila', lat: 45.4620, lon: 9.1970, name: 'San Babila M1' },
      ], 15, 'San Babila'),
    });
    
    // Bus 91 (Lampugnano - Piazzale Segesta)
    schedules.set('91', {
      trips: this.generateTripsForRoute('91', [
        { id: 'stop_lampugnano', lat: 45.5023, lon: 9.1267, name: 'Lampugnano M1' },
        { id: 'stop_portello', lat: 45.4820, lon: 9.1480, name: 'Portello' },
        { id: 'stop_segesta', lat: 45.4820, lon: 9.1480, name: 'Segesta M5' },
      ], 13, 'Segesta'),
    });
    
    // Bus 94 (Famagosta - Crocetta)
    schedules.set('94', {
      trips: this.generateTripsForRoute('94', [
        { id: 'stop_famagosta', lat: 45.4378, lon: 9.1567, name: 'Famagosta M2' },
        { id: 'stop_genova', lat: 45.4535, lon: 9.1685, name: 'Porta Genova' },
        { id: 'stop_duomo', lat: 45.4642, lon: 9.1900, name: 'Duomo' },
        { id: 'stop_crocetta', lat: 45.4598, lon: 9.2045, name: 'Crocetta M3' },
      ], 10, 'Crocetta'),
    });
    
    return schedules;
  }

  /**
   * Genera corse per una linea basandosi su frequenza
   */
  generateTripsForRoute(routeId, stops, frequencyMinutes, headsign) {
    const trips = [];
    const serviceHours = { start: 5 * 60, end: 24 * 60 }; // 5:00 - 24:00
    
    // Tempo medio tra fermate (varia per tipo)
    const avgStopTime = stops.length > 4 ? 2.5 : 2; // Più fermate = più tempo
    
    // Genera corse in entrambe le direzioni
    const directions = ['outbound', 'inbound'];
    
    directions.forEach(direction => {
      // Genera corse a intervalli regolari
      for (let startTime = serviceHours.start; startTime < serviceHours.end; startTime += frequencyMinutes) {
        const stopsSequence = direction === 'inbound' ? [...stops].reverse() : stops;
        
        const stopTimes = stopsSequence.map((stop, idx) => ({
          ...stop,
          time: startTime + (idx * avgStopTime),
        }));
        
        trips.push({
          id: `${routeId}-${direction}-${trips.length}`,
          headsign: direction === 'inbound' ? stopsSequence[0].name : headsign,
          serviceType: 'weekday',
          direction,
          stopTimes,
        });
      }
    });
    
    return trips;
  }
}

export default new GTFSSimulator();
