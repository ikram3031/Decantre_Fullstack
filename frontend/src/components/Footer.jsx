import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Facebook, Mail, Instagram, MapPin, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer = ({ startQuiz, addToast }) => {
  const { wishlist, addToast: appAddToast } = useApp();
  const activeAddToast = addToast || appAddToast;

  const handleWishlistClick = () => {
    if (typeof activeAddToast === 'function') {
      activeAddToast(`You have ${wishlist?.length || 0} item(s) in your private vanity wishlist. Check the catalog or shop to review.`, 'info');
    }
  };

  return (
    <footer id="main-footer" className="bg-black border-t border-gold/15 text-zinc-400 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand Column */}
        <div className="space-y-4 text-left">
          <h3 className="text-sm font-serif font-light tracking-[0.35em] text-gold uppercase">
            Decantre
          </h3>
          <p className="text-[11px] font-sans font-light leading-relaxed text-zinc-400">
            Crafting persistent, hand-formulated, sovereign amber fragrances since the dawn of memory. Each formulation is recorded inside our master ledger in Paris.
          </p>
          <div className="flex items-center gap-2.5 pt-1 text-gold">
            <Compass className="w-4 h-4" />
            <span className="text-[9px] uppercase tracking-[0.25em] font-medium text-gold font-sans">Pure Gold Authenticity</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 text-left">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-200 font-sans">Contact Info</h4>
          <div className="space-y-5 pt-1">
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold text-black shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-sans font-semibold uppercase tracking-wider text-gold">Address</h5>
                <p className="text-[11px] font-sans font-light text-zinc-400 leading-relaxed">
                  Ground Floor, House 20,<br />
                  Road 10, Sector 13,<br />
                  Uttara, Dhaka
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold text-black shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-sans font-semibold uppercase tracking-wider text-gold">Phone</h5>
                <p className="text-[11px] font-sans font-light text-zinc-400">
                  +880 1869-151550
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold text-black shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-sans font-semibold uppercase tracking-wider text-gold">Email</h5>
                <p className="text-[11px] font-sans font-light text-zinc-400 break-all">
                  support@decantrebd.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courier & Services */}
        <div className="space-y-4 text-left">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-200 font-sans">Client Services</h4>
          <ul className="space-y-2 text-[11px] font-sans font-light text-zinc-400">
            <li><Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-and-condition" className="hover:text-gold transition-colors">Terms and Conditions</Link></li>
            <li><Link to="/return-policy" className="hover:text-gold transition-colors">Return & Refund Policy</Link></li>
            <li><Link to="/contact-us" className="hover:text-gold transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Quick Links Column (Updated matching 2nd ss layout) */}
        <div className="space-y-4 text-left">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-200 font-sans">Quick Links</h4>
          <ul className="space-y-2.5 text-[11px] font-sans font-light text-zinc-400">
            <li>
              <Link to="/about-us" className="hover:text-gold transition-colors block">
                About us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-gold transition-colors block">
                FAQ
              </Link>
            </li>
            <li>
              <button 
                onClick={handleWishlistClick}
                className="hover:text-gold transition-colors block text-left cursor-pointer focus:outline-none"
              >
                Wishlist
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Giant Outline Brand Display */}
      <div className="hidden sm:block select-none mt-14 mb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="font-serif font-light tracking-[0.3em] text-transparent [-webkit-text-stroke:1.2px_rgba(255,255,255,0.75)] uppercase text-5xl sm:text-7xl md:text-[6.5rem] lg:text-[9.5rem] xl:text-[11.5rem] leading-none block">
          DECANTRE
        </span>
      </div>

      {/* Bottom copyright row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[9px] text-zinc-500 tracking-wider">
          © 2026 Decantre. All Rights Reserved.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-zinc-500 tracking-widest uppercase hidden sm:inline">Connect with us</span>
          <div className="flex items-center gap-3">
            <button className="text-zinc-400 hover:text-gold transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="text-zinc-400 hover:text-gold transition-colors" aria-label="Email">
              <Mail className="w-4 h-4" />
            </button>
            <button className="text-zinc-400 hover:text-gold transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
