import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { getCartItemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const cartCount = getCartItemCount();

  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-flora-600 font-semibold'
      : 'text-gray-600 hover:text-flora-500 transition-colors';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-flora-700 tracking-tight">
          FloraDesigner
        </Link>

        <div className="flex items-center gap-7 text-sm font-medium">
          <NavLink to="/" end className={linkClass}>{t('nav.home')}</NavLink>
          <NavLink to="/products" className={linkClass}>{t('nav.shop')}</NavLink>
          <NavLink to="/designer" className={linkClass}>{t('nav.ai')}</NavLink>
          <NavLink to="/about" className={linkClass}>{t('nav.about')}</NavLink>
          <NavLink to="/contact" className={linkClass}>{t('nav.contact')}</NavLink>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === 'ka' ? 'en' : 'ka')}
            className="text-xs font-semibold border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:border-flora-400 hover:text-flora-600 transition-all"
            aria-label="Switch language"
          >
            {language === 'ka' ? 'EN' : 'ქართული'}
          </button>
          <NavLink to="/orders" className={linkClass}>{t('nav.orders')}</NavLink>
          <NavLink to="/cart" className={linkClass}>
            {({ isActive }) => (
              <span className={isActive ? 'text-flora-600 font-semibold' : 'text-gray-600 hover:text-flora-500 transition-colors'}>
                {t('nav.cart')}
                {cartCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center bg-flora-600 text-white text-xs font-bold rounded-full w-5 h-5">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
