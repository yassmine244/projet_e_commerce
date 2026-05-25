import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaHeart,
} from 'react-icons/fa';
import { logout } from '../redux/slices/userSlice';
import {
  fetchWishlist,
  clearWishlist,
} from '../redux/slices/wishlistSlice';

const Navbar = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const debounceRef = useRef(null);

  const { userInfo } = useSelector((s) => s.user);
  const { cartItems } = useSelector((s) => s.cart);
  const wishlistItems = useSelector((s) => s.wishlist.items);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const wishlistCount = wishlistItems.length;

  // Hydrate wishlist on login; clear on logout
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [userInfo, dispatch]);

  // Debounced auto-navigate while typing
  const onChangeKeyword = (e) => {
    const value = e.target.value;
    setKeyword(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = value.trim();
      if (q) {
        navigate(`/search/${encodeURIComponent(q)}`);
      }
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = keyword.trim();
    navigate(q ? `/search/${encodeURIComponent(q)}` : '/search');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          ShopMERN
        </Link>

        <form className="navbar__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={keyword}
            onChange={onChangeKeyword}
          />
          <button type="submit" aria-label="Search">
            <FaSearch />
          </button>
        </form>

        <nav className="navbar__links">
          <Link to="/wishlist" className="navbar__cart" title="Wishlist">
            <FaHeart />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="navbar__badge">{wishlistCount}</span>
            )}
          </Link>

          <Link to="/cart" className="navbar__cart">
            <FaShoppingCart />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="navbar__badge">{cartCount}</span>
            )}
          </Link>

          {userInfo ? (
            <div className="navbar__user">
              <Link to="/profile" className="navbar__userBtn">
                <FaUser /> {userInfo.name}
              </Link>
              {userInfo.isAdmin && (
                <Link to="/admin" className="navbar__admin">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="navbar__logout">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar__login">
              <FaUser /> <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
