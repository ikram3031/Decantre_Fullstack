export interface Badge {
  name: string;
  text: string;
  color?: string;
  priority?: number;
}

export interface ProductVariation {
  id: string;
  name: string;
  size: string;
  price: number;
  originalPrice?: number | null;
  stockQuantity?: number;
  stockStatus?: string;
  sku?: string;
  raw?: any;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  type?: string;
  tagline: string;
  category: string;
  categories?: any[];
  brand: string;
  basePrice: number;
  price: number;
  originalPrice?: number | null;
  offerPrice?: number | null;
  stockQuantity?: number;
  sku?: string;
  description: string;
  season?: string;
  tags?: string[];
  notes?: string[] | Record<string, any>;
  scentFamily: string;
  longevity?: number;
  sillage?: number;
  image: string;
  images: string[];
  stockStatus: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  badges: Badge[];
  variations: ProductVariation[];
  raw?: any;
  isCombo?: boolean;
}

export interface Category {
  id?: string;
  _id?: string;
  did?: string;
  name: string;
  title?: string;
  slug?: string;
  [key: string]: any;
}

export interface Brand {
  id?: string;
  _id?: string;
  did?: string;
  name: string;
  title?: string;
  slug?: string;
  [key: string]: any;
}

export interface ComboItem {
  id?: string;
  name?: string;
  image?: string;
  price?: number;
  [key: string]: any;
}

export interface Combo {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  comboPrice: number;
  items?: ComboItem[];
  [key: string]: any;
}

export interface CartItem {
  id: string;
  product: Product;
  size: string;
  concentration: string;
  quantity: number;
  unitPrice: number;
  comboItems?: ComboItem[];
}

export interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  [key: string]: any;
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  address: string;
  city?: string;
  thana?: string;
  district: string;
  zip?: string;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  thana?: string;
  district: string;
  zip?: string;
  giftWrap?: boolean;
}

export interface PaymentDetails {
  bkashNumber?: string;
  bkashTxnId?: string;
  bkashAmount?: string;
  nagadNumber?: string;
  nagadTxnId?: string;
  nagadAmount?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankAmount?: string;
  [key: string]: any;
}

export interface Coupon {
  id?: string;
  _id?: string;
  code: string;
  active?: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  validFrom?: string;
  validTo?: string;
  [key: string]: any;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  size: string;
  concentration: string;
}

export interface OrderPayload {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  thana?: string;
  district: string;
  zip?: string;
  giftWrap?: boolean;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  tax?: number;
  discountTotalAmount: number;
  couponCode?: string;
  total: number;
  items: OrderItem[];
  paymentDetails?: PaymentDetails | null;
}

export interface Toast {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface CardSelection {
  size: string;
  concentration: string;
}

export interface CartPricing {
  cartSubtotal: number;
  discountAmount: number;
  shippingFee: number;
  cartTotal: number;
}

export interface FetchProductsOptions {
  skip?: number;
  offset?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  q?: string;
  search?: string;
  keyword?: string;
  category?: string;
  brand?: string;
  season?: string;
  tags?: string;
  filter?: string;
  name?: string;
  slug?: string;
  did?: string;
  minPrice?: number;
  maxPrice?: number;
}
