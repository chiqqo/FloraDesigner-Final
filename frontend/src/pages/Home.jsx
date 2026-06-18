import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products as mockProducts } from '../data/products';
import { getProducts } from '../services/api';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

const MOCK_FEATURED = [mockProducts[0], mockProducts[2], mockProducts[6]];

const getId = (p) => (p._id ? String(p._id) : p.id);

export default function Home() {
  const { t, formatCurrency } = useLanguage();
  const [featured, setFeatured] = useState(MOCK_FEATURED);

  useEffect(() => {
    getProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length >= 3) {
          const available = data.filter((p) => p.available);
          const picks = available.length >= 3 ? available.slice(0, 3) : data.slice(0, 3);
          setFeatured(picks);
        }
      })
      .catch(() => {});
  }, []);

  const aiSteps = [
    { step: '1', titleKey: 'home.step1.title', descKey: 'home.step1.desc' },
    { step: '2', titleKey: 'home.step2.title', descKey: 'home.step2.desc' },
    { step: '3', titleKey: 'home.step3.title', descKey: 'home.step3.desc' },
    { step: '4', titleKey: 'home.step4.title', descKey: 'home.step4.desc' },
  ];

  const benefits = [
    { titleKey: 'home.ben1.title', descKey: 'home.ben1.desc' },
    { titleKey: 'home.ben2.title', descKey: 'home.ben2.desc' },
    { titleKey: 'home.ben3.title', descKey: 'home.ben3.desc' },
    { titleKey: 'home.ben4.title', descKey: 'home.ben4.desc' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-20">
        {t('home.tag').trim() && (
          <p className="text-flora-500 text-sm font-medium tracking-widest uppercase mb-3">
            {t('home.tag')}
          </p>
        )}
        {(t('home.title1').trim() || t('home.title2').trim()) && (
          <h1 className="text-5xl font-bold text-flora-700 mb-4 leading-tight">
            {t('home.title1')}
            {t('home.title1').trim() && t('home.title2').trim() && <br />}
            {t('home.title2')}
          </h1>
        )}
        <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
          {t('home.desc')}
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/products" className="btn-primary">{t('home.browse')}</Link>
          <Link to="/designer" className="btn-outline">{t('home.tryai')}</Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="mt-6 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('home.featured')}</h2>
          <Link to="/products" className="text-sm text-flora-600 hover:underline">
            {t('home.viewall')}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {featured.map((product) => {
            const pid = getId(product);
            return (
              <Link
                key={pid}
                to={`/products/${pid}`}
                className="card overflow-hidden group block"
              >
                <div className="h-56 bg-flora-50 overflow-hidden">
                  <img
                    src={product.imageUrl || FALLBACK_BOUQUET_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <span className="text-xs bg-flora-50 text-flora-600 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{product.occasion}</p>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-flora-600">{formatCurrency(product.price || 0)}</span>
                    <span className="text-xs text-flora-600 font-medium">{t('products.viewdetails')} →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How AI bouquet design works */}
      <section className="bg-flora-50 rounded-2xl p-8 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('home.how.title')}</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm">{t('home.how.desc')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiSteps.map((item) => (
            <div key={item.step} className="bg-white rounded-xl p-5 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-flora-100 text-flora-700 font-bold text-lg flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">{t(item.titleKey)}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/designer" className="btn-primary">{t('home.tryai')}</Link>
        </div>
      </section>

      {/* Why FloraDesigner */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('home.why.title')}</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm">{t('home.why.desc')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item) => (
            <div key={item.titleKey} className="card p-6 text-center">
              <h3 className="text-base font-semibold text-gray-800 mb-2">{t(item.titleKey)}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-flora-700 text-white rounded-2xl p-10 text-center mb-4">
        <h2 className="text-2xl font-bold mb-3">{t('home.cta.title')}</h2>
        <p className="text-flora-200 mb-6 max-w-sm mx-auto text-sm">{t('home.cta.desc')}</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/products"
            className="bg-white text-flora-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-flora-50 transition"
          >
            {t('home.cta.shop')}
          </Link>
          <Link
            to="/designer"
            className="border border-white text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-flora-600 transition"
          >
            {t('home.cta.ai')}
          </Link>
        </div>
      </section>
    </div>
  );
}
