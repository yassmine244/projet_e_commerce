import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const extractError = (err) =>
  err.response?.data?.message || err.message || 'Request failed';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/wishlist');
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (product, { rejectWithValue }) => {
    try {
      const productId = typeof product === 'object' ? product._id : product;
      await api.post(`/users/wishlist/${productId}`);
      return typeof product === 'object' ? product : { _id: productId };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/wishlist/${productId}`);
      return productId;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToWishlist.fulfilled, (state, action) => {
        const exists = state.items.some(
          (p) => p._id === action.payload._id
        );
        if (!exists) state.items.push(action.payload);
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

// Selector helper used across components
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((p) => p._id === productId);

export default wishlistSlice.reducer;
