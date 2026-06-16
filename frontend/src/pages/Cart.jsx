import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { t, formatCurrency } = useLanguage();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">*</p>
        <h1 className="page-title">{t('cart.title')}</h1>
        <p className="text-gray-500 mb-6">{t('cart.empty.text')}</p>
        <Link to="/products" className="btn-primary">{t('cart.empty.btn')}</Link>
      </div>
    );
  }

  const total = getCartTotal();

  function itemTypeLabel(item) {
    if (item.itemType === 'ai-generated') return t('cart.item.ai');
    if (item.itemType === 'ready-made') return t('cart.item.ready');
    return t('cart.item.custom');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title mb-0">{t('cart.title')}</h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-400 hover:text-red-500 transition"
        >
          {t('cart.clear')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="card flex gap-4 p-4 items-start">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-flora-50 shrink-0">
                <img
                  src={item.imageUrl || FALLBACK_BOUQUET_IMAGE}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.category} &middot; {itemTypeLabel(item)}
                    </p>
                    {item.itemType === 'ai-generated' && item.prompt && (
                      <p className="text-xs text-gray-400 italic mt-0.5 truncate max-w-xs">
                        "{item.prompt.slice(0, 60)}{item.prompt.length > 60 ? '...' : ''}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-red-400 transition shrink-0 text-lg leading-none"
                    aria-label="Remove item"
                  >
                    x
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-gray-800 text-sm font-medium min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">{formatCurrency(item.price || 0)} {t('cart.each')}</p>
                    <p className="font-bold text-flora-600">
                      {formatCurrency((item.price || 0) * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-72 shrink-0">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">{t('cart.summary')}</h2>

            <div className="space-y-2 mb-4 text-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-500">
                  <span className="truncate mr-2">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="shrink-0">{formatCurrency((item.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 mb-6">
              <div className="flex justify-between font-bold text-gray-800">
                <span>{t('cart.total')}</span>
                <span className="text-flora-600">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{t('cart.shipping')}</p>
            </div>

            <Link to="/checkout" className="btn-primary block text-center w-full">
              {t('cart.checkout')}
            </Link>

            <Link to="/products" className="block text-center text-sm text-flora-600 hover:underline mt-3">
              {t('cart.continueshop')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
