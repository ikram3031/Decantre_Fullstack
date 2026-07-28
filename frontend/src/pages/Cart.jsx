import React from 'react';
import { ShoppingBag, Trash2, Minus, Plus, CreditCard, ArrowRight, Sparkles, Gift, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatBDT } from '../utils/formatCurrency';
import { useApp } from '../context/AppContext';

export const Cart = () => {
  const {
    cart,
    handleUpdateQty,
    handleRemoveFromCart,
    cartSubtotal,
    discountAmount,
    shippingFee,
    luxuryTax,
    cartTotal,
    shippingInfo,
    setShippingInfo,
    promoCode,
    setPromoCode,
    applyPromoCode,
    promoError,
    appliedDiscount
  } = useApp();

  const navigate = useNavigate();

  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in text-left">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16 relative py-12 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">Shopping Cart Ledger</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-luxury-white tracking-wide">
            YOUR SHOPPING CART
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Review your selected decants and formulation concentrations before preparing secure shipping options.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gold/15 rounded-sm bg-luxury-dark/10">
            <ShoppingBag className="w-12 h-12 text-gold/40 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-serif font-light text-zinc-300 mb-2">Your Cart is Empty</h3>
            <p className="text-zinc-500 text-xs font-sans font-light max-w-xs mx-auto mb-8">
              You haven't decanted any royal fragrances into your secure shopping cart.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 border border-gold px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-300 rounded-sm"
            >
              Explore Scent Catalogue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-white/5 pb-2">
                <span>Selected Formulation</span>
                <span>Subtotal</span>
              </div>

              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="bg-zinc-900/90 border border-zinc-700/60 p-5 rounded-sm flex gap-4 sm:gap-6 items-center justify-between shadow-xl"
                >
                  <div className="flex gap-4 items-center">
                    {/* Visual Bottle Indicator */}
                    <div className="w-14 h-14 bg-gradient-to-br from-gold/10 to-black border border-gold/20 flex items-center justify-center rounded-sm shrink-0">
                      <ShoppingBag className="w-6 h-6 text-gold/50" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-serif font-light text-luxury-white">{item.product.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider font-mono">
                        <span className="text-zinc-400">{item.size}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-gold/80">{item.concentration}</span>
                      </div>
                      
                      {/* Price per unit */}
                      <span className="text-[10px] text-zinc-500 font-mono block">{formatBDT(item.unitPrice)} per flacon</span>
                    </div>
                  </div>

                  {/* Quantity & Actions and Total */}
                  <div className="flex flex-col items-end gap-3 text-right">
                    <span className="text-sm font-mono text-gold font-semibold">
                      {formatBDT(item.unitPrice * item.quantity)}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-white/10 rounded-sm bg-black/40 text-xs font-mono text-zinc-300">
                        <button 
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="px-2.5 py-1.5 hover:text-gold transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-zinc-200">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="px-2.5 py-1.5 hover:text-gold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-1.5 border border-white/5 hover:border-red-500/30 text-zinc-500 hover:text-red-400 rounded-sm transition-all bg-black/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Schedule Indicator */}
              <div className="p-4 border border-zinc-700/60 bg-zinc-900/90 rounded-sm flex items-center gap-3 shadow-xl">
                <Truck className="w-5 h-5 text-gold shrink-0" />
                <p className="text-zinc-300 text-[11px] font-sans font-light leading-relaxed">
                  <span className="text-gold font-semibold uppercase tracking-wider text-[10px] block mb-0.5">ESTIMATED DELIVERY TIME</span>
                  Inside Dhaka within 24–48 hours, outside Dhaka within 48–72 hours.
                </p>
              </div>
            </div>

            {/* Calculations & Summary */}
            <div className="bg-zinc-900/90 border border-zinc-700/60 p-6 rounded-sm space-y-6 shadow-xl">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-300 border-b border-white/5 pb-4">
                Cart Summary
              </h3>

              {/* Pricing breakdown list */}
              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between text-zinc-400 font-light">
                  <span>Cart Subtotal</span>
                  <span className="font-mono text-zinc-300">{formatBDT(cartSubtotal)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-light">
                    <span>Exclusive Coupon Discount</span>
                    <span className="font-mono">-{formatBDT(discountAmount)}</span>
                  </div>
                )}

                <div className="border-t border-gold/20 pt-4 flex justify-between items-end">
                  <span className="text-xs font-sans font-bold uppercase text-zinc-300 tracking-wider">Estimated Total</span>
                  <span className="text-xl font-serif text-gold font-semibold font-mono">{formatBDT(Math.max(0, cartSubtotal - discountAmount))}</span>
                </div>
              </div>



              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gold text-black text-xs font-sans font-bold uppercase tracking-widest py-3 rounded-sm hover:bg-gold/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gold/5"
                >
                  Proceed to Checkout <CreditCard className="w-4 h-4" />
                </button>
                
                <Link
                  to="/shop"
                  className="w-full text-center block border border-white/5 hover:border-gold/30 text-zinc-400 hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-widest py-3 rounded-sm"
                >
                  Continue Sourcing Scents
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
export default Cart;
