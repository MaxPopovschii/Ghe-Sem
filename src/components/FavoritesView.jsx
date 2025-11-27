// Vista Preferiti con fermate e percorsi salvati
import React from 'react';
import { Heart, MapPin, Route, Star, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import useStore from '../store/useStore';

const FavoritesView = () => {
  const { 
    favorites, 
    removeFavorite,
    recentRoutes,
    setSelectedStop,
    setRouteOrigin,
    setRouteDestination,
    setSidebarOpen,
  } = useStore();

  const favoriteStops = favorites.filter(f => f.type === 'stop');
  const favoriteLines = favorites.filter(f => f.type === 'line');

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    setSidebarOpen(false);
  };

  const handleRouteClick = (route) => {
    setRouteOrigin(route.from);
    setRouteDestination(route.to);
    setSidebarOpen(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Fermate Preferite */}
      {favoriteStops.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Star className="text-milano-yellow" size={20} />
            Fermate Preferite
          </h3>
          <div className="space-y-2">
            {favoriteStops.map(stop => (
              <FavoriteStopCard
                key={stop.id}
                stop={stop}
                onClick={() => handleStopClick(stop)}
                onRemove={() => removeFavorite(stop.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Percorsi Recenti */}
      {recentRoutes.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Clock className="text-milano-yellow" size={20} />
            Percorsi Recenti
          </h3>
          <div className="space-y-2">
            {recentRoutes.slice(0, 10).map((route, idx) => (
              <RecentRouteCard
                key={idx}
                route={route}
                onClick={() => handleRouteClick(route)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {favoriteStops.length === 0 && recentRoutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center">
          <Heart size={48} className="mb-3 opacity-50" />
          <p className="text-white font-semibold mb-1">Nessun preferito</p>
          <p className="text-sm">
            Aggiungi fermate e percorsi ai preferiti per accedervi rapidamente
          </p>
        </div>
      )}
    </div>
  );
};

// Favorite Stop Card
const FavoriteStopCard = ({ stop, onClick, onRemove }) => {
  return (
    <div
      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div
          onClick={onClick}
          className="flex-1 cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-milano-yellow" />
            <h4 className="text-white font-semibold">{stop.name}</h4>
          </div>
          {stop.lines && stop.lines.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {stop.lines.slice(0, 5).map((line, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white/10 text-white text-xs rounded"
                >
                  {line}
                </span>
              ))}
              {stop.lines.length > 5 && (
                <span className="px-2 py-0.5 text-gray-400 text-xs">
                  +{stop.lines.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Trash2 size={16} className="text-gray-400 hover:text-milano-red" />
        </button>
      </div>
    </div>
  );
};

// Recent Route Card
const RecentRouteCard = ({ route, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <Route size={20} className="text-milano-yellow flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-400 text-sm">●</span>
            <span className="text-white text-sm truncate">{route.from.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-milano-red text-sm">●</span>
            <span className="text-white text-sm truncate">{route.to.name}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(route.timestamp), { addSuffix: true, locale: it })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FavoritesView;
