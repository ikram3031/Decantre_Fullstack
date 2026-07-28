import React from 'react';
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { ProductsPage } from './pages/ProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { UsersPage } from './pages/UsersPage';

// 1. Define Root Route
const rootRoute = createRootRoute({
  component: function RootComponent() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold font-sans">Booting secure session...</span>
        </div>
      );
    }

    if (!user) {
      return <LoginPage />;
    }

    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );
  },
  errorComponent({ error }) {
    return (
      <div className="min-h-screen bg-rose-50 text-rose-900 flex flex-col items-center justify-center p-6 gap-4">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-sm text-rose-700 max-w-lg text-center">An unexpected error occurred while rendering the app.</p>
        <pre className="whitespace-pre-wrap text-xs bg-white border border-rose-200 rounded-2xl p-4 text-rose-800 max-w-xl overflow-x-auto">
          {String(error)}
        </pre>
      </div>
    );
  },
});

// 2. Define Child Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardHome,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersPage,
});

const orderDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: OrderDetailsPage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomersPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
});

// 3. Create Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  ordersRoute,
  orderDetailsRoute,
  productsRoute,
  customersRoute,
  usersRoute,
]);

// 4. Instantiate Router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;
