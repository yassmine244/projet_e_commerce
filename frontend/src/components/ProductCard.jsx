import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Rating from './Rating';
import { imageUrl, onImageError } from '../utils/imageUrl';
import {
  addToWishlist,
  removeFromWishlist,
} from '../redux/slices/wishlistSlice';
import { useToast } from './Toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { userInfo } = useSelector((s) => s.user);
  const isWishlisted = useSelector((s) =>
    s.wishlist.items.some((p) => p._id === product._id)
  );

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      navigate('/login?redirect=/');
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

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-card__media">
        <img
          src={imageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          onError={onImageError}
        />
      </Link>

      <button
        type="button"
        className={`product-card__heart${
          isWishlisted ? ' product-card__heart--active' : ''
        }`}
        onClick={handleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
      </button>

      <div className="product-card__body">
        <h3 className="product-card__name" title={product.name}>
          {product.name}
        </h3>

        <Rating
          value={product.rating}
          text={`(${product.numReviews || 0})`}
        />

        <div className="product-card__footer">
          <span className="product-card__price">
            ${Number(product.price).toFixed(2)}
          </span>
          <Link
            to={`/product/${product._id}`}
            className="product-card__view"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
