import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  products as mockProducts,
  categories,
  allColors,
  allFlowers,
  sizes,
  occasions,
  priceRanges,
} from '../data/products';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

const getId = (p) => (p._id ? String(p._id) : p.id);

function FilterSelect({ label, value, onChange, options, t }) {
  const translate = t || ((x) => x);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-flora-300"
      >
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {translate(val)}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default function Products() {
  const { addToCart } = useCart();
  const { t, formatCurrency } = useLanguage();
  const [displayProducts, setDisplayProducts] = useState(mockProducts);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [color, setColor] = useState('All');
  const [flower, setFlower] = useState('All');
  const [size, setSize] = useState('All');
  const [occasion, setOccasion] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [priceRange, setPriceRange] = useState('Any Price');

  useEffect(() => {
    function fromAdminOrMock() {
      try {
        const stored = JSON.parse(localStorage.getItem('floradesigner_admin_products') || '[]');
        if (Array.isArray(stored) && stored.length > 0) {
          setDisplayProducts(stored);
          setUsingFallback(false);
          return;
        }
      } catch {}
      setDisplayProducts(mockProducts);
      setUsingFallback(true);
    }

    getProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDisplayProducts(data);
          setUsingFallback(false);
        } else {
          fromAdminOrMock();
        }
      })
      .catch(fromAdminOrMock)
      .finally(() => setLoading(false));
  }, []);

  const selectedRange = priceRanges.find((r) => r.label === priceRange) || priceRanges[0];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return displayProducts.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q))
        return false;
      if (category !== 'All' && p.category !== category) return false;
      if (color !== 'All' && !p.colors.includes(color)) return false;
      if (
        flower !== 'All' &&
        !p.flowers.some((f) => f.toLowerCase().includes(flower.toLowerCase()))
      )
        return false;
      if (size !== 'All' && p.size !== size) return false;
      if (occasion !== 'All' && p.occasion !== occasion) return false;
      if (availableOnly && !p.available) return false;
      if (p.price < selectedRange.min || p.price > selectedRange.max) return false;
      return true;
    });
  }, [search, category, color, flower, size, occasion, availableOnly, selectedRange, displayProducts]);

  function handleAddToCart(product) {
    const pid = getId(product);
    addToCart({ ...product, id: pid }, 1);
    setAddedId(pid);
    setTimeout(() => setAddedId(null), 2000);
  }

  function clearFilters() {
    setSearch('');
    setCategory('All');
    setColor('All');
    setFlower('All');
    setSize('All');
    setOccasion('All');
    setAvailableOnly(false);
    setPriceRange('Any Price');
  }

  const hasActiveFilters =
    search ||
    category !== 'All' ||
    color !== 'All' ||
    flower !== 'All' ||
    size !== 'All' ||
    occasion !== 'All' ||
    availableOnly ||
    priceRange !== 'Any Price';

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">{t('products.title')}</h1>
        <p className="text-gray-500">{t('products.subtitle')}</p>
      </div>

      {!loading && usingFallback && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-6">
          {t('products.fallback')}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder={t('products.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-flora-300 shadow-sm"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <FilterSelect label={t('products.filter.category')} value={category} onChange={setCategory} options={categories} t={t} />
          <FilterSelect label={t('products.filter.color')} value={color} onChange={setColor} options={allColors} t={t} />
          <FilterSelect label={t('products.filter.flower')} value={flower} onChange={setFlower} options={allFlowers} t={t} />
          <FilterSelect label={t('products.filter.size')} value={size} onChange={setSize} options={sizes} t={t} />
          <FilterSelect label={t('products.filter.occasion')} value={occasion} onChange={setOccasion} options={occasions} t={t} />
          <FilterSelect
            label={t('products.filter.price')}
            value={priceRange}
            onChange={setPriceRange}
            options={priceRanges}
            t={t}
          />
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="accent-flora-600 w-4 h-4"
            />
            {t('products.instock.label')}
          </label>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-flora-600 hover:text-flora-700 underline"
            >
              {t('products.clearall')}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">{t('products.loading')}</div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-5">
            {t('products.showing', { count: filtered.length, total: displayProducts.length })}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">{t('products.nomatch')}</p>
              <button onClick={clearFilters} className="btn-outline text-sm mt-2">
                {t('products.clearfilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => {
                const pid = getId(product);
                return (
                  <div key={pid} className="card flex flex-col overflow-hidden">
                    <div className="relative h-52 bg-flora-50 overflow-hidden">
                      <img
                        src={product.imageUrl || FALLBACK_BOUQUET_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={handleImageError}
                      />
                      {!product.available && (
                        <span className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                          {t('Out of Stock')}
                        </span>
                      )}
                      <span className="absolute top-2 left-2 bg-white text-flora-600 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                        {product.category}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                      <p className="text-gray-400 text-xs mb-1">
                        {product.size} - {product.occasion}
                      </p>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.colors.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="text-xs bg-flora-50 text-flora-600 px-2 py-0.5 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-flora-600 text-lg">
                          {formatCurrency(product.price)}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            product.available ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {product.available ? t('In Stock') : t('Unavailable')}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link
                          to={`/products/${pid}`}
                          className="flex-1 text-center text-sm bg-flora-600 text-white px-3 py-2 rounded-lg hover:bg-flora-700 transition"
                        >
                          {t('products.viewdetails')}
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.available}
                          className={`flex-1 text-sm px-3 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            addedId === pid
                              ? 'bg-green-50 border border-green-400 text-green-600'
                              : 'border border-flora-600 text-flora-600 hover:bg-flora-50'
                          }`}
                        >
                          {addedId === pid ? t('products.added') : t('products.addtocart')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
