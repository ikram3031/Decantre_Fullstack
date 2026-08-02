import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Coupon } from '@/types';

export interface CouponsListResponse {
  data: Coupon[];
  status: string;
}

const fetchCoupons = async (): Promise<Coupon[]> => {
  const response = await apiClient.get<CouponsListResponse>('/api/v1/coupons');
  return response.data.data || [];
};

export function useCoupons() {
  return useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}
