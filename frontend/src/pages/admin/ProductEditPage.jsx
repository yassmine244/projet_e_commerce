import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa';
import {
  fetchProductById,
  createProduct,
  updateProduct,
  clearProduct,
} from '../../redux/slices/productSlice';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { useToast } from '../../components/Toast';
import { imageUrl, onImageError } from '../../utils/imageUrl';

const ProductEditPage = () => {
  const { id } = useParams();
  const isNew = !id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { product, loading, error } = useSelector((s) => s.products);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);

  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isNew) {
      dispatch(fetchProductById(id));
    }
    return () => dispatch(clearProduct());
  }, [dispatch, id, isNew]);

  useEffect(() => {
    if (!isNew && product && product._id === id) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price || 0);
      setImage(product.image || '');
      setCategory(product.category?._id || product.category || '');
      setCountInStock(product.countInStock || 0);
      // If the existing image is a /uploads path, default to upload mode; else URL mode
      if (product.image && /^\/uploads\//.test(product.image)) {
        setImageMode('upload');
      } else {
        setImageMode('url');
      }
    }
  }, [product, id, isNew]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(data.path);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name,
      description,
      price: Number(price),
      image,
      category,
      countInStock: Number(countInStock),
    };
    const action = isNew
      ? createProduct(payload)
      : updateProduct({ id, ...payload });
    const res = await dispatch(action);
    setSubmitting(false);
    if (res.error) {
      toast.error(res.payload || 'Save failed');
    } else {
      toast.success(isNew ? 'Product created' : 'Product updated');
      navigate('/admin/products');
    }
  };

  return (
    <section className="admin">
      <Link to="/admin/products" className="admin__back">
        <FaArrowLeft /> Back to products
      </Link>

      <h1>{isNew ? 'New Product' : 'Edit Product'}</h1>

      {loading && !isNew ? (
        <Loader />
      ) : (
        <form className="form-card admin__form" onSubmit={onSubmit}>
          {error && <div className="form-error">{error}</div>}

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
            Description
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="admin__formRow">
            <label>
              Price
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                min="0"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              />
            </label>
          </div>

          <label>
            Category
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">— Select category —</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="admin__imageBlock">
            <div className="admin__imageHeader">
              <span className="admin__imageLabel">Image</span>
              <div className="admin__imageToggle" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={imageMode === 'url'}
                  className={
                    imageMode === 'url' ? 'admin__toggleActive' : ''
                  }
                  onClick={() => setImageMode('url')}
                >
                  Use URL
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={imageMode === 'upload'}
                  className={
                    imageMode === 'upload' ? 'admin__toggleActive' : ''
                  }
                  onClick={() => setImageMode('upload')}
                >
                  Upload file
                </button>
              </div>
            </div>

            {imageMode === 'url' ? (
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
              />
            ) : (
              <>
                <input
                  type="text"
                  value={image}
                  readOnly
                  placeholder="/uploads/..."
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </>
            )}
          </div>
          {uploading && <Loader size={20} />}
          {uploadError && <div className="form-error">{uploadError}</div>}
          {image && (
            <img
              src={imageUrl(image)}
              alt="preview"
              className="admin__preview"
              onError={onImageError}
            />
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? <Loader size={20} /> : isNew ? 'Create' : 'Save'}
          </button>
        </form>
      )}
    </section>
  );
};

export default ProductEditPage;
