import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearUserError } from '../redux/slices/userSlice';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

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
    if (password !== confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    setLocalError('');
    const res = await dispatch(register({ name, email, password }));
    if (res.error) {
      toast.error(res.payload || 'Registration failed');
    } else {
      toast.success('Account created');
    }
  };

  return (
    <section className="auth-page">
      <form className="form-card" onSubmit={onSubmit}>
        <h1>Create Account</h1>
        {(localError || error) && (
          <div className="form-error">{localError || error}</div>
        )}

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
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader size={20} /> : 'Register'}
        </button>

        <p className="form-foot">
          Already have an account?{' '}
          <Link to={`/login${redirect ? `?redirect=${redirect}` : ''}`}>
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
};

export default RegisterPage;
