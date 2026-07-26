import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import {
  Search,
  Users,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Badge } from './ui/Badge';

export const CustomersPage = () => {
  const queryClient = useQueryClient();
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient.get('/members');
      return res.data?.data || res.data || [];
    }
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (newUser) => {
      const res = await apiClient.post('/members', newUser);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDrawerOpen(false);
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/members/${data.id}`, data.updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsDrawerOpen(false);
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/members/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Drawer / Editing State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Edit fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formShipping, setFormShipping] = useState({ street: '', city: '', state: '', postcode: '', country: '' });
  const [formBilling, setFormBilling] = useState({ street: '', city: '', state: '', postcode: '', country: '' });

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setIsAddMode(true);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormShipping({ street: '', city: '', state: '', postcode: '', country: '' });
    setFormBilling({ street: '', city: '', state: '', postcode: '', country: '' });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsAddMode(false);
    setFormName(customer.name || '');
    setFormEmail(customer.email || '');
    setFormPhone(customer.phone || '');
    setFormPassword('');
    const ship = customer.shippingInfo || {};
    setFormShipping({
      street: ship.address1 || '',
      city: ship.city || '',
      state: ship.state || '',
      postcode: ship.postcode || '',
      country: ship.country || ''
    });
    const bill = customer.billingInfo || {};
    setFormBilling({
      street: bill.address1 || '',
      city: bill.city || '',
      state: bill.state || '',
      postcode: bill.postcode || '',
      country: bill.country || ''
    });
    setIsDrawerOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formName || !formEmail) {
      alert('Name and Email are required.');
      return;
    }

    if (isAddMode && !formPassword) {
      alert('Password is required for new customers.');
      return;
    }

    const parts = formName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const shippingInfo = {
      firstName,
      lastName,
      company: '',
      address1: formShipping.street,
      address2: '',
      district: formShipping.city,
      city: formShipping.city,
      state: formShipping.state,
      postcode: formShipping.postcode,
      country: formShipping.country,
      email: formEmail,
      phone: formPhone
    };

    const billingInfo = {
      firstName,
      lastName,
      company: '',
      address1: formBilling.street,
      address2: '',
      district: formBilling.city,
      city: formBilling.city,
      state: formBilling.state,
      postcode: formBilling.postcode,
      country: formBilling.country,
      email: formEmail,
      phone: formPhone
    };

    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      shippingInfo,
      billingInfo
    };

    if (formPassword) {
      payload.password = formPassword;
    }

    if (isAddMode) {
      addCustomerMutation.mutate(payload);
    } else if (selectedCustomer) {
      updateCustomerMutation.mutate({
        id: selectedCustomer.id,
        updates: payload
      });
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter((c) => {
    return (
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const valueA = (a[sortBy] ?? '').toString().toLowerCase();
    const valueB = (b[sortBy] ?? '').toString().toLowerCase();
    if (sortBy === 'totalSpent' || sortBy === 'orders') {
      const aValue = sortBy === 'orders' ? (a.orders?.length || 0) : (a.orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0);
      const bValue = sortBy === 'orders' ? (b.orders?.length || 0) : (b.orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0);
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight font-sans">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze customer lifetime value, update contact details, and manage billing profiles.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-600 font-semibold font-mono shadow-xs">
            Registered: {customers.length} accounts
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-sm outline-none transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full max-w-[180px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-950"
            >
              <option value="name">Name</option>
              <option value="orders">Order Count</option>
              <option value="totalSpent">Total Spent</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-slate-950 text-white rounded-xl text-xs font-semibold"
            >
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-semibold">Loading customer records...</span>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4 text-right">Total Spent</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedCustomers.map((c) => {
                  const totalOrders = c.orders?.length || 0;
                  const totalSpent = c.orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                            alt={c.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-950 text-xs truncate">{c.name}</p>
                            <p className="text-slate-400 text-[10px] font-mono mt-0.5 truncate">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-mono text-xs text-slate-600">
                        {c.phone}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md font-mono">
                          {totalOrders}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right font-mono text-xs font-bold text-emerald-700">
                        ৳{Number(totalSpent || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-950 rounded-lg transition inline-flex items-center gap-1.5 font-bold text-xs"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this customer?')) {
                                deleteCustomerMutation.mutate(c.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"
                            title="Delete Customer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-slate-900">No customers found</p>
            <p className="text-xs text-slate-400">Try adjusting your lookup details.</p>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Edit Customer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-950 font-sans text-sm flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-slate-600" />
                  {isAddMode ? 'Add New Customer' : 'Edit Customer Profile'}
                </h3>
                {!isAddMode && selectedCustomer && (
                  <span className="text-[10px] text-slate-400 font-mono font-bold mt-1 block">
                    Customer ID: {selectedCustomer.id}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-500 hover:bg-slate-200/60 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Scroll Container */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Contact section */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-100">
                  Primary Contact Info
                </span>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none transition font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none transition font-mono font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none transition font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Password {!isAddMode && <span className="text-[10px] text-slate-400 font-normal">(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    placeholder={!isAddMode ? "••••••••" : "E.g. securePassword123"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-100">
                  Shipping Destination
                </span>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Street Address</label>
                  <input
                    type="text"
                    value={formShipping.street}
                    onChange={(e) => setFormShipping({ ...formShipping, street: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">City</label>
                    <input
                      type="text"
                      value={formShipping.city}
                      onChange={(e) => setFormShipping({ ...formShipping, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">State / Province</label>
                    <input
                      type="text"
                      value={formShipping.state}
                      onChange={(e) => setFormShipping({ ...formShipping, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Postal Code</label>
                    <input
                      type="text"
                      value={formShipping.postcode}
                      onChange={(e) => setFormShipping({ ...formShipping, postcode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition font-mono font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Country</label>
                    <input
                      type="text"
                      value={formShipping.country}
                      onChange={(e) => setFormShipping({ ...formShipping, country: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Billing Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormBilling({ ...formShipping })}
                    className="text-[10px] font-bold text-slate-900 underline"
                  >
                    Copy Shipping Address
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Billing Street</label>
                  <input
                    type="text"
                    value={formBilling.street}
                    onChange={(e) => setFormBilling({ ...formBilling, street: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Billing City</label>
                    <input
                      type="text"
                      value={formBilling.city}
                      onChange={(e) => setFormBilling({ ...formBilling, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Billing State</label>
                    <input
                      type="text"
                      value={formBilling.state}
                      onChange={(e) => setFormBilling({ ...formBilling, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Billing Postcode</label>
                    <input
                      type="text"
                      value={formBilling.postcode}
                      onChange={(e) => setFormBilling({ ...formBilling, postcode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition font-mono font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Billing Country</label>
                    <input
                      type="text"
                      value={formBilling.country}
                      onChange={(e) => setFormBilling({ ...formBilling, country: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

            </form>

            {/* Submit Block */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={addCustomerMutation.isPending || updateCustomerMutation.isPending}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-md shadow-slate-950/10 cursor-pointer flex items-center gap-1"
              >
                {addCustomerMutation.isPending || updateCustomerMutation.isPending ? (
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {isAddMode ? 'Add Customer' : 'Save Customer'}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
