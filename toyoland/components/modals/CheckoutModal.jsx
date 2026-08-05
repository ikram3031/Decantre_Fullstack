'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, CheckCircle2, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { setCheckoutOpen } from '../../store/uiSlice';
import { clearCart } from '../../store/cartSlice';
import { formatPrice } from '../../lib/utils';

// Demo Checkout Modal
export default function CheckoutModal() {
  const dispatch = useDispatch();
  const { isCheckoutOpen } = useSelector((state) => state.ui);
  const { items } = useSelector((state) => state.cart);

  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '4242 •••• •••• 4242',
  });

  if (!isCheckoutOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep('success');
    dispatch(clearCart());
  };

  const handleClose = () => {
    dispatch(setCheckoutOpen(false));
    setStep('form');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={handleClose} />

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-heading font-extrabold text-lg text-gray-900">
              {step === 'form' ? 'Checkout - Toyoland' : 'Order Placed!'}
            </h3>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ee818d]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ee818d]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Shipping Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Playful Lane"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ee818d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ee818d]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="10001"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ee818d]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span className="font-semibold text-gray-800">Demo Credit Card</span>
                  <span className="text-gray-400 text-[11px] ml-auto">4242 •••• 4242</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-600">Total Order Amount:</span>
              <span className="font-extrabold text-[#FF3B30] text-lg">{formatPrice(subtotal)}</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF3B30] hover:bg-[#9B51E0] text-white font-black text-xs uppercase py-3.5 rounded-full shadow-[0_4px_0px_#B3241C] hover:shadow-none hover:translate-y-0.5 transition-all cursor-pointer"
            >
              PAY NOW & PLACE ORDER
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-2xl text-gray-900">
                Order Confirmed!
              </h4>
              <p className="text-xs text-gray-500">
                Thank you, {formData.fullName || 'Valued Customer'}! Your Toyoland Montessori order is being processed and will ship soon.
              </p>
            </div>

            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-left text-xs text-amber-900 space-y-1">
              <p className="font-bold">Order #: TYL-849201</p>
              <p>Tracking updates will be sent to {formData.email || 'your email'}.</p>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gray-900 text-white font-bold text-xs uppercase py-3 rounded-full hover:bg-gray-800 cursor-pointer"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
