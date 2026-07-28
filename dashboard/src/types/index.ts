export interface UserProfile {
  id?: string | number;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  avatar?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

export interface ToastContextType {
  addToast: (options: ToastOptions) => void;
}

export interface Product {
  id?: string | number;
  _id?: string;
  name?: string;
  price?: number;
  sku?: string;
  category?: string;
  stock?: number;
  image?: string;
  status?: string;
  [key: string]: any;
}

export interface OrderItem {
  id?: string | number;
  productName?: string;
  quantity?: number;
  price?: number;
  total?: number;
  [key: string]: any;
}

export interface Order {
  id?: string | number;
  _id?: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
  paymentStatus?: string;
  [key: string]: any;
}

export interface Customer {
  id?: string | number;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
  [key: string]: any;
}
