'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const CATEGORY_STORAGE_KEY = 'decantre_category_cache';
const BRAND_STORAGE_KEY = 'decantre_brand_cache';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export interface CategoryCacheEntry {
  did: string;
  name: string;
  slug: string;
}

export interface BrandCacheEntry {
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

export function getCategoryName(did: string): string | null {
  const cache = getCategoryCache();
  return cache.find((c) => c.did === did)?.name ?? null;
}

export function getCategoryNamesByDids(dids: string[]): string[] {
  if (!dids || dids.length === 0) return [];
  const cache = getCategoryCache();
  const map = new Map(cache.map((c) => [c.did, c.name]));
  return dids.map((d) => map.get(d)).filter(Boolean) as string[];
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

export function getBrandName(did: string): string | null {
  const cache = getBrandCache();
  return cache.find((b) => b.did === did)?.name ?? null;
}

export function getBrandNamesByDids(dids: string[]): string[] {
  if (!dids || dids.length === 0) return [];
  const cache = getBrandCache();
  const map = new Map(cache.map((b) => [b.did, b.name]));
  return dids.map((d) => map.get(d)).filter(Boolean) as string[];
}

// ─── TanStack Query Hooks ────────────────────────────────────────────────────

interface ApiListResponse<T> {
  data?: T[];
}

interface CategoryApiItem {
  did?: string;
  name?: string;
  slug?: string;
}

interface BrandApiItem {
  did?: string;
  name?: string;
  slug?: string;
  parent?: string;
}

const isCategoryApiItem = (item: unknown): item is CategoryApiItem =>
  typeof item === 'object' &&
  item !== null &&
  typeof (item as CategoryApiItem).did === 'string' &&
  typeof (item as CategoryApiItem).name === 'string';

const isBrandApiItem = (item: unknown): item is BrandApiItem =>
  typeof item === 'object' &&
  item !== null &&
  typeof (item as BrandApiItem).did === 'string' &&
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
          did: c.did,
          name: c.name,
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
          did: b.did,
          name: b.name,
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

