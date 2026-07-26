import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Key, ShieldCheck, ShoppingBag, LogOut, Award, ArrowLeft, RefreshCw, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loginMember, registerMember, verifyMemberOtp, resendMemberOtp } from '../lib/api';

export const AuthModal = () => {
  const {
    user,
    setUser,
    isAuthModalOpen,
    authModalMode,
    setAuthModal,
    addToast
  } = useApp();

  const [mode, setMode] = useState(authModalMode); // 'login' | 'register' | 'otp' | 'profile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP State (6 Digits)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const otpInputsRef = useRef([]);

  // Synchronize internal state with global state trigger
  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode, isAuthModalOpen]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (mode === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, resendTimer]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setAuthModal(false);
    // Reset fields
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setOtpValues(['', '', '', '', '', '']);
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    // Auto-advance to next input field
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otpValues];
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });
    setOtpValues(newOtp);

    const focusIdx = Math.min(digits.length, 5);
    otpInputsRef.current[focusIdx]?.focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otpValues.join('');
    if (code.length !== 6) {
      addToast('Please enter the full 6-digit verification code.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyMemberOtp({ email, otp: code });
      const userData = response.user || response.data?.user || response.data || {};
      const accessToken = response.accessToken || response.token || response.data?.token || response.data?.accessToken;
      const refreshToken = response.refreshToken || response.data?.refreshToken;

      const displayName = userData.name || name || email.split('@')[0];
      const verifiedUser = {
        name: displayName,
        email: userData.email || email,
        phone: userData.phone || phone,
        tier: userData.tier || 'Privé Connoisseur',
        raw: userData
      };

      setUser(verifiedUser, { accessToken, refreshToken });
      addToast(`OTP verified successfully! Welcome, ${displayName}.`, 'success');
      handleClose();
    } catch (err) {
      // Show generic error for any backend failure
      addToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTPCode = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    try {
      await resendMemberOtp({ email });
      addToast('A new 6-digit verification code has been dispatched to your email.', 'success');
      setResendTimer(60);
      setOtpValues(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      // Generic resend error
      addToast('Failed to resend verification code. Please try again later.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both your email and password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginMember({ email, password });
      
      // If backend signals OTP required
      if (response.requiresOtp || response.data?.requiresOtp) {
        setMode('otp');
        setResendTimer(60);
        addToast('Verification required. Enter the 6-digit code sent to your email.', 'info');
        return;
      }

      const userData = response.user || response.data?.user || response.data || {};
      const accessToken = response.accessToken || response.token || response.data?.token || response.data?.accessToken;
      const refreshToken = response.refreshToken || response.data?.refreshToken;

      const displayName = userData.name || userData.fullName || email.split('@')[0];
      const loggedInUser = {
        name: displayName,
        email: userData.email || email,
        tier: userData.tier || 'Elite Connoisseur',
        raw: userData
      };

      setUser(loggedInUser, { accessToken, refreshToken });
      addToast(`Login successful! Welcome back, ${displayName}.`, 'success');
      handleClose();
    } catch (err) {
      // Generic login error
      addToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      addToast('Please complete all fields.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Your passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const memberPayload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      };

      const response = await registerMember(memberPayload);
      
      const userData = response.user || response.data || response;
      const accessToken = response.accessToken || response.token || response.data?.token || response.data?.accessToken;
      const refreshToken = response.refreshToken || response.data?.refreshToken;

      if (accessToken || refreshToken) {
        const displayName = userData.name || name;
        const registeredUser = {
          name: displayName,
          email: userData.email || email,
          phone: userData.phone || phone,
          tier: 'Privé Connoisseur',
          raw: userData
        };
        setUser(registeredUser, { accessToken, refreshToken });
        addToast(`Welcome to Decantre, ${displayName}!`, 'success');
        handleClose();
      } else {
        // Switch to OTP verification UI if backend requires verification
        setMode('otp');
        setResendTimer(60);
        addToast('Account created! Please verify the 6-digit code sent to your email.', 'success');
      }
    } catch (err) {
      // Generic registration error
      addToast('Registration failed. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
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
          className="relative w-full max-w-md bg-zinc-900/95 border border-zinc-700/80 rounded-sm overflow-hidden shadow-2xl p-6 sm:p-8"
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
              Decantre
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-white tracking-widest uppercase">
              {mode === 'profile' ? 'My Profile' : mode === 'otp' ? 'OTP Verification' : mode === 'login' ? 'Member Login' : 'Become a Member'}
            </h2>
          </div>

          {/* Mode Render: OTP VERIFICATION VIEW */}
          {mode === 'otp' ? (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-xs text-zinc-300 font-sans font-light leading-relaxed">
                  Enter the 6-digit authentication code sent to:
                </p>
                <p className="text-xs font-mono text-gold font-semibold">{email}</p>
              </div>

              {/* 6 Digit Input Grid */}
              <div className="flex justify-between items-center gap-2 py-2" onPaste={handleOTPPaste}>
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(idx, e)}
                    className="w-11 h-13 text-center bg-black border border-zinc-700 focus:border-gold rounded-sm text-lg font-mono font-bold text-gold focus:outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              {/* Verification Button */}
              <button
                type="submit"
                disabled={isLoading || otpValues.join('').length !== 6}
                className="w-full py-4 bg-gradient-to-r from-gold via-[#DAA520] to-gold hover:opacity-90 disabled:opacity-40 text-black font-sans text-xs uppercase tracking-[0.25em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none rounded-none shadow-lg"
              >
                {isLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-black border-r-transparent animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Code</span>
                  </>
                )}
              </button>

              {/* Resend Controls */}
              <div className="flex items-center justify-between pt-2 text-[11px] font-sans">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer bg-transparent border-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOTPCode}
                  disabled={resendTimer > 0 || isResending}
                  className={`flex items-center gap-1.5 font-semibold bg-transparent border-none cursor-pointer ${
                    resendTimer > 0 || isResending ? 'text-zinc-600 cursor-not-allowed' : 'text-gold hover:underline'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </form>
          ) : mode === 'profile' && user ? (
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
                  <span className="text-zinc-300 font-sans uppercase tracking-widest">{user.memberSince || 'July 2026'}</span>
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
                      className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 rounded-sm py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-500"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gold/60 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="e.g. 01712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 rounded-sm py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-500"
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
                    className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 rounded-sm py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gold/60 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 rounded-sm py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-500"
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
                      className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 rounded-sm py-3.5 pl-11 pr-4 text-xs font-sans text-white focus:outline-none transition-colors placeholder-zinc-500"
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
                      <span>{mode === 'login' ? 'Log In' : 'Become a Member'}</span>
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
                    Don't have an account? <span className="text-gold font-bold underline">Register here</span>
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
