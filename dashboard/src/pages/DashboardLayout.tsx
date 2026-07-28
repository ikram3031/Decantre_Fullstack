import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, ExternalLink } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row text-[var(--foreground)] antialiased selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
        <AppSidebar className="fixed inset-y-0 left-0 z-50 w-64 h-screen" />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-64">
        {/* Top Navbar */}
        <header className="h-16 bg-[var(--popover)] border-b border-[color:var(--border)] px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
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

            <div className="rounded-full border border-slate-200 bg-[var(--accent)] p-1 shadow-sm">
              <ModeToggle />
            </div>

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
    </SidebarProvider>
  );
};
