import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { products as mockProducts, categories, sizes, occasions } from '../data/products';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

const LS_KEY = 'floradesigner_admin_products';
const getId = (p) => (p._id ? String(p._id) : p.id);

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch { return null; }
}

function lsSave(items) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
}

const CATS = categories.filter((c) => c !== 'All');
const SIZES = sizes.filter((s) => s !== 'All');
const OCCS = occasions.filter((o) => o !== 'All');

const EMPTY_FORM = {
  name: '', description: '', price: '',
  category: CATS[0] || '', colors: '', flowers: '',
  size: SIZES[0] || '', occasion: OCCS[0] || '',
  imageUrl: '', available: true, deliveryInfo: '',
};

function IconEdit({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4.5 1.5 1.5-4.5L16.862 3.487z" />
    </svg>
  );
}

function IconTrash({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconPlus({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconX({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function AdminProducts() {
  const { formatCurrency } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
        setSource('backend');
        lsSave(data);
      } else {
        fromLocalOrMock();
      }
    } catch {
      fromLocalOrMock();
    } finally {
      setLoading(false);
    }
  }

  function fromLocalOrMock() {
    const stored = lsLoad();
    if (stored) {
      setProducts(stored);
      setSource('local');
    } else {
      lsSave(mockProducts);
      setProducts([...mockProducts]);
      setSource('mock');
    }
  }

  const stats = useMemo(() => {
    const avail = products.filter((p) => p.available).length;
    const unavail = products.length - avail;
    const avgPrice = products.length
      ? products.reduce((s, p) => s + (p.price || 0), 0) / products.length
      : 0;
    return { total: products.length, avail, unavail, avgPrice };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !(p.description || '').toLowerCase().includes(q) &&
        !(p.category || '').toLowerCase().includes(q)
      )
        return false;
      if (availFilter === 'Available' && !p.available) return false;
      if (availFilter === 'Unavailable' && p.available) return false;
      return true;
    });
  }, [products, search, availFilter]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErr('');
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      category: product.category || CATS[0] || '',
      colors: (product.colors || []).join(', '),
      flowers: (product.flowers || []).join(', '),
      size: product.size || SIZES[0] || '',
      occasion: product.occasion || OCCS[0] || '',
      imageUrl: product.imageUrl || '',
      available: product.available !== false,
      deliveryInfo: product.deliveryInfo || '',
    });
    setFormErr('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function validate() {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.imageUrl.trim()) return 'Image URL is required.';
    if (!form.category) return 'Category is required.';
    const p = parseFloat(form.price);
    if (isNaN(p) || p <= 0) return 'Price must be greater than 0.';
    return '';
  }

  const onField = (k) => (e) =>
    setForm((prev) => ({
      ...prev,
      [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  async function handleSave() {
    const err = validate();
    if (err) { setFormErr(err); return; }
    setSaving(true);
    setFormErr('');

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      flowers: form.flowers.split(',').map((s) => s.trim()).filter(Boolean),
      size: form.size,
      occasion: form.occasion,
      imageUrl: form.imageUrl.trim(),
      available: form.available,
      deliveryInfo: form.deliveryInfo.trim(),
    };

    if (editing) {
      const pid = getId(editing);
      let updated;
      try {
        updated = await updateProduct(pid, productData);
      } catch {
        updated = { ...editing, ...productData };
      }
      setProducts((prev) => {
        const next = prev.map((p) => getId(p) === pid ? updated : p);
        lsSave(next);
        return next;
      });
    } else {
      let created;
      try {
        created = await createProduct(productData);
      } catch {
        created = { ...productData, id: `local-product-${Date.now()}` };
      }
      setProducts((prev) => {
        const next = [created, ...prev];
        lsSave(next);
        return next;
      });
    }

    setSaving(false);
    closeModal();
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const pid = getId(product);
    setDeletingId(pid);
    if (product._id) {
      try { await deleteProduct(String(product._id)); } catch {}
    }
    setProducts((prev) => {
      const next = prev.filter((p) => getId(p) !== pid);
      lsSave(next);
      return next;
    });
    setDeletingId(null);
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

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="fade-up flex items-center justify-between mb-8">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-[10px] text-gray-300 uppercase tracking-widest font-medium mb-0.5 hover:text-flora-500 transition-colors flex items-center gap-1"
            >
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-flora-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-flora-700 transition-colors shadow-sm"
          >
            <IconPlus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Source banner */}
        {!loading && source === 'local' && (
          <div className="fade-up bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-6">
            Backend offline - managing products locally. Changes save to your browser.
          </div>
        )}
        {!loading && source === 'mock' && (
          <div className="fade-up bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3 mb-6">
            Seeded from demo products. Add, edit, or delete to customize your catalog.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: String(stats.total) },
            { label: 'Available', value: String(stats.avail) },
            { label: 'Unavailable', value: String(stats.unavail) },
            { label: 'Avg. Price', value: formatCurrency(stats.avgPrice) },
          ].map((s, i) => (
            <div
              key={s.label}
              className="fade-up rounded-2xl bg-white ring-1 ring-black/5 p-5 shadow-sm"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <p className="text-2xl font-bold text-gray-800 tabular-nums">{loading ? '-' : s.value}</p>
              <p className="text-xs text-gray-400 font-medium tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="fade-up flex flex-col sm:flex-row gap-3 mb-5" style={{ animationDelay: '280ms' }}>
          <input
            type="text"
            placeholder="Search by name, description, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-flora-300 shadow-sm"
          />
          <div className="flex gap-2">
            {['All', 'Available', 'Unavailable'].map((label) => (
              <button
                key={label}
                onClick={() => setAvailFilter(label)}
                className={`text-sm px-4 py-2 rounded-xl border transition-colors ${
                  availFilter === label
                    ? 'bg-flora-600 text-white border-flora-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-flora-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <p className="text-xs text-gray-400 mb-4">
            Showing {filtered.length} of {products.length} products
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-full mt-1" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-16 text-center">
            <p className="text-gray-400 mb-1">No products found.</p>
            {search || availFilter !== 'All' ? (
              <button
                onClick={() => { setSearch(''); setAvailFilter('All'); }}
                className="text-sm text-flora-600 underline mt-1"
              >
                Clear filters
              </button>
            ) : (
              <button onClick={openAdd} className="text-sm text-flora-600 underline mt-1">
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => {
              const pid = getId(product);
              const isDeleting = deletingId === pid;
              return (
                <div
                  key={pid}
                  className={`fade-up bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="relative h-44 bg-flora-50 overflow-hidden">
                    <img
                      src={product.imageUrl || FALLBACK_BOUQUET_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={handleImageError}
                    />
                    <span
                      className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full border ${
                        product.available
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}
                    >
                      {product.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="absolute top-2 left-2 bg-white text-flora-600 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-800 mb-0.5 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-1">
                      {product.size} &middot; {product.occasion}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-flora-600">
                        {formatCurrency(product.price || 0)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm border border-flora-300 text-flora-600 px-3 py-2 rounded-lg hover:bg-flora-50 transition"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm border border-red-100 text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 hover:border-red-200 transition"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-semibold text-gray-800">
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-50"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {formErr && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formErr}
                </p>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={onField('name')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300"
                  placeholder="e.g. Rose Romance"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={onField('description')}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 resize-none"
                  placeholder="A beautiful arrangement of..."
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Price (GEL) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={onField('price')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300"
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={onField('category')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 bg-white"
                  >
                    {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Size + Occasion */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Size
                  </label>
                  <select
                    value={form.size}
                    onChange={onField('size')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 bg-white"
                  >
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Occasion
                  </label>
                  <select
                    value={form.occasion}
                    onChange={onField('occasion')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 bg-white"
                  >
                    {OCCS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Colors + Flowers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Colors
                  </label>
                  <input
                    type="text"
                    value={form.colors}
                    onChange={onField('colors')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300"
                    placeholder="Red, Pink, White"
                  />
                  <p className="text-[10px] text-gray-300 mt-0.5">Comma-separated</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Flowers
                  </label>
                  <input
                    type="text"
                    value={form.flowers}
                    onChange={onField('flowers')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300"
                    placeholder="Roses, Lilies"
                  />
                  <p className="text-[10px] text-gray-300 mt-0.5">Comma-separated</p>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Image URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={onField('imageUrl')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Delivery info */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Delivery Info
                </label>
                <input
                  type="text"
                  value={form.deliveryInfo}
                  onChange={onField('deliveryInfo')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300"
                  placeholder="Delivered in 1-2 days"
                />
              </div>

              {/* Available */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={onField('available')}
                  className="accent-flora-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Available (In Stock)</span>
              </label>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={closeModal}
                className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-sm bg-flora-600 text-white px-5 py-2 rounded-xl hover:bg-flora-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
