import React from 'react';
import { ProductCard } from '../ProductCard';
import { useApp } from '../../context/AppContext';

export const Featured = () => {
  const { products, wishlist, toggleWishlist, cardSelections, setCardSelections, handleOpenProductDetail, handleAddToCart, calculateItemPrice } = useApp();
  const featured = products.filter(p => p.isFeatured).slice(0, 6);

  return (
    <section className="py-8 border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title - Reduced size and spacing */}
        <div className="mb-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-sans font-semibold block mb-0.5">
            Handpicked Excellence
          </span>
          <h3 className="text-xl sm:text-2xl font-serif text-luxury-white">Featured</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              currentSel={cardSelections[p.id] || { size: (p.variations && p.variations[0] && p.variations[0].size) || '100ml', concentration: 'Eau de Parfum' }}
              onSizeChange={(size) => setCardSelections(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), size } }))}
              onConcentrationChange={(c) => setCardSelections(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), concentration: c } }))}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              handleOpenProductDetail={handleOpenProductDetail}
              handleAddToCart={handleAddToCart}
              calculateItemPrice={calculateItemPrice}
              isLargeCard={true} // large card -> 2 lines for description
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Featured;
