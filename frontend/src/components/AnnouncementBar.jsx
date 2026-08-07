import React from 'react';

export const AnnouncementBar = () => {
  return (
    <div id="top-announcement-bar" className="bg-gold border-b border-gold/15 text-black text-[9px] uppercase tracking-[0.35em] py-2.5 px-4 font-sans font-bold overflow-hidden relative w-full">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 75s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="animate-marquee gap-8">
        <div className="flex shrink-0 gap-8 items-center">
          <span>✨ FLAT 8% OFF ON DECANT ORDERS OVER 3499 BDT • USE CODE: <span className="text-gold bg-black px-2 py-0.5 rounded-none border border-black/40">DECANT8</span> ✨</span>
          <span>💎 PREMIUM CRUELTY-FREE ROYAL MASTER FORMULATIONS 💎</span>
          <span>⚡ FREE SHIPPING NATIONWIDE ON ORDERS OVER 5000 BDT ⚡</span>
          <span>✨ FLAT 8% OFF ON DECANT ORDERS OVER 3499 BDT • USE CODE: <span className="text-gold bg-black px-2 py-0.5 rounded-none border border-black/40">DECANT8</span> ✨</span>
        </div>
        <div className="flex shrink-0 gap-8 items-center" aria-hidden="true">
          <span>✨ FLAT 8% OFF ON DECANT ORDERS OVER 3499 BDT • USE CODE: <span className="text-gold bg-black px-2 py-0.5 rounded-none border border-black/40">DECANT8</span> ✨</span>
          <span>💎 PREMIUM CRUELTY-FREE ROYAL MASTER FORMULATIONS 💎</span>
          <span>⚡ FREE SHIPPING NATIONWIDE ON ORDERS OVER 5000 BDT ⚡</span>
          <span>✨ FLAT 8% OFF ON DECANT ORDERS OVER 3499 BDT • USE CODE: <span className="text-gold bg-black px-2 py-0.5 rounded-none border border-black/40">DECANT8</span> ✨</span>
        </div>
      </div>
    </div>
  );
};

