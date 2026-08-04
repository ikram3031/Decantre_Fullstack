import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, ShoppingBag, ArrowRight, ShieldCheck, LogOut, Edit3, Clipboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { updateMember } from '../lib/api';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'wishlist', label: 'Wishlist' },
];

export const MyAccount = () => {
  const { user, setUser, setAuthModal, currentTheme, addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const isLight = currentTheme === 'light';

  // Profile Update Form State
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Billing address state
  const [billingAddress, setBillingAddress] = useState(user?.billingInfo?.address || '');
  const [billingCity, setBillingCity] = useState(user?.billingInfo?.city || '');
  const [billingState, setBillingState] = useState(user?.billingInfo?.state || '');
  const [billingZip, setBillingZip] = useState(user?.billingInfo?.zip || '');
  const [billingCountry, setBillingCountry] = useState(user?.billingInfo?.country || 'Bangladesh');

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState(user?.shippingInfo?.address || '');
  const [shippingCity, setShippingCity] = useState(user?.shippingInfo?.city || '');
  const [shippingState, setShippingState] = useState(user?.shippingInfo?.state || '');
  const [shippingZip, setShippingZip] = useState(user?.shippingInfo?.zip || '');
  const [shippingCountry, setShippingCountry] = useState(user?.shippingInfo?.country || 'Bangladesh');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name is required.', 'error');
      return;
    }
    setIsUpdating(true);
    try {
      const billingInfo = {
        fullName: name.trim(),
        email: user.email,
        phone: user.phone || '',
        address: billingAddress.trim(),
        city: billingCity.trim(),
        state: billingState.trim(),
        zip: billingZip.trim(),
        country: billingCountry.trim(),
      };
      
      const shippingInfo = {
        fullName: name.trim(),
        email: user.email,
        phone: user.phone || '',
        address: shippingAddress.trim(),
        city: shippingCity.trim(),
        state: shippingState.trim(),
        zip: shippingZip.trim(),
        country: shippingCountry.trim(),
      };

      const updatedUser = await updateMember(user.id || user._id, {
        name: name.trim(),
        billingInfo,
        shippingInfo
      });

      // Update state and storage
      setUser({ ...user, ...updatedUser });
      addToast('Your personal profile and address books have been updated.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyBillingToShipping = () => {
    setShippingAddress(billingAddress);
    setShippingCity(billingCity);
    setShippingState(billingState);
    setShippingZip(billingZip);
    setShippingCountry(billingCountry);
    addToast('Billing address copied to shipping address.', 'info');
  };

  if (!user) {
    return (
      <div className={`min-h-screen py-20 ${isLight ? 'bg-white text-black' : 'bg-[#050505] text-white'} transition-colors duration-500`}> 
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-white/10 bg-zinc-900/80'} p-10 text-center space-y-6`}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-serif uppercase tracking-[0.2em]">My Account</h1>
            <p className="max-w-xl mx-auto text-sm text-zinc-400 leading-relaxed">
              Please sign in or create an account to access your membership dashboard, order history and personalized fragrance recommendations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setAuthModal(true, 'login')}
                className="inline-flex items-center justify-center rounded-sm bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all hover:bg-gold/90"
              >
                Login
              </button>
              <button
                onClick={() => setAuthModal(true, 'register')}
                className="inline-flex items-center justify-center rounded-sm border border-white/10 bg-black/70 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-white/10"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-16 ${isLight ? 'bg-white text-black' : 'bg-[#050505] text-white'} transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"> 
          
          <section className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-white/10 bg-zinc-950/80'} p-6 sm:p-8 space-y-8`}> 
            
            {/* Header / Avatar block */}
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 font-semibold mb-1">Member Since June 2026</p>
                  <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-[0.15em] text-white leading-tight">
                    {user.name || 'Valued Member'}
                  </h2>
                </div>
              </div>

              {/* Box Info Row */}
              <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/40'} p-5 sm:p-6`}>
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold mb-4">Member Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Full Name</span>
                    <span className="font-semibold text-white">{user.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Email Address</span>
                    <span className="font-semibold text-white">{user.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Phone Number</span>
                    <span className="font-semibold text-white">{user.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Status</span>
                    <span className="font-semibold text-gold">Active Session</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-sm border px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold transition-colors ${
                    activeTab === tab.key
                      ? 'border-gold bg-gold text-black'
                      : isLight
                        ? 'border-zinc-300 bg-white text-zinc-700'
                        : 'border-white/10 bg-zinc-900 text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Informational Banner */}
                <div className="rounded-sm border border-gold/20 bg-gold/5 p-5">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 mb-1">Private Access Control</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Update your account profiles, delivery addresses, and billing credentials below. Email address and primary phone configurations cannot be modified due to authentication locks.
                  </p>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  
                  {/* Basic Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-200 border-b border-white/5 pb-2">
                      Profile Name
                    </h3>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">Display Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Grid: Billing & Shipping Address Edit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    
                    {/* Billing address block */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-200 border-b border-white/5 pb-2">
                        Billing Address
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">Street Address</label>
                          <input
                            type="text"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                            placeholder="Street address / house / apartment"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">City</label>
                            <input
                              type="text"
                              value={billingCity}
                              onChange={(e) => setBillingCity(e.target.value)}
                              className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">State / Division</label>
                            <input
                              type="text"
                              value={billingState}
                              onChange={(e) => setBillingState(e.target.value)}
                              className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                              placeholder="State"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">ZIP / Postal Code</label>
                            <input
                              type="text"
                              value={billingZip}
                              onChange={(e) => setBillingZip(e.target.value)}
                              className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                              placeholder="ZIP"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">Country</label>
                            <input
                              type="text"
                              value={billingCountry}
                              onChange={(e) => setBillingCountry(e.target.value)}
                              className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping address block */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-200">
                          Shipping Address
                        </h3>
                        <button
                          type="button"
                          onClick={copyBillingToShipping}
                          className="text-[9px] uppercase tracking-wider font-bold text-gold hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        >
                          <Clipboard className="w-3 h-3" />
                          Same as Billing
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">Street Address</label>
                          <input
                            type="text"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                            placeholder="Street address / house / apartment"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">City</label>
                            <input
                              type="text"
                              value={shippingCity}
                              onChange={(e) => setShippingCity(e.target.value)}
                              className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">State / Division</label>
                            <input
                              type="text"
                              value={shippingState}
                              onChange={(e) => setShippingState(e.target.value)}
                              className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                              placeholder="State"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">ZIP / Postal Code</label>
                            <input
                              type="text"
                              value={shippingZip}
                              onChange={(e) => setShippingZip(e.target.value)}
                              className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                              placeholder="ZIP"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">Country</label>
                            <input
                              type="text"
                              value={shippingCountry}
                              onChange={(e) => setShippingCountry(e.target.value)}
                              className="w-full rounded-sm border border-white/10 bg-zinc-900/60 p-3 text-xs text-white focus:border-gold focus:outline-none"
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black hover:bg-gold/90 transition-all cursor-pointer disabled:opacity-55"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isUpdating ? 'Saving Changes…' : 'Save Address Books'}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Transaction History</p>
                    <h3 className="text-2xl font-serif tracking-tight">Recent Purchases</h3>
                  </div>
                  <button
                    onClick={() => navigate('/shop')}
                    className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-black hover:bg-gold/90"
                  >
                    Shop Fragrances
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {Array.isArray(user.orders) && user.orders.length > 0 ? (
                  <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/20'} overflow-hidden shadow-2xl`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className={`border-b ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-600' : 'border-white/10 bg-zinc-950/50 text-zinc-400'} uppercase tracking-wider font-semibold`}>
                            <th className="py-4 px-4 font-sans font-bold">Order ID</th>
                            <th className="py-4 px-4 font-sans font-bold">Date</th>
                            <th className="py-4 px-4 font-sans font-bold">Status</th>
                            <th className="py-4 px-4 font-sans font-bold">Payment Method</th>
                            <th className="py-4 px-4 font-sans font-bold text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {user.orders.map((order) => {
                            const orderIdRaw = order.id || order.orderNumber || '';
                            const finalOrderId = orderIdRaw ? (orderIdRaw.toString().startsWith('D') ? orderIdRaw : `D${orderIdRaw}`) : 'N/A';
                            return (
                              <tr key={order.id || order.orderNumber} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 font-mono font-semibold text-white">{finalOrderId}</td>
                                <td className="py-4 px-4 text-zinc-300">{order.date || 'N/A'}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold ${
                                    order.status === 'Completed' || order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                                    order.status === 'Pending' || order.status === 'Processing' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-500/20 text-zinc-400'
                                  }`}>
                                    {order.status || 'Pending'}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-zinc-400">{order.paymentMethod || 'Cash on Delivery'}</td>
                                <td className="py-4 px-4 text-right text-gold font-semibold">{order.total || order.amount || '৳0'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/40'} p-8 text-center`}>
                    <p className="text-sm text-zinc-400">No purchase records found. Your completed orders will populate in this table.</p>
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Sovereign Curations</p>
                    <h3 className="text-2xl font-serif tracking-tight">Saved Favorites</h3>
                  </div>
                </div>
                <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/40'} p-8 text-center`}>
                  <p className="text-sm text-zinc-400">Your saved fragrance shortlist will appear here once you select items.</p>
                </div>
              </div>
            )}
          </section>

          {/* Quick Actions sidebar */}
          <aside className="space-y-4">
            <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-white/10 bg-zinc-950/80'} p-6`}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 mb-5">Quick Actions</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/wishlist')}
                  className="w-full rounded-sm border border-gold/30 bg-black/20 px-4 py-3 text-left text-xs uppercase tracking-wider font-bold text-white hover:border-gold hover:bg-gold/10 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gold" />
                    View Wishlist
                  </span>
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full rounded-sm border border-gold/30 bg-black/20 px-4 py-3 text-left text-xs uppercase tracking-wider font-bold text-white hover:border-gold hover:bg-gold/10 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gold" />
                    Review Cart
                  </span>
                </button>
                <button
                  onClick={() => {
                    setUser(null);
                    navigate('/');
                  }}
                  className="w-full rounded-sm border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-left text-xs uppercase tracking-wider font-bold text-rose-400 hover:border-rose-500 hover:bg-rose-500/20 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Log Out Session
                  </span>
                </button>
              </div>
            </div>

            <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/40'} p-6`}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 mb-4">Member Notes</p>
              <p className="text-xs leading-relaxed text-zinc-400">
                Your credentials and active cart states persist encrypted inside this browser sandbox session. Always remember to log out of shared terminals.
              </p>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
