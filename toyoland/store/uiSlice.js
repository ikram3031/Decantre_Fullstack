import { createSlice } from '@reduxjs/toolkit';

// Initial UI modal and filter states
const initialState = {
  isSearchOpen: false,
  searchQuery: '',
  selectedCategory: 'All',
  isCheckoutOpen: false,
};

// Redux slice for general application UI state
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggle Search modal
    setSearchOpen: (state, action) => {
      state.isSearchOpen = action.payload;
    },

    // Update search query string
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    // Filter by active category
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },

    // Set checkout modal state
    setCheckoutOpen: (state, action) => {
      state.isCheckoutOpen = action.payload;
    }
  },
});

export const {
  setSearchOpen,
  setSearchQuery,
  setSelectedCategory,
  setCheckoutOpen
} = uiSlice.actions;

export default uiSlice.reducer;
