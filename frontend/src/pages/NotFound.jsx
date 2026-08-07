import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="py-12 sm:py-36 bg-luxury-black animate-fade-in text-center flex flex-col justify-center items-center">
      <div className="max-w-md px-4 space-y-6">
        
        {/* Visual Scent Vaporizer icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-gold/15 to-transparent border border-gold/30 rounded-full flex items-center justify-center animate-pulse mx-auto">
          <Compass className="w-8 h-8 text-gold/60" />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-mono font-semibold block">404 - OLFACTORY VOID</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-luxury-white tracking-wide uppercase">
            SCENT EVAPORATED
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light leading-relaxed max-w-sm mx-auto">
            The exclusive digital ledger route you are seeking has dispersed into thin air. Its structural sillage can no longer be tracked.
          </p>
        </div>

        <div className="h-[1px] w-12 bg-gold/20 mx-auto"></div>

        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border border-gold/40 hover:bg-gold hover:text-black text-gold text-[10px] font-sans font-bold uppercase tracking-widest px-6 py-3 transition-all duration-300 rounded-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Salon Main Entry
          </Link>
        </div>

      </div>
    </div>
  );
};
export default NotFound;
