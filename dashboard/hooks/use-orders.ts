import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

import type { Order, OrderDetails } from '@/types';

export type { Order, OrderDetails };

interface FetchOrdersParams {
  search?: string;
  status?: string;
}

type OrdersApiResponse = {
  data?: unknown[];
} | unknown[];

type BackendOrder = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  customer?: { fullName?: string };
  createdAt?: string;
  totals?: { total?: number };
  status?: string;
};

const fetchOrders = async (params?: FetchOrdersParams): Promise<Order[]> => {
  try {
    const queryParams: Record<string, string | number> = {
      limit: 15,
      page: 1,
    };
    if (params?.status) queryParams.status = params.status.toLowerCase();
    if (params?.search) queryParams.email = params.search;

    const response = await apiClient.get<OrdersApiResponse>('/api/v1/orders', { params: queryParams });
    const responseData = response.data;
    const rawOrderList = Array.isArray(responseData)
      ? responseData
      : responseData?.data ?? [];
    const orderList = Array.isArray(rawOrderList) ? (rawOrderList as BackendOrder[]) : [];

    if (orderList.length > 0) {
      return orderList.map((o: BackendOrder) => {
        let fulfillment: Order['fulfillmentStatus'] = 'Pending';
        if (o.status === 'processing') {
          fulfillment = 'Processing';
        } else if (o.status === 'shipped' || o.status === 'completed') {
          fulfillment = 'Shipped';
        } else if (o.status === 'cancelled') {
          fulfillment = 'Cancelled';
        }

        const isPaid = o.status === 'completed' || o.status === 'shipped';

        const id = o._id || o.id || `UNKNOWN-${Math.random().toString(36).slice(2, 10)}`;

        return {
          id,
          orderNumber: o.orderNumber || `ORD-${o._id?.slice(-8) || id}`,
          customerName: o.customer?.fullName || 'Guest Customer',
          date: o.createdAt || new Date().toISOString(),
          totalAmount: o.totals?.total || 0,
          paymentStatus: isPaid ? 'Paid' : 'Pending',
          fulfillmentStatus: fulfillment,
        };
      });
    }
  } catch (err) {
    console.warn('Backend API orders request failed, using fallback mock data:', err);
  }

  let result: Order[] = [];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(o => o.customerName.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q));
  }
  if (params?.status && params.status !== 'All') {
    result = result.filter(o => o.fulfillmentStatus.toLowerCase() === params.status?.toLowerCase());
  }

  return result;
};

export function useOrders(params?: FetchOrdersParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
  });
}

const fetchOrderById = async (id: string): Promise<OrderDetails> => {
  const response = await apiClient.get<{ data?: OrderDetails }>(`/api/v1/orders/${id}`);
  if (!response.data?.data) {
    throw new Error('Order not found');
  }
  return response.data.data;
};

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
}
