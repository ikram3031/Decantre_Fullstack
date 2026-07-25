import React from 'react';
import { ProductCard } from '../ProductCard';
import { useApp } from '../../context/AppContext';

export const OnSale = () => {
  const { products, productsError, wishlist, toggleWishlist, cardSelections, setCardSelections, handleOpenProductDetail, handleAddToCart, calculateItemPrice } = useApp();
  const sale = products.filter(p => (p.raw && p.raw.on_sale) || p.isOnSale).slice(0, 6);

  return (
    <section className="py-8 border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title - Reduced size and spacing */}
        <div className="mb-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-sans font-semibold block mb-0.5">
            Special Formulations
          </span>
          <h3 className="text-xl sm:text-2xl font-serif text-luxury-white">On Sale</h3>
        </div>

        {productsError ? (
          <div className="p-8 border border-amber-500/20 bg-amber-500/5 rounded-sm text-center my-4">
            <p className="text-amber-400 font-sans text-xs tracking-wide">
              {productsError}
            </p>
          </div>
        ) : sale.length === 0 ? (
          <div className="p-8 border border-zinc-700/40 bg-zinc-900/40 rounded-sm text-center my-4">
            <p className="text-zinc-400 font-sans text-xs tracking-wide">
              No on-sale items available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sale.map(p => (
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
                isLargeCard={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OnSale;
