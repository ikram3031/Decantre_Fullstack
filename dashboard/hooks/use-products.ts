import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Out of Stock';
  image?: string;
}

interface FetchProductsParams {
  search?: string;
  category?: string;
}

const fetchProducts = async (params?: FetchProductsParams): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>('/api/v1/products', { params });
  return data;
};

export function useProducts(params?: FetchProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}
