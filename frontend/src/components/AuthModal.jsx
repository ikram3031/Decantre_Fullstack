import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Key, ShieldCheck, ShoppingBag, LogOut, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal = () => {
  const {
    user,
    setUser,
    isAuthModalOpen,
    authModalMode,
    setAuthModal,
    addToast
  } = useApp();

  const [mode, setMode] = useState(authModalMode); // 'login' | 'register' | 'profile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize internal state with global state trigger
  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setAuthModal(false);
    // Reset fields
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both your email and password.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Security credentials must be at least 6 characters.', 'error');
      return;
    }

    setIsLoading(true);
    // Realistic luxury loading simulation
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(false);

    const displayName = email.split('@')[0];
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const loggedInUser = {
      name: capitalizedName,
      email: email,
      tier: 'Elite Connoisseur',
      memberSince: 'July 2026',
      orders: [
        { id: 'DEC-883192', date: '2026-07-15', total: 'BDT 12,450', status: 'Delivered' },
        { id: 'DEC-941031', date: '2026-07-19', total: 'BDT 8,900', status: 'Processing' }
      ]
    };

    setUser(loggedInUser);
    addToast(`Welcome back to Decantre, ${capitalizedName}!`, 'success');
    handleClose();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      addToast('Please complete all fields.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Your passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Security credentials must be at least 6 characters.', 'error');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    const registeredUser = {
      name: name,
      email: email,
      tier: 'Privé Connoisseur',
      memberSince: 'July 2026',
      orders: []
    };

    setUser(registeredUser);
    addToast(`Welcome to the Decantre Inner Circle, ${name}!`, 'success');
    handleClose();
  };

  const handleLogout = () => {
    setUser(null);
    addToast('You have been successfully logged out of your private session.', 'info');
    handleClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className="relative w-full max-w-md bg-[#050505] border border-gold/30 rounded-none overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Top Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-gold/10 via-gold to-gold/10" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-gold border border-gold rounded-full transition-colors hover:bg-white/5 cursor-pointer"
            aria-label="Close credentials panel"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-sans font-semibold block mb-2">
              Decantre Membership
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-white tracking-widest uppercase">
              {mode === 'profile' ? 'My Atelier' : mode === 'login' ? 'Inner Circle Sign In' : 'Exclusive Registry'}
            </h2>
          </div>

          {/* Render Profile Content */}
          {mode === 'profile' && user ? (
            <div className="space-y-6">
              {/* Profile Card Summary */}
              <div className="p-5 border border-gold/15 bg-zinc-950/50 rounded-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full filter blur-xl pointer-events-none" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/30 flex items-center justify-center rounded-none shrink-0 text-gold">
                    <User className="w-6 h-6 stroke-[1.25]" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h3 className="text-lg font-serif font-light text-white truncate">{user.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Award className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="text-[10px] text-gold uppercase tracking-[0.15em] font-sans font-bold">
                        {user.tier}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                  <span>MEMBER SINCE</span>
                  <span className="text-zinc-300 font-sans uppercase tracking-widest">{user.memberSince}</span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                  Order History ({user.orders?.length || 0})
                </h4>
                {user.orders && user.orders.length > 0 ? (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                    {user.orders.map((order) => (
                      <div key={order.id} className="p-3 bg-zinc-950 border border-white/5 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono text-zinc-300 block font-semibold">{order.id}</span>
                          <span className="text-[10px] text-zinc-500">{order.date}</span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="font-sans text-gold block font-semibold">{order.total}</span>
                          <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-zinc-900 border border-gold/20 text-gold font-medium inline-block">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-950/20 border border-dashed border-white/5 text-center">
                    <p className="text-xs text-zinc-500 font-light font-sans">
                      You haven't commissioned any luxury fragrances yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Log out CTA */}
              <button
                onClick={handleLogout}
                className="w-full py-3.5 border border-rose-500/30 hover:border-rose-500 bg-rose-950/10 hover:bg-rose-950/30 text-rose-300 hover:text-white font-sans text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Log Out Session</span>
              </button>
            </div>
          ) : (
            /* Forms for Login / Register */
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gold/60 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Alexander Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 focus:border-gold/50 rounded-none py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-600"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gold/60 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="name@exclusive.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 focus:border-gold/50 rounded-none py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold block">
                  Password Key
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gold/60 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 focus:border-gold/50 rounded-none py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-600"
                    required
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-gold/60 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 focus:border-gold/50 rounded-none py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-600"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-gold via-[#DAA520] to-gold hover:opacity-90 disabled:opacity-50 text-black font-sans text-xs uppercase tracking-[0.25em] font-bold transition-opacity flex items-center justify-center gap-2 cursor-pointer rounded-none border-none shadow-md"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-black border-r-transparent animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{mode === 'login' ? 'Request Session Entry' : 'Create Member Credentials'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Toggle Mode */}
              <div className="text-center pt-2">
                {mode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-gold transition-colors font-sans cursor-pointer bg-transparent border-none outline-none"
                  >
                    Don't have credentials? <span className="text-gold font-bold underline">Register here</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-gold transition-colors font-sans cursor-pointer bg-transparent border-none outline-none"
                  >
                    Already registered? <span className="text-gold font-bold underline">Login here</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
