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
  return (
    <AppContext.Provider value={null}>
      {children}
    </AppContext.Provider>
  );
};
