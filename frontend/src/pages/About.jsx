import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  const FEATURES = [
    { titleKey: 'about.f1.title', descKey: 'about.f1.desc' },
    { titleKey: 'about.f2.title', descKey: 'about.f2.desc' },
    { titleKey: 'about.f3.title', descKey: 'about.f3.desc' },
    { titleKey: 'about.f4.title', descKey: 'about.f4.desc' },
    { titleKey: 'about.f5.title', descKey: 'about.f5.desc' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title">{t('about.title')}</h1>
      <p className="text-gray-500 mb-8 leading-relaxed">{t('about.desc')}</p>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('about.features')}</h2>
      <div className="space-y-3 mb-10">
        {FEATURES.map((f) => (
          <div key={f.titleKey} className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-1">{t(f.titleKey)}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t(f.descKey)}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{t('about.techstack')}</h2>
        <ul className="text-gray-500 text-sm space-y-1.5 list-disc list-inside">
          <li>React 18 + Vite (Frontend)</li>
          <li>Node.js + Express (Backend REST API)</li>
          <li>MongoDB + Mongoose (Database)</li>
          <li>Tailwind CSS (Styling)</li>
          <li>React Router v6 (Navigation)</li>
        </ul>
        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
          {t('about.note')}
        </p>
      </div>
    </div>
  );
}
