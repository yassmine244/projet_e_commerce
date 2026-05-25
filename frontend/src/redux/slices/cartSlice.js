import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) {
      return {
        cartItems: [],
        shippingAddress: {},
        paymentMethod: '',
      };
    }
    const parsed = JSON.parse(raw);
    return {
      cartItems: parsed.cartItems || [],
      shippingAddress: parsed.shippingAddress || {},
      paymentMethod: parsed.paymentMethod || '',
    };
  } catch (_) {
    return {
      cartItems: [],
      shippingAddress: {},
      paymentMethod: '',
    };
  }
};

const initialState = loadCart();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.cartItems.find(
        (i) => i.product === item.product
      );
      if (existing) {
        existing.qty = item.qty;
      } else {
        state.cartItems.push(item);
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (i) => i.product !== action.payload
      );
    },
    updateQty: (state, action) => {
      const { product, qty } = action.payload;
      const item = state.cartItems.find((i) => i.product === product);
      if (item) item.qty = qty;
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
  saveShippingAddress,
  savePaymentMethod,
} = cartSlice.actions;

// Action types this slice owns — used by the store listener to persist.
export const cartActionTypes = [
  addToCart.type,
  removeFromCart.type,
  updateQty.type,
  clearCart.type,
  saveShippingAddress.type,
  savePaymentMethod.type,
];

export default cartSlice.reducer;
