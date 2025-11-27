# Ghe Sem - Web App Trasporto Pubblico Milano

🚊 **Versione Pro 2.0** - Clone completo di Yandex Transport per Milano con design cyberpunk/minimal unico.

## ✨ Features Complete (stile Yandex Transport)

### 🗺️ Mappa Real-Time Avanzata
- **Tracking veicoli live**: 30-50 veicoli (tram/bus) in movimento real-time
- **Seguire veicolo**: Doppio click per tracciare un veicolo specifico
- **Geolocalizzazione GPS**: Posizione utente con precisione e aggiornamento continuo
- **Fermate intelligenti**: Distanza in metri, arrivi real-time, favoriti
- **Layer personalizzabili**: Toggle fermate/veicoli, filtri per tipo trasporto
- **Percorsi visuali**: Linee colorate per routing A→B sulla mappa

### 🛣️ Route Planner Completo
- **Calcolo percorsi**: Da A a B con 3 alternative
  - ⚡ **Più veloce**: Minimizza tempo totale
  - ⚖️ **Bilanciato**: Ottimizza tempo + cambi + camminata
  - 🎯 **Meno cambi**: Percorsi diretti
- **Dettagli step-by-step**: Walking + Transit con orari precisi
- **Info ambientali**: Emissioni CO₂, calorie bruciate
- **Prezzo biglietto**: Costo totale percorso
- **Cronologia**: Ultimi 20 percorsi effettuati
- **Swap punti**: Inverti origine/destinazione con un click

### 🚌 Dati Trasporto Real-Time
- **Arrivi previsti**: Tempi attesa con indicatore live (punto verde pulsante)
- **Info veicoli dettagliate**:
  - Linea, destinazione, velocità km/h
  - Affollamento real-time (🟢🟡🟠🔴)
  - Heading/direzione movimento
  - Tracking percorso completo
- **Prossime fermate**: Quando segui un veicolo, vedi le prossime 5 fermate con ETA
- **Alert servizio**: Scioperi, ritardi, interruzioni con livelli severità
- **Multi-modalità**: Metro (🔴), Tram (🟡), Bus (🔵)

### 🎛️ Sidebar Completa (4 Tabs)
1. **📍 Percorsi**
   - Input origine/destinazione
   - Usa posizione corrente
   - 3 modalità routing
   - Risultati con dettagli completi
   
2. **🚏 Linee**
   - Lista completa linee ATM (24 linee)
   - Ricerca per nome/numero
   - Filtri per tipo (Metro/Tram/Bus)
   - Selezione multipla per visualizzazione mappa
   
3. **⭐ Preferiti**
   - Fermate salvate
   - Percorsi frequenti
   - Accesso rapido
   
4. **⚙️ Impostazioni**
   - Filtri mappa (Metro/Tram/Bus)
   - Notifiche browser
   - Info app

### 🎯 Vehicle Tracking (come Yandex!)
- **Doppio click** su veicolo per seguirlo
- **Pannello tracking** con:
  - Info veicolo real-time
  - Velocità e affollamento
  - **Lista prossime fermate** con ETA
  - Percorso visualizzato sulla mappa
- **Auto-follow**: Mappa segue il veicolo
- **Badge "Live"** con aggiornamenti continui

### 💫 UX Professionale
- **Sidebar slide-in** con 4 tabs
- **Bottom Sheet fluido**: Espandibile con gesture
- **Search intelligente**: Ricerca globale linee/fermate
- **Preferiti persistenti**: LocalStorage con sync
- **Cronologia completa**: Ricerche + Percorsi
- **Toast informativi**: Feedback per ogni azione
- **Notifiche browser**: Permission request + alerts
- **Keyboard shortcuts**: ESC per chiudere, etc.

### 🎨 Design System Cyberpunk Pro
- **Dark mode nativo**: CartoDB Dark Matter
- **Glassmorphism avanzato**: backdrop-blur-md su tutti i pannelli
- **Colori Milano semantici**:
  - 🟡 Giallo (#FFD700) - Tram + UI primario
  - 🔴 Rosso (#E30613) - Metro + Alert
  - 🔵 Blu (#007ACC) - Bus
  - ⚫ Cyber Dark - Backgrounds
- **Animazioni fluide**: 
  - ping (veicoli)
  - pulse (alert)
  - slide-in (sidebar/sheets)
  - fade-in (overlay)
  - bounce (toast)
- **Gradient borders**: Su elementi selezionati
- **Shadow effects**: cyber glow per CTA

## 🏗️ Architettura

```
src/
├── components/              # Componenti React modulari
│   ├── Header.jsx          # Top bar con menu e ricerca
│   ├── Sidebar.jsx         # Sidebar con 4 tabs
│   ├── RoutePlanner.jsx    # Calcolo percorsi A→B
│   ├── LinesView.jsx       # Vista linee con filtri
│   ├── FavoritesView.jsx   # Preferiti e cronologia
│   ├── MapView.jsx         # Mappa Leaflet multi-layer
│   ├── VehicleTracker.jsx  # Tracking veicolo in corso
│   ├── BottomSheet.jsx     # Pannello fermate espandibile
│   ├── ServiceAlerts.jsx   # Alert scioperi/interruzioni
│   └── VehicleToast.jsx    # Info veicolo selezionato
├── services/               # Business logic
│   ├── transportAPI.js     # API client dati ATM
│   └── routingService.js   # Calcolo percorsi e routing
├── store/                  # State management
│   └── useStore.js         # Zustand store globale
├── App.jsx                 # Root component
└── main.jsx                # Entry point
```

## 🚀 Quick Start

```bash
# Installa dipendenze
npm install

# Avvia dev server
npm run dev

# Build per produzione
npm run build
```

Apri `http://localhost:5173` nel browser.

### 🌐 Attiva Dati Reali (Opzionale)

**Di default l'app usa dati mock** - funziona subito senza configurazione!

**Per usare API reali:**

```bash
# Opzione 1: Open Data Milano (GRATIS)
./test-api.sh                    # Testa API
# Poi cambia USE_MOCK_DATA: false in src/services/transportAPI.js

# Opzione 2: ATM Developer API (con key)
cp .env.example .env            # Configura API key
# Poi cambia USE_MOCK_DATA: false
```

📖 **Guida dettagliata:** [REAL_API_GUIDE.md](./REAL_API_GUIDE.md)

## 🛠️ Tech Stack

### Core
- **React 18** - UI framework con hooks
- **Vite** - Build tool ultra-veloce
- **Tailwind CSS** - Utility-first CSS con design system custom

### State & Data
- **Zustand** - State management leggero (routing, tracking, filtri, preferiti)
- **Axios** - HTTP client per API calls
- **date-fns** - Manipolazione date e relative time

### Mappa
- **Leaflet** - Libreria mappe open-source
- **React-Leaflet** - Binding React per Leaflet
- **CartoDB Dark Matter** - Tile layer dark mode

### Icons & Utils
- **Lucide React** - Icon library moderna
- **LocalStorage** - Persistenza preferiti/cronologia

## 📱 Features Avanzate Yandex-Style

### 🎯 Route Planning
```javascript
// 3 algoritmi di routing
- Fastest: Minimizza tempo totale
- Balanced: Ottimizza tempo + cambi + walking
- Least Transfers: Massimo comfort, meno stress

// Output per ogni route:
- Duration (minuti)
- Transfers (numero cambi)
- Walking distance (metri)
- Price (€)
- CO₂ emissions (grammi)
- Calories burned (kcal)
- Step-by-step instructions
```

### 🚃 Vehicle Tracking
```javascript
// Doppio click su veicolo attiva:
- Real-time position updates
- Route visualization (polyline)
- Upcoming stops list (5 fermate)
- Live speed & occupancy
- Auto-center map on vehicle
```

### 🔔 Notifiche & Alerts
```javascript
// Sistema notifiche browser:
- Permission request automatico
- Toast per eventi importanti
- Badge counter su sidebar
- Alert prioritizzati per severità
  • HIGH: Scioperi (rosso, pulse)
  • MEDIUM: Ritardi (arancio)
  • LOW: Info (blu)
```

### ⭐ Preferiti & Cronologia
```javascript
// LocalStorage persistence:
- Favorite stops (stelle)
- Recent routes (ultimi 20)
- Recent searches (ultime 10)
- Settings & filters

// Quick access:
- Tab dedicato in sidebar
- One-tap per riutilizzo
- Swipe to delete
```

## 🎯 Confronto con Yandex Transport

| Feature | Yandex Transport | Ghe Sem | Status |
|---------|-----------------|---------|--------|
| Mappa real-time | ✅ | ✅ | Completo |
| Tracking veicoli | ✅ | ✅ | Completo |
| Route planner A→B | ✅ | ✅ | 3 algoritmi |
| Alternative routes | ✅ | ✅ | 3 percorsi |
| Prossime fermate | ✅ | ✅ | Top 5 |
| Affollamento live | ✅ | ✅ | 5 livelli |
| Preferiti | ✅ | ✅ | Stops + Routes |
| Notifiche | ✅ | ✅ | Browser API |
| Cronologia | ✅ | ✅ | 20 percorsi |
| Filtri linee | ✅ | ✅ | Multi-select |
| Dark mode | ✅ | ✅ | Cyberpunk! |
| Offline mode | ✅ | 🚧 | Roadmap |
| Street View | ✅ | 🚧 | Roadmap |

## 🚀 Quick Actions (Shortcuts)

```
Click su fermata → Vedi arrivi
Doppio click su veicolo → Segui veicolo
Click menu → Apri sidebar
ESC → Chiudi sidebar/sheets
Cerca → Header search
Stella → Aggiungi preferito
Refresh → Aggiorna arrivi fermata
Swap → Inverti origine/destinazione
```

## 🔧 Configurazione

### 🌐 API Reali ATM Milano

L'app supporta 3 modalità di dati:

#### 1️⃣ **Dati Mock** (Default - Attivo)
- ✅ Nessuna configurazione richiesta
- ✅ Funziona offline
- ✅ 30-50 veicoli simulati real-time
- ✅ Arrivi realistici con ritardi
- 📍 Perfetto per sviluppo e demo

#### 2️⃣ **Open Data Milano** (GRATUITO)
```bash
# 1. Apri src/services/transportAPI.js
# 2. Cambia: USE_MOCK_DATA: false
# 3. npm run dev
```

**API utilizzate:**
- 🔗 [dati.comune.milano.it](https://dati.comune.milano.it/dataset/gtfs-real-time)
- 📦 Dataset: `gtfs_rt_vehicle_position`, `gtfs_rt_trip_update`
- ✅ Nessuna registrazione
- ⚠️ Rate limiting applicato

#### 3️⃣ **ATM Developer API** (Con API Key)
```bash
# 1. Registrati su https://developer.atm.it
# 2. Richiedi API Key GTFS Realtime
# 3. Crea file .env:
cp .env.example .env

# 4. Inserisci la tua key:
VITE_ATM_API_KEY=tua_key_qui

# 5. Cambia USE_MOCK_DATA: false in transportAPI.js
# 6. npm run dev
```

**Vantaggi:**
- ⚡ Aggiornamenti più frequenti
- 🎯 Dati più accurati
- 📊 Più veicoli tracciati

### Implementazione API Reali

Il sistema ha **fallback automatico**:
```
API Reale → Errore? → Mock Data (sempre funzionante)
```

File coinvolti:
- `src/services/transportAPI.js` - API wrapper principale
- `src/services/realAPI.js` - Implementazioni API reali
- `.env.example` - Template configurazione

### Variabili Ambiente
Crea `.env`:
```env
# ATM API Key (opzionale)
VITE_ATM_API_KEY=your_api_key_here
```

### Tailwind Custom Colors
```js
'milano-yellow': '#FFD700',  // Tram
'milano-red': '#E30613',     // Metro
'cyber-dark': '#0a0a0f',     // Background
'cyber-slate': '#1a1a2e',    // Panels
```

## 📝 Note di Sviluppo

### Mock Data
I dati simulati includono:
- **8 fermate** principali centro Milano (Duomo, Cordusio, Cairoli, etc.)
- **30-50 veicoli** random su mappa (tram/bus, no metro)
- **Arrivi realistici** con ritardi casuali (-1/+2 min)
- **Alert probabilistici** (30% sciopero, 50% ritardi)

### Performance
- Aggiornamento veicoli: ogni 10 secondi
- Refresh arrivi: manuale o automatico su selezione fermata
- Debounce search: 300ms
- Lazy loading componenti pesanti

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 Licenza

Progetto educativo - **MIT License**

---

**Made with ❤️ for Milano** 🚊  
*"Ghe Sem" = "Ci siamo" in dialetto milanese*