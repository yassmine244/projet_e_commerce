import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import api from '../services/api';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most reviewed' },
];

const SearchPage = () => {
  const { keyword: kwParam = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, page, pages, loading, error, total } = useSelector(
    (s) => s.products
  );

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1
  );

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // Whenever filters / keyword / page change, sync URL + fetch
  useEffect(() => {
    const next = {};
    if (category) next.category = category;
    if (minPrice) next.minPrice = minPrice;
    if (maxPrice) next.maxPrice = maxPrice;
    if (sortBy && sortBy !== 'newest') next.sortBy = sortBy;
    if (currentPage > 1) next.page = String(currentPage);
    setSearchParams(next, { replace: true });

    dispatch(
      fetchProducts({
        keyword: kwParam,
        category,
        minPrice,
        maxPrice,
        sortBy,
        page: currentPage,
        limit: 12,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kwParam, category, minPrice, maxPrice, sortBy, currentPage]);

  const resetFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const goToPage = (p) => {
    setCurrentPage(Math.min(Math.max(p, 1), pages));
  };

  const onFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <section className="search">
      <header className="search__header">
        <h1>
          {kwParam ? (
            <>
              Results for <em>"{decodeURIComponent(kwParam)}"</em>
            </>
          ) : (
            'Browse products'
          )}
        </h1>
        <p className="search__count">{total} item{total === 1 ? '' : 's'}</p>
      </header>

      <div className="search__layout">
        <aside className="search__sidebar">
          <div className="search__filterGroup">
            <h3>Category</h3>
            <select value={category} onChange={onFilterChange(setCategory)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="search__filterGroup">
            <h3>Price</h3>
            <div className="search__priceRow">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={onFilterChange(setMinPrice)}
              />
              <span>—</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={onFilterChange(setMaxPrice)}
              />
            </div>
          </div>

          <div className="search__filterGroup">
            <h3>Sort</h3>
            <select value={sortBy} onChange={onFilterChange(setSortBy)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn search__reset"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </aside>

        <div className="search__main">
          {loading ? (
            <div className="page-center"><Loader /></div>
          ) : error ? (
            <p className="page-error">{error}</p>
          ) : products.length === 0 ? (
            <p className="search__empty">No products match these filters.</p>
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {pages > 1 && (
                <nav className="pagination" aria-label="Pagination">
                  <button
                    type="button"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => goToPage(n)}
                      className={n === page ? 'pagination__active' : ''}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= pages}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchPage;
