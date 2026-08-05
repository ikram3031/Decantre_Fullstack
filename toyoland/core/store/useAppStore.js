import { create } from 'zustand';
import { 
  fetchProducts as apiFetchProducts, 
  fetchCategories as apiFetchCategories, 
  fetchBrands as apiFetchBrands, 
  fetchProductDetails as apiFetchProductDetails,
  createOrder as apiCreateOrder
} from '../lib/api';

export const useAppStore = create((set, get) => {
  return {
    products: [],
    categories: [],
    brands: [],
    cart: [],
    wishlist: [],
    user: null,

    isProductsLoading: false,
    productsError: null,

    isCategoriesLoading: false,
    isBrandsLoading: false,

    isHydrated: false,

    initStore: () => {
      if (typeof window === "undefined") return;
      try {
        const cachedCart = localStorage.getItem('toyoland_cart');
        const cachedWishlist = localStorage.getItem('toyoland_wishlist');
        const cachedUser = localStorage.getItem('toyoland_user');
        const cachedCategories = localStorage.getItem('toyoland_categories');
        const cachedBrands = localStorage.getItem('toyoland_brands');

        set({
          cart: cachedCart ? JSON.parse(cachedCart) : [],
          wishlist: cachedWishlist ? JSON.parse(cachedWishlist) : [],
          user: cachedUser ? JSON.parse(cachedUser) : null,
          categories: cachedCategories ? JSON.parse(cachedCategories) : [],
          brands: cachedBrands ? JSON.parse(cachedBrands) : [],
          isHydrated: true,
        });
      } catch (e) {
        console.error("Store initialization error:", e);
        set({ isHydrated: true });
      }
    },

    setProducts: (newProducts) => set({ products: newProducts }),

    fetchProducts: async (opts = {}) => {
      set({ isProductsLoading: true, productsError: null });
      try {
        const mapped = await apiFetchProducts(opts);
        set({ products: mapped, isProductsLoading: false, productsError: null });
        return mapped;
      } catch (err) {
        set({ isProductsLoading: false, productsError: err.message });
        return [];
      }
    },

    fetchCategories: async () => {
      set({ isCategoriesLoading: true });
      try {
        const categories = await apiFetchCategories();
        set({ categories, isCategoriesLoading: false });
        return categories;
      } catch (err) {
        set({ isCategoriesLoading: false });
        return [];
      }
    },

    fetchBrands: async () => {
      set({ isBrandsLoading: true });
      try {
        const brands = await apiFetchBrands();
        set({ brands, isBrandsLoading: false });
        return brands;
      } catch (err) {
        set({ isBrandsLoading: false });
        return [];
      }
    },

    addToCart: (product, selection = {}) => {
      const { cart } = get();
      const variantSize = selection.size || (product.variations?.[0]?.size ?? 'Standard');
      const itemPrice = selection.price ?? product.price ?? product.basePrice ?? 0;

      const cartItemId = `${product.id}-${variantSize}`;
      const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);

      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...cart];
        updatedCart[existingIndex].quantity += (selection.quantity || 1);
      } else {
        const newItem = {
          cartItemId,
          id: product.id,
          name: product.name,
          image: product.image,
          size: variantSize,
          price: itemPrice,
          quantity: selection.quantity || 1,
          product,
        };
        updatedCart = [...cart, newItem];
      }

      set({ cart: updatedCart });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('toyoland_cart', JSON.stringify(updatedCart));
        } catch (e) {}
      }
    },

    removeFromCart: (cartItemId) => {
      const { cart } = get();
      const updatedCart = cart.filter((item) => item.cartItemId !== cartItemId);
      set({ cart: updatedCart });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('toyoland_cart', JSON.stringify(updatedCart));
        } catch (e) {}
      }
    },

    clearCart: () => {
      set({ cart: [] });
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('toyoland_cart');
        } catch (e) {}
      }
    },

    placeOrder: async (orderPayload) => {
      const response = await apiCreateOrder(orderPayload);
      get().clearCart();
      return response;
    }
  };
});
