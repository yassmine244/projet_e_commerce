import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const { products, loading, error } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ keyword }));
  }, [dispatch, keyword]);

  return (
    <section className="home">
      <h1 className="home__title">
        {keyword ? `Results for "${keyword}"` : 'Latest Products'}
      </h1>

      {loading ? (
        <div className="home__center"><Loader /></div>
      ) : error ? (
        <p className="home__error">{error}</p>
      ) : products.length === 0 ? (
        <p className="home__empty">No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomePage;
