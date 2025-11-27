# Guida Integrazione API Reali - Ghe Sem

## 🎯 Opzioni Disponibili

### Opzione 1: Open Data Milano (GRATUITA) ⭐ Consigliata
**Nessuna registrazione richiesta!**

**Cosa offre:**
- Posizioni veicoli real-time (GTFS-RT Vehicle Positions)
- Aggiornamenti viaggi (GTFS-RT Trip Updates)  
- Tutti i mezzi ATM (Metro, Tram, Bus)
- Aggiornamenti ogni 30-60 secondi

**Come attivarla:**

1. Apri `src/services/transportAPI.js`
2. Trova la riga 17:
   ```javascript
   USE_MOCK_DATA: true,
   ```
3. Cambia in:
   ```javascript
   USE_MOCK_DATA: false,
   ```
4. Salva e riavvia: `npm run dev`

**Endpoint utilizzati:**
```
https://dati.comune.milano.it/api/3/action/datastore_search
  ?resource_id=gtfs_rt_vehicle_position
  ?resource_id=gtfs_rt_trip_update
```

**Limiti:**
- Rate limiting: ~100 richieste/ora
- Ritardo dati: 30-120 secondi
- Nessun supporto garantito

---

### Opzione 2: ATM Developer API (Con Registrazione)

**Cosa offre:**
- Dati più frequenti (ogni 10-20s)
- Migliore affidabilità
- Supporto ufficiale
- Più dettagli sui veicoli

**Come attivarla:**

1. **Registrati:**
   - Vai su [developer.atm.it](https://developer.atm.it) (o portale equivalente)
   - Crea account sviluppatore
   - Richiedi accesso API GTFS Realtime

2. **Ottieni credenziali:**
   - API Key
   - Client ID/Secret (se richiesto)

3. **Configura app:**
   ```bash
   # Copia template
   cp .env.example .env
   
   # Modifica .env
   nano .env
   ```
   
   Inserisci:
   ```env
   VITE_ATM_API_KEY=la_tua_chiave_api_qui
   ```

4. **Attiva API reali:**
   - Apri `src/services/transportAPI.js`
   - Cambia `USE_MOCK_DATA: false`
   - Riavvia: `npm run dev`

**Note:**
- L'API ATM potrebbe richiedere autenticazione OAuth
- Potrebbe essere a pagamento o con quote
- Verifica documentazione ufficiale per dettagli endpoint

---

### Opzione 3: Dati Mock (Default)

**Attivo di default** - nessuna configurazione necessaria.

**Cosa simula:**
- 30-50 veicoli in movimento su Milano
- 8 fermate principali centro città
- Arrivi con ritardi realistici (-1 a +5 minuti)
- 24 linee (M1/M2/M3/M5 + tram + bus)
- Affollamento variabile
- Alert casuali (scioperi, ritardi)

**Vantaggi:**
- ✅ Zero configurazione
- ✅ Funziona offline
- ✅ Dati sempre disponibili
- ✅ Perfetto per demo e sviluppo

---

## 🧪 Test API Reali

### Test manuale Open Data Milano

```bash
# Test Vehicle Positions
curl "https://dati.comune.milano.it/api/3/action/datastore_search?resource_id=gtfs_rt_vehicle_position&limit=5"

# Test Trip Updates
curl "https://dati.comune.milano.it/api/3/action/datastore_search?resource_id=gtfs_rt_trip_update&limit=5"
```

Risposta attesa:
```json
{
  "success": true,
  "result": {
    "records": [
      {
        "vehicle_id": "...",
        "route_id": "M1",
        "latitude": 45.464,
        "longitude": 9.189,
        "bearing": 90,
        "speed": 25,
        ...
      }
    ]
  }
}
```

### Verifica integrazione nell'app

1. **Attiva dati reali** (cambia `USE_MOCK_DATA: false`)

2. **Apri console browser** (F12)

3. **Cerca log:**
   ```
   ✅ OK: "Loaded 45 vehicles from Open Data API"
   ❌ ERROR: "Error fetching... falling back to mock"
   ```

4. **Testa funzionalità:**
   - Apri mappa → Vedi veicoli reali
   - Click fermata → Vedi arrivi reali
   - Controlla timestamp aggiornamenti

---

## 🔧 Troubleshooting

### Errore CORS
```
Access to fetch at 'https://dati.comune.milano.it' has been blocked by CORS
```

**Soluzione:**
- Le API Open Data dovrebbero supportare CORS
- Se il problema persiste, usa un proxy CORS per sviluppo
- In produzione, configura proxy server-side

### Nessun dato disponibile
```
Error fetching vehicle positions: 404 Not Found
```

**Possibili cause:**
- Dataset temporaneamente offline
- Nome risorsa cambiato
- Rate limit superato

**Soluzione:**
- Verifica su [dati.comune.milano.it](https://dati.comune.milano.it)
- Controlla nome dataset aggiornato
- Attendi qualche minuto (rate limit)
- Usa fallback mock (automatico)

### API Key non funziona (ATM)
```
Error 401 Unauthorized
```

**Verifica:**
- API Key corretta in `.env`
- Formato: `VITE_ATM_API_KEY=abc123`
- Riavvia dev server dopo modifica `.env`
- Controlla validità key sul portale ATM

---

## 📊 Formato Dati

### GTFS Realtime - Vehicle Position
```javascript
{
  vehicle_id: "1234",
  route_id: "M1",
  route_short_name: "M1",
  route_type: 1, // 0=tram, 1=metro, 3=bus
  trip_headsign: "Sesto FS",
  latitude: 45.4642,
  longitude: 9.1900,
  bearing: 180, // 0-360 gradi
  speed: 35, // km/h
  timestamp: 1732723200,
  occupancy_status: 2 // 0=empty, 5=full
}
```

### App Format (trasformato da realAPI.js)
```javascript
{
  id: "M1-1234",
  lineId: "M1",
  lineName: "M1",
  lineType: "metro",
  lineColor: "#E30613",
  lat: 45.4642,
  lon: 9.1900,
  heading: 180,
  speed: 35,
  destination: "Sesto FS",
  lastUpdate: Date,
  occupancy: "FEW_SEATS"
}
```

La trasformazione avviene in `src/services/realAPI.js` → metodo `getVehiclePositionsFromOpenData()`

---

## 🚀 Prossimi Passi

1. **Test con dati mock** (default)
2. **Prova Open Data gratuita** (cambia flag)
3. **Se serve maggiore affidabilità** → Richiedi ATM API Key
4. **Deploy produzione** → Configura variabili ambiente su Vercel/Netlify

---

## 📚 Risorse Utili

- **Open Data Milano:** https://dati.comune.milano.it
- **GTFS Specification:** https://gtfs.org/
- **GTFS Realtime:** https://gtfs.org/realtime/
- **ATM Milano:** https://www.atm.it
- **Muoversi a Milano:** https://muoversi.milano.it

---

**Buon coding! 🚊**
