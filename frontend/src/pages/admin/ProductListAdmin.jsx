import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import {
  fetchProducts,
  deleteProduct,
} from '../../redux/slices/productSlice';
import Loader from '../../components/Loader';
import { useToast } from '../../components/Toast';
import { imageUrl, onImageError } from '../../utils/imageUrl';

const ProductListAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { products, loading, error } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const res = await dispatch(deleteProduct(id));
    if (res.error) {
      toast.error(res.payload || 'Delete failed');
    } else {
      toast.success('Product deleted');
    }
  };

  return (
    <section className="admin">
      <header className="admin__header admin__header--row">
        <div>
          <h1>Products</h1>
          <p className="admin__subtitle">
            {products.length} item{products.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/admin/products/new')}
        >
          <FaPlus /> New Product
        </button>
      </header>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : (
        <div className="admin__tableWrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      src={imageUrl(p.image)}
                      alt={p.name}
                      className="admin__thumb"
                      onError={onImageError}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>{p.countInStock}</td>
                  <td className="admin__actions">
                    <Link
                      to={`/admin/products/${p._id}/edit`}
                      className="icon-btn"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      onClick={() => handleDelete(p._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin__empty">
                    No products yet.
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

export default ProductListAdmin;
