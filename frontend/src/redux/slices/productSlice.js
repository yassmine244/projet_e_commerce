import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const extractError = (err) =>
  err.response?.data?.message || err.message || 'Request failed';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = {};
      [
        'keyword',
        'category',
        'minPrice',
        'maxPrice',
        'sortBy',
        'page',
        'limit',
      ].forEach((k) => {
        if (params[k] !== undefined && params[k] !== '') {
          query[k] = params[k];
        }
      });
      const { data } = await api.get('/products', { params: query });
      return data; // { products, page, pages, total }
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/products', payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/products/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const createReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, rating, comment }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      await dispatch(fetchProductById(productId));
      return true;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const deleteReview = createAsyncThunk(
  'products/deleteReview',
  async ({ productId, reviewId }, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      await dispatch(fetchProductById(productId));
      return true;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const initialState = {
  products: [],
  page: 1,
  pages: 1,
  total: 0,
  product: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.product = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const idx = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (idx !== -1) state.products[idx] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (p) => p._id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createReview.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearProduct, clearProductError } = productSlice.actions;
export default productSlice.reducer;
