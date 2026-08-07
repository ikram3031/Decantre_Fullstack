import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/core/api-client';

import type { Order, OrderDetails } from '@/types';

export type { Order, OrderDetails };

interface FetchOrdersParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export interface FetchOrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type BackendOrder = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  customer?: { fullName?: string };
  createdAt?: string;
  totals?: { total?: number };
  status?: string;
  paymentStatus?: string;
};

const fetchOrders = async (params?: FetchOrdersParams): Promise<FetchOrdersResponse> => {
  const limit = params?.limit ?? 15;
  const page = params?.page ?? 1;

  try {
    const queryParams: Record<string, string | number> = {
      limit,
      page,
    };
    if (params?.status) queryParams.status = params.status.toLowerCase();
    if (params?.paymentStatus) queryParams.paymentStatus = params.paymentStatus.toLowerCase();
    if (params?.search) queryParams.email = params.search;

    const response = await apiClient.get<{ data?: unknown[]; meta?: unknown }>('/api/v1/orders', { params: queryParams });
    const responseData = response.data;

    const rawOrderList = Array.isArray(responseData)
      ? responseData
      : responseData?.data ?? [];
    const orderList = Array.isArray(rawOrderList) ? (rawOrderList as BackendOrder[]) : [];
    const meta = (responseData?.meta as any) ?? {
      total: orderList.length,
      page,
      limit,
      totalPages: Math.ceil(orderList.length / limit),
    };

    const orders: Order[] = orderList.map((o: BackendOrder) => {
      let fulfillment: Order['orderStatus'] = 'Pending';
      if (o.status === 'processing') {
        fulfillment = 'Processing';
      } else if (o.status === 'shipped' || o.status === 'completed') {
        fulfillment = 'Shipped';
      } else if (o.status === 'cancelled') {
        fulfillment = 'Cancelled';
      }

      let paymentStatus: Order['paymentStatus'] = 'Pending';
      if (o.paymentStatus) {
        const p = o.paymentStatus.toLowerCase();
        if (p === 'paid') paymentStatus = 'Paid';
        else if (p === 'failed') paymentStatus = 'Failed';
        else paymentStatus = 'Pending';
      } else {
        const isPaid = o.status === 'completed' || o.status === 'shipped';
        paymentStatus = isPaid ? 'Paid' : 'Pending';
      }

      const id = o._id || o.id || `UNKNOWN-${Math.random().toString(36).slice(2, 10)}`;

      return {
        id,
        orderNumber: o.orderNumber || `ORD-${o._id?.slice(-8) || id}`,
        customerName: o.customer?.fullName || 'Guest Customer',
        date: o.createdAt || new Date().toISOString(),
        totalAmount: o.totals?.total || 0,
        paymentStatus,
        orderStatus: fulfillment,
      };
    });

    return {
      data: orders,
      meta: {
        total: meta.total ?? orders.length,
        page: meta.page ?? page,
        limit: meta.limit ?? limit,
        totalPages: meta.totalPages ?? Math.ceil((meta.total ?? orders.length) / limit),
      },
    };
  } catch (err) {
    console.warn('Backend API orders request failed:', err);
  }

  return {
    data: [],
    meta: { total: 0, page, limit, totalPages: 0 },
  };
};

export function useOrders(params?: FetchOrdersParams) {
  return useQuery<FetchOrdersResponse>({
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
