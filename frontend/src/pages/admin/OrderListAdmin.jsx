import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck } from 'react-icons/fa';
import {
  listAllOrders,
  deliverOrder,
} from '../../redux/slices/orderSlice';
import Loader from '../../components/Loader';
import { useToast } from '../../components/Toast';

const OrderListAdmin = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { allOrders, loading, error } = useSelector((s) => s.order);

  useEffect(() => {
    dispatch(listAllOrders());
  }, [dispatch]);

  const handleDeliver = async (id) => {
    if (!window.confirm('Mark this order as delivered?')) return;
    const res = await dispatch(deliverOrder(id));
    if (res.error) toast.error(res.payload || 'Action failed');
    else toast.success('Order marked as delivered');
  };

  return (
    <section className="admin">
      <header className="admin__header">
        <h1>Orders</h1>
        <p className="admin__subtitle">
          {allOrders.length} order{allOrders.length === 1 ? '' : 's'}
        </p>
      </header>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <div className="admin__tableWrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => (
                <tr key={o._id}>
                  <td>{o._id.slice(-6)}</td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>${Number(o.totalPrice).toFixed(2)}</td>
                  <td>
                    {o.isPaid ? (
                      <span className="badge badge--success">
                        {new Date(o.paidAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="badge badge--muted">No</span>
                    )}
                  </td>
                  <td>
                    {o.isDelivered ? (
                      <span className="badge badge--success">
                        {new Date(o.deliveredAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="badge badge--muted">No</span>
                    )}
                  </td>
                  <td className="admin__actions">
                    {!o.isDelivered && (
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={() => handleDeliver(o._id)}
                      >
                        <FaCheck /> Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {allOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin__empty">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default OrderListAdmin;
