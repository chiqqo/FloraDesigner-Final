import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder as createOrderApi } from '../services/api';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

const INITIAL_FORM = {
  customerName: '',
  phone: '',
  address: '',
  deliveryDate: '',
  deliveryTime: '',
  note: '',
  paymentMethod: '',
};

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { t, formatCurrency } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const total = getCartTotal();
  const today = new Date().toISOString().split('T')[0];

  const PAYMENT_OPTIONS = [
    { value: 'cash', label: t('pay.cash'), desc: t('pay.cash.desc') },
    { value: 'card', label: t('pay.card'), desc: t('pay.card.desc') },
    { value: 'bank', label: t('pay.bank'), desc: t('pay.bank.desc') },
  ];

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">*</p>
        <h1 className="page-title">{t('checkout.title')}</h1>
        <p className="text-gray-500 mb-6">{t('checkout.empty.text')}</p>
        <Link to="/products" className="btn-primary">{t('checkout.empty.btn')}</Link>
      </div>
    );
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.customerName.trim()) e.customerName = t('err.name');
    if (!form.phone.trim()) e.phone = t('err.phone');
    if (!form.address.trim()) e.address = t('err.address');
    if (!form.deliveryDate) e.deliveryDate = t('err.date');
    if (!form.deliveryTime) e.deliveryTime = t('err.time');
    if (!form.paymentMethod) e.paymentMethod = t('err.payment');
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    const allReadyMade = cartItems.every((i) => i.itemType === 'ready-made');
    const allAI = cartItems.every((i) => i.itemType === 'ai-generated');
    const orderPayload = {
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      paymentMethod: form.paymentMethod,
      note: form.note.trim(),
      items: cartItems,
      totalPrice: total,
      status: 'Pending',
      orderType: allReadyMade ? 'ready-made' : allAI ? 'AI-generated bouquet' : 'mixed',
    };

    let savedOrder;
    try {
      const backendOrder = await createOrderApi(orderPayload);
      savedOrder = { ...backendOrder, savedToBackend: true };
    } catch {
      savedOrder = {
        ...orderPayload,
        id: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        savedToBackend: false,
      };
    }

    try {
      const existing = JSON.parse(localStorage.getItem('floradesigner_orders') || '[]');
      localStorage.setItem('floradesigner_orders', JSON.stringify([...existing, savedOrder]));
      localStorage.setItem('floradesigner_last_order', JSON.stringify(savedOrder));
    } catch {}

    clearCart();
    navigate('/order-success');
  }

  const inputClass = (field) =>
    `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 bg-white ${
      errors[field] ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div>
      <h1 className="page-title">{t('checkout.title')}</h1>
      <p className="text-gray-500 mb-8">{t('checkout.subtitle')}</p>

      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={handleSubmit} className="flex-1 space-y-6" noValidate>
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">{t('checkout.delivery.title')}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.name')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setField('customerName', e.target.value)}
                placeholder="Jane Doe"
                className={inputClass('customerName')}
              />
              <FieldError msg={errors.customerName} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.phone')} <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+995 555 000 000"
                className={inputClass('phone')}
              />
              <FieldError msg={errors.phone} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.address')} <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="თბილისი, ქუჩა, ნომერი..."
                className={`${inputClass('address')} resize-none`}
              />
              <FieldError msg={errors.address} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.date')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  min={today}
                  onChange={(e) => setField('deliveryDate', e.target.value)}
                  className={inputClass('deliveryDate')}
                />
                <FieldError msg={errors.deliveryDate} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.timeslot')} <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.deliveryTime}
                  onChange={(e) => setField('deliveryTime', e.target.value)}
                  className={inputClass('deliveryTime')}
                >
                  <option value="">{t('checkout.time.select')}</option>
                  <option value="9:00 AM - 12:00 PM">9:00 – 12:00</option>
                  <option value="12:00 PM - 3:00 PM">12:00 – 15:00</option>
                  <option value="3:00 PM - 6:00 PM">15:00 – 18:00</option>
                  <option value="6:00 PM - 9:00 PM">18:00 – 21:00</option>
                </select>
                <FieldError msg={errors.deliveryTime} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.note')}{' '}
                <span className="text-gray-400 font-normal">{t('checkout.note.optional')}</span>
              </label>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setField('note', e.target.value)}
                placeholder={t('checkout.note.placeholder')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 resize-none bg-white"
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-1">{t('checkout.payment.title')}</h2>
            <p className="text-xs text-gray-400 mb-4">{t('checkout.payment.note')}</p>
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition ${
                    form.paymentMethod === opt.value
                      ? 'border-flora-500 bg-flora-50'
                      : 'border-gray-200 hover:border-flora-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={form.paymentMethod === opt.value}
                    onChange={() => setField('paymentMethod', opt.value)}
                    className="mt-0.5 accent-flora-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <FieldError msg={errors.paymentMethod} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('checkout.placing') : t('checkout.submit')}
            </button>
            <Link to="/cart" className="btn-outline text-center">
              {t('checkout.back')}
            </Link>
          </div>
        </form>

        <div className="lg:w-80 shrink-0">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">{t('checkout.summary')}</h2>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-flora-50 shrink-0">
                    <img
                      src={item.imageUrl || FALLBACK_BOUQUET_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{t('checkout.qty')} {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 shrink-0">
                    {formatCurrency((item.price || 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{t('checkout.subtotal')}</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{t('checkout.delivery.free')}</span>
                <span className="text-green-600 font-medium">{t('checkout.free')}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t border-gray-100">
                <span>{t('checkout.total')}</span>
                <span className="text-flora-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
