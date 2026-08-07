'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGenericErrorMessage } from '@/lib/core/error-handler';
import { apiClient } from '@/lib/core/api-client';

export interface AuthUser {
  id?: string;
  did?: string;
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
  loginWithGoogle: (code: string, redirectUri: string) => Promise<void>;
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
    try {
      if (!email || !password) {
        throw new Error('Please provide both email and password.');
      }

      const response = await apiClient.post('/api/v1/auth/login', { email, password });
      const { user: apiUser, accessToken, refreshToken } = response.data.data;

      const loggedUser: AuthUser = {
        id: apiUser.id || apiUser._id,
        did: apiUser.did,
        email: apiUser.email || email,
        name: apiUser.name || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: apiUser.role || "Employee",
        avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      };

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (err: unknown) {
      // Sanitize and re-throw so the caller can forward to handleGlobalError
      throw new Error(getGenericErrorMessage(err, 'Sign in failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (code: string, redirectUri: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/api/v1/auth/google', { code, redirectUri });
      const { user: apiUser, accessToken, refreshToken } = response.data.data;

      const loggedUser: AuthUser = {
        id: apiUser.id || apiUser._id,
        did: apiUser.did,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role,
        avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      };

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (err: unknown) {
      throw new Error(getGenericErrorMessage(err, 'Google Sign-in failed. Please verify your account.'));
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
    <AuthContext.Provider value={{ user, isLoading, login, logout, loginWithGoogle }}>
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

