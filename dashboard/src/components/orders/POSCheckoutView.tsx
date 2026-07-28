import React from 'react';
import {
  Search,
  ChevronLeft,
  X,
  Plus,
  PlusCircle,
  MinusCircle,
  CreditCard,
  User as UserIcon,
  ShoppingBag,
  ShoppingBag as CartIcon,
} from 'lucide-react';
import { Customer, Product } from '../../types';

export interface CartItem {
  product: Product;
  selectedVariant?: any;
  quantity: number;
}

interface POSCheckoutViewProps {
  onClose: () => void;
  customerType: 'guest' | 'existing';
  setCustomerType: (type: 'guest' | 'existing') => void;
  customers: Customer[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  guestName: string;
  setGuestName: (name: string) => void;
  guestEmail: string;
  setGuestEmail: (email: string) => void;
  guestPhone: string;
  setGuestPhone: (phone: string) => void;
  products: Product[];
  productSearch: string;
  setProductSearch: (search: string) => void;
  selectedVariants: Record<string | number, string | number>;
  setSelectedVariants: (variants: Record<string | number, string | number>) => void;
  getSelectedVariant: (product: Product) => any;
  cartItems: CartItem[];
  addToCart: (product: Product, variant?: any) => void;
  updateCartQty: (productId: string | number, variantId: string | number | undefined, delta: number) => void;
  removeFromCart: (productId: string | number, variantId?: string | number) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  isPaid: boolean;
  setIsPaid: (paid: boolean) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  handleConfirmOrder: () => void;
  isSubmitting: boolean;
}

export const POSCheckoutView: React.FC<POSCheckoutViewProps> = ({
  onClose,
  customerType,
  setCustomerType,
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  guestName,
  setGuestName,
  guestEmail,
  setGuestEmail,
  guestPhone,
  setGuestPhone,
  products,
  productSearch,
  setProductSearch,
  selectedVariants,
  setSelectedVariants,
  getSelectedVariant,
  cartItems,
  addToCart,
  updateCartQty,
  removeFromCart,
  paymentMethod,
  setPaymentMethod,
  isPaid,
  setIsPaid,
  orderNotes,
  setOrderNotes,
  handleConfirmOrder,
  isSubmitting,
}) => {
  const filteredProductsCatalog = products.filter((p) => {
    const nameMatch = p.name ? p.name.toLowerCase().includes(productSearch.toLowerCase()) : false;
    const skuMatch = p.sku ? p.sku.toLowerCase().includes(productSearch.toLowerCase()) : false;
    return nameMatch || skuMatch;
  });

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice ?? item.product.price ?? 0);
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-950 font-sans">Create In-Store Direct Sale</h1>
            <p className="text-xs text-slate-500 mt-0.5">Quickly register custom sold-directly sales counter transactions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-500 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left panel: Product Selector & Customer Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Customer Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <UserIcon className="h-4 w-4 text-slate-500" />
              Customer Registration
            </h2>

            <div className="flex gap-2.5 p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setCustomerType('guest')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${customerType === 'guest' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Guest / New Walk-In
              </button>
              <button
                type="button"
                onClick={() => setCustomerType('existing')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${customerType === 'existing' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Select Existing Customer
              </button>
            </div>

            {customerType === 'guest' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 focus:border-slate-950 outline-none rounded-lg text-xs transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Email</label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 focus:border-slate-950 outline-none rounded-lg text-xs transition"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 focus:border-slate-950 outline-none rounded-lg text-xs transition"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Select Registered Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-slate-950 outline-none rounded-lg text-xs transition cursor-pointer"
                  >
                    <option value="">-- Click to select customer --</option>
                    {customers.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.name} ({c.email || 'No email'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. Product Selector / Catalog */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-slate-500" />
                Product Catalog Select
              </h2>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 pointer-events-none">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-950 rounded-lg text-xs outline-none transition w-full sm:w-48"
                />
              </div>
            </div>

            {/* Product list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredProductsCatalog.map((product) => {
                const productId = product.id || product._id || '';
                const selectedVariant = getSelectedVariant(product);
                const price = selectedVariant ? selectedVariant.price : (product.salePrice ?? product.regularPrice ?? product.price ?? 0);
                const availableStock = selectedVariant ? (selectedVariant.stockQuantity ?? selectedVariant.stock ?? 0) : (product.stockQuantity ?? product.stock ?? 0);
                
                const qtyInCart = cartItems.find((item) => 
                  (item.product.id || item.product._id) === productId && 
                  (!selectedVariant || item.selectedVariant?.id === selectedVariant.id)
                )?.quantity || 0;
                const remainingStock = availableStock - qtyInCart;
                
                return (
                  <div
                    key={productId}
                    className={`border rounded-xl p-3 flex flex-col justify-between gap-3.5 transition hover:border-slate-400 hover:shadow-xs relative bg-white ${availableStock <= 0 ? 'opacity-65 border-dashed border-slate-200' : 'border-slate-100'}`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=150&q=80'}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div>
                          <p className="font-bold text-slate-900 text-xs truncate leading-tight" title={product.name}>
                            {product.name}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {selectedVariant ? selectedVariant.sku : (product.sku || 'No SKU')}
                          </p>
                        </div>
                        <div className="flex items-baseline justify-between gap-1 mt-1">
                          <span className="text-xs font-black text-slate-950">
                            ৳{Number(price || 0).toFixed(2)}
                          </span>
                          
                          {availableStock <= 0 ? (
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md font-mono">
                              Out of Stock
                            </span>
                          ) : remainingStock <= 0 ? (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md font-mono">
                              In Cart Limit
                            </span>
                          ) : (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono ${remainingStock <= 5 ? 'text-amber-700 bg-amber-50 border border-amber-100' : 'text-slate-600 bg-slate-50 border border-slate-200/50'}`}>
                              {remainingStock} Avail
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Variant Size Selector */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="border-t border-slate-50 pt-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Decant Size</p>
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((variant: any) => {
                            const isSelected = selectedVariants[productId] === variant.id || (!selectedVariants[productId] && product.variants[0].id === variant.id);
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => setSelectedVariants({ ...selectedVariants, [productId]: variant.id })}
                                className={`px-2 py-1 text-[9px] font-bold rounded-md border transition cursor-pointer select-none ${isSelected ? 'bg-slate-950 border-slate-950 text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                              >
                                {variant.size} - ৳{variant.price}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => addToCart(product, selectedVariant)}
                      disabled={availableStock <= 0 || remainingStock <= 0}
                      className="w-full mt-2 py-1 px-3 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg text-[10px] font-bold cursor-pointer transition select-none flex items-center justify-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add to Order Box
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel: Order items checkout summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CartIcon className="h-4.5 w-4.5 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Checkout Order Box</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Units
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5 px-4">
                <ShoppingBag className="h-8 w-8 text-slate-200 animate-pulse" />
                <p className="text-xs font-semibold text-slate-500">Order Box is empty</p>
                <p className="text-[10px] text-slate-400 max-w-xs">Select products from the catalog on the left to add items to this store transaction.</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Item rows */}
                <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => {
                    const productId = item.product.id || item.product._id || '';
                    const itemPrice = item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice ?? item.product.price ?? 0);
                    const maxStock = item.selectedVariant ? (item.selectedVariant.stockQuantity ?? item.selectedVariant.stock ?? 0) : (item.product.stockQuantity ?? item.product.stock ?? 0);
                    return (
                      <div key={idx} className="py-3 flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {item.selectedVariant ? `Size: ${item.selectedVariant.size}` : 'Standard'} · ৳{Number(itemPrice || 0).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartQty(productId, item.selectedVariant?.id, -1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                          <span className="text-xs font-mono font-bold w-5 text-center text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(productId, item.selectedVariant?.id, 1)}
                            disabled={item.quantity >= maxStock}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => removeFromCart(productId, item.selectedVariant?.id)}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition ml-1.5 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment settings */}
                <div className="border-t border-slate-100 pt-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-950 cursor-pointer"
                      >
                        <option value="Cash">Cash Counter</option>
                        <option value="bKash">bKash Personal</option>
                        <option value="Nagad">Nagad Merchant</option>
                        <option value="Card">Visa / Mastercard</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                      <select
                        value={isPaid ? 'paid' : 'pending'}
                        onChange={(e) => setIsPaid(e.target.value === 'paid')}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-950 cursor-pointer"
                      >
                        <option value="paid">Paid & Settled</option>
                        <option value="pending">Pending Payment</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Transaction Memo (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. bKash trx ID or counter notes"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-950"
                    />
                  </div>
                </div>

                {/* Summary calculations */}
                <div className="border-t border-slate-100 pt-4 space-y-1.5 font-sans">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-medium">
                      ৳{cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Store Tax & Decant Handling</span>
                    <span className="font-mono text-emerald-600 font-bold">Free (Counter)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Total Net Bill</span>
                    <span className="text-lg font-mono font-black text-slate-950">
                      ৳{cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && (
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <CreditCard className="h-4 w-4" />
                  Confirm & Settle Direct Sale
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
