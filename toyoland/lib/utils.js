import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind class names safely
export const cn = (...inputs) => twMerge(clsx(inputs));

// Format price into standard USD currency string
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

// Calculate percentage discount between original and current price
export const calcDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

// Pad single digits with leading zero for countdown
export const padZero = (num) => String(num || 0).padStart(2, '0');

// Generate mock array for star ratings
export const getStarArray = (rating = 5) => Array.from({ length: 5 }, (_, i) => i < rating);
