import { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails } from '../redux/slices/orderSlice';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';
import { imageUrl, onImageError } from '../utils/imageUrl';

const OrderPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const toast = useToast();

  const { order, loading, error } = useSelector((s) => s.order);

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  // Show payment outcome from Stripe redirect once, then strip the param
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast.success('Payment successful. Thanks for your order!');
      const next = new URLSearchParams(searchParams);
      next.delete('payment');
      setSearchParams(next, { replace: true });
    } else if (payment === 'cancelled') {
      toast.error('Payment cancelled. You can try again from your order.');
      const next = new URLSearchParams(searchParams);
      next.delete('payment');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll briefly after a success redirect — the webhook may need a beat
  useEffect(() => {
    if (!order || order.isPaid) return;
    const justPaid = searchParams.get('payment') === 'success';
    if (!justPaid) return;
    const t = setInterval(() => dispatch(getOrderDetails(id)), 2000);
    const stop = setTimeout(() => clearInterval(t), 20000);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
  }, [order, id, dispatch, searchParams]);

  if (loading) return <div className="page-center"><Loader /></div>;
  if (error) return <p className="page-error">{error}</p>;
  if (!order) return null;

  return (
    <section className="order-page">
      <h1>Order {order._id.slice(-6)}</h1>

      <div className="order-page__grid">
        <div className="order-page__main">
          <section className="form-card">
            <h2>Shipping</h2>
            <p>
              <strong>Name:</strong> {order.user?.name || '—'}
            </p>
            <p>
              <strong>Email:</strong> {order.user?.email || '—'}
            </p>
            <p>
              <strong>Address:</strong>{' '}
              {order.shippingAddress?.address}, {order.shippingAddress?.city}{' '}
              {order.shippingAddress?.postalCode},{' '}
              {order.shippingAddress?.country}
            </p>
            <p>
              {order.isDelivered ? (
                <span className="badge badge--success">
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="badge badge--muted">Not delivered</span>
              )}
            </p>
          </section>

          <section className="form-card">
            <h2>Payment</h2>
            <p>
              <strong>Method:</strong> {order.paymentMethod}
            </p>
            <p>
              {order.isPaid ? (
                <span className="badge badge--success">
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="badge badge--muted">Not paid</span>
              )}
            </p>
          </section>

          <section className="form-card">
            <h2>Items</h2>
            <ul className="order-page__items">
              {order.orderItems.map((item, i) => (
                <li key={i} className="order-page__item">
                  <img
                    src={imageUrl(item.image)}
                    alt={item.name}
                    onError={onImageError}
                  />
                  <Link
                    to={`/product/${item.product}`}
                    className="order-page__itemName"
                  >
                    {item.name}
                  </Link>
                  <div>
                    {item.qty} × ${Number(item.price).toFixed(2)} ={' '}
                    <strong>
                      ${(item.qty * Number(item.price)).toFixed(2)}
                    </strong>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="cart-summary">
          <h2>Summary</h2>
          <p className="cart-summary__total">
            Total: <strong>${Number(order.totalPrice).toFixed(2)}</strong>
          </p>
          <Link to="/profile" className="btn">
            Back to my orders
          </Link>
        </aside>
      </div>
    </section>
  );
};

export default OrderPage;
