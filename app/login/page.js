'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setAuth, isAuthenticated } from '@/lib/auth';
import { t } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState('vi');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard');
    const saved = localStorage.getItem('farmtrack_lang');
    if (saved) setLang(saved);
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(phone, password);
      setAuth(data.token, data.user);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleLang() {
    const next = lang === 'vi' ? 'ja' : 'vi';
    setLang(next);
    localStorage.setItem('farmtrack_lang', next);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-600 flex items-center justify-center p-4">
      {/* Lang toggle */}
      <button
        onClick={toggleLang}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-3 py-1.5 rounded-full border border-white/30 transition"
      >
        {lang === 'vi' ? 'VI → JP' : 'JP → VI'}
      </button>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🐔</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{t('appName', lang)}</h1>
          <p className="text-primary-100 text-sm mt-1">{t('loginSubtitle', lang)}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('loginTitle', lang)}</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone', lang)}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input-field"
                placeholder="0912345678"
                required
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password', lang)}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {t('loading', lang)}
                </span>
              ) : t('login', lang)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
