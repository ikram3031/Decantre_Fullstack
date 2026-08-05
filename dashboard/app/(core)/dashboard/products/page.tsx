'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductsTable } from '@/components/core/dashboard/products-table';
import { Input } from '@/components/core/ui/input';
import { Search, Plus, Trash2, PackageX } from 'lucide-react';
import { useCategories, useBrands } from '@/lib/core/category-cache';
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
import { Button } from '@/components/core/ui/button';
import { ConfirmDeleteDialog } from '@/components/core/ui/confirm-delete-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/core/ui/dialog';
import { apiClient } from '@/lib/core/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkStockOpen, setBulkStockOpen] = useState(false);
  const [isBulkStockUpdating, setIsBulkStockUpdating] = useState(false);

  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleCategory = (v: string | null) => {
    setCategoryFilter(v ?? 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleBrand = (v: string | null) => {
    setBrandFilter(v ?? 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) => apiClient.delete(`/api/v1/products/${id}`))
      );
      toast.success('Selected products deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch {
      toast.error('Failed to delete some products.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkOutOfStock = async () => {
    setIsBulkStockUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          apiClient.put(`/api/v1/products/${id}`, { stockStatus: 'outofstock' })
        )
      );
      toast.success('Selected products marked as Out of Stock.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedIds([]);
      setBulkStockOpen(false);
    } catch {
      toast.error('Failed to update stock status for some products.');
    } finally {
      setIsBulkStockUpdating(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products & Inventory</h2>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <div className="flex gap-1.5 items-center mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkStockOpen(true)}
                className="flex items-center gap-1 text-xs"
              >
                <PackageX className="h-3.5 w-3.5" />
                Set Out of Stock
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                className="flex items-center gap-1 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}
          <Select value={categoryFilter} onValueChange={handleCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.did} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brandFilter} onValueChange={handleBrand}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.did} value={brand.name}>{brand.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card text-card-foreground shadow-sm border rounded-lg">
        <div className="p-6">
          <ProductsTable
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            brandFilter={brandFilter}
            page={currentPage}
            onTotalPagesChange={setTotalPages}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t mt-4 pt-3">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage((p) => p - 1);
                          setSelectedIds([]);
                        }
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                            setSelectedIds([]);
                          }}
                          className="cursor-pointer"
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
                        if (currentPage < totalPages) {
                          setCurrentPage((p) => p + 1);
                          setSelectedIds([]);
                        }
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkDeleting}
        title="Delete Selected Products"
        description={`Are you sure you want to delete the ${selectedIds.length} selected products? This action cannot be undone.`}
      />

      {/* Bulk Out of Stock Dialog */}
      <Dialog open={bulkStockOpen} onOpenChange={setBulkStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageX className="h-5 w-5 text-destructive" />
              Set Out of Stock
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to mark the {selectedIds.length} selected products as <span className="font-semibold text-destructive">Out of Stock</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkStockOpen(false)}
              disabled={isBulkStockUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkOutOfStock}
              disabled={isBulkStockUpdating}
            >
              {isBulkStockUpdating ? 'Updating...' : 'Yes, Mark Out of Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
