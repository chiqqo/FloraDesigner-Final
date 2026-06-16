import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin as adminLoginApi } from '../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function setField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
    if (loginError) setLoginError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const e2 = {};
    if (!form.username.trim()) e2.username = 'Username is required.';
    if (!form.password) e2.password = 'Password is required.';
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }

    setSubmitting(true);
    try {
      const data = await adminLoginApi({ username: form.username.trim(), password: form.password });
      sessionStorage.setItem('floradesigner_admin_key', data.token);
      if (data.username) sessionStorage.setItem('floradesigner_admin_user', data.username);
      navigate('/admin/dashboard');
    } catch {
      setLoginError('Incorrect username or password.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field) =>
    `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 ${
      errors[field] ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="page-title text-center">Admin Login</h1>
      <p className="text-gray-400 text-sm text-center mb-8">Demo admin area</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
        {loginError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            {loginError}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setField('username', e.target.value)}
            placeholder="admin"
            className={inputClass('username')}
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            className={inputClass('password')}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-[11px] text-gray-300 text-center pt-1">
          Credentials validated server-side.
        </p>
      </form>
    </div>
  );
}
