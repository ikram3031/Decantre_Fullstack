import { create } from 'zustand';
import { apiClient } from '../api/apiClient';
import { UserProfile } from '../types';

type AuthState = {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: UserProfile | null) => void;
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  } catch (e) {
    // ignore
  }
};

export const useAuthStore = create<AuthState>((set) => {
  // hydrate from localStorage synchronously
  let initialUser: UserProfile | null = null;
  try {
    const su = localStorage.getItem('admin_user');
    if (su) initialUser = JSON.parse(su);
  } catch (e) {
    initialUser = null;
  }

  return {
    user: initialUser,
    isLoading: false,
    error: null,
    setUser: (u) => {
      try {
        if (u) localStorage.setItem('admin_user', JSON.stringify(u));
        else localStorage.removeItem('admin_user');
      } catch (e) {
        // ignore
      }
      set({ user: u });
    },
    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        const json = response.data || {};
        const payload = json.data || json || {};
        const accessToken = payload.accessToken || payload.token || payload.authToken;
        const refreshToken = payload.refreshToken || payload.refresh_token || payload.refresh;
        const loggedUser = payload.user || payload.userInfo || payload.profile;

        if (!accessToken || !loggedUser) {
          const msg = json?.message || 'Invalid login response from server';
          set({ error: msg });
          throw new Error(msg);
        }

        try {
          localStorage.setItem('admin_token', accessToken);
          if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken);
          localStorage.setItem('admin_user', JSON.stringify(loggedUser));
        } catch (e) {
          // ignore storage errors
        }

        set({ user: loggedUser });
      } catch (err: any) {
        const msg = err?.response?.data?.message || err.message || 'Failed to login';
        set({ error: msg });
        throw err;
      } finally {
        set({ isLoading: false });
      }
    },
    logout: () => {
      clearStoredAuth();
      set({ user: null });
    },
  } as AuthState;
});

export default useAuthStore;
