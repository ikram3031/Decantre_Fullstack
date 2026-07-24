import React, { useEffect } from 'react';
import { ShieldCheck, Calendar, Compass, ArrowRight, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ThankYou = () => {
  const {
    shippingInfo,
    orderNumber: apiOrderNumber,
    handleResetCheckout,
    addToast
  } = useApp();

  const orderNumber = apiOrderNumber || ('LX-' + Math.floor(100000 + Math.random() * 900000));
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Greet client elegantly
  useEffect(() => {
    addToast('Your order record has been safely sealed inside our vaults.', 'success');
  }, [addToast]);

  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in text-left">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Success Header Card */}
        <div className="bg-luxury-dark/30 border border-gold/15 p-8 sm:p-12 rounded-sm text-center space-y-6 relative overflow-hidden">
          <div className="absolute -inset-px bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Royal Wax Seal Emblem */}
          <div className="w-20 h-20 bg-gradient-to-br from-gold/30 to-gold/5 border-2 border-gold rounded-full mx-auto flex items-center justify-center shadow-xl shadow-gold/5 relative group hover:scale-105 transition-transform duration-300">
            <Compass className="w-10 h-10 text-gold animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">The Seal of Approval</span>
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-luxury-white tracking-wide">
              ORDER SIGNED & SEALED
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-md mx-auto leading-relaxed">
              We have officially authenticated your credentials and logged your perfume selections inside our Paris ledger. Your decants are currently being prepared.
            </p>
          </div>

          <div className="h-[1px] w-24 bg-gold/20 mx-auto"></div>

          {/* Sourcing credentials metadata */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-semibold pt-2">
            <div className="border border-white/5 bg-black/40 p-3 rounded-sm">
              <span className="block text-[8px] text-zinc-600 mb-1">Ledger S/N</span>
              <span className="text-gold font-bold">{orderNumber}</span>
            </div>
            <div className="border border-white/5 bg-black/40 p-3 rounded-sm">
              <span className="block text-[8px] text-zinc-600 mb-1">Signed Date</span>
              <span className="text-zinc-300">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Certificate of Olfactory Authenticity */}
        <div className="mt-10 border border-gold/20 bg-gradient-to-b from-luxury-dark/30 to-black p-6 sm:p-8 rounded-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-gold/15 pb-4">
            <Sparkles className="w-5 h-5 text-gold shrink-0" />
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-200">
              CERTIFICATE OF OLFACTORY AUTHENTICITY
            </h3>
          </div>

          <div className="space-y-4 text-xs font-sans font-light text-zinc-400 leading-relaxed">
            <p>
              This document certifies that your ordered decants from <span className="text-gold font-semibold">Decantre Atelier d'Art</span> contain 100% genuine botanical oils, cold-pressed raw spices, and hand-aged resins extracted directly from regional sustainable farms in Southern France, Calabria, and Cambodia.
            </p>
            <p>
              Your personal bottle is hand-poured in sterile nitrogen chambers, labeled with your member coordinates, and sealed with high-tensile protective wax.
            </p>

            {shippingInfo.fullName && (
              <div className="border-t border-white/5 pt-4 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">Secured Courier Consignee</span>
                <p className="font-mono text-zinc-300">
                  {shippingInfo.fullName}<br />
                  {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.zip}<br />
                  <span className="text-gold/80 italic">{shippingInfo.email}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Courier dispatch next steps */}
        <div className="mt-10 bg-luxury-dark/10 border border-white/5 p-6 rounded-sm space-y-4">
          <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-zinc-300">WHAT TO EXPECT NEXT</h4>
          <ul className="space-y-3 text-xs font-sans font-light text-zinc-500">
            <li className="flex gap-2">
              <span className="text-gold font-mono">•</span>
              <span>Our master perfumers will decant your selections into your presentation box within 24-48 business hours.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold font-mono">•</span>
              <span>An automated secure tracking credential will be dispatched to your email for real-time custody logging.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold font-mono">•</span>
              <span>Please keep your delivery address accessible for adult signature handover, as mandated by sovereign insurance conditions.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            onClick={handleResetCheckout}
            className="inline-flex items-center gap-2 bg-gold text-black text-xs font-sans font-bold uppercase tracking-widest px-10 py-4 rounded-sm hover:bg-gold/90 transition-all duration-300 shadow-lg shadow-gold/5"
          >
            Return to Sovereign Salon <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
export default ThankYou;
