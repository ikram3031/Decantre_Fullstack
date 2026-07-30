import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getCategoryNamesByDids, getCategoryCache } from '@/lib/category-cache';

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
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockProducts: Product[] = [
  {
    id: 'P001',
    name: 'Oud Imperial Eau de Parfum',
    sku: 'OUD-IMP-100',
    category: 'Fragrance',
    price: 18500,
    offerPrice: null,
    stock: 24,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80',
    type: 'variant',
    variants: [
      { size: '50ml', price: 12500, offerPrice: null, stockQuantity: 10, sku: 'OUD-IMP-50', sortOrder: 0 },
      { size: '100ml', price: 18500, offerPrice: 16000, stockQuantity: 14, sku: 'OUD-IMP-100', sortOrder: 1 },
    ],
  },
  {
    id: 'P002',
    name: 'Velvet Rose & Oud Cologne',
    sku: 'ROSE-OUD-50',
    category: 'Fragrance',
    price: 14550,
    offerPrice: 12500,
    stock: 8,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=300&q=80',
    type: 'simple',
    variants: [],
  },
  {
    id: 'P003',
    name: 'Midnight Amber Elixir',
    sku: 'AMB-ELI-100',
    category: 'Elixir',
    price: 21000,
    offerPrice: null,
    stock: 0,
    status: 'Out of Stock',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=300&q=80',
    type: 'simple',
    variants: [],
  },
  {
    id: 'P004',
    name: 'Saffron & Tobacco Essence',
    sku: 'SAF-TOB-75',
    category: 'Essence',
    price: 16000,
    offerPrice: null,
    stock: 45,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=300&q=80',
    type: 'variant',
    variants: [
      { size: '30ml', price: 8500, offerPrice: null, stockQuantity: 20, sku: 'SAF-TOB-30', sortOrder: 0 },
      { size: '75ml', price: 16000, offerPrice: null, stockQuantity: 15, sku: 'SAF-TOB-75', sortOrder: 1 },
      { size: '150ml', price: 28000, offerPrice: 25000, stockQuantity: 10, sku: 'SAF-TOB-150', sortOrder: 2 },
    ],
  },
  {
    id: 'P005',
    name: 'Royal Leather & Cedar',
    sku: 'LEA-CED-100',
    category: 'Fragrance',
    price: 19500,
    offerPrice: null,
    stock: 3,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80',
    type: 'simple',
    variants: [],
  },
];

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchProducts = async (params?: FetchProductsParams): Promise<Product[]> => {
  try {
    const queryParams: any = {};
    if (params?.search) queryParams.q = params.search;
    if (params?.category) queryParams.category = params.category;

    const response = await apiClient.get<any>('/api/v1/products', { params: queryParams });
    const productList = response.data?.data || (Array.isArray(response.data) ? response.data : []);

    if (productList.length > 0) {
      return productList.map((p: any): Product => {
        // Resolve category name via localStorage cache (did → name)
        let categoryName = 'Uncategorized';
        const rawCats: any[] = Array.isArray(p.categories) ? p.categories : [];

        if (rawCats.length > 0) {
          // Categories may be ObjectIds (strings) or populated objects
          // Backend stores category as ObjectId refs, but product also has brand[]  as did strings
          // Try: if item is a string that looks like a did → lookup in cache
          const firstCat = rawCats[0];
          if (typeof firstCat === 'object' && firstCat !== null && firstCat.name) {
            // Already populated with name
            categoryName = firstCat.name;
          } else {
            // Try matching against the category cache (by _id or did)
            const cache = getCategoryCache();
            const catId = typeof firstCat === 'string' ? firstCat : firstCat?._id?.toString?.();
            const matched = cache.find(
              (c) => c.did === catId || (c as any).id === catId
            );
            categoryName = matched?.name ?? 'Uncategorized';
          }
        }

        const productType: 'simple' | 'variant' =
          p.type === 'variant' ? 'variant' : 'simple';

        const variants: ProductVariant[] = Array.isArray(p.variants)
          ? p.variants.map((v: any) => ({
              size: v.size ?? '',
              price: Number(v.price ?? 0),
              offerPrice: v.offerPrice != null ? Number(v.offerPrice) : null,
              stockQuantity: Number(v.stockQuantity ?? 0),
              sku: v.sku ?? '',
              sortOrder: Number(v.sortOrder ?? 0),
            }))
          : [];

        return {
          id: p.id || p._id,
          name: p.name || '',
          sku: p.sku || p.did || 'SKU-UNKNOWN',
          category: categoryName,
          price: p.price || 0,
          offerPrice: p.offerPrice != null ? Number(p.offerPrice) : null,
          stock: typeof p.stock === 'number' ? p.stock : (p.stockQuantity ?? 10),
          status: p.stock_status === 'instock' ? 'In Stock' : 'Out of Stock',
          image: p.image_url || p.thumbnail_url || undefined,
          type: productType,
          variants,
        };
      });
    }
  } catch (err) {
    console.warn('Backend API products request failed, using fallback mock data:', err);
  }

  // Fallback mock
  let result = [...mockProducts];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }
  if (params?.category && params.category !== 'All' && params.category !== 'LowStock') {
    result = result.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
  }
  if (params?.category === 'LowStock') {
    result = result.filter(p => p.stock < 10);
  }

  return result;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProducts(params?: FetchProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}
