'use client';
import { useState, useEffect } from 'react';
import AppShell, { useLang } from '@/components/AppShell';
import { dailyApi, flocksApi } from '@/lib/api';
import { t } from '@/lib/i18n';

function DailyContent() {
  const { lang } = useLang();
  const [records, setRecords]   = useState([]);
  const [flocks, setFlocks]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterFlock, setFilterFlock] = useState('');
  const [filterDate, setFilterDate]   = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [d, f] = await Promise.allSettled([dailyApi.getAll(), flocksApi.getAll()]);
        if (d.status === 'fulfilled') setRecords(d.value);
        if (f.status === 'fulfilled') setFlocks(f.value);
      } catch(e) {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = records
    .filter(r => !filterFlock || String(r.flock_id) === filterFlock)
    .filter(r => !filterDate  || (r.record_date || '').startsWith(filterDate))
    .sort((a, b) => new Date(b.record_date) - new Date(a.record_date));

  // Tổng hợp
  const totalEggs = filtered.reduce((s,r) => s + (r.total_eggs||0), 0);
  const totalDead = filtered.reduce((s,r) => s + (r.dead_count||0), 0);

  const label = {
    vi: { title:'Nhật ký hàng ngày', filterFlock:'Lọc đàn', filterDate:'Lọc ngày',
          recordDate:'Ngày', flockId:'Đàn', eggs:'Trứng', weight:'KL trứng (kg)',
          dead:'Chết', temp:'Nhiệt độ (°C)', light:'Ánh sáng (h)', water:'Nước (L)',
          dirty:'Trứng bẩn', broken:'Trứng vỡ', summary:'Tổng kết lọc',
          allFlocks:'Tất cả đàn' },
    ja: { title:'日次記録', filterFlock:'鶏群フィルター', filterDate:'日付フィルター',
          recordDate:'日付', flockId:'鶏群', eggs:'産卵数', weight:'卵重量(kg)',
          dead:'死亡数', temp:'気温(°C)', light:'照明(h)', water:'給水(L)',
          dirty:'汚卵', broken:'破損卵', summary:'フィルター集計',
          allFlocks:'全鶏群' },
  }[lang] || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{label.title}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {lang==='vi' ? 'Lịch sử ghi chép hàng ngày theo đàn gà' : '鶏群ごとの日次記録履歴'}
        </p>
      </div>

      {/* Filters */}
      <div className="card py-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{label.filterFlock}</label>
          <select className="input-field w-44" value={filterFlock} onChange={e => setFilterFlock(e.target.value)}>
            <option value="">{label.allFlocks}</option>
            {flocks.map(f => (
              <option key={f.id} value={f.id}>#{f.id} {f.breed}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{label.filterDate}</label>
          <input type="month" className="input-field w-40" value={filterDate}
            onChange={e => setFilterDate(e.target.value)} />
        </div>
        {(filterFlock || filterDate) && (
          <button onClick={() => { setFilterFlock(''); setFilterDate(''); }}
            className="text-sm text-gray-400 hover:text-red-400 transition mt-4">✕ Xóa lọc</button>
        )}
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card py-3 px-4 text-center">
            <p className="text-xs text-gray-400">{lang==='vi'?'Số bản ghi':'記録数'}</p>
            <p className="text-2xl font-bold text-primary-700">{filtered.length}</p>
          </div>
          <div className="card py-3 px-4 text-center">
            <p className="text-xs text-gray-400">{lang==='vi'?'Tổng trứng':'産卵合計'}</p>
            <p className="text-2xl font-bold text-orange-500">{totalEggs.toLocaleString()}</p>
          </div>
          <div className="card py-3 px-4 text-center">
            <p className="text-xs text-gray-400">{lang==='vi'?'Tổng chết':'死亡合計'}</p>
            <p className="text-2xl font-bold text-red-500">{totalDead.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">{t('loading', lang)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{t('noData', lang)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[label.recordDate, label.flockId, label.eggs, label.weight,
                    label.dirty, label.broken, label.dead, label.temp, label.light, label.water, 'Notes'].map(h => (
                    <th key={h} className="text-left px-3 py-3 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id || i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                      {r.record_date || '--'}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">#{r.flock_id}</span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-orange-600">
                      {(r.total_eggs||0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{(r.total_egg_weight_kg||0).toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-yellow-600">{r.dirty_eggs||0}</td>
                    <td className="px-3 py-2.5 text-yellow-600">{r.broken_eggs||0}</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-semibold ${(r.dead_count||0) > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {r.dead_count||0}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                      {r.temp_min_c}–{r.temp_max_c}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{r.light_hours||0}h</td>
                    <td className="px-3 py-2.5 text-gray-500">{r.water_consumed_liter||0}L</td>
                    <td className="px-3 py-2.5 text-gray-400 max-w-[120px] truncate">{r.notes||''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DailyPage() {
  return <AppShell><DailyContent /></AppShell>;
}
