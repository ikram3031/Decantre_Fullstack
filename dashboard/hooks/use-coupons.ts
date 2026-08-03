import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Coupon } from '@/types';

export interface CouponsListResponse {
  data: Coupon[];
  status: string;
}

const normalizeCoupon = (coupon: Coupon & { _id?: string }): Coupon => {
  if (!coupon) return coupon as Coupon;

  const normalizedId = coupon.id || coupon._id;
  return {
    ...coupon,
    id: normalizedId || '',
  } as Coupon;
};

const fetchCoupons = async (): Promise<Coupon[]> => {
  const response = await apiClient.get<CouponsListResponse>('/api/v1/coupons');
  const coupons = response.data?.data ?? [];

  return (Array.isArray(coupons) ? coupons : []).map((coupon) => normalizeCoupon(coupon as Coupon & { _id?: string }));
};

export function useCoupons() {
  return useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}
