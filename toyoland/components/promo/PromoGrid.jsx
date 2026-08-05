'use client';

import Image from 'next/image';
import { PROMO_CARDS } from '../../data/banners';
import { ArrowUpRight } from 'lucide-react';

// 3 Promo Feature Cards matching the screenshot layout below Hero
export default function PromoGrid({ onCategorySelect }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROMO_CARDS.map((card) => (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-[32px] ${card.bgColor} p-6 sm:p-8 flex items-center justify-between min-h-[220px] shadow-xs hover:shadow-md transition-all duration-300 group border-2 border-[#EEEEEE] hover:border-[#4ECDC4]`}
          >
            {/* Left Content */}
            <div className="z-10 max-w-[60%] space-y-3">
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#2D2D2D] leading-tight">
                {card.title}
              </h3>
              <p className="text-xs text-[#4D4D4D] font-medium">
                {card.subtitle}
              </p>
              <div>
                <button
                  onClick={() => onCategorySelect && onCategorySelect(card.title)}
                  className={`inline-flex items-center space-x-1 ${card.btnColor} px-4 py-2.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer group-hover:scale-105 whitespace-nowrap shrink-0`}
                >
                  <span>{card.buttonText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Right Card Image */}
            <div className="relative w-32 h-36 sm:w-36 sm:h-40 shrink-0">
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 640px) 128px, 144px"
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
