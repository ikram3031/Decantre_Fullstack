import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { formatBDT } from '../utils/formatCurrency';
import { useApp } from '../context/AppContext';
import { resolveBrandName, resolveCategoryName } from '../store/productHelpers';
import defaultPerfumeImage from '../assets/images/perfume_for_him_1784311883603.jpg';

export const ProductCard = ({
  product,
  currentSel,
  onSizeChange,
  onConcentrationChange,
  wishlist,
  toggleWishlist,
  handleOpenProductDetail,
  handleAddToCart,
  calculateItemPrice,
  hideMobileVariations = false,
  isLargeCard = false,
  showProductName = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { currentTheme } = useApp();
  const isLight = currentTheme === 'light';

  // determine base price from selected variation if available
  const variationPrice = (product.variations && product.variations.find(v => v.size === currentSel.size))
    ? product.variations.find(v => v.size === currentSel.size).price
    : product.basePrice;
  const currentPrice = calculateItemPrice(variationPrice, currentSel.size, currentSel.concentration);

  const selectedVar = product.variations && product.variations.find(v => v.size === currentSel.size);
  const isOutOfStock = selectedVar 
    ? (selectedVar.stock_status === 'outofstock' || selectedVar.stockStatus === 'outofstock' || selectedVar.stockQuantity === 0)
    : (product.stockStatus === 'outofstock' || product.stockQuantity === 0);

  const descriptionText = product.description || product.tagline || product.scentFamily || '';

  return (
    <div 
      id={`product-card-${product.id}`}
      className={`group flex flex-col h-full ${
        isLight ? 'bg-white border-zinc-200 hover:border-gold/60 text-black shadow-sm hover:shadow-md' : 'bg-luxury-dark/90 border-gold/20 hover:border-gold/60 text-white shadow-xl hover:shadow-gold/10'
      } rounded-[6px] p-2 sm:p-3 transition-all duration-300 relative`}
    >


      {/* Wishlist toggle */}
      <button 
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-5 right-5 z-20 p-1.5 bg-black/60 border border-gold/40 hover:border-gold rounded-full text-zinc-300 hover:text-gold transition-all shadow-md cursor-pointer"
        aria-label="Toggle wishlist"
      >
        <Heart 
          className={`w-3.5 h-3.5 ${wishlist.includes(product.id) ? 'fill-gold text-gold' : ''}`} 
        />
      </button>

      {/* Image container */}
      <div className="relative aspect-square rounded-sm overflow-hidden bg-[#0a0a0a] mb-1 flex-shrink-0">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-900/80 animate-pulse z-10" />
        )}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 z-20 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-md">
            Out of Stock
          </div>
        )}
        <Link to={`/product?did=${product.id}`} className="block w-full h-full">
          <img
            src={product.image || (product.raw && product.raw.image) || defaultPerfumeImage}
            alt={product.brand || product.category || 'Perfume'}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultPerfumeImage; setImageLoaded(true); }}
          />
        </Link>
      </div>

      {/* Details section */}
      <div className="flex-1 flex flex-col justify-between mb-2">
        <div className="space-y-1">
          {/* Category / Brand Row */}
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.15em] font-sans font-semibold text-gold">
            <span className="truncate max-w-full sm:max-w-[60%]">{resolveBrandName(product.brand) || resolveCategoryName(product.category) || 'Fragrance'}</span>
            <span className="text-zinc-400 font-normal truncate max-w-[38%] text-right hidden sm:block">{resolveCategoryName(product.category)}</span>
          </div>

          {/* Product Name - 3 lines reserved */}
          <Link to={`/product?did=${product.id}`} className="block hover:opacity-80 transition-opacity my-1">
            <h3 
              className={`text-xs sm:text-sm font-serif font-medium pt-2 leading-snug line-clamp-3 min-h-[3.6em] text-center ${isLight ? 'text-zinc-900' : 'text-zinc-100'} hover:text-gold`} 
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* SELECTION CONTROLS (Size / Variants - up to 6 or more) */}
      <div className={`${hideMobileVariations ? 'hidden sm:block' : 'block'} border-t border-white/10 pt-1 flex-shrink-0`}>
        <div className="grid grid-cols-3 gap-1">
          {Array.from(new Set(
            (product.variations && product.variations.length > 0
              ? product.variations.map(v => v.size)
              : ['3ml', '5ml', '10ml', '30ml', '50ml', '100ml']
            ).filter(Boolean)
          )).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange(size)}
              className={`w-full text-center py-1 rounded-sm text-[11px] font-sans font-medium transition-all duration-200 border cursor-pointer ${
                currentSel.size === size
                  ? (isLight ? 'bg-black text-white border-black' : 'bg-gold text-black border-gold font-bold')
                  : (isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900' : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700')
              }`}
            >
              {String(size).replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Add to Cart & Price Row */}
      <div className="flex items-center justify-between gap-2 pt-1.5 mt-1 border-t border-white/10 flex-shrink-0">
        <div className="text-left">
          <span className="text-[8px] font-sans uppercase text-zinc-400 block tracking-wider font-light">Price</span>
          <span className="text-sm sm:text-base font-serif font-medium text-gold">
            {formatBDT(currentPrice)}
          </span>
        </div>

        <div>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return;
              if (typeof handleAddToCart === 'function') {
                handleAddToCart(product, currentSel.size, currentSel.concentration, 1, currentPrice);
              } else {
                console.warn('handleAddToCart is not available for product:', product.id);
              }
            }}
            className={`font-bold uppercase tracking-wider text-[9px] px-3 py-1.5 rounded-[3px] transition-all flex items-center justify-center gap-1 font-sans border ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 border-zinc-800 cursor-not-allowed opacity-50'
                : isLight 
                  ? 'bg-black text-white hover:bg-zinc-800 border-black cursor-pointer' 
                  : 'border-gold text-gold hover:bg-gold hover:text-black bg-transparent cursor-pointer'
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            <span className="hidden xs:inline">{isOutOfStock ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
