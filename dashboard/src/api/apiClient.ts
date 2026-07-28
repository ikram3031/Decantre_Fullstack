import axios, { InternalAxiosRequestConfig } from 'axios';

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || '';
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
    return '';
  }
  return envUrl ? envUrl.replace(/\/$/, '') : '';
};

export const apiClient = axios.create({
  baseURL: `${getApiBaseUrl() || 'http://localhost:4000'}/api/v1`,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    if (config.headers?.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let refreshQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

const clearAuthStorage = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
};

const triggerLogout = () => {
  clearAuthStorage();
  window.dispatchEvent(new Event('dashboard-logout'));
};

const refreshTokenRequest = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('admin_refresh_token');
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const defaultBase = apiClient.defaults.baseURL ? apiClient.defaults.baseURL.replace(/\/api\/v1$/, '') : '';
  const url = `${getApiBaseUrl() || defaultBase}/api/v1/auth/refresh-token`;
  const response = await axios.post(url, { refreshToken });
  const payload = response.data?.data || response.data || {};
  const newToken = payload.accessToken || payload.token || payload.authToken;
  const newRefreshToken = payload.refreshToken || payload.refresh_token || payload.refresh;

  if (!newToken) {
    throw new Error('Failed to refresh token');
  }

  localStorage.setItem('admin_token', newToken);
  if (newRefreshToken) {
    localStorage.setItem('admin_refresh_token', newRefreshToken);
  }

  return newToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/api/refresh')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string | null) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const token = await refreshTokenRequest();
        processQueue(null, token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        triggerLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
