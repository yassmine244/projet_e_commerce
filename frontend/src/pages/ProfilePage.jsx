import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../redux/slices/userSlice';
import { getMyOrders } from '../redux/slices/orderSlice';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  const { userInfo, loading: userLoading, error: userError } = useSelector(
    (s) => s.user
  );
  const { orders, loading: ordersLoading, error: ordersError } = useSelector(
    (s) => s.order
  );

  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (password && password !== confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    setLocalError('');
    const payload = { name, email };
    if (password) payload.password = password;
    dispatch(updateProfile(payload)).then((res) => {
      if (res.error) {
        toast.error(res.payload || 'Update failed');
      } else {
        setSuccess('Profile updated');
        setPassword('');
        setConfirm('');
        toast.success('Profile updated');
      }
    });
  };

  return (
    <section className="profile-page">
      <div className="profile-page__grid">
        <form className="form-card" onSubmit={onSubmit}>
          <h2>My Profile</h2>
          {(localError || userError) && (
            <div className="form-error">{localError || userError}</div>
          )}
          {success && <div className="form-success">{success}</div>}

          <label>
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={userLoading}
          >
            {userLoading ? <Loader size={20} /> : 'Update'}
          </button>
        </form>

        <div className="orders-panel">
          <h2>My Orders</h2>
          {ordersLoading ? (
            <Loader />
          ) : ordersError ? (
            <p className="form-error">{ordersError}</p>
          ) : orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Delivered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o._id.slice(-6)}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>${Number(o.totalPrice).toFixed(2)}</td>
                    <td>{o.isPaid ? '✓' : '✗'}</td>
                    <td>{o.isDelivered ? '✓' : '✗'}</td>
                    <td>
                      <Link to={`/order/${o._id}`}>Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
