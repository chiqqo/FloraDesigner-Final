import { useState } from 'react';
import { createContactMessage } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [savedToBackend, setSavedToBackend] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function setField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t('err.name.contact');
    if (!form.email.trim()) {
      e.email = t('err.email.required');
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = t('err.email.invalid');
    }
    if (!form.message.trim()) e.message = t('err.message');
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    let backendSaved = false;

    try {
      await createContactMessage(form);
      backendSaved = true;
    } catch {}

    try {
      const existing = JSON.parse(localStorage.getItem('floradesigner_contact_messages') || '[]');
      existing.push({ ...form, submittedAt: new Date().toISOString(), savedToBackend: backendSaved });
      localStorage.setItem('floradesigner_contact_messages', JSON.stringify(existing));
    } catch {}

    setSavedToBackend(backendSaved);
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('contact.success.title')}</h2>
        <p className="text-gray-500 mb-4 max-w-sm mx-auto">
          {t('contact.success.desc', { name: form.name })}
        </p>
        <p className="text-xs text-gray-300 mb-6">
          {savedToBackend ? t('contact.success.backend') : t('contact.success.local')}
        </p>
        <button
          onClick={() => { setForm({ name: '', email: '', message: '' }); setSubmitted(false); }}
          className="btn-outline"
        >
          {t('contact.success.another')}
        </button>
      </div>
    );
  }

  const inputClass = (field) =>
    `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 ${
      errors[field] ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="page-title">{t('contact.title')}</h1>
      <p className="text-gray-500 mb-8">{t('contact.subtitle')}</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('contact.name')} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder={t('contact.name')}
            className={inputClass('name')}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('contact.email')} <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="your@email.com"
            className={inputClass('email')}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('contact.message')} <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={5}
            value={form.message}
            onChange={(e) => setField('message', e.target.value)}
            placeholder={t('contact.message') + '...'}
            className={`${inputClass('message')} resize-none`}
          />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? t('contact.sending') : t('contact.send')}
        </button>
      </form>
    </div>
  );
}
