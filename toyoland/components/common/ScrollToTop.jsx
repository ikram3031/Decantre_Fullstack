'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-[#FF3B30] hover:bg-[#9B51E0] text-white px-3.5 py-2.5 rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.4)] hover:shadow-[0_4px_12px_rgba(155,81,224,0.4)] border-2 border-white transition-all duration-300 cursor-pointer group hover:scale-105 active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-4 h-4 stroke-[3] group-hover:-translate-y-0.5 transition-transform" />
      <span className="text-xs font-black uppercase tracking-wider pr-0.5">Top</span>
    </button>
  );
}
