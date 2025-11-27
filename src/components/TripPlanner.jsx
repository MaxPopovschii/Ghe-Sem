// Trip Planner - Pianifica viaggi con promemoria (Yandex-style)
import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Star, 
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import useStore from '../store/useStore';

const TripPlanner = () => {
  const { 
    userLocation,
    addNotification,
    favorites,
    addFavorite
  } = useStore();

  const [plannedTrips, setPlannedTrips] = useState([]);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    reminderMinutes: 15,
    repeat: 'once', // 'once', 'daily', 'weekdays', 'weekends'
  });

  const handleSaveTrip = () => {
    const trip = {
      ...newTrip,
      id: Date.now(),
      createdAt: new Date(),
      active: true,
    };

    setPlannedTrips([...plannedTrips, trip]);
    
    // Programma notifica
    scheduleNotification(trip);
    
    // Reset form
    setNewTrip({
      name: '',
      from: '',
      to: '',
      date: new Date().toISOString().split('T')[0],
      time: '08:00',
      reminderMinutes: 15,
      repeat: 'once',
    });
    setShowNewTripForm(false);
  };

  const scheduleNotification = (trip) => {
    const tripDateTime = new Date(`${trip.date}T${trip.time}`);
    const reminderTime = new Date(tripDateTime.getTime() - trip.reminderMinutes * 60000);
    
    addNotification({
      id: `trip-${trip.id}`,
      title: `Promemoria: ${trip.name}`,
      message: `Tra ${trip.reminderMinutes} minuti: ${trip.from} → ${trip.to}`,
      type: 'info',
      timestamp: reminderTime,
    });
  };

  const deleteTrip = (tripId) => {
    setPlannedTrips(plannedTrips.filter(t => t.id !== tripId));
  };

  const repeatLabels = {
    once: 'Una volta',
    daily: 'Ogni giorno',
    weekdays: 'Giorni feriali',
    weekends: 'Weekend',
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Viaggi Programmati</h2>
          <p className="text-gray-400 text-xs">Pianifica i tuoi spostamenti</p>
        </div>
        <button
          onClick={() => setShowNewTripForm(!showNewTripForm)}
          className="p-2 rounded-lg bg-milano-yellow text-black hover:bg-yellow-400 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* New Trip Form */}
      {showNewTripForm && (
        <div className="glass-panel p-4 space-y-3 animate-in slide-in-from-top">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Calendar size={16} className="text-milano-yellow" />
            Nuovo Viaggio
          </h3>

          <input
            type="text"
            placeholder="Nome viaggio (es: Casa → Lavoro)"
            value={newTrip.name}
            onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-milano-yellow text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Da"
              value={newTrip.from}
              onChange={(e) => setNewTrip({ ...newTrip, from: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-milano-yellow text-sm"
            />
            <input
              type="text"
              placeholder="A"
              value={newTrip.to}
              onChange={(e) => setNewTrip({ ...newTrip, to: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-milano-yellow text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Data</label>
              <input
                type="date"
                value={newTrip.date}
                onChange={(e) => setNewTrip({ ...newTrip, date: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-milano-yellow"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Ora</label>
              <input
                type="time"
                value={newTrip.time}
                onChange={(e) => setNewTrip({ ...newTrip, time: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-milano-yellow"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Ricordamelo</label>
            <select
              value={newTrip.reminderMinutes}
              onChange={(e) => setNewTrip({ ...newTrip, reminderMinutes: parseInt(e.target.value) })}
              className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-milano-yellow"
            >
              <option value={5}>5 minuti prima</option>
              <option value={10}>10 minuti prima</option>
              <option value={15}>15 minuti prima</option>
              <option value={30}>30 minuti prima</option>
              <option value={60}>1 ora prima</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Ripeti</label>
            <select
              value={newTrip.repeat}
              onChange={(e) => setNewTrip({ ...newTrip, repeat: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-milano-yellow"
            >
              <option value="once">Una volta</option>
              <option value="daily">Ogni giorno</option>
              <option value="weekdays">Giorni feriali (Lun-Ven)</option>
              <option value="weekends">Weekend (Sab-Dom)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNewTripForm(false)}
              className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSaveTrip}
              disabled={!newTrip.name || !newTrip.from || !newTrip.to}
              className="flex-1 py-2 rounded-lg bg-milano-yellow hover:bg-yellow-400 text-black font-semibold text-sm transition-colors disabled:opacity-50"
            >
              Salva
            </button>
          </div>
        </div>
      )}

      {/* Planned Trips List */}
      <div className="space-y-2">
        {plannedTrips.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nessun viaggio programmato</p>
            <p className="text-gray-500 text-xs mt-1">Crea il tuo primo viaggio!</p>
          </div>
        ) : (
          plannedTrips.map((trip) => (
            <div key={trip.id} className="glass-panel p-3 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{trip.name}</h4>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {trip.from} → {trip.to}
                  </p>
                </div>
                <button
                  onClick={() => deleteTrip(trip.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(trip.date).toLocaleDateString('it-IT')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{trip.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bell size={12} />
                  <span>{trip.reminderMinutes} min prima</span>
                </div>
              </div>

              {trip.repeat !== 'once' && (
                <div className="mt-2 px-2 py-1 bg-milano-yellow/10 border border-milano-yellow/30 rounded text-xs text-milano-yellow inline-block">
                  🔄 {repeatLabels[trip.repeat]}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
