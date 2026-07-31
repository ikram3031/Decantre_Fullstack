import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  customerName: string;
  method: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

interface FetchPaymentsParams {
  search?: string;
  status?: string;
  method?: string;
}

const mockPayments: PaymentRecord[] = [
  { id: 'PAY-001', invoiceId: 'INV-2026-001', customerName: 'Nadia Rahman', method: 'bKash', date: '2026-07-15', amount: 15400, status: 'Completed' },
  { id: 'PAY-002', invoiceId: 'INV-2026-003', customerName: 'Farhana Ahmed', method: 'Cash', date: '2026-07-29', amount: 8900, status: 'Completed' },
  { id: 'PAY-003', invoiceId: 'INV-2026-004', customerName: 'Imtiaz Chowdhury', method: 'Nagad', date: '2026-07-29', amount: 12500, status: 'Failed' },
  { id: 'PAY-004', invoiceId: 'INV-2026-002', customerName: 'Tanvir Hossain', method: 'Card', date: '2026-07-28', amount: 29050, status: 'Pending' },
  { id: 'PAY-005', invoiceId: 'INV-2026-005', customerName: 'Sadia Jahan', method: 'Cash', date: '2026-07-30', amount: 6200, status: 'Pending' },
];

const formatDate = (value: unknown) => {
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
};

const normalizeStatus = (status: string | undefined): PaymentRecord['status'] => {
  if (!status) return 'Pending';
  const normalized = status.toString().trim().toLowerCase();
  if (normalized === 'paid') return 'Completed';
  if (normalized === 'failed') return 'Failed';
  return 'Pending';
};

const mapPayment = (payment: any): PaymentRecord => {
  const order = payment.orderId || {};
  const invoiceId = order.orderNumber || order.did || order._id || payment.id || payment._id || 'Unknown';
  const customerName = order.customer?.fullName || order.customer?.fullName || 'Guest Customer';
  const method = payment.paymentMethod || 'Unknown';
  const amount = typeof payment.amount === 'number' ? payment.amount : Number(payment.paidAmount ?? payment.totalAmount ?? 0);

  return {
    id: payment.id || payment._id || 'unknown',
    invoiceId,
    customerName,
    method,
    date: formatDate(payment.createdAt || payment.updatedAt),
    amount,
    status: normalizeStatus(payment.status),
  };
};

const fetchPayments = async (params?: FetchPaymentsParams): Promise<PaymentRecord[]> => {
  try {
    const queryParams: Record<string, unknown> = {
      limit: 15,
      page: 1,
    };
    if (params?.status) queryParams.status = params.status.toLowerCase();
    if (params?.method) queryParams.paymentMethod = params.method;
    if (params?.search) queryParams.search = params.search;

    const response = await apiClient.get<{ data: unknown[] }>('/api/v1/payments', {
      params: queryParams,
    });
    const paymentList = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    if (paymentList.length > 0) {
      return paymentList.map((p) => mapPayment(p));
    }
  } catch (error) {
    console.warn('Payment API failed, using fallback mock payments:', error);
  }

  return mockPayments;
};

export function usePayments(params?: FetchPaymentsParams) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => fetchPayments(params),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
