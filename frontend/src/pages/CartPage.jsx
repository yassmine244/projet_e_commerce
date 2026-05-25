import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
import { removeFromCart, updateQty } from '../redux/slices/cartSlice';
import { imageUrl, onImageError } from '../utils/imageUrl';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((s) => s.cart);
  const { userInfo } = useSelector((s) => s.user);

  const subtotalQty = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const subtotalPrice = cartItems.reduce(
    (sum, i) => sum + i.qty * Number(i.price),
    0
  );

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <section className="cart-page">
      <h1>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p className="cart-page__empty">
          Your cart is empty. <Link to="/">Go shopping</Link>
        </p>
      ) : (
        <div className="cart-page__grid">
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.product} className="cart-item">
                <img
                  src={imageUrl(item.image)}
                  alt={item.name}
                  className="cart-item__img"
                  onError={onImageError}
                />
                <Link to={`/product/${item.product}`} className="cart-item__name">
                  {item.name}
                </Link>
                <div className="cart-item__price">
                  ${Number(item.price).toFixed(2)}
                </div>
                <select
                  className="cart-item__qty"
                  value={item.qty}
                  onChange={(e) =>
                    dispatch(
                      updateQty({
                        product: item.product,
                        qty: Number(e.target.value),
                      })
                    )
                  }
                >
                  {[...Array(item.countInStock || 10).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="cart-item__remove"
                  onClick={() => dispatch(removeFromCart(item.product))}
                  aria-label="Remove"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>

          <aside className="cart-summary">
            <h2>Summary</h2>
            <p>
              Items: <strong>{subtotalQty}</strong>
            </p>
            <p className="cart-summary__total">
              Total: <strong>${subtotalPrice.toFixed(2)}</strong>
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartPage;
