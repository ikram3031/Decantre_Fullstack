import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import { useApp } from '../../core/context/AppContext';

export const ScentFinder = () => {
  const { startQuiz } = useApp();

  return (
    <section id="scent-finder-banner" className="py-10 sm:py-12 bg-luxury-black relative overflow-hidden border-b border-gold/20">
      <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-gold/5 to-luxury-black pointer-events-none"></div>
      <div className="absolute -right-32 top-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-10">
        <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-2">
          <Compass className="w-4 h-4 text-gold" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-sans font-semibold block">Scent Guidance Decantre</span>
        <h2 className="text-xl sm:text-2xl font-serif font-light tracking-wide text-luxury-white">
          FIND YOUR PERFECT SIGNATURE AURA
        </h2>
        <p className="text-zinc-500 font-sans font-light text-xs max-w-lg mx-auto leading-relaxed">
          Answer a few luxury sensory questions about your lifestyle, environment, and scent inclinations to receive a curated perfume masterpiece matching your natural chemistry.
        </p>
        <div className="pt-1">
          <button
            onClick={startQuiz}
            className="inline-flex items-center gap-2 border border-gold text-gold font-sans font-bold uppercase tracking-[0.2em] text-[10px] px-6 py-2.5 rounded-sm hover:bg-gold hover:text-black transition-all duration-300 cursor-pointer"
          >
            <span>Begin Sensory Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ScentFinder;
