'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Heart, User, ShoppingBag, Menu } from 'lucide-react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { setCartOpen } from '../../store/cartSlice';
import { setWishlistOpen } from '../../store/wishlistSlice';
import { setSearchOpen, setSelectedCategory } from '../../store/uiSlice';

// Main Header component matching exact Toyoland branding & screenshot UI layout
export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistCount = wishlistItems.length;

  const handleCategorySelect = (category) => {
    dispatch(setSelectedCategory(category));
  };

  return (
    <>
      {/* Top Banner Announcement (Non-Sticky) in Logo Purple & Yellow */}
      <div className="bg-[#9B51E0] text-white text-[11px] md:text-xs py-2 px-4 text-center font-bold tracking-wide">
        🎉 Grand Spring Sale: Get up to 40% OFF on all Montessori Toys! Use code: <span className="font-extrabold underline underline-offset-2 text-[#FFD13B]">MONTESSORI26</span>
      </div>

      {/* Pure Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-[#FFD13B] shadow-xs transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button & Brand Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-xl text-gray-700 hover:text-gray-900 md:hidden hover:bg-[#FFFBF2] transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Toyoland Logo using uploaded logo image */}
            <Link href="/" className="flex items-center group shrink-0">
              <Image
                src="/logo.png"
                alt="Toyoland Logo"
                width={180}
                height={56}
                priority
                className="h-10 sm:h-12 md:h-14 max-w-[160px] sm:max-w-[200px] w-auto object-contain rounded-xl group-hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <Navbar onCategorySelect={handleCategorySelect} />

          {/* Right Action Icons: Search, Wishlist, User, Bag */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Search Icon */}
            <button
              onClick={() => dispatch(setSearchOpen(true))}
              className="p-2 sm:p-2.5 text-[#2D2D2D] hover:text-[#FF6B6B] hover:bg-[#FFFBF2] rounded-2xl transition-all duration-200"
              title="Search Toys"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Wishlist Icon with Counter Badge */}
            <button
              onClick={() => dispatch(setWishlistOpen(true))}
              className="relative p-2 sm:p-2.5 text-[#2D2D2D] hover:text-[#FF3B30] hover:bg-[#FFFBF2] rounded-2xl transition-all duration-200"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[2.2]" />
              {totalWishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#FF3B30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                  {totalWishlistCount}
                </span>
              )}
            </button>

            {/* User Account Icon */}
            <button
              onClick={() => dispatch(setSearchOpen(true))}
              className="p-2 sm:p-2.5 text-[#2D2D2D] hover:text-[#00A8FF] hover:bg-[#FFFBF2] rounded-2xl transition-all duration-200"
              title="Account"
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Cart / Bag Button */}
            <button
              onClick={() => dispatch(setCartOpen(true))}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-[#FF3B30] hover:bg-[#9B51E0] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all duration-200 shadow-[0_3px_0px_#B3241C] hover:shadow-none hover:translate-y-0.5 cursor-pointer group whitespace-nowrap shrink-0"
              aria-label="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FFD13B] text-[#2D2D2D] text-[9px] font-black px-1 rounded-full border border-white">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-extrabold tracking-wide uppercase">
                Cart
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onCategorySelect={handleCategorySelect}
      />
    </header>
  </>
  );
}
