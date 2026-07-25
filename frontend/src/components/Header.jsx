import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Heart, ShoppingBag, Search, Menu, X, ChevronDown, ChevronUp, ChevronRight, User, LogIn, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
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
  const { setSelectedCategory, user, setAuthModal, currentTheme, toggleTheme } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = React.useState(false);
  const [isMobileBrandExpanded, setIsMobileBrandExpanded] = React.useState(false);
  const [isMobileCatalogExpanded, setIsMobileCatalogExpanded] = React.useState(false);
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

  const handleBrandClick = (brandName) => {
    setActiveDropdown(null);
    navigate(`/shop?brand=${encodeURIComponent(brandName)}`);
  };

  // Top search panel states
  const [isSearchPanelOpen, setIsSearchPanelOpen] = React.useState(false);
  const [localSearchVal, setLocalSearchVal] = React.useState('');
  const [selectedSearchCategory, setSelectedSearchCategoryState] = React.useState('All');

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

  const handlePerformSearch = () => {
    setIsSearchPanelOpen(false);
    let url = `/shop?search=${encodeURIComponent(localSearchVal)}`;
    if (selectedSearchCategory !== 'All') {
      url += `&category=${encodeURIComponent(selectedSearchCategory)}`;
    }
    navigate(url);
  };

  const handleTrendingClick = (tag) => {
    setLocalSearchVal(tag);
    setIsSearchPanelOpen(false);
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
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
            className="hidden sm:flex p-1.5 text-gold hover:text-white transition-colors relative cursor-pointer items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gold" />
          </button>

          {/* Wishlist Icon */}
          <button 
            onClick={() => navigate('/wishlist')}
            className="hidden sm:flex p-1.5 text-gold hover:text-white transition-colors relative cursor-pointer items-center justify-center"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 text-gold ${wishlist.length > 0 ? 'fill-gold' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-black rounded-full text-[9px] w-4 h-4 font-bold flex items-center justify-center shadow-md animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon - Replaced with pure Bag Icon, no text, no button background */}
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

          {/* Profile / Login Icon Next to Cart (Login icon in same gold color if not logged in) */}
          {user ? (
            <button 
              onClick={() => setAuthModal(true, 'profile')}
              className="hidden sm:flex p-1.5 text-gold hover:text-white transition-colors relative cursor-pointer items-center justify-center"
              title={`Profile (${user.name})`}
              aria-label="User Profile"
            >
              <User className="w-5 h-5 text-gold" />
            </button>
          ) : (
            <button 
              onClick={() => setAuthModal(true, 'login')}
              className="hidden sm:flex p-1.5 text-gold hover:text-white transition-colors relative cursor-pointer items-center justify-center"
              title="Login"
              aria-label="User Login"
            >
              <LogIn className="w-5 h-5 text-gold" />
            </button>
          )}
        </div>
      </div>

      {/* Full Screen Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#080808] text-zinc-100 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-h-screen flex flex-col font-sans animate-fade-in border-l border-gold/20 shadow-2xl">
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

            <span className="absolute left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] font-serif text-gold font-semibold">
              DECANTRE MENU
            </span>
          </div>

          <div className="w-full max-w-2xl mx-auto px-6 sm:px-10 py-6 sm:py-8 space-y-6 flex-grow">
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
                    handlePerformSearch();
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="w-full text-xs sm:text-sm font-light placeholder-zinc-500 bg-transparent focus:outline-none text-zinc-100"
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
            <div className="pt-2 space-y-2">
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
                          <span className="text-[10px] text-zinc-500 font-mono italic">sub item</span>
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
                        { label: 'For Him', path: '/shop?category=For Him' },
                        { label: 'For Her', path: '/shop?category=For Her' },
                        { label: 'Unisex', path: '/shop?category=Unisex' },
                        { label: 'Miniatures', path: '/shop?category=Miniatures' },
                        { label: 'Decant Accessories', path: '/shop?category=Decant Accessories' }
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
                      {Object.keys(brandHierarchy).map((catId) => {
                        const cat = brandHierarchy[catId];
                        const isCatExpanded = expandedNodes[`brand-${catId}`] !== false; // default open
                        return (
                          <div key={catId} className="bg-zinc-900/50 border border-white/5 rounded-sm overflow-hidden">
                            <div className="w-full flex items-center justify-between py-2 px-3 bg-zinc-900/90 hover:bg-zinc-800/90 transition-colors">
                              <button
                                onClick={() => {
                                  navigate(`/shop?search=${encodeURIComponent(cat.name)}`);
                                  handleNavLinkClick();
                                }}
                                className="text-xs font-semibold text-zinc-200 hover:text-gold text-left cursor-pointer flex-grow flex items-center justify-between pr-2"
                              >
                                <span>{cat.name}</span>
                                <span className="text-[10px] text-zinc-500 font-mono italic font-normal">sub item</span>
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
                                          <span className="text-[10px] text-zinc-500 font-mono italic font-normal">sub item</span>
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
                                              <span className="text-[9px] text-zinc-500 font-mono italic">sub item</span>
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
                  <button 
                    onClick={() => {
                      setAuthModal(true, 'profile');
                      handleNavLinkClick();
                    }} 
                    className="text-left py-2.5 px-3.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-sm transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-serif tracking-widest text-xs sm:text-sm">
                      <User className="w-4 h-4 text-gold" />
                      MY ACCOUNT ({user.name})
                    </span>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-gold text-black font-bold">
                      {user.tier}
                    </span>
                  </button>
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
            className="fixed top-0 inset-x-0 bg-[#0a0a0a] text-zinc-100 z-50 shadow-[0_15px_40px_rgba(0,0,0,0.85)] py-8 sm:py-12 px-4 sm:px-6 border-b border-gold/30"
          >
            <div className="max-w-4xl mx-auto relative">
              {/* Close Button */}
              <button 
                onClick={() => setIsSearchPanelOpen(false)}
                className="absolute top-[-10px] sm:top-[-16px] right-1 sm:right-0 p-2 text-gold hover:text-white hover:bg-gold/10 border border-gold/40 rounded-full transition-colors cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </button>

              <div className="max-w-3xl mx-auto pt-2 sm:pt-4">
                {/* Form Row */}
                <div className="flex flex-row items-stretch border border-gold/40 focus-within:border-gold rounded-sm overflow-hidden shadow-lg">
                  {/* Search Input */}
                  <div className="relative flex-grow flex items-center bg-black">
                    <input 
                      type="text"
                      placeholder={`Search "${placeholderText || 'Search'}"...`}
                      value={localSearchVal}
                      onChange={(e) => setLocalSearchVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePerformSearch();
                        }
                      }}
                      className="w-full px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-sans font-light placeholder-zinc-500 focus:outline-none bg-black text-zinc-100 border-none"
                    />
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={handlePerformSearch}
                    className="bg-gold hover:bg-gold/80 text-black transition-all px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] font-sans font-bold cursor-pointer shrink-0 border-none"
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


