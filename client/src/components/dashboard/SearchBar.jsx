import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Navigation } from 'lucide-react';
import { searchLocations } from '../../services/api';

const POPULAR_CITIES = ['Kolkata', 'Tokyo', 'London', 'New York', 'Paris', 'Delhi'];

export default function SearchBar({ onSearchCity, onSearchCoords, isSearching }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        setSuggestions(results || []);
        setIsOpen((results && results.length > 0) || false);
      } catch (err) {
        console.warn('Geocoding autocomplete failed:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    onSearchCity(query.trim());
  };

  const handleSelectSuggestion = (loc) => {
    setQuery(loc.name);
    setIsOpen(false);
    onSearchCoords(loc.latitude, loc.longitude, loc.name);
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSearchCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Could not retrieve your GPS location. Please check your permissions.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <section className="relative z-30">
      <div className="bg-[#111724] border border-white/[0.07] rounded-xl p-3 sm:p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1" ref={dropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setIsOpen(true)}
              placeholder="Search city or location (e.g. Kolkata, Tokyo, London)..."
              autoComplete="off"
              className="w-full pl-9 pr-9 py-2.5 bg-[#172032] border border-white/[0.08] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 transition-all text-sm"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setIsOpen(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Autocomplete dropdown suggestions */}
            {isOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#172032] border border-white/[0.1] rounded-lg shadow-2xl overflow-hidden z-50 divide-y divide-white/[0.05] max-h-56 overflow-y-auto">
                {suggestions.map((loc, idx) => (
                  <button
                    key={`${loc.latitude}-${loc.longitude}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(loc)}
                    className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-[#1E2A40] transition-colors flex items-center justify-between text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-medium text-white">{loc.name}</span>
                      <span className="text-slate-400">
                        {loc.state ? `${loc.state}, ` : ''}{loc.country}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {Math.abs(loc.latitude).toFixed(2)}°, {Math.abs(loc.longitude).toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSearching}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-[#090D14] font-medium rounded-lg transition-colors active:scale-[0.98] flex items-center justify-center gap-1.5 text-sm cursor-pointer shadow-sm"
            >
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>

            <button
              type="button"
              onClick={handleGeoLocation}
              title="Use my current GPS location"
              className="px-3.5 py-2.5 bg-[#172032] hover:bg-[#1E2A40] text-slate-200 rounded-lg border border-white/[0.08] transition-colors active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline text-xs font-normal">Location</span>
            </button>
          </div>
        </form>

        {/* Popular Quick Select Chips */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
          <span className="text-slate-400 text-[11px]">Popular:</span>
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setQuery(city);
                onSearchCity(city);
              }}
              className="px-2 py-0.5 rounded-md bg-[#172032] border border-white/[0.06] text-slate-300 text-xs hover:border-sky-500/40 hover:text-sky-300 transition-colors cursor-pointer"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
