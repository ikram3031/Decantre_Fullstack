'use client';

import Image from 'next/image';
import { MID_BANNER_DATA } from '../../data/banners';
import { ArrowRight } from 'lucide-react';

// Mid Banner component matching exact screenshot layout
export default function MidBanner({ onCategorySelect }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative overflow-hidden rounded-[40px] bg-[#9B51E0] border-2 border-[#EEEEEE] shadow-[0_12px_24px_-10px_rgba(155,81,224,0.5)] flex flex-col md:flex-row items-center justify-between">
        
        {/* Left Side Child Image */}
        <div className="w-full md:w-1/2 h-[320px] sm:h-[400px] relative">
          <Image
            src={MID_BANNER_DATA.image}
            alt={MID_BANNER_DATA.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#9B51E0] hidden md:block" />
        </div>

        {/* Right Side Text Banner Content */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 space-y-4 md:space-y-6 text-center md:text-left text-white">
          
          <span className="inline-block text-xs font-black tracking-widest text-[#2D2D2D] bg-[#FFD13B] px-3.5 py-1 rounded-full uppercase border border-white/30">
            {MID_BANNER_DATA.tagline}
          </span>

          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            {MID_BANNER_DATA.title}
          </h2>

          <p className="text-xs sm:text-sm text-white/90 max-w-md leading-relaxed font-medium">
            {MID_BANNER_DATA.subtitle}
          </p>

          <div className="pt-2">
            <button
              onClick={() => onCategorySelect && onCategorySelect('Montessori Toys')}
              className="inline-flex items-center space-x-2 bg-[#FF3B30] hover:bg-[#FFD13B] text-white hover:text-[#2D2D2D] font-black text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-300 shadow-[0_4px_0px_#B3241C] hover:shadow-none hover:translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{MID_BANNER_DATA.buttonText}</span>
              <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
