import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaTrash,
} from 'react-icons/fa';
import {
  fetchProductById,
  createReview,
  deleteReview,
} from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import {
  addToWishlist,
  removeFromWishlist,
} from '../redux/slices/wishlistSlice';
import Loader from '../components/Loader';
import Rating from '../components/Rating';
import { useToast } from '../components/Toast';
import { imageUrl, onImageError } from '../utils/imageUrl';

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { product, loading, error } = useSelector((s) => s.products);
  const { userInfo } = useSelector((s) => s.user);
  const isWishlisted = useSelector(
    (s) => product && s.wishlist.items.some((p) => p._id === product._id)
  );

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
        qty: Number(qty),
      })
    );
    toast.success(`Added "${product.name}" to cart`);
    navigate('/cart');
  };

  const toggleWishlist = () => {
    if (!userInfo) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist');
    }
  };

  const userHasReviewed =
    !!userInfo &&
    !!product &&
    product.reviews?.some((r) => r.user === userInfo._id);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    setSubmittingReview(true);
    const res = await dispatch(
      createReview({ productId: id, rating: Number(rating), comment })
    );
    setSubmittingReview(false);
    if (res.error) {
      toast.error(res.payload || 'Could not submit review');
    } else {
      toast.success('Review submitted');
      setComment('');
      setRating(5);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    const res = await dispatch(deleteReview({ productId: id, reviewId }));
    if (res.error) {
      toast.error(res.payload || 'Could not delete review');
    } else {
      toast.success('Review deleted');
    }
  };

  if (loading) return <div className="page-center"><Loader /></div>;
  if (error) return <p className="page-error">{error}</p>;
  if (!product) return null;

  return (
    <section className="product-page">
      <Link to="/" className="product-page__back">
        <FaArrowLeft /> Back
      </Link>

      <div className="product-page__grid">
        <div className="product-page__media">
          <img
            src={imageUrl(product.image)}
            alt={product.name}
            onError={onImageError}
          />
        </div>

        <div className="product-page__info">
          <div className="product-page__topRow">
            <h1>{product.name}</h1>
            <button
              type="button"
              className={`heart-btn${isWishlisted ? ' heart-btn--active' : ''}`}
              onClick={toggleWishlist}
              aria-label="Toggle wishlist"
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <Rating
            value={product.rating}
            text={`${(product.rating || 0).toFixed(1)} (${product.numReviews || 0} reviews)`}
          />
          <p className="product-page__price">
            ${Number(product.price).toFixed(2)}
          </p>
          <p className="product-page__desc">{product.description}</p>

          <div className="product-page__buy">
            <div className="product-page__stock">
              Status:{' '}
              <strong>
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </strong>
            </div>

            {product.countInStock > 0 && (
              <label className="product-page__qty">
                Qty:
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                >
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              type="button"
              className="btn btn-primary"
              disabled={product.countInStock === 0}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <section className="reviews">
        <h2>Reviews ({product.numReviews || 0})</h2>

        {product.reviews?.length === 0 && (
          <p className="reviews__empty">No reviews yet.</p>
        )}

        <ul className="reviews__list">
          {product.reviews?.map((r) => {
            const canDelete =
              userInfo && (r.user === userInfo._id || userInfo.isAdmin);
            return (
              <li key={r._id} className="review">
                <div className="review__head">
                  <strong>{r.name}</strong>
                  <Rating value={r.rating} />
                  <time className="review__date">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </time>
                  {canDelete && (
                    <button
                      type="button"
                      className="review__delete"
                      onClick={() => handleDeleteReview(r._id)}
                      aria-label="Delete review"
                      title="Delete review"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                {r.comment && <p className="review__body">{r.comment}</p>}
              </li>
            );
          })}
        </ul>

        <div className="reviews__form">
          <h3>Write a review</h3>
          {!userInfo ? (
            <p>
              <Link to={`/login?redirect=/product/${id}`}>Sign in</Link> to
              leave a review.
            </p>
          ) : userHasReviewed ? (
            <p className="reviews__notice">You have already reviewed this product.</p>
          ) : (
            <form className="form-card" onSubmit={handleSubmitReview}>
              <label>
                Rating
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value={5}>5 — Excellent</option>
                  <option value={4}>4 — Good</option>
                  <option value={3}>3 — Fair</option>
                  <option value={2}>2 — Poor</option>
                  <option value={1}>1 — Terrible</option>
                </select>
              </label>
              <label>
                Comment
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think?"
                />
              </label>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingReview}
              >
                {submittingReview ? <Loader size={20} /> : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </section>
    </section>
  );
};

export default ProductPage;
