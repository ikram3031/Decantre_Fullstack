'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HERO_SLIDES } from '../../data/banners';
import { ChevronLeft, ChevronRight, ArrowRight, ChevronDown } from 'lucide-react';

// Hero Slider section matching screenshot layout & button styling
export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative w-full bg-[#2D2D2D] overflow-hidden min-h-[460px] sm:min-h-[520px] md:min-h-[580px] flex items-center">
      {/* Background Hero Banner Image */}
      <div className="absolute inset-0 z-0 opacity-95">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        {/* Dark gradient overlay for ultra high contrast and text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30 md:from-black/75 md:via-black/45 md:to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16 w-full">
        {/* Glassmorphic dark card overlay to guarantee text legibility on all devices */}
        <div className="max-w-xl text-white space-y-3 sm:space-y-5 bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-left duration-500">
          
          {/* Subheading Tagline */}
          <div className="inline-flex items-center space-x-2 bg-[#FFD13B] text-[#2D2D2D] font-black px-3.5 py-1 rounded-full text-[11px] sm:text-xs tracking-widest uppercase">
            <span>{slide.subheading}</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-white leading-[1.15] tracking-tight drop-shadow-md">
            {slide.title}
          </h1>

          {/* Descriptive Text */}
          <p className="text-xs sm:text-sm md:text-base text-gray-100 font-medium leading-relaxed drop-shadow-xs">
            {slide.description}
          </p>

          {/* Action Button - formatted to fit on one line nicely on mobile */}
          <div className="pt-2">
            <a
              href="#features"
              className="inline-flex items-center justify-center space-x-2 bg-[#FF3B30] hover:bg-[#9B51E0] text-white font-black text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-[0_4px_0px_#B3241C] hover:shadow-none hover:translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <span>{slide.buttonText}</span>
              <ArrowRight className="w-4 h-4 ml-1 stroke-[3] shrink-0" />
            </a>
          </div>

        </div>
      </div>

      {/* Manual Slide Navigation Arrows - High contrast white buttons visible on all screens */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#2D2D2D] shadow-xl border-2 border-white hover:bg-[#FF3B30] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6 stroke-[3]" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#2D2D2D] shadow-xl border-2 border-white hover:bg-[#FF3B30] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Slide Pagination Indicator Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentSlide === index ? 'w-8 h-3 bg-[#FF3B30]' : 'w-3 h-3 bg-white/70 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Animated Scroll Down Indicator Icon */}
      <a
        href="#features"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById('features');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="absolute bottom-3 right-4 sm:right-8 z-30 flex items-center space-x-2 bg-black/60 hover:bg-[#FF3B30] text-white px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 group cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        title="Scroll Down"
        aria-label="Scroll Down"
      >
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">Scroll</span>
        <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-[#FF3B30] flex items-center justify-center transition-colors">
          <ChevronDown className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
        </div>
      </a>
    </section>
  );
}
