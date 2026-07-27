import React, { useState, useMemo } from 'react';
import { ProductCard } from '../ProductCard';
import { useApp } from '../../context/AppContext';

export const BestSelling = () => {
  const { 
    products, 
    isProductsLoading,
    productsError,
    wishlist, 
    toggleWishlist, 
    cardSelections, 
    setCardSelections, 
    handleOpenProductDetail, 
    handleAddToCart, 
    calculateItemPrice,
    currentTheme
  } = useApp();

  const [filter, setFilter] = useState('All');
  const isLight = currentTheme === 'light';

  // Filter bestsellers based on tab selection (shows exactly 8 items on desktop)
  const filtered = useMemo(() => {
    const bSellers = products.filter(p => p.isBestSeller);

    if (filter === 'For Him') {
      let himItems = bSellers.filter(p => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('him') || cat.includes('men') || cat.includes('male');
      });
      if (himItems.length < 6) {
        const fallbacks = products.filter(p => {
          const cat = (p.category || '').toLowerCase();
          return cat.includes('him') || cat.includes('men') || cat.includes('male');
        });
        himItems = Array.from(new Set([...himItems, ...fallbacks]));
      }
      return himItems.slice(0, 8);
    } else if (filter === 'For Her') {
      let herItems = bSellers.filter(p => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('her') || cat.includes('women') || cat.includes('female');
      });
      if (herItems.length < 6) {
        const fallbacks = products.filter(p => {
          const cat = (p.category || '').toLowerCase();
          return cat.includes('her') || cat.includes('women') || cat.includes('female');
        });
        herItems = Array.from(new Set([...herItems, ...fallbacks]));
      }
      return herItems.slice(0, 8);
    }

    let pool = bSellers.length >= 6 ? bSellers : Array.from(new Set([...bSellers, ...products]));
    return pool.slice(0, 8);
  }, [products, filter]);

  return (
    <section id="our-bestsellers" className={`py-8 sm:py-12 border-t ${isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-[#030303] border-gold/15'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        
        {/* Heading - Reduced spacing and size */}
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-sans font-semibold block">
            Most Coveted Formulations
          </span>
          <h2 className={`text-xl sm:text-2xl font-serif font-light tracking-wide ${isLight ? 'text-black' : 'text-luxury-white'}`}>
            OUR BESTSELLERS
          </h2>
          <div className="h-[1px] w-10 bg-gold/40 mx-auto mt-1"></div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-1.5 sm:gap-2">
          {['All', 'For Him', 'For Her'].map((type) => {
            const isActive = filter === type;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-[3px] text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                  isActive
                    ? (isLight ? 'bg-black text-white border-black' : 'bg-gold text-black border-gold')
                    : (isLight ? 'border-gold/60 text-gold hover:bg-gold hover:text-white bg-transparent' : 'border-gold/60 text-gold hover:bg-gold hover:text-black bg-transparent')
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Product Grid: 6 items shown (3 cols x 2 rows on md/lg, 2 cols x 3 rows on sm) */}
        {productsError ? (
          <div className="p-8 border border-amber-500/20 bg-amber-500/5 rounded-sm text-center my-4 space-y-2">
            <p className="text-amber-400 font-sans text-xs tracking-wide">
              {productsError}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-500 text-xs font-sans font-light py-6">
            No bestseller products available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pt-2">
            {filtered.map((p) => {
              const currentSel = cardSelections[p.id] || { size: (p.variations && p.variations[0] && p.variations[0].size) || '100ml', concentration: 'Eau de Parfum' };

              return (
                <div key={p.id}>
                  <ProductCard
                    product={p}
                    currentSel={currentSel}
                    onSizeChange={(size) => setCardSelections(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), size } }))}
                    onConcentrationChange={(c) => setCardSelections(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), concentration: c } }))}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                    handleOpenProductDetail={handleOpenProductDetail}
                    handleAddToCart={handleAddToCart}
                    calculateItemPrice={calculateItemPrice}
                    isLargeCard={false}
                  />
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default BestSelling;
