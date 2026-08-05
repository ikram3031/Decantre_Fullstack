'use client';

import { X, ChevronRight, Sparkles } from 'lucide-react';

// Mobile slide-out drawer menu
export default function MobileNav({ isOpen, onClose, onCategorySelect }) {
  if (!isOpen) return null;

  const categories = [
    'All Products',
    'Montessori Toys',
    'Educational & Learning',
    'Wooden Materials',
    'Puzzles & Brain Teasers',
    'Sensory & Musical',
    'Gift Items'
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Slide-out Menu Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto p-6 animate-in slide-in-from-left duration-250">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-[#ee818d] text-white flex items-center justify-center font-bold text-sm">T</span>
              <span className="font-heading font-bold text-xl text-gray-800 tracking-tight">Toyoland</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Special Announcement */}
          <div className="my-4 p-3 bg-amber-50 rounded-lg flex items-center space-x-2 text-xs text-amber-800 border border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Free Shipping on Montessori Wooden Sets over $50!</span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 my-4">
            <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2 px-2">Categories</p>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (onCategorySelect) onCategorySelect(cat);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:text-[#ee818d] hover:bg-rose-50 transition-colors text-left"
              >
                <span>{cat}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Contact Info */}
        <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
          <p className="font-semibold text-gray-700">Need help with an order?</p>
          <p>Email: support@toyoland.com</p>
          <p>Call: +1 (800) 869-6526</p>
        </div>
      </div>
    </div>
  );
}
