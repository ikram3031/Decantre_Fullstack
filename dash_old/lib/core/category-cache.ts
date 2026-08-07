'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/core/api-client';

const CATEGORY_STORAGE_KEY = 'decantre_category_cache';
const BRAND_STORAGE_KEY = 'decantre_brand_cache';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export interface CategoryCacheEntry {
  id?: string;
  _id?: string;
  did: string;
  name: string;
  slug: string;
}

export interface BrandCacheEntry {
  id?: string;
  _id?: string;
  did: string;
  name: string;
  slug: string;
  parent?: string;
}

// ─── Category Cache Helpers ──────────────────────────────────────────────────

export function getCategoryCache(): CategoryCacheEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.categories ?? [];
  } catch {
    return [];
  }
}

export function getCategoryName(val: string): string | null {
  if (!val) return null;
  const strVal = String(val).trim();
  if (!strVal) return null;

  const cache = getCategoryCache();
  const found = cache.find(
    (c) =>
      (c.did && c.did === strVal) ||
      (c._id && String(c._id) === strVal) ||
      (c.id && String(c.id) === strVal) ||
      (c.slug && c.slug.toLowerCase() === strVal.toLowerCase()) ||
      (c.name && c.name.toLowerCase() === strVal.toLowerCase())
  );
  return found?.name ?? null;
}

export function getCategoryNamesByDids(dids: string[]): string[] {
  if (!dids || dids.length === 0) return [];
  return dids.map((d) => getCategoryName(d)).filter(Boolean) as string[];
}

// ─── Brand Cache Helpers ─────────────────────────────────────────────────────

export function getBrandCache(): BrandCacheEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.brands ?? [];
  } catch {
    return [];
  }
}

export function getBrandName(val: string): string | null {
  if (!val) return null;
  const strVal = String(val).trim();
  if (!strVal) return null;

  const cache = getBrandCache();
  const found = cache.find(
    (b) =>
      (b.did && b.did === strVal) ||
      (b._id && String(b._id) === strVal) ||
      (b.id && String(b.id) === strVal) ||
      (b.slug && b.slug.toLowerCase() === strVal.toLowerCase()) ||
      (b.name && b.name.toLowerCase() === strVal.toLowerCase())
  );
  return found?.name ?? null;
}

export function getBrandNamesByDids(dids: string[]): string[] {
  if (!dids || dids.length === 0) return [];
  return dids.map((d) => getBrandName(d)).filter(Boolean) as string[];
}

// ─── TanStack Query Hooks ────────────────────────────────────────────────────

interface ApiListResponse<T> {
  data?: T[];
}

interface CategoryApiItem {
  id?: string;
  _id?: string;
  did?: string;
  name?: string;
  slug?: string;
}

interface BrandApiItem {
  id?: string;
  _id?: string;
  did?: string;
  name?: string;
  slug?: string;
  parent?: string;
}

const isCategoryApiItem = (item: unknown): item is CategoryApiItem =>
  typeof item === 'object' &&
  item !== null &&
  typeof (item as CategoryApiItem).name === 'string';

const isBrandApiItem = (item: unknown): item is BrandApiItem =>
  typeof item === 'object' &&
  item !== null &&
  typeof (item as BrandApiItem).name === 'string';

export function useCategories() {
  return useQuery<CategoryCacheEntry[]>({
    queryKey: ['categories-cache'],
    queryFn: async () => {
      const response = await apiClient.get<ApiListResponse<CategoryApiItem>>('/api/v1/categories');
      const responseData = response.data;
      const rawData = Array.isArray(responseData) ? responseData : responseData?.data ?? [];
      const categories: CategoryCacheEntry[] = (Array.isArray(rawData) ? rawData : [])
        .filter(isCategoryApiItem)
        .map((c) => ({
          id: c.id ? String(c.id) : undefined,
          _id: c._id ? String(c._id) : undefined,
          did: c.did ?? c.slug ?? String(c._id || c.id || ''),
          name: c.name!,
          slug: c.slug ?? '',
        }));

      if (typeof window !== 'undefined') {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify({ fetchedAt: Date.now(), categories }));
      }
      return categories;
    },
    staleTime: CACHE_TTL_MS,
  });
}

export function useBrands() {
  return useQuery<BrandCacheEntry[]>({
    queryKey: ['brands-cache'],
    queryFn: async () => {
      const response = await apiClient.get<ApiListResponse<BrandApiItem>>('/api/v1/brands', {
        params: { limit: 1000 },
      });
      const responseData = response.data;
      const rawData = Array.isArray(responseData) ? responseData : responseData?.data ?? [];
      const brands: BrandCacheEntry[] = (Array.isArray(rawData) ? rawData : [])
        .filter(isBrandApiItem)
        .map((b) => ({
          id: b.id ? String(b.id) : undefined,
          _id: b._id ? String(b._id) : undefined,
          did: b.did ?? b.slug ?? String(b._id || b.id || ''),
          name: b.name!,
          slug: b.slug ?? '',
          parent: b.parent,
        }));

      if (typeof window !== 'undefined') {
        localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify({ fetchedAt: Date.now(), brands }));
      }
      return brands;
    },
    staleTime: CACHE_TTL_MS,
  });
}

// ─── Loader Component ────────────────────────────────────────────────────────

export function MetadataCacheLoader() {
  useCategories();
  useBrands();
  return null;
}

