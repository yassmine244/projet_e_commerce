import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} from '../redux/slices/cartSlice';
import { createOrder, resetOrderState } from '../redux/slices/orderSlice';
import api from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { cartItems, shippingAddress, paymentMethod } = useSelector(
    (s) => s.cart
  );
  const { loading, error, order, success } = useSelector((s) => s.order);

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');
  const [payment, setPayment] = useState(paymentMethod || 'Stripe');
  const [redirecting, setRedirecting] = useState(false);

  const itemsPrice = cartItems.reduce(
    (sum, i) => sum + i.qty * Number(i.price),
    0
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      navigate('/cart');
    }
  }, [cartItems.length, success, navigate]);

  // After createOrder succeeds → start Stripe session or fall back to order page
  useEffect(() => {
    if (!success || !order) return;

    const proceed = async () => {
      dispatch(clearCart());
      dispatch(resetOrderState());

      if (order.paymentMethod === 'Stripe') {
        try {
          setRedirecting(true);
          const { data } = await api.post(
            `/orders/${order._id}/create-checkout-session`
          );
          if (data?.url) {
            window.location.href = data.url;
            return;
          }
          toast.error('Stripe did not return a checkout URL');
        } catch (err) {
          toast.error(
            err.response?.data?.message ||
              'Stripe checkout failed — falling back to the order page'
          );
        } finally {
          setRedirecting(false);
        }
      } else {
        toast.success('Order placed successfully');
      }
      navigate(`/order/${order._id}`);
    };
    proceed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, order]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, toast]);

  const onSubmit = (e) => {
    e.preventDefault();
    const shipping = { address, city, postalCode, country };
    dispatch(saveShippingAddress(shipping));
    dispatch(savePaymentMethod(payment));
    dispatch(
      createOrder({
        orderItems: cartItems.map((i) => ({
          product: i.product,
          name: i.name,
          qty: i.qty,
          price: i.price,
          image: i.image,
        })),
        shippingAddress: shipping,
        paymentMethod: payment,
        totalPrice,
      })
    );
  };

  return (
    <section className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-page__grid">
        <form className="form-card" onSubmit={onSubmit}>
          <h2>Shipping</h2>
          {error && <div className="form-error">{error}</div>}

          <label>
            Address
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label>
            City
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <label>
            Postal Code
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </label>
          <label>
            Country
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </label>

          <h2>Payment Method</h2>
          <div className="checkout-page__pay">
            {['Stripe', 'PayPal', 'Cash on Delivery'].map((opt) => (
              <label key={opt} className="radio">
                <input
                  type="radio"
                  name="payment"
                  value={opt}
                  checked={payment === opt}
                  onChange={(e) => setPayment(e.target.value)}
                />
                {opt}
                {opt === 'Stripe' && (
                  <small className="checkout-page__hint">
                    Card payment (recommended)
                  </small>
                )}
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || redirecting}
          >
            {loading || redirecting ? (
              <Loader size={20} />
            ) : payment === 'Stripe' ? (
              'Place Order & Pay'
            ) : (
              'Place Order'
            )}
          </button>
        </form>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <p>Items: <strong>${itemsPrice.toFixed(2)}</strong></p>
          <p>Shipping: <strong>${shippingPrice.toFixed(2)}</strong></p>
          <p>Tax: <strong>${taxPrice.toFixed(2)}</strong></p>
          <p className="cart-summary__total">
            Total: <strong>${totalPrice.toFixed(2)}</strong>
          </p>
        </aside>
      </div>
    </section>
  );
};

export default CheckoutPage;
