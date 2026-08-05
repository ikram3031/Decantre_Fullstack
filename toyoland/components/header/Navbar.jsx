'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Navigation bar link items with dropdown carets matching exact screenshot UI
export default function Navbar({ onCategorySelect }) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navItems = [
    {
      name: 'HOME',
      href: '/',
      hasSub: true,
      subItems: ['Default Home', 'Kids Fashion & Apparel', 'Montessori Toys Store', 'Nursery & Accessories']
    },
    {
      name: 'SHOP',
      href: '#features',
      hasSub: true,
      subItems: ['All Products', 'Children Apparel', 'Kids Shoes & Footwear', 'Kids Accessories', 'Montessori Toys', 'Nursery & Decor']
    },
    {
      name: 'CLOTHING',
      href: '#features',
      hasSub: true,
      subItems: ['Organic Baby Rompers', 'Linen Toddler Overalls', 'Chunky Wool Cardigans']
    },
    {
      name: 'TOYS',
      href: '#features',
      hasSub: true,
      subItems: ['Educational Abacus', 'Shape Sorter Elephant', 'Activity Cube']
    },
    {
      name: 'PAGES',
      href: '#footer',
      hasSub: true,
      subItems: ['About Us', 'Contact Us', 'FAQs', 'Order Tracking']
    }
  ];

  return (
    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wider text-gray-700">
      {navItems.map((item) => (
        <div
          key={item.name}
          className="relative group py-2"
          onMouseEnter={() => setActiveDropdown(item.name)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <a
            href={item.href}
            onClick={() => item.name === 'SHOP' && onCategorySelect && onCategorySelect('All')}
            className="flex items-center space-x-1 hover:text-[#9B51E0] transition-colors py-1 cursor-pointer font-extrabold text-xs tracking-wider"
          >
            <span>{item.name}</span>
            {item.hasSub && <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#9B51E0] transition-transform duration-200 group-hover:rotate-180" />}
          </a>

          {/* Dropdown Menu */}
          {item.hasSub && activeDropdown === item.name && (
            <div className="absolute left-0 top-full w-48 bg-white shadow-xl rounded-2xl py-2 border-2 border-[#EEEEEE] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {item.subItems.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onCategorySelect) onCategorySelect(sub);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#4D4D4D] hover:text-[#FF3B30] hover:bg-[#FFFBF2] transition-colors"
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
