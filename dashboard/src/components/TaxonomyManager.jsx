import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import {
  Plus,
  FolderOpen,
  Tag as TagIcon,
  Award,
  Trash2,
  Edit2,
  ChevronRight,
  Layers,
  X,
  Check
} from 'lucide-react';

export const TaxonomyManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('categories');

  // Queries
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data?.data || res.data || [];
    },
    enabled: !!user
  });

  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await apiClient.get('/brands');
      return res.data?.data || res.data || [];
    },
    enabled: !!user
  });

  const { data: tags = [], isLoading: loadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await apiClient.get('/tags');
      return res.data?.data || res.data || [];
    },
    enabled: !!user
  });

  // Mutators - Categories
  const addCategoryMutation = useMutation({
    mutationFn: async (newCat) => {
      const res = await apiClient.post('/categories', newCat);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCatName('');
      setNewCatParentId('');
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/categories/${data.id}`, { name: data.name, parentId: data.parentId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCatId(null);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  // Mutators - Brands
  const addBrandMutation = useMutation({
    mutationFn: async (newBrand) => {
      const res = await apiClient.post('/brands', newBrand);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setNewBrandName('');
      setNewBrandParentId('');
    }
  });

  const updateBrandMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/brands/${data.id}`, { name: data.name, parentId: data.parentId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setEditingBrandId(null);
    }
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/brands/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    }
  });

  // Mutators - Tags
  const addTagMutation = useMutation({
    mutationFn: async (newTag) => {
      const res = await apiClient.post('/tags', newTag);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setNewTagName('');
    }
  });

  const updateTagMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/tags/${data.id}`, { name: data.name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setEditingTagId(null);
    }
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/tags/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });

  // Local Form States
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatParentId, setEditCatParentId] = useState('');

  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandParentId, setNewBrandParentId] = useState('');
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandParentId, setEditBrandParentId] = useState('');

  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');

  const startEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatParentId(cat.parentId || '');
  };

  const startEditBrand = (br) => {
    setEditingBrandId(br.id);
    setEditBrandName(br.name);
    setEditBrandParentId(br.parentId || '');
  };

  const startEditTag = (t) => {
    setEditingTagId(t.id);
    setEditTagName(t.name);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategoryMutation.mutate({
      name: newCatName.trim(),
      parentId: newCatParentId || null
    });
  };

  const handleUpdateCategory = (id) => {
    if (!editCatName.trim()) return;
    updateCategoryMutation.mutate({
      id,
      name: editCatName.trim(),
      parentId: editCatParentId || null
    });
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    addBrandMutation.mutate({
      name: newBrandName.trim(),
      parentId: newBrandParentId || null
    });
  };

  const handleUpdateBrand = (id) => {
    if (!editBrandName.trim()) return;
    updateBrandMutation.mutate({
      id,
      name: editBrandName.trim(),
      parentId: editBrandParentId || null
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    addTagMutation.mutate({
      name: newTagName.trim()
    });
  };

  const handleUpdateTag = (id) => {
    if (!editTagName.trim()) return;
    updateTagMutation.mutate({
      id,
      name: editTagName.trim()
    });
  };

  // Hierarchy Helpers
  const getSubcategories = (parentId) => {
    return categories.filter((c) => c.parentId === parentId);
  };

  const getSubbrands = (parentId) => {
    return brands.filter((b) => b.parentId === parentId);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Taxonomy navigation */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
            activeTab === 'categories'
              ? 'bg-white text-slate-950 border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
            activeTab === 'brands'
              ? 'bg-white text-slate-950 border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Award className="h-4 w-4" />
          Brands & Sub-brands
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
            activeTab === 'tags'
              ? 'bg-white text-slate-950 border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <TagIcon className="h-4 w-4" />
          Tags
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left Column: Add New Category */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Footwear"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3 py-2 text-xs font-medium outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400">The name is how it appears on your site.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Parent Category (Optional)</label>
                  <select
                    value={newCatParentId}
                    onChange={(e) => setNewCatParentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-slate-950 cursor-pointer text-slate-700"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories
                      .filter((c) => !c.parentId) // Only top level as parents for simplicity
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Assign a parent to make this a subcategory.</p>
                </div>

                <button
                  type="submit"
                  disabled={addCategoryMutation.isPending}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer select-none"
                >
                  <Plus className="h-4 w-4" />
                  Add New Category
                </button>
              </form>
            </div>

            {/* Right Column: Table List */}
            <div className="md:col-span-3 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Categories</h3>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {categories.length} Categories
                </span>
              </div>

              {loadingCats ? (
                <div className="py-12 flex justify-center">
                  <div className="h-6 w-6 border-2 border-slate-200 border-t-slate-950 rounded-full animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">No categories created yet.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-12">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Name</th>
                        <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Slug</th>
                        <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/60">
                          <td className="px-3 py-3">
                            <input type="checkbox" className="rounded border-slate-300" />
                          </td>
                          <td className="px-3 py-3">
                            {editingCatId === cat.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editCatName}
                                  onChange={(e) => setEditCatName(e.target.value)}
                                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:border-slate-950 outline-none w-full"
                                />
                                <button
                                  onClick={() => handleUpdateCategory(cat.id)}
                                  className="p-1 bg-slate-950 hover:bg-slate-900 text-white rounded-lg transition"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setEditingCatId(null)}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-900">{cat.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[11px] font-mono text-slate-500">/{cat.slug}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            {editingCatId !== cat.id && (
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => startEditCategory(cat)}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this category?')) {
                                      deleteCategoryMutation.mutate(cat.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left Column: Add New Brand */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Add New Brand</h3>
              <form onSubmit={handleAddBrand} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Sport"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3 py-2 text-xs font-medium outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400">Unique brand identifier.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Parent Brand (Optional)</label>
                  <select
                    value={newBrandParentId}
                    onChange={(e) => setNewBrandParentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-slate-950 cursor-pointer text-slate-700"
                  >
                    <option value="">None (Top-Level Brand)</option>
                    {brands
                      .filter((b) => !b.parentId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Add sub-brands under parent brands if required.</p>
                </div>

                <button
                  type="submit"
                  disabled={addBrandMutation.isPending}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer select-none"
                >
                  <Plus className="h-4 w-4" />
                  Add New Brand
                </button>
              </form>
            </div>

            {/* Right Column: Brands Table */}
            <div className="md:col-span-3 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Brands</h3>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {brands.length} Brands
                </span>
              </div>

              {loadingBrands ? (
                <div className="py-12 flex justify-center">
                  <div className="h-6 w-6 border-2 border-slate-200 border-t-slate-950 rounded-full animate-spin" />
                </div>
              ) : brands.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">No brands created yet.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-12">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Name</th>
                        <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Slug</th>
                        <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {brands.map((brand) => (
                        <tr key={brand.id} className="hover:bg-slate-50/60">
                          <td className="px-3 py-3">
                            <input type="checkbox" className="rounded border-slate-300" />
                          </td>
                          <td className="px-3 py-3">
                            {editingBrandId === brand.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editBrandName}
                                  onChange={(e) => setEditBrandName(e.target.value)}
                                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:border-slate-950 outline-none w-full"
                                />
                                <button
                                  onClick={() => handleUpdateBrand(brand.id)}
                                  className="p-1 bg-slate-950 hover:bg-slate-900 text-white rounded-lg transition"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setEditingBrandId(null)}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-amber-500 shrink-0" />
                                <span className="text-xs font-semibold text-slate-900">{brand.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[11px] font-mono text-slate-500">/{brand.slug}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            {editingBrandId !== brand.id && (
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => startEditBrand(brand)}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this brand?')) {
                                      deleteBrandMutation.mutate(brand.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left Column: Add New Tag */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Add New Tag</h3>
              <form onSubmit={handleAddTag} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tag Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Cotton"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3 py-2 text-xs font-medium outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400">Tags are fast metadata markers.</p>
                </div>

                <button
                  type="submit"
                  disabled={addTagMutation.isPending}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer select-none"
                >
                  <Plus className="h-4 w-4" />
                  Add New Tag
                </button>
              </form>
            </div>

            {/* Right Column: Tags list */}
            <div className="md:col-span-3 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Tags List</h3>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {tags.length} Tags
                </span>
              </div>

              {loadingTags ? (
                <div className="py-12 flex justify-center">
                  <div className="h-6 w-6 border-2 border-slate-200 border-t-slate-950 rounded-full animate-spin" />
                </div>
              ) : tags.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">No tags created yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-800 transition"
                    >
                      {editingTagId === tag.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                            className="bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-[11px] font-medium focus:border-slate-950 outline-none w-24"
                          />
                          <button
                            onClick={() => handleUpdateTag(tag.id)}
                            className="p-0.5 bg-slate-950 hover:bg-slate-900 text-white rounded-md transition"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditingTagId(null)}
                            className="p-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <TagIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{tag.name}</span>
                          <span className="text-[9px] font-mono font-medium text-slate-400">/{tag.slug}</span>
                        </>
                      )}

                      {editingTagId !== tag.id && (
                        <div className="flex gap-0.5 pl-1.5 border-l border-slate-200 ml-1">
                          <button
                            onClick={() => startEditTag(tag)}
                            className="text-slate-400 hover:text-slate-950 transition p-0.5"
                            title="Rename Tag"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete tag "${tag.name}"?`)) {
                                deleteTagMutation.mutate(tag.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 transition p-0.5"
                            title="Delete Tag"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
