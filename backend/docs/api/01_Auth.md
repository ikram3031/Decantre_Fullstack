#
This document outlines the complete implementation of the authentication system for the E-commerce ERP & Inventory Dashboard, leveraging **Zustand**, **Axios**, and **TypeScript/JavaScript** with the backend API base URL: `http://144.79.218.126:5092`.

#
## 1. Environment Setup

Configure your environment variables in the root directory of your React/Vite application by creating or updating the `.env` file:

```env
VITE_API_BASE_URL=http://144.79.218.126:5092
```

---

## 2. Axios Client & Interceptor Configuration (`src/api/axios.js`)

The centralized Axios instance handles automated injection of Access Tokens into requests, and seamless handling of expired tokens via the Refresh Token endpoint.

```javascript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized & Token Refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        // Request new access token using refresh token
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        // Save updated tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

```

---

## 3. Zustand Auth Store (`src/store/useAuthStore.js`)

Manage global user state, login state changes, and logout sequences cleanly with Zustand.

```javascript
import { create } from 'zustand';
import { api } from '../api/axios';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },
}));

```

---

## 4. Protected Route Guard (`src/components/ProtectedRoute.jsx`)

Restrict dashboard and internal ERP screens from unauthenticated visitors.

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

```

---

## 5. Router Setup (`src/router.jsx`)

Integrate authentication guards within your application routing configuration.

```jsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardHome />,
      },
    ],
  },
]);

```

"""

with open("auth_documentation.md", "w", encoding="utf-8") as f:
f.write(markdown_content)

```

আপনার প্রজেক্টের জন্য কমপ্লিট এবং প্রফেশনাল **Authentication Documentation** একটি Markdown ফাইলে (`auth_documentation.md`) জেনरेट করা হয়েছে।

আপনার Markdown ফাইলটি নিচে দেওয়া হলো:

Your Markdown file is ready
[file-tag: code-generated-file-e577ee48-0d0a-4cb1-8205-9095e926cfba]

```markdown
# Comprehensive Frontend Authentication Documentation

This document outlines the complete implementation of the authentication system for the E-commerce ERP & Inventory Dashboard, leveraging **Zustand**, **Axios**, and **TypeScript/JavaScript** with the backend API base URL: `http://144.79.218.126:5092`.

---

## 1. Environment Setup

Configure your environment variables in the root directory of your React/Vite application by creating or updating the `.env` file:

```env
VITE_API_BASE_URL=[http://144.79.218.126:5092](http://144.79.218.126:5092)

```

---

## 2. Axios Client & Interceptor Configuration (`src/api/axios.js`)

The centralized Axios instance handles automated injection of Access Tokens into requests, and seamless handling of expired tokens via the Refresh Token endpoint.

```javascript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized & Token Refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        // Request new access token using refresh token
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        // Save updated tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

```

---

## 3. Zustand Auth Store (`src/store/useAuthStore.js`)

Manage global user state, login state changes, and logout sequences cleanly with Zustand.

```javascript
import { create } from 'zustand';
import { api } from '../api/axios';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },
}));

```

---

## 4. Protected Route Guard (`src/components/ProtectedRoute.jsx`)

Restrict dashboard and internal ERP screens from unauthenticated visitors.

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Outlet/> : <Navigate replace to="/login"/>;
};

```

---

## 5. Router Setup (`src/router.jsx`)

Integrate authentication guards within your application routing configuration.

```jsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login/>,
  },
  {
    element: <ProtectedRoute/>,
    children: [
      {
        path: '/',
        element: <DashboardHome/>,
      },
    ],
  },
]);

```