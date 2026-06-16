import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { products as mockProducts } from '../data/products';
import { getOrders, updateOrderStatus, getGeneratedDesigns, getProducts, getContactMessages } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// Constants

const STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const STATUS_CFG = {
  'Pending':            { pill: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400',   bar: 'border-l-amber-400'   },
  'Preparing':          { pill: 'bg-sky-50 text-sky-700 border-sky-200',             dot: 'bg-sky-400',     bar: 'border-l-sky-400'     },
  'Out for Delivery':   { pill: 'bg-violet-50 text-violet-700 border-violet-200',    dot: 'bg-violet-400',  bar: 'border-l-violet-400'  },
  'Delivered':          { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', bar: 'border-l-emerald-400' },
  'Cancelled':          { pill: 'bg-gray-100 text-gray-500 border-gray-200',         dot: 'bg-gray-300',    bar: 'border-l-gray-200'    },
};

const ORDER_TYPE_CFG = {
  'Ready-made':   { pill: 'bg-gray-50 text-gray-500 border-gray-200'         },
  'AI-generated': { pill: 'bg-violet-50 text-violet-600 border-violet-200'   },
  'Mixed':        { pill: 'bg-sky-50 text-sky-600 border-sky-200'            },
};

// Helpers

function getOrderId(o) {
  return o._id ? String(o._id) : (o.id || '');
}

function formatOrderType(raw) {
  if (!raw || raw === 'ready-made') return 'Ready-made';
  if (raw === 'AI-generated bouquet') return 'AI-generated';
  if (raw === 'mixed') return 'Mixed';
  return 'Ready-made';
}

function isBackendOrder(order) {
  return !!order._id || order.savedToBackend === true;
}

function loadLocalOrders() {
  try { return JSON.parse(localStorage.getItem('floradesigner_orders') || '[]'); } catch { return []; }
}

function loadLocalDesignCount() {
  try { return JSON.parse(localStorage.getItem('floradesigner_generated_designs') || '[]').length; } catch { return 0; }
}

function loadLocalContactMessages() {
  try { return JSON.parse(localStorage.getItem('floradesigner_contact_messages') || '[]'); } catch { return []; }
}

// Upsert: update existing local copy or append a new one if not present.
function patchLocalStatus(order, status) {
  try {
    const oid = getOrderId(order);
    const stored = loadLocalOrders();
    const exists = stored.some(o => getOrderId(o) === oid);
    const updated = exists
      ? stored.map(o => getOrderId(o) === oid ? { ...o, status } : o)
      : [...stored, { ...order, status }];
    localStorage.setItem('floradesigner_orders', JSON.stringify(updated));
  } catch {}
}

// Icon components

function IconFlower({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 7c0-2.5-2-4-4-3S5.5 7.5 8 9c-2.5.5-4 2.5-3 4.5S8.5 15 10 13.5c-.5 2.5 1 4 2 4s2.5-1.5 2-4c1.5 1.5 4 1 4.5-1S17 8 14.5 8c2.5-1.5 2.5-4.5 0-5S12 4.5 12 7z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" strokeWidth={0} />
    </svg>
  );
}

function IconBox({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 11v4M10 13h4" />
    </svg>
  );
}

function IconRevenue({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.6 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.6-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconSparkle({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function IconSignOut({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function IconChevron({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// Stats metadata

const STATS_META = [
  {
    key: 'products',
    label: 'Total Products',
    gradient: 'from-flora-50 to-white',
    iconBg: 'bg-flora-100',
    iconColor: 'text-flora-600',
    Icon: IconFlower,
    delay: '0ms',
  },
  {
    key: 'orders',
    label: 'Total Orders',
    gradient: 'from-amber-50 to-white',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon: IconBox,
    delay: '70ms',
  },
  {
    key: 'revenue',
    label: 'Total Revenue',
    gradient: 'from-emerald-50 to-white',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    Icon: IconRevenue,
    delay: '140ms',
  },
  {
    key: 'ai',
    label: 'AI Designs',
    gradient: 'from-violet-50 to-white',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    Icon: IconSparkle,
    delay: '210ms',
  },
];

// Sub-components

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG['Pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-1 transition-all duration-200 ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {status || 'Pending'}
    </span>
  );
}

function Skel({ className }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

function StatCard({ label, value, iconBg, iconColor, Icon, gradient, delay }) {
  return (
    <div
      className={`fade-up rounded-2xl bg-gradient-to-br ${gradient} ring-1 ring-black/5 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
      style={{ animationDelay: delay }}
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${iconBg} mb-4`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-0.5 tabular-nums">{value}</p>
      <p className="text-xs text-gray-400 font-medium tracking-wide">{label}</p>
    </div>
  );
}

function OrderCard({ order, onStatusChange, updatingIds, formatCurrency }) {
  const [open, setOpen] = useState(false);
  const oid = getOrderId(order);
  const status = order.status || 'Pending';
  const cfg = STATUS_CFG[status] || STATUS_CFG['Pending'];
  const isUpdating = !!updatingIds[oid];
  const count = order.items?.length || 0;
  const orderTypeLabel = formatOrderType(order.orderType);
  const orderTypePill = (ORDER_TYPE_CFG[orderTypeLabel] || ORDER_TYPE_CFG['Ready-made']).pill;
  const isBackend = isBackendOrder(order);

  return (
    <div
      className={`bg-white rounded-2xl ring-1 ring-black/5 border-l-4 ${cfg.bar} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}
    >
      {/* Main row */}
      <div className="p-4 md:p-5">
        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-xs text-gray-300 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md tracking-wider">
            #{oid.slice(-8).toUpperCase()}
          </span>
          <StatusBadge status={status} />
          <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2.5 py-1 ${orderTypePill}`}>
            {orderTypeLabel}
          </span>
          {isBackend ? (
            <span className="text-xs border rounded-full px-2.5 py-1 bg-emerald-50 text-emerald-600 border-emerald-200">
              Backend
            </span>
          ) : (
            <span className="text-xs border rounded-full px-2.5 py-1 bg-amber-50 text-amber-600 border-amber-200">
              Local demo
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-0.5">Customer</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{order.customerName}</p>
            <p className="text-xs text-gray-400 truncate">{order.phone}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-0.5">Delivery</p>
            <p className="text-sm font-medium text-gray-700">{order.deliveryDate}</p>
            <p className="text-xs text-gray-400">{order.deliveryTime}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-0.5">Items</p>
            <p className="text-sm font-medium text-gray-700">
              {count} item{count !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {order.paymentMethod || ''}
            </p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-0.5">Total</p>
            <p className="text-xl font-bold text-flora-600 tabular-nums">
              {formatCurrency(order.totalPrice || 0)}
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300 font-medium">Status</span>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => onStatusChange(order, e.target.value)}
                disabled={isUpdating}
                className="text-xs border border-gray-200 rounded-lg pl-2.5 pr-7 py-1.5 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-flora-200 disabled:opacity-50 cursor-pointer"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <IconChevron className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            {isUpdating && (
              <div className="w-3.5 h-3.5 border-2 border-flora-100 border-t-flora-500 rounded-full animate-spin" />
            )}
          </div>
          <button
            onClick={() => setOpen((p) => !p)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-flora-500 hover:text-flora-700 transition-colors duration-200"
          >
            {open ? 'Collapse' : 'Expand order'}
            <IconChevron className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable detail panel */}
      <div
        style={{
          maxHeight: open ? '1200px' : '0px',
          transition: 'max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        <div className="border-t border-gray-50 bg-gray-50/70 px-4 md:px-5 py-4 space-y-4">
          {/* Address + note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-300 font-medium mb-1">
                Delivery Address
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{order.address}</p>
            </div>
            {order.note && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-300 font-medium mb-1">
                  Florist Note
                </p>
                <p className="text-sm text-gray-600 italic">"{order.note}"</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 font-medium mb-2">
              Items Ordered
            </p>
            <div className="space-y-2">
              {(order.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl ring-1 ring-black/5 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
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
                        <p className="text-xs text-gray-500 italic mt-1 leading-relaxed">
                          "{item.prompt.slice(0, 90)}{item.prompt.length > 90 ? '...' : ''}"
                        </p>
                      )}
                      {item.itemType === 'ai-generated' && item.generatedDesignId && (
                        <p className="text-[10px] text-gray-300 font-mono mt-0.5 break-all">
                          ID: {item.generatedDesignId}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-600 shrink-0 tabular-nums">
                      {formatCurrency((item.price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersSource, setOrdersSource] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [aiCount, setAiCount] = useState(0);
  const [productCount, setProductCount] = useState(mockProducts.length);
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [updatingIds, setUpdatingIds] = useState({});

  useEffect(() => {
    async function load() {
      // Orders: backend returns newest-first; localStorage is oldest-first so reverse it.
      try {
        const data = await getOrders();
        setOrders(Array.isArray(data) ? data : []);
        setOrdersSource('backend');
      } catch {
        setOrders(loadLocalOrders().reverse());
        setOrdersSource('local');
      } finally {
        setLoadingOrders(false);
      }
      // AI design count
      try {
        const d = await getGeneratedDesigns();
        setAiCount(Array.isArray(d) ? d.length : 0);
      } catch {
        setAiCount(loadLocalDesignCount());
      }
      // Product count from backend
      try {
        const p = await getProducts();
        if (Array.isArray(p) && p.length > 0) setProductCount(p.length);
      } catch {
        // keep mockProducts.length fallback already set in initial state
      }
      // Contact messages
      try {
        const msgs = await getContactMessages();
        setContactMessages(Array.isArray(msgs) ? msgs : []);
      } catch {
        setContactMessages(loadLocalContactMessages());
      } finally {
        setLoadingMessages(false);
      }
    }
    load();
  }, []);

  const { formatCurrency } = useLanguage();
  const revenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const statValues = {
    products: String(productCount),
    orders: String(orders.length),
    revenue: formatCurrency(revenue),
    ai: String(aiCount),
  };

  async function handleStatusChange(order, newStatus) {
    const oid = getOrderId(order);
    setUpdatingIds((p) => ({ ...p, [oid]: true }));
    if (order._id) {
      try { await updateOrderStatus(String(order._id), newStatus); }
      catch { patchLocalStatus(order, newStatus); }
    } else {
      patchLocalStatus(order, newStatus);
    }
    setOrders((prev) =>
      prev.map((o) => getOrderId(o) === oid ? { ...o, status: newStatus } : o)
    );
    setUpdatingIds((p) => { const n = { ...p }; delete n[oid]; return n; });
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .fade-up { animation: fadeUp 0.42s cubic-bezier(0.4, 0, 0.2, 1) both; }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="fade-up flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] text-gray-300 uppercase tracking-widest font-medium mb-0.5">
              Operations
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-flora-600 border border-gray-200 hover:border-flora-300 px-3 py-2 rounded-xl transition-all duration-200"
            >
              <IconFlower className="w-4 h-4" />
              Products
            </Link>
            <button
              onClick={() => { sessionStorage.removeItem('floradesigner_admin_key'); sessionStorage.removeItem('floradesigner_admin_user'); navigate('/admin'); }}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-2 rounded-xl transition-all duration-200"
            >
              <IconSignOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {loadingOrders
            ? [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl ring-1 ring-black/5 bg-white p-5 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 mb-4" />
                  <Skel className="h-7 w-14 mb-1.5" />
                  <Skel className="h-3 w-20" />
                </div>
              ))
            : STATS_META.map((sm) => (
                <StatCard
                  key={sm.key}
                  label={sm.label}
                  value={statValues[sm.key]}
                  iconBg={sm.iconBg}
                  iconColor={sm.iconColor}
                  Icon={sm.Icon}
                  gradient={sm.gradient}
                  delay={sm.delay}
                />
              ))}
        </div>

        {/* Orders section */}
        <div className="fade-up" style={{ animationDelay: '280ms' }}>
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Orders
              {!loadingOrders && orders.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({orders.length})
                </span>
              )}
            </h2>
            <div>
              {!loadingOrders && ordersSource === 'backend' && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live from backend
                </span>
              )}
              {!loadingOrders && ordersSource === 'local' && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Demo data - backend offline
                </span>
              )}
            </div>
          </div>

          {/* Loading skeletons */}
          {loadingOrders && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl ring-1 ring-black/5 border-l-4 border-l-gray-100 p-4 animate-pulse space-y-3"
                >
                  <div className="flex gap-2">
                    <Skel className="h-5 w-24" />
                    <Skel className="h-5 w-16" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((j) => <Skel key={j} className="h-8" />)}
                  </div>
                  <Skel className="h-4 w-36" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingOrders && orders.length === 0 && (
            <div className="bg-white rounded-2xl ring-1 ring-black/5 p-16 text-center">
              <div className="w-14 h-14 bg-flora-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconFlower className="w-6 h-6 text-flora-200" />
              </div>
              <p className="text-sm font-medium text-gray-400 mb-1">No orders yet</p>
              <p className="text-xs text-gray-300">
                Orders appear here after customers complete checkout
              </p>
            </div>
          )}

          {/* Order list */}
          {!loadingOrders && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order, i) => (
                <div
                  key={getOrderId(order)}
                  className="fade-up"
                  style={{ animationDelay: `${340 + i * 45}ms` }}
                >
                  <OrderCard
                    order={order}
                    onStatusChange={handleStatusChange}
                    updatingIds={updatingIds}
                    formatCurrency={formatCurrency}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Messages section */}
        <div className="fade-up mt-10" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Contact Messages
              {!loadingMessages && contactMessages.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({contactMessages.length})
                </span>
              )}
            </h2>
          </div>

          {/* Loading skeleton */}
          {loadingMessages && (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="bg-white rounded-2xl ring-1 ring-black/5 p-4 animate-pulse space-y-3">
                  <div className="flex gap-3">
                    <Skel className="h-4 w-32" />
                    <Skel className="h-4 w-40" />
                  </div>
                  <Skel className="h-3 w-full" />
                  <Skel className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingMessages && contactMessages.length === 0 && (
            <div className="bg-white rounded-2xl ring-1 ring-black/5 p-12 text-center">
              <p className="text-sm font-medium text-gray-400 mb-1">No contact messages yet</p>
              <p className="text-xs text-gray-300">
                Messages appear here after visitors submit the contact form
              </p>
            </div>
          )}

          {/* Message list */}
          {!loadingMessages && contactMessages.length > 0 && (
            <div className="space-y-3">
              {contactMessages.map((msg, i) => {
                const id = msg._id ? String(msg._id) : (msg.submittedAt || String(i));
                const date = msg.createdAt || msg.submittedAt;
                const isBackend = !!msg._id;
                return (
                  <div
                    key={id}
                    className="fade-up bg-white rounded-2xl ring-1 ring-black/5 p-4 md:p-5"
                    style={{ animationDelay: `${360 + i * 40}ms` }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-gray-800">{msg.name}</p>
                          <a
                            href={`mailto:${msg.email}`}
                            className="text-xs text-flora-500 hover:text-flora-700 hover:underline transition-colors"
                          >
                            {msg.email}
                          </a>
                          {isBackend ? (
                            <span className="text-xs border rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-600 border-emerald-200">
                              Saved
                            </span>
                          ) : (
                            <span className="text-xs border rounded-full px-2 py-0.5 bg-amber-50 text-amber-600 border-amber-200">
                              Local
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
                      </div>
                      {date && (
                        <span className="text-xs text-gray-300 shrink-0">
                          {new Date(date).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
