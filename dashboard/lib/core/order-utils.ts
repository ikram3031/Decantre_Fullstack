export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku: string;
  size: string;
}

export interface CompletedInvoiceItem {
  description: string;
  price: string;
  quantity: number;
  total: string;
}

export interface OrderRecord {
  id?: string;
  _id?: string;
  orderNumber: string;
  [key: string]: unknown;
}

export interface NewOrderApiResponse {
  data: OrderRecord;
}

export interface CompletedOrder {
  order: OrderRecord;
  orderNumber: string;
  invoiceUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  paymentMethod: string;
  paymentPhone: string;
  items: CompletedInvoiceItem[];
}

export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: string[];
    };
  };
}