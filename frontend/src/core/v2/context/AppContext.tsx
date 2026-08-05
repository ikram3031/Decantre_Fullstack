import React, { createContext, useContext, ReactNode } from 'react';
import { useAppStore, AppState } from '../store/useAppStore';
import { Product, CartPricing } from '../types';

export interface AppContextType extends AppState {
  filteredProducts: Product[];
  cartSubtotal: number;
  discountAmount: number;
  shippingFee: number;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = (): AppContextType => {
  const store = useAppStore();
  
  // Computed values
  const filteredProducts = store.getFilteredProducts();
  const pricing: CartPricing = store.getCartPricing();

  return {
    ...store,
    filteredProducts,
    ...pricing
  };
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const fetchCategories = useAppStore((state) => state.fetchCategories);
  const fetchBrands = useAppStore((state) => state.fetchBrands);

  React.useEffect(() => {
    const state = useAppStore.getState();
    if (!state.categories || state.categories.length === 0) {
      fetchCategories({ skip: 0, limit: 100 });
    }
    if (!state.brands || state.brands.length === 0) {
      fetchBrands({ skip: 0, limit: 100 });
    }
  }, [fetchCategories, fetchBrands]);

  return (
    <AppContext.Provider value={null}>
      {children}
    </AppContext.Provider>
  );
};
