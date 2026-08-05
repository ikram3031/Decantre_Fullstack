import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  ArrowRight,
  Star,
  ThumbsUp,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

import { useApp } from '../core/context/AppContext';

import { HeroSlider } from '../components/HeroSlider';
import { FeaturedProductSlider } from '../components/FeaturedProductSlider';
import { TrustBadges } from '../components/TrustBadges';
import { CategoryNav } from '../components/CategoryNav';
import { ProductCard } from '../components/ProductCard';
import NewArrival from '../components/sections/NewArrival';
import ScentFinder from '../components/sections/ScentFinder';
import BestSelling from '../components/sections/BestSelling';
import Testimonials from '../components/sections/Testimonials';

export const Home = () => {
  const {
    currentSlide,
    setCurrentSlide,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cardSelections,
    setCardSelections,
    wishlist,
    toggleWishlist,
    handleOpenProductDetail,
    handleAddToCart,
    calculateItemPrice,
    filteredProducts,
    startQuiz,
    products,
    fetchProducts,
    fetchCategories,
    fetchBrands
  } = useApp();



  // Show top 3 spotlight products on home page to keep layout premium, with link to view more
  const spotlightProducts = filteredProducts.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero Display Showcase */}
      <HeroSlider />

      {/* Credibility badges */}
      <TrustBadges />

      {/* Olfactory category cards */}
      <CategoryNav setSelectedCategory={setSelectedCategory} />

      {/* New Arrivals (moved to its own section component) */}
      <NewArrival />

      {/* Scent finder guidance CTA section */}
      <ScentFinder />

      {/* Our Bestsellers section */}
      <BestSelling />

      {/* Reviews Section */}
      <Testimonials />

    </div>
  );
};
export default Home;
