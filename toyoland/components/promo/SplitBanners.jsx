'use client';

import Image from 'next/image';
import { SPLIT_BANNERS } from '../../data/banners';
import { ArrowRight } from 'lucide-react';

// Split 2-Column Banner component matching exact screenshot design
export default function SplitBanners({ onCategorySelect }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SPLIT_BANNERS.map((banner) => (
          <div
            key={banner.id}
            className={`relative overflow-hidden rounded-[32px] ${banner.bgColor} p-8 sm:p-10 flex items-center justify-between min-h-[220px] shadow-xs hover:shadow-md transition-all duration-300 group border-2 border-[#EEEEEE] hover:border-[#4ECDC4]`}
          >
            {/* Text Overlay */}
            <div className="z-10 max-w-[60%] space-y-3">
              <h3 className="font-heading font-black text-3xl sm:text-4xl text-[#2D2D2D] leading-tight">
                {banner.title}
              </h3>
              <p className="text-xs text-[#4D4D4D] font-medium">
                {banner.subtitle}
              </p>
              <div>
                <button
                  onClick={() => onCategorySelect && onCategorySelect(banner.title)}
                  className="inline-flex items-center space-x-2 bg-[#FF3B30] hover:bg-[#9B51E0] text-white px-5 py-2.5 rounded-full text-xs font-black transition-all duration-200 shadow-[0_3px_0px_#B3241C] hover:shadow-none hover:translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{banner.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Right Side Image Thumbnail */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 640px) 144px, 176px"
                className="object-cover rounded-2xl shadow-sm transform group-hover:scale-105 transition-transform duration-300 border border-white"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
