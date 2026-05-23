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
// MOCK DATA  (sẽ kết nối API thực sau)
// ══════════════════════════════════════════════════════════════

const FEED_TYPES = [
  { id:'layer-1',  name:'Layer 1',   cp:17.0, me:2750, supplier:'GreenFeed Co.'  },
  { id:'grower',   name:'Grower',    cp:16.0, me:2800, supplier:'GreenFeed Co.'  },
  { id:'finisher', name:'Finisher',  cp:15.5, me:2750, supplier:'Cargill VN'     },
  { id:'starter',  name:'Starter 1', cp:18.5, me:2850, supplier:'Cargill VN'     },
];

const INITIAL_INV = [
  // ── Khu B (B-6 → B-15) ───────────────────────────────────
  { id:'B-6',  area:'B', num:6,  feedId:'layer-1',  stockKg:4800, dailyAvg:620, birds:5500, lastImport:'05/05/2026' },
  { id:'B-7',  area:'B', num:7,  feedId:'layer-1',  stockKg:1200, dailyAvg:580, birds:5200, lastImport:'01/05/2026' },
  { id:'B-8',  area:'B', num:8,  feedId:'grower',   stockKg:3500, dailyAvg:600, birds:5400, lastImport:'04/05/2026' },
  { id:'B-9',  area:'B', num:9,  feedId:'layer-1',  stockKg:2100, dailyAvg:610, birds:5500, lastImport:'03/05/2026' },
  { id:'B-10', area:'B', num:10, feedId:'layer-1',  stockKg:5200, dailyAvg:630, birds:5600, lastImport:'06/05/2026' },
  { id:'B-11', area:'B', num:11, feedId:'grower',   stockKg:800,  dailyAvg:590, birds:5300, lastImport:'30/04/2026' },
  { id:'B-12', area:'B', num:12, feedId:'layer-1',  stockKg:3800, dailyAvg:615, birds:5500, lastImport:'04/05/2026' },
  { id:'B-13', area:'B', num:13, feedId:'layer-1',  stockKg:4500, dailyAvg:625, birds:5600, lastImport:'06/05/2026' },
  { id:'B-14', area:'B', num:14, feedId:'grower',   stockKg:2800, dailyAvg:595, birds:5300, lastImport:'03/05/2026' },
  { id:'B-15', area:'B', num:15, feedId:'layer-1',  stockKg:6100, dailyAvg:640, birds:5700, lastImport:'07/05/2026' },
  // ── Khu C (C-16 → C-23) ──────────────────────────────────
  { id:'C-16', area:'C', num:16, feedId:'layer-1',  stockKg:5800, dailyAvg:700, birds:6200, lastImport:'05/05/2026' },
  { id:'C-17', area:'C', num:17, feedId:'finisher', stockKg:1500, dailyAvg:680, birds:6000, lastImport:'01/05/2026' },
  { id:'C-18', area:'C', num:18, feedId:'layer-1',  stockKg:7200, dailyAvg:710, birds:6300, lastImport:'07/05/2026' },
  { id:'C-19', area:'C', num:19, feedId:'layer-1',  stockKg:3200, dailyAvg:695, birds:6100, lastImport:'03/05/2026' },
  { id:'C-20', area:'C', num:20, feedId:'grower',   stockKg:4800, dailyAvg:720, birds:6400, lastImport:'04/05/2026' },
  { id:'C-21', area:'C', num:21, feedId:'layer-1',  stockKg:9100, dailyAvg:705, birds:6200, lastImport:'08/05/2026' },
  { id:'C-22', area:'C', num:22, feedId:'finisher', stockKg:2100, dailyAvg:690, birds:6100, lastImport:'02/05/2026' },
  { id:'C-23', area:'C', num:23, feedId:'layer-1',  stockKg:1800, dailyAvg:715, birds:6300, lastImport:'01/05/2026' },
  // ── Khu D (D-24 → D-35) ──────────────────────────────────
  { id:'D-24', area:'D', num:24, feedId:'layer-1',  stockKg:7500, dailyAvg:780, birds:6800, lastImport:'06/05/2026' },
  { id:'D-25', area:'D', num:25, feedId:'grower',   stockKg:4200, dailyAvg:760, birds:6600, lastImport:'03/05/2026' },
  { id:'D-26', area:'D', num:26, feedId:'layer-1',  stockKg:2400, dailyAvg:790, birds:6900, lastImport:'02/05/2026' },
  { id:'D-27', area:'D', num:27, feedId:'layer-1',  stockKg:6800, dailyAvg:770, birds:6700, lastImport:'05/05/2026' },
  { id:'D-28', area:'D', num:28, feedId:'finisher', stockKg:900,  dailyAvg:755, birds:6600, lastImport:'28/04/2026' },
  { id:'D-29', area:'D', num:29, feedId:'layer-1',  stockKg:5100, dailyAvg:780, birds:6800, lastImport:'04/05/2026' },
  { id:'D-30', area:'D', num:30, feedId:'layer-1',  stockKg:8200, dailyAvg:795, birds:6900, lastImport:'07/05/2026' },
  { id:'D-31', area:'D', num:31, feedId:'grower',   stockKg:3600, dailyAvg:765, birds:6700, lastImport:'03/05/2026' },
  { id:'D-32', area:'D', num:32, feedId:'layer-1',  stockKg:1100, dailyAvg:775, birds:6800, lastImport:'30/04/2026' },
  { id:'D-33', area:'D', num:33, feedId:'layer-1',  stockKg:5900, dailyAvg:780, birds:6800, lastImport:'05/05/2026' },
  { id:'D-34', area:'D', num:34, feedId:'grower',   stockKg:2800, dailyAvg:760, birds:6600, lastImport:'02/05/2026' },
  { id:'D-35', area:'D', num:35, feedId:'layer-1',  stockKg:4400, dailyAvg:790, birds:6900, lastImport:'04/05/2026' },
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

const FCR_DATA = [
  { label:'W1', actual:2.18, target:2.10 },
  { label:'W2', actual:2.15, target:2.10 },
  { label:'W3', actual:2.14, target:2.10 },
  { label:'W4', actual:2.12, target:2.10 },
  { label:'W5', actual:2.11, target:2.10 },
  { label:'W6', actual:2.10, target:2.10 },
  { label:'W7', actual:2.09, target:2.10 },
  { label:'W8', actual:2.08, target:2.10 },
];

const FEED_TREND = [
  { date:'02/05', actual:118, target:115 },
  { date:'03/05', actual:116, target:115 },
  { date:'04/05', actual:115, target:115 },
  { date:'05/05', actual:117, target:115 },
  { date:'06/05', actual:116, target:115 },
  { date:'07/05', actual:114, target:115 },
  { date:'08/05', actual:113, target:115 },
];

const AREA_COLORS = { B:'#4ade80', C:'#60a5fa', D:'#f59e0b', ALL:'#a78bfa' };

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

const fmt  = (n, d=0) => n==null ? '—' : Number(n).toLocaleString('en',{minimumFractionDigits:d,maximumFractionDigits:d});
const dC   = d => d < 3 ? '#ef4444' : d < 7 ? '#f59e0b' : '#4ade80';
const dBg  = d => d < 3 ? 'rgba(239,68,68,.1)' : d < 7 ? 'rgba(245,158,11,.08)' : 'transparent';
const sKey = d => d < 3 ? 'status_critical' : d < 7 ? 'status_warning' : 'status_ok';

// Shared style tokens
const TH = { padding:'10px 12px', textAlign:'left', borderBottom:'1px solid #1a3a1a',
             whiteSpace:'nowrap', fontSize:10, color:'#4a7c4a', textTransform:'uppercase', letterSpacing:.8 };
const TD = { padding:'9px 12px', color:'#c9d1d9', verticalAlign:'middle', fontSize:12 };
const FI = { width:'100%', background:'#0a150a', border:'1px solid #1a3a1a', borderRadius:7,
             padding:'8px 10px', color:'#e6edf3', fontSize:13, outline:'none', boxSizing:'border-box' };
const cardSt = { background:'#0d1b0d', border:'1px solid #1a3a1a', borderRadius:10 };
const sectionSt = { background:'#111827', border:'1px solid #1e293b', borderRadius:10 };

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

function KpiCard({ label, value, unit='', color='#4ade80', sub='' }) {
  return (
    <div style={{...cardSt, padding:'14px 18px', flex:1, minWidth:130}}>
      <div style={{fontSize:10, color:'#4a7c4a', textTransform:'uppercase', letterSpacing:.8, marginBottom:6}}>{label}</div>
      <div style={{fontSize:22, fontWeight:700, color, lineHeight:1.1}}>
        {value}<span style={{fontSize:12, marginLeft:3, color:'#6b7280'}}>{unit}</span>
      </div>
      {sub && <div style={{fontSize:10, color:'#4a7c4a', marginTop:4}}>{sub}</div>}
    </div>
  );
}

function AreaCard({ data, label, t, active, onClick }) {
  const c = AREA_COLORS[data.code] || '#4ade80';
  return (
    <div onClick={onClick} style={{
      background: active ? `rgba(${data.code==='B'?'74,222,128':data.code==='C'?'96,165,250':'245,158,11'},.06)` : '#0d1b0d',
      border:`1px solid ${active ? c : '#1a3a1a'}`,
      borderTop:`3px solid ${c}`, borderRadius:12,
      padding:'14px 18px', cursor:'pointer', transition:'all .15s', flex:1, minWidth:150,
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
        <div style={{fontSize:18, fontWeight:800, color:c}}>{label}</div>
        <div style={{fontSize:10, color:'#4a7c4a'}}>{data.count} {t('area_houses')}</div>
      </div>
      <div style={{fontSize:22, fontWeight:700, color:'#e6edf3', marginBottom:2}}>
        {fmt(data.totalStock)} <span style={{fontSize:11, color:'#6b7280'}}>kg</span>
      </div>
      <div style={{fontSize:10, color:'#4a7c4a', marginBottom:8}}>{fmt(data.totalDaily)} kg / {t('days_unit')}</div>
      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
        {data.critical > 0 && (
          <span style={{background:'rgba(239,68,68,.15)', color:'#ef4444', fontSize:9.5, padding:'2px 7px', borderRadius:999, fontWeight:700}}>
            🔴 {data.critical} {t('status_critical')}
          </span>
        )}
        {data.warning > 0 && (
          <span style={{background:'rgba(245,158,11,.12)', color:'#f59e0b', fontSize:9.5, padding:'2px 7px', borderRadius:999}}>
            ⚠ {data.warning} {t('status_warning')}
          </span>
        )}
        {data.critical === 0 && data.warning === 0 && (
          <span style={{background:'rgba(74,222,128,.1)', color:'#4ade80', fontSize:9.5, padding:'2px 7px', borderRadius:999}}>
            ✓ {t('status_ok')}
          </span>
        )}
      </div>
    </div>
  );
}

function ForecastPanel({ critical, warning, t, hL }) {
  if (!critical.length && !warning.length) return null;
  return (
    <div style={{marginBottom:18}}>
      {critical.length > 0 && (
        <div style={{background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'12px 16px', marginBottom:8}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <span style={{fontSize:16}}>🚨</span>
            <span style={{fontWeight:700, color:'#ef4444', fontSize:13}}>{t('forecast_crit')} — {critical.length} {t('forecast_critical_houses')}</span>
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
            {critical.map(h => (
              <span key={h.id} style={{background:'rgba(239,68,68,.15)', color:'#ef4444', fontSize:11, padding:'3px 10px', borderRadius:999, fontWeight:600}}>
                {hL(h.num)} · {h.daysLeft.toFixed(1)} {t('days_unit')}
              </span>
            ))}
          </div>
        </div>
      )}
      {warning.length > 0 && (
        <div style={{background:'rgba(245,158,11,.05)', border:'1px solid rgba(245,158,11,.25)', borderRadius:10, padding:'12px 16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <span style={{fontSize:15}}>⚠️</span>
            <span style={{fontWeight:600, color:'#f59e0b', fontSize:12}}>{t('forecast_warn')} — {warning.length} {t('forecast_warning_houses')}</span>
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
            {warning.map(h => (
              <span key={h.id} style={{background:'rgba(245,158,11,.12)', color:'#f59e0b', fontSize:11, padding:'3px 10px', borderRadius:999}}>
                {hL(h.num)} · {h.daysLeft.toFixed(1)} {t('days_unit')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryTable({ data, t, hL, zL, onImport, onUsage }) {
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={TH}>{t('th_house')}</th>
            <th style={TH}>{t('th_area')}</th>
            <th style={TH}>{t('th_feed_type')}</th>
            <th style={TH}>{t('th_birds')}</th>
            <th style={{...TH, textAlign:'right'}}>{t('th_stock_kg')}</th>
            <th style={{...TH, textAlign:'right'}}>{t('th_daily_avg')}</th>
            <th style={{...TH, textAlign:'center'}}>{t('th_days_left')}</th>
            <th style={TH}>{t('th_last_import')}</th>
            <th style={{...TH, textAlign:'center'}}>{t('th_status')}</th>
            <th style={{...TH, textAlign:'center'}}>{t('th_action')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((h, i) => {
            const d = h.daysLeft;
            const rowBg = dBg(d) || (i%2===0 ? '#0d1b0d' : '#0a150a');
            return (
              <tr key={h.id} style={{background:rowBg, borderBottom:'1px solid #1a2a1a'}}>
                <td style={{...TD, fontWeight:700, color:'#e6edf3'}}>{hL(h.num)}</td>
                <td style={{...TD}}>
                  <span style={{color: AREA_COLORS[h.area], fontWeight:600}}>{zL(h.area)}</span>
                </td>
                <td style={TD}>{h.feedType?.name ?? h.feedId}</td>
                <td style={{...TD, color:'#8b949e'}}>{fmt(h.birds)}</td>
                <td style={{...TD, textAlign:'right', fontWeight:600, color:'#e6edf3'}}>{fmt(h.stockKg)}</td>
                <td style={{...TD, textAlign:'right', color:'#8b949e'}}>{fmt(h.dailyAvg)}</td>
                <td style={{...TD, textAlign:'center'}}>
                  <span style={{color:dC(d), fontWeight:700, fontSize:13}}>{d.toFixed(1)}</span>
                </td>
                <td style={{...TD, color:'#6b7280', fontSize:11}}>{h.lastImport}</td>
                <td style={{...TD, textAlign:'center'}}>
                  <span style={{
                    background: d<3?'rgba(239,68,68,.15)':d<7?'rgba(245,158,11,.12)':'rgba(74,222,128,.1)',
                    color:dC(d), fontSize:10, padding:'2px 8px', borderRadius:999, fontWeight:600,
                  }}>{t(sKey(d))}</span>
                </td>
                <td style={{...TD, textAlign:'center'}}>
                  <div style={{display:'flex', gap:4, justifyContent:'center'}}>
                    <button onClick={()=>onImport(h.id)} style={{
                      background:'#166534', color:'#4ade80', border:'none', borderRadius:5,
                      padding:'3px 8px', fontSize:10, cursor:'pointer', fontWeight:600,
                    }}>+</button>
                    <button onClick={()=>onUsage(h.id)} style={{
                      background:'#1e293b', color:'#94a3b8', border:'none', borderRadius:5,
                      padding:'3px 8px', fontSize:10, cursor:'pointer',
                    }}>−</button>
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
    if (preHouseId) {
      const [a] = preHouseId.split('-');
      setArea(a);
      setHouseId(preHouseId);
    }
  }, [preHouseId]);

  const housesInArea   = inventory.filter(h => h.area === area);
  const selectedFeed   = FEED_TYPES.find(f => f.id === feedId);
  const selectedHouse  = inventory.find(h => h.id === houseId);
  const accentColor    = isImport ? '#4ade80' : '#60a5fa';
  const btnBg          = isImport ? '#166534' : '#1e3a5f';
  const infoBorderColor = isImport ? '#1a3a1a' : '#1e3a5f';
  const infoBg         = isImport ? 'rgba(74,222,128,.05)' : 'rgba(96,165,250,.05)';

  const handleSubmit = () => {
    if (!houseId || !qty || Number(qty) <= 0) return;
    onSubmit({ houseId, feedId, qty: Number(qty), date, note });
    setQty(''); setNote('');
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  };

  return (
    <div>
      {ok && (
        <div style={{background:'rgba(74,222,128,.08)', border:'1px solid #166534', borderRadius:8,
                     padding:'8px 12px', marginBottom:12, fontSize:12, color:'#4ade80'}}>
          ✓ {isImport ? t('import_success') : t('usage_success')}
        </div>
      )}

      {/* Date */}
      <Row label={t('lbl_date')}>
        <input value={date} onChange={e=>setDate(e.target.value)} style={FI} />
      </Row>

      {/* Area + House (2 col) */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12}}>
        <Row label={t('lbl_area')} noMb>
          <select value={area} onChange={e=>{setArea(e.target.value); setHouseId('');}} style={FI}>
            {['B','C','D'].map(a => <option key={a} value={a}>{zL(a)}</option>)}
          </select>
        </Row>
        <Row label={t('lbl_house')} noMb>
          <select value={houseId} onChange={e=>setHouseId(e.target.value)} style={FI}>
            <option value=''>—</option>
            {housesInArea.map(h => <option key={h.id} value={h.id}>{hL(h.num)}</option>)}
          </select>
        </Row>
      </div>

      {/* House stock info */}
      {selectedHouse && (
        <div style={{background:infoBg, border:`1px solid ${infoBorderColor}`, borderRadius:8,
                     padding:'7px 12px', marginBottom:12, fontSize:11, color:'#4a7c4a'}}>
          {t('th_stock_kg')}: <b style={{color:accentColor}}>{fmt(selectedHouse.stockKg)} kg</b>
          &nbsp;·&nbsp;
          {t('th_daily_avg')}: <b>{fmt(selectedHouse.dailyAvg)} kg</b>
          &nbsp;·&nbsp;
          <span style={{color:dC(selectedHouse.stockKg/selectedHouse.dailyAvg)}}>
            {(selectedHouse.stockKg/selectedHouse.dailyAvg).toFixed(1)} {t('days_unit')}
          </span>
        </div>
      )}

      {/* Feed type */}
      <Row label={t('lbl_feed_type')}>
        <select value={feedId} onChange={e=>setFeedId(e.target.value)} style={FI}>
          {FEED_TYPES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </Row>

      {/* Feed spec info (import only) */}
      {isImport && selectedFeed && (
        <div style={{background:'rgba(74,222,128,.04)', border:'1px solid #1a3a1a', borderRadius:7,
                     padding:'7px 12px', marginBottom:12, fontSize:11, color:'#4a7c4a'}}>
          CP: {selectedFeed.cp}% &nbsp;·&nbsp; ME: {selectedFeed.me} kcal/kg &nbsp;·&nbsp; {selectedFeed.supplier}
        </div>
      )}

      {/* Quantity */}
      <Row label={t('lbl_qty_kg')}>
        <input type='number' value={qty} onChange={e=>setQty(e.target.value)}
               placeholder='0' style={FI} min={0} step={100} />
      </Row>

      {/* Note (import only) */}
      {isImport && (
        <Row label={t('lbl_note')}>
          <input value={note} onChange={e=>setNote(e.target.value)} style={FI} />
        </Row>
      )}

      <button onClick={handleSubmit} style={{
        width:'100%', background:btnBg, color:accentColor, border:'none',
        borderRadius:8, padding:'11px', fontWeight:700, fontSize:13, cursor:'pointer', marginTop:4,
      }}>{t('btn_save')}</button>
    </div>
  );
}

function Row({ label, children, noMb=false }) {
  return (
    <div style={{marginBottom: noMb ? 0 : 12}}>
      <div style={{fontSize:11, color:'#4a7c4a', marginBottom:5}}>{label}</div>
      {children}
    </div>
  );
}

function TransTbl({ data, t, houseLabel }) {
  if (!data.length) return (
    <div style={{color:'#4a7c4a', textAlign:'center', padding:'30px 0', fontSize:12}}>{t('no_data')}</div>
  );
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={TH}>{t('th_date')}</th>
            <th style={TH}>{t('th_house')}</th>
            <th style={TH}>{t('th_feed_type')}</th>
            <th style={{...TH, textAlign:'right'}}>{t('th_qty')}</th>
            <th style={{...TH, textAlign:'center'}}>{t('th_type_col')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((tx, i) => {
            const ft = FEED_TYPES.find(f => f.id === tx.feedId);
            const isImp = tx.type === 'IMPORT';
            return (
              <tr key={tx.id} style={{background:i%2===0?'#0d1b0d':'#0a150a', borderBottom:'1px solid #1a2a1a'}}>
                <td style={{...TD, color:'#6b7280', fontSize:11}}>{tx.date}</td>
                <td style={{...TD, fontWeight:600, color:'#e6edf3', fontSize:12}}>{houseLabel(tx.houseId)}</td>
                <td style={{...TD, fontSize:12}}>{ft?.name ?? tx.feedId}</td>
                <td style={{...TD, textAlign:'right', fontWeight:700, color:isImp?'#4ade80':'#f87171'}}>
                  {isImp?'+':'−'}{fmt(tx.qty)} kg
                </td>
                <td style={{...TD, textAlign:'center'}}>
                  <span style={{
                    background: isImp?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)',
                    color: isImp?'#4ade80':'#f87171',
                    fontSize:10, padding:'2px 8px', borderRadius:999, fontWeight:600,
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
    <div style={{...sectionSt, padding:'16px 18px'}}>
      <div style={{fontSize:11, fontWeight:700, color:'#4a7c4a', letterSpacing:.8,
                   textTransform:'uppercase', marginBottom:14}}>{title}</div>
      {children}
    </div>
  );
}

const TIP_STYLE = { contentStyle:{background:'#111827',border:'1px solid #1a3a1a',fontSize:11,borderRadius:8} };

// ══════════════════════════════════════════════════════════════
// PAGE EXPORT
// ══════════════════════════════════════════════════════════════

export default function FeedPage() {
  return <FarmLayout><FeedContent /></FarmLayout>;
}

function FeedContent() {
  const { lang } = useFarm();
  const t  = useT(lang);
  const zL = z => lang==='ja' ? `${z}団地`  : `Khu ${z}`;
  const hL = n => lang==='ja' ? `${n}号舎`   : `Nhà ${n}`;
  const houseLabel = id => {
    const [a, n] = id.split('-');
    return lang==='ja' ? `${a}団地 ${n}号舎` : `Khu ${a} - Nhà ${n}`;
  };

  const [tab,        setTab]        = useState('overview');
  const [inv,        setInv]        = useState(INITIAL_INV);
  const [txs,        setTxs]        = useState(INIT_TXS);
  const [filterArea, setFilterArea] = useState('');
  const [preHouse,   setPreHouse]   = useState('');

  // ── Computed ────────────────────────────────────────────────
  const enriched = useMemo(() => inv.map(h => ({
    ...h,
    feedType: FEED_TYPES.find(f => f.id === h.feedId),
    daysLeft:  h.stockKg / h.dailyAvg,
  })), [inv]);

  const areas = useMemo(() => ['B','C','D'].map(code => {
    const hs = enriched.filter(h => h.area === code);
    return {
      code,
      count:      hs.length,
      totalStock: hs.reduce((s,h) => s + h.stockKg,  0),
      totalDaily: hs.reduce((s,h) => s + h.dailyAvg, 0),
      critical:   hs.filter(h => h.daysLeft < 3).length,
      warning:    hs.filter(h => h.daysLeft >= 3 && h.daysLeft < 7).length,
    };
  }), [enriched]);

  const totalStock = useMemo(() => enriched.reduce((s,h) => s + h.stockKg,  0), [enriched]);
  const totalDaily = useMemo(() => enriched.reduce((s,h) => s + h.dailyAvg, 0), [enriched]);
  const avgDays    = totalStock / totalDaily;

  const critical = useMemo(() => enriched.filter(h => h.daysLeft < 3),                       [enriched]);
  const warning  = useMemo(() => enriched.filter(h => h.daysLeft >= 3 && h.daysLeft < 7),    [enriched]);
  const filtered = filterArea ? enriched.filter(h => h.area === filterArea) : enriched;

  const importMTD     = useMemo(() => txs.filter(tx=>tx.type==='IMPORT').reduce((s,tx)=>s+tx.qty, 0), [txs]);
  const recentImports = useMemo(() => [...txs].filter(tx=>tx.type==='IMPORT').reverse().slice(0,10), [txs]);
  const recentUsage   = useMemo(() => [...txs].filter(tx=>tx.type==='CONSUMPTION').reverse().slice(0,10), [txs]);

  // ── Handlers ────────────────────────────────────────────────
  const doImport = ({houseId, feedId, qty, date, note}) => {
    setTxs(p => [...p, {id:`t${Date.now()}`, type:'IMPORT', houseId, feedId, qty, date, note}]);
    setInv(p => p.map(h => h.id===houseId ? {...h, stockKg:h.stockKg+qty, lastImport:date} : h));
  };

  const doUsage = ({houseId, feedId, qty, date}) => {
    setTxs(p => [...p, {id:`t${Date.now()}`, type:'CONSUMPTION', houseId, feedId, qty, date, note:''}]);
    setInv(p => p.map(h => h.id===houseId ? {...h, stockKg:Math.max(0, h.stockKg-qty)} : h));
  };

  const quickImport = id => { setPreHouse(id); setTab('import');  };
  const quickUsage  = id => { setPreHouse(id); setTab('usage');   };

  const TABS = [
    { key:'overview',  label:t('tab_overview')  },
    { key:'import',    label:t('tab_import')     },
    { key:'usage',     label:t('tab_usage')      },
    { key:'analytics', label:t('tab_analytics')  },
  ];

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{background:'#0f1117', minHeight:'100vh', padding:'20px 24px',
                 color:'#e6edf3', fontFamily:"'Inter',system-ui,sans-serif"}}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20}}>
        <div>
          <div style={{fontSize:11, color:'#4a7c4a', marginBottom:3, letterSpacing:.5}}>{t('feed_breadcrumb')}</div>
          <h1 style={{margin:0, fontSize:22, fontWeight:800, color:'#4ade80', letterSpacing:2}}>{t('feed_mgmt_title')}</h1>
          <div style={{fontSize:11, color:'#4a7c4a', marginTop:3}}>08/05/2026</div>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={()=>{setPreHouse(''); setTab('import');}} style={{
            background:'#166534', color:'#4ade80', border:'none',
            borderRadius:8, padding:'9px 16px', fontWeight:700, fontSize:12, cursor:'pointer',
          }}>{t('btn_add_import')}</button>
          <button onClick={()=>{setPreHouse(''); setTab('usage');}} style={{
            background:'#1e3a5f', color:'#60a5fa', border:'none',
            borderRadius:8, padding:'9px 16px', fontWeight:600, fontSize:12, cursor:'pointer',
          }}>{t('btn_add_usage')}</button>
        </div>
      </div>

      {/* ── KPI Row ────────────────────────────────────── */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:18}}>
        <KpiCard label={t('kpi_total_feed')}  value={fmt(totalStock)}    unit='kg'          color='#4ade80' />
        <KpiCard label={t('kpi_daily_total')} value={fmt(totalDaily)}    unit='kg'          color='#60a5fa' />
        <KpiCard label={t('kpi_fcr')}         value='2.08'                                  color='#f59e0b' />
        <KpiCard label={t('kpi_days_remain')} value={avgDays.toFixed(1)} unit={t('days_unit')} color={dC(avgDays)} />
        <KpiCard label={t('kpi_import_mtd')}  value={fmt(importMTD)}     unit='kg'          color='#a78bfa' />
      </div>

      {/* ── Area Cards ─────────────────────────────────── */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:18}}>
        {areas.map(a => (
          <AreaCard key={a.code} data={a} label={zL(a.code)} t={t}
            active={filterArea===a.code} onClick={()=>setFilterArea(filterArea===a.code?'':a.code)} />
        ))}
        <AreaCard
          data={{ code:'ALL', count:enriched.length, totalStock, totalDaily, critical:critical.length, warning:warning.length }}
          label={t('total_label')} t={t}
          active={filterArea===''} onClick={()=>setFilterArea('')}
        />
      </div>

      {/* ── Forecast Alerts ────────────────────────────── */}
      <ForecastPanel critical={critical} warning={warning} t={t} hL={hL} />

      {/* ── Tab Bar ────────────────────────────────────── */}
      <div style={{display:'flex', gap:0, borderBottom:'1px solid #1a3a1a', marginBottom:0}}>
        {TABS.map(tb => (
          <button key={tb.key} onClick={()=>setTab(tb.key)} style={{
            background: tab===tb.key ? '#111827' : 'transparent',
            color:       tab===tb.key ? '#4ade80' : '#4a7c4a',
            border:'none',
            borderBottom: tab===tb.key ? '2px solid #4ade80' : '2px solid transparent',
            padding:'10px 20px', fontSize:12, fontWeight: tab===tb.key ? 700 : 400,
            cursor:'pointer', transition:'all .15s', marginBottom:-1,
          }}>{tb.label}</button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────── */}
      <div style={{...sectionSt, borderTop:'none', borderRadius:'0 0 12px 12px', padding:'20px'}}>

        {/* ════ OVERVIEW ════ */}
        {tab==='overview' && (
          <div>
            {/* Area filter chips */}
            <div style={{display:'flex', gap:6, marginBottom:14, alignItems:'center', flexWrap:'wrap'}}>
              <span style={{fontSize:11, color:'#4a7c4a', marginRight:4}}>{t('select_zone')}:</span>
              {[['', t('all_zones')], ['B', zL('B')], ['C', zL('C')], ['D', zL('D')]].map(([v,lbl]) => (
                <button key={v} onClick={()=>setFilterArea(v)} style={{
                  background: filterArea===v ? '#166534' : 'transparent',
                  color:       filterArea===v ? '#4ade80' : '#4a7c4a',
                  border:'1px solid #1a3a1a', borderRadius:6,
                  padding:'4px 12px', fontSize:11, cursor:'pointer', transition:'all .15s',
                }}>{lbl}</button>
              ))}
              <span style={{marginLeft:'auto', fontSize:11, color:'#4a7c4a'}}>
                {filtered.length} {t('area_houses')}
              </span>
            </div>

            <InventoryTable data={filtered} t={t} hL={hL} zL={zL} onImport={quickImport} onUsage={quickUsage} />
          </div>
        )}

        {/* ════ IMPORT ════ */}
        {tab==='import' && (
          <div style={{display:'grid', gridTemplateColumns:'minmax(280px,380px) 1fr', gap:24}}>
            <div>
              <div style={{fontSize:12, fontWeight:700, color:'#4ade80', letterSpacing:1, marginBottom:14}}>{t('import_title')}</div>
              <FeedForm t={t} lang={lang} inventory={inv} onSubmit={doImport} isImport={true} preHouseId={preHouse} />
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, color:'#4a7c4a', letterSpacing:.8, marginBottom:10, textTransform:'uppercase'}}>{t('recent_imports')}</div>
              <TransTbl data={recentImports} t={t} houseLabel={houseLabel} />
            </div>
          </div>
        )}

        {/* ════ USAGE ════ */}
        {tab==='usage' && (
          <div style={{display:'grid', gridTemplateColumns:'minmax(280px,380px) 1fr', gap:24}}>
            <div>
              <div style={{fontSize:12, fontWeight:700, color:'#60a5fa', letterSpacing:1, marginBottom:14}}>{t('usage_title')}</div>
              <FeedForm t={t} lang={lang} inventory={inv} onSubmit={doUsage} isImport={false} preHouseId={preHouse} />
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, color:'#4a7c4a', letterSpacing:.8, marginBottom:10, textTransform:'uppercase'}}>{t('recent_usage')}</div>
              <TransTbl data={recentUsage} t={t} houseLabel={houseLabel} />
            </div>
          </div>
        )}

        {/* ════ ANALYTICS ════ */}
        {tab==='analytics' && (
          <div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18}}>

              {/* FCR Chart */}
              <ChartBox title={t('fcr_title')}>
                <ResponsiveContainer width='100%' height={220}>
                  <LineChart data={FCR_DATA}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1a3a1a' />
                    <XAxis dataKey='label' stroke='#4a7c4a' tick={{fontSize:10}} />
                    <YAxis domain={[2.05, 2.22]} stroke='#4a7c4a' tick={{fontSize:10}} tickCount={5} />
                    <Tooltip {...TIP_STYLE} />
                    <Legend wrapperStyle={{fontSize:11}} />
                    <ReferenceLine y={2.10} stroke='#ef4444' strokeDasharray='4 2' strokeWidth={1} />
                    <Line dataKey='actual' stroke='#4ade80' strokeWidth={2.5} dot={{r:4, fill:'#4ade80'}} name={t('fcr_actual')} />
                    <Line dataKey='target' stroke='#ef4444' strokeWidth={1.5} strokeDasharray='5 3' dot={false} name={t('fcr_target')} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>

              {/* Feed/bird Chart */}
              <ChartBox title={t('feed_per_bird_title')}>
                <ResponsiveContainer width='100%' height={220}>
                  <LineChart data={FEED_TREND}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1e293b' />
                    <XAxis dataKey='date' stroke='#4a7c4a' tick={{fontSize:10}} />
                    <YAxis domain={[110, 122]} stroke='#4a7c4a' tick={{fontSize:10}} />
                    <Tooltip {...TIP_STYLE} />
                    <Legend wrapperStyle={{fontSize:11}} />
                    <Line dataKey='actual' stroke='#60a5fa' strokeWidth={2.5} dot={{r:4, fill:'#60a5fa'}} name={t('feed_actual_label')} />
                    <Line dataKey='target' stroke='#f59e0b' strokeWidth={1.5} strokeDasharray='5 3' dot={false} name={t('feed_target_label')} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>

            {/* Area stock bar chart */}
            <ChartBox title={t('area_total_stock')}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, alignItems:'center'}}>
                <ResponsiveContainer width='100%' height={200}>
                  <BarChart data={areas} barSize={60}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1a3a1a' />
                    <XAxis dataKey='code'
                      tick={({x,y,payload}) => (
                        <text x={x} y={y+14} textAnchor='middle' fill='#4a7c4a' fontSize={10}>
                          {zL(payload.value)}
                        </text>
                      )}
                      stroke='#1a3a1a'
                    />
                    <YAxis stroke='#4a7c4a' tick={{fontSize:10}} tickFormatter={v=>fmt(v)} />
                    <Tooltip {...TIP_STYLE} formatter={v=>[fmt(v)+' kg', t('th_stock_kg')]} />
                    <Bar dataKey='totalStock' radius={[5,5,0,0]}>
                      {areas.map((a,i) => (
                        <Cell key={i} fill={['#166534','#1e3a5f','#713f12'][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Area stats table */}
                <div>
                  <table style={{width:'100%', borderCollapse:'collapse', fontSize:12}}>
                    <thead>
                      <tr>
                        <th style={TH}>{t('th_area')}</th>
                        <th style={{...TH, textAlign:'right'}}>{t('th_stock_kg')}</th>
                        <th style={{...TH, textAlign:'right'}}>{t('th_daily_avg')}</th>
                        <th style={{...TH, textAlign:'center'}}>{t('th_days_left')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areas.map((a,i) => {
                        const d = a.totalStock / a.totalDaily;
                        return (
                          <tr key={a.code} style={{background:i%2===0?'#0d1b0d':'#0a150a', borderBottom:'1px solid #1a2a1a'}}>
                            <td style={{...TD, fontWeight:700, color:AREA_COLORS[a.code]}}>{zL(a.code)}</td>
                            <td style={{...TD, textAlign:'right', color:'#e6edf3', fontWeight:600}}>{fmt(a.totalStock)}</td>
                            <td style={{...TD, textAlign:'right', color:'#8b949e'}}>{fmt(a.totalDaily)}</td>
                            <td style={{...TD, textAlign:'center', color:dC(d), fontWeight:700}}>{d.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                      {/* Total row */}
                      <tr style={{background:'#0f1f0f', borderTop:'1px solid #1a3a1a'}}>
                        <td style={{...TD, fontWeight:700, color:'#a78bfa'}}>{t('total_label')}</td>
                        <td style={{...TD, textAlign:'right', color:'#4ade80', fontWeight:700}}>{fmt(totalStock)}</td>
                        <td style={{...TD, textAlign:'right', color:'#8b949e', fontWeight:600}}>{fmt(totalDaily)}</td>
                        <td style={{...TD, textAlign:'center', color:dC(avgDays), fontWeight:700}}>{avgDays.toFixed(1)}</td>
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
  );
}
