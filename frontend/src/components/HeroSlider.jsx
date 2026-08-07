import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import fallbackBanner from '../assets/main-banner.webp';

const bannerSlides = [
  {
    bgImage: "https://decantrebd.com/wp-content/uploads/assets/main-banner.webp",
    tagline: "Enchanting aromas for every unique moment",
    title: "INDULGE IN LUXURY",
    buttonText: "SHOP NOW"
  },
  /*
  {
    bgImage: "https://decantrebd.com/wp-content/uploads/2026/07/main_banner-2.jpg",
    tagline: "Elevate your olfactory signature",
    title: "CRAFT IN ELEGANCE",
    buttonText: "SHOP NOW"
  },
  {
    bgImage: "https://decantrebd.com/wp-content/uploads/2026/07/main_banner-1.jpg",
    tagline: "Exquisite rare ingredients hand-poured with mastery",
    title: "ROYAL SIGNATURES",
    buttonText: "SHOP NOW"
  }
  */
];

export const HeroSlider = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play the slider
  useEffect(() => {
    if (bannerSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero-slider" className="relative h-[70vh] md:h-[70vh] lg:h-[80vh] bg-[#050505] overflow-hidden border-b border-gold/15">
      {bannerSlides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
          }`}
        >
          {/* Rich full-color background image with elegant gradient dark overlays */}
          <div className="absolute inset-0 bg-black">
            <HeroSlideImage src={slide.bgImage} title={slide.title} />
            {/* Top, Bottom and center dark protection overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70"></div>
            <div className="absolute inset-0 bg-black/35"></div>
          </div>

          {/* Centered Content overlay */}
          <div className="absolute inset-0 flex items-center justify-center text-center p-4">
            <div className="max-w-[75%] sm:max-w-4xl mx-auto space-y-6 sm:space-y-8">
              
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.45em] text-zinc-300 font-sans font-medium block animate-fade-in drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {slide.tagline}
              </span>
              
              <h1 className="text-3xl sm:text-5xl lg:text-6.5xl font-serif font-light text-white leading-tight tracking-[0.1em] sm:tracking-[0.15em] uppercase select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                {slide.title}
              </h1>

              <div className="pt-6 sm:pt-8 flex justify-center">
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/shop')}
                  className="w-[140px] sm:w-[160px] h-10 text-[10px]"
                >
                  {slide.buttonText}
                </Button>
              </div>

            </div>
          </div>
        </div>
      ))}

      {/* Slider Controls (Bottom Dot Indicators with elegant long active pills) */}
      {bannerSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentSlide ? 'bg-gold w-6' : 'bg-white/40 hover:bg-white/70 w-2'
              }`}
            />
          ))}
        </div>
      )}

      {/* Left & Right Arrows */}
      {bannerSlides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/40 hover:bg-gold text-white hover:text-black rounded-full border border-gold/40 hover:border-gold transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/40 hover:bg-gold text-white hover:text-black rounded-full border border-gold/40 hover:border-gold transition-all duration-300 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}
    </section>
  );
};

// Helper Component to handle Image Load States, Skeletons, and Error Fallbacks
const HeroSlideImage = ({ src, title }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);
  const PLACEHOLDER_IMAGE = fallbackBanner; 

  return (
    <div className="w-full h-full relative">
      {/* Loading Skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-zinc-950 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-gold animate-spin"></div>
        </div>
      )}

      <img 
        src={error ? PLACEHOLDER_IMAGE : src} 
        alt={title} 
        className={`w-full h-full object-cover object-center opacity-85 transition-opacity duration-700 ${
          imageLoaded ? 'opacity-85' : 'opacity-0'
        }`}
        referrerPolicy="no-referrer"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setError(true);
          setImageLoaded(true);
        }}
      />
    </div>
  );
};

export default HeroSlider;
