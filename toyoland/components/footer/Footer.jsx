'use client';

import { ArrowUp } from 'lucide-react';

// Footer component matching exact screenshot layout and links
export default function Footer({ onCategorySelect }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    SHOP: [
      'Baby Girl',
      'Baby Boy',
      'Toddler Girl',
      'Girls',
      'Boys',
      'Mommy & Me',
      'Montessori',
      'Wooden Toys',
      'Puzzles'
    ],
    HELP: [
      'Contact & FAQ',
      'Track Your Order',
      'Returns & Refunds',
      'Shipping & Delivery',
      'Interest Free Finance',
      'Cipmoney'
    ],
    'ABOUT US': [
      'Our story',
      'The team',
      'Press',
      'Jobs',
      'Blog',
      'Contact'
    ],
    CONNECT: [
      'Twitter',
      'Facebook',
      'Instagram',
      'Pinterest',
      'Jobs',
      'Contact'
    ]
  };

  return (
    <footer id="footer" className="relative bg-[#FFFBF2] text-[#4D4D4D] pt-14 pb-8 border-t-4 border-[#FFD13B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4 Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h4 className="font-heading font-black text-xs uppercase tracking-widest text-[#2D2D2D]">
                {title}
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                {links.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => onCategorySelect && onCategorySelect(link)}
                      className="hover:text-[#FF3B30] transition-colors cursor-pointer text-left"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t-2 border-[#EEEEEE] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#666666]">
          
          {/* Copyright & Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-center md:text-left">
            <span>© Toyoland 2026</span>
            <span className="text-gray-300">•</span>
            <a href="#footer" className="hover:text-[#FF3B30] transition-colors font-bold">Privacy</a>
            <span className="text-gray-300">•</span>
            <a href="#footer" className="hover:text-[#FF3B30] transition-colors font-bold">Terms</a>
            <span className="text-gray-300">•</span>
            <a href="#footer" className="hover:text-[#FF3B30] transition-colors font-bold">*Promo T&Cs Apply (view here)</a>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-white rounded-lg border-2 border-[#EEEEEE] font-black text-[10px] text-blue-900 shadow-2xs">MasterCard</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border-2 border-[#EEEEEE] font-black text-[10px] text-black shadow-2xs">Pay</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border-2 border-[#EEEEEE] font-black text-[10px] text-blue-600 shadow-2xs">VISA</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border-2 border-[#EEEEEE] font-black text-[10px] text-blue-500 shadow-2xs">AMEX</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border-2 border-[#EEEEEE] font-black text-[10px] text-blue-800 shadow-2xs">PayPal</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border-2 border-[#EEEEEE] font-black text-[10px] text-purple-600 shadow-2xs">clearpay</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
