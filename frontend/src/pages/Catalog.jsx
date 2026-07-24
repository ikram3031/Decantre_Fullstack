import React from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

export const Catalog = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cardSelections,
    setCardSelections,
    wishlist,
    toggleWishlist,
    handleOpenProductDetail,
    handleAddToCart,
    calculateItemPrice,
    filteredProducts
  } = useApp();

  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Banner for Catalog */}
        <div className="text-center space-y-4 mb-16 relative py-12 border border-gold/15 bg-luxury-dark/30 rounded-sm">
          <div className="absolute -inset-px bg-gradient-to-r from-transparent via-gold/5 to-transparent pointer-events-none"></div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">The Sovereign Decantre</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-luxury-white tracking-wide">
            THE SIGNATURE CATALOGUE
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed px-4">
            Immerse yourself in our full selection of hand-decanted royal fragrances. Custom-tune volume and concentration to suit your individual lifestyle.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-gold/10 pb-8">
          
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'For Him', 'For Her', 'Unisex'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-sm text-[9px] font-sans font-semibold tracking-widest uppercase transition-all duration-300 ${
                  selectedCategory === cat 
                    ? 'bg-gold text-black shadow-lg shadow-gold/10' 
                    : 'bg-luxury-dark border border-white/5 hover:border-gold/40 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Result Counter */}
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">Showing</span>
            <span className="text-lg font-serif text-gold font-light">{filteredProducts.length} Exquisite Masterpieces</span>
          </div>
        </div>

        {/* Empty search fallback */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-24 border border-dashed border-gold/15 rounded-sm bg-luxury-dark/10">
            <SlidersHorizontal className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-light text-zinc-300 mb-2">No Fragrances Found</h3>
            <p className="text-zinc-500 text-xs font-sans font-light max-w-xs mx-auto">
              We couldn't find any fragrances matching your specific search parameters or selection filters.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-6 border border-gold/40 px-6 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-300 rounded-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Perfume catalog cards list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((prod) => {
            const currentSel = cardSelections[prod.id] || { size: '100ml', concentration: 'Eau de Parfum' };
            return (
              <ProductCard 
                key={prod.id}
                product={prod}
                currentSel={currentSel}
                onSizeChange={(size) => {
                  setCardSelections(prev => ({
                    ...prev,
                    [prod.id]: { ...currentSel, size }
                  }));
                }}
                onConcentrationChange={(concentration) => {
                  setCardSelections(prev => ({
                    ...prev,
                    [prod.id]: { ...currentSel, concentration }
                  }));
                }}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                handleOpenProductDetail={handleOpenProductDetail}
                handleAddToCart={handleAddToCart}
                calculateItemPrice={calculateItemPrice}
              />
            );
          })}
        </div>

        {/* Curation philosophy banner */}
        <div className="mt-24 p-8 sm:p-12 border border-gold/20 bg-gradient-to-br from-luxury-dark/30 to-black rounded-sm flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-3 text-left max-w-xl">
            <div className="flex items-center gap-2 text-gold">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold">The Royal Creed</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-light text-luxury-white">
              Sustainably Sourced Scent Ingredients
            </h3>
            <p className="text-zinc-500 text-xs font-sans font-light leading-relaxed">
              Every drop contains ethically acquired natural raw materials, aging for at least six months in specialized dark glass barrels under perfect temperature controls.
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-[9px] uppercase tracking-widest text-gold/60 border border-gold/20 px-4 py-2 rounded-full font-semibold font-mono">
              100% Certified Authentic Sillage
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Catalog;
