import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { useApp } from '../../core/context/AppContext';

export const MoreProducts = ({ title = "More Fragrances You May Like", category, currentProductId, limit = 8 }) => {
  const { 
    products, 
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

  const isLight = currentTheme === 'light';

  if (productsError) {
    return (
      <section className="py-10 border-t border-zinc-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-6 border border-amber-500/20 bg-amber-500/5 rounded-sm">
            <p className="text-amber-400 font-sans text-xs">{productsError}</p>
          </div>
        </div>
      </section>
    );
  }

  // Filter products: exclude current product
  let filtered = products.filter(p => String(p.id) !== String(currentProductId));

  // If category is provided, prefer same category, otherwise fill with others
  if (category) {
    const categoryStr = typeof category === 'object' ? (category.name || category.title || '') : String(category);
    if (categoryStr) {
      const sameCategory = filtered.filter(p => p.category?.toLowerCase() === categoryStr.toLowerCase());
      const otherCategory = filtered.filter(p => p.category?.toLowerCase() !== categoryStr.toLowerCase());
      filtered = [...sameCategory, ...otherCategory];
    }
  }

  const itemsToDisplay = filtered.slice(0, limit);

  if (itemsToDisplay.length === 0) {
    return null;
  }

  return (
    <section className="py-10 border-t border-zinc-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h3 className={`text-xl sm:text-2xl font-serif tracking-wide ${isLight ? 'text-zinc-900' : 'text-gold'}`}>
            {title}
          </h3>
          <Link
            to={category ? `/shop?${new URLSearchParams({ category }).toString()}` : '/shop'}
            className="text-xs uppercase tracking-widest text-gold hover:underline font-bold flex items-center gap-1.5 shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold" />
          </Link>
        </div>

        {/* 2-Column Grid Layout for Mobile View */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {itemsToDisplay.map((p) => (
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

export default MoreProducts;
