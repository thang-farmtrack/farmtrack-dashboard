'use client';
import { useState, useMemo, useEffect } from 'react';
import FarmLayout, { useFarm } from '@/components/FarmLayout';
import { useT } from '@/lib/i18n';
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════
const C = {
  bg:      '#f8fafc',
  surface: '#ffffff',
  border:  '#e2e8f0',
  border2: '#f1f5f9',
  tx:      '#1e293b',
  tx2:     '#475569',
  muted:   '#94a3b8',
  green:   '#16a34a',
  greenBg: '#f0fdf4',
  greenBd: '#bbf7d0',
  amber:   '#d97706',
  amberBg: '#fffbeb',
  amberBd: '#fde68a',
  red:     '#dc2626',
  redBg:   '#fef2f2',
  redBd:   '#fecaca',
  blue:    '#2563eb',
  blueBg:  '#eff6ff',
  blueBd:  '#bfdbfe',
  purple:  '#7c3aed',
};

const AREA_HUE = { B: C.green, C: C.blue, D: C.amber, ALL: C.purple };

// ══════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════
const FEED_TYPES = [
  { id:'layer-1',  name:'Layer 1',   cp:17.0, me:2750, supplier:'GreenFeed Co.' },
  { id:'grower',   name:'Grower',    cp:16.0, me:2800, supplier:'GreenFeed Co.' },
  { id:'finisher', name:'Finisher',  cp:15.5, me:2750, supplier:'Cargill VN'    },
  { id:'starter',  name:'Starter 1', cp:18.5, me:2850, supplier:'Cargill VN'    },
];
const INITIAL_INV = [
  { id:'B-6',  area:'B', num:6,  feedId:'layer-1',  stockKg:4800, dailyAvg:620, birds:5500, lastImport:'05/05' },
  { id:'B-7',  area:'B', num:7,  feedId:'layer-1',  stockKg:1200, dailyAvg:580, birds:5200, lastImport:'01/05' },
  { id:'B-8',  area:'B', num:8,  feedId:'grower',   stockKg:3500, dailyAvg:600, birds:5400, lastImport:'04/05' },
  { id:'B-9',  area:'B', num:9,  feedId:'layer-1',  stockKg:2100, dailyAvg:610, birds:5500, lastImport:'03/05' },
  { id:'B-10', area:'B', num:10, feedId:'layer-1',  stockKg:5200, dailyAvg:630, birds:5600, lastImport:'06/05' },
  { id:'B-11', area:'B', num:11, feedId:'grower',   stockKg:800,  dailyAvg:590, birds:5300, lastImport:'30/04' },
  { id:'B-12', area:'B', num:12, feedId:'layer-1',  stockKg:3800, dailyAvg:615, birds:5500, lastImport:'04/05' },
  { id:'B-13', area:'B', num:13, feedId:'layer-1',  stockKg:4500, dailyAvg:625, birds:5600, lastImport:'06/05' },
  { id:'B-14', area:'B', num:14, feedId:'grower',   stockKg:2800, dailyAvg:595, birds:5300, lastImport:'03/05' },
  { id:'B-15', area:'B', num:15, feedId:'layer-1',  stockKg:6100, dailyAvg:640, birds:5700, lastImport:'07/05' },
  { id:'C-16', area:'C', num:16, feedId:'layer-1',  stockKg:5800, dailyAvg:700, birds:6200, lastImport:'05/05' },
  { id:'C-17', area:'C', num:17, feedId:'finisher', stockKg:1500, dailyAvg:680, birds:6000, lastImport:'01/05' },
  { id:'C-18', area:'C', num:18, feedId:'layer-1',  stockKg:7200, dailyAvg:710, birds:6300, lastImport:'07/05' },
  { id:'C-19', area:'C', num:19, feedId:'layer-1',  stockKg:3200, dailyAvg:695, birds:6100, lastImport:'03/05' },
  { id:'C-20', area:'C', num:20, feedId:'grower',   stockKg:4800, dailyAvg:720, birds:6400, lastImport:'04/05' },
  { id:'C-21', area:'C', num:21, feedId:'layer-1',  stockKg:9100, dailyAvg:705, birds:6200, lastImport:'08/05' },
  { id:'C-22', area:'C', num:22, feedId:'finisher', stockKg:2100, dailyAvg:690, birds:6100, lastImport:'02/05' },
  { id:'C-23', area:'C', num:23, feedId:'layer-1',  stockKg:1800, dailyAvg:715, birds:6300, lastImport:'01/05' },
  { id:'D-24', area:'D', num:24, feedId:'layer-1',  stockKg:7500, dailyAvg:780, birds:6800, lastImport:'06/05' },
  { id:'D-25', area:'D', num:25, feedId:'grower',   stockKg:4200, dailyAvg:760, birds:6600, lastImport:'03/05' },
  { id:'D-26', area:'D', num:26, feedId:'layer-1',  stockKg:2400, dailyAvg:790, birds:6900, lastImport:'02/05' },
  { id:'D-27', area:'D', num:27, feedId:'layer-1',  stockKg:6800, dailyAvg:770, birds:6700, lastImport:'05/05' },
  { id:'D-28', area:'D', num:28, feedId:'finisher', stockKg:900,  dailyAvg:755, birds:6600, lastImport:'28/04' },
  { id:'D-29', area:'D', num:29, feedId:'layer-1',  stockKg:5100, dailyAvg:780, birds:6800, lastImport:'04/05' },
  { id:'D-30', area:'D', num:30, feedId:'layer-1',  stockKg:8200, dailyAvg:795, birds:6900, lastImport:'07/05' },
  { id:'D-31', area:'D', num:31, feedId:'grower',   stockKg:3600, dailyAvg:765, birds:6700, lastImport:'03/05' },
  { id:'D-32', area:'D', num:32, feedId:'layer-1',  stockKg:1100, dailyAvg:775, birds:6800, lastImport:'30/04' },
  { id:'D-33', area:'D', num:33, feedId:'layer-1',  stockKg:5900, dailyAvg:780, birds:6800, lastImport:'05/05' },
  { id:'D-34', area:'D', num:34, feedId:'grower',   stockKg:2800, dailyAvg:760, birds:6600, lastImport:'02/05' },
  { id:'D-35', area:'D', num:35, feedId:'layer-1',  stockKg:4400, dailyAvg:790, birds:6900, lastImport:'04/05' },
];
const INIT_TXS = [
  { id:'t001', type:'IMPORT',      houseId:'C-21', feedId:'layer-1',  qty:9000, date:'08/05/2026', note:'' },
  { id:'t002', type:'IMPORT',      houseId:'B-15', feedId:'layer-1',  qty:6000, date:'07/05/2026', note:'' },
  { id:'t003', type:'IMPORT',      houseId:'D-30', feedId:'layer-1',  qty:8000, date:'07/05/2026', note:'' },
  { id:'t004', type:'IMPORT',      houseId:'C-18', feedId:'layer-1',  qty:7000, date:'07/05/2026', note:'' },
  { id:'t005', type:'IMPORT',      houseId:'B-10', feedId:'layer-1',  qty:5000, date:'06/05/2026', note:'' },
  { id:'t006', type:'IMPORT',      houseId:'D-27', feedId:'layer-1',  qty:7000, date:'05/05/2026', note:'' },
  { id:'t007', type:'CONSUMPTION', houseId:'B-6',  feedId:'layer-1',  qty:620,  date:'08/05/2026', note:'' },
  { id:'t008', type:'CONSUMPTION', houseId:'C-16', feedId:'layer-1',  qty:700,  date:'08/05/2026', note:'' },
  { id:'t009', type:'CONSUMPTION', houseId:'D-24', feedId:'layer-1',  qty:780,  date:'08/05/2026', note:'' },
  { id:'t010', type:'CONSUMPTION', houseId:'D-28', feedId:'finisher', qty:755,  date:'07/05/2026', note:'' },
  { id:'t011', type:'CONSUMPTION', houseId:'C-19', feedId:'layer-1',  qty:695,  date:'07/05/2026', note:'' },
  { id:'t012', type:'CONSUMPTION', houseId:'B-9',  feedId:'layer-1',  qty:610,  date:'07/05/2026', note:'' },
];
const FCR_DATA  = [
  { label:'W1', actual:2.18, target:2.10 }, { label:'W2', actual:2.15, target:2.10 },
  { label:'W3', actual:2.14, target:2.10 }, { label:'W4', actual:2.12, target:2.10 },
  { label:'W5', actual:2.11, target:2.10 }, { label:'W6', actual:2.10, target:2.10 },
  { label:'W7', actual:2.09, target:2.10 }, { label:'W8', actual:2.08, target:2.10 },
];
const FEED_TREND = [
  { date:'02/05', actual:118, target:115 }, { date:'03/05', actual:116, target:115 },
  { date:'04/05', actual:115, target:115 }, { date:'05/05', actual:117, target:115 },
  { date:'06/05', actual:116, target:115 }, { date:'07/05', actual:114, target:115 },
  { date:'08/05', actual:113, target:115 },
];

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════
const fmt   = (n, d=0) => n==null ? '—' : Number(n).toLocaleString('en', { minimumFractionDigits:d, maximumFractionDigits:d });
const dColor  = d => d < 3 ? C.red    : d < 7 ? C.amber   : C.green;
const dBgCol  = d => d < 3 ? C.redBg  : d < 7 ? C.amberBg : null;
const dBdCol  = d => d < 3 ? C.redBd  : d < 7 ? C.amberBd : C.border;
const sTag    = d => d < 3 ? 'status_critical' : d < 7 ? 'status_warning' : 'status_ok';

const card = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,.06)' };
const INPUT = {
  width:'100%', background:C.surface, border:`1px solid ${C.border}`,
  borderRadius:8, padding:'8px 12px', color:C.tx, fontSize:13,
  outline:'none', boxSizing:'border-box',
};
const TIP = { contentStyle:{ background:'#fff', border:`1px solid ${C.border}`, fontSize:12, borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,.1)' }, labelStyle:{color:C.tx2} };

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

function KpiCard({ label, value, unit='', color=C.green, icon='', sub='' }) {
  return (
    <div style={{ ...card, padding:'16px 20px', borderLeft:`4px solid ${color}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        {icon && <span style={{ fontSize:16 }}>{icon}</span>}
        <span style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:.8 }}>{label}</span>
      </div>
      <div style={{ fontSize:24, fontWeight:800, color:C.tx, lineHeight:1 }}>
        {value}
        <span style={{ fontSize:13, fontWeight:400, color:C.muted, marginLeft:4 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>{sub}</div>}
    </div>
  );
}

function AreaCard({ data, label, t, active, onClick }) {
  const col = AREA_HUE[data.code] || C.green;
  return (
    <div onClick={onClick} style={{
      ...card,
      borderTop:`3px solid ${col}`,
      padding:'14px 16px', cursor:'pointer',
      outline: active ? `2px solid ${col}` : 'none',
      outlineOffset:2,
      transition:'all .15s',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
        <span style={{ fontSize:15, fontWeight:800, color:col }}>{label}</span>
        <span style={{ fontSize:11, color:C.muted }}>{data.count} {t('area_houses')}</span>
      </div>
      <div style={{ fontSize:20, fontWeight:800, color:C.tx, marginBottom:2 }}>
        {fmt(data.totalStock)} <span style={{ fontSize:12, color:C.muted, fontWeight:400 }}>kg</span>
      </div>
      <div style={{ fontSize:12, color:C.tx2, marginBottom:8 }}>{fmt(data.totalDaily)} kg / {t('days_unit')}</div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {data.critical > 0 && (
          <span style={{ background:C.redBg, color:C.red, fontSize:10, padding:'2px 8px', borderRadius:999, fontWeight:700, border:`1px solid ${C.redBd}` }}>
            🔴 {data.critical} {t('status_critical')}
          </span>
        )}
        {data.warning > 0 && (
          <span style={{ background:C.amberBg, color:C.amber, fontSize:10, padding:'2px 8px', borderRadius:999, fontWeight:600, border:`1px solid ${C.amberBd}` }}>
            ⚠ {data.warning} {t('status_warning')}
          </span>
        )}
        {data.critical === 0 && data.warning === 0 && (
          <span style={{ background:C.greenBg, color:C.green, fontSize:10, padding:'2px 8px', borderRadius:999, fontWeight:600, border:`1px solid ${C.greenBd}` }}>
            ✓ {t('status_ok')}
          </span>
        )}
      </div>
    </div>
  );
}

function AlertBanner({ critical, warning, t, hL }) {
  if (!critical.length && !warning.length) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
      {critical.length > 0 && (
        <div style={{ background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:10 }}>
          <span style={{ fontSize:18, lineHeight:1 }}>🚨</span>
          <div>
            <div style={{ fontWeight:700, color:C.red, fontSize:13, marginBottom:6 }}>{t('forecast_crit')} — {critical.length} {t('forecast_critical_houses')}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {critical.map(h => (
                <span key={h.id} style={{ background:'#fff', border:`1px solid ${C.redBd}`, color:C.red, fontSize:12, padding:'2px 10px', borderRadius:999, fontWeight:600 }}>
                  {hL(h.num)} · {h.daysLeft.toFixed(1)}{t('days_unit')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {warning.length > 0 && (
        <div style={{ background:C.amberBg, border:`1px solid ${C.amberBd}`, borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:10 }}>
          <span style={{ fontSize:18, lineHeight:1 }}>⚠️</span>
          <div>
            <div style={{ fontWeight:700, color:C.amber, fontSize:13, marginBottom:6 }}>{t('forecast_warn')} — {warning.length} {t('forecast_warning_houses')}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {warning.map(h => (
                <span key={h.id} style={{ background:'#fff', border:`1px solid ${C.amberBd}`, color:C.amber, fontSize:12, padding:'2px 10px', borderRadius:999 }}>
                  {hL(h.num)} · {h.daysLeft.toFixed(1)}{t('days_unit')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryTable({ data, t, hL, zL, onImport, onUsage }) {
  const TH = { padding:'10px 14px', textAlign:'left', borderBottom:`2px solid ${C.border}`, fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:.7, whiteSpace:'nowrap', background:'#f8fafc' };
  const TD = { padding:'10px 14px', fontSize:13, color:C.tx2, verticalAlign:'middle' };
  return (
    <div style={{ overflowX:'auto', borderRadius:12, border:`1px solid ${C.border}`, boxShadow:'0 1px 3px rgba(0,0,0,.05)' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th style={TH}>{t('th_house')}</th>
            <th style={TH}>{t('th_area')}</th>
            <th style={TH}>{t('th_feed_type')}</th>
            <th style={TH}>{t('th_birds')}</th>
            <th style={{ ...TH, textAlign:'right' }}>{t('th_stock_kg')}</th>
            <th style={{ ...TH, textAlign:'right' }}>{t('th_daily_avg')}</th>
            <th style={{ ...TH, textAlign:'center' }}>{t('th_days_left')}</th>
            <th style={TH}>{t('th_last_import')}</th>
            <th style={{ ...TH, textAlign:'center' }}>{t('th_status')}</th>
            <th style={{ ...TH, textAlign:'center' }}>{t('th_action')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((h, i) => {
            const d = h.daysLeft;
            const rowBg = dBgCol(d) || (i % 2 === 0 ? '#ffffff' : '#fafafa');
            return (
              <tr key={h.id} style={{ background:rowBg, borderBottom:`1px solid ${C.border2}`, transition:'background .1s' }}>
                <td style={{ ...TD, fontWeight:700, color:C.tx }}>{hL(h.num)}</td>
                <td style={TD}>
                  <span style={{ color:AREA_HUE[h.area], fontWeight:600, fontSize:12 }}>{zL(h.area)}</span>
                </td>
                <td style={{ ...TD, color:C.tx2 }}>{h.feedType?.name ?? h.feedId}</td>
                <td style={{ ...TD, color:C.muted }}>{fmt(h.birds)}</td>
                <td style={{ ...TD, textAlign:'right', fontWeight:700, color:C.tx }}>{fmt(h.stockKg)}</td>
                <td style={{ ...TD, textAlign:'right', color:C.tx2 }}>{fmt(h.dailyAvg)}</td>
                <td style={{ ...TD, textAlign:'center' }}>
                  <span style={{ color:dColor(d), fontWeight:800, fontSize:14 }}>{d.toFixed(1)}</span>
                </td>
                <td style={{ ...TD, color:C.muted, fontSize:12 }}>{h.lastImport}</td>
                <td style={{ ...TD, textAlign:'center' }}>
                  <span style={{ background:d<3?C.redBg:d<7?C.amberBg:C.greenBg, color:dColor(d), border:`1px solid ${dBdCol(d)}`, fontSize:11, padding:'2px 8px', borderRadius:999, fontWeight:600, whiteSpace:'nowrap' }}>
                    {t(sTag(d))}
                  </span>
                </td>
                <td style={{ ...TD, textAlign:'center' }}>
                  <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                    <button onClick={() => onImport(h.id)} style={{ background:C.greenBg, color:C.green, border:`1px solid ${C.greenBd}`, borderRadius:6, padding:'4px 10px', fontSize:13, cursor:'pointer', fontWeight:700, lineHeight:1 }}>+</button>
                    <button onClick={() => onUsage(h.id)}  style={{ background:C.blueBg,  color:C.blue,  border:`1px solid ${C.blueBd}`,  borderRadius:6, padding:'4px 10px', fontSize:13, cursor:'pointer', fontWeight:700, lineHeight:1 }}>−</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.tx2, marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

function FeedForm({ t, lang, inventory, onSubmit, isImport, preHouseId }) {
  const zL = z => lang==='ja' ? `${z}団地` : `Khu ${z}`;
  const hL = n => lang==='ja' ? `${n}号舎`  : `Nhà ${n}`;
  const initArea = preHouseId ? preHouseId.split('-')[0] : 'B';
  const [area,    setArea]    = useState(initArea);
  const [houseId, setHouseId] = useState(preHouseId || '');
  const [feedId,  setFeedId]  = useState('layer-1');
  const [qty,     setQty]     = useState('');
  const [date,    setDate]    = useState('08/05/2026');
  const [note,    setNote]    = useState('');
  const [ok,      setOk]      = useState(false);

  useEffect(() => {
    if (preHouseId) { const [a] = preHouseId.split('-'); setArea(a); setHouseId(preHouseId); }
  }, [preHouseId]);

  const housesInArea  = inventory.filter(h => h.area === area);
  const selectedFeed  = FEED_TYPES.find(f => f.id === feedId);
  const selectedHouse = inventory.find(h => h.id === houseId);
  const accent = isImport ? C.green : C.blue;
  const accentBg = isImport ? C.greenBg : C.blueBg;
  const accentBd = isImport ? C.greenBd : C.blueBd;

  const handleSubmit = () => {
    if (!houseId || !qty || Number(qty) <= 0) return;
    onSubmit({ houseId, feedId, qty:Number(qty), date, note });
    setQty(''); setNote('');
    setOk(true); setTimeout(() => setOk(false), 3000);
  };

  return (
    <div style={{ ...card, padding:'20px' }}>
      <div style={{ fontSize:14, fontWeight:700, color:accent, marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:18 }}>{isImport ? '📦' : '🔄'}</span>
        {isImport ? t('import_title') : t('usage_title')}
      </div>

      {ok && (
        <div style={{ background:C.greenBg, border:`1px solid ${C.greenBd}`, borderRadius:8, padding:'9px 14px', marginBottom:14, fontSize:13, color:C.green, fontWeight:600 }}>
          ✓ {isImport ? t('import_success') : t('usage_success')}
        </div>
      )}

      <FormRow label={t('lbl_date')}>
        <input value={date} onChange={e => setDate(e.target.value)} style={INPUT} />
      </FormRow>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <FormRow label={t('lbl_area')}>
          <select value={area} onChange={e => { setArea(e.target.value); setHouseId(''); }} style={INPUT}>
            {['B','C','D'].map(a => <option key={a} value={a}>{zL(a)}</option>)}
          </select>
        </FormRow>
        <FormRow label={t('lbl_house')}>
          <select value={houseId} onChange={e => setHouseId(e.target.value)} style={INPUT}>
            <option value=''>—</option>
            {housesInArea.map(h => <option key={h.id} value={h.id}>{hL(h.num)}</option>)}
          </select>
        </FormRow>
      </div>

      {selectedHouse && (
        <div style={{ background:accentBg, border:`1px solid ${accentBd}`, borderRadius:8, padding:'8px 12px', marginBottom:14, fontSize:12 }}>
          <span style={{ color:C.tx2 }}>{t('th_stock_kg')}: </span>
          <b style={{ color:accent }}>{fmt(selectedHouse.stockKg)} kg</b>
          <span style={{ color:C.muted, margin:'0 8px' }}>·</span>
          <span style={{ color:C.tx2 }}>{t('th_daily_avg')}: </span>
          <b style={{ color:C.tx }}>{fmt(selectedHouse.dailyAvg)} kg/日</b>
          <span style={{ color:C.muted, margin:'0 8px' }}>·</span>
          <b style={{ color:dColor(selectedHouse.stockKg/selectedHouse.dailyAvg) }}>
            {(selectedHouse.stockKg/selectedHouse.dailyAvg).toFixed(1)} {t('days_unit')}
          </b>
        </div>
      )}

      <FormRow label={t('lbl_feed_type')}>
        <select value={feedId} onChange={e => setFeedId(e.target.value)} style={INPUT}>
          {FEED_TYPES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </FormRow>

      {isImport && selectedFeed && (
        <div style={{ background:'#f8fafc', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', marginBottom:14, fontSize:12, color:C.tx2 }}>
          <b>CP:</b> {selectedFeed.cp}%
          <span style={{ margin:'0 10px', color:C.border }}>|</span>
          <b>ME:</b> {selectedFeed.me} kcal/kg
          <span style={{ margin:'0 10px', color:C.border }}>|</span>
          {selectedFeed.supplier}
        </div>
      )}

      <FormRow label={t('lbl_qty_kg')}>
        <input type='number' value={qty} onChange={e => setQty(e.target.value)}
               placeholder='0' style={INPUT} min={0} step={100} />
      </FormRow>

      {isImport && (
        <FormRow label={t('lbl_note')}>
          <input value={note} onChange={e => setNote(e.target.value)} style={INPUT} placeholder='...' />
        </FormRow>
      )}

      <button onClick={handleSubmit} style={{
        width:'100%', background:accent, color:'#fff',
        border:'none', borderRadius:8, padding:'11px', fontWeight:700,
        fontSize:14, cursor:'pointer', marginTop:4, letterSpacing:.3,
      }}>
        {t('btn_save')}
      </button>
    </div>
  );
}

function TransTbl({ data, t, houseLabel }) {
  const TH = { padding:'9px 14px', textAlign:'left', borderBottom:`2px solid ${C.border}`, fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:.7, background:'#f8fafc' };
  const TD = { padding:'10px 14px', fontSize:13, verticalAlign:'middle' };
  if (!data.length) return (
    <div style={{ textAlign:'center', padding:'32px', color:C.muted, fontSize:13 }}>{t('no_data')}</div>
  );
  return (
    <div style={{ overflowX:'auto', borderRadius:12, border:`1px solid ${C.border}` }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th style={TH}>{t('th_date')}</th>
            <th style={TH}>{t('th_house')}</th>
            <th style={TH}>{t('th_feed_type')}</th>
            <th style={{ ...TH, textAlign:'right' }}>{t('th_qty')}</th>
            <th style={{ ...TH, textAlign:'center' }}>{t('th_type_col')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((tx, i) => {
            const ft = FEED_TYPES.find(f => f.id === tx.feedId);
            const isImp = tx.type === 'IMPORT';
            return (
              <tr key={tx.id} style={{ background: i%2===0 ? '#fff' : '#fafafa', borderBottom:`1px solid ${C.border2}` }}>
                <td style={{ ...TD, color:C.muted, fontSize:12 }}>{tx.date}</td>
                <td style={{ ...TD, fontWeight:600, color:C.tx }}>{houseLabel(tx.houseId)}</td>
                <td style={{ ...TD, color:C.tx2 }}>{ft?.name ?? tx.feedId}</td>
                <td style={{ ...TD, textAlign:'right', fontWeight:700, color:isImp?C.green:C.red }}>
                  {isImp ? '+' : '−'}{fmt(tx.qty)} kg
                </td>
                <td style={{ ...TD, textAlign:'center' }}>
                  <span style={{
                    background:isImp?C.greenBg:C.redBg, color:isImp?C.green:C.red,
                    border:`1px solid ${isImp?C.greenBd:C.redBd}`,
                    fontSize:11, padding:'2px 8px', borderRadius:999, fontWeight:600,
                  }}>{t(isImp?'tx_import':'tx_consumption')}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div style={{ ...card, padding:'18px 20px' }}>
      <div style={{ fontSize:13, fontWeight:700, color:C.tx, marginBottom:16 }}>{title}</div>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════
export default function FeedPage() {
  return <FarmLayout><FeedContent /></FarmLayout>;
}

function FeedContent() {
  const { lang } = useFarm();
  const t   = useT(lang);
  const zL  = z => lang==='ja' ? `${z}団地`  : `Khu ${z}`;
  const hL  = n => lang==='ja' ? `${n}号舎`   : `Nhà ${n}`;
  const houseLabel = id => { const [a, n] = id.split('-'); return lang==='ja' ? `${a}団地 ${n}号舎` : `Khu ${a} - Nhà ${n}`; };

  const [tab,        setTab]        = useState('overview');
  const [inv,        setInv]        = useState(INITIAL_INV);
  const [txs,        setTxs]        = useState(INIT_TXS);
  const [filterArea, setFilterArea] = useState('');
  const [preHouse,   setPreHouse]   = useState('');

  const enriched = useMemo(() => inv.map(h => ({
    ...h, feedType:FEED_TYPES.find(f => f.id===h.feedId), daysLeft:h.stockKg/h.dailyAvg,
  })), [inv]);

  const areas = useMemo(() => ['B','C','D'].map(code => {
    const hs = enriched.filter(h => h.area===code);
    return { code, count:hs.length, totalStock:hs.reduce((s,h)=>s+h.stockKg,0), totalDaily:hs.reduce((s,h)=>s+h.dailyAvg,0),
             critical:hs.filter(h=>h.daysLeft<3).length, warning:hs.filter(h=>h.daysLeft>=3&&h.daysLeft<7).length };
  }), [enriched]);

  const totalStock = useMemo(() => enriched.reduce((s,h)=>s+h.stockKg,0), [enriched]);
  const totalDaily = useMemo(() => enriched.reduce((s,h)=>s+h.dailyAvg,0), [enriched]);
  const avgDays    = totalStock / totalDaily;
  const critical   = useMemo(() => enriched.filter(h=>h.daysLeft<3), [enriched]);
  const warning    = useMemo(() => enriched.filter(h=>h.daysLeft>=3&&h.daysLeft<7), [enriched]);
  const filtered   = filterArea ? enriched.filter(h=>h.area===filterArea) : enriched;
  const importMTD  = useMemo(() => txs.filter(tx=>tx.type==='IMPORT').reduce((s,tx)=>s+tx.qty,0), [txs]);
  const recentImports = useMemo(() => [...txs].filter(tx=>tx.type==='IMPORT').reverse().slice(0,10), [txs]);
  const recentUsage   = useMemo(() => [...txs].filter(tx=>tx.type==='CONSUMPTION').reverse().slice(0,10), [txs]);

  const doImport = ({houseId,feedId,qty,date,note}) => {
    setTxs(p=>[...p,{id:`t${Date.now()}`,type:'IMPORT',houseId,feedId,qty,date,note}]);
    setInv(p=>p.map(h=>h.id===houseId?{...h,stockKg:h.stockKg+qty,lastImport:date}:h));
  };
  const doUsage = ({houseId,feedId,qty,date}) => {
    setTxs(p=>[...p,{id:`t${Date.now()}`,type:'CONSUMPTION',houseId,feedId,qty,date,note:''}]);
    setInv(p=>p.map(h=>h.id===houseId?{...h,stockKg:Math.max(0,h.stockKg-qty)}:h));
  };
  const quickImport = id => { setPreHouse(id); setTab('import'); };
  const quickUsage  = id => { setPreHouse(id); setTab('usage');  };

  const TABS = [
    { key:'overview',  label:t('tab_overview'),  icon:'📦' },
    { key:'import',    label:t('tab_import'),     icon:'⬇️' },
    { key:'usage',     label:t('tab_usage'),      icon:'⬆️' },
    { key:'analytics', label:t('tab_analytics'),  icon:'📈' },
  ];

  return (
    <div style={{ background:C.bg, minHeight:'100vh', padding:'24px 28px', fontFamily:"'Inter',system-ui,sans-serif", color:C.tx }}>

      {/* ── Header ───────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:4, letterSpacing:.3 }}>
            {t('feed_breadcrumb')}
          </div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:C.tx, letterSpacing:-.3 }}>
            {t('feed_mgmt_title')}
          </h1>
          <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>08/05/2026</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => { setPreHouse(''); setTab('import'); }} style={{
            background:C.green, color:'#fff', border:'none',
            borderRadius:8, padding:'9px 18px', fontWeight:700, fontSize:13, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6,
          }}>📦 {t('btn_add_import')}</button>
          <button onClick={() => { setPreHouse(''); setTab('usage'); }} style={{
            background:C.blue, color:'#fff', border:'none',
            borderRadius:8, padding:'9px 18px', fontWeight:600, fontSize:13, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6,
          }}>🔄 {t('btn_add_usage')}</button>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:20 }}>
        <KpiCard icon='🌾' label={t('kpi_total_feed')}  value={fmt(totalStock)} unit='kg' color={C.green} />
        <KpiCard icon='📊' label={t('kpi_daily_total')} value={fmt(totalDaily)} unit='kg/日' color={C.blue} />
        <KpiCard icon='⚖️' label={t('kpi_fcr')}         value='2.08'            color={C.amber} />
        <KpiCard icon='📅' label={t('kpi_days_remain')} value={avgDays.toFixed(1)} unit={t('days_unit')} color={dColor(avgDays)} sub={avgDays<7?'⚠ 要補充':''} />
        <KpiCard icon='🚚' label={t('kpi_import_mtd')}  value={fmt(importMTD)}  unit='kg' color={C.purple} />
      </div>

      {/* ── Area Cards ───────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14, marginBottom:20 }}>
        {areas.map(a => (
          <AreaCard key={a.code} data={a} label={zL(a.code)} t={t}
            active={filterArea===a.code} onClick={() => setFilterArea(filterArea===a.code?'':a.code)} />
        ))}
        <AreaCard
          data={{ code:'ALL', count:enriched.length, totalStock, totalDaily, critical:critical.length, warning:warning.length }}
          label={t('total_label')} t={t}
          active={filterArea===''} onClick={() => setFilterArea('')}
        />
      </div>

      {/* ── Alert Banners ────────────────────────────── */}
      <AlertBanner critical={critical} warning={warning} t={t} hL={hL} />

      {/* ── Tabs ─────────────────────────────────────── */}
      <div style={{ ...card, overflow:'hidden' }}>
        {/* Tab Bar */}
        <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:'#f8fafc' }}>
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              padding:'13px 22px', fontSize:13, fontWeight:tab===tb.key?700:400,
              color:tab===tb.key?C.green:C.tx2,
              background:tab===tb.key?C.surface:'transparent',
              border:'none', borderBottom:tab===tb.key?`2px solid ${C.green}`:'2px solid transparent',
              cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', gap:6,
              marginBottom:-1,
            }}>
              <span>{tb.icon}</span> {tb.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding:'20px' }}>

          {/* ════ OVERVIEW ════ */}
          {tab==='overview' && (
            <div>
              <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:13, color:C.muted }}>{t('select_zone')}:</span>
                {[['', t('all_zones')], ['B', zL('B')], ['C', zL('C')], ['D', zL('D')]].map(([v,lbl]) => (
                  <button key={v} onClick={() => setFilterArea(v)} style={{
                    background:filterArea===v?C.green:'transparent',
                    color:filterArea===v?'#fff':C.tx2,
                    border:`1px solid ${filterArea===v?C.green:C.border}`,
                    borderRadius:999, padding:'4px 14px', fontSize:12, cursor:'pointer', transition:'all .15s', fontWeight:filterArea===v?600:400,
                  }}>{lbl}</button>
                ))}
                <span style={{ marginLeft:'auto', fontSize:12, color:C.muted }}>{filtered.length} {t('area_houses')}</span>
              </div>
              <InventoryTable data={filtered} t={t} hL={hL} zL={zL} onImport={quickImport} onUsage={quickUsage} />
            </div>
          )}

          {/* ════ IMPORT ════ */}
          {tab==='import' && (
            <div style={{ display:'grid', gridTemplateColumns:'minmax(300px,380px) 1fr', gap:24, alignItems:'start' }}>
              <FeedForm t={t} lang={lang} inventory={inv} onSubmit={doImport} isImport={true} preHouseId={preHouse} />
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.tx, marginBottom:12 }}>{t('recent_imports')}</div>
                <TransTbl data={recentImports} t={t} houseLabel={houseLabel} />
              </div>
            </div>
          )}

          {/* ════ USAGE ════ */}
          {tab==='usage' && (
            <div style={{ display:'grid', gridTemplateColumns:'minmax(300px,380px) 1fr', gap:24, alignItems:'start' }}>
              <FeedForm t={t} lang={lang} inventory={inv} onSubmit={doUsage} isImport={false} preHouseId={preHouse} />
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.tx, marginBottom:12 }}>{t('recent_usage')}</div>
                <TransTbl data={recentUsage} t={t} houseLabel={houseLabel} />
              </div>
            </div>
          )}

          {/* ════ ANALYTICS ════ */}
          {tab==='analytics' && (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                <ChartBox title={t('fcr_title')}>
                  <ResponsiveContainer width='100%' height={220}>
                    <LineChart data={FCR_DATA}>
                      <CartesianGrid strokeDasharray='3 3' stroke={C.border} />
                      <XAxis dataKey='label' stroke={C.muted} tick={{ fontSize:11, fill:C.muted }} />
                      <YAxis domain={[2.05, 2.22]} stroke={C.muted} tick={{ fontSize:11, fill:C.muted }} tickCount={5} />
                      <Tooltip {...TIP} />
                      <Legend wrapperStyle={{ fontSize:11 }} />
                      <ReferenceLine y={2.10} stroke={C.red} strokeDasharray='4 2' strokeWidth={1.5} />
                      <Line dataKey='actual' stroke={C.green}  strokeWidth={2.5} dot={{ r:4, fill:C.green  }} name={t('fcr_actual')} />
                      <Line dataKey='target' stroke={C.red}    strokeWidth={1.5} strokeDasharray='5 3' dot={false} name={t('fcr_target')} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartBox>

                <ChartBox title={t('feed_per_bird_title')}>
                  <ResponsiveContainer width='100%' height={220}>
                    <LineChart data={FEED_TREND}>
                      <CartesianGrid strokeDasharray='3 3' stroke={C.border} />
                      <XAxis dataKey='date' stroke={C.muted} tick={{ fontSize:11, fill:C.muted }} />
                      <YAxis domain={[110, 122]} stroke={C.muted} tick={{ fontSize:11, fill:C.muted }} />
                      <Tooltip {...TIP} />
                      <Legend wrapperStyle={{ fontSize:11 }} />
                      <Line dataKey='actual' stroke={C.blue}  strokeWidth={2.5} dot={{ r:4, fill:C.blue  }} name={t('feed_actual_label')} />
                      <Line dataKey='target' stroke={C.amber} strokeWidth={1.5} strokeDasharray='5 3' dot={false} name={t('feed_target_label')} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartBox>
              </div>

              <ChartBox title={t('area_total_stock')}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'center' }}>
                  <ResponsiveContainer width='100%' height={200}>
                    <BarChart data={areas} barSize={56}>
                      <CartesianGrid strokeDasharray='3 3' stroke={C.border} />
                      <XAxis dataKey='code'
                        tick={({ x, y, payload }) => (
                          <text x={x} y={y+14} textAnchor='middle' fill={C.muted} fontSize={11}>{zL(payload.value)}</text>
                        )}
                        stroke={C.border}
                      />
                      <YAxis stroke={C.muted} tick={{ fontSize:11, fill:C.muted }} tickFormatter={v => fmt(v)} />
                      <Tooltip {...TIP} formatter={v => [fmt(v)+' kg', t('th_stock_kg')]} />
                      <Bar dataKey='totalStock' radius={[6,6,0,0]}>
                        {areas.map((a, i) => <Cell key={i} fill={[C.green, C.blue, C.amber][i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div style={{ borderRadius:10, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ background:'#f8fafc' }}>
                          {[t('th_area'), t('th_stock_kg'), t('th_daily_avg'), t('th_days_left')].map((h, i) => (
                            <th key={i} style={{ padding:'9px 12px', fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:.6, textAlign:i>0?'right':'left', borderBottom:`2px solid ${C.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {areas.map((a, i) => {
                          const d = a.totalStock / a.totalDaily;
                          return (
                            <tr key={a.code} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:`1px solid ${C.border2}` }}>
                              <td style={{ padding:'9px 12px', fontWeight:700, color:AREA_HUE[a.code], fontSize:13 }}>{zL(a.code)}</td>
                              <td style={{ padding:'9px 12px', textAlign:'right', fontWeight:700, color:C.tx, fontSize:13 }}>{fmt(a.totalStock)}</td>
                              <td style={{ padding:'9px 12px', textAlign:'right', color:C.tx2, fontSize:13 }}>{fmt(a.totalDaily)}</td>
                              <td style={{ padding:'9px 12px', textAlign:'right', color:dColor(d), fontWeight:700, fontSize:13 }}>{d.toFixed(1)}</td>
                            </tr>
                          );
                        })}
                        <tr style={{ background:'#f1f5f9', borderTop:`2px solid ${C.border}` }}>
                          <td style={{ padding:'9px 12px', fontWeight:800, color:C.purple, fontSize:13 }}>{t('total_label')}</td>
                          <td style={{ padding:'9px 12px', textAlign:'right', fontWeight:800, color:C.green, fontSize:13 }}>{fmt(totalStock)}</td>
                          <td style={{ padding:'9px 12px', textAlign:'right', color:C.tx2, fontWeight:600, fontSize:13 }}>{fmt(totalDaily)}</td>
                          <td style={{ padding:'9px 12px', textAlign:'right', color:dColor(avgDays), fontWeight:800, fontSize:13 }}>{avgDays.toFixed(1)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </ChartBox>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
