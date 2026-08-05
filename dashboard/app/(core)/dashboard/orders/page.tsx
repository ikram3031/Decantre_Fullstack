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

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) => apiClient.delete(`/api/v1/orders/${id}`))
      );
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
      
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID or customer..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="flex items-center gap-1 mr-2 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Select value={statusFilter} onValueChange={handleStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-card text-card-foreground shadow-sm border rounded-lg">
        <div className="p-6">
          <OrdersTable
            searchQuery={searchQuery}
            statusFilter={statusFilter}
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
