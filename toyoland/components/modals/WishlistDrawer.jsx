'use client';

import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { setWishlistOpen, toggleWishlist } from '../../store/wishlistSlice';
import { addToCart } from '../../store/cartSlice';
import { formatPrice } from '../../lib/utils';

// Wishlist Drawer Component
export default function WishlistDrawer() {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.wishlist);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => dispatch(setWishlistOpen(false))}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-heading font-extrabold text-lg text-gray-900">
              Saved Wishlist ({items.length})
            </h3>
          </div>
          <button
            onClick={() => dispatch(setWishlistOpen(false))}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-gray-400 py-12">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-700 text-sm">Your wishlist is empty.</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Save your favorite toys and Montessori materials for later by clicking the heart icon.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-3 rounded-xl border border-gray-100 hover:border-rose-100 transition-colors bg-white shadow-2xs"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs font-extrabold text-[#ee818d]">
                    {formatPrice(item.price)}
                  </p>

                  <button
                    onClick={() => {
                      dispatch(addToCart({ product: item, quantity: 1 }));
                      dispatch(toggleWishlist(item));
                    }}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Move to Bag</span>
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => dispatch(toggleWishlist(item))}
                  className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
