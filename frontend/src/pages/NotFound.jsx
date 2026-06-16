import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-6xl font-bold text-flora-200 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-gray-700 mb-3">Page Not Found</h1>
      <p className="text-gray-400 mb-8">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
