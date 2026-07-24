import React from 'react';
import { Shield, Sparkles, Feather, HelpCircle, Flame } from 'lucide-react';

export const Atelier = () => {
  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="text-center space-y-4 mb-20 relative py-16 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">The Genesis of Essence</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-luxury-white tracking-wide">
            DECANTRE PARFUMÉ
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Where natural chemistry merges with couture art. Learn about our rich history, extraction methodology, and master curators.
          </p>
        </div>

        {/* Brand narrative section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium">Est. 2012</span>
            <h2 className="text-3xl font-serif font-light text-luxury-white">
              A Philosophy of Fluid Couture
            </h2>
            <div className="h-[1px] w-20 bg-gold/40"></div>
            <p className="text-zinc-400 text-sm font-sans font-light leading-relaxed">
              Founded on the pristine coasts of Southern France, Decantre Parfumé was born from a singular vision: to treat fragrance not as a simple accessory, but as liquid architecture that dialogues directly with human chemistry.
            </p>
            <p className="text-zinc-400 text-sm font-sans font-light leading-relaxed">
              We bypass industrial factory synthetic short-cuts. Instead, we harvest premium raw natural elements—like rare Cambodian Oud, Damask Roses, and Madagascar Vanilla pods—in complete synergy with regional farming cycles.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <span className="text-2xl font-serif text-gold block font-light">14+</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-sans font-semibold">Months Aged barrels</span>
              </div>
              <div>
                <span className="text-2xl font-serif text-gold block font-light">100%</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-sans font-semibold">Pure botanical extract</span>
              </div>
            </div>
          </div>

          {/* Interactive Extraction Visualizer */}
          <div className="bg-luxury-dark/30 border border-gold/15 p-8 rounded-sm space-y-6">
            <h3 className="text-lg font-serif text-luxury-white tracking-wide border-b border-white/5 pb-4">
              OUR THREE OLFACTORY TIERS
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 shrink-0 flex items-center justify-center font-mono text-xs text-gold">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-zinc-200">
                    Sovereign Top Notes (Tête)
                  </h4>
                  <p className="text-zinc-500 text-xs font-sans font-light mt-1">
                    The immediate premium vapor. Typically consisting of cold-pressed Bergamot, Pink Saffron, or Champagne Rose that lingers for up to 30 minutes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 shrink-0 flex items-center justify-center font-mono text-xs text-gold">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-zinc-200">
                    Resonant Heart Notes (Cœur)
                  </h4>
                  <p className="text-zinc-500 text-xs font-sans font-light mt-1">
                    The emotional foundation of the sillage. Formulated with Jasmine Grandiflorum, warm Tonka Bean, or Royal Cardamom, lingering for 4 to 6 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 shrink-0 flex items-center justify-center font-mono text-xs text-gold">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-zinc-200">
                    Sovereign Base Notes (Fond)
                  </h4>
                  <p className="text-zinc-500 text-xs font-sans font-light mt-1">
                    The absolute anchor. Heavy botanical extracts including Cambodian Oud, rich White Amber, and Dark Leather that fuse with your skin and last over 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master perfumer profiles */}
        <div className="border-t border-gold/15 pt-20 mb-24">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium">The Elite Craftsmen</span>
            <h2 className="text-3xl font-serif font-light text-luxury-white">THE MASTER NOZES</h2>
            <p className="text-zinc-500 text-xs font-sans font-light max-w-sm mx-auto">
              Meet our world-class scent composers who weave raw botanicals into sensory symphonies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Perfumer 1 */}
            <div className="p-8 border border-white/5 bg-[#090909] rounded-sm hover:border-gold/30 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif text-lg font-semibold">
                    JA
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-bold uppercase text-zinc-200 tracking-wider">Jean-Luc Almaric</h3>
                    <span className="text-[9px] uppercase tracking-widest text-gold font-mono">Principal nose</span>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs font-sans font-light leading-relaxed">
                  With over twenty-five years of fragrance curation in Paris and Grasse, Jean-Luc is a legendary scholar of oriental woods. His signature balance of heavy leather and warm spices defines our award-winning <span className="text-gold italic">Oud Impérial</span>.
                </p>
              </div>
              <div className="mt-6 border-t border-white/5 pt-4 flex justify-between items-center text-[10px] uppercase tracking-wider text-zinc-500">
                <span>Specialty: Woods & Resins</span>
                <Flame className="w-3.5 h-3.5 text-gold/60" />
              </div>
            </div>

            {/* Perfumer 2 */}
            <div className="p-8 border border-white/5 bg-[#090909] rounded-sm hover:border-gold/30 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif text-lg font-semibold">
                    SC
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-bold uppercase text-zinc-200 tracking-wider">Sophia Castiglione</h3>
                    <span className="text-[9px] uppercase tracking-widest text-gold font-mono">Senior designer</span>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs font-sans font-light leading-relaxed">
                  Sophia has spent years charting the chemical behavior of fresh blooms under atmospheric pressures. Her revolutionary technique of vaporizing rose petals yields an exceptionally modern, fresh blossom aura found in <span className="text-gold italic">Rose Absolue</span>.
                </p>
              </div>
              <div className="mt-6 border-t border-white/5 pt-4 flex justify-between items-center text-[10px] uppercase tracking-wider text-zinc-500">
                <span>Specialty: Florals & Citrus</span>
                <Feather className="w-3.5 h-3.5 text-gold/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Fragrance Preservation Guidelines */}
        <div className="border-t border-gold/15 pt-20">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">Caring for Liquid Art</span>
            <h2 className="text-3xl font-serif font-light text-luxury-white">PRESERVATION INSTRUCTIONS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-luxury-dark/20 p-6 border border-white/5 rounded-sm space-y-3">
              <Shield className="w-5 h-5 text-gold" />
              <h4 className="text-xs font-sans font-semibold uppercase text-zinc-200 tracking-wider">Avoid direct light</h4>
              <p className="text-zinc-500 text-xs font-sans font-light leading-relaxed">
                UV rays can shatter delicate chemical bonds of organic scent molecules. Always keep your elite flacons in their custom dark jewelry box.
              </p>
            </div>

            <div className="bg-luxury-dark/20 p-6 border border-white/5 rounded-sm space-y-3">
              <Sparkles className="w-5 h-5 text-gold" />
              <h4 className="text-xs font-sans font-semibold uppercase text-zinc-200 tracking-wider">Stabilized Temperature</h4>
              <p className="text-zinc-500 text-xs font-sans font-light leading-relaxed">
                Extremely high temperature fluctuations degrade pure botanical extracts. Keep your chest in a cool, stabilized room (15-20°C).
              </p>
            </div>

            <div className="bg-luxury-dark/20 p-6 border border-white/5 rounded-sm space-y-3">
              <HelpCircle className="w-5 h-5 text-gold" />
              <h4 className="text-xs font-sans font-semibold uppercase text-zinc-200 tracking-wider">Gentle Application</h4>
              <p className="text-zinc-500 text-xs font-sans font-light leading-relaxed">
                Never rub your wrists vigorously after spray application. Friction generates intense heat that rapidly burns off sovereign top notes.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Atelier;
