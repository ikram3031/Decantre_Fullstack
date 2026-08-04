import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/core/api-client';

export interface BillingRecord {
  id: string;
  invoiceId: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
}

interface FetchBillingsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type RawBilling = Record<string, unknown>;

interface BillingsListResult {
  items: BillingRecord[];
  meta?: ListMeta;
}

const formatDate = (value: unknown) => {
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
};

const normalizeStatus = (status?: string): BillingRecord['status'] => {
  if (!status) return 'Pending';
  const normalized = status.toString().trim().toLowerCase();
  if (normalized === 'paid') return 'Paid';
  if (normalized === 'failed') return 'Failed';
  return 'Pending';
};

const mapBilling = (billing: RawBilling): BillingRecord => {
  const order = (billing.orderId as Record<string, unknown>) || {};
  const invoiceId =
    (billing.did as string) ||
    (order.orderNumber as string) ||
    (order.did as string) ||
    (billing.id as string) ||
    (billing._id as string) ||
    'Unknown';
  const customerName =
    ((order.customer as Record<string, unknown>)?.fullName as string) ||
    (billing.billingEmail as string) ||
    (billing.billingPhone as string) ||
    'Guest Customer';

  return {
    id: (billing.id as string) || (billing._id as string) || invoiceId,
    invoiceId,
    customerName,
    date: formatDate(billing.billingDate || billing.createdAt || billing.updatedAt),
    dueDate: formatDate(billing.dueDate || billing.billingDate || billing.createdAt),
    amount:
      typeof billing.amount === 'number'
        ? billing.amount
        : Number(billing.amount ?? billing.paidAmount ?? billing.totalAmount ?? 0),
    status: normalizeStatus(billing.status as string | undefined),
  };
};

const fetchBillings = async (params?: FetchBillingsParams): Promise<BillingsListResult> => {
  const queryParams: Record<string, unknown> = {
    limit: params?.limit ?? 15,
    page: params?.page ?? 1,
  };
  if (params?.status) {
    queryParams.status = params.status.toString().trim().toLowerCase();
  }
  if (params?.search) {
    queryParams.search = params.search;
  }

  const response = await apiClient.get('/api/v1/billing', { params: queryParams });
  const billingList: RawBilling[] = Array.isArray(response.data?.data)
    ? response.data.data
    : Array.isArray(response.data)
    ? response.data
    : [];

  const items = billingList.map((billing) => mapBilling(billing));
  const meta = response.data && typeof response.data === 'object' && 'meta' in response.data ? (response.data as { meta?: ListMeta }).meta : undefined;

  return { items, meta };
};

export function useBillings(params?: FetchBillingsParams) {
  return useQuery<BillingsListResult>({
    queryKey: ['billings', params],
    queryFn: () => fetchBillings(params),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
