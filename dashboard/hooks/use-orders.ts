import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Order {
  id: string;
  orderNumber: string;
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

const mockOrders: Order[] = [
  {
    id: '1001',
    orderNumber: 'ORD-20260719-1001',
    customerName: 'Nadia Rahman',
    date: '2026-07-28T10:00:00.000Z',
    totalAmount: 18500,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Shipped',
  },
  {
    id: '1002',
    orderNumber: 'ORD-20260719-1002',
    customerName: 'Tanvir Hossain',
    date: '2026-07-29T14:30:00.000Z',
    totalAmount: 29050,
    paymentStatus: 'Pending',
    fulfillmentStatus: 'Processing',
  },
  {
    id: '1003',
    orderNumber: 'ORD-20260719-1003',
    customerName: 'Farhana Ahmed',
    date: '2026-07-29T18:15:00.000Z',
    totalAmount: 14500,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Pending',
  },
  {
    id: '1004',
    orderNumber: 'ORD-20260719-1004',
    customerName: 'Imtiaz Chowdhury',
    date: '2026-07-30T09:20:00.000Z',
    totalAmount: 41000,
    paymentStatus: 'Failed',
    fulfillmentStatus: 'Cancelled',
  },
];

const fetchOrders = async (params?: FetchOrdersParams): Promise<Order[]> => {
  try {
    const queryParams: Record<string, string | number> = {
      limit: 15,
      page: 1,
    };
    if (params?.status) queryParams.status = params.status.toLowerCase();
    if (params?.search) queryParams.email = params.search;

    const response = await apiClient.get<OrdersApiResponse>('/api/v1/orders', { params: queryParams });
    const orderList = response.data?.data || (Array.isArray(response.data) ? response.data : []);

    if (orderList.length > 0) {
      return orderList.map((o: any) => {
        let fulfillment: Order['fulfillmentStatus'] = 'Pending';
        if (o.status === 'processing') {
          fulfillment = 'Processing';
        } else if (o.status === 'shipped' || o.status === 'completed') {
          fulfillment = 'Shipped';
        } else if (o.status === 'cancelled') {
          fulfillment = 'Cancelled';
        }

        const isPaid = o.status === 'completed' || o.status === 'shipped';

        return {
          id: o._id || o.id,
          orderNumber: o.orderNumber || `ORD-${o._id?.slice(-8) || 'UNKNOWN'}`,
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

  let result = [...mockOrders];
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
