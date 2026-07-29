'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGenericErrorMessage } from '@/lib/error-handler';
import { apiClient } from '@/lib/api-client';

export interface AuthUser {
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('accessToken');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse cached auth state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (!email || !password) {
        throw new Error('Please provide both email and password.');
      }

      const response = await apiClient.post('/api/v1/auth/login', { email, password });
      const { user: apiUser, accessToken, refreshToken } = response.data.data;

      const loggedUser: AuthUser = {
        email: apiUser.email || email,
        name: apiUser.name || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: apiUser.role || 'Administrator',
        avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      };

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (err: any) {
      // Sanitize and re-throw so the caller can forward to handleGlobalError
      throw new Error(getGenericErrorMessage(err, 'Sign in failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken }).catch(() => {});
      }
    } catch (_) {
      // ignore logout failure if offline
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

