'use client';

import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { X, Search, ArrowRight } from 'lucide-react';
import { setSearchOpen, setSearchQuery } from '../../store/uiSlice';
import { addToCart } from '../../store/cartSlice';
import { useGetProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../lib/utils';

// Live Search Overlay Modal
export default function SearchModal() {
  const dispatch = useDispatch();
  const { isSearchOpen, searchQuery } = useSelector((state) => state.ui);

  const { data: searchResults, isLoading } = useGetProducts('All', searchQuery);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => dispatch(setSearchOpen(false))}
      />

      {/* Search Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-top duration-250 p-6 space-y-4">
        
        {/* Input Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3 flex-1">
            <Search className="w-5 h-5 text-[#ee818d]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search educational toys, wooden puzzles, Montessori..."
              autoFocus
              className="w-full text-sm sm:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => dispatch(setSearchOpen(false))}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading && (
            <p className="text-xs text-center py-8 text-gray-400">Searching toys catalog...</p>
          )}

          {!isLoading && searchResults && searchResults.length === 0 && (
            <p className="text-xs text-center py-8 text-gray-400">
              No matching toys found for &quot;{searchQuery}&quot;. Try searching for &quot;Abacus&quot;, &quot;Puzzle&quot;, or &quot;Montessori&quot;.
            </p>
          )}

          {!isLoading &&
            searchResults &&
            searchResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  dispatch(addToCart({ product: item, quantity: 1 }));
                  dispatch(setSearchOpen(false));
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-rose-50/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#ee818d]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-400">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-[#ee818d]">
                    {formatPrice(item.price)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#ee818d] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}
