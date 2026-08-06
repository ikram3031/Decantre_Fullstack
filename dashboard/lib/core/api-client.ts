import axios from 'axios';
import { handleGlobalError } from './error-handler';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.decantrebd.com';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized & Token Refresh logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const authPath = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh-token') || requestUrl.includes('/api/v1/auth/login') || requestUrl.includes('/api/v1/auth/refresh-token');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !authPath) {
      originalRequest._retry = true;
      try {
        if (typeof window === 'undefined') throw new Error('Not running in client-side');

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Session expired. Please sign in again.');

        const res = await axios.post(`${baseURL}/api/v1/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    if (typeof window !== 'undefined') {
      handleGlobalError(error);
    }
    return Promise.reject(error);
  }
);

