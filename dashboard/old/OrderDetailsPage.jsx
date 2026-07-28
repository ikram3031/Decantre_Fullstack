import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../src/context/AuthContext';
import { apiClient } from '../src/api/apiClient';
import {
  ChevronLeft,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Edit2,
  Check,
  X,
  FileText,
  Clock,
  History,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const OrderDetailsPage = () => {
  const { user } = useAuth();
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch Order
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/${orderId}`);
      return res.data;
    },
    enabled: !!user
  });

  // Mutation to update order
  const updateOrderMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await apiClient.put(`/orders/${orderId}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsEditing(false);
    }
  });

  // Edit Mode form states
  const [editStatus, setEditStatus] = useState('pending');
  const [editNotes, setEditNotes] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', postcode: '', country: ''
  });

  // Populate edit state when entering Edit Mode
  const enterEditMode = () => {
    if (order) {
      setEditStatus(order.status);
      setEditNotes(order.notes || '');
      setEditItems(Array.isArray(order.items) ? [...order.items] : []);
      setShippingAddress({
        street: order.shippingAddress?.street || '',
        city: order.shippingAddress?.city || '',
        state: order.shippingAddress?.state || '',
        postcode: order.shippingAddress?.postcode || '',
        country: order.shippingAddress?.country || ''
      });
      setEditComment('');
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Order not found</h2>
        <p className="text-sm text-slate-500">The order with ID "{orderId}" could not be retrieved.</p>
        <Link to="/orders" className="text-xs font-semibold text-slate-900 underline">
          Back to orders
        </Link>
      </div>
    );
  }

  // Handle quantity adjust in Edit Mode
  const handleQtyChange = (idx, delta) => {
    const updated = [...editItems];
    const newQty = updated[idx].quantity + delta;
    if (newQty > 0) {
      updated[idx].quantity = newQty;
      setEditItems(updated);
    }
  };

  // Remove item from order in Edit Mode
  const handleRemoveItem = (idx) => {
    const updated = editItems.filter((_, i) => i !== idx);
    setEditItems(updated);
  };

  // Save changes
  const handleSave = () => {
    if (editItems.length === 0) {
      alert('Order must contain at least 1 item.');
      return;
    }

    // Calculate new total
    const newTotal = editItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    updateOrderMutation.mutate({
      status: editStatus,
      notes: editNotes,
      items: editItems,
      shippingAddress,
      total: newTotal,
      comment: editComment.trim() || undefined
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
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
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to orders
        </Link>

        {!isEditing ? (
          <button
            onClick={enterEditMode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Order
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateOrderMutation.isPending}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition disabled:opacity-70"
            >
              {updateOrderMutation.isPending ? (
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Order Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block font-mono">
                Order ID: {order.id}
              </span>
              <h1 className="text-2xl font-bold text-slate-950 tracking-tight mt-1">
                Order {order.orderNumber}
              </h1>
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {new Date(order.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Status change block */}
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              {!isEditing ? (
                <div className="mt-1 w-24">{getStatusBadge(order.status)}</div>
              ) : (
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="mt-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 outline-none focus:border-slate-950 cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              )}
            </div>
          </div>

          {/* Items Summary list */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-slate-500" />
                Order Summary
              </h2>
              <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200/60 px-2.5 py-1 rounded-full font-mono shadow-xs">
                {isEditing ? editItems.length : (Array.isArray(order.items) ? order.items.length : 0)} unique products
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {(Array.isArray(!isEditing ? order.items : editItems) ? (!isEditing ? order.items : editItems) : []).map((item, idx) => (
                <div key={idx} className="p-6 flex gap-4 items-start hover:bg-slate-50/30 transition">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=300&q=80'}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-slate-950">{item.name}</p>
                      {item.size && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-sm font-bold text-[9px] font-mono leading-none">
                          {item.size}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Product ID: {item.productId}</p>
                    
                    {/* Item Price and Subtotal Breakdown */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                      <span>৳{Number(item.price || 0).toFixed(2)} each</span>
                      <span>•</span>
                      <span className="font-bold text-slate-800 font-mono">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Actions if Editing */}
                  {isEditing ? (
                    <div className="flex items-center gap-2.5 self-center">
                      <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQtyChange(idx, -1)}
                          className="p-1 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-extrabold font-mono text-slate-900 bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(idx, 1)}
                          className="p-1 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-right self-center font-mono text-xs font-bold text-slate-950">
                      ৳{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Block */}
            <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-800">
                  ৳{Number(!isEditing ? (order.total || 0) : editItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Shipping & Handling</span>
                <span className="font-mono font-bold text-slate-800">Free</span>
              </div>
              <div className="h-px bg-slate-200/60 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-950">Total Order Amount</span>
                <span className="text-lg font-black text-slate-950 font-mono">
                  ৳{Number(!isEditing ? (order.total || 0) : editItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-slate-500" />
              Customer Notes / Delivery Remarks
            </h2>
            {!isEditing ? (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl leading-relaxed italic">
                {order.notes || 'No notes were left by the customer.'}
              </p>
            ) : (
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                placeholder="E.g. Please knock on arrival..."
                className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-950 rounded-xl p-3.5 text-xs outline-none transition resize-none leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Right Column: Customer Info & Timeline */}
        <div className="space-y-6">
          
          {/* Customer Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="h-4.5 w-4.5 text-slate-500" />
              Customer Information
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                  <User className="h-4.5 w-4.5 text-slate-600" />
                </div>
                <div>
                <p className="text-xs font-bold text-slate-950">{order.customerName || 'Guest Customer'}</p>
                  <p className="text-slate-400 font-semibold font-mono mt-0.5">{order.customerId || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{order.customerEmail || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{order.customerPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Address Blocks */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Shipping Destination
                </span>
                {!isEditing ? (
                  <p className="text-xs text-slate-600 leading-relaxed font-medium flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {order.shippingAddress?.street || 'N/A'}, {order.shippingAddress?.city || 'N/A'}, <br />
                      {order.shippingAddress?.state || 'N/A'} {order.shippingAddress?.postcode || 'N/A'}, {order.shippingAddress?.country || 'N/A'}
                    </span>
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-950 rounded-lg px-2.5 py-1.5 text-xs outline-none transition"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-950"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-950"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Postcode"
                        value={shippingAddress.postcode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-950"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-950"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Method
                </span>
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-1.5">
                  <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{order.paymentMethod}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Activity / Fulfillment History Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2 pb-3 border-b border-slate-100">
              <History className="h-4.5 w-4.5 text-slate-500" />
              Order Timeline
            </h2>

            {/* If Editing, show addition comment input */}
            {isEditing && (
              <div className="space-y-2 bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fulfillment Update Notes
                </span>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Optional: Add tracking code, billing corrections, packing comments..."
                  rows={2}
                  className="w-full bg-white border border-slate-200 focus:border-slate-950 rounded-lg p-2.5 text-xs outline-none transition resize-none"
                />
              </div>
            )}

            <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-slate-100">
              {order.history?.map((h, idx) => (
                <div key={h.id || idx} className="flex gap-4 items-start relative">
                  <div className="w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shrink-0 z-10">
                    <Clock className="h-3 w-3 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0 bg-slate-50/20 hover:bg-slate-50/50 border border-slate-100/50 p-3 rounded-xl">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                        {h.status}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">
                        {new Date(h.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{h.comment}</p>
                    <span className="text-[9px] font-semibold text-slate-400 block mt-1.5 font-mono">
                      By: {h.updatedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
