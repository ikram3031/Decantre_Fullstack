'use client';

import Image from 'next/image';

// Big Promotional Banner matching screenshot UI ("For babies & kids - UP TO 70% OFF")
export default function BigPromoBanner() {
  return (
    <section className="relative w-full my-12 overflow-hidden min-h-[340px] sm:min-h-[420px] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1600&auto=format&fit=crop&q=80"
          alt="For babies and kids promo"
          fill
          sizes="100vw"
          className="object-cover object-center"
          referrerPolicy="no-referrer"
        />
        {/* Soft white/overlay gradient */}
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-12 text-white max-w-2xl space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-500">
        
        <h2 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white drop-shadow-md">
          For babies & kids
        </h2>

        <div className="inline-block bg-[#FF3B30] text-white font-black text-base sm:text-2xl px-5 sm:px-7 py-2 sm:py-2.5 rounded-full shadow-[0_4px_0px_#B3241C] border-2 border-white tracking-wider uppercase transform -rotate-1 whitespace-nowrap max-w-full">
          UP TO 70% OFF
        </div>

        <p className="text-xs sm:text-sm text-gray-200 max-w-md mx-auto pt-2">
          Discover our exclusive collection of non-toxic wooden Montessori toys and educational gift sets today.
        </p>

      </div>
    </section>
  );
}
