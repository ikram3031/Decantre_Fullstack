'use client';

import AppProviders from '../providers/AppProviders';
import Header from '../components/header/Header';
import HeroSlider from '../components/hero/HeroSlider';
import PromoGrid from '../components/promo/PromoGrid';
import FeaturesSection from '../components/products/FeaturesSection';
import MidBanner from '../components/promo/MidBanner';
import SplitBanners from '../components/promo/SplitBanners';
import TrendingSection from '../components/products/TrendingSection';
import BigPromoBanner from '../components/promo/BigPromoBanner';
import ValueProps from '../components/footer/ValueProps';
import Newsletter from '../components/footer/Newsletter';
import Footer from '../components/footer/Footer';
import ScrollToTop from '../components/common/ScrollToTop';

import CartDrawer from '../components/modals/CartDrawer';
import WishlistDrawer from '../components/modals/WishlistDrawer';
import SearchModal from '../components/modals/SearchModal';
import CheckoutModal from '../components/modals/CheckoutModal';

import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCategory } from '../store/uiSlice';

// Main Home Page Content component
function HomePageContent() {
  const dispatch = useDispatch();
  const selectedCategory = useSelector((state) => state.ui.selectedCategory);

  const handleCategorySelect = (category) => {
    dispatch(setSelectedCategory(category));
    // Smooth scroll to features section
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#2D2D2D] font-sans selection:bg-[#FF6B6B] selection:text-white">
      {/* Navigation Header */}
      <Header />

      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* 3 Feature Promo Cards */}
      <PromoGrid onCategorySelect={handleCategorySelect} />

      {/* Featured Products Section */}
      <FeaturesSection selectedCategory={selectedCategory} />

      {/* Mid Section Banner */}
      <MidBanner onCategorySelect={handleCategorySelect} />

      {/* 2-Column Split Banners */}
      <SplitBanners onCategorySelect={handleCategorySelect} />

      {/* Trending Products Carousel */}
      <TrendingSection />

      {/* Big Promotional Banner */}
      <BigPromoBanner />

      {/* Value Proposition Bar */}
      <ValueProps />

      {/* Newsletter Subscription Bar */}
      <Newsletter />

      {/* Footer */}
      <Footer onCategorySelect={handleCategorySelect} />

      {/* Interactive Modals & Drawers */}
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <CheckoutModal />
      <ScrollToTop />
    </div>
  );
}

// Export Root Home Page wrapped in Redux and TanStack Query providers
export default function HomePage() {
  return (
    <AppProviders>
      <HomePageContent />
    </AppProviders>
  );
}
