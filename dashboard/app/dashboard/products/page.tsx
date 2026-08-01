'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductsTable } from '@/components/dashboard/products-table';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useCategories, useBrands } from '@/lib/category-cache';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('all');

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products &amp; Inventory</h2>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Link>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock / Inventory</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={(value: string | null) => setCategoryFilter(value ?? 'All')}>
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

            <Select value={brandFilter} onValueChange={(value: string | null) => setBrandFilter(value ?? 'All')}>
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
            <TabsContent value="all" className="m-0">
              <ProductsTable searchQuery={searchQuery} categoryFilter={categoryFilter} brandFilter={brandFilter} />
            </TabsContent>
            <TabsContent value="low-stock" className="m-0">
              <ProductsTable searchQuery={searchQuery} categoryFilter="LowStock" brandFilter={brandFilter} />
            </TabsContent>
            
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
