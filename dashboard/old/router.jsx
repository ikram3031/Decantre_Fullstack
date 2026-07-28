import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { useAuth } from '../src/context/AuthContext';
import LoginPage from '../src/pages/LoginPage';
import { DashboardLayout } from '../src/pages/DashboardLayout';
import { DashboardHome } from '../src/pages/DashboardHome';
import { OrdersPage } from '../src/pages/OrdersPage';
import { OrderDetailsPage } from '../src/pages/OrderDetailsPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CustomersPage } from '../src/pages/CustomersPage';
import { UsersPage } from '../src/pages/UsersPage';

// 1. Define Root Route
const rootRoute = createRootRoute({
  component: () => {
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

export default router;
