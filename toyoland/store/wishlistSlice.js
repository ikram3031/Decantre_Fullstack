import { createSlice } from '@reduxjs/toolkit';

// Initial wishlist state
const initialState = {
  items: [],
  isOpen: false,
};

// Redux slice managing wishlist items and state
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Toggle product in wishlist
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex((item) => item.id === product.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
    },

    // Set wishlist drawer state
    setWishlistOpen: (state, action) => {
      state.isOpen = action.payload;
    },
  },
});

export const { toggleWishlist, setWishlistOpen } = wishlistSlice.actions;
export default wishlistSlice.reducer;
