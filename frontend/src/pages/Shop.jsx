import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/formatCurrency';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { PriceRangeSlider } from '../components/PriceRangeSlider';
import menuData from '../data/menuData.json';
import { getDefaultSelection } from '../store/productHelpers';


const staticBrandHierarchy = menuData.brandHierarchy || {};

export const Shop = () => {
  const {
    searchQuery,
    setSearchQuery,
    cardSelections,
    setCardSelections,
    wishlist,
    toggleWishlist,
    handleOpenProductDetail,
    handleAddToCart,
    calculateItemPrice,
    products,
    productsError,
    categories,
    categoriesError,
    brands,
    brandsError,
    fetchProducts,
    fetchCategories,
    fetchBrands,
    selectedCategory,
    setSelectedCategory,
    currentTheme
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const brandParam = searchParams.get('brand');
  const searchParam = searchParams.get('search');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');

  const [sortOrder, setSortOrder] = useState('newest');
  const [brandFilters, setBrandFilters] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === 'undefined') return 15;
    const width = window.innerWidth;
    if (width < 640) return 10;
    if (width < 1024) return 12;
    return 15;
  });
  const visibleCount = Math.min(allProducts.length, totalProducts || allProducts.length);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePageSize = () => {
      const width = window.innerWidth;
      setPageSize(width < 640 ? 10 : width < 1024 ? 12 : 15);
    };

    updatePageSize();
    window.addEventListener('resize', updatePageSize);

    return () => window.removeEventListener('resize', updatePageSize);
  }, []);

  // Compute stable min/max price boundaries for the decants and bottles range
  const priceLimits = {
    min: 100,
    max: 30000
  };

  // Mapped client-side filter for the price range (Now backend handled)
  const displayedProducts = useMemo(() => {
    return allProducts;
  }, [allProducts]);

  const categoryOptions = useMemo(
    () => [{ id: 'all', name: 'All', slug: 'All', product_count: totalProducts || allProducts.length }, ...categories],
    [categories, totalProducts, allProducts.length]
  );

  const gridColumnsClass = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6';

  // Group brands into Parent-Child hierarchy (Niche / Designer / Arabian -> Alphabetic Ranges -> Brand items)
  const structuredBrandHierarchy = useMemo(() => {
    const nicheGroups = { 'A-E': [], 'F-J': [], 'K-O': [], 'P-T': [], 'U-Z': [] };
    const designerGroups = { 'A-E': [], 'F-J': [], 'K-O': [], 'P-T': [], 'U-Z': [] };
    const arabianGroups = { 'A-E': [], 'F-J': [], 'K-O': [], 'P-T': [], 'U-Z': [] };

    const getGroup = (char) => {
      if (char >= 'A' && char <= 'E') return 'A-E';
      if (char >= 'F' && char <= 'J') return 'F-J';
      if (char >= 'K' && char <= 'O') return 'K-O';
      if (char >= 'P' && char <= 'T') return 'P-T';
      return 'U-Z';
    };

    if (brands && brands.length > 0) {
      // Identify the 3 parent brands (those with parent === null)
      const parentBrands = brands.filter(b => typeof b === 'object' && !b.parent);
      const parentIdMap = {}; // parentId -> category key ('niche' | 'designer' | 'arabian')
      for (const p of parentBrands) {
        const slug = (p.slug || p.name || '').toLowerCase();
        if (slug.includes('niche')) parentIdMap[p.id || p._id] = 'niche';
        else if (slug.includes('designer')) parentIdMap[p.id || p._id] = 'designer';
        else if (slug.includes('arabian') || slug.includes('uae')) parentIdMap[p.id || p._id] = 'arabian';
      }

      // Group child brands by their parent reference
      brands.forEach((b) => {
        if (typeof b !== 'object') return;
        // Skip parent brands themselves
        if (!b.parent) return;
        const name = b.name || b.slug || '';
        if (!name) return;

        const parentRef = typeof b.parent === 'object' ? (b.parent.id || b.parent._id || b.parent) : b.parent;
        const catKey = parentIdMap[parentRef] || 'niche'; // fallback to niche

        const firstChar = name.trim().charAt(0).toUpperCase();
        const groupKey = getGroup(firstChar);
        const item = { id: b.id || b._id || name, name, slug: b.slug || name };

        const targetGroups = catKey === 'arabian' ? arabianGroups : catKey === 'designer' ? designerGroups : nicheGroups;
        if (!targetGroups[groupKey].some(i => i.name === name)) {
          targetGroups[groupKey].push(item);
        }
      });
    }

    const filterEmpty = (groups, fallbackStatic) => {
      const res = {};
      Object.keys(groups).forEach((key) => {
        if (groups[key].length > 0) {
          groups[key].sort((a, b) => {
            const nameA = typeof a === 'string' ? a : (a.name || '');
            const nameB = typeof b === 'string' ? b : (b.name || '');
            return nameA.localeCompare(nameB);
          });
          res[key] = groups[key];
        }
      });
      // Fallback to static data if no dynamic brands matched
      if (Object.keys(res).length === 0 && fallbackStatic) {
        const fallbackRes = {};
        Object.entries(fallbackStatic).forEach(([key, names]) => {
          fallbackRes[key] = Array.isArray(names)
            ? names.map(n => ({ id: n, name: n, slug: n.toLowerCase().replace(/\s+/g, '-') }))
            : [];
        });
        return fallbackRes;
      }
      return res;
    };

    return [
      { id: 'niche', name: 'Niche Perfumes', ranges: filterEmpty(nicheGroups, staticBrandHierarchy.niche?.ranges) },
      { id: 'designer', name: 'Designer Fragrances', ranges: filterEmpty(designerGroups, staticBrandHierarchy.designer?.ranges) },
      { id: 'arabian', name: 'Arabian & UAE Fragrances', ranges: filterEmpty(arabianGroups, staticBrandHierarchy.arabian?.ranges) }
    ];
  }, [brands]);

  const [expandedParents, setExpandedParents] = useState({});
  const toggleParent = (pId) => setExpandedParents(prev => ({ ...prev, [pId]: !prev[pId] }));

  // Sync URL query params to state
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam, setSelectedCategory]);

  useEffect(() => {
    if (brandParam) {
      setBrandFilters(brandParam.split(',').filter(Boolean));
    } else {
      setBrandFilters([]);
    }
  }, [brandParam]);

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
    }
  }, [searchParam, setSearchQuery]);


  const loadProductsPage = async (targetPage = 1, append = false) => {
    if (typeof fetchProducts !== 'function') return;

    const sortMap = {
      newest: { sortBy: 'createdAt', order: 'desc' },
      oldest: { sortBy: 'createdAt', order: 'asc' },
      'price-asc': { sortBy: 'price', order: 'asc' },
      'price-desc': { sortBy: 'price', order: 'desc' },
      'name-asc': { sortBy: 'name', order: 'asc' },
      'name-desc': { sortBy: 'name', order: 'desc' },
    };
    const { sortBy, order } = sortMap[sortOrder] || sortMap.newest;

    const toSlug = (str = '') => String(str).toLowerCase().trim().replace(/\s+/g, '-');

    const selectedCategoryObj = categories.find(
      c => c.slug === selectedCategory || c.name === selectedCategory || c.id === selectedCategory || toSlug(c.slug || c.name) === toSlug(selectedCategory)
    );
    const categoryVal = selectedCategoryObj ? (selectedCategoryObj.id || selectedCategoryObj.slug || selectedCategoryObj.name) : selectedCategory;

    const opts = {
      skip: (targetPage - 1) * pageSize,
      limit: pageSize,
      sortBy,
      order,
    };

    if (selectedCategory && selectedCategory !== 'All') {
      opts.category = categoryVal;
    }
    if (brandFilters.length > 0) {
      const resolvedBrands = brandFilters.map(targetBrand => {
        const selectedBrandObj = brands.find(
          b => b.slug === targetBrand || b.name === targetBrand || b.id === targetBrand || toSlug(b.slug || b.name) === toSlug(targetBrand)
        );
        return selectedBrandObj ? (selectedBrandObj.id || selectedBrandObj.slug || selectedBrandObj.name) : targetBrand;
      });
      opts.brand = resolvedBrands.join(',');
    }
    if (searchQuery) {
      opts.q = searchQuery;
    }
    if (minPriceParam) {
      opts.minPrice = Number(minPriceParam);
    }
    if (maxPriceParam) {
      opts.maxPrice = Number(maxPriceParam);
    }

    setIsLoadingProducts(true);
    try {
      const result = await fetchProducts(opts);
      const nextProducts = Array.isArray(result) ? result.filter((prod) => prod && prod.id) : [];
      const totalRows = Array.isArray(result) && typeof result._totalRows === 'number' ? result._totalRows : nextProducts.length;
      const nextTotalPages = Math.max(1, Math.ceil(totalRows / pageSize));

      if (append) {
        setAllProducts((prev) => [...prev, ...nextProducts]);
      } else {
        setAllProducts(nextProducts);
      }

      setTotalProducts(totalRows);
      setTotalPages(nextTotalPages);
      setPage(targetPage);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    // Keep previous data of allProducts to prevent jarring flashes/layout shifts
    setPage(1);
    setTotalPages(1);
    setTotalProducts(0);
    loadProductsPage(1, false);
  }, [fetchProducts, selectedCategory, brandFilters, searchQuery, sortOrder, categories, brands, minPriceParam, maxPriceParam]);

  const productGridRef = React.useRef(null);

  const handlePageChange = (targetPage) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
    loadProductsPage(targetPage, false);
    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBrandToggle = (brandSlug) => {
    const params = new URLSearchParams(searchParams);
    const currentBrands = brandParam ? brandParam.split(',') : [];
    
    // Find parent-child associations
    const parentCategories = ['niche', 'designer', 'arabian'];
    
    let updated = [...currentBrands];
    
    if (brandSlug === 'All') {
      params.delete('brand');
    } else if (parentCategories.includes(brandSlug)) {
      // Toggling a Parent Category
      if (updated.includes(brandSlug)) {
        // Uncheck parent
        updated = updated.filter(b => b !== brandSlug);
      } else {
        // Check parent
        updated.push(brandSlug);
        // Remove all child brands belonging to this parent since parent covers them all
        const parentObj = structuredBrandHierarchy.find(p => p.id === brandSlug);
        if (parentObj) {
          const childSlugs = [];
          Object.values(parentObj.ranges).forEach(rangeList => {
            rangeList.forEach(brand => {
              childSlugs.push(String(brand.slug || brand.name).toLowerCase().trim().replace(/\s+/g, '-'));
            });
          });
          updated = updated.filter(b => !childSlugs.includes(b));
        }
      }
    } else {
      // Toggling a Child Brand (brandSlug is always pre-slugified)
      if (updated.includes(brandSlug)) {
        updated = updated.filter(b => b !== brandSlug);
      } else {
        updated.push(brandSlug);
        
        // Find which parent category this child belongs to and uncheck that parent
        let foundParentId = null;
        for (const parent of structuredBrandHierarchy) {
          for (const rangeList of Object.values(parent.ranges)) {
            if (rangeList.some(brand => {
              return String(brand.slug || brand.name).toLowerCase().trim().replace(/\s+/g, '-') === brandSlug;
            })) {
              foundParentId = parent.id;
              break;
            }
          }
          if (foundParentId) break;
        }
        
        if (foundParentId && updated.includes(foundParentId)) {
          updated = updated.filter(b => b !== foundParentId);
        }
      }
    }
    
    if (updated.length > 0) {
      params.set('brand', updated.join(','));
    } else {
      params.delete('brand');
    }
    setSearchParams(params, { preventScrollReset: true });
  };

  const handleCategorySelect = (categorySlug) => {
    const params = new URLSearchParams(searchParams);
    if (categorySlug === 'All') {
      params.delete('category');
    } else {
      params.set('category', categorySlug);
    }
    setSearchParams(params, { preventScrollReset: true });
  };

  const handleClearBrands = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('brand');
    setSearchParams(params, { preventScrollReset: true });
  };

  const handlePriceRangeChange = useCallback(({ min, max }) => {
    setSearchParams(prevParams => {
      const params = new URLSearchParams(prevParams);
      let changed = false;

      if (min === priceLimits.min && max === priceLimits.max) {
        if (params.has('minPrice') || params.has('maxPrice')) {
          params.delete('minPrice');
          params.delete('maxPrice');
          changed = true;
        }
      } else {
        if (params.get('minPrice') !== String(min)) {
          params.set('minPrice', min);
          changed = true;
        }
        if (params.get('maxPrice') !== String(max)) {
          params.set('maxPrice', max);
          changed = true;
        }
      }
      return changed ? params : prevParams;
    }, { preventScrollReset: true });
  }, [setSearchParams, priceLimits.min, priceLimits.max]);

  const isLight = currentTheme === 'light';

  const selectedBrandsList = useMemo(() => {
    return brandParam ? brandParam.split(',') : [];
  }, [brandParam]);

  const renderFilterContent = () => (
    <div className="space-y-8 text-left">
      <div>
        <h3 className={`text-xs font-sans font-bold uppercase tracking-widest ${isLight ? 'text-zinc-800' : 'text-zinc-300'} mb-4 hidden lg:flex items-center gap-2`}>
          <SlidersHorizontal className="w-3.5 h-3.5 text-gold" /> Filter Collection
        </h3>
        <div className={`h-[1px] w-full ${isLight ? 'bg-zinc-200' : 'bg-gold/15'} mb-6 hidden lg:block`}></div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">Category</span>
            {selectedCategory && selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => handleCategorySelect('All')}
                className="text-[10px] uppercase tracking-wide text-gold hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            {categoryOptions.map((category) => {
              const catSlug = category.slug ? String(category.slug).toLowerCase().trim().replace(/\s+/g, '-') : category.slug;
              const isSelected = selectedCategory === category.slug || String(selectedCategory).toLowerCase().trim().replace(/\s+/g, '-') === catSlug;
              return (
                <button
                  key={category.id || category.slug}
                  onClick={() => handleCategorySelect(catSlug || category.slug)}
                  className={`w-full text-left px-4 py-3 rounded-[4px] text-xs transition-all border cursor-pointer ${
                    isSelected
                      ? 'border-gold bg-gold/10 text-gold font-semibold'
                      : `${isLight ? 'border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-black' : 'border-white/10 text-zinc-400 hover:border-gold/30 hover:text-white'}`
                  }`}
                >
                  <span>{category.name}</span>
                  {category.slug === 'All' && category.product_count !== undefined ? (
                    <span className="ml-2 text-[10px] text-zinc-500">({category.product_count})</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">Brands</span>
            {selectedBrandsList.length > 0 && (
              <button
                type="button"
                onClick={handleClearBrands}
                className="text-[10px] uppercase tracking-wide text-gold hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Selected Brand Chips */}
          {selectedBrandsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-2">
              {selectedBrandsList.map((slug) => {
                const matchedBrand = brands.find(b => (b.slug || b.name || '').toLowerCase().trim().replace(/\s+/g, '-') === slug.toLowerCase());
                const dispName = matchedBrand ? (matchedBrand.name || matchedBrand.slug) : slug;
                return (
                  <div
                    key={slug}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gold/10 border border-gold/30 text-[10px] text-gold font-sans font-medium"
                  >
                    <span>{dispName}</span>
                    <button
                      type="button"
                      onClick={() => handleBrandToggle(slug)}
                      className="hover:text-white text-gold cursor-pointer transition-colors font-bold text-xs"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            {structuredBrandHierarchy.map((parent) => {
              const isParentExpanded = expandedParents[parent.id] === true;
              const rangeKeys = Object.keys(parent.ranges);
              if (rangeKeys.length === 0) return null;

              const parentSlug = parent.id;
              const isParentSelected = selectedBrandsList.includes(parentSlug);

              return (
                <div key={parent.id} className={`border rounded-[4px] overflow-hidden ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-white/10 bg-luxury-dark/40'}`}>
                  <div className="w-full flex items-center justify-between p-2.5 text-xs font-semibold">
                    <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300 flex-1">
                      <input
                        type="checkbox"
                        checked={isParentSelected}
                        onChange={() => handleBrandToggle(parentSlug)}
                        className={`h-3.5 w-3.5 accent-gold rounded-[3px] border cursor-pointer ${isLight ? 'border-zinc-300 bg-zinc-50' : 'border-white/10 bg-luxury-dark'}`}
                      />
                      <span className="text-gold font-semibold select-none">{parent.name}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleParent(parent.id)}
                      className="px-2 text-zinc-400 font-bold hover:text-gold cursor-pointer transition-colors"
                    >
                      {isParentExpanded ? '−' : '+'}
                    </button>
                  </div>

                  {isParentExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-2">
                      {rangeKeys.map((range) => (
                        <div key={range} className="space-y-1.5">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-semibold block border-b border-white/5 pb-0.5">
                            Range {range}
                          </span>
                          <div className="space-y-1.5 pl-1">
                            {parent.ranges[range].map((brand) => {
                              const brandSlug = String(brand.slug || brand.name).toLowerCase().trim().replace(/\s+/g, '-');
                              const isChecked = selectedBrandsList.includes(brandSlug);
                              return (
                                <label key={brand.id || brand.name} className={`flex items-center gap-2.5 text-xs cursor-pointer ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleBrandToggle(brandSlug)}
                                    className={`h-3.5 w-3.5 accent-gold rounded-[3px] border cursor-pointer ${isLight ? 'border-zinc-300 bg-zinc-50' : 'border-white/10 bg-luxury-dark'}`}
                                  />
                                  <span className="truncate select-none">{brand.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pb-4">
          <PriceRangeSlider 
            minLimit={priceLimits.min}
            maxLimit={priceLimits.max}
            initialMin={minPriceParam ? Number(minPriceParam) : undefined}
            initialMax={maxPriceParam ? Number(maxPriceParam) : undefined}
            onChange={handlePriceRangeChange}
            isLight={isLight}
          />
        </div>
      </div>

      <div className={`p-5 border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-gold/15 bg-luxury-dark/30'} rounded-[4px] space-y-4`}>
        <Sparkles className="w-5 h-5 text-gold" />
        <h4 className={`text-xs font-sans font-bold uppercase tracking-wider ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>Personal Scent finder</h4>
        <p className="text-zinc-500 text-[11px] font-sans font-light leading-relaxed">
          Undecided on the perfect balance of top and heart notes? Take our 4-step sensory assessment to discover your sovereign match.
        </p>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const startQuizBtn = document.querySelector('#main-header button');
            if (startQuizBtn) startQuizBtn.click();
          }}
          className={`w-full text-center font-bold uppercase tracking-widest text-[9px] py-2.5 transition-all duration-300 rounded-[4px] cursor-pointer ${
            isLight 
              ? 'bg-black text-white hover:bg-zinc-800 border border-black' 
              : 'border border-gold/40 hover:bg-gold hover:text-black text-gold'
          }`}
        >
          Launch Assessment
        </button>
      </div>
    </div>
  );

  return (
    <div className={`py-12 sm:py-20 ${isLight ? 'bg-white text-black' : 'bg-luxury-black text-white'} animate-fade-in text-left`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className={`text-center space-y-3 mb-12 relative py-8 px-4 border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-gold/15 bg-luxury-dark/20'} rounded-sm`}>
          <h1 className={`text-2xl sm:text-4xl font-serif font-light ${isLight ? 'text-black' : 'text-luxury-white'} tracking-wide uppercase`}>
            ALL PERFUMES & DECANTS
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed px-4">
            Browse our complete collection of 100% authentic designer and niche perfume decants.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 border-r-0 lg:border-r ${isLight ? 'border-zinc-200' : 'border-gold/10'} pr-0 lg:pr-8 space-y-4 lg:space-y-8`}>
            
            {/* Mobile Filter Toggle Button */}
            <div className="block lg:hidden w-full">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-[4px] text-xs font-sans font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-800' 
                    : 'bg-[#0a0a0a] border-gold/30 text-gold hover:border-gold'
                }`}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gold" /> 
                  {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                </span>
                <span className="text-gold font-bold text-base leading-none">
                  {isFiltersOpen ? '−' : '+'}
                </span>
              </button>
            </div>

            {/* Desktop-only filter view */}
            <div className="hidden lg:block">
              {renderFilterContent()}
            </div>

            {/* Mobile collapsible filter view */}
            <AnimatePresence initial={false}>
              {isFiltersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="block lg:hidden overflow-hidden pb-4"
                >
                  <div className="pt-2">
                    {renderFilterContent()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Grid Area */}
          <div ref={productGridRef} className="lg:col-span-3 space-y-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-white/5 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                Displaying {visibleCount} of {totalProducts || visibleCount} Premium Formulations
              </span>
{/* PREV NEXT BUTTON */}
              {/* <div className="hidden lg:flex flex-1 items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="h-9 w-[6rem] rounded-sm border border-gold/20 bg-transparent text-gold text-[10px] uppercase tracking-[0.25em] font-semibold transition-all hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                  Page {page} of {totalPages}
                </span> 

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="h-9 w-[6rem] rounded-sm border border-gold/20 bg-transparent text-gold text-[10px] uppercase tracking-[0.25em] font-semibold transition-all hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div> */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                  <span>Sort</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-black border border-[#C5A059] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wide rounded-sm px-2 py-1 mr-1 outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] cursor-pointer"
                    style={{ minWidth: '8rem' }}
                  >
                    <option value="newest" className="bg-[#C5A059] text-black font-bold">Newest first</option>
                    <option value="oldest" className="bg-[#C5A059] text-black font-bold">Oldest first</option>
                    <option value="price-asc" className="bg-[#C5A059] text-black font-bold">Price low to high</option>
                    <option value="price-desc" className="bg-[#C5A059] text-black font-bold">Price high to low</option>
                  </select>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('search');
                      setSearchParams(params);
                    }}
                    className="text-[10px] uppercase tracking-widest text-gold hover:underline font-mono"
                  >
                    Clear search: "{searchQuery}"
                  </button>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-4 lg:hidden">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => handlePageChange(nextPage)}
                  isLight={isLight}
                  className="justify-center"
                />
              </div>
            )}

            {/* Loading skeleton (Only on initial load when no products are present) */}
            {isLoadingProducts && displayedProducts.length === 0 && (
              <ProductGridSkeleton count={6} />
            )}

            {/* Error state fallback */}
            {!isLoadingProducts && productsError && (
              <div className="text-center py-16 px-6 border border-amber-500/30 rounded-sm bg-amber-500/5 animate-fade-in space-y-3 my-4">
                <SlidersHorizontal className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-lg font-serif font-light text-amber-300">Unable to Load Products</h3>
                <p className="text-zinc-400 text-xs font-sans font-light max-w-sm mx-auto leading-relaxed">
                  {productsError}
                </p>
                <button
                  onClick={() => {
                    if (typeof fetchProducts === 'function') {
                      fetchProducts();
                    }
                  }}
                  className="px-5 py-2.5 bg-gold text-black font-sans font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-gold/90 transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Empty search fallback */}
            {!isLoadingProducts && !productsError && displayedProducts.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gold/15 rounded-sm bg-luxury-dark/10 animate-fade-in">
                <Search className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                <h3 className="text-lg font-serif font-light text-zinc-300 mb-2">No Products Found</h3>
                <p className="text-zinc-500 text-xs font-sans font-light max-w-xs mx-auto">
                  No products match your selected filters. Try broadening your criteria or resetting filters.
                </p>
              </div>
            )}

            {/* Perfume list with premium loader overlay */}
            {displayedProducts.length > 0 && (
              <div className="relative">
                <AnimatePresence>
                  {isLoadingProducts && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 z-10 ${isLight ? 'bg-white/40' : 'bg-black/40'} backdrop-blur-[2px] flex items-center justify-center rounded-sm`}
                    >
                      <div className={`flex flex-col items-center gap-3 border p-6 rounded-md shadow-2xl ${isLight ? 'bg-white border-zinc-200 text-black' : 'bg-luxury-dark border-gold/20 text-white'}`}>
                        {/* Premium Golden Spinner */}
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 rounded-full border-2 border-gold/20"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-t-gold animate-spin"></div>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Updating Collection...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`${gridColumnsClass} transition-all duration-300 ${isLoadingProducts ? 'opacity-40 pointer-events-none filter blur-[1px]' : ''}`}>
                  {displayedProducts.map((prod) => {
                    const currentSel = cardSelections[prod.id] || getDefaultSelection(prod);
                    return (
                      <ProductCard 
                        key={prod.id}
                        product={prod}
                        currentSel={currentSel}
                        onSizeChange={(size) => {
                          setCardSelections(prev => ({
                            ...prev,
                            [prod.id]: { ...currentSel, size }
                          }));
                        }}
                        onConcentrationChange={(concentration) => {
                          setCardSelections(prev => ({
                            ...prev,
                            [prod.id]: { ...currentSel, concentration }
                          }));
                        }}
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                        handleOpenProductDetail={handleOpenProductDetail}
                        handleAddToCart={handleAddToCart}
                        calculateItemPrice={calculateItemPrice}
                        isLargeCard={false}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-4">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => handlePageChange(nextPage)}
                  isLight={isLight}
                  className="justify-center"
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Shop;
