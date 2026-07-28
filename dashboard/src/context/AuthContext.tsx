import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '../api/apiClient';
import { AuthContextType, UserProfile } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearStoredAuth = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('dashboard-logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('dashboard-logout', handleLogoutEvent);
    };
  }, [logout]);

  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    const storedToken = localStorage.getItem('admin_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const json = response.data || {};
      const payload = json.data || json || {};
      const accessToken = payload.accessToken || payload.token || payload.authToken;
      const refreshToken = payload.refreshToken || payload.refresh_token || payload.refresh;
      const loggedUser = payload.user || payload.userInfo || payload.profile;

      if (!accessToken || !loggedUser) {
        const msg = json?.message || 'Invalid login response from server';
        setError(msg);
        throw new Error(msg);
      }

      localStorage.setItem('admin_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('admin_refresh_token', refreshToken);
      }
      localStorage.setItem('admin_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to login';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
