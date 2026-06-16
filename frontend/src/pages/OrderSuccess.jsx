import { Link } from 'react-router-dom';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

function getLastOrder() {
  try {
    const raw = localStorage.getItem('floradesigner_last_order');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(dateStr, language) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const locale = language === 'ka' ? 'ka-GE' : 'en-US';
  return new Date(+y, +m - 1, +d).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function OrderSuccess() {
  const { t, formatCurrency, language } = useLanguage();
  const order = getLastOrder();

  const PAYMENT_LABELS = {
    cash: t('pay.cash'),
    card: t('pay.card'),
    bank: t('pay.bank'),
  };

  if (!order) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="page-title">{t('success.title')}</h1>
        <p className="text-gray-500 mb-8">{t('success.nofound.text')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/products" className="btn-primary">{t('success.nofound.btn1')}</Link>
          <Link to="/" className="btn-outline">{t('success.nofound.btn2')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('success.title')}</h1>
        <p className="text-gray-500 max-w-sm mx-auto">
          {t('success.desc', { name: order.customerName })}
        </p>
      </div>

      {order.savedToBackend === true ? (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center mb-5">
          {t('success.backend')}
        </p>
      ) : order.savedToBackend === false ? (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-center mb-5">
          {t('success.local')}
        </p>
      ) : null}

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800">{t('success.details')}</h2>
          <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium px-3 py-1 rounded-full">
            {t(order.status) || order.status}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-400 w-32 shrink-0">{t('success.orderid')}</span>
            <span className="font-mono font-medium text-gray-800 break-all">
              {order._id || order.id}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-32 shrink-0">{t('success.customer')}</span>
            <span className="text-gray-800">{order.customerName}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-32 shrink-0">{t('success.phone')}</span>
            <span className="text-gray-800">{order.phone}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-gray-400 w-32 shrink-0">{t('success.deliveryto')}</span>
            <span className="text-gray-800">{order.address}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-32 shrink-0">{t('success.deliverydate')}</span>
            <span className="text-gray-800">{formatDate(order.deliveryDate, language)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-32 shrink-0">{t('success.timeslot')}</span>
            <span className="text-gray-800">{order.deliveryTime}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-32 shrink-0">{t('success.payment')}</span>
            <span className="text-gray-800">
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
            </span>
          </div>
          {order.note && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-gray-400 w-32 shrink-0">{t('success.note')}</span>
              <span className="text-gray-600 italic">{order.note}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">{t('success.items')}</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-flora-50 shrink-0">
                <img
                  src={item.imageUrl || FALLBACK_BOUQUET_IMAGE}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.category} &middot; Qty: {item.quantity}
                </p>
                {item.itemType === 'ai-generated' && item.prompt && (
                  <p className="text-xs text-gray-400 italic mt-0.5">
                    "{item.prompt.slice(0, 60)}{item.prompt.length > 60 ? '...' : ''}"
                  </p>
                )}
              </div>
              <p className="font-semibold text-gray-700 shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-800">
          <span>{t('success.total')}</span>
          <span className="text-flora-600">{formatCurrency(order.totalPrice)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 pb-10">
        <Link to="/products" className="btn-primary text-center">{t('success.continue')}</Link>
        <Link to="/orders" className="btn-outline text-center">{t('success.vieworders')}</Link>
      </div>
    </div>
  );
}
