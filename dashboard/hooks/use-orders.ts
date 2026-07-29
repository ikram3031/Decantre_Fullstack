import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Order {
  id: string;
  customerName: string;
  date: string;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  fulfillmentStatus: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled';
}

interface FetchOrdersParams {
  search?: string;
  status?: string;
}

const fetchOrders = async (params?: FetchOrdersParams): Promise<Order[]> => {
  const { data } = await apiClient.get<Order[]>('/api/v1/orders', { params });
  return data;
};

export function useOrders(params?: FetchOrdersParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
  });
}
