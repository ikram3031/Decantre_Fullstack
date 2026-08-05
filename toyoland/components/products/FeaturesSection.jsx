'use client';

import ProductCard from './ProductCard';
import { useGetProducts } from '../../hooks/useProducts';

// Features section matching screenshot UI
export default function FeaturesSection({ selectedCategory }) {
  const { data: products, isLoading, isError } = useGetProducts(selectedCategory);

  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Section Title */}
      <div className="text-center mb-10">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-800 tracking-tight">
          Features
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-lg mx-auto">
          Handpicked organic children&apos;s apparel, handcrafted footwear, stylish accessories, and Montessori learning toys.
        </p>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-gray-100 animate-pulse rounded-2xl h-80 p-4" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-10 text-rose-500 text-sm font-medium">
          Failed to load featured products. Please try again.
        </div>
      )}

      {/* Product Grid - 4 columns on desktop */}
      {!isLoading && products && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </section>
  );
}
