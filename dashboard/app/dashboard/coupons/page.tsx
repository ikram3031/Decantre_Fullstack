'use client';

import { useState } from 'react';
import { CouponsTable } from '@/components/dashboard/coupons-table';
import { CouponDialog } from '@/components/dashboard/coupon-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { Coupon } from '@/types';

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog control states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleStatusFilter = (v: string | null) => {
    setStatusFilter(v ?? 'All');
    setCurrentPage(1);
  };

  const handleTypeFilter = (v: string | null) => {
    setTypeFilter(v ?? 'All');
    setCurrentPage(1);
  };

  const handleOpenAddDialog = () => {
    setEditingCoupon(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coupons & Promotions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage discount codes, product restrictions, and usage limits.
          </p>
        </div>
        <Button onClick={handleOpenAddDialog} className="shadow transition-all hover:scale-[1.02] cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search coupon codes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active Only</SelectItem>
              <SelectItem value="Inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Discount Type Filter */}
          <Select value={typeFilter} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Percentage">Percentage</SelectItem>
              <SelectItem value="Fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card text-card-foreground shadow-sm border rounded-lg p-6">
        <CouponsTable
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          page={currentPage}
          onTotalPagesChange={setTotalPages}
          onEditClick={handleOpenEditDialog}
        />

        {/* Pagination Section */}
        {totalPages > 1 && (
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
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1;

                  if (!showPage) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <PaginationItem key={`ellipsis-${pageNum}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        className="cursor-pointer"
                      >
                        {pageNum}
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
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Coupon Creation / Editing Modal */}
      <CouponDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        couponToEdit={editingCoupon}
      />
    </div>
  );
}
