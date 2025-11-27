// Vista Linee con filtri e ricerca
import React, { useState, useEffect } from 'react';
import { Search, Filter, TramFront, Bus, MapPin } from 'lucide-react';
import transportAPI from '../services/transportAPI';
import useStore from '../store/useStore';

const LinesView = () => {
  const { filters, toggleLineFilter, setFilters } = useStore();
  const [lines, setLines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLines, setFilteredLines] = useState([]);

  useEffect(() => {
    loadLines();
  }, []);

  useEffect(() => {
    filterLines();
  }, [searchQuery, lines, filters]);

  const loadLines = async () => {
    const allLines = transportAPI.getMockLines();
    setLines(allLines);
  };

  const filterLines = () => {
    let filtered = lines;

    // Filtra per tipo
    filtered = filtered.filter(line => {
      if (line.type === 'metro') return filters.showMetro;
      if (line.type === 'tram') return filters.showTram;
      if (line.type === 'bus') return filters.showBus;
      return true;
    });

    // Filtra per ricerca
    if (searchQuery) {
      filtered = filtered.filter(line =>
        line.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLines(filtered);
  };

  const groupedLines = {
    metro: filteredLines.filter(l => l.type === 'metro'),
    tram: filteredLines.filter(l => l.type === 'tram'),
    bus: filteredLines.filter(l => l.type === 'bus'),
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cerca linea..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-milano-yellow transition-colors"
        />
      </div>

      {/* Type Filters */}
      <div className="flex gap-2">
        <TypeFilterButton
          label="Metro"
          count={groupedLines.metro.length}
          active={filters.showMetro}
          onClick={() => setFilters({ showMetro: !filters.showMetro })}
          color="#E30613"
        />
        <TypeFilterButton
          label="Tram"
          count={groupedLines.tram.length}
          active={filters.showTram}
          onClick={() => setFilters({ showTram: !filters.showTram })}
          color="#FFD700"
        />
        <TypeFilterButton
          label="Bus"
          count={groupedLines.bus.length}
          active={filters.showBus}
          onClick={() => setFilters({ showBus: !filters.showBus })}
          color="#007ACC"
        />
      </div>

      {/* Lines List */}
      <div className="space-y-4">
        {filters.showMetro && groupedLines.metro.length > 0 && (
          <LineGroup title="Metro" lines={groupedLines.metro} icon="M" />
        )}
        {filters.showTram && groupedLines.tram.length > 0 && (
          <LineGroup title="Tram" lines={groupedLines.tram} icon="T" />
        )}
        {filters.showBus && groupedLines.bus.length > 0 && (
          <LineGroup title="Bus" lines={groupedLines.bus} icon="B" />
        )}
      </div>

      {filteredLines.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Nessuna linea trovata</p>
        </div>
      )}
    </div>
  );
};

// Type Filter Button
const TypeFilterButton = ({ label, count, active, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-lg transition-all ${
        active
          ? 'text-white font-bold'
          : 'bg-white/5 text-gray-400 hover:bg-white/10'
      }`}
      style={active ? { backgroundColor: color } : {}}
    >
      <div className="text-sm">{label}</div>
      <div className="text-xs opacity-75">{count}</div>
    </button>
  );
};

// Line Group
const LineGroup = ({ title, lines, icon }) => {
  return (
    <div>
      <h3 className="text-white font-bold mb-2 flex items-center gap-2">
        <span className="text-milano-yellow">{icon}</span>
        {title}
      </h3>
      <div className="space-y-2">
        {lines.map(line => (
          <LineCard key={line.id} line={line} />
        ))}
      </div>
    </div>
  );
};

// Line Card
const LineCard = ({ line }) => {
  const { filters, toggleLineFilter } = useStore();
  const isSelected = filters.selectedLines.includes(line.id);

  return (
    <div
      onClick={() => toggleLineFilter(line.id)}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-white/20 border-2'
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
      }`}
      style={isSelected ? { borderColor: line.color } : {}}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: line.color }}
        >
          {line.name}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{line.fullName}</p>
          <p className="text-xs text-gray-400 capitalize">{line.type}</p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-milano-yellow flex items-center justify-center">
            <span className="text-black text-xs">✓</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinesView;
