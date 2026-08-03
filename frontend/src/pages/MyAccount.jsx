import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, ShoppingBag, ArrowRight, ShieldCheck, PackageCheck, CircleUserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'wishlist', label: 'Wishlist' },
];

export const MyAccount = () => {
  const { user, setAuthModal, currentTheme } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const isLight = currentTheme === 'light';

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
        <div className={`grid gap-8 lg:grid-cols-[1.2fr_0.8fr]`}> 
          <section className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-white/10 bg-zinc-950/80'} p-8 space-y-8`}> 
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-400 font-semibold">Member Since</p>
                  <h2 className="text-3xl font-serif uppercase tracking-[0.2em]">{user.name || 'Valued Member'}</h2>
                  <p className="text-sm text-zinc-400">{user.email || ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/80'} p-5`}>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Membership Tier</p>
                  <p className="mt-3 text-lg font-semibold text-gold">{user.tier || 'Privé Connoisseur'}</p>
                </div>
                <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/80'} p-5`}>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Contact</p>
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    <p>{user.email}</p>
                    {user.phone && <p>{user.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
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

            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="rounded-sm border border-gold/20 bg-gold/5 p-5">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Private access</p>
                  <p className="mt-3 text-sm text-zinc-300">
                    Your dashboard keeps your account profile, active orders, and saved favorites aligned in one secure place.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Order History</p>
                    <h3 className="text-2xl font-serif tracking-tight">Recent Purchases</h3>
                  </div>
                  <button
                    onClick={() => navigate('/shop')}
                    className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-black hover:bg-gold/90"
                  >
                    Continue Shopping
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {Array.isArray(user.orders) && user.orders.length > 0 ? (
                  <div className="space-y-3">
                    {user.orders.slice(0, 4).map((order) => (
                      <div key={order.id || order.orderNumber} className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/80'} p-4`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-400">Order</p>
                            <p className="mt-1 text-sm font-semibold">{order.id || order.orderNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-400">Total</p>
                            <p className="mt-1 text-sm font-semibold">{order.total || order.amount || '৳0'}</p>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-zinc-400">
                          <p>{order.date || 'Date unavailable'}</p>
                          <p>{order.status ? `Status: ${order.status}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/80'} p-6 text-center`}>
                    <p className="text-sm text-zinc-400">No recent orders found. Your purchase history will appear here after checkout.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Saved Fragrances</p>
                    <h3 className="text-2xl font-serif tracking-tight">Wishlist</h3>
                  </div>
                </div>
                <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/80'} p-6 text-center`}>
                  <p className="text-sm text-zinc-400">Your saved fragrance shortlist is shown here once you add products to favorites.</p>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-white/10 bg-zinc-950/80'} p-6`}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Quick Actions</p>
              <div className="mt-5 space-y-3">
                <button
                  onClick={() => navigate('/wishlist')}
                  className="w-full rounded-sm border border-gold/30 bg-black/20 px-4 py-3 text-left text-sm text-white hover:border-gold hover:bg-gold/10"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gold" />
                    View Wishlist
                  </span>
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full rounded-sm border border-gold/30 bg-black/20 px-4 py-3 text-left text-sm text-white hover:border-gold hover:bg-gold/10"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gold" />
                    Review Cart
                  </span>
                </button>
              </div>
            </div>

            <div className={`rounded-sm border ${isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-900/80'} p-6`}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Member Notes</p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                Your account dashboard keeps your membership details, orders, and preferred fragrances in one private place.
              </p>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                <p><span className="font-semibold text-zinc-100">Email:</span> {user.email}</p>
                {user.phone && <p><span className="font-semibold text-zinc-100">Phone:</span> {user.phone}</p>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
