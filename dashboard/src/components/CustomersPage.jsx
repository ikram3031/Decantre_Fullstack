import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import {
  Search,
  Users,
  Edit2,
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
      const res = await apiClient.get('/api/customers');
      return res.data;
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/api/customers/${data.id}`, data.updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] }); // Dynamic orders synchronization
      setIsDrawerOpen(false);
    }
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer / Editing State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Edit fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formShipping, setFormShipping] = useState({ street: '', city: '', state: '', postcode: '', country: '' });
  const [formBilling, setFormBilling] = useState({ street: '', city: '', state: '', postcode: '', country: '' });

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormName(customer.name);
    setFormEmail(customer.email);
    setFormPhone(customer.phone);
    setFormShipping({ ...customer.shippingAddress });
    setFormBilling({ ...customer.billingAddress });
    setIsDrawerOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if (!formName || !formEmail) {
      alert('Name and Email are required.');
      return;
    }

    updateCustomerMutation.mutate({
      id: selectedCustomer.id,
      updates: {
        name: formName,
        email: formEmail,
        phone: formPhone,
        shippingAddress: formShipping,
        billingAddress: formBilling
      }
    });
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
        <div className="bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-600 font-semibold font-mono self-start sm:self-auto shadow-xs">
          Registered: {customers.length} accounts
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
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
                {filteredCustomers.map((c) => (
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
                        {c.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right font-mono text-xs font-bold text-emerald-700">
                      ৳{c.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-950 rounded-lg transition inline-flex items-center gap-1.5 font-bold text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit Customer
                      </button>
                    </td>
                  </tr>
                ))}
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
      {isDrawerOpen && selectedCustomer && (
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
                  Edit Customer Profile
                </h3>
                <span className="text-[10px] text-slate-400 font-mono font-bold mt-1 block">
                  Customer ID: {selectedCustomer.id}
                </span>
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
                disabled={updateCustomerMutation.isPending}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-md shadow-slate-950/10 cursor-pointer flex items-center gap-1"
              >
                {updateCustomerMutation.isPending ? (
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                Save Customer
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
