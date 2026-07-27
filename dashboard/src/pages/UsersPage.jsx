import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import {
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  X,
  Shield,
  Mail,
  Check,
  AlertCircle,
  MoreVertical,
  Activity,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const UsersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: usersData = { items: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get('/users');
      const rawData = res.data;
      let items = [];
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
  const users = usersData.items;

  // Mutators
  const addUserMutation = useMutation({
    mutationFn: async (newUser) => {
      const res = await apiClient.post('/users', newUser);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/users/${data.id}`, data.updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

  // Fields State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('Store_manager');
  const [formPassword, setFormPassword] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole('Store_manager');
    setFormPassword('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword('');
    setFormIsActive(user.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      alert('Name and Email are required fields.');
      return;
    }

    if (!editingUser && !formPassword) {
      alert('Password is required for new users.');
      return;
    }

    const payload = {
      name: formName,
      email: formEmail,
      role: formRole,
      isActive: formIsActive
    };

    if (formPassword) {
      payload.password = formPassword;
    }

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, updates: payload });
    } else {
      addUserMutation.mutate(payload);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((u) => {
    return (
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valueA = (a[sortBy] ?? '').toString().toLowerCase();
    const valueB = (b[sortBy] ?? '').toString().toLowerCase();
    if (sortBy === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Super_Admin':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Admin':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Store_manager':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight font-sans">Team Members</h1>
          <p className="text-sm text-slate-500 mt-1">
            Delegate administrative roles, manage permissions, and track active users.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add User
        </button>
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
              placeholder="Search by name, email, or role..."
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
              <option value="role">Role</option>
              <option value="createdAt">Date Added</option>
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

      {/* Users List Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Loading users...</span>
        </div>
      ) : sortedUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between"
            >
              <div>
                {/* Upper block with role and active state */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${getRoleBadgeColor(u.role)}`}>
                    {u.role}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {u.isActive !== false ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>

                {/* Avatar and Profile */}
                <div className="flex items-center gap-4 mt-5">
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                    alt={u.name}
                    className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-950 text-sm truncate">{u.name}</h3>
                    <p className="text-xs text-slate-500 font-medium font-mono truncate mt-0.5">{u.email}</p>
                  </div>
                </div>
              </div>

              {/* Lower actions block */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  Created: {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition"
                    title="Edit User"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this user?')) {
                        deleteUserMutation.mutate(u.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-slate-900">No users found</p>
          <p className="text-xs text-slate-400">Add a new admin or team member to get started.</p>
        </div>
      )}

      {/* Add / Update User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-950 font-sans text-sm flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-slate-600" />
                {editingUser ? 'Update User Details' : 'Add New Administrator'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-500 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="E.g. David Vance"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none transition font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="E.g. david.v@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-950 rounded-xl text-xs outline-none transition font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password {editingUser && <span className="text-[10px] text-slate-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? "••••••••" : "E.g. securePassword123"}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-950 rounded-xl px-3.5 py-2 text-xs outline-none transition font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Role Selection</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-950 font-semibold cursor-pointer"
                  >
                    <option value="Super_Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Store_manager">Store Manager</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={formIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormIsActive(e.target.value === 'active')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-950 font-semibold cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserMutation.isPending || updateUserMutation.isPending}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
