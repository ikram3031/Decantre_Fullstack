import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/core/api-client';

export interface DailyCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export function useOrderCounts(days = 30) {
  return useQuery<DailyCount[]>({
    queryKey: ['dashboard', 'orders', 'daily', days],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/dashboard/orders/daily', { params: { days } });
      return (res.data && res.data.data) || [];
    },
    staleTime: 60 * 1000,
  });
}

export default useOrderCounts;
