import React, { useMemo } from 'react';
import { useApp } from '../core/context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { getDefaultSelection } from '../core/store/productHelpers';
import { Sparkles, Heart, Compass } from 'lucide-react';

import { Link } from 'react-router-dom';

export const Wishlist = () => {
  const {
    wishlist,
    toggleWishlist,
    products,
    cardSelections,
    setCardSelections,
    handleOpenProductDetail,
    handleAddToCart,
    calculateItemPrice,
    currentTheme
  } = useApp();

  // Find products that are actually in the wishlist
  const wishlistedProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Recommend a few highlight products if wishlist is empty
  const recommendedProducts = useMemo(() => {
    return products.slice(0, 3);
  }, [products]);

  const isLight = currentTheme === 'light';

  return (
    <div className={`min-h-screen py-12 sm:py-20 ${isLight ? 'bg-white text-black' : 'bg-[#050505] text-[#f5f5f5]'} transition-colors duration-500 text-left`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className={`text-center space-y-3 mb-12 relative py-8 px-4 border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-[#C5A059]/15 bg-[#0a0a0a]/30'} rounded-none`}>
          <h1 className="text-2xl sm:text-4xl font-serif font-light tracking-wide uppercase">
            YOUR WISHLIST
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed px-4">
            Save your favorite perfumes here for easy access and quick checkout whenever you are ready.
          </p>
        </div>

        {wishlistedProducts.length > 0 ? (
          <div className="space-y-8 animate-fade-in">
            <div className={`flex items-center justify-between border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800'} pb-4`}>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                Saved Products ({wishlistedProducts.length})
              </span>
            </div>

            {/* Grid of Wishlist Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistedProducts.map((prod) => {
                const currentSel = cardSelections[prod.id] || getDefaultSelection(prod);
                return (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    currentSel={currentSel}
                    onSizeChange={(size) => {
                      setCardSelections((prev) => ({
                        ...prev,
                        [prod.id]: { ...currentSel, size }
                      }));
                    }}
                    onConcentrationChange={(concentration) => {
                      setCardSelections((prev) => ({
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
          </div>
        ) : (
          /* Empty Wishlist State + Recommendations */
          <div className="space-y-16 animate-fade-in">
            <div className={`text-center py-16 border border-dashed ${isLight ? 'border-zinc-300 bg-zinc-50/50' : 'border-zinc-800 bg-zinc-900/10'} rounded-none max-w-2xl mx-auto`}>
              <Heart className="w-12 h-12 text-[#C5A059]/40 mx-auto mb-4 stroke-[1]" />
              <h3 className="text-xl font-serif font-light text-zinc-300 mb-2">Your Wishlist is Empty</h3>
              <p className="text-zinc-500 text-xs font-sans font-light max-w-xs mx-auto leading-relaxed mb-6">
                You haven't added any fragrances to your wishlist yet. Explore our shop to find your favorites.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center bg-black hover:bg-[#C5A059] text-[#C5A059] hover:text-black border border-[#C5A059] px-6 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all duration-300"
              >
                Browse Shop
              </Link>
            </div>

            {/* Recommendations */}
            <div className="space-y-8 pt-6">
              <div className={`flex flex-col gap-1.5 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800'} pb-4 text-center`}>
                <h2 className="text-xl font-serif font-light tracking-wide">Recommended For You</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedProducts.map((prod) => {
                  const currentSel = cardSelections[prod.id] || getDefaultSelection(prod);
                  return (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      currentSel={currentSel}
                      onSizeChange={(size) => {
                        setCardSelections((prev) => ({
                          ...prev,
                          [prod.id]: { ...currentSel, size }
                        }));
                      }}
                      onConcentrationChange={(concentration) => {
                        setCardSelections((prev) => ({
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
