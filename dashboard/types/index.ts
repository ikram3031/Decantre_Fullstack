import type { MouseEventHandler, ReactNode } from "react";

// Common UI & Navigation Types
export interface HrefType {
  children: ReactNode;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

// Product Types
export interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  offerPrice?: number | null;
  stockQuantity: number;
  sku?: string;
  sortOrder?: number;
}

export interface VariantRow {
  size: string;
  price: string;
  offerPrice: string;
  stockQuantity: string;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand?: string;
  price: number;
  offerPrice?: number | null;
  stock?: number;
  status: 'In Stock' | 'Out of Stock';
  image?: string;
  type?: 'simple' | 'variant';
  variants?: ProductVariant[];
}

// Order Types
export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  size?: string;
  concentration?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  fulfillmentStatus: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled';
}

export type OrderDetails = Order & {
  _id?: string;
  createdAt?: string;
  shippingTotalAmount?: number;
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    thana?: string;
    district?: string;
    zip?: string;
  };
  shippingAddress?: {
    address?: string;
    line1?: string;
    city?: string;
  };
  totals?: {
    subtotal?: number;
    tax?: number;
    shippingFee?: number;
    total?: number;
  };
  discountTotalAmount?: number;
  paymentMethod?: string;
  status?: string;
  items?: OrderItem[];
};

// Member & User Types
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  lifetimeSpent: number;
  joinedDate: string;
  avatar?: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Editor';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
}

export interface CouponRestrictionItem {
  id: string;
  name: string;
  did: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  usageLimit?: number | null;
  usedCount?: number;
  applicableProducts?: CouponRestrictionItem[];
  applicableCategories?: CouponRestrictionItem[];
  applicableBrands?: CouponRestrictionItem[];
  createdAt?: string;
  updatedAt?: string;
}
