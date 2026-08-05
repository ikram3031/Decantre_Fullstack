'use client';

import { useState } from 'react';
import { OrdersTable } from '@/components/core/dashboard/orders-table';
import { Input } from '@/components/core/ui/input';
import { Button } from '@/components/core/ui/button';
import { Search, Download, PlusCircle } from 'lucide-react';
import Link from 'next/link';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/core/ui/pagination';

import { Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/core/ui/confirm-delete-dialog';
import { apiClient } from '@/lib/core/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const queryClient = useQueryClient();

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleStatus = (v: string | null) => {
    setStatusFilter(v ?? 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handlePayment = (v: string | null) => {
    setPaymentFilter(v ?? 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await apiClient.post('/api/v1/orders/bulk-delete', { ids: selectedIds });
      toast.success('Selected orders deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch {
      toast.error('Failed to delete some orders.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (status === 'placeholder') return;
    try {
      await apiClient.post('/api/v1/orders/bulk-update', { ids: selectedIds, status });
      toast.success(`Selected orders updated to status "${status}".`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedIds([]);
    } catch {
      toast.error('Failed to update orders.');
    }
  };

  const handleBulkPaymentChange = async (paymentStatus: string) => {
    if (paymentStatus === 'placeholder') return;
    try {
      await apiClient.post('/api/v1/orders/bulk-update', { ids: selectedIds, paymentStatus });
      toast.success(`Selected orders updated to payment status "${paymentStatus}".`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedIds([]);
    } catch {
      toast.error('Failed to update orders.');
    }
  };
 
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/orders/new" />}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New In-Store Order
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>
 
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID or customer..."
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
          {selectedIds.length === 0 && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                <Select value={statusFilter} onValueChange={handleStatus}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Payment:</span>
                <Select value={paymentFilter} onValueChange={handlePayment}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedIds.length > 0 && (
            <>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap mr-1">
                {selectedIds.length} selected:
              </span>
              <Select value="placeholder" onValueChange={handleBulkStatusChange}>
                <SelectTrigger className="w-[130px] h-9 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <SelectValue placeholder="Bulk Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled className="hidden">Bulk Status</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value="placeholder" onValueChange={handleBulkPaymentChange}>
                <SelectTrigger className="w-[130px] h-9 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <SelectValue placeholder="Bulk Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled className="hidden">Bulk Payment</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => setBulkDeleteOpen(true)}
                className="h-9 w-9 flex items-center justify-center shrink-0"
                title={`Delete Selected (${selectedIds.length})`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-card text-card-foreground shadow-sm border rounded-lg">
        <div className="p-6">
          <OrdersTable
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            paymentFilter={paymentFilter}
            page={currentPage}
            onTotalPagesChange={setTotalPages}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
          />

          {/* Pagination */}
          <div className="border-t mt-4 pt-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;

                  if (!showPage) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                    }}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkDeleting}
        title="Delete Selected Orders"
        description={`Are you sure you want to permanently delete the ${selectedIds.length} selected orders? This action cannot be undone.`}
      />
    </div>
  );
}
