import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaTrash, FaUserShield, FaUser } from 'react-icons/fa';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { useToast } from '../../components/Toast';

const UserListAdmin = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userInfo } = useSelector((s) => s.user);

  const extract = (err) =>
    err.response?.data?.message || err.message || 'Request failed';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(extract(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (u) => {
    if (u._id === userInfo._id) {
      setError("You can't change your own admin status here");
      return;
    }
    try {
      await api.put(`/users/${u._id}`, { isAdmin: !u.isAdmin });
      setUsers((prev) =>
        prev.map((x) => (x._id === u._id ? { ...x, isAdmin: !x.isAdmin } : x))
      );
      toast.success(`${u.name} is now ${!u.isAdmin ? 'an admin' : 'a user'}`);
    } catch (err) {
      const msg = extract(err);
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (u) => {
    if (u._id === userInfo._id) {
      setError("You can't delete your own account");
      return;
    }
    if (!window.confirm(`Delete user "${u.name}"?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
      toast.success('User deleted');
    } catch (err) {
      const msg = extract(err);
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <section className="admin">
      <header className="admin__header">
        <h1>Users</h1>
        <p className="admin__subtitle">
          {users.length} user{users.length === 1 ? '' : 's'}
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
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    {u.name}
                    {u._id === userInfo._id && (
                      <span className="badge badge--muted" style={{ marginLeft: 8 }}>
                        you
                      </span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    {u.isAdmin ? (
                      <span className="badge badge--success">Admin</span>
                    ) : (
                      <span className="badge badge--muted">User</span>
                    )}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="admin__actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => toggleAdmin(u)}
                      disabled={u._id === userInfo._id}
                      title={u.isAdmin ? 'Revoke admin' : 'Grant admin'}
                    >
                      {u.isAdmin ? <FaUser /> : <FaUserShield />}
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      onClick={() => handleDelete(u)}
                      disabled={u._id === userInfo._id}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin__empty">
                    No users.
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

export default UserListAdmin;
