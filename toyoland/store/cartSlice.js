import { createSlice } from '@reduxjs/toolkit';

// Initial cart state
const initialState = {
  items: [],
  isOpen: false,
};

// Redux slice managing cart items and state
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add product to cart or increase quantity if exists
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ ...product, quantity });
      }
      state.isOpen = true; // Auto open cart drawer on add
    },

    // Remove item completely from cart
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    // Update specific item quantity
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          item.quantity = quantity;
        }
      }
    },

    // Clear all items from cart
    clearCart: (state) => {
      state.items = [];
    },

    // Toggle or set cart drawer visibility
    setCartOpen: (state, action) => {
      state.isOpen = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;
