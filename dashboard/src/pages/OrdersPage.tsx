import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { Plus } from 'lucide-react';
import { Pagination } from '../components/custom/Pagination';

// Extracted components
import { printInvoice, downloadInvoice, InvoiceOrder } from '../lib/invoiceUtils';
import { OrderSuccessReceipt } from '../components/orders/OrderSuccessReceipt';
import { POSCheckoutView, CartItem } from '../components/orders/POSCheckoutView';
import { OrdersTable } from '../components/orders/OrdersTable';
import { OrdersFilters } from '../components/orders/OrdersFilters';
import { Customer, Order, Product } from '../types';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // POS Checkout Flow States
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string | number, string | number>>({});
  const [customerType, setCustomerType] = useState<'guest' | 'existing'>('guest');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isPaid, setIsPaid] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Queries
  const { data: ordersData = { items: [], total: 0 }, isLoading } = useQuery<{ items: Order[]; total: number }>({
    queryKey: ['orders', currentPage, itemsPerPage],
    queryFn: async () => {
      const res = await apiClient.get('/orders', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage
        }
      });
      const rawData = res.data;
      let items: Order[] = [];
      let total = 0;

      if (Array.isArray(rawData)) {
        items = rawData;
        total = rawData.length;
      } else if (rawData && typeof rawData === 'object') {
        items = Array.isArray(rawData.data) ? rawData.data : (Array.isArray(rawData.items) ? rawData.items : []);
        total = rawData.meta?.total ?? rawData.total ?? rawData.count ?? items.length;
      }

      return { items, total };
    },
    enabled: !!user
  });
  const orders = ordersData.items;

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

  // Mutators
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (data: { id: string | number; status: string }) => {
      const res = await apiClient.put(`/orders/${data.id}`, { status: data.status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await apiClient.delete(`/orders/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (newOrderData: any) => {
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

  // Cart operations
  const getSelectedVariant = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return undefined;
    const prodId = product.id || product._id || '';
    const selectedId = selectedVariants[prodId];
    return product.variants.find((v: any) => v.id === selectedId) || product.variants[0];
  };

  const addToCart = (product: Product, selectedVariant?: any) => {
    const variantToUse = selectedVariant || getSelectedVariant(product);
    const prodId = product.id || product._id;
    
    const existingIdx = cartItems.findIndex(
      (item) => (item.product.id || item.product._id) === prodId && 
                (!variantToUse || item.selectedVariant?.id === variantToUse.id)
    );

    const maxStock = variantToUse ? (variantToUse.stockQuantity ?? variantToUse.stock ?? 0) : (product.stockQuantity ?? product.stock ?? 0);

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

  const updateCartQty = (productId: string | number, variantId: string | number | undefined, delta: number) => {
    const updated = cartItems.map((item) => {
      const match = (item.product.id || item.product._id) === productId && (!variantId || item.selectedVariant?.id === variantId);
      if (match) {
        const maxStock = item.selectedVariant ? (item.selectedVariant.stockQuantity ?? item.selectedVariant.stock ?? 0) : (item.product.stockQuantity ?? item.product.stock ?? 0);
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

  const removeFromCart = (productId: string | number, variantId?: string | number) => {
    setCartItems(cartItems.filter((item) => !((item.product.id || item.product._id) === productId && (!variantId || item.selectedVariant?.id === variantId))));
  };

  const handleConfirmOrder = () => {
    if (cartItems.length === 0) {
      alert('Please add at least one product to the order.');
      return;
    }

    let customerId: string | number = 'guest';
    let customerName = guestName.trim();
    let customerEmail = guestEmail.trim();
    let phone = guestPhone.trim();

    if (customerType === 'existing') {
      const selectedCust = customers.find((c: any) => (c.id || c._id) === selectedCustomerId);
      if (!selectedCust) {
        alert('Please select a customer.');
        return;
      }
      customerId = selectedCust.id || selectedCust._id || '';
      customerName = selectedCust.name || '';
      customerEmail = selectedCust.email || '';
      phone = selectedCust.phone || '';
    } else {
      if (!customerName) {
        alert('Please enter guest customer name.');
        return;
      }
    }

    const items = cartItems.map((item) => ({
      productId: item.product.id || item.product._id,
      name: item.product.name,
      size: item.selectedVariant?.size,
      quantity: item.quantity,
      price: item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice ?? item.product.price ?? 0),
      image: item.product.images?.[0] || item.product.image
    }));

    const total = cartItems.reduce((sum, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : (item.product.salePrice ?? item.product.regularPrice ?? item.product.price ?? 0);
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

  // Filtering, sorting, pagination
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail || order.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.date || order.createdAt);
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

  const sortedOrders = [...filteredOrders].sort((a: any, b: any) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const totalA = Number(a.totals?.total ?? a.total ?? 0);
      const totalB = Number(b.totals?.total ?? b.total ?? 0);
      return sortOrder === 'asc' ? totalA - totalB : totalB - totalA;
    }
  });

  const isFiltered = searchTerm.trim() !== '' || statusFilter !== 'all' || dateFilter !== 'all';
  const totalItems = isFiltered ? sortedOrders.length : (ordersData.total || sortedOrders.length);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = isFiltered ? sortedOrders.slice(startIndex, startIndex + itemsPerPage) : sortedOrders;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Conditional renders
  if (successOrder) {
    return (
      <OrderSuccessReceipt
        successOrder={successOrder}
        onBack={() => setSuccessOrder(null)}
        onPrint={printInvoice}
        onDownload={downloadInvoice}
      />
    );
  }

  if (isCreatingOrder) {
    return (
      <POSCheckoutView
        onClose={() => setIsCreatingOrder(false)}
        customerType={customerType}
        setCustomerType={setCustomerType}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
        guestName={guestName}
        setGuestName={setGuestName}
        guestEmail={guestEmail}
        setGuestEmail={setGuestEmail}
        guestPhone={guestPhone}
        setGuestPhone={setGuestPhone}
        products={products}
        productSearch={productSearch}
        setProductSearch={setProductSearch}
        selectedVariants={selectedVariants}
        setSelectedVariants={setSelectedVariants}
        getSelectedVariant={getSelectedVariant}
        cartItems={cartItems}
        addToCart={addToCart}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isPaid={isPaid}
        setIsPaid={setIsPaid}
        orderNotes={orderNotes}
        setOrderNotes={setOrderNotes}
        handleConfirmOrder={handleConfirmOrder}
        isSubmitting={createOrderMutation.isPending}
      />
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
      <OrdersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        setCurrentPage={setCurrentPage}
      />

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <OrdersTable
          orders={paginatedOrders}
          isLoading={isLoading}
          onStatusUpdate={(id, status) => updateOrderStatusMutation.mutate({ id, status })}
          onDelete={(id) => deleteOrderMutation.mutate(id)}
          onSort={handleSort}
        />

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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
