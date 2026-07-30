'use client';

import { useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

const STORAGE_KEY = 'decantre_category_cache';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export interface CategoryCacheEntry {
  did: string;
  name: string;
  slug: string;
}

interface CategoryCache {
  fetchedAt: number;
  categories: CategoryCacheEntry[];
}

// ─── Public helpers (can be imported anywhere) ────────────────────────────────

export function getCategoryCache(): CategoryCacheEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: CategoryCache = JSON.parse(raw);
    // Return stale data — it will be refreshed in the background by the loader
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

function isCacheStale(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const parsed: CategoryCache = JSON.parse(raw);
    return Date.now() - (parsed.fetchedAt ?? 0) > CACHE_TTL_MS;
  } catch {
    return true;
  }
}

async function fetchAndCacheCategories(): Promise<void> {
  try {
    const response = await apiClient.get<any>('/api/v1/categories');
    const data: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);

    const categories: CategoryCacheEntry[] = data
      .filter((c) => c.did && c.name)
      .map((c) => ({
        did: c.did as string,
        name: c.name as string,
        slug: c.slug as string,
      }));

    const cache: CategoryCache = { fetchedAt: Date.now(), categories };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('[CategoryCache] Failed to fetch categories:', err);
  }
}

// ─── React component — mount this once at layout level ───────────────────────

export function CategoryCacheLoader() {
  useEffect(() => {
    if (isCacheStale()) {
      fetchAndCacheCategories();
    }
  }, []);

  return null; // renders nothing
}
