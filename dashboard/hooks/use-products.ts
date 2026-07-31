import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getCategoryCache, getBrandName } from '@/lib/category-cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  size: string;
  price: number;
  offerPrice: number | null;
  stockQuantity: number;
  sku: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand?: string;
  price: number;
  offerPrice: number | null;
  stock: number;
  status: 'In Stock' | 'Out of Stock';
  image?: string;
  type: 'simple' | 'variant';
  variants: ProductVariant[];
}

interface FetchProductsParams {
  search?: string;
  category?: string;
  brand?: string;
}

// ─── Image URL resolver ──────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

const resolveImageUrl = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

// ─── Backend Types ───────────────────────────────────────────────────────────

type BackendCategory = {
  _id?: string;
  id?: string;
  did?: string;
  name?: string;
};

type BackendVariant = {
  size?: string;
  price?: number | string;
  offerPrice?: number | string | null;
  stockQuantity?: number | string;
  sku?: string;
  sortOrder?: number | string;
};

type BackendProduct = {
  id?: string;
  _id?: string;
  did?: string;
  name?: string;
  sku?: string;
  categories?: Array<string | BackendCategory>;
  brand?: string | string[];
  price?: number | string;
  offerPrice?: number | string | null;
  stock?: number | string;
  stockQuantity?: number | string;
  stockStatus?: string;
  stock_status?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  image_url?: string;
  thumbnail_url?: string;
  type?: string;
  variants?: BackendVariant[];
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchProducts = async (params?: FetchProductsParams): Promise<Product[]> => {
  const body: Record<string, string> = { limit: "15" };

  if (params?.search) body.q = params.search;
  if (params?.category) body.category = params.category;
  if (params?.brand) body.brand = params.brand;

  const response = (body.category || body.brand || body.q)
    ? await apiClient.post<unknown>('/api/v1/products', body)
    : await apiClient.get<unknown>('/api/v1/products', { params: { q: params?.search, limit: 15 } });

  const responseData = response.data;
  let productList: BackendProduct[] = [];

  if (Array.isArray(responseData)) {
    productList = responseData as BackendProduct[];
  } else if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData &&
    Array.isArray((responseData as { data: unknown }).data)
  ) {
    productList = (responseData as { data: unknown }).data as BackendProduct[];
  }

  return productList.map((p): Product => {
    // Resolve category name via localStorage cache (did → name)
    let categoryName = 'Uncategorized';
    const rawCats = Array.isArray(p.categories) ? p.categories : [];

    if (rawCats.length > 0) {
      const firstCat = rawCats[0];
      if (typeof firstCat === 'object' && firstCat !== null && 'name' in firstCat && firstCat.name) {
        categoryName = firstCat.name;
      } else {
        const cache = getCategoryCache();
        const catId = typeof firstCat === 'string' ? firstCat : firstCat?._id?.toString?.();
        const matched = cache.find((c) => c.did === catId);
        categoryName = matched?.name ?? 'Uncategorized';
      }
    }

    const productType: 'simple' | 'variant' = p.type === 'variant' ? 'variant' : 'simple';

    const variants: ProductVariant[] = Array.isArray(p.variants)
      ? p.variants.map((v) => ({
          size: v.size ?? '',
          price: Number(v.price ?? 0),
          offerPrice: v.offerPrice != null ? Number(v.offerPrice) : null,
          stockQuantity: Number(v.stockQuantity ?? 0),
          sku: v.sku ?? '',
          sortOrder: Number(v.sortOrder ?? 0),
        }))
      : [];

    // Resolve brand name from did
    const brandName = (() => {
      const rawBrands = Array.isArray(p.brand) ? p.brand : typeof p.brand === 'string' ? [p.brand] : [];
      if (rawBrands.length > 0 && typeof rawBrands[0] === 'string') {
        return getBrandName(rawBrands[0]) || rawBrands[0];
      }
      return undefined;
    })();

    return {
      id: p.id || p._id || 'UNKNOWN',
      name: p.name || '',
      sku: p.sku || p.did || 'SKU-UNKNOWN',
      category: categoryName,
      brand: brandName,
      price: Number(p.price ?? 0),
      offerPrice: p.offerPrice != null ? Number(p.offerPrice) : null,
      stock: typeof p.stock === 'number' ? p.stock : Number(p.stockQuantity ?? 10),
      status: (p.stockStatus || p.stock_status) === 'instock' ? 'In Stock' : 'Out of Stock',
      image: resolveImageUrl(p.imageUrl || p.thumbnailUrl || p.image_url || p.thumbnail_url),
      type: productType,
      variants,
    };
  });
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProducts(params?: FetchProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}

