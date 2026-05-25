import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
import {
  fetchWishlist,
  removeFromWishlist,
} from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import Loader from '../components/Loader';
import Rating from '../components/Rating';
import { useToast } from '../components/Toast';
import { imageUrl, onImageError } from '../utils/imageUrl';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, loading, error } = useSelector((s) => s.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id));
    toast.info('Removed from wishlist');
  };

  const handleAddToCart = (p) => {
    dispatch(
      addToCart({
        product: p._id,
        name: p.name,
        image: p.image,
        price: p.price,
        countInStock: p.countInStock,
        qty: 1,
      })
    );
    toast.success(`Added "${p.name}" to cart`);
  };

  return (
    <section className="wishlist">
      <header className="wishlist__header">
        <h1>My Wishlist</h1>
        <p className="wishlist__count">
          {items.length} item{items.length === 1 ? '' : 's'}
        </p>
      </header>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="page-center"><Loader /></div>
      ) : items.length === 0 ? (
        <div className="wishlist__empty">
          <p>Your wishlist is empty.</p>
          <Link to="/" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="wishlist__grid">
          {items.map((p) => (
            <article key={p._id} className="wishlist-card">
              <Link
                to={`/product/${p._id}`}
                className="wishlist-card__media"
              >
                <img
                  src={imageUrl(p.image)}
                  alt={p.name}
                  loading="lazy"
                  onError={onImageError}
                />
              </Link>
              <div className="wishlist-card__body">
                <Link
                  to={`/product/${p._id}`}
                  className="wishlist-card__name"
                >
                  {p.name}
                </Link>
                <Rating
                  value={p.rating}
                  text={`(${p.numReviews || 0})`}
                />
                <div className="wishlist-card__price">
                  ${Number(p.price).toFixed(2)}
                </div>
                <div className="wishlist-card__actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={() => handleAddToCart(p)}
                    disabled={p.countInStock === 0}
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => handleRemove(p._id)}
                    aria-label="Remove"
                    title="Remove"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default WishlistPage;
