import React from 'react';
import { ShieldCheck, Truck, Award } from 'lucide-react';

export const TrustBadges = () => {
  return (
    <section id="trust-badges" className="bg-[#0A0A0A] py-8 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 text-center">
        <div className="flex flex-col items-center p-1 sm:p-3 space-y-1 sm:space-y-2">
          <Award className="w-5 h-5 sm:w-7 sm:h-7 text-gold" />
          <span className="text-[9px] sm:text-[10px] uppercase font-sans font-semibold tracking-wider sm:tracking-widest text-zinc-200">Best Quality</span>
          <span className="text-[9px] sm:text-[11px] text-zinc-500 font-sans font-light leading-tight">Exceptional sillage longevity</span>
        </div>
        <div className="flex flex-col items-center p-1 sm:p-3 space-y-1 sm:space-y-2">
          <Truck className="w-5 h-5 sm:w-7 sm:h-7 text-gold" />
          <span className="text-[9px] sm:text-[10px] uppercase font-sans font-semibold tracking-wider sm:tracking-widest text-zinc-200">Nationwide Delivery</span>
          <span className="text-[9px] sm:text-[11px] text-zinc-500 font-sans font-light leading-tight">Secured premium white-glove shipping</span>
        </div>
        <div className="flex flex-col items-center p-1 sm:p-3 space-y-1 sm:space-y-2">
          <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-gold" />
          <span className="text-[9px] sm:text-[10px] uppercase font-sans font-semibold tracking-wider sm:tracking-widest text-zinc-200">Authentic</span>
          <span className="text-[9px] sm:text-[11px] text-zinc-500 font-sans font-light leading-tight">100% genuine guaranteed formulations</span>
        </div>
      </div>
    </section>
  );
};
