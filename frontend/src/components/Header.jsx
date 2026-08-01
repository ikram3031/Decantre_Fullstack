import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Heart, ShoppingBag, Search, Menu, X, ChevronDown, ChevronUp, ChevronRight, User, LogIn, Sparkles, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import SearchDropdown from './SearchDropdown';

import menuData from '../data/menuData.json';

const brandHierarchy = menuData.brandHierarchy;

export const Header = ({
  startQuiz,
  searchQuery,
  setSearchQuery,
  addToast,
  wishlist,
  cart,
  setIsCartOpen
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSelectedCategory, user, setAuthModal, currentTheme, toggleTheme, brands, categories, products, setUser } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = React.useState(false);
  const [isMobileBrandExpanded, setIsMobileBrandExpanded] = React.useState(false);
  const [isMobileCatalogExpanded, setIsMobileCatalogExpanded] = React.useState(false);
  // Dynamically compute brand hierarchy from store brands
  const dynamicBrandHierarchy = React.useMemo(() => {
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
      brands.forEach((b) => {
        const name = typeof b === 'string' ? b : (b.name || b.slug || '');
        if (!name) return;
        const brandObj = typeof b === 'object' ? b : {};
        const firstChar = name.trim().charAt(0).toUpperCase();
        const groupKey = getGroup(firstChar);
        const type = (brandObj.type || brandObj.category || '').toLowerCase();

        if (type.includes('arabian') || type.includes('uae')) {
          if (!arabianGroups[groupKey].includes(name)) arabianGroups[groupKey].push(name);
        } else if (type.includes('designer')) {
          if (!designerGroups[groupKey].includes(name)) designerGroups[groupKey].push(name);
        } else {
          if (!nicheGroups[groupKey].includes(name)) nicheGroups[groupKey].push(name);
        }
      });
    }

    // Clean empty ranges if no brands match
    const filterRanges = (groups, fallbackStatic) => {
      const res = {};
      Object.keys(groups).forEach((key) => {
        if (groups[key].length > 0) {
          groups[key].sort();
          res[key] = groups[key];
        }
      });
      return Object.keys(res).length > 0 ? res : fallbackStatic;
    };

    return {
      niche: {
        name: 'Niche Perfumes',
        ranges: filterRanges(nicheGroups, brandHierarchy.niche?.ranges || {})
      },
      designer: {
        name: 'Designer Fragrances',
        ranges: filterRanges(designerGroups, brandHierarchy.designer?.ranges || {})
      },
      arabian: {
        name: 'Arabian & UAE Fragrances',
        ranges: filterRanges(arabianGroups, brandHierarchy.arabian?.ranges || {})
      }
    };
  }, [brands]);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [logoFailed, setLogoFailed] = React.useState(false);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, [isMobileMenuOpen]);

  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // States for desktop cascading brand dropdown
  const [hoveredCategory, setHoveredCategory] = React.useState('niche');
  const [hoveredRange, setHoveredRange] = React.useState('A-K');

  // Multi-level menu drawer expand/collapse state
  const [expandedNodes, setExpandedNodes] = React.useState({
    season: false,
    shop: false,
    brand: false,
    'full-bottles': false
  });

  // Toggle a mobile menu node open or closed
  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: prev[nodeId] === undefined ? true : !prev[nodeId]
    }));
  };

  // Helper to change category and auto-select its first range
  const handleCategoryHover = (catId) => {
    setHoveredCategory(catId);
    const ranges = Object.keys(brandHierarchy[catId]?.ranges || {});
    if (ranges.length > 0) {
      setHoveredRange(ranges[0]);
    }
  };

  // States for mobile alphabetical brand lists
  const [mobileExpandedCat, setMobileExpandedCat] = React.useState(null);
  const [mobileExpandedRange, setMobileExpandedRange] = React.useState(null);

  // Build a query string from search parameters
  const buildQueryString = (params) => new URLSearchParams(params).toString();

  // Navigate to shop filtered by selected brand
  const handleBrandClick = (brandName) => {
    setActiveDropdown(null);
    navigate(`/shop?${buildQueryString({ brand: brandName })}`);
  };

  // Top search panel states
  const [isSearchPanelOpen, setIsSearchPanelOpen] = React.useState(false);
  const [localSearchVal, setLocalSearchVal] = React.useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = React.useState('');
  const [selectedSearchCategory, setSelectedSearchCategoryState] = React.useState('All');

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchVal(localSearchVal.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [localSearchVal]);

  const searchDropdownItems = React.useMemo(() => {
    const value = debouncedSearchVal.toLowerCase();
    if (!value) return [];

    return (products || [])
      .filter((product) => {
        const name = (product?.name || '').toLowerCase();
        const brand = (product?.brand || product?.brandName || '').toLowerCase();
        const description = (product?.description || '').toLowerCase();
        const tags = (product?.tags || []).join(' ').toLowerCase();
        return name.includes(value) || brand.includes(value) || description.includes(value) || tags.includes(value);
      })
      .slice(0, 6)
      .map((product) => ({
        id: product?.id || product?.slug || product?.name,
        name: product?.name || 'Product',
        subtitle: product?.brand || product?.brandName || 'Perfume',
        slug: product?.slug || product?.id || product?.name,
      }));
  }, [debouncedSearchVal, products]);

  // Typewriter suggestion text inside search placeholder
  const searchSuggestions = React.useMemo(() => [
    "Gucci Flora",
    "Bleu de Chanel",
    "Creed Aventus",
    "Baccarat Rouge 540",
    "Tom Ford Lost Cherry"
  ], []);

  const [suggestionIdx, setSuggestionIdx] = React.useState(0);
  const [placeholderText, setPlaceholderText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    let timer;
    const fullText = searchSuggestions[suggestionIdx];

    if (isDeleting) {
      timer = setTimeout(() => {
        setPlaceholderText((prev) => prev.slice(0, -1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setPlaceholderText(fullText.slice(0, placeholderText.length + 1));
      }, 100);
    }

    if (!isDeleting && placeholderText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && placeholderText === '') {
      setIsDeleting(false);
      setSuggestionIdx((prev) => (prev + 1) % searchSuggestions.length);
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, suggestionIdx, searchSuggestions]);

  // Submit the header search and navigate to the search results page
  const handlePerformSearch = (event) => {
    if (event?.preventDefault) event.preventDefault();
    const query = localSearchVal.trim();
    if (!query) return;

    setIsSearchPanelOpen(false);
    const params = new URLSearchParams();
    params.set('search', query);
    if (selectedSearchCategory !== 'All') {
      params.set('category', selectedSearchCategory);
    }
    navigate(`/search?${params.toString()}`);
  };

  // Update search input from suggestion and go to the product page if available
  const handleSuggestionSelect = (item) => {
    setLocalSearchVal(item.name);
    setIsSearchPanelOpen(false);
    if (item?.id) {
      navigate(`/product?id=${encodeURIComponent(item.id)}`);
    }
  };

  // Apply a trending search tag and close the panel
  const handleTrendingClick = (tag) => {
    setLocalSearchVal(tag);
    setIsSearchPanelOpen(false);
  };

  // Close mobile menu on click or route change
  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header id="main-header" className={`sticky top-0 z-50 transition-all duration-300 translate-y-0 ${isScrolled ? 'bg-black/95 shadow-xl border-b border-gold/35' : 'bg-black/90 backdrop-blur-md border-b border-gold/20'}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'h-16 md:h-20' : 'h-20 md:h-24'} flex items-center justify-between w-full relative`}>
        
        {/* Left Side: Decorative Icon + Menu Items + Desktop Nav Links */}
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          {/* Decorative / Menu Toggle Icon */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-gold hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-gold" /> : <Menu className="w-5 h-5 text-gold" />}
          </button>



        </div>

        {/* Center: Logo and Branding */}
        {/* Center: Logo and Branding - Absolutely Centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <Link to="/" className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            {!logoFailed ? (
              <img 
                src="https://decantrebd.com/wp-content/uploads/2026/03/decantre-color-logo-transparent.webp" 
                alt="DECANTRE" 
                className={`w-auto max-w-full object-contain transition-all duration-300 ${isScrolled ? 'h-12 md:h-16' : 'h-16 md:h-20 lg:h-22'}`}
                onError={() => setLogoFailed(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl sm:text-2xl lg:text-3xl font-serif tracking-[0.3em] text-gold font-light truncate">
                DECANTRE
              </span>
            )}
          </Link>
        </div>

        {/* Right Side: Search -> Wishlist -> Cart -> Profile/Login */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
          {/* Light/Dark mode toggle is HIDDEN as requested */}

          {/* Search Icon */}
          <button 
            onClick={() => setIsSearchPanelOpen(true)}
            className="flex p-1.5 text-gold hover:text-white transition-colors relative cursor-pointer items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gold" />
          </button>

          {/* Cart Icon */}
          <button 
            id="header-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="p-1.5 text-gold hover:text-white transition-colors relative cursor-pointer flex items-center justify-center"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-gold" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-black rounded-full text-[9px] w-4 h-4 font-bold flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Full Screen Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{ WebkitOverflowScrolling: 'touch' }} className="fixed inset-0 z-50 h-screen bg-[#080808] text-zinc-100 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain flex flex-col font-sans animate-fade-in border-l border-gold/20 shadow-2xl">
          {/* Top Bar Header */}
          <div className="border-b border-gold/20 bg-black/90 px-6 sm:px-12 py-4 flex items-center justify-between relative shrink-0">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-gold hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-gold hidden sm:inline">Close</span>
            </button>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2">
              DECANTRE
            </div>
          </div>

          <div className="w-full max-w-2xl mx-auto px-6 sm:px-10 py-6 sm:py-8 space-y-6 flex-grow min-h-0 overflow-hidden">
            {/* Search Input Bar */}
            <div className="relative flex items-center bg-black border border-white/10 rounded-sm px-4 py-3 group focus-within:border-gold/50 transition-all">
              <Search className="w-4 h-4 text-gold shrink-0 mr-3" />
              <input 
                type="text"
                placeholder="Search perfumes, brands, notes..."
                value={localSearchVal}
                onChange={(e) => setLocalSearchVal(e.value ? e.value : e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePerformSearch(e);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="w-full text-xs sm:text-sm font-light placeholder-zinc-500 bg-transparent focus:outline-none text-zinc-100"
              />
                  {/* Async search dropdown */}
                  <SearchDropdown
                    query={localSearchVal}
                    onSelect={(item) => {
                      handleSuggestionSelect(item);
                      setIsMobileMenuOpen(false);
                      setLocalSearchVal('');
                    }}
                    maxResults={6}
                  />
              {localSearchVal && (
                <button 
                  onClick={() => setLocalSearchVal('')} 
                  className="p-1 text-zinc-400 hover:text-gold text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Menu List - Exact Hierarchy match */}
            <div style={{ WebkitOverflowScrolling: 'touch' }} className="pt-2 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold/60 block mb-2 font-sans">
                NAVIGATION MENU
              </span>

              <nav className="flex flex-col space-y-2 font-sans text-xs sm:text-sm">
                {/* 1. Home */}
                <div className="bg-zinc-900/80 border border-white/10 rounded-sm overflow-hidden">
                  <button
                    onClick={() => {
                      navigate('/');
                      handleNavLinkClick();
                    }}
                    className="w-full text-left py-2.5 px-4 font-semibold text-zinc-100 hover:text-gold hover:bg-white/5 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>Home</span>
                  </button>
                </div>

                {/* 2. Season */}
                <div className="bg-zinc-900/80 border border-white/10 rounded-sm overflow-hidden">
                  <div className="w-full flex items-center justify-between py-2.5 px-4 bg-zinc-900/90 hover:bg-zinc-800/80 transition-colors">
                    <button
                      onClick={() => {
                        navigate('/season');
                        handleNavLinkClick();
                      }}
                      className="font-semibold text-zinc-100 hover:text-gold text-left cursor-pointer flex-grow"
                    >
                      Season
                    </button>
                    <button
                      onClick={() => toggleNode('season')}
                      className="p-1 text-gold hover:text-white cursor-pointer ml-2"
                    >
                      {expandedNodes['season'] ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </button>
                  </div>

                  {expandedNodes['season'] && (
                    <div className="bg-zinc-950/90 pl-4 pr-3 py-2 space-y-1 border-t border-white/5">
                      {[
                        { label: 'Summer', path: '/season?active=summer' },
                        { label: 'Fall', path: '/season?active=fall' },
                        { label: 'Winter', path: '/season?active=winter' },
                        { label: 'Spring', path: '/season?active=spring' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            handleNavLinkClick();
                          }}
                          className="w-full text-left py-2 px-3 text-xs text-zinc-300 hover:text-gold hover:bg-white/5 rounded-sm transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Combo */}
                <div className="bg-zinc-900/80 border border-gold/30 rounded-sm overflow-hidden bg-gradient-to-r from-gold/10 via-zinc-900 to-zinc-900">
                  <button
                    onClick={() => {
                      navigate('/combo');
                      handleNavLinkClick();
                    }}
                    className="w-full text-left py-2.5 px-4 font-semibold text-gold hover:text-white hover:bg-gold/20 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>Combo Sets</span>
                      <span className="text-[9px] bg-gold text-black font-extrabold px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
                        Hot
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-gold/70" />
                  </button>
                </div>

                {/* 4. Shop */}
                <div className="bg-zinc-900/80 border border-white/10 rounded-sm overflow-hidden">
                  <div className="w-full flex items-center justify-between py-2.5 px-4 bg-zinc-900/90 hover:bg-zinc-800/80 transition-colors">
                    <button
                      onClick={() => {
                        navigate('/shop');
                        handleNavLinkClick();
                      }}
                      className="font-semibold text-zinc-100 hover:text-gold text-left cursor-pointer flex-grow"
                    >
                      Shop
                    </button>
                    <button
                      onClick={() => toggleNode('shop')}
                      className="p-1 text-gold hover:text-white cursor-pointer ml-2"
                    >
                      {expandedNodes['shop'] ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </button>
                  </div>

                  {expandedNodes['shop'] && (
                    <div className="bg-zinc-950/90 pl-4 pr-3 py-2 space-y-1 border-t border-white/5">
                      {[
                        { label: 'For Him', path: '/shop?category=for-him' },
                        { label: 'For Her', path: '/shop?category=for-her' },
                        { label: 'Unisex', path: '/shop?category=unisex' },
                        { label: 'Miniatures', path: '/shop?category=miniatures' },
                        { label: 'Decant Accessories', path: '/shop?category=decant-accessories' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            handleNavLinkClick();
                          }}
                          className="w-full text-left py-2 px-3 text-xs text-zinc-300 hover:text-gold hover:bg-white/5 rounded-sm transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Brand */}
                <div className="bg-zinc-900/80 border border-white/10 rounded-sm overflow-hidden">
                  <div className="w-full flex items-center justify-between py-2.5 px-4 bg-zinc-900/90 hover:bg-zinc-800/80 transition-colors">
                    <button
                      onClick={() => {
                        navigate('/atelier');
                        handleNavLinkClick();
                      }}
                      className="font-semibold text-zinc-100 hover:text-gold text-left cursor-pointer flex-grow"
                    >
                      Brand
                    </button>
                    <button
                      onClick={() => toggleNode('brand')}
                      className="p-1 text-gold hover:text-white cursor-pointer ml-2"
                    >
                      {expandedNodes['brand'] ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </button>
                  </div>

                  {expandedNodes['brand'] && (
                    <div className="bg-zinc-950/90 pl-3 pr-2 py-2 space-y-2 border-t border-white/5">
                      {Object.keys(dynamicBrandHierarchy).map((catId) => {
                        const cat = dynamicBrandHierarchy[catId];
                        const isCatExpanded = expandedNodes[`brand-${catId}`] !== false; // default open
                        return (
                          <div key={catId} className="bg-zinc-900/50 border border-white/5 rounded-sm overflow-hidden">
                            <div className="w-full flex items-center justify-between py-2 px-3 bg-zinc-900/90 hover:bg-zinc-800/90 transition-colors">
                                <button
                                  onClick={() => {
                                    navigate(`/shop?${buildQueryString({ brand: cat.name.toLowerCase() })}`);
                                    handleNavLinkClick();
                                  }}
                                  className="text-xs font-semibold text-zinc-200 hover:text-gold text-left cursor-pointer flex-grow flex items-center justify-between pr-2"
                                >
                                  <span>{cat.name}</span>
                                </button>
                              <button
                                onClick={() => toggleNode(`brand-${catId}`)}
                                className="p-1 text-zinc-400 hover:text-gold cursor-pointer"
                              >
                                {isCatExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gold" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                              </button>
                            </div>

                            {isCatExpanded && (
                              <div className="pl-3 pr-2 py-2 space-y-2 bg-black/40 border-t border-white/5">
                                {Object.keys(cat.ranges).map((range) => {
                                  const rangeKey = `brand-${catId}-${range}`;
                                  const isRangeExpanded = expandedNodes[rangeKey] !== false;
                                  return (
                                    <div key={range} className="bg-zinc-950/70 border border-white/5 rounded-sm overflow-hidden">
                                      <div className="w-full flex items-center justify-between py-1.5 px-3 bg-zinc-900/60">
                                          <button
                                            onClick={() => toggleNode(rangeKey)}
                                            className="text-[11px] font-semibold text-gold/90 hover:text-gold text-left cursor-pointer flex-grow flex items-center justify-between pr-2"
                                          >
                                            <span>{range}</span>
                                          </button>
                                        <button
                                          onClick={() => toggleNode(rangeKey)}
                                          className="p-1 text-zinc-400 cursor-pointer"
                                        >
                                          {isRangeExpanded ? <ChevronUp className="w-3 h-3 text-gold" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />}
                                        </button>
                                      </div>

                                      {isRangeExpanded && (
                                        <div className="pl-3 pr-2 py-1.5 flex flex-col gap-1 bg-black/60 border-t border-white/5">
                                          {cat.ranges[range].map((brandName) => (
                                            <button
                                              key={brandName}
                                              onClick={() => {
                                                handleBrandClick(brandName);
                                                handleNavLinkClick();
                                              }}
                                              className="w-full text-left py-1 px-2 text-[11px] text-zinc-300 hover:text-gold hover:bg-white/5 rounded-xs transition-colors flex items-center justify-between cursor-pointer font-sans"
                                            >
                                              <span>{brandName}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 5. Full Bottles */}
                <div className="bg-zinc-900/80 border border-white/10 rounded-sm overflow-hidden">
                  <div className="w-full flex items-center justify-between py-2.5 px-4 bg-zinc-900/90 hover:bg-zinc-800/80 transition-colors">
                    <button
                      onClick={() => {
                        navigate('/shop?category=Full Bottles');
                        handleNavLinkClick();
                      }}
                      className="font-semibold text-zinc-100 hover:text-gold text-left cursor-pointer flex-grow"
                    >
                      Full Bottles
                    </button>
                    <button
                      onClick={() => toggleNode('full-bottles')}
                      className="p-1 text-gold hover:text-white cursor-pointer ml-2"
                    >
                      {expandedNodes['full-bottles'] ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </button>
                  </div>

                  {expandedNodes['full-bottles'] && (
                    <div className="bg-zinc-950/90 pl-4 pr-3 py-2 space-y-1 border-t border-white/5">
                      {[
                        { label: 'Niche Intacts', path: '/shop?category=Niche Intacts' },
                        { label: 'Designer Intacts', path: '/shop?category=Designer Intacts' },
                        { label: 'Arabian Intacts', path: '/shop?category=Arabian Intacts' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            handleNavLinkClick();
                          }}
                          className="w-full text-left py-2 px-3 text-xs text-zinc-300 hover:text-gold hover:bg-white/5 rounded-sm transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="text-[10px] text-zinc-500 font-mono italic">sub item</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* WISHLIST BUTTON */}
                <button
                  onClick={() => {
                    navigate('/wishlist');
                    handleNavLinkClick();
                  }}
                  className="mt-2 text-left py-2.5 px-3.5 bg-white/5 hover:bg-gold/10 hover:text-gold border border-white/5 hover:border-gold/30 rounded-sm transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-serif tracking-widest text-xs sm:text-sm">
                    <Heart className="w-4 h-4 text-gold" />
                    WISHLIST
                  </span>
                  {wishlist.length > 0 ? (
                    <span className="bg-gold text-black rounded-full text-[10px] px-2.5 py-0.5 font-bold">
                      {wishlist.length} ITEMS
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-[10px]">EMPTY</span>
                  )}
                </button>

                {/* USER PROFILE OR LOGIN / REGISTER */}
                {user ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        navigate('/account');
                        handleNavLinkClick();
                      }}
                      className="w-full text-left py-2.5 px-3.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gold" />
                      <span className="flex-1 min-w-0 font-serif tracking-widest text-xs sm:text-sm truncate">MY ACCOUNT</span>
                      {/* <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-gold text-black font-bold ml-2">{user.tier}</span> */}
                    </button>

                    <button
                      onClick={() => {
                        setUser(null);
                        if (addToast) addToast('You have been signed out.', 'info');
                        handleNavLinkClick();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-transparent border border-white/10 rounded-sm text-gold hover:text-white hover:bg-white/5 transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4 text-gold" />
                      <span className="text-[11px] uppercase tracking-widest">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 pb-2 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setAuthModal(true, 'login');
                          handleNavLinkClick();
                        }}
                        className="py-2.5 text-center border border-gold/40 bg-black text-gold hover:bg-gold hover:text-black text-[11px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer rounded-sm"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setAuthModal(true, 'register');
                          handleNavLinkClick();
                        }}
                        className="py-2.5 text-center bg-gold text-black hover:bg-gold/80 text-[11px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer border-none rounded-sm"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Sliding Search Panel Overlay */}
      <AnimatePresence>
        {isSearchPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed top-0 inset-x-0 bg-[#0a0a0a] text-zinc-100 z-50 shadow-[0_15px_40px_rgba(0,0,0,0.85)] py-6 sm:py-8 px-4 sm:px-6 border-b border-gold/30"
          >
            <div className="max-w-4xl mx-auto relative pt-2">
              {/* Header inside search panel */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-[0.25em] font-serif text-gold font-semibold">
                  Search Fragrances
                </span>
                <button 
                  onClick={() => setIsSearchPanelOpen(false)}
                  className="p-1.5 text-gold hover:text-white hover:bg-gold/10 border border-gold/40 rounded-full transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Form Row */}
              <div className="flex flex-row items-stretch border border-gold/40 rounded-sm shadow-lg relative">
                {/* Search Input */}
                <div className="relative flex-grow flex items-center bg-black rounded-l-sm">
                  <input 
                    type="text"
                    placeholder={`Search "${placeholderText || 'Search'}"...`}
                    value={localSearchVal}
                    onChange={(e) => setLocalSearchVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePerformSearch(e);
                      }
                    }}
                    className="w-full px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-sans font-light placeholder-zinc-500 focus:outline-none bg-black text-zinc-100 border-none rounded-l-sm no-outline-search"
                  />
                </div>

                <SearchDropdown
                  query={localSearchVal}
                  onSelect={(item) => {
                    handleSuggestionSelect(item);
                    setIsSearchPanelOpen(false);
                    setLocalSearchVal('');
                  }}
                  maxResults={6}
                />

                {/* Search Button */}
                <button
                  type="button"
                  onClick={(e) => handlePerformSearch(e)}
                  className="bg-gold hover:bg-gold/80 text-black transition-all px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] font-sans font-bold cursor-pointer shrink-0 border-none rounded-r-sm"
                >
                  <Search className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


