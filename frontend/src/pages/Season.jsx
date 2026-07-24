import React, { useState } from 'react';
import { Sun, Wind, CloudSnow, Leaf, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

export const Season = () => {
  const {
    products,
    cardSelections,
    setCardSelections,
    wishlist,
    toggleWishlist,
    handleOpenProductDetail,
    handleAddToCart,
    calculateItemPrice
  } = useApp();

  const [activeSeason, setActiveSeason] = useState('spring');

  const seasonsData = {
    spring: {
      name: 'Spring Curation',
      tagline: 'Fresh, Sweet, and Uplifting Floral Essences',
      description: 'As the earth awakens, indulge in crisp, blooming florals, sparkling pink peppers, and sweet organic honeys. These blends reflect renewal, grace, and bright, sunlit mornings.',
      icon: Leaf,
      accentColor: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      productIds: ['nectar-de-saphir', 'rose-absolue']
    },
    summer: {
      name: 'Summer Curation',
      tagline: 'Vibrant, Citric, and Sun-kissed Aromas',
      description: 'Windswept freedom and high sun. Featuring cold-pressed Calabrian bergamot, coastal sea salt, and mineral oakmoss to deliver absolute clarity and refreshing sophistication under intense heat.',
      icon: Sun,
      accentColor: 'from-amber-500/10 to-orange-500/10 border-amber-500/30',
      iconColor: 'text-amber-400',
      productIds: ['bergamote-sauvage']
    },
    autumn: {
      name: 'Autumn Curation',
      tagline: 'Enigmatic, Rich, and Golden Spice Tapestries',
      description: 'The golden transition. Embracing the warmth of high-altitude saffron threads, Cashmeran wood, and deep rich papyrus that dialogue perfectly with cooler breezes and amber skies.',
      icon: Wind,
      accentColor: 'from-orange-500/10 to-rose-500/10 border-orange-500/30',
      iconColor: 'text-orange-400',
      productIds: ['saffron-mystique']
    },
    winter: {
      name: 'Winter Curation',
      tagline: 'Deep, Warm, Smoky, and Sovereign Ouds',
      description: 'Absolute depth and dark warmth. Rich Cambodian oud, dark golden patchouli, heated leather, and resinous amber that fuse with your coat like a warm, protective second skin.',
      icon: CloudSnow,
      accentColor: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30',
      iconColor: 'text-blue-400',
      productIds: ['oud-imperial', 'ambre-nuit']
    }
  };

  const currentSeasonData = seasonsData[activeSeason];
  const SeasonIcon = currentSeasonData.icon;

  const seasonalProducts = products.filter(p => currentSeasonData.productIds.includes(p.id));

  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="text-center space-y-4 mb-16 relative py-12 border border-gold/15 bg-luxury-dark/20 rounded-sm">
          <div className="absolute -inset-px bg-gradient-to-r from-transparent via-gold/5 to-transparent pointer-events-none"></div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">Seasonal Olfactory Curations</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-luxury-white tracking-wide">
            THE CHRONOS SEASONS
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed px-4">
            Nature dictates the harvest, and our chemistry responds. Choose your current climate to explore fragrances masterfully aged and formulated for the air temperature and humidity.
          </p>
        </div>

        {/* Season Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(seasonsData).map(([key, value]) => {
            const TabIcon = value.icon;
            const isActive = activeSeason === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSeason(key)}
                className={`p-5 flex flex-col items-center justify-center gap-3 rounded-sm border transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? 'border-gold bg-gold/5 text-gold'
                    : 'border-white/5 bg-[#080808] text-zinc-500 hover:border-gold/30 hover:text-zinc-300'
                }`}
              >
                <TabIcon className={`w-6 h-6 transition-transform group-hover:scale-110 duration-300 ${isActive ? value.iconColor : 'text-zinc-600'}`} />
                <span className="text-[11px] font-sans font-bold uppercase tracking-widest">{value.name.split(' ')[0]}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Curation details and products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left panel details */}
          <div className={`lg:col-span-1 p-8 rounded-sm border bg-gradient-to-b ${currentSeasonData.accentColor} flex flex-col justify-between space-y-6`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SeasonIcon className={`w-5 h-5 ${currentSeasonData.iconColor}`} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-medium text-gold">ACTIVE ATMOSPHERE</span>
              </div>
              <h2 className="text-2xl font-serif font-light text-luxury-white uppercase tracking-wider">
                {currentSeasonData.name}
              </h2>
              <div className="h-[1px] w-12 bg-gold/40"></div>
              <p className="text-gold/80 text-xs font-serif italic">
                "{currentSeasonData.tagline}"
              </p>
              <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light leading-relaxed">
                {currentSeasonData.description}
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-zinc-400 text-xs font-sans">
                <Sparkles className="w-4 h-4 text-gold shrink-0" />
                <span>Formulated for ideal molecular sillage in {activeSeason} humidity.</span>
              </div>
            </div>
          </div>

          {/* Right products grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {seasonalProducts.map((prod) => {
                const currentSel = cardSelections[prod.id] || { size: '100ml', concentration: 'Eau de Parfum' };
                return (
                  <ProductCard 
                    key={prod.id}
                    product={prod}
                    currentSel={currentSel}
                    onSizeChange={(size) => {
                      setCardSelections(prev => ({
                        ...prev,
                        [prod.id]: { ...currentSel, size }
                      }));
                    }}
                    onConcentrationChange={(concentration) => {
                      setCardSelections(prev => ({
                        ...prev,
                        [prod.id]: { ...currentSel, concentration }
                      }));
                    }}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                    handleOpenProductDetail={handleOpenProductDetail}
                    handleAddToCart={handleAddToCart}
                    calculateItemPrice={calculateItemPrice}
                  />
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Season;
