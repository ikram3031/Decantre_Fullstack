import React from 'react';
import { Layers, Sparkles, Clock, Bell } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';

export const Combo = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Coming Soon Card */}
        <div className="flex-1 flex items-center justify-center py-16 sm:py-24">
          <div className="relative max-w-2xl w-full mx-auto text-center space-y-8">

            {/* Background glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-radial from-gold/10 via-transparent to-transparent blur-3xl pointer-events-none rounded-full" />

            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-gold/40 bg-gold/10 mx-auto shadow-[0_0_40px_rgba(184,142,36,0.15)]">
              <Layers className="w-9 h-9 text-gold" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/40 text-gold rounded-xs text-[10px] font-extrabold uppercase tracking-[0.35em] shadow-inner">
              <Clock className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-serif font-light text-white tracking-wide leading-tight">
                COMBO &amp;<br />GROUPED SETS
              </h1>
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
            </div>

            {/* Description */}
            <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto font-light leading-relaxed">
              We are curating an exclusive collection of expertly paired fragrance bundles and combo sets. These handpicked olfactory harmonies will be available very soon with exceptional bundle savings.
            </p>

            {/* Features preview */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
              {[
                { label: 'Up to 30% OFF', sub: 'Bundle Savings' },
                { label: '100% Authentic', sub: 'Guaranteed' },
                { label: 'Multi-Brand', sub: 'Curated Sets' },
              ].map(({ label, sub }) => (
                <div key={label} className="p-3 bg-zinc-900/60 border border-white/10 rounded-xs hover:border-gold/30 transition-colors">
                  <span className="text-gold font-serif font-bold text-sm block">{label}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{sub}</span>
                </div>
              ))}
            </div>

            {/* Sparkle decoration */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Sparkles className="w-4 h-4 text-gold/50" />
              <span className="text-zinc-600 text-xs uppercase tracking-[0.3em] font-mono">Launching Soon</span>
              <Sparkles className="w-4 h-4 text-gold/50" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Combo;
