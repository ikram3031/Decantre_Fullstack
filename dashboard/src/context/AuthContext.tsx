import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import useAuthStore from '../stores/useAuthStore';
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // listen for cross-window logout events and delegate to store
  useEffect(() => {
    const handle = () => useAuthStore.getState().logout();
    window.addEventListener('dashboard-logout', handle);
    return () => window.removeEventListener('dashboard-logout', handle);
  }, []);

  const authState = useAuthStore();

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const { user, isLoading, login, logout, error } = useAuthStore();
  return { user, isLoading, login, logout, error };
};
