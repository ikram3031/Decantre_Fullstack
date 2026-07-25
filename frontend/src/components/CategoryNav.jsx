import React from 'react';
import { useNavigate } from 'react-router-dom';
import perfumeForHim from '../assets/images/perfume_for_him_1784311883603.jpg';
import perfumeForHer from '../assets/images/perfume_for_her_1784311895919.jpg';
import perfumeUnisex from '../assets/images/perfume_unisex_1784311906469.jpg';

export const CategoryNav = ({ setSelectedCategory }) => {
  const navigate = useNavigate();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <section id="categories-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-14">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium">Olfactory Genders</span>
        <h2 className="text-3xl sm:text-4xl font-serif font-light text-luxury-white tracking-wide">
          EXPLORE THE PALETTE
        </h2>
        <div className="w-20 h-[1px] bg-gold/30 mx-auto"></div>
        <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto font-sans font-light leading-relaxed">
          Choose from our specialized collections carefully formulated with hand-selected extracts for your distinct character.
        </p>
      </div>

      {/* 3 Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* For Him Card */}
        <div 
          id="cat-card-him"
          onClick={() => handleCategorySelect('For Him')}
          className="group relative h-96 rounded-sm overflow-hidden border border-gold/20 hover:border-gold/60 transition-all duration-500 cursor-pointer shadow-2xl"
        >
          <div className="absolute inset-0 bg-luxury-black">
            <img 
              src={perfumeForHim} 
              alt="For Him Category" 
              className="w-full h-full object-cover object-center opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/25 to-transparent"></div>
          </div>
          
          <div className="absolute inset-x-0 bottom-0 p-8 text-center space-y-4">
            <h3 className="text-2xl font-serif font-light tracking-widest text-luxury-white">FOR HIM</h3>
            <div className="w-10 h-[1px] bg-gold/30 mx-auto group-hover:w-20 transition-all duration-500"></div>
            
            <div className="relative inline-block mx-auto">
              <button className="text-[10px] text-gold tracking-widest uppercase font-bold py-1.5 px-4 border border-gold/20 hover:border-gold/60 bg-black/40 hover:bg-gold/10 transition-all font-sans">
                Explore
              </button>
            </div>
          </div>
        </div>

        {/* For Her Card */}
        <div 
          id="cat-card-her"
          onClick={() => handleCategorySelect('For Her')}
          className="group relative h-96 rounded-sm overflow-hidden border border-gold/20 hover:border-gold/60 transition-all duration-500 cursor-pointer shadow-2xl"
        >
          <div className="absolute inset-0 bg-luxury-black">
            <img 
              src={perfumeForHer} 
              alt="For Her Category" 
              className="w-full h-full object-cover object-center opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/25 to-transparent"></div>
          </div>
          
          <div className="absolute inset-x-0 bottom-0 p-8 text-center space-y-4">
            <h3 className="text-2xl font-serif font-light tracking-widest text-luxury-white">FOR HER</h3>
            <div className="w-10 h-[1px] bg-gold/30 mx-auto group-hover:w-20 transition-all duration-500"></div>
            
            <div className="relative inline-block mx-auto">
              <button className="text-[10px] text-gold tracking-widest uppercase font-bold py-1.5 px-4 border border-gold/20 hover:border-gold/60 bg-black/40 hover:bg-gold/10 transition-all font-sans">
                Explore
              </button>
            </div>
          </div>
        </div>

        {/* Unisex Card */}
        <div 
          id="cat-card-unisex"
          onClick={() => handleCategorySelect('Unisex')}
          className="group relative h-96 rounded-sm overflow-hidden border border-gold/20 hover:border-gold/60 transition-all duration-500 cursor-pointer shadow-2xl"
        >
          <div className="absolute inset-0 bg-luxury-black">
            <img 
              src={perfumeUnisex} 
              alt="Unisex Category" 
              className="w-full h-full object-cover object-center opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/25 to-transparent"></div>
          </div>
          
          <div className="absolute inset-x-0 bottom-0 p-8 text-center space-y-4">
            <h3 className="text-2xl font-serif font-light tracking-widest text-luxury-white">UNISEX</h3>
            <div className="w-10 h-[1px] bg-gold/30 mx-auto group-hover:w-20 transition-all duration-500"></div>
            
            <div className="relative inline-block mx-auto">
              <button className="text-[10px] text-gold tracking-widest uppercase font-bold py-1.5 px-4 border border-gold/20 hover:border-gold/60 bg-black/40 hover:bg-gold/10 transition-all font-sans">
                Explore
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
