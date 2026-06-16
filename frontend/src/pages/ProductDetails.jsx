import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products as mockProducts } from '../data/products';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

const getId = (p) => (p._id ? String(p._id) : p.id);

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { t, formatCurrency } = useLanguage();

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    getProductById(id)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        let found = null;
        try {
          const stored = JSON.parse(localStorage.getItem('floradesigner_admin_products') || '[]');
          if (Array.isArray(stored)) {
            found = stored.find((p) => (p._id ? String(p._id) : p.id) === id) || null;
          }
        } catch {}
        if (!found) {
          found = mockProducts.find((p) => p.id === id || String(p._id) === id) || null;
        }
        setProduct(found);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="text-center py-24 text-gray-400 text-sm">{t('details.loading')}</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">*</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">{t('details.notfound.title')}</h2>
        <p className="text-gray-400 mb-6">{t('details.notfound.desc')}</p>
        <Link to="/products" className="btn-primary">{t('details.notfound.btn')}</Link>
      </div>
    );
  }

  const productId = getId(product);

  const relatedSource = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('floradesigner_admin_products') || '[]');
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch {}
    return mockProducts;
  })();

  function handleAddToCart() {
    addToCart({ ...product, id: productId }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      <Link to="/products" className="text-sm text-flora-600 hover:underline mb-6 inline-block">
        {t('details.back')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
        <div className="rounded-xl overflow-hidden shadow-md bg-flora-50 h-96 md:h-auto">
          <img
            src={product.imageUrl || FALLBACK_BOUQUET_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <span className="shrink-0 mt-1 bg-flora-50 text-flora-600 text-xs font-medium px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <p className="text-gray-400 text-sm mb-4">
            {[
              product.size && `${product.size} ${t('details.arrangement')}`,
              product.occasion && `${t('details.idealfor')} ${product.occasion}`,
            ]
              .filter(Boolean)
              .join(' - ')}
          </p>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3 text-sm">
            <div className="flex gap-2 flex-wrap">
              <span className="font-medium text-gray-700 w-28 shrink-0">{t('details.flowers')}:</span>
              <span className="text-gray-600">{(product.flowers || []).join(', ')}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="font-medium text-gray-700 w-28 shrink-0">{t('details.colors')}:</span>
              <span className="text-gray-600">{(product.colors || []).join(', ')}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-gray-700 w-28 shrink-0">{t('details.size')}:</span>
              <span className="text-gray-600">{product.size}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-gray-700 w-28 shrink-0">{t('details.occasion')}:</span>
              <span className="text-gray-600">{product.occasion}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-gray-700 w-28 shrink-0">{t('details.availability')}:</span>
              <span className={product.available ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {product.available ? t('details.instock') : t('details.outofstock')}
              </span>
            </div>
            {product.deliveryInfo && (
              <div className="flex gap-2 flex-wrap">
                <span className="font-medium text-gray-700 w-28 shrink-0">{t('details.delivery')}:</span>
                <span className="text-gray-600">{product.deliveryInfo}</span>
              </div>
            )}
          </div>

          <p className="text-3xl font-bold text-flora-600 mb-5">{formatCurrency(product.price || 0)}</p>

          {product.available ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600">{t('details.qty')}</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-800 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              {added && (
                <p className="text-green-600 text-sm font-medium bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                  {t('details.added')} <Link to="/cart" className="underline">{t('details.viewcart')}</Link>
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`btn-primary flex-1 transition ${added ? 'opacity-75' : ''}`}
                >
                  {added ? t('details.addedlabel') : t('details.addtocart')}
                </button>
                <Link to="/cart" className="btn-outline flex-1 text-center">
                  {t('details.viewcart')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-400 text-sm">
              {t('details.outofstock.msg')}
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 pt-10 border-t border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('details.related')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {relatedSource
            .filter((p) => getId(p) !== productId && p.available)
            .slice(0, 4)
            .map((p) => {
              const pid = getId(p);
              return (
                <Link key={pid} to={`/products/${pid}`} className="card overflow-hidden group">
                  <div className="h-36 bg-flora-50 overflow-hidden">
                    <img
                      src={p.imageUrl || FALLBACK_BOUQUET_IMAGE}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-flora-600 font-bold text-sm">{formatCurrency(p.price || 0)}</p>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
