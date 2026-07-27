import { create } from 'zustand';
import { 
  fetchProducts as apiFetchProducts, 
  fetchCategories as apiFetchCategories, 
  fetchBrands as apiFetchBrands, 
  fetchProductDetails as apiFetchProductDetails,
  fetchCombos as apiFetchCombos,
  createOrder as apiCreateOrder 
} from '../lib/api';

const parseQuery = (queryString) => {
  const params = {};
  if (!queryString) return params;
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, val] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(val || '');
    }
  }
  return params;
};

export const useAppStore = create((set, get) => {
  // Load initial cached values safely
  const initialCart = (() => {
    try {
      const cached = localStorage.getItem('luxury_cart');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error('Error parsing cart cache', e);
      return [];
    }
  })();

  const initialWishlist = (() => {
    try {
      const cached = localStorage.getItem('luxury_wishlist');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error('Error parsing wishlist cache', e);
      return [];
    }
  })();

  const initialUser = (() => {
    try {
      const cached = localStorage.getItem('luxury_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.error('Error parsing user cache', e);
      return null;
    }
  })();

  return {
    // Dynamic lists populated exclusively from backend API
    products: [],
    categories: (() => {
      try {
        const cached = localStorage.getItem('luxury_categories');
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    })(),
    brands: (() => {
      try {
        const cached = localStorage.getItem('luxury_brands');
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    })(),
    combos: [],

    isProductsLoading: false,
    productsError: null,

    isCategoriesLoading: false,
    categoriesError: null,

    isBrandsLoading: false,
    brandsError: null,

    isCombosLoading: false,
    combosError: null,

    setProducts: (newProducts) => set({ products: newProducts }),
    setCategories: (newCategories) => set({ categories: newCategories }),
    setBrands: (newBrands) => set({ brands: newBrands }),
    setCombos: (newCombos) => set({ combos: newCombos }),

    fetchProducts: async (opts = {}) => {
      set({ isProductsLoading: true, productsError: null });
      try {
        const mapped = await apiFetchProducts(opts);
        set({ products: mapped, isProductsLoading: false, productsError: null });
        return mapped;
      } catch (err) {
        set({ isProductsLoading: false, productsError: 'Something went wrong' });
        return [];
      }
    },

    fetchProductDetails: async (slugOrId) => {
      try {
        return await apiFetchProductDetails(slugOrId);
      } catch (err) {
        return null;
      }
    },

    fetchCategories: async (opts = {}) => {
      set({ isCategoriesLoading: true, categoriesError: null });
      try {
        const list = await apiFetchCategories(opts);
        set({ categories: list, isCategoriesLoading: false, categoriesError: null });
        try {
          localStorage.setItem('luxury_categories', JSON.stringify(list));
        } catch (_) {}
        return list;
      } catch (err) {
        set({ isCategoriesLoading: false, categoriesError: 'Something went wrong' });
        return [];
      }
    },

    fetchBrands: async (opts = {}) => {
      set({ isBrandsLoading: true, brandsError: null });
      try {
        const list = await apiFetchBrands(opts);
        set({ brands: list, isBrandsLoading: false, brandsError: null });
        try {
          localStorage.setItem('luxury_brands', JSON.stringify(list));
        } catch (_) {}
        return list;
      } catch (err) {
        set({ isBrandsLoading: false, brandsError: 'Something went wrong' });
        return [];
      }
    },

    fetchCombos: async (opts = {}) => {
      set({ isCombosLoading: true, combosError: null });
      try {
        const list = await apiFetchCombos(opts);
        set({ combos: list, isCombosLoading: false, combosError: null });
        return list;
      } catch (err) {
        set({ isCombosLoading: false, combosError: 'Something went wrong' });
        return [];
      }
    },
    // 1. Core States
    currentSlide: 0,
    selectedCategory: 'All',
    searchQuery: '',
    cart: initialCart,
    isCartOpen: false,
    wishlist: initialWishlist,
    user: initialUser,
    isAuthModalOpen: false,
    authModalMode: 'login', // 'login' | 'register' | 'profile'

    cardSelections: {
      'oud-imperial': { size: '100ml', concentration: 'Eau de Parfum' },
      'nectar-de-saphir': { size: '100ml', concentration: 'Eau de Parfum' },
      'saffron-mystique': { size: '100ml', concentration: 'Eau de Parfum' },
      'bergamote-sauvage': { size: '100ml', concentration: 'Eau de Parfum' },
      'ambre-nuit': { size: '100ml', concentration: 'Eau de Parfum' },
      'rose-absolue': { size: '100ml', concentration: 'Eau de Parfum' },
    },

    selectedProduct: null,
    modalSize: '100ml',
    modalConcentration: 'Eau de Parfum',

    isQuizOpen: false,
    quizStep: 1,
    quizAnswers: {},
    quizRecommendation: null,

    isCheckoutMode: false,
    promoCode: '',
    appliedDiscount: 0,
    promoError: '',
    paymentMethod: 'cod',
    sameAsBilling: true,
    shippingZone: 'inside-dhaka',
    shippingAddress: {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      thana: '',
      district: '',
      zip: ''
    },
    shippingInfo: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      thana: '',
      district: '',
      zip: '',
      giftWrap: false
    },
    paymentDetails: {
      bkashNumber: '',
      bkashTxnId: '',
      bkashAmount: '',
      nagadNumber: '',
      nagadTxnId: '',
      nagadAmount: '',
      bankAccountNumber: '',
      bankName: '',
      bankAmount: ''
    },
    orderCompleted: false,
    isProcessingOrder: false,
    orderNumber: null,
    toasts: [],
    currentTheme: localStorage.getItem('luxury_theme') || 'dark',

    // 2. Direct State Setters
    toggleTheme: () => set((state) => {
      const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('luxury_theme', nextTheme);
      return { currentTheme: nextTheme };
    }),
    setCurrentSlide: (slide) => set((state) => ({
      currentSlide: typeof slide === 'function' ? slide(state.currentSlide) : slide
    })),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCart: (cart) => {
      set({ cart });
      localStorage.setItem('luxury_cart', JSON.stringify(cart));
    },
    setIsCartOpen: (isOpen) => set((state) => ({
      isCartOpen: typeof isOpen === 'function' ? isOpen(state.isCartOpen) : isOpen
    })),
    accessToken: localStorage.getItem('luxury_access_token') || null,
    refreshToken: localStorage.getItem('luxury_refresh_token') || null,
    setTokens: (accessToken, refreshToken) => {
      set({ accessToken, refreshToken });
      if (accessToken) {
        localStorage.setItem('luxury_access_token', accessToken);
      } else {
        localStorage.removeItem('luxury_access_token');
      }
      if (refreshToken) {
        localStorage.setItem('luxury_refresh_token', refreshToken);
      } else {
        localStorage.removeItem('luxury_refresh_token');
      }
    },
    setUser: (user, tokens = null) => {
      set({ user });
      if (user) {
        localStorage.setItem('luxury_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('luxury_user');
      }
      if (tokens) {
        get().setTokens(tokens.accessToken, tokens.refreshToken);
      } else if (user === null) {
        get().setTokens(null, null);
      }
    },
    setAuthModal: (isOpen, mode = 'login') => set({
      isAuthModalOpen: isOpen,
      authModalMode: mode
    }),
    setWishlist: (wishlist) => {
      set({ wishlist });
      localStorage.setItem('luxury_wishlist', JSON.stringify(wishlist));
    },
    setCardSelections: (updater) => set((state) => {
      const nextSelections = typeof updater === 'function' ? updater(state.cardSelections) : updater;
      return { cardSelections: nextSelections };
    }),
    setSelectedProduct: (product) => set({ selectedProduct: product }),
    setModalSize: (size) => set({ modalSize: size }),
    setModalConcentration: (concentration) => set({ modalConcentration: concentration }),
    setIsQuizOpen: (isOpen) => set((state) => ({
      isQuizOpen: typeof isOpen === 'function' ? isOpen(state.isQuizOpen) : isOpen
    })),
    setQuizStep: (step) => set({ quizStep: step }),
    setQuizAnswers: (answers) => set({ quizAnswers: answers }),
    setQuizRecommendation: (recommendation) => set({ quizRecommendation: recommendation }),
    setIsCheckoutMode: (isCheckout) => set((state) => ({
      isCheckoutMode: typeof isCheckout === 'function' ? isCheckout(state.isCheckoutMode) : isCheckout
    })),
    setPromoCode: (code) => set({ promoCode: code }),
    setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
    setPromoError: (error) => set({ promoError: error }),
    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setSameAsBilling: (same) => set({ sameAsBilling: same }),
    setShippingZone: (zone) => set({ shippingZone: zone }),
    setShippingAddress: (updater) => set((state) => {
      const nextAddress = typeof updater === 'function' ? updater(state.shippingAddress) : updater;
      return { shippingAddress: nextAddress };
    }),
    setShippingInfo: (updater) => set((state) => {
      const nextInfo = typeof updater === 'function' ? updater(state.shippingInfo) : updater;
      return { shippingInfo: nextInfo };
    }),
    setPaymentDetails: (updater) => set((state) => {
      const nextDetails = typeof updater === 'function' ? updater(state.paymentDetails) : updater;
      return { paymentDetails: nextDetails };
    }),
    setOrderCompleted: (completed) => set({ orderCompleted: completed }),
    setIsProcessingOrder: (isProcessing) => set({ isProcessingOrder: isProcessing }),
    setToasts: (updater) => set((state) => {
      const nextToasts = typeof updater === 'function' ? updater(state.toasts) : updater;
      return { toasts: nextToasts };
    }),

    // 3. Helper Actions
    saveCart: (newCart) => {
      set({ cart: newCart });
      localStorage.setItem('luxury_cart', JSON.stringify(newCart));
    },

    saveWishlist: (newWishlist) => {
      set({ wishlist: newWishlist });
      localStorage.setItem('luxury_wishlist', JSON.stringify(newWishlist));
    },

    addToast: (text, type = 'success') => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      // Keep only the latest toast on screen to prevent annoyance from simultaneous messages
      set({ toasts: [{ id, text, type }] });
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      }, 2200);
    },

    calculateItemPrice: (basePrice, size, concentration) => {
      let finalPrice = basePrice;
      if (size === '50ml') {
        finalPrice = basePrice * 0.75;
      } else if (size === '200ml') {
        finalPrice = basePrice * 1.6;
      }
      if (concentration === 'Extrait de Parfum') {
        finalPrice += 60;
      }
      return Math.round(finalPrice);
    },

    handleAddToCart: (product, size, concentration, qty = 1) => {
      const unitPrice = get().calculateItemPrice(product.basePrice, size, concentration);
      const cart = get().cart;
      const existingIndex = cart.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.concentration === concentration
      );

      let newCart = [...cart];
      if (existingIndex > -1) {
        newCart[existingIndex].quantity += qty;
      } else {
        newCart.push({
          id: `${product.id}-${size}-${concentration.replace(/\s+/g, '')}`,
          product,
          size,
          concentration,
          quantity: qty,
          unitPrice
        });
      }

      get().saveCart(newCart);
      get().addToast(`Added ${qty}x ${product.name} (${size} - ${concentration}) to your cart.`, 'success');
    },

    handleAddComboToCart: (combo, qty = 1) => {
      const cart = get().cart;
      const comboId = `combo-${combo.id}`;
      const existingIndex = cart.findIndex((item) => item.id === comboId);

      let newCart = [...cart];
      if (existingIndex > -1) {
        newCart[existingIndex].quantity += qty;
      } else {
        newCart.push({
          id: comboId,
          product: {
            id: combo.id,
            name: combo.name,
            image: combo.image || (combo.items && combo.items[0] && combo.items[0].image) || '',
            category: 'Combo Set',
            brand: combo.brand || 'Decantre Curated Bundle',
            isCombo: true
          },
          size: 'Full Combo Set',
          concentration: `${combo.items ? combo.items.length : 3} Items Included`,
          quantity: qty,
          unitPrice: combo.comboPrice,
          comboItems: combo.items || []
        });
      }

      get().saveCart(newCart);
      get().addToast(`Added "${combo.name}" Combo Bundle to your cart!`, 'success');
    },

    handleUpdateQty: (itemId, change) => {
      const cart = get().cart;
      const newCart = cart.map((item) => {
        if (item.id === itemId) {
          const nextQty = item.quantity + change;
          return { ...item, quantity: Math.max(1, nextQty) };
        }
        return item;
      });
      get().saveCart(newCart);
    },

    handleRemoveFromCart: (itemId) => {
      const cart = get().cart;
      const item = cart.find((i) => i.id === itemId);
      const newCart = cart.filter((i) => i.id !== itemId);
      get().saveCart(newCart);
      if (item) {
        get().addToast(`Removed ${item.product.name} from your cart.`, 'info');
      }
    },

    toggleWishlist: (productId) => {
      const wishlist = get().wishlist;
      let newWishlist = [...wishlist];
      if (newWishlist.includes(productId)) {
        newWishlist = newWishlist.filter((id) => id !== productId);
        get().addToast('Removed fragrance from your collection favorites.', 'info');
      } else {
        newWishlist.push(productId);
        get().addToast('Added fragrance to your collection favorites.', 'success');
      }
      get().saveWishlist(newWishlist);
    },

    startQuiz: () => {
      set({
        quizStep: 1,
        quizAnswers: {},
        quizRecommendation: null,
        isQuizOpen: true
      });
    },

    handleQuizAnswer: (question, answer) => {
      const currentAnswers = get().quizAnswers;
      const updated = { ...currentAnswers, [question]: answer };
      set({ quizAnswers: updated });
      
      const step = get().quizStep;
      if (step < 3) {
        set({ quizStep: step + 1 });
      } else {
        // Find recommendation
        const allProducts = get().products || [];
        let bestMatch = allProducts[0];
        const gender = updated['gender'];
        const family = updated['family'];

        if (gender === 'Him') {
          if (family === 'Fresh') bestMatch = allProducts.find(p => p.id === 'bergamote-sauvage') || allProducts[3];
          else bestMatch = allProducts.find(p => p.id === 'oud-imperial') || allProducts[0];
        } else if (gender === 'Her') {
          if (family === 'Floral' || family === 'Fresh') bestMatch = allProducts.find(p => p.id === 'rose-absolue') || allProducts[5];
          else bestMatch = allProducts.find(p => p.id === 'nectar-de-saphir') || allProducts[1];
        } else {
          if (family === 'Warm' || family === 'Woody') bestMatch = allProducts.find(p => p.id === 'saffron-mystique') || allProducts[2];
          else bestMatch = allProducts.find(p => p.id === 'ambre-nuit') || allProducts[4];
        }

        set({
          quizRecommendation: bestMatch,
          quizStep: 4
        });
      }
    },

    handleCheckoutSubmit: async (e) => {
      if (e) e.preventDefault();
      const cart = get().cart;
      const shippingInfo = get().shippingInfo;
      const paymentMethod = get().paymentMethod;
      const sameAsBilling = get().sameAsBilling;
      const shippingAddress = get().shippingAddress;
      const paymentDetails = get().paymentDetails;
      if (cart.length === 0) return;

      const requiredBilling = [
        shippingInfo.fullName,
        shippingInfo.phone,
        shippingInfo.email,
        shippingInfo.address,
        shippingInfo.district
      ];

      if (requiredBilling.some((field) => !field || !field.trim())) {
        get().addToast('Please complete required billing fields: Name, Phone, Email, Address, District.', 'error');
        return;
      }

      if (paymentMethod !== 'instore' && !sameAsBilling) {
        if (!shippingAddress.fullName || !shippingAddress.fullName.trim() ||
            !shippingAddress.phone || !shippingAddress.phone.trim() ||
            !shippingAddress.address || !shippingAddress.address.trim() ||
            !shippingAddress.district || !shippingAddress.district.trim()) {
          get().addToast('Please enter required shipping fields: Recipient Name, Phone Number, Address, and District.', 'error');
          return;
        }
      }

      // Validate payment details for bKash, Nagad, and Bank Transfer
      if (paymentMethod === 'bkash') {
        const { bkashNumber, bkashTxnId } = paymentDetails;
        if (!bkashNumber || !bkashNumber.trim() || !bkashTxnId || !bkashTxnId.trim()) {
          get().addToast('Please enter your bKash Number and Transaction ID.', 'error');
          return;
        }
      } else if (paymentMethod === 'nagad') {
        const { nagadNumber, nagadTxnId } = paymentDetails;
        if (!nagadNumber || !nagadNumber.trim() || !nagadTxnId || !nagadTxnId.trim()) {
          get().addToast('Please enter your Nagad Number and Transaction ID.', 'error');
          return;
        }
      } else if (paymentMethod === 'bank_transfer') {
        const { bankAccountNumber, bankName } = paymentDetails;
        if (!bankAccountNumber || !bankAccountNumber.trim() || !bankName || !bankName.trim()) {
          get().addToast('Please enter Bank Details and Transaction Reference.', 'error');
          return;
        }
      }

      set({ isProcessingOrder: true });

      try {
        const pricing = get().getCartPricing();

        const payload = {
          fullName: shippingInfo.fullName,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
          address: shippingInfo.address,
          city: shippingInfo.city,
          thana: shippingInfo.thana,
          district: shippingInfo.district,
          zip: shippingInfo.zip,
          giftWrap: shippingInfo.giftWrap,
          paymentMethod,
          subtotal: pricing.cartSubtotal,
          shippingFee: pricing.shippingFee,
          tax: 0,
          total: pricing.cartTotal,
          items: cart.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            size: item.size,
            concentration: item.concentration
          })),
          paymentDetails: ['bkash', 'nagad', 'bank_transfer'].includes(paymentMethod) ? paymentDetails : null
        };

        const json = await apiCreateOrder(payload);

        get().saveCart([]);
        set({
          isProcessingOrder: false,
          orderCompleted: true,
          orderNumber: json.data?.orderNumber ?? json.data?.id ?? ('DEC-' + Math.floor(100000 + Math.random() * 900000))
        });
        get().addToast(json?.message || 'Your order has been placed successfully!', 'success');
      } catch (err) {
        set({ isProcessingOrder: false });
        get().addToast(err?.message || 'Something went wrong', 'error');
      }
    },

    handleResetCheckout: () => {
      get().saveCart([]);
      set({
        isCheckoutMode: false,
        orderCompleted: false,
        orderNumber: null,
        isCartOpen: false,
        paymentMethod: 'cod',
        sameAsBilling: true,
        shippingZone: 'inside-dhaka',
        shippingAddress: {
          address: '',
          thana: '',
          district: '',
          zip: ''
        },
        shippingInfo: {
          fullName: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          thana: '',
          district: '',
          zip: '',
          giftWrap: false
        },
        paymentDetails: {
          bkashNumber: '',
          bkashTxnId: '',
          bkashAmount: '',
          nagadNumber: '',
          nagadTxnId: '',
          nagadAmount: '',
          bankAccountNumber: '',
          bankName: '',
          bankAmount: ''
        },
        promoCode: '',
        appliedDiscount: 0
      });
    },

    handleOpenProductDetail: (product) => {
      set({
        selectedProduct: product,
        modalSize: '100ml',
        modalConcentration: 'Eau de Parfum'
      });
    },

    applyPromoCode: (e) => {
      if (e) e.preventDefault();
      set({ promoError: '' });
      const code = get().promoCode.trim().toUpperCase();
      if (code === 'GOLDEN20' || code === 'DECANTRE') {
        set({ appliedDiscount: 0.20 });
        get().addToast('Exclusive 20% elite discount applied successfully.', 'success');
      } else if (code === 'MAJESTY') {
        set({ appliedDiscount: 0.15 });
        get().addToast('15% premium coupon code accepted.', 'success');
      } else {
        set({ promoError: 'This luxury credential code has expired or is invalid.' });
      }
    },

    // Getters for computed states
    getFilteredProducts: () => {
      const selectedCategory = get().selectedCategory;
      const searchQuery = get().searchQuery;
      const allProducts = get().products || [];
      return allProducts.filter((prod) => {
        const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              prod.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              prod.scentFamily.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    },

    getCartPricing: () => {
      const cart = get().cart;
      const appliedDiscount = get().appliedDiscount;
      const paymentMethod = get().paymentMethod;
      const shippingInfo = get().shippingInfo;
      const sameAsBilling = get().sameAsBilling;
      const shippingAddress = get().shippingAddress;

      const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const discountAmount = Math.round(cartSubtotal * appliedDiscount);

      let shippingFee = 0;
      if (paymentMethod !== 'instore' && cartSubtotal > 0) {
        const activeDistrict = (sameAsBilling ? (shippingInfo.district || '') : (shippingAddress.district || '')).trim().toLowerCase();
        if (activeDistrict === 'dhaka' || activeDistrict.includes('dhaka')) {
          shippingFee = 80;
        } else {
          shippingFee = 120;
        }
      }

      const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

      return {
        cartSubtotal,
        discountAmount,
        shippingFee,
        cartTotal
      };
    }
  };
});
