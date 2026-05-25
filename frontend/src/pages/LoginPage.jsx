import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearUserError } from '../redux/slices/userSlice';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { userInfo, loading, error } = useSelector((s) => s.user);

  useEffect(() => {
    if (userInfo) navigate(redirect, { replace: true });
  }, [userInfo, redirect, navigate]);

  useEffect(() => () => dispatch(clearUserError()), [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (res.error) {
      toast.error(res.payload || 'Login failed');
    } else {
      toast.success(`Welcome back, ${res.payload.name}`);
    }
  };

  return (
    <section className="auth-page">
      <form className="form-card" onSubmit={onSubmit}>
        <h1>Sign In</h1>
        {error && <div className="form-error">{error}</div>}

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
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader size={20} /> : 'Sign In'}
        </button>

        <p className="form-foot">
          New here?{' '}
          <Link to={`/register${redirect ? `?redirect=${redirect}` : ''}`}>
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
};

export default LoginPage;
