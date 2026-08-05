'use client';

import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

// Newsletter Subscription Bar matching screenshot UI
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <section id="newsletter" className="bg-[#FFD13B]/15 border-b-2 border-[#EEEEEE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left Side Icon & Heading */}
        <div className="flex items-center space-x-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#FF3B30] text-white shadow-[3px_3px_0px_#2D2D2D] flex items-center justify-center shrink-0">
            <Mail className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#2D2D2D] tracking-tight">
              Subscribe for Exclusive Sales & News
            </h3>
            <p className="text-xs text-[#666666] font-medium">
              Subscribe to the weekly newsletter for all the latest updates
            </p>
          </div>
        </div>

        {/* Right Side Email Input Form */}
        <div className="w-full lg:w-auto min-w-[320px] sm:min-w-[420px]">
          {subscribed ? (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-5 py-3 rounded-full border-2 border-emerald-300 text-xs font-black animate-in fade-in duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! You have been subscribed to Toyoland news.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center bg-white p-1.5 rounded-full border-2 border-[#EEEEEE] shadow-xs focus-within:border-[#FF3B30] transition-colors">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full px-5 py-2.5 text-xs font-bold text-[#2D2D2D] bg-transparent focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="bg-[#FF3B30] hover:bg-[#9B51E0] text-white font-black text-xs uppercase px-7 py-3 rounded-full transition-all duration-200 shrink-0 shadow-[0_3px_0px_#B3241C] hover:shadow-none hover:translate-y-0.5 cursor-pointer"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
