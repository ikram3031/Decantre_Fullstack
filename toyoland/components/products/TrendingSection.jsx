'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { useGetProducts } from '../../hooks/useProducts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Trending Section Carousel matching exact screenshot layout
export default function TrendingSection() {
  const { data: products, isLoading } = useGetProducts('All');
  const [scrollIndex, setScrollIndex] = useState(0);

  const trendingProducts = products ? products.slice(2, 8) : [];

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!trendingProducts.length) return;
    setScrollIndex((prev) => Math.min(trendingProducts.length - 4, prev + 1));
  };

  return (
    <section id="trending" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-800 tracking-tight">
          Trending
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Most loved organic kidswear, shoes, sun accessories, and Montessori toys this week.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          disabled={scrollIndex === 0}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-[#2D2D2D] shadow-md border-2 border-[#EEEEEE] flex items-center justify-center hover:bg-[#FF3B30] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#2D2D2D] transition-all duration-200 cursor-pointer"
          aria-label="Previous Trending Item"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          disabled={scrollIndex >= trendingProducts.length - 4}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-[#2D2D2D] shadow-md border-2 border-[#EEEEEE] flex items-center justify-center hover:bg-[#FF3B30] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#2D2D2D] transition-all duration-200 cursor-pointer"
          aria-label="Next Trending Item"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-gray-100 animate-pulse rounded-2xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.slice(scrollIndex, scrollIndex + 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>

    </section>
  );
}
