'use client';
import { useState, useEffect } from 'react';
import AppShell, { useLang } from '@/components/AppShell';
import { flocksApi, housesApi } from '@/lib/api';
import { t } from '@/lib/i18n';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FlocksContent() {
  const { lang } = useLang();
  const [flocks, setFlocks]   = useState([]);
  const [houses, setHouses]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch]   = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    breed: '', house_id: '', initial_count: '',
    hatch_date: '', entry_date: '', notes: ''
  });

  async function load() {
    setLoading(true);
    try {
      const [f, h] = await Promise.allSettled([flocksApi.getAll(), housesApi.getAll()]);
      if (f.status === 'fulfilled') setFlocks(f.value);
      if (h.status === 'fulfilled') setHouses(h.value);
    } catch(e) {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await flocksApi.create({
        breed: form.breed,
        house_id: parseInt(form.house_id),
        initial_count: parseInt(form.initial_count),
        hatch_date: form.hatch_date,
        entry_date: form.entry_date,
        notes: form.notes,
      });
      setShowAdd(false);
      setForm({ breed: '', house_id: '', initial_count: '', hatch_date: '', entry_date: '', notes: '' });
      await load();
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const filtered = flocks.filter(f =>
    f.breed?.toLowerCase().includes(search.toLowerCase()) ||
    String(f.house_id || f.houseId || '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('flocks', lang)}</h1>
          <p className="text-gray-400 text-sm mt-1">{t('flockList', lang)}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <span>+</span> {t('addFlock', lang)}
        </button>
      </div>

      {/* Search */}
      <div className="card py-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder', lang)}
          className="input-field max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">{t('loading', lang)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{t('noData', lang)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['ID', t('breed',lang), t('houseId',lang), t('initialCount',lang),
                    t('currentCount',lang), t('entryDate',lang), t('status',lang)].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 font-mono">#{f.id}</td>
                    <td className="px-4 py-3 font-semibold">{f.breed}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                        {f.house_id || f.houseId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{(f.initial_count || f.initialCount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-primary-700">
                      {(f.current_count || f.currentCount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{f.entry_date || f.entryDate || '--'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        (f.status === 'active')
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {f.status === 'active' ? t('active', lang) : t('inactive', lang)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title={t('addFlock', lang)} onClose={() => { setShowAdd(false); setError(''); }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-4">{error}</div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('breed', lang)}</label>
              <input className="input-field" required value={form.breed}
                onChange={e => setForm({...form, breed: e.target.value})} placeholder="Ross 308, Lương Phượng..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('houseId', lang)}</label>
              {houses.length > 0 ? (
                <select className="input-field" required value={form.house_id}
                  onChange={e => setForm({...form, house_id: e.target.value})}>
                  <option value="">-- Chọn chuồng --</option>
                  {houses.map(h => <option key={h.id} value={h.id}>{h.name || `Chuồng #${h.id}`}</option>)}
                </select>
              ) : (
                <input className="input-field" type="number" required value={form.house_id}
                  onChange={e => setForm({...form, house_id: e.target.value})} placeholder="ID chuồng" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('initialCount', lang)}</label>
              <input className="input-field" type="number" min="1" required value={form.initial_count}
                onChange={e => setForm({...form, initial_count: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('hatchDate', lang)}</label>
                <input className="input-field" type="date" required value={form.hatch_date}
                  onChange={e => setForm({...form, hatch_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('entryDate', lang)}</label>
                <input className="input-field" type="date" required value={form.entry_date}
                  onChange={e => setForm({...form, entry_date: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes', lang)}</label>
              <textarea className="input-field" rows={2} value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowAdd(false); setError(''); }}
                className="btn-secondary flex-1 justify-center">{t('cancel', lang)}</button>
              <button type="submit" disabled={saving}
                className="btn-primary flex-1 justify-center">
                {saving ? t('loading', lang) : t('save', lang)}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function FlocksPage() {
  return <AppShell><FlocksContent /></AppShell>;
}
