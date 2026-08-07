import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { useApp } from '../core/context/AppContext';
import { formatBDT } from '../core/utils/formatCurrency';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { getDefaultSelection } from '../core/store/productHelpers';


export const SearchResults = () => {
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
  const searchParam = searchParams.get('search');

  const [isLoadingProducts, setIsLoadingProducts] = React.useState(false);
  const [allProducts, setAllProducts] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalProducts, setTotalProducts] = React.useState(0);
  const pageSize = 20;
  const visibleCount = Math.min(allProducts.length, totalProducts || allProducts.length);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam, setSelectedCategory]);

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
    }
  }, [searchParam, setSearchQuery]);

  const loadProductsPage = async (targetPage = 1) => {
    if (typeof fetchProducts !== 'function') return;

    const opts = {
      skip: (targetPage - 1) * pageSize,
      limit: pageSize,
      sortBy: 'createdAt',
      order: 'desc'
    };

    if (selectedCategory && selectedCategory !== 'All') {
      opts.category = selectedCategory;
    }
    if (searchQuery) {
      opts.q = searchQuery;
    }

    setIsLoadingProducts(true);
    try {
      const result = await fetchProducts(opts);
      const nextProducts = Array.isArray(result) ? result.filter((prod) => prod && prod.id) : [];
      const totalRows = Array.isArray(result) && typeof result._totalRows === 'number' ? result._totalRows : nextProducts.length;
      const nextTotalPages = Math.max(1, Math.ceil(totalRows / pageSize));

      setAllProducts(nextProducts);
      setTotalProducts(totalRows);
      setTotalPages(nextTotalPages);
      setPage(targetPage);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    setAllProducts([]);
    setPage(1);
    setTotalPages(1);
    setTotalProducts(0);
    loadProductsPage(1);
  }, [fetchProducts, selectedCategory, searchQuery]);

  const isLight = currentTheme === 'light';

  return (
    <div className={`py-12 sm:py-20 ${isLight ? 'bg-white text-black' : 'bg-luxury-black text-white'} animate-fade-in text-left`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center space-y-4 mb-12 relative py-8 px-4 border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-gold/15 bg-luxury-dark/20'} rounded-sm`}>
          <div className="flex items-center justify-center gap-2 text-gold mx-auto">
            <Search className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Search Results</span>
          </div>
          <h1 className={`text-2xl sm:text-4xl font-serif font-light ${isLight ? 'text-black' : 'text-luxury-white'} tracking-wide uppercase`}>
            {searchQuery ? `Search results for “${searchQuery}”` : 'Search the collection'}
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed px-4">
            {searchQuery
              ? `Showing ${visibleCount} product${visibleCount === 1 ? '' : 's'} matching “${searchQuery}”. Use the filters below to narrow your selection.`
              : 'Enter a search term in the header to find your favorite fragrance, brand, or note.'}
          </p>
        </div>

        {isLoadingProducts && <ProductGridSkeleton count={6} />}

        {!isLoadingProducts && productsError && (
          <div className="text-center py-16 px-6 border border-amber-500/30 rounded-sm bg-amber-500/5 animate-fade-in space-y-3 my-4">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-serif font-light text-amber-300">Unable to Load Products</h3>
            <p className="text-zinc-400 text-xs font-sans font-light max-w-sm mx-auto leading-relaxed">
              {productsError}
            </p>
          </div>
        )}

        {!isLoadingProducts && !productsError && allProducts.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gold/15 rounded-sm bg-luxury-dark/10 animate-fade-in">
            <Search className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-light text-zinc-300 mb-2">No Results Found</h3>
            <p className="text-zinc-500 text-xs font-sans font-light max-w-xs mx-auto">
              Try a broader search term or remove filters to see more products.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {!isLoadingProducts && allProducts.map((prod) => {
            const currentSel = cardSelections[prod.id] || getDefaultSelection(prod);
            return (
              <ProductCard
                key={prod.id}
                product={prod}
                currentSel={currentSel}
                onSizeChange={(size) => {
                  setCardSelections((prev) => ({
                    ...prev,
                    [prod.id]: { ...currentSel, size }
                  }));
                }}
                onConcentrationChange={(concentration) => {
                  setCardSelections((prev) => ({
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
    </div>
  );
};
