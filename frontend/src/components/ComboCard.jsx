import React from 'react';
import { Layers, ShoppingBag, Tag, ChevronRight, Sparkles, Eye, CheckCircle2, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ComboCard = ({ combo, handleOpenProductDetail, wishlist = [], toggleWishlist }) => {
  const { handleAddComboToCart } = useApp();

  if (!combo) return null;

  const isWishlisted = Array.isArray(wishlist) && wishlist.some(
    (w) => String(w.id || w) === String(combo.id)
  );

  return (
    <div 
      className="group relative bg-zinc-950/90 border border-gold/30 hover:border-gold/70 rounded-sm overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between h-full hover:shadow-2xl hover:shadow-gold/10"
    >
      {/* Top Banner & Badges */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-black shrink-0">
        <img 
          src={combo.image} 
          alt={combo.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>

        {/* Top Badges Row */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-gold/40 text-gold px-2.5 py-1 rounded-xs text-[10px] font-sans font-extrabold uppercase tracking-widest shadow-md">
            <Layers className="w-3 h-3 text-gold" />
            <span>{combo.badge || 'COMBO SET'}</span>
          </div>

          <div className="flex items-center gap-2">
            {combo.savingsText && (
              <span className="bg-gold text-black px-2 py-0.5 rounded-xs text-[9px] font-sans font-black uppercase tracking-wider shadow-md animate-pulse">
                {combo.savingsText}
              </span>
            )}

            {toggleWishlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(combo);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer border ${
                  isWishlisted 
                    ? 'bg-gold text-black border-gold' 
                    : 'bg-black/60 text-gold border-gold/30 hover:border-gold hover:text-white'
                }`}
                aria-label="Wishlist Combo"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-black' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Floating Item Count Overlay */}
        <div className="absolute bottom-3 left-3 bg-zinc-900/90 border border-white/10 px-2.5 py-1 rounded-xs text-[10px] font-sans text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-gold" />
          <span>{combo.items ? combo.items.length : 0} Hand-picked Perfumes</span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-4">
        {/* Header Info */}
        <div>
          <div className="flex items-center gap-2 text-[10px] text-gold font-mono uppercase tracking-widest mb-1">
            <Tag className="w-3 h-3" />
            <span>{combo.category || 'Grouped Set'}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-serif text-white font-light group-hover:text-gold transition-colors leading-snug">
            {combo.name}
          </h3>

          {combo.tagline && (
            <p className="text-xs text-zinc-400 font-sans font-light line-clamp-2 mt-1 leading-relaxed">
              {combo.tagline}
            </p>
          )}
        </div>

        {/* Individual Included Products Box (Special Group Design) */}
        <div className="bg-black/60 border border-gold/15 rounded-sm p-3 space-y-2.5 my-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[10px] uppercase tracking-widest text-gold font-sans font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-gold" />
              Included Fragrances ({combo.items ? combo.items.length : 0}):
            </span>
            <span className="text-[9px] font-mono text-zinc-500">Click to Inspect</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {combo.items && combo.items.map((item, idx) => (
              <div 
                key={item.id || idx}
                onClick={() => {
                  if (typeof handleOpenProductDetail === 'function') {
                    handleOpenProductDetail({
                      id: item.productId || item.id,
                      name: item.name,
                      brand: item.brand,
                      category: item.category,
                      image: item.image,
                      basePrice: item.price,
                      description: `${item.name} by ${item.brand} included in ${combo.name} bundle.`,
                      variations: [{ size: item.variation, price: item.price }]
                    });
                  }
                }}
                className="group/item flex items-center justify-between p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 hover:border-gold/40 rounded-xs transition-all cursor-pointer"
                title={`Inspect ${item.name}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-8 h-8 object-cover rounded-xs border border-gold/20 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-200 group-hover/item:text-gold font-sans font-medium truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-sans truncate">
                      <span className="text-gold/90 font-semibold">{item.brand}</span>
                      <span>•</span>
                      <span className="text-zinc-500">{item.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="text-[10px] text-gold font-mono bg-gold/10 px-1.5 py-0.5 rounded-xs border border-gold/20 block font-semibold">
                    {item.variation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Add to Cart Section */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-sans text-zinc-500 uppercase tracking-wider block">Total Combo Price:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-serif text-gold font-bold">
                  ৳{Number(combo.comboPrice).toLocaleString()}
                </span>
                {combo.originalPrice && combo.originalPrice > combo.comboPrice && (
                  <span className="text-xs text-zinc-500 line-through font-sans">
                    ৳{Number(combo.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {combo.originalPrice && (
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-xs block font-semibold">
                  Save ৳{(combo.originalPrice - combo.comboPrice).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={() => {
                if (typeof handleAddComboToCart === 'function') {
                  handleAddComboToCart(combo);
                }
              }}
              className="w-full py-2.5 px-4 bg-gold hover:bg-gold/90 text-black text-xs font-sans font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-gold/20"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              <span>Add Combo to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
