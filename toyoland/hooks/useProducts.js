'use client';

import { useQuery } from '@tanstack/react-query';
import { PRODUCTS_DATA, CATEGORIES_DATA } from '../data/products';

// Mock API fetching helpers simulating TanStack Query server calls
const fetchProducts = async (category = 'All', search = '') => {
  // Simulate minor network delay for realistic caching demo
  await new Promise((resolve) => setTimeout(resolve, 200));

  let result = [...PRODUCTS_DATA];

  if (category && category !== 'All') {
    result = result.filter(
      (p) => p.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(p.category.toLowerCase())
    );
  }

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  return result;
};

const fetchCategories = async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return CATEGORIES_DATA;
};

// TanStack Query custom hook for fetching product list
export const useGetProducts = (category = 'All', search = '') => {
  return useQuery({
    queryKey: ['products', category, search],
    queryFn: () => fetchProducts(category, search),
  });
};

// Hook for fetching categories
export const useGetCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};

// Hook for fetching product by ID
export const useGetProductById = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return PRODUCTS_DATA.find((p) => p.id === id) || null;
    },
    enabled: !!id,
  });
};
