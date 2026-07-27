import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import {
  Plus,
  Search,
  Filter,
  Boxes,
  Edit2,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Tag as TagIcon,
  FolderOpen,
  DollarSign,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ChevronDown,
  MoreVertical,
  Award,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import { TaxonomyManager } from '../components/TaxonomyManager';

export const ProductsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPageTab, setCurrentPageTab] = useState('catalog');

  // Queries
  const { data: productsData = { items: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
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
  const products = productsData.items;

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      const data = res.data?.data || res.data || [];
      const catList = Array.isArray(data) ? data : [];
      
      // Store did and name in localStorage for instant mapping
      try {
        const catMap = {};
        catList.forEach((c) => {
          if (c.did && c.name) {
            catMap[c.did] = c.name;
          }
          if (c.id && c.name) {
            catMap[c.id] = c.name;
          }
          if (c._id && c.name) {
            catMap[c._id] = c.name;
          }
        });
        localStorage.setItem('category_did_map', JSON.stringify(catMap));
      } catch (err) {
        console.error('Error caching categories in localStorage:', err);
      }
      
      return catList;
    },
    enabled: !!user
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await apiClient.get('/brands');
      return res.data?.data || res.data || [];
    },
    enabled: !!user
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await apiClient.get('/tags');
      return res.data?.data || res.data || [];
    },
    enabled: !!user
  });

  // Mutators
  const addProductMutation = useMutation({
    mutationFn: async (newProd) => {
      const res = await apiClient.post('/products', newProd);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/products/${data.id}`, data.updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Pages / Views State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
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

  // WordPress-style Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formRegularPrice, setFormRegularPrice] = useState(0);
  const [formSalePrice, setFormSalePrice] = useState(undefined);
  const [formSku, setFormSku] = useState('');
  const [formStockQty, setFormStockQty] = useState(0);
  const [formStockStatus, setFormStockStatus] = useState('instock');
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(5);
  const [formCategories, setFormCategories] = useState([]);
  const [formTags, setFormTags] = useState([]);
  const [formImages, setFormImages] = useState([]);
  const [formBrand, setFormBrand] = useState('');
  const [formSeason, setFormSeason] = useState('All Seasons');
  
  // Custom states inside form
  const [newTagInput, setNewTagInput] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [productDataTab, setProductDataTab] = useState('general');

  // Mock upload selector state
  const [mockGalleryOpen, setMockGalleryOpen] = useState(false);

  // Seasons List
  const SEASONS = ['All Seasons', 'Spring', 'Summer', 'Autumn', 'Winter'];

  // High quality Unsplash URLs to use for uploading images
  const UNSPLASH_LIBRARY = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
  ];

  // Open Form to Add New
  const handleAddNew = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormShortDescription('');
    setFormRegularPrice(0);
    setFormSalePrice(undefined);
    setFormSku('');
    setFormStockQty(0);
    setFormStockStatus('instock');
    setFormLowStockThreshold(5);
    setFormCategories([]);
    setFormTags([]);
    setFormImages([]);
    setFormBrand('');
    setFormSeason('All Seasons');
    setProductDataTab('general');
    setIsFormOpen(true);
  };

  // Open Form to Edit
  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name || '');
    setFormDescription(prod.description || '');
    setFormShortDescription(prod.shortDescription || prod.short_description || '');
    setFormRegularPrice(prod.regularPrice ?? prod.price ?? 0);
    setFormSalePrice(prod.salePrice ?? prod.offerPrice ?? undefined);
    setFormSku(prod.sku || prod.did || '');
    setFormStockQty(prod.stockQuantity ?? prod.stock_quantity ?? 0);
    setFormStockStatus(prod.stockStatus || prod.stock_status || 'instock');
    setFormLowStockThreshold(prod.lowStockThreshold ?? 5);
    setFormCategories(Array.isArray(prod.categories) ? [...prod.categories] : []);
    setFormTags(Array.isArray(prod.tags) ? [...prod.tags] : []);
    // Support both images array, image_url string, or thumbnail_url
    const imgs = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images
      : prod.image_url ? [prod.image_url]
      : prod.thumbnail_url ? [prod.thumbnail_url]
      : [];
    setFormImages(imgs);
    setFormBrand(prod.brand || '');
    setFormSeason(prod.season || 'All Seasons');
    setProductDataTab('general');
    setIsFormOpen(true);
  };

  // Save/Publish
  const handlePublish = (e) => {
    e.preventDefault();
    if (!formName) {
      alert('Product title is required.');
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      shortDescription: formShortDescription,
      regularPrice: Number(formRegularPrice),
      salePrice: formSalePrice !== undefined && formSalePrice !== null && String(formSalePrice).trim() !== '' ? Number(formSalePrice) : undefined,
      sku: formSku || `SKU-${Date.now().toString().slice(-6)}`,
      stockQuantity: Number(formStockQty),
      stockStatus: formStockQty === 0 ? 'outofstock' : formStockStatus,
      lowStockThreshold: Number(formLowStockThreshold),
      categories: formCategories.length > 0 ? formCategories : ['Uncategorized'],
      brand: formBrand || undefined,
      tags: formTags,
      season: formSeason || 'All Seasons',
      images: formImages.length > 0 ? formImages : [UNSPLASH_LIBRARY[0]],
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, updates: payload });
    } else {
      addProductMutation.mutate(payload);
    }
  };

  // Category selection handler
  const handleCategoryToggle = (catName) => {
    if (formCategories.includes(catName)) {
      setFormCategories(formCategories.filter((c) => c !== catName));
    } else {
      setFormCategories([...formCategories, catName]);
    }
  };

  const handleAddCategoryQuick = () => {
    const trimmed = newCatInput.trim();
    if (trimmed) {
      apiClient.post('/categories', { name: trimmed, parentId: null }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        setFormCategories([...formCategories, trimmed]);
        setNewCatInput('');
      });
    }
  };

  // Tag manipulation
  const handleAddTagQuick = () => {
    const trimmed = newTagInput.trim();
    if (trimmed) {
      apiClient.post('/tags', { name: trimmed }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['tags'] });
        if (!formTags.includes(trimmed)) {
          setFormTags([...formTags, trimmed]);
        }
        setNewTagInput('');
      });
    }
  };

  const handleRemoveTag = (tag) => {
    setFormTags(formTags.filter((t) => t !== tag));
  };

  const handleSelectMockImage = (url) => {
    if (!formImages.includes(url)) {
      setFormImages([...formImages, url]);
    }
    setMockGalleryOpen(false);
  };

  const handleRemoveImage = (idx) => {
    setFormImages(formImages.filter((_, i) => i !== idx));
  };

  // Filter products logic
  const filteredProducts = Array.isArray(products) ? products.filter((p) => {
    const stockStatus = p.stockStatus || p.stock_status || '';
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || p.did || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || (Array.isArray(p.categories) && p.categories.some(
        (c) => (typeof c === 'string' ? c : c?.name || c?.slug || '') === categoryFilter
      ));

    const matchesBrand =
      brandFilter === 'all' ||
      (typeof p.brand === 'string' ? p.brand : p.brand?.name || p.brand?.slug || '') === brandFilter;

    const matchesSeason =
      seasonFilter === 'all' || p.season === seasonFilter;

    const matchesStock =
      stockFilter === 'all' || stockStatus === stockFilter;

    return matchesSearch && matchesCategory && matchesBrand && matchesSeason && matchesStock;
  }) : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const getValue = (item) => {
      switch (sortBy) {
        case 'price':
          return Number(item.salePrice ?? item.offerPrice ?? item.regularPrice ?? item.price ?? 0);
        case 'stock':
          return Number(item.stockQuantity ?? item.stock_quantity ?? 0);
        default:
          return (item.name || '').toString().toLowerCase();
      }
    };

    const valueA = getValue(a);
    const valueB = getValue(b);

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isFiltered = searchTerm.trim() !== '' || categoryFilter !== 'all' || brandFilter !== 'all' || seasonFilter !== 'all' || stockFilter !== 'all';
  const totalItems = isFiltered ? sortedProducts.length : (productsData.total || sortedProducts.length);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStockBadge = (status, qty) => {
    switch (status) {
      case 'instock':
        return (
          <span className="flex w-25 justify-center items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-white shadow-xs">
            In Stock
          </span>
        );
      case 'outofstock':
        return (
          <span className="flex w-25 justify-center items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
            Out of Stock
          </span>
        );
      case 'onbackorder':
        return (
          <span className="flex w-25 justify-center items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
            On Backorder
          </span>
        );
      default:
        return (
          <span className="flex w-25 justify-center items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-600 text-white shadow-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {!isFormOpen ? (
        <>
          {/* Main Top Header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-950 tracking-tight font-sans">Products Directory</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage stock levels, categories, seasons, and brands with dynamic taxonomy tracking.
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition self-start sm:self-auto"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Product
            </button>
          </div>

          {/* Catalog vs Taxonomy Page Tab Selectors */}
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setCurrentPageTab('catalog')}
              className={`pb-3 text-sm font-bold border-b-2 transition select-none cursor-pointer ${
                currentPageTab === 'catalog'
                  ? 'border-slate-950 text-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Products Catalog
            </button>
            <button
              onClick={() => setCurrentPageTab('taxonomies')}
              className={`pb-3 text-sm font-bold border-b-2 transition select-none cursor-pointer ${
                currentPageTab === 'taxonomies'
                  ? 'border-slate-950 text-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Product Taxonomies (Categories, Brands, Tags)
            </button>
          </div>

          {currentPageTab === 'taxonomies' ? (
            <TaxonomyManager />
          ) : (
            <>
              {/* Filters Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  
                  {/* Search bar */}
                  <div className="relative md:col-span-2">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Search className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search products by title or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-sm outline-none transition"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                        <FolderOpen className="h-4 w-4" />
                      </span>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                        <Award className="h-4 w-4" />
                      </span>
                      <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
                      >
                        <option value="all">All Brands</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Season Filter */}
                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <select
                        value={seasonFilter}
                        onChange={(e) => setSeasonFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
                      >
                        <option value="all">All Seasons</option>
                        {SEASONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Sort selector */}
                  <div className="md:col-span-1">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                        <ArrowUpDown className="h-4 w-4" />
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
                      >
                        <option value="name">Name</option>
                        <option value="price">Price</option>
                        <option value="stock">Stock</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full px-3 py-2 bg-slate-950 text-white rounded-xl text-xs font-semibold"
                    >
                      {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                  </div>
                  {/* Stock Filter */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                        <PackageCheck className="h-4 w-4" />
                      </span>
                      <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
                      >
                        <option value="all">All Stock Statuses</option>
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                        <option value="onbackorder">On Backorder</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="h-8 w-8 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                    <span className="text-xs text-slate-500 font-semibold">Loading product database...</span>
                  </div>
                ) : sortedProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table className="w-full text-left text-sm text-slate-600">
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-[280px] max-w-[280px]">Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Stock Status</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100">
                        {paginatedProducts.map((p) => {
                          let cachedCatMap = {};
                          try {
                            cachedCatMap = JSON.parse(localStorage.getItem('category_did_map') || '{}');
                          } catch (e) {}

                          return (
                            <TableRow key={p.id || p._id} className="hover:bg-slate-50/50 transition">
                              <TableCell className="px-6 py-4.5 w-[280px] max-w-[280px]">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={(() => {
                                      const raw = (Array.isArray(p.images) && p.images.length > 0
                                        ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.src || p.images[0]?.url)
                                        : null) || p.image_url || p.thumbnail_url || p.image;
                                      if (!raw || typeof raw !== 'string') return UNSPLASH_LIBRARY[0];
                                      if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) return raw;
                                      return UNSPLASH_LIBRARY[0];
                                    })()}
                                    alt={p.name}
                                    className="h-10 w-10 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-900 text-xs truncate" title={p.name}>
                                      {p.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        ID: {p.id || p._id || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs font-bold text-slate-950">
                                {p.sku || p.did || '—'}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {(Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : ['Uncategorized']).map((c, i) => {
                                    const catDidOrName = typeof c === 'string' ? c : c?.name || c?.slug || c?.did || '';
                                    const displayName = cachedCatMap[catDidOrName] || catDidOrName || 'Uncategorized';
                                    return (
                                      <span key={i} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                        {displayName}
                                      </span>
                                    );
                                  })}
                                </div>
                              </TableCell>
                              <TableCell className="p-2">
                                {getStockBadge(p.stockStatus || p.stock_status, p.stockQuantity ?? p.stock_quantity)}
                              </TableCell>
                              <TableCell className="px-6 py-4.5 text-right font-mono text-xs font-bold">
                                {(p.salePrice || p.offerPrice) ? (
                                  <div className="flex flex-col items-end">
                                    <span className="text-rose-600 font-extrabold">৳{p.salePrice || p.offerPrice}</span>
                                    <span className="text-[10px] text-slate-400 line-through font-medium">৳{p.regularPrice || p.price}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-950 font-extrabold">৳{p.regularPrice || p.price || 0}</span>
                                )}
                              </TableCell>
                              <TableCell className="px-6 py-4.5 text-center relative" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition hover:text-slate-900 cursor-pointer"
                                    title="Actions"
                                  >
                                    <MoreVertical className="h-4.5 w-4.5" />
                                  </button>

                                  {openMenuId === p.id && (
                                    <>
                                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                      <div className="absolute right-6 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            handleEdit(p);
                                          }}
                                          className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer transition"
                                        >
                                          <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                                          Update Option
                                        </button>
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            if (confirm('Are you sure you want to delete this product?')) {
                                              deleteProductMutation.mutate(p.id);
                                            }
                                          }}
                                          className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer transition"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                                          Delete Option
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
                  </div>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">No products found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or add a new product.</p>
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
                      of <span className="font-semibold text-slate-900">{totalItems}</span> products
                    </span>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        /* WordPress-style Add/Edit Product Editor Form Screen */
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsFormOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to catalog
            </button>
            <h2 className="text-base font-bold text-slate-950 font-sans">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>

          <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Editor Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Product Title Input */}
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Enter product title here"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-950 rounded-2xl px-5 py-3.5 text-base font-bold text-slate-950 outline-none transition shadow-xs placeholder-slate-400"
                />
              </div>

              {/* Description editor box */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Editor</span>
                  <button
                    type="button"
                    onClick={() => setFormDescription(formDescription + '<strong>bold text</strong>')}
                    className="p-1 px-2.5 bg-white border border-slate-200/80 hover:bg-slate-100 text-[10px] font-bold rounded-md"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormDescription(formDescription + '<em>italic text</em>')}
                    className="p-1 px-2.5 bg-white border border-slate-200/80 hover:bg-slate-100 text-[10px] font-bold rounded-md italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormDescription(formDescription + '<h2>Heading</h2>')}
                    className="p-1 px-2.5 bg-white border border-slate-200/80 hover:bg-slate-100 text-[10px] font-bold rounded-md"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormDescription(formDescription + '<p>New paragraph</p>')}
                    className="p-1 px-2.5 bg-white border border-slate-200/80 hover:bg-slate-100 text-[10px] font-bold rounded-md"
                  >
                    p
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormDescription('')}
                    className="p-1 px-2.5 bg-white border border-rose-100 hover:bg-rose-50 text-[10px] font-bold text-rose-600 rounded-md ml-auto"
                  >
                    Clear HTML
                  </button>
                </div>
                <div className="p-5">
                  <textarea
                    rows={8}
                    placeholder="Describe your product here using HTML tags or plain text..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-50/20 focus:bg-white border border-slate-200/80 focus:border-slate-950 rounded-xl p-4 text-xs leading-relaxed outline-none transition font-sans"
                  />
                  <div className="mt-4 p-4 bg-slate-50/60 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Live Description Preview</span>
                    <div
                      className="text-xs text-slate-600 leading-relaxed font-sans prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: formDescription || '<p class="italic text-slate-400">Type description above to preview...</p>' }}
                    />
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                <span className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                  Product Short Description
                </span>
                <textarea
                  rows={2}
                  placeholder="Provide a concise 1-sentence synopsis of the product for catalog previews..."
                  value={formShortDescription}
                  onChange={(e) => setFormShortDescription(e.target.value)}
                  className="w-full bg-slate-50/30 focus:bg-white border border-slate-200 focus:border-slate-950 rounded-xl p-3.5 text-xs outline-none transition resize-none leading-relaxed"
                />
              </div>

              {/* WordPress Product Data custom tabs panel */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Product Data</h3>
                  <span className="text-xs font-bold text-slate-500">Simple product</span>
                </div>

                <div className="flex flex-col sm:flex-row min-h-[220px]">
                  {/* Left Tabs bar */}
                  <div className="w-full sm:w-44 bg-slate-50/50 border-r border-b sm:border-b-0 border-slate-200 shrink-0 flex flex-row sm:flex-col p-1.5 gap-1">
                    <button
                      type="button"
                      onClick={() => setProductDataTab('general')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold w-full transition select-none cursor-pointer ${
                        productDataTab === 'general' ? 'bg-white text-slate-950 border border-slate-200/80 shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <DollarSign className="h-4 w-4 shrink-0" />
                      General
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductDataTab('inventory')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold w-full transition select-none cursor-pointer ${
                        productDataTab === 'inventory' ? 'bg-white text-slate-950 border border-slate-200/80 shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Boxes className="h-4 w-4 shrink-0" />
                      Inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductDataTab('attributes')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold w-full transition select-none cursor-pointer ${
                        productDataTab === 'attributes' ? 'bg-white text-slate-950 border border-slate-200/80 shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <TagIcon className="h-4 w-4 shrink-0" />
                      Attributes
                    </button>
                  </div>

                  {/* Right Tab Content */}
                  <div className="flex-1 p-6">
                    {productDataTab === 'general' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Regular Price (BDT)</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="199"
                              value={formRegularPrice || ''}
                              onChange={(e) => setFormRegularPrice(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3 py-2 text-xs outline-none transition font-semibold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Sale Price (BDT)</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="159 (optional)"
                              value={formSalePrice || ''}
                              onChange={(e) => setFormSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3 py-2 text-xs outline-none transition font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {productDataTab === 'inventory' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">SKU</label>
                            <input
                              type="text"
                              placeholder="BP-L-MIN-01"
                              value={formSku}
                              onChange={(e) => setFormSku(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3 py-2 text-xs outline-none transition font-mono font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Stock Status</label>
                            <select
                              value={formStockStatus}
                              onChange={(e) => setFormStockStatus(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-950 font-semibold cursor-pointer"
                            >
                              <option value="instock">In stock</option>
                              <option value="outofstock">Out of stock</option>
                              <option value="onbackorder">On backorder</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Stock Quantity</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="45"
                              value={formStockQty}
                              onChange={(e) => setFormStockQty(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3 py-2 text-xs outline-none transition font-semibold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Low Stock Threshold</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="5"
                              value={formLowStockThreshold}
                              onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl px-3 py-2 text-xs outline-none transition font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {productDataTab === 'attributes' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Define custom product parameters like material, warranty, size, or colors for advanced filters.
                        </p>
                        <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-between">
                          <div className="text-xs">
                            <p className="font-bold text-slate-900">Custom Attributes Box</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Mock metadata ready to serialize.</p>
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-800 font-bold font-mono px-2 py-0.5 rounded-md">
                            Wordpress standard
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Settings */}
            <div className="space-y-6">
              
              {/* Publish Box */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">Publish Settings</h3>
                
                <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-bold text-slate-950">Draft / Pending Publish</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Catalog Visibility:</span>
                    <span className="font-bold text-slate-950">Shop & Search Results</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addProductMutation.isPending || updateProductMutation.isPending}
                  className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl font-bold text-xs transition shadow-md shadow-slate-950/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {(addProductMutation.isPending || updateProductMutation.isPending) && (
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {editingProduct ? 'Update Product' : 'Publish Product'}
                </button>
              </div>

              {/* Product Season Selection Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-teal-600 shrink-0" />
                  Product Season
                </h3>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  We recommend declaring a specific season attribute to group fashion lines or seasonal items.
                </p>
                <select
                  value={formSeason}
                  onChange={(e) => setFormSeason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-950 font-semibold cursor-pointer text-slate-700"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Product Brand Selection Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500 shrink-0" />
                  Product Brand
                </h3>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Select a brand (or dynamic sub-brand) from the dynamic e-commerce brand book.
                </p>
                <select
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-950 font-semibold cursor-pointer text-slate-700"
                >
                  <option value="">No Brand Selected</option>
                  {brands.map((br) => (
                    <option key={br.id} value={br.name}>
                      {br.parentId ? `└─ ${br.name}` : br.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Images Box */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center justify-between">
                  Product Images
                  <button
                    type="button"
                    onClick={() => setMockGalleryOpen(true)}
                    className="text-xs font-bold text-slate-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    Select Upload
                  </button>
                </h3>

                {formImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square border border-slate-200 rounded-xl overflow-hidden group">
                        <img src={img} alt="" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-slate-800 hover:text-rose-600 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => setMockGalleryOpen(true)}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-950/40 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="h-5 w-5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-800">Choose images</span>
                    <span className="text-[10px] text-slate-400">Click to select pre-configured assets</span>
                  </div>
                )}
              </div>

              {/* Categories Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">Product Categories</h3>
                
                {/* Dynamic Category List */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {categories.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No categories available.</p>
                  ) : (
                    categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formCategories.includes(cat.name)}
                          onChange={() => handleCategoryToggle(cat.name)}
                          className="rounded border-slate-300 text-slate-950 focus:ring-slate-950 h-3.5 w-3.5 cursor-pointer accent-slate-950"
                        />
                        <span className={cat.parentId ? 'pl-3 text-slate-500' : ''}>
                          {cat.parentId ? `└─ ${cat.name}` : cat.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    placeholder="+ New category..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-slate-950"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategoryQuick}
                    className="p-1 px-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tags Box */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">Product Tags</h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter tags..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-950"
                  />
                  <button
                    type="button"
                    onClick={handleAddTagQuick}
                    className="p-1 px-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50"
                      >
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-slate-800 cursor-pointer">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </form>

          {/* Media Library Dialog */}
          {mockGalleryOpen && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">WordPress-style Media Library</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Select a royalty-free Unsplash thumbnail to mock upload.</p>
                  </div>
                  <button
                    onClick={() => setMockGalleryOpen(false)}
                    className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {UNSPLASH_LIBRARY.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectMockImage(url)}
                      className="aspect-square rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-950 hover:shadow-md transition group relative"
                    >
                      <img src={url} alt="" className="object-cover w-full h-full group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded-full">Select</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <button
                    onClick={() => setMockGalleryOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Close Library
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
