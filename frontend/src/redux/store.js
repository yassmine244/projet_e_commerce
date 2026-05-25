import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import cartReducer, {
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
  saveShippingAddress,
  savePaymentMethod,
} from './slices/cartSlice';
import userReducer from './slices/userSlice';
import orderReducer from './slices/orderSlice';
import wishlistReducer from './slices/wishlistSlice';

const cartPersistMiddleware = createListenerMiddleware();

cartPersistMiddleware.startListening({
  matcher: isAnyOf(
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    saveShippingAddress,
    savePaymentMethod
  ),
  effect: (_action, listenerApi) => {
    const { cart } = listenerApi.getState();
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (_) {
      // storage may be full or unavailable — ignore
    }
  },
});

const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    user: userReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefault) =>
    getDefault().prepend(cartPersistMiddleware.middleware),
  devTools: import.meta.env.DEV,
});

export default store;
