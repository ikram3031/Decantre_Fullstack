import React, { useState, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useRouterState } from '@tanstack/react-router';
import { AppLogo } from '../components/AppLogo';
import {
  ShoppingBag,
  Boxes,
  Users,
  UserCheck,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ExternalLink,
  Compass
} from 'lucide-react';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Compass },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Products', href: '/products', icon: Boxes },
    { name: 'Members', href: '/customers', icon: UserCheck },
    { name: 'Users', href: '/users', icon: Users },
  ];

  const getActiveLinkClass = (href: string) => {
    const isActive = href === '/' ? currentPath === '/' : currentPath.startsWith(href);
    return isActive
      ? 'bg-slate-900 text-white shadow-xs'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for Mobile & Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 transform md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center shadow-xs">
              <AppLogo className="h-5 w-5 text-white" strokeWidth={3.8} />
            </div>
            <span className="font-bold text-slate-950 tracking-tight text-lg">Decantre</span>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-900" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${getActiveLinkClass(
                  item.href
                )}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout at bottom */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
              alt={user?.name || 'User'}
              className="h-10 w-10 rounded-full border border-slate-200 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-950 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-semibold rounded-xl transition duration-150 cursor-pointer shadow-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Quick Search */}
            <div className="hidden md:flex items-center gap-2.5 max-w-sm w-64 bg-slate-100 border border-slate-200/50 px-3 py-1.5 rounded-xl text-slate-400 focus-within:border-slate-400 focus-within:bg-white transition">
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="text"
                placeholder="Search orders, products..."
                className="bg-transparent border-0 outline-none text-xs text-slate-900 w-full placeholder-slate-400"
              />
              <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-md font-mono text-slate-500 shadow-xs">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition" title="Notifications">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-600 rounded-full border border-white" />
            </button>

            <a
              href="http://localhost:8001"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50 transition"
            >
              View Shop
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </header>

        {/* Active Route Render Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
