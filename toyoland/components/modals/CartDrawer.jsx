'use client';

import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { setCartOpen, removeFromCart, updateQuantity, clearCart } from '../../store/cartSlice';
import { setCheckoutOpen } from '../../store/uiSlice';
import { formatPrice } from '../../lib/utils';

// Shopping Bag Drawer Component
export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 100;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    dispatch(setCheckoutOpen(true));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => dispatch(setCartOpen(false))}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#ee818d]" />
            <h3 className="font-heading font-extrabold text-lg text-gray-900">
              Your Shopping Bag ({items.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={() => dispatch(setCartOpen(false))}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-6 py-3 bg-rose-50/60 border-b border-rose-100/60">
          <p className="text-xs text-gray-700 font-medium mb-1.5">
            {remainingForFreeShipping > 0 ? (
              <>Add <span className="font-bold text-[#ee818d]">{formatPrice(remainingForFreeShipping)}</span> more for <span className="font-bold">Free Shipping</span>!</>
            ) : (
              <span className="font-bold text-emerald-600">🎉 Congratulations! You unlocked FREE Shipping!</span>
            )}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#ee818d] to-[#76d69b] transition-all duration-300 rounded-full"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-gray-400 py-12">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-[#ee818d] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-700 text-sm">Your bag is currently empty.</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Explore our Montessori toys and educational materials to add items.
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

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-gray-800 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Estimated Shipping</span>
                <span className="text-emerald-600 font-bold">
                  {remainingForFreeShipping === 0 ? 'FREE' : formatPrice(10.0)}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#FF3B30] text-base">
                  {formatPrice(subtotal + (remainingForFreeShipping === 0 ? 0 : 10.0))}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#FF3B30] hover:bg-[#9B51E0] text-white font-black text-xs uppercase py-3.5 rounded-full shadow-[0_4px_0px_#B3241C] hover:shadow-none hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Secure Checkout Guaranteed</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
