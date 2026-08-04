import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatBDT } from '../utils/formatCurrency';

export const PriceRangeSlider = ({ 
  minLimit, 
  maxLimit, 
  initialMin, 
  initialMax, 
  onChange,
  isLight = false
}) => {
  const [minValue, setMinValue] = useState(initialMin ?? minLimit);
  const [maxValue, setMaxValue] = useState(initialMax ?? maxLimit);
  
  const minRef = useRef(null);
  const maxRef = useRef(null);
  
  // Calculate percentage to position the track highlighting
  const getPercent = useCallback(
    (value) => Math.round(((value - minLimit) / (maxLimit - minLimit)) * 100),
    [minLimit, maxLimit]
  );
  
  // Update state when initial values change (e.g., from URL params on load)
  useEffect(() => {
    if (initialMin !== undefined) setMinValue(initialMin);
    if (initialMax !== undefined) setMaxValue(initialMax);
  }, [initialMin, initialMax]);
  
  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ min: minValue, max: maxValue });
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [minValue, maxValue, onChange]);
  
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(value);
  };
  
  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(value);
  };
  
  const trackStyle = {
    left: `${getPercent(minValue)}%`,
    width: `${getPercent(maxValue) - getPercent(minValue)}%`
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Price Range</span>
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gold">
          <span>{formatBDT(minValue)}</span>
          <span className="text-zinc-500">-</span>
          <span>{formatBDT(maxValue)}</span>
        </div>
      </div>
      
      <div className="relative pt-4 pb-2">
        {/* Track Background */}
        <div className={`absolute top-4 w-full h-1 rounded-full ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}></div>
        
        {/* Active Track */}
        <div 
          className="absolute top-4 h-1 bg-gold rounded-full transition-all duration-75"
          style={trackStyle}
        ></div>
        
        {/* Min Thumb Input */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={minValue}
          ref={minRef}
          onChange={handleMinChange}
          className="absolute top-[13px] w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm z-20"
        />
        
        {/* Max Thumb Input */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={maxValue}
          ref={maxRef}
          onChange={handleMaxChange}
          className="absolute top-[13px] w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm z-30"
        />
      </div>
      
      <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-1">
        <span>{formatBDT(minLimit)}</span>
        <span>{formatBDT(maxLimit)}</span>
      </div>
    </div>
  );
};
