import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import luxuryPerfumeHero from '../assets/images/luxury_perfume_hero_1784311872347.jpg';
import perfumeUnisex from '../assets/images/perfume_unisex_1784311906469.jpg';
import perfumeForHer from '../assets/images/perfume_for_her_1784311895919.jpg';

const featuredSlides = [
  {
    title: "DECANTRE DE MAJESTÉ",
    subtitle: "The Sovereign Golden Oud",
    description: "A breathtaking encounter between golden royal saffron, deep Cambodian oud, and burnished leather. Experience the peak of luxurious scent chemistry.",
    bgImage: luxuryPerfumeHero,
    productId: 'oud-imperial'
  },
  {
    title: "SAFFRON MYSTIQUE",
    subtitle: "A Sacred Alchemy",
    description: "A modern classic designed in collaboration with elite French master perfumers. Deeply sophisticated, intensely persistent, and proudly unisex.",
    bgImage: perfumeUnisex,
    productId: 'saffron-mystique'
  },
  {
    title: "NECTAR DE SAPHIR",
    subtitle: "Unmatched Feminine Grace",
    description: "Crystalline rose buds drenched in sweet golden nectar and vanilla orchid. A vibrant aura that leaves an unforgettable trail of absolute elegance.",
    bgImage: perfumeForHer,
    productId: 'nectar-de-saphir'
  }
];

export const FeaturedProductSlider = () => {
  const { products } = useApp();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto interval rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="featured-slider-section" className="relative h-[85vh] sm:h-[80vh] bg-[#050505] overflow-hidden border-b border-gold/20">
      {/* Visual Header label */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-[0.45em] text-gold/60 font-sans font-bold">Featured Masterpieces</span>
      </div>

      {featuredSlides.map((slide, index) => (
        <div 
          key={index}
          id={`featured-slide-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Dark background image with gold/black ambient overlays */}
          <div className="absolute inset-0 bg-luxury-black">
            <img 
              src={slide.bgImage} 
              alt={slide.title} 
              className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-[6000ms] ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-luxury-black"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-transparent to-luxury-black/80"></div>
            {/* Gold light leakage overlay */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
          </div>

          {/* Slider Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Left Side: Slogans and Luxury Text */}
              <div className="space-y-6 text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gold/10 border border-gold/20 rounded-full">
                  <Sparkles className="w-3 h-3 text-gold animate-spin" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-sans font-medium">
                    Exclusive Fragrance Collection
                  </span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6.5xl font-serif font-light text-luxury-white leading-tight tracking-wide">
                  {slide.title}
                </h2>
                
                <p className="text-gold/90 text-lg sm:text-xl font-light tracking-widest font-serif italic">
                  {slide.subtitle}
                </p>
                
                <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light leading-relaxed tracking-wide">
                  {slide.description}
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => {
                      const targetProd = products.find(p => p.id === slide.productId);
                      if (targetProd) {
                        navigate(`/product?did=${targetProd.id}`);
                      } else {
                        navigate('/shop');
                      }
                    }}
                    className="px-8 py-3.5 border border-gold text-[10px] uppercase tracking-[0.3em] font-sans font-bold hover:bg-gold hover:text-black transition-all duration-300 bg-transparent text-gold cursor-pointer"
                  >
                    <span>Discover Now</span>
                  </button>
                  
                  <a 
                    href="#catalog-section"
                    className="border border-white/10 hover:border-gold text-zinc-400 hover:text-luxury-white text-[10px] font-bold uppercase tracking-[0.3em] font-sans px-8 py-3.5 bg-black/40 backdrop-blur-sm transition-all"
                  >
                    Decantre Catalog
                  </a>
                </div>
              </div>

              {/* Right Side: Perfume Bottle Closeup preview inside frame */}
              <div className="hidden md:flex justify-center items-center">
                <div className="relative p-3 bg-gradient-to-b from-gold/20 via-[#080808] to-[#0A0A0A] border border-gold/30 rounded-sm max-w-sm w-full aspect-[4/5] shadow-[0_0_50px_rgba(197,160,89,0.08)] overflow-hidden group">
                  <img 
                    src={slide.bgImage} 
                    alt="Close view" 
                    className="w-full h-full object-cover rounded-sm transition-all duration-[4000ms] group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-luxury-black via-luxury-black/60 to-transparent text-center">
                    <span className="text-[10px] text-gold tracking-[0.3em] uppercase block mb-1">Mélange Impérial</span>
                    <span className="text-xs text-zinc-300 tracking-wide font-light font-serif italic">Available in Eau & Extrait de Parfum</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ))}

      {/* Slider Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {featuredSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-[2px] transition-all duration-300 cursor-pointer ${
              idx === currentSlide ? 'w-10 bg-gold' : 'w-4 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Prev & Next arrows */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-[#080808]/80 hover:bg-gold text-zinc-400 hover:text-black rounded-full border border-gold/40 hover:border-gold transition-all cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredSlides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-[#080808]/80 hover:bg-gold text-zinc-400 hover:text-black rounded-full border border-gold/40 hover:border-gold transition-all cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  );
};

export default FeaturedProductSlider;
