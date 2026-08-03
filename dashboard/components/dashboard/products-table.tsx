'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ImageIcon, PackageX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import type { Product } from '@/types';

interface ProductsTableProps {
  searchQuery: string;
  categoryFilter: string;
  brandFilter: string;
  page?: number;
  onTotalPagesChange?: (totalPages: number) => void;
}

export function ProductsTable({ searchQuery, categoryFilter, brandFilter, page = 1, onTotalPagesChange }: ProductsTableProps) {
  const queryClient = useQueryClient();

  const { data: responseData, isLoading, isError, error } = useProducts({
    search: searchQuery,
    category: categoryFilter !== 'All' && categoryFilter !== 'LowStock' ? categoryFilter : undefined,
    brand: brandFilter !== 'All' ? brandFilter : undefined,
    page,
    limit: 15,
  });

  const products = responseData?.data ?? [];
  const totalPages = responseData?.meta?.totalPages ?? 1;

  useEffect(() => {
    if (onTotalPagesChange && responseData?.meta) {
      onTotalPagesChange(totalPages);
    }
  }, [totalPages, onTotalPagesChange, responseData]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/products/${deleteTarget.id}`);
      toast.success(`Product "${deleteTarget.name}" deleted.`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Update Stock ──────────────────────────────────────────────────────────
  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const handleSetOutOfStock = async () => {
    if (!stockTarget) return;
    setIsUpdatingStock(true);
    try {
      await apiClient.put(`/api/v1/products/${stockTarget.id}`, {
				stockStatus: "outofstock",
			});
      toast.success(`"${stockTarget.name}" set to Out of Stock.`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockTarget(null);
    } catch {
      toast.error('Failed to update stock status.');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch products. {error instanceof Error ? error.message : 'Unknown error occurred.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px] min-w-[180px]">Product</TableHead>
            <TableHead className="w-[120px]">SKU</TableHead>
            <TableHead className="w-[140px]">Category</TableHead>
            <TableHead className="w-[120px]">Brand</TableHead>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead className="w-[110px]">Stock</TableHead>
            <TableHead className="w-[60px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-md flex-shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.id}>
                {/* Product name + image */}
                <TableCell className="max-w-[280px]">
                  <div className="flex items-center gap-3 min-w-0">
                    {product.image ? (
                      <div className="relative h-9 w-9 overflow-hidden rounded-md border flex-shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" unoptimized />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted flex-shrink-0">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium truncate" title={product.name}>{product.name}</span>
                  </div>
                </TableCell>

                {/* SKU */}
                <TableCell className="max-w-[120px]">
                  <span className="text-muted-foreground truncate block" title={product.sku}>{product.sku}</span>
                </TableCell>

                {/* Category */}
                <TableCell className="max-w-[140px]">
                  <span className="truncate block" title={product.category}>{product.category}</span>
                </TableCell>

                {/* Brand */}
                <TableCell className="max-w-[120px]">
                  <span className="truncate block text-muted-foreground" title={product.brand ?? '—'}>{product.brand ?? '—'}</span>
                </TableCell>

                {/* Price */}
                <TableCell className="w-[100px] font-medium">৳{product.price.toFixed(2)}</TableCell>

                {/* Stock status */}
                <TableCell className="w-[110px]">
                  {product.status === 'In Stock' ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" variant="outline">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20" >
                      Out of Stock
                    </Badge>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right w-[60px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setStockTarget(product)}
                        disabled={product.status !== 'In Stock'}
                      >
                        <PackageX className="h-4 w-4 mr-2 text-muted-foreground" />
                        Update Stock
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                      >
                        Delete Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Update Stock Dialog */}
      <Dialog open={!!stockTarget} onOpenChange={(open) => !open && setStockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageX className="h-5 w-5 text-destructive" />
              Set Out of Stock
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to mark{' '}
              <span className="font-semibold text-foreground">`{stockTarget?.name}`</span>{' '}
              as <span className="font-semibold text-destructive">Out of Stock</span>?
              <br />
              <span className="text-xs mt-1 block">This will hide the product from the store until stock is replenished.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStockTarget(null)}
              disabled={isUpdatingStock}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSetOutOfStock}
              disabled={isUpdatingStock}
            >
              {isUpdatingStock ? 'Updating...' : 'Yes, Set Out of Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteProduct}
        isDeleting={isDeleting}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ''}"? This cannot be undone.`}
      />
    </div>
  );
}
