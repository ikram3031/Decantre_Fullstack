'use client';

import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { addToCart } from '../../store/cartSlice';
import { toggleWishlist } from '../../store/wishlistSlice';
import { useCountdown } from '../../hooks/useCountdown';
import { formatPrice, getStarArray } from '../../lib/utils';

// Reusable Product Card Component matching exact screenshot UI specs
export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  // Live countdown timer for items with active flash sales
  const { formattedString } = useCountdown(product.countdownHours || 24);

  const starArray = getStarArray(product.rating || 5);

  return (
    <div className="group relative bg-white rounded-[28px] overflow-hidden p-3.5 border-2 border-[#EEEEEE] hover:border-[#9B51E0] transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-xl">
      
      {/* Thumbnail Container */}
      <div className="relative aspect-square w-full rounded-2xl bg-[#F9F9F9] overflow-hidden flex items-center justify-center">
        
        {/* Product Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-108 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <div className="w-12 h-12 mb-2 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
              🪵
            </div>
            <span className="text-xs font-bold">Natural Wood Toy</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1.5 z-10">
          {product.discountPercent > 0 && (
            <span className="bg-[#FF3B30] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#27AE60] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* Hot Tag on top right */}
        {product.isHot && (
          <span className="absolute top-2.5 right-2.5 bg-[#FFD13B] text-[#2D2D2D] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs z-10">
            HOT
          </span>
        )}

        {/* Live Countdown Timer Badge */}
        {product.hasCountdown && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[90%] bg-white/95 backdrop-blur-xs text-[#FF3B30] font-black text-[11px] py-1 px-2.5 rounded-full text-center shadow-md border border-rose-100 z-10 tracking-tight">
            {formattedString}
          </div>
        )}

        {/* Hover Quick Action Icons (Right Side Floating) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          
          {/* Quick Add to Cart */}
          <button
            onClick={() => dispatch(addToCart({ product, quantity: 1 }))}
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#FF3B30] text-[#2D2D2D] hover:text-white shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Add to Bag"
            aria-label="Add to Bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Toggle Wishlist */}
          <button
            onClick={() => dispatch(toggleWishlist(product))}
            className={`w-9 h-9 rounded-xl shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isWishlisted
                ? 'bg-[#FF3B30] text-white'
                : 'bg-white hover:bg-rose-50 text-[#2D2D2D] hover:text-[#FF3B30]'
            }`}
            title="Add to Wishlist"
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

        </div>
      </div>

      {/* Product Information */}
      <div className="mt-3 text-center space-y-1">
        
        {/* Star Rating & Review Count */}
        <div className="flex items-center justify-center space-x-1">
          <div className="flex text-[#FFD13B]">
            {starArray.map((isFilled, idx) => (
              <Star
                key={idx}
                className={`w-3.5 h-3.5 ${isFilled ? 'fill-[#FFD13B] text-[#FFD13B]' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-[#999999] font-bold">
            ({product.reviewsCount || 0})
          </span>
        </div>

        {/* Product Title */}
        <h4 className="text-xs sm:text-sm font-black text-[#4D4D4D] line-clamp-1">
          {product.title}
        </h4>

        {/* Pricing */}
        <div className="flex items-center justify-center space-x-2 pt-0.5">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-[#BBBBBB] line-through font-semibold">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-base font-black text-[#FF3B30]">
            {formatPrice(product.price)}
          </span>
        </div>

      </div>

    </div>
  );
}
