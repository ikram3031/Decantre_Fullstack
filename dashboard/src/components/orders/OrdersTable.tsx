import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowUpDown,
  MoreVertical,
  Eye,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { Badge } from '../custom/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui/table';
import { Order } from '../../types';

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'sold-directly':
      return <Badge variant="success">Sold Directly</Badge>;
    case 'processing':
      return <Badge variant="info">Processing</Badge>;
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'on-hold':
      return <Badge variant="neutral">On Hold</Badge>;
    case 'cancelled':
      return <Badge variant="danger">Cancelled</Badge>;
    case 'refunded':
      return <Badge variant="neutral">Refunded</Badge>;
    case 'failed':
      return <Badge variant="danger">Failed</Badge>;
    default:
      return <Badge variant="neutral">{status || 'Unknown'}</Badge>;
  }
};

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onStatusUpdate: (id: string | number, status: string) => void;
  onDelete: (id: string | number) => void;
  onSort: (field: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  onStatusUpdate,
  onDelete,
  onSort,
}) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Retrieving orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <p className="text-sm font-bold text-slate-900">No orders found</p>
        <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead className="w-[120px]">Order</TableHead>
          <TableHead className="cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => onSort('date')}>
            <div className="flex items-center gap-1.5">
              Date
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
            </div>
          </TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => onSort('total')}>
            <div className="flex items-center justify-end gap-1.5">
              Total
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
            </div>
          </TableHead>
          <TableHead className="text-center w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const orderId = order._id || order.id || '';
          return (
            <TableRow
              key={orderId}
              className="cursor-pointer"
              onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: String(orderId) } })}
            >
              <TableCell className="font-mono text-xs font-bold text-slate-950">
                {order.orderNumber}
              </TableCell>
              <TableCell className="text-xs text-slate-500 font-mono">
                {(() => {
                  const rawDate = order.date || order.createdAt;
                  if (!rawDate) return '—';
                  const parsed = new Date(rawDate);
                  return isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                })()}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-bold text-slate-900 text-xs">
                    {order.customerName || order.customer?.fullName || order.customer?.name || 'Guest Customer'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {order.customerEmail || order.customer?.email || 'N/A'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="w-24">{getStatusBadge(order.status)}</div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md font-mono">
                  {(Array.isArray(order.items) ? order.items : []).reduce((sum: number, item: any) => sum + Number(item.quantity || 1), 0)} Items
                </span>
              </TableCell>
              <TableCell className="text-right font-mono text-xs font-bold text-slate-950">
                ৳{Number(order.totals?.total ?? order.total ?? 0).toFixed(2)}
              </TableCell>
              <TableCell className="text-center relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === orderId ? null : orderId)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition hover:text-slate-900 cursor-pointer"
                    title="Actions"
                  >
                    <MoreVertical className="h-4.5 w-4.5" />
                  </button>

                  {openMenuId === orderId && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-6 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate({ to: '/orders/$orderId', params: { orderId: String(orderId) } });
                          }}
                          className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer transition"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          View Details
                        </button>
                        
                        <div className="border-t border-slate-100 my-1"></div>
                        <span className="block px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Update Status
                        </span>
                        
                        {[
                          { status: 'completed', label: 'Mark Completed', color: 'bg-emerald-500' },
                          { status: 'sold-directly', label: 'Mark Sold Directly', color: 'bg-teal-500' },
                          { status: 'processing', label: 'Mark Processing', color: 'bg-blue-500' },
                          { status: 'pending', label: 'Mark Pending', color: 'bg-amber-500' },
                          { status: 'cancelled', label: 'Mark Cancelled', color: 'bg-rose-500' },
                        ].map(({ status, label, color }) => (
                          <button
                            key={status}
                            onClick={() => {
                              setOpenMenuId(null);
                              onStatusUpdate(orderId, status);
                            }}
                            className="flex items-center gap-2 w-full px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition"
                          >
                            <span className={`h-2 w-2 rounded-full ${color}`} />
                            {label}
                          </button>
                        ))}

                        <div className="border-t border-slate-100 my-1"></div>
                        
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            if (confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
                              onDelete(orderId);
                            }
                          }}
                          className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer transition"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                          Delete Order
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
