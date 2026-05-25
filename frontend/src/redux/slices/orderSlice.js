import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const extractError = (err) =>
  err.response?.data?.message || err.message || 'Request failed';

export const createOrder = createAsyncThunk(
  'order/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/orders', payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  'order/details',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const getMyOrders = createAsyncThunk(
  'order/myOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders/myorders');
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const payOrder = createAsyncThunk(
  'order/pay',
  async ({ id, paymentResult }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${id}/pay`, paymentResult || {});
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const listAllOrders = createAsyncThunk(
  'order/listAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders');
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const deliverOrder = createAsyncThunk(
  'order/deliver',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${id}/deliver`);
      return data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const initialState = {
  order: null,
  orders: [],
  allOrders: [],
  loading: false,
  error: null,
  success: false,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.error = null;
      state.success = false;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(payOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.success = true;
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(listAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
      })
      .addCase(listAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deliverOrder.fulfilled, (state, action) => {
        const idx = state.allOrders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (idx !== -1) state.allOrders[idx] = action.payload;
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetOrderState, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
