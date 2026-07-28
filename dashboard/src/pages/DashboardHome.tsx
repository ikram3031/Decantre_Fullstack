import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import { Link } from '@tanstack/react-router';
import {
  DollarSign,
  ShoppingBag,
  Boxes,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '../components/custom/Badge';
import { Customer, Order, Product } from '../types';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data?.data || res.data || [];
    },
    enabled: !!user
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient.get('/members');
      return res.data?.data || res.data || [];
    },
    enabled: !!user
  });

  // Calculate high-level stats
  const totalRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'processing')
    .reduce((sum, o) => sum + Number(o.totals?.total ?? o.total ?? 0), 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const processingOrdersCount = orders.filter((o) => o.status === 'processing').length;

  const stats = [
    {
      name: 'Total Revenue',
      value: `৳${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      description: 'From completed & processing orders'
    },
    {
      name: 'Total Sales',
      value: orders.length.toString(),
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      description: `${pendingOrdersCount} pending, ${processingOrdersCount} processing`
    },
    {
      name: 'Active Products',
      value: products.length.toString(),
      icon: Boxes,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      description: `${products.filter((p: any) => p.stockQuantity === 'outofstock' || p.stock === 0).length} out of stock`
    },
    {
      name: 'Total Members',
      value: customers.length.toString(),
      icon: Users,
      color: 'bg-sky-50 text-sky-700 border-sky-100',
      description: 'Registered shop accounts'
    }
  ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="info">Processing</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Store Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your e-commerce performance and manage items in real-time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.name}</p>
                  <p className="text-3xl font-extrabold text-slate-950 mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 font-medium flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 shrink-0 text-emerald-600" />
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 tracking-tight">Recent Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Quick view of the latest transactions.</p>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
            >
              All orders
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((order) => {
                  const orderId = order._id || order.id || '';
                  return (
                    <tr key={orderId} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4.5">
                        <Link
                          to="/orders/$orderId"
                          params={{ orderId: String(orderId) }}
                          className="font-mono text-xs font-bold text-slate-900 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4.5">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {order.customerName || order.customer?.fullName || order.customer?.name || 'Guest Customer'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {order.customerEmail || order.customer?.email || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="w-24">{getStatusBadge(order.status)}</div>
                      </td>
                      <td className="px-6 py-4.5 text-right text-xs font-bold text-slate-900 font-mono">
                        ৳{Number(order.totals?.total ?? order.total ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Short Low Stock Warning Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-950 tracking-tight">Stock Alerts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Products that need restocked soon.</p>
          </div>
          <div className="p-6 flex-1 space-y-4 overflow-y-auto">
            {products
              .filter((p: any) => Number(p.stockQuantity ?? p.stock ?? 0) <= Number(p.lowStockThreshold ?? 5))
              .map((prod: any) => (
                <div key={prod.id || prod._id} className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <img
                    src={prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=150&q=80'}
                    alt={prod.name}
                    className="h-11 w-11 rounded-lg object-cover border border-slate-200 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {prod.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-md ${
                      prod.stockQuantity === 0 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {prod.stockQuantity ?? prod.stock ?? 0} Left
                    </span>
                  </div>
                </div>
              ))}
            {products.filter((p: any) => Number(p.stockQuantity ?? p.stock ?? 0) <= Number(p.lowStockThreshold ?? 5)).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">All stocks optimal</p>
                <p className="text-[10px] text-slate-400 mt-1">No low stock alerts at this moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
