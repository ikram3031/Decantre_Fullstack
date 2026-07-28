import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { fetchProducts } from '../lib/api';
import { ShoppingCart } from 'lucide-react';

export const SearchDropdown = ({ query, onSelect, maxResults = 6, placeholder = 'Search...' }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const controllerRef = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (!query || String(query).trim().length === 0) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const q = String(query).trim();
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        // Use fetchProducts helper with q param
        const items = await fetchProducts({ q, limit: maxResults });
        if (!mounted.current || isCancelled) return;
        setResults(items.slice(0, maxResults));
      } catch (err) {
        if (!mounted.current || isCancelled) return;
        setError('Failed to load results');
        setResults([]);
      } finally {
        if (!mounted.current || isCancelled) return;
        setLoading(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [query, maxResults]);

  if ((!query || !query.trim()) && results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-30 border border-gold/20 bg-black/95 backdrop-blur rounded-sm shadow-2xl overflow-hidden">
      <div className="px-2 py-1">
        {loading && (
          <div className="text-xs text-zinc-400 py-2">Searching...</div>
        )}
        {error && (
          <div className="text-xs text-rose-400 py-2">{error}</div>
        )}
        {!loading && results.length === 0 && !error && (
          <div className="text-xs text-zinc-400 py-2">No results</div>
        )}
      </div>

      <ul className="divide-y divide-white/5 max-h-72 overflow-y-auto">
        {results.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect && onSelect({ id: item.id, name: item.name, slug: item.slug })}
              className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gold/5 transition-colors"
            >
              <img src={item.image || ''} alt={item.name} className="w-10 h-10 object-cover rounded-sm bg-zinc-900" />
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-100 truncate">{item.name}</div>
                <div className="text-[11px] text-zinc-400 truncate">{item.brand || item.category || ''}</div>
              </div>
              <div className="text-xs text-zinc-300">{item.price ? item.price : ''}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchDropdown;
