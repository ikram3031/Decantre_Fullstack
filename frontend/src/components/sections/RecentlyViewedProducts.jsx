import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { useApp } from '../../core/context/AppContext';

export const RecentlyViewedProducts = ({ currentProductId, limit = 8 }) => {
  const { 
    products, 
    wishlist, 
    toggleWishlist, 
    cardSelections, 
    setCardSelections, 
    handleOpenProductDetail, 
    handleAddToCart, 
    calculateItemPrice,
    currentTheme 
  } = useApp();
  
  const [recentIds, setRecentIds] = useState([]);
  const isLight = currentTheme === 'light';

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recently_viewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out the current product being viewed
          const filteredIds = parsed.filter(id => String(id) !== String(currentProductId));
          setRecentIds(filteredIds);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentProductId]);

  if (recentIds.length === 0) return null;

  // Map the IDs back to the actual product objects, maintaining order
  const recentProducts = recentIds
    .map(id => products.find(p => String(p.id) === String(id)))
    .filter(Boolean)
    .slice(0, limit);

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-10 border-t border-zinc-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h3 className={`text-xl sm:text-2xl font-serif tracking-wide ${isLight ? 'text-zinc-900' : 'text-gold'}`}>
            Recently Viewed Products
          </h3>
        </div>

        {/* Grid Layout: 2 Columns for Mobile, up to 4 for Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {recentProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              currentSel={cardSelections[p.id] || { size: (p.variations && p.variations[0] && p.variations[0].size) || '10ml', concentration: 'Eau de Parfum' }}
              onSizeChange={(size) => setCardSelections(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), size } }))}
              onConcentrationChange={(c) => setCardSelections(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), concentration: c } }))}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              handleOpenProductDetail={handleOpenProductDetail}
              handleAddToCart={handleAddToCart}
              calculateItemPrice={calculateItemPrice}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;
