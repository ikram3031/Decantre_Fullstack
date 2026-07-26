import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  CalendarDays,
  ShoppingBag,
  ArrowUpDown,
  MoreVertical,
  Plus,
  X,
  CheckCircle,
  Download,
  User as UserIcon,
  CreditCard,
  PlusCircle,
  MinusCircle,
  Printer,
  Check,
  ShoppingBag as CartIcon
} from 'lucide-react';
import { Badge } from './ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/table';

export const OrdersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Queries
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient.get('/members');
      return res.data?.data || res.data || [];
    }
  });

  // Mutators
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/orders/${data.id}`, { status: data.status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/orders/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (newOrderData) => {
      const res = await apiClient.post('/orders/new-order', newOrderData);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSuccessOrder(data);
      setIsCreatingOrder(false);
      // Reset form
      setCartItems([]);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setSelectedCustomerId('');
      setOrderNotes('');
    }
  });

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const itemsPerPage = 10;

  // POS Checkout Flow States
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  
  const [cartItems, setCartItems] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [customerType, setCustomerType] = useState('guest');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isPaid, setIsPaid] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const getSelectedVariant = (product) => {
    if (!product.variants || product.variants.length === 0) return undefined;
    const selectedId = selectedVariants[product.id];
    return product.variants.find(v => v.id === selectedId) || product.variants[0];
  };

  // Cart operations
  const addToCart = (product, selectedVariant) => {
    const variantToUse = selectedVariant || getSelectedVariant(product);
    
    const existingIdx = cartItems.findIndex(
      (item) => item.product.id === product.id && 
                (!variantToUse || item.selectedVariant?.id === variantToUse.id)
    );

    const maxStock = variantToUse ? variantToUse.stockQuantity : product.stockQuantity;

    if (existingIdx !== -1) {
      const updated = [...cartItems];
      if (updated[existingIdx].quantity < maxStock) {
        updated[existingIdx].quantity += 1;
        setCartItems(updated);
      } else {
        alert(`Cannot add more than ${maxStock} items. Stock limit reached for this size.`);
      }
    } else {
      if (maxStock > 0) {
        setCartItems([...cartItems, { product, selectedVariant: variantToUse, quantity: 1 }]);
      } else {
        alert('This size/product is out of stock.');
      }
    }
  };

  const updateCartQty = (productId, variantId, delta) => {
    const updated = cartItems.map((item) => {
      const match = item.product.id === productId && (!variantId || item.selectedVariant?.id === variantId);
      if (match) {
        const maxStock = item.selectedVariant ? item.selectedVariant.stockQuantity : item.product.stockQuantity;
        const newQty = item.quantity + delta;
        if (newQty > maxStock) {
          alert(`Cannot select more than ${maxStock} items.`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter((item) => item.quantity > 0);
    setCartItems(updated);
  };

  const removeFromCart = (productId, variantId) => {
    setCartItems(cartItems.filter((item) => !(item.product.id === productId && (!variantId || item.selectedVariant?.id === variantId))));
  };

  const handleConfirmOrder = () => {
    if (cartItems.length === 0) {
      alert('Please add at least one product to the order.');
      return;
    }

    let customerId = 'guest';
    let customerName = guestName.trim();
    let customerEmail = guestEmail.trim();
    let phone = guestPhone.trim();

    if (customerType === 'existing') {
      const selectedCust = customers.find((c) => c.id === selectedCustomerId);
      if (!selectedCust) {
        alert('Please select a customer.');
        return;
      }
      customerId = selectedCust.id;
      customerName = selectedCust.name;
      customerEmail = selectedCust.email;
      phone = selectedCust.phone;
    } else {
      if (!customerName) {
        alert('Please enter guest customer name.');
        return;
      }
    }

    const items = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      size: item.selectedVariant?.size,
      quantity: item.quantity,
      price: item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice),
      image: item.product.images?.[0]
    }));

    const total = cartItems.reduce((sum, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice);
      return sum + (price * item.quantity);
    }, 0);

    const defaultAddress = {
      street: 'In-Store POS',
      city: 'Retail Store',
      state: 'Local',
      postcode: '00000',
      country: 'In-Store'
    };

    const newOrderData = {
      customerId,
      customerName,
      customerEmail: customerEmail || 'guest@example.com',
      status: 'sold-directly',
      items,
      total,
      paymentMethod: `${paymentMethod} (${isPaid ? 'Paid' : 'Pending'})`,
      shippingAddress: defaultAddress,
      billingAddress: defaultAddress,
      notes: orderNotes.trim() || 'Direct sale recorded via store dashboard'
    };

    createOrderMutation.mutate(newOrderData);
  };

  // Printable receipt flow
  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print invoices');
      return;
    }
    
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: sans-serif; color: #111; margin: 0; padding: 20px; font-size: 13px; }
          .receipt-header { text-align: center; margin-bottom: 20px; }
          .receipt-title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
          .receipt-subtitle { font-size: 11px; color: #666; }
          .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
          .meta-info table { width: 100%; font-size: 12px; }
          .meta-info td { padding: 2px 0; }
          .items-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .items-table th { text-align: left; border-bottom: 1px dashed #ccc; padding-bottom: 6px; }
          .items-table td { padding: 6px 0; }
          .items-table tr.total-row td { font-weight: bold; font-size: 13px; border-top: 1px dashed #ccc; padding-top: 8px; }
          .text-right { text-align: right; }
          .footer { text-align: center; font-size: 10px; color: #555; margin-top: 30px; }
          @media print {
            body { padding: 0; }
            @page { margin: 0.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <div class="receipt-title">RETAIL STORE</div>
          <div class="receipt-subtitle">Direct Store Sale Receipt</div>
          <div class="receipt-subtitle">100 Main Street, New York, NY</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="meta-info">
          <table>
            <tr>
              <td><strong>Receipt #:</strong> ${order.orderNumber}</td>
              <td class="text-right"><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Customer:</strong> ${order.customerName}</td>
              <td class="text-right"><strong>Payment:</strong> Paid</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Email:</strong> ${order.customerEmail || 'Guest'}</td>
            </tr>
          </table>
        </div>
        
        <div class="divider"></div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right" style="width: 50px;">Qty</th>
              <th class="text-right" style="width: 80px;">Price</th>
              <th class="text-right" style="width: 80px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item) => `
              <tr>
                <td>${item.name}${item.size ? ` (${item.size})` : ''}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">৳${Number(item.price || 0).toFixed(2)}</td>
                <td class="text-right">৳${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3" class="text-right">Total Amount:</td>
              <td colspan="2" class="text-right">৳${Number(order.total || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div class="footer">
          Thank you for shopping with us!<br>
          We hope to see you again soon.<br>
          Payment via ${order.paymentMethod}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  // High-fidelity downloadable HTML Invoice template
  const downloadInvoice = (order) => {
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); font-size: 14px; line-height: 24px; color: #555; }
          .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
          .invoice-box table td { padding: 5px; vertical-align: top; }
          .invoice-box table tr td:nth-child(2) { text-align: right; }
          .invoice-box table tr.top table td { padding-bottom: 20px; }
          .invoice-box table tr.top table td.title { font-size: 24px; line-height: 24px; color: #111; font-weight: bold; letter-spacing: -0.5px; }
          .invoice-box table tr.information table td { padding-bottom: 40px; }
          .invoice-box table tr.heading td { background: #f9fafb; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px; }
          .invoice-box table tr.details td { padding-bottom: 20px; }
          .invoice-box table tr.item td { border-bottom: 1px solid #eee; padding: 12px 10px; }
          .invoice-box table tr.item.last td { border-bottom: none; }
          .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #111; font-weight: bold; font-size: 16px; padding: 15px 10px; color: #111; }
          .badge { display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
          .badge-success { background: #d1fae5; color: #065f46; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table cellpadding="0" cellspacing="0">
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td class="title">
                      STORE DIRECT SALE INVOICE
                    </td>
                    <td>
                      <strong>Invoice #:</strong> ${order.orderNumber}<br>
                      <strong>Created:</strong> ${new Date(order.date).toLocaleDateString()}<br>
                      <strong>Payment Method:</strong> ${order.paymentMethod}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      <strong>Store Details:</strong><br>
                      Retail Store POS Terminal<br>
                      100 Main Street<br>
                      New York, NY 10001<br>
                      support@store.com
                    </td>
                    <td>
                      <strong>Customer Details:</strong><br>
                      ${order.customerName}<br>
                      ${order.customerEmail || 'Guest Customer'}<br>
                      ${order.notes || 'No notes provided'}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr class="heading">
              <td>Payment Status</td>
              <td>Status</td>
            </tr>
            
            <tr class="details">
              <td>
                <span class="badge badge-success">Paid</span>
              </td>
              <td>
                <span class="badge badge-success">Sold Directly</span>
              </td>
            </tr>
            
            <tr class="heading">
              <td>Item</td>
              <td style="text-align: right;">Price</td>
            </tr>
            
            ${order.items.map((item) => `
              <tr class="item">
                <td>
                  <strong>${item.name}${item.size ? ` (${item.size})` : ''}</strong><br>
                  <span style="font-size: 11px; color: #777;">Qty: ${item.quantity} @ ৳${Number(item.price || 0).toFixed(2)} each</span>
                </td>
                <td style="text-align: right;">
                  ৳${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                </td>
              </tr>
            `).join('')}
            
            <tr class="total">
              <td></td>
              <td>Total: ৳${Number(order.total || 0).toFixed(2)}</td>
            </tr>
          </table>
          
          <div class="footer">
            Thank you for your purchase! We appreciate your business.<br>
            For any questions or returns, please contact support@store.com.
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download it
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1. Apply Search and Filters
  const filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.date);
      const now = new Date();
      if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        matchesDate = orderDate >= thirtyDaysAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // 2. Sort Orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.total - b.total : b.total - a.total;
    }
  });

  // 3. Pagination calculation
  const totalItems = sortedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
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
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Filter products for the catalog search
  const filteredProductsCatalog = products.filter((p) => {
    return p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
           (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
  });

  // Render receipt screen
  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-500/10 border-b border-slate-100 p-8 text-center flex flex-col items-center">
            <div className="h-14 w-14 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Direct Sale Recorded</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">{successOrder.orderNumber}</p>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Customer</span>
                <span className="text-slate-800 font-bold block mt-0.5">{successOrder.customerName}</span>
                <span className="text-slate-500 block font-mono text-[10px] mt-0.5">{successOrder.customerEmail}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Payment</span>
                <span className="text-slate-800 font-bold block mt-0.5">{successOrder.paymentMethod}</span>
                <span className="text-emerald-600 block font-semibold text-[10px] mt-0.5">● Paid Directly</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px] mb-3">Items Purchased</span>
              <div className="divide-y divide-slate-50">
                {successOrder.items.map((item) => (
                  <div key={item.productId} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Qty: {item.quantity} @ ৳{Number(item.price || 0).toFixed(2)} each
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-950">
                      ৳{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-200/60 pt-5 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800">Total Amount Charged</span>
              <span className="text-lg font-mono font-black text-slate-950">৳{Number(successOrder.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 bg-slate-50 p-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => printInvoice(successOrder)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs"
            >
              <Printer className="h-4 w-4 text-slate-400" />
              Print Paper Receipt
            </button>
            <button
              onClick={() => downloadInvoice(successOrder)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs"
            >
              <Download className="h-4 w-4" />
              Download Invoice (HTML)
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => setSuccessOrder(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-950 cursor-pointer underline transition"
          >
            Back to Orders Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render "Create Order" POS View
  if (isCreatingOrder) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingOrder(false)}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-950 font-sans">Create In-Store Direct Sale</h1>
              <p className="text-xs text-slate-500 mt-0.5">Quickly register custom sold-directly sales counter transactions</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatingOrder(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-500 rounded-lg text-xs font-semibold cursor-pointer transition"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Product Selector & Customer Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Customer Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-slate-500" />
                Customer Registration
              </h2>

              <div className="flex gap-2.5 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setCustomerType('guest')}
                  className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${customerType === 'guest' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Guest / New Walk-In
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType('existing')}
                  className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${customerType === 'existing' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Select Existing Customer
                </button>
              </div>

              {customerType === 'guest' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 focus:border-slate-950 outline-none rounded-lg text-xs transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Email</label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 focus:border-slate-950 outline-none rounded-lg text-xs transition"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 focus:border-slate-950 outline-none rounded-lg text-xs transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Select Registered Customer</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-slate-950 outline-none rounded-lg text-xs transition cursor-pointer"
                    >
                      <option value="">-- Click to select customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email || 'No email'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Product Selector / Catalog */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-slate-500" />
                  Product Catalog Select
                </h2>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 pointer-events-none">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-950 rounded-lg text-xs outline-none transition w-full sm:w-48"
                  />
                </div>
              </div>

              {/* Product list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredProductsCatalog.map((product) => {
                  const selectedVariant = getSelectedVariant(product);
                  const price = selectedVariant ? selectedVariant.price : (product.salePrice ?? product.regularPrice);
                  const availableStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
                  
                  const qtyInCart = cartItems.find((item) => 
                    item.product.id === product.id && 
                    (!selectedVariant || item.selectedVariant?.id === selectedVariant.id)
                  )?.quantity || 0;
                  const remainingStock = availableStock - qtyInCart;
                  
                  return (
                    <div
                      key={product.id}
                      className={`border rounded-xl p-3 flex flex-col justify-between gap-3.5 transition hover:border-slate-400 hover:shadow-xs relative bg-white ${availableStock <= 0 ? 'opacity-65 border-dashed border-slate-200' : 'border-slate-100'}`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=150&q=80'}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div>
                            <p className="font-bold text-slate-900 text-xs truncate leading-tight" title={product.name}>
                              {product.name}
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {selectedVariant ? selectedVariant.sku : (product.sku || 'No SKU')}
                            </p>
                          </div>
                          <div className="flex items-baseline justify-between gap-1 mt-1">
                            <span className="text-xs font-black text-slate-950">
                              ৳{Number(price || 0).toFixed(2)}
                            </span>
                            
                            {availableStock <= 0 ? (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md font-mono">
                                Out of Stock
                              </span>
                            ) : remainingStock <= 0 ? (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md font-mono">
                                In Cart Limit
                              </span>
                            ) : (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono ${remainingStock <= 5 ? 'text-amber-700 bg-amber-50 border border-amber-100' : 'text-slate-600 bg-slate-50 border border-slate-200/50'}`}>
                                {remainingStock} Avail
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Decant Size Selector */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="border-t border-slate-50 pt-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Decant Size</p>
                          <div className="flex flex-wrap gap-1">
                            {product.variants.map((variant) => {
                              const isSelected = selectedVariants[product.id] === variant.id || (!selectedVariants[product.id] && product.variants[0].id === variant.id);
                              return (
                                <button
                                  key={variant.id}
                                  type="button"
                                  onClick={() => setSelectedVariants({ ...selectedVariants, [product.id]: variant.id })}
                                  className={`px-2 py-1 text-[9px] font-bold rounded-md border transition cursor-pointer select-none ${isSelected ? 'bg-slate-950 border-slate-950 text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                                >
                                  {variant.size} - ৳{variant.price}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => addToCart(product, selectedVariant)}
                        disabled={availableStock <= 0 || remainingStock <= 0}
                        className="w-full mt-2 py-1 px-3 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg text-[10px] font-bold cursor-pointer transition select-none flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add to Order Box
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Order items checkout summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CartIcon className="h-4.5 w-4.5 text-slate-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Checkout Order Box</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Units
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5 px-4">
                  <ShoppingBag className="h-8 w-8 text-slate-200 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-500">Order Box is empty</p>
                  <p className="text-[10px] text-slate-400 max-w-xs">Select products from the catalog on the left to add items to this store transaction.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Item rows */}
                  <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto pr-1">
                    {cartItems.map((item, idx) => {
                      const itemPrice = item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice);
                      const maxStock = item.selectedVariant ? item.selectedVariant.stockQuantity : item.product.stockQuantity;
                      return (
                        <div key={idx} className="py-3 flex justify-between items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {item.selectedVariant ? `Size: ${item.selectedVariant.size}` : 'Standard'} · ৳{Number(itemPrice || 0).toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product.id, item.selectedVariant?.id, -1)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-mono font-bold w-5 text-center text-slate-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product.id, item.selectedVariant?.id, 1)}
                              disabled={item.quantity >= maxStock}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition ml-1.5 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment settings */}
                  <div className="border-t border-slate-100 pt-4 space-y-3.5">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-950 cursor-pointer"
                        >
                          <option value="Cash">Cash Counter</option>
                          <option value="bKash">bKash Personal</option>
                          <option value="Nagad">Nagad Merchant</option>
                          <option value="Card">Visa / Mastercard</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                        <select
                          value={isPaid ? 'paid' : 'pending'}
                          onChange={(e) => setIsPaid(e.target.value === 'paid')}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-950 cursor-pointer"
                        >
                          <option value="paid">Paid & Settled</option>
                          <option value="pending">Pending Payment</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Transaction Memo (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. bKash trx ID or counter notes"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-950"
                      />
                    </div>
                  </div>

                  {/* Summary calculations */}
                  <div className="border-t border-slate-100 pt-4 space-y-1.5 font-sans">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Items Subtotal</span>
                      <span className="font-mono font-medium">
                        ৳{cartItems.reduce((sum, item) => {
                          const price = item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice);
                          return sum + (price * item.quantity);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Store Tax & Decant Handling</span>
                      <span className="font-mono text-emerald-600 font-bold">Free (Counter)</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-slate-100">
                      <span className="text-sm font-bold text-slate-900">Total Net Bill</span>
                      <span className="text-lg font-mono font-black text-slate-950">
                        ৳{cartItems.reduce((sum, item) => {
                          const price = item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice);
                          return sum + (price * item.quantity);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={createOrderMutation.isPending}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {createOrderMutation.isPending && (
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    <CreditCard className="h-4 w-4" />
                    Confirm & Settle Direct Sale
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight font-sans">Orders Registry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and process online customer orders or record direct store counter sales.
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreatingOrder(true);
            setSuccessOrder(null);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition self-start sm:self-auto select-none"
        >
          <Plus className="h-4.5 w-4.5" />
          Direct Counter Sale (POS)
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-sm outline-none transition"
            />
          </div>

          {/* Status filter */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Filter className="h-4 w-4" />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="sold-directly">Sold Directly</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Date filter */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <CalendarDays className="h-4 w-4" />
              </span>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
              >
                <option value="all">All Dates</option>
                <option value="7days">Past 7 days</option>
                <option value="30days">Past 30 days</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-semibold">Retrieving orders...</span>
          </div>
        ) : paginatedOrders.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[120px]">Order</TableHead>
                <TableHead className="cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1.5">
                    Date
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => handleSort('total')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Total
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="text-center w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow
                  key={order._id || order.id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: order._id || order.id } })}
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
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md font-mono">
                      {(Array.isArray(order.items) ? order.items : []).reduce((sum, item) => sum + Number(item.quantity || 1), 0)} Items
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-slate-950">
                    ৳{Number(order.totals?.total ?? order.total ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center relative" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition hover:text-slate-900 cursor-pointer"
                        title="Actions"
                      >
                        <MoreVertical className="h-4.5 w-4.5" />
                      </button>

                        {openMenuId === order.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-6 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate({ to: '/orders/$orderId', params: { orderId: order.id } });
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
                              
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  updateOrderStatusMutation.mutate({ id: order.id, status: 'completed' });
                                }}
                                className="flex items-center gap-2 w-full px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Mark Completed
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  updateOrderStatusMutation.mutate({ id: order.id, status: 'sold-directly' });
                                }}
                                className="flex items-center gap-2 w-full px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition"
                              >
                                <span className="h-2 w-2 rounded-full bg-teal-500" />
                                Mark Sold Directly
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  updateOrderStatusMutation.mutate({ id: order.id, status: 'processing' });
                                }}
                                className="flex items-center gap-2 w-full px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                Mark Processing
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  updateOrderStatusMutation.mutate({ id: order.id, status: 'pending' });
                                }}
                                className="flex items-center gap-2 w-full px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition"
                              >
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                Mark Pending
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  updateOrderStatusMutation.mutate({ id: order.id, status: 'cancelled' });
                                }}
                                className="flex items-center gap-2 w-full px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition"
                              >
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                Mark Cancelled
                              </button>

                              <div className="border-t border-slate-100 my-1"></div>
                              
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  if (confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
                                    deleteOrderMutation.mutate(order.id);
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
                ))}
              </TableBody>
            </Table>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-slate-900">No orders found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Pagination controls */}
        {totalItems > 0 && (
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{totalItems}</span> orders
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
