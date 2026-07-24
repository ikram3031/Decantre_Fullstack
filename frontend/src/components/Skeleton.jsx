import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="group flex flex-col h-full bg-[#080808] border border-white/5 rounded-sm p-5 animate-pulse min-h-[460px] justify-between">
      <div className="space-y-6">
        {/* Image Placeholder */}
        <div className="aspect-square bg-zinc-900/70 rounded-sm w-full" />

        {/* Category & Scent Family Placeholder */}
        <div className="flex justify-between items-center gap-2">
          <div className="h-3.5 bg-zinc-900/80 rounded-sm w-1/4" />
          <div className="h-3.5 bg-zinc-900/60 rounded-sm w-1/4" />
        </div>

        {/* Title Placeholder */}
        <div className="h-5 bg-zinc-900/90 rounded-sm w-3/4 mx-auto" />
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5 mt-4">
        {/* Selection Pills Placeholder */}
        <div className="flex justify-center gap-1.5">
          <div className="h-8 bg-zinc-900/50 rounded-md w-14" />
          <div className="h-8 bg-zinc-900/50 rounded-md w-14" />
          <div className="h-8 bg-zinc-900/50 rounded-md w-14" />
        </div>

        {/* Price & Cart CTA Placeholder */}
        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
          <div className="space-y-1 w-1/3">
            <div className="h-2.5 bg-zinc-900/50 rounded-sm w-2/3" />
            <div className="h-5 bg-zinc-900/80 rounded-sm w-full" />
          </div>
          <div className="h-10 bg-zinc-900/60 rounded-sm w-1/2" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 4 }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${count === 4 ? 'lg:grid-cols-4' : ''} gap-8 w-full`}>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default ProductCardSkeleton;
