import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

// Constants

const STATUS_CFG = {
  'Pending':            { pill: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400'   },
  'Preparing':          { pill: 'bg-sky-50 text-sky-700 border-sky-200',             dot: 'bg-sky-400'     },
  'Out for Delivery':   { pill: 'bg-violet-50 text-violet-700 border-violet-200',    dot: 'bg-violet-400'  },
  'Delivered':          { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  'Cancelled':          { pill: 'bg-gray-100 text-gray-500 border-gray-200',         dot: 'bg-gray-300'    },
};

const ORDER_TYPE_CFG = {
  'Ready-made':   { pill: 'bg-gray-50 text-gray-500 border-gray-200'        },
  'AI-generated': { pill: 'bg-violet-50 text-violet-600 border-violet-200'  },
  'Mixed':        { pill: 'bg-sky-50 text-sky-600 border-sky-200'           },
};

const TYPE_FILTERS = ['All', 'Ready-made', 'AI-generated', 'Mixed'];
const STATUS_FILTERS = ['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const PAYMENT_KEYS = { cash: 'pay.cash', card: 'pay.card', bank: 'pay.bank' };

// Helpers

function loadOrders() {
  let main = [];
  try {
    const raw = localStorage.getItem('floradesigner_orders');
    const parsed = raw ? JSON.parse(raw) : [];
    main = Array.isArray(parsed) ? parsed : [];
  } catch { main = []; }

  let last = null;
  try {
    const raw = localStorage.getItem('floradesigner_last_order');
    last = raw ? JSON.parse(raw) : null;
  } catch { last = null; }

  let merged = [...main];
  if (last) {
    const lastId = last._id ? String(last._id) : (last.id || '');
    if (lastId) {
      const isDuplicate = merged.some(
        (o) => (o._id ? String(o._id) : (o.id || '')) === lastId
      );
      if (!isDuplicate) merged.push(last);
    }
  }

  const positionOf = new Map(merged.map((o, i) => [o, i]));

  merged.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : NaN;
    const aValid = !isNaN(aTime);
    const bValid = !isNaN(bTime);
    if (aValid && bValid) return bTime - aTime;
    if (aValid) return -1;
    if (bValid) return 1;
    return positionOf.get(b) - positionOf.get(a);
  });

  return merged;
}

function sortNewestFirst(orders) {
  return [...orders].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : NaN;
    const aValid = !isNaN(aTime);
    const bValid = !isNaN(bTime);
    if (aValid && bValid) return bTime - aTime;
    if (aValid) return -1;
    if (bValid) return 1;
    return 0;
  });
}

function getOrderId(o) {
  return o._id ? String(o._id) : (o.id || '');
}

function formatOrderType(raw) {
  if (!raw || raw === 'ready-made') return 'Ready-made';
  if (raw === 'AI-generated bouquet') return 'AI-generated';
  if (raw === 'mixed') return 'Mixed';
  return 'Ready-made';
}

function formatDeliveryDate(dateStr, language) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const locale = language === 'ka' ? 'ka-GE' : 'en-US';
  return new Date(+y, +m - 1, +d).toLocaleDateString(locale, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatCreatedAt(isoStr, language) {
  if (!isoStr) return null;
  try {
    const locale = language === 'ka' ? 'ka-GE' : 'en-US';
    return new Date(isoStr).toLocaleDateString(locale, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return null; }
}

// Icon components

function IconChevron({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconFlowerEmpty({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 7c0-2.5-2-4-4-3S5.5 7.5 8 9c-2.5.5-4 2.5-3 4.5S8.5 15 10 13.5c-.5 2.5 1 4 2 4s2.5-1.5 2-4c1.5 1.5 4 1 4.5-1S17 8 14.5 8c2.5-1.5 2.5-4.5 0-5S12 4.5 12 7z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" strokeWidth={0} />
    </svg>
  );
}

// Sub-components

function StatusBadge({ status, t }) {
  const c = STATUS_CFG[status] || STATUS_CFG['Pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-1 ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {t(status || 'Pending')}
    </span>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200 ${
        active
          ? 'bg-flora-600 text-white border-flora-600 shadow-sm'
          : 'bg-white text-gray-500 border-gray-200 hover:border-flora-300 hover:text-flora-600'
      }`}
    >
      {label}
    </button>
  );
}

function OrderHistoryCard({ order }) {
  const [open, setOpen] = useState(false);
  const { t, formatCurrency, language } = useLanguage();
  const oid = getOrderId(order);
  const status = order.status || 'Pending';
  const typeLabel = formatOrderType(order.orderType);
  const typePill = (ORDER_TYPE_CFG[typeLabel] || ORDER_TYPE_CFG['Ready-made']).pill;
  const count = order.items?.length || 0;
  const createdAt = formatCreatedAt(order.createdAt, language);
  const isBackend = !!(order._id || order.savedToBackend === true);
  const paymentKey = PAYMENT_KEYS[order.paymentMethod];

  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-gray-300 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md tracking-wider">
              #{oid.slice(-8).toUpperCase()}
            </span>
            <StatusBadge status={status} t={t} />
            <span className={`text-xs border rounded-full px-2.5 py-1 font-medium ${typePill}`}>
              {t(typeLabel)}
            </span>
            {isBackend ? (
              <span className="text-xs border rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-600 border-emerald-200">
                {t('history.saved')}
              </span>
            ) : (
              <span className="text-xs border rounded-full px-2 py-0.5 bg-amber-50 text-amber-600 border-amber-200">
                {t('history.demo')}
              </span>
            )}
          </div>
          {createdAt && (
            <span className="text-xs text-gray-300">{createdAt}</span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-0.5">{t('history.delivery')}</p>
            <p className="text-sm font-semibold text-gray-800">{formatDeliveryDate(order.deliveryDate, language)}</p>
            <p className="text-xs text-gray-400">{order.deliveryTime}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-0.5">{t('history.items')}</p>
            <p className="text-sm font-semibold text-gray-800">{count} {t('history.items')}</p>
            <p className="text-xs text-gray-400 capitalize">
              {paymentKey ? t(paymentKey) : (order.paymentMethod || '')}
            </p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-0.5">{t('history.ordertotal')}</p>
            <p className="text-xl font-bold text-flora-600 tabular-nums">
              {formatCurrency(order.totalPrice || 0)}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-300">
            {order.customerName && `${t('history.for')} ${order.customerName}`}
          </p>
          <button
            onClick={() => setOpen((p) => !p)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-flora-500 hover:text-flora-700 transition-colors duration-200"
          >
            {open ? t('history.hidedetails') : t('history.showdetails')}
            <IconChevron className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: open ? '2000px' : '0px',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        <div className="border-t border-gray-50 bg-gray-50/60 px-4 md:px-5 py-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-300 font-medium mb-1">
                {t('history.address')}
              </p>
              <p className="text-gray-700 leading-relaxed">{order.address}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-300 font-medium mb-1">
                {t('history.paymethod')}
              </p>
              <p className="text-gray-700">
                {paymentKey ? t(paymentKey) : (order.paymentMethod || 'N/A')}
              </p>
            </div>
            {order.note && (
              <div className="md:col-span-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-300 font-medium mb-1">
                  {t('history.note.label')}
                </p>
                <p className="text-gray-600 italic">"{order.note}"</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 font-medium mb-2">
              {t('history.items.title')}
            </p>
            <div className="space-y-2">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl ring-1 ring-black/5 p-3 flex items-center gap-3">
                  {item.imageUrl && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-flora-50 shrink-0">
                      <img
                        src={item.imageUrl || FALLBACK_BOUQUET_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      {item.itemType === 'ai-generated' && (
                        <span className="text-[10px] font-semibold bg-violet-50 text-violet-500 border border-violet-100 rounded-full px-1.5 py-0.5">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {item.category} &middot; Qty {item.quantity}
                    </p>
                    {item.itemType === 'ai-generated' && item.prompt && (
                      <p className="text-xs text-gray-500 italic mt-0.5 leading-relaxed">
                        "{item.prompt.slice(0, 80)}{item.prompt.length > 80 ? '...' : ''}"
                      </p>
                    )}
                    {item.itemType === 'ai-generated' && item.generatedDesignId && (
                      <p className="text-[10px] text-gray-300 font-mono mt-0.5 break-all">
                        Design ID: {item.generatedDesignId}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-600 shrink-0 tabular-nums">
                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 text-sm">
              <span className="text-gray-400">{t('history.total.label')}</span>
              <span className="font-bold text-gray-800 tabular-nums">
                {formatCurrency(order.totalPrice || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page

export default function OrderHistory() {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrders();
        const backendOrders = Array.isArray(data) ? data : [];

        const backendIds = new Set(backendOrders.map(o => String(o._id)));
        const localOnly = loadOrders().filter(o => {
          if (o.savedToBackend === true) return false;
          if (o._id && backendIds.has(String(o._id))) return false;
          return true;
        });

        setAllOrders(sortNewestFirst([...backendOrders, ...localOnly]));
        setSource(localOnly.length > 0 ? 'merged' : 'backend');
      } catch {
        setAllOrders(loadOrders());
        setSource('local');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return allOrders.filter((order) => {
      const typeMatch = typeFilter === 'All' || formatOrderType(order.orderType) === typeFilter;
      const statusMatch = statusFilter === 'All' || (order.status || 'Pending') === statusFilter;
      return typeMatch && statusMatch;
    });
  }, [allOrders, typeFilter, statusFilter]);

  const isFiltering = typeFilter !== 'All' || statusFilter !== 'All';

  const headerText = loading
    ? t('history.loading')
    : allOrders.length === 0
    ? t('history.empty')
    : t('history.count', { count: allOrders.length });

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both; }
      `}</style>

      <div className="max-w-3xl mx-auto">

        <div className="fade-up mb-8">
          <h1 className="page-title mb-1">{t('history.title')}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <p className="text-sm text-gray-400">{headerText}</p>
            {!loading && source === 'backend' && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('history.source.backend')}
              </span>
            )}
            {!loading && source === 'merged' && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('history.source.merged')}
              </span>
            )}
            {!loading && source === 'local' && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {t('history.source.local')}
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl ring-1 ring-black/5 p-4 md:p-5 animate-pulse space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-100 rounded-full w-24" />
                  <div className="h-5 bg-gray-100 rounded-full w-16" />
                  <div className="h-5 bg-gray-100 rounded-full w-12" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-10 bg-gray-100 rounded-lg" />
                  <div className="h-10 bg-gray-100 rounded-lg" />
                  <div className="h-10 bg-gray-100 rounded-lg" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-32" />
              </div>
            ))}
          </div>
        )}

        {!loading && allOrders.length > 0 && (
          <div
            className="fade-up flex flex-wrap items-center justify-between gap-3 mb-5"
            style={{ animationDelay: '60ms' }}
          >
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((f) => (
                <FilterPill
                  key={f}
                  label={t(f)}
                  active={typeFilter === f}
                  onClick={() => setTypeFilter(f)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">{t('history.status')}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-flora-200 cursor-pointer"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>{t(s)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {!loading && isFiltering && allOrders.length > 0 && (
          <p className="text-xs text-gray-400 mb-4">
            {t('history.filter.showing', { count: filtered.length, total: allOrders.length })}
          </p>
        )}

        {!loading && allOrders.length === 0 && (
          <div className="fade-up text-center py-20" style={{ animationDelay: '80ms' }}>
            <div className="w-16 h-16 bg-flora-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <IconFlowerEmpty className="w-7 h-7 text-flora-200" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('history.nofound.title')}</h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-7">{t('history.nofound.desc')}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/products" className="btn-primary">{t('history.nofound.btn1')}</Link>
              <Link to="/designer" className="btn-outline">{t('history.nofound.btn2')}</Link>
            </div>
          </div>
        )}

        {!loading && allOrders.length > 0 && filtered.length === 0 && (
          <div className="text-center py-14">
            <p className="text-sm text-gray-400 mb-3">{t('history.nomatch')}</p>
            <button
              onClick={() => { setTypeFilter('All'); setStatusFilter('All'); }}
              className="text-xs text-flora-500 hover:text-flora-700 hover:underline transition-colors"
            >
              {t('history.clearfilters')}
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((order, i) => (
              <div
                key={getOrderId(order)}
                className="fade-up"
                style={{ animationDelay: `${100 + i * 50}ms` }}
              >
                <OrderHistoryCard order={order} />
              </div>
            ))}
          </div>
        )}

        {!loading && allOrders.length > 0 && (
          <div
            className="fade-up flex flex-col sm:flex-row justify-center gap-3 mt-10"
            style={{ animationDelay: `${100 + filtered.length * 50}ms` }}
          >
            <Link to="/products" className="btn-primary text-center">{t('history.continue')}</Link>
            <Link to="/designer" className="btn-outline text-center">{t('history.tryai')}</Link>
          </div>
        )}
      </div>
    </>
  );
}
