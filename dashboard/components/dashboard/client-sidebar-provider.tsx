'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { useDashboardStore } from '@/store/use-dashboard-store';

export function ClientSidebarProvider({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen } = useDashboardStore();

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
      {children}
    </SidebarProvider>
  );
}
