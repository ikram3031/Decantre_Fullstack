import React, { createContext, useContext } from 'react';
import { useAppStore } from '../store/useAppStore';

const AppContext = createContext();

export const useApp = () => {
  const store = useAppStore();
  
  // Computed values
  const filteredProducts = store.getFilteredProducts();
  const pricing = store.getCartPricing();

  return {
    ...store,
    filteredProducts,
    ...pricing
  };
};

export const AppProvider = ({ children }) => {
  const categories = useAppStore((state) => state.categories);
  const brands = useAppStore((state) => state.brands);
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
  }, []);

  return (
    <AppContext.Provider value={null}>
      {children}
    </AppContext.Provider>
  );
};
