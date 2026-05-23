'use client';
import { useState, useEffect } from 'react';
import AppShell, { useLang } from '@/components/AppShell';
import { housesApi, flocksApi } from '@/lib/api';
import { t } from '@/lib/i18n';

function HousesContent() {
  const { lang } = useLang();
  const [houses, setHouses]   = useState([]);
  const [flocks, setFlocks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name: '', capacity: '', type: '', notes: '' });

  async function load() {
    setLoading(true);
    try {
      const [h, f] = await Promise.allSettled([housesApi.getAll(), flocksApi.getAll()]);
      if (h.status === 'fulfilled') setHouses(Array.isArray(h.value) ? h.value : []);
      if (f.status === 'fulfilled') setFlocks(Array.isArray(f.value) ? f.value : []);
    } catch(e) {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Tính số gà hiện đang ở mỗi chuồng
  function birdsInHouse(houseId) {
    return flocks
      .filter(f => (f.house_id || f.houseId) === houseId && f.status === 'active')
      .reduce((s, f) => s + (f.current_count || f.currentCount || 0), 0);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await housesApi.create ? 
        await housesApi.create({ name: form.name, capacity: parseInt(form.capacity)||0, type: form.type, notes: form.notes }) :
        await fetch(`${process.env.NEXT_PUBLIC_API_URL||'https://farmtrack-api-production-2e37.up.railway.app'}/api/houses`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${localStorage.getItem('farmtrack_token')}` },
          body: JSON.stringify({ name: form.name, capacity: parseInt(form.capacity)||0, type: form.type, notes: form.notes })
        });
      setShowAdd(false);
      setForm({ name:'', capacity:'', type:'', notes:'' });
      await load();
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const lv = lang === 'ja' ? {
    title:'鶏舎管理', subtitle:'全鶏舎の一覧と状況',
    add:'鶏舎追加', name:'鶏舎名', capacity:'収容数',
    type:'タイプ', currentBirds:'現在羽数', utilization:'稼働率',
    notes:'メモ', houseType:['ケージ','平飼い','半開放'],
  } : {
    title:'Quản lý chuồng trại', subtitle:'Danh sách và tình trạng các chuồng',
    add:'Thêm chuồng', name:'Tên chuồng', capacity:'Sức chứa',
    type:'Loại chuồng', currentBirds:'Đàn hiện tại', utilization:'Tỷ lệ sử dụng',
    notes:'Ghi chú', houseType:['Chuồng lồng','Nền trải','Bán mở'],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{lv.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{lv.subtitle}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <span>+</span> {lv.add}
        </button>
      </div>

      {/* House cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('loading', lang)}</div>
      ) : houses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{t('noData', lang)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map(h => {
            const birds = birdsInHouse(h.id);
            const cap   = h.capacity || 0;
            const util  = cap > 0 ? Math.min(100, Math.round(birds/cap*100)) : 0;
            const color = util > 90 ? 'bg-red-100 text-red-600' :
                          util > 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-700';
            return (
              <div key={h.id} className="card hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏠</span>
                      <h3 className="font-bold text-gray-800">{h.name || `Chuồng #${h.id}`}</h3>
                    </div>
                    {h.type && <p className="text-xs text-gray-400 mt-0.5 ml-8">{h.type}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${color}`}>
                    {util}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{lv.currentBirds}</span>
                    <span className="font-semibold text-primary-700">{birds.toLocaleString()} {t('unit_birds',lang)}</span>
                  </div>
                  {cap > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{lv.capacity}</span>
                      <span className="text-gray-600">{cap.toLocaleString()} {t('unit_birds',lang)}</span>
                    </div>
                  )}
                  {/* Utilization bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          util > 90 ? 'bg-red-400' : util > 70 ? 'bg-yellow-400' : 'bg-primary-500'
                        }`}
                        style={{ width: `${util}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{lv.add}</h3>
              <button onClick={() => { setShowAdd(false); setError(''); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-4">{error}</div>
              )}
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{lv.name}</label>
                  <input className="input-field" required value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} placeholder="Chuồng A1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{lv.capacity}</label>
                  <input className="input-field" type="number" min="0" value={form.capacity}
                    onChange={e => setForm({...form, capacity: e.target.value})} placeholder="10000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{lv.type}</label>
                  <select className="input-field" value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="">--</option>
                    {lv.houseType.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{lv.notes}</label>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HousesPage() {
  return <AppShell><HousesContent /></AppShell>;
}
