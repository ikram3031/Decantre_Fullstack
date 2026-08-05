'use client';

import { SidebarProvider } from '@/components/core/ui/sidebar';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { MetadataCacheLoader } from '@/lib/core/category-cache';

export function ClientSidebarProvider({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen } = useDashboardStore();

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
      <MetadataCacheLoader />
      {children}
    </SidebarProvider>
  );
}
