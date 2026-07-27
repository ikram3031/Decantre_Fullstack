import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Trash2, Minus, Plus, CheckCircle, CreditCard, ArrowRight, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { formatBDT } from '../utils/formatCurrency';

export const CartDrawer = ({
  isCartOpen,
  setIsCartOpen,
  isCheckoutMode,
  setIsCheckoutMode,
  cart,
  handleRemoveFromCart,
  handleUpdateQty,
  orderCompleted,
  handleResetCheckout,
  shippingInfo,
  setShippingInfo,
  isProcessingOrder,
  handleCheckoutSubmit,
  promoCode,
  setPromoCode,
  applyPromoCode,
  promoError,
  appliedDiscount,
  cartSubtotal,
  discountAmount,
  shippingFee,
  luxuryTax,
  cartTotal
}) => {
  const navigate = useNavigate();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent 
        side="right" 
        showCloseButton={false}
        className="w-full max-w-md bg-luxury-black border-l border-gold/20 h-full shadow-2xl flex flex-col justify-between text-luxury-white p-0"
      >
        <div className="sr-only">
          <SheetTitle>Your Shopping Cart</SheetTitle>
          <SheetDescription>Verify your decants, customize gift wrap and complete secure payment</SheetDescription>
        </div>

        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-white/5 flex items-center justify-between bg-luxury-black">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0" />
            <h2 className="text-[10px] sm:text-xs font-sans font-semibold tracking-wide sm:tracking-widest text-luxury-white uppercase truncate">
              Your Cart
            </h2>
            <span className="bg-gold/10 text-gold text-[9px] sm:text-[10px] font-sans font-semibold rounded-sm px-2 py-0.5 ml-0.5 border border-gold/20 shrink-0">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={() => { setIsCartOpen(false); setIsCheckoutMode(false); }}
            className="p-1 text-gold hover:text-white rounded-full bg-luxury-dark border border-gold hover:border-gold transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Middle Section: Scrollable Items or Checkout Form */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          
          {!isCheckoutMode ? (
            /* CART LIST VIEW */
            cart.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-8 h-8 text-zinc-800 mx-auto" />
                <p className="text-zinc-400 font-light text-xs font-serif">Your cart is currently empty.</p>
                <p className="text-[10px] text-zinc-600">Select a signature scent from our list to fill your collection.</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 bg-transparent hover:bg-gold text-gold hover:text-black border border-gold text-[10px] font-sans font-bold tracking-widest uppercase py-2.5 px-5 rounded-sm transition-all cursor-pointer"
                >
                  Browse Decants
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    id={`cart-item-${item.id}`}
                    className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-sm relative group transition-all text-left shadow-md"
                  >
                    <div className="flex gap-2.5">
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-sm bg-black overflow-hidden shrink-0 border border-white/10">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="text-xs font-sans font-semibold tracking-wide text-zinc-100 uppercase truncate">
                          {item.product.name}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-[10px] text-gold font-sans mt-0.5">
                          <span>{item.size}</span>
                          {item.concentration && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="truncate">{item.concentration}</span>
                            </>
                          )}
                        </div>

                        <div className="text-xs font-serif text-gold mt-0.5">
                          {formatBDT(item.unitPrice)}
                        </div>
                      </div>

                      {/* Remove button top right */}
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-rose-400 p-1 border border-zinc-700 hover:border-rose-400 rounded-sm bg-black/50 transition-colors cursor-pointer shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quantity controls at bottom */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-sans">Quantity</span>
                      <div className="flex items-center border border-zinc-700 bg-black rounded-sm overflow-hidden">
                        <button 
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-zinc-200 select-none">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* LUXURY CHECKOUT & ADDRESS INPUT VIEW */
            <div className="space-y-6">
              {orderCompleted ? (
                /* ORDER COMPLETED CONFIRMATION SCREEN */
                <div className="text-center py-10 space-y-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-gold" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-light tracking-wide text-luxury-white">ORDER COMMISSIONED</h3>
                    <p className="text-[9px] text-gold uppercase tracking-widest font-sans font-medium">Decantre Invoice No: DXR-{(100000 + Math.floor(Math.random() * 900000))}</p>
                  </div>

                  <div className="bg-[#080808] p-5 rounded-sm border border-gold/10 text-left text-[11px] space-y-3 font-light text-zinc-300 font-sans">
                    <p className="font-semibold text-luxury-white uppercase tracking-wider text-center border-b border-white/5 pb-2">Decantre Courier Shipment Receipt</p>
                    <p><strong className="text-zinc-500 uppercase tracking-wider">Noble Client:</strong> {shippingInfo.fullName}</p>
                    <p><strong className="text-zinc-500 uppercase tracking-wider">Email Address:</strong> {shippingInfo.email}</p>
                    <p><strong className="text-zinc-500 uppercase tracking-wider">Destination:</strong> {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.zip}</p>
                    <p><strong className="text-zinc-500 uppercase tracking-wider">Selected Decants:</strong> {cart.map(i => `${i.product.name} (${i.size}) x${i.quantity}`).join(', ')}</p>
                    <p className="pt-2 border-t border-white/5 text-right text-xs font-serif font-light text-gold">Paid Grand Total: {formatBDT(cartTotal)}</p>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-sans font-light leading-relaxed">
                    An elite courier tracking link has been forwarded to your email address. Our luxury master perfumers are already packing your pristine presentation chest with white-glove inspection.
                  </p>

                  <button
                    onClick={handleResetCheckout}
                    className="w-full bg-transparent border border-gold text-gold font-sans font-bold uppercase tracking-[0.2em] text-[10px] py-3.5 rounded-sm hover:bg-gold hover:text-black transition-all shadow-xl"
                  >
                    Return to Decantre
                  </button>
                </div>
              ) : (
                /* ACTIVE FORM FILLING */
                <form onSubmit={handleCheckoutSubmit} className="space-y-5 text-left">
                  <div className="space-y-1">
                    <h3 className="text-xs font-sans font-semibold tracking-wider text-gold uppercase">1. Ship-to Address Details</h3>
                    <p className="text-[9px] text-zinc-500">All packages require an authorized adult signature on courier handover.</p>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">Full Noble Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder=""
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                        className="w-full bg-black border border-white/5 rounded-sm px-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">Elite Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder=""
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className="w-full bg-black border border-white/5 rounded-sm px-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">Suite / Street Address</label>
                      <input 
                        type="text" 
                        required
                        placeholder=""
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full bg-black border border-white/5 rounded-sm px-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">City</label>
                        <input 
                          type="text" 
                          required
                          placeholder=""
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                          className="w-full bg-black border border-white/5 rounded-sm px-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">Postal Code</label>
                        <input 
                          type="text" 
                          required
                          placeholder=""
                          value={shippingInfo.postalCode}
                          onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                          className="w-full bg-black border border-white/5 rounded-sm px-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-white/5">
                    <h3 className="text-xs font-sans font-semibold tracking-wider text-gold uppercase">2. Secured Vault Payment</h3>
                    <p className="text-[9px] text-zinc-500">Pristine 256-bit bank-level tokenized transaction.</p>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">Cardholder Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder=""
                        value={shippingInfo.cardName}
                        onChange={(e) => setShippingInfo({...shippingInfo, cardName: e.target.value})}
                        className="w-full bg-black border border-white/5 rounded-sm px-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">Credit Card Number</label>
                      <input 
                        type="text" 
                        required
                        placeholder=""
                        maxLength={19}
                        value={shippingInfo.cardNumber}
                        onChange={(e) => setShippingInfo({...shippingInfo, cardNumber: e.target.value})}
                        className="w-full bg-black border border-white/5 rounded-sm pl-10 pr-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                      />
                      <CreditCard className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-7.5" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">Expiry Date</label>
                        <input 
                          type="text" 
                          required
                          placeholder=""
                          maxLength={5}
                          value={shippingInfo.cardExpiry}
                          onChange={(e) => setShippingInfo({...shippingInfo, cardExpiry: e.target.value})}
                          className="w-full bg-black border border-white/5 rounded-sm px-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">Security CVV</label>
                        <input 
                          type="password" 
                          required
                            placeholder=""
                          maxLength={4}
                          value={shippingInfo.cardCvv}
                          onChange={(e) => setShippingInfo({...shippingInfo, cardCvv: e.target.value})}
                          className="w-full bg-black border border-white/5 rounded-sm px-3 py-2 text-xs font-light text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-gold/50"
                        />
                      </div>
                    </div>

                    {/* Gift Wrap Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-black border border-gold/10 rounded-sm mt-2">
                      <input 
                        type="checkbox"
                        id="gift-wrap-checkbox"
                        checked={shippingInfo.giftWrap}
                        onChange={(e) => setShippingInfo({...shippingInfo, giftWrap: e.target.checked})}
                        className="rounded-sm text-gold focus:ring-gold h-4 w-4 bg-black border-white/5"
                      />
                      <label htmlFor="gift-wrap-checkbox" className="text-[11px] text-zinc-400 font-sans font-light cursor-pointer select-none">
                        <strong className="text-gold font-medium">Include Presentation Box (+{formatBDT(15)})</strong>
                        <br />Pack bottles inside a hand-stitched black velvet box with custom wax seal.
                      </label>
                    </div>
                  </div>

                  {/* Checkout actions */}
                  <div className="pt-4 flex gap-3 font-sans">
                    <button 
                      type="button"
                      onClick={() => setIsCheckoutMode(false)}
                      className="flex-1 border border-white/5 text-zinc-400 hover:text-white hover:bg-black text-[10px] font-bold uppercase tracking-widest py-3.5 rounded-sm transition-colors"
                    >
                      Back to Cart
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isProcessingOrder}
                      className="flex-1 bg-transparent border border-gold hover:bg-gold hover:text-black text-gold font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-sm shadow-2xl flex items-center justify-center gap-2 transition-all"
                    >
                      {isProcessingOrder ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Authorize order</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Bottom Footer Section: Pricing calculations (Hidden once order is complete) */}
        {!orderCompleted && cart.length > 0 && (
          <div className="p-3 sm:p-4 bg-[#080808] border-t border-white/10 space-y-2.5 w-full max-w-full overflow-hidden">
            <div className="flex justify-between items-center gap-3 text-[11px] sm:text-xs font-sans uppercase tracking-[0.2em] text-zinc-400">
              <span className="font-semibold text-zinc-300">Cart Total</span>
              <span className="text-gold text-base font-bold font-mono">{formatBDT(Math.max(0, cartSubtotal - discountAmount))}</span>
            </div>

            {/* Primary Button action */}
            {!isCheckoutMode ? (
              <div className="grid gap-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full h-10 bg-gold text-black hover:bg-gold/90 font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-[11px] rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="whitespace-nowrap">Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full h-10 bg-zinc-950 border border-zinc-700 text-zinc-300 hover:border-gold/50 hover:text-white font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-[11px] rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="whitespace-nowrap">View Full Cart</span>
                </button>
              </div>
            ) : null}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
