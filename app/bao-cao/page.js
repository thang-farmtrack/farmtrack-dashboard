'use client';
import { useState, useMemo } from 'react';
import FarmLayout, { useFarm } from '@/components/FarmLayout';
import { useT } from '@/lib/i18n';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ══════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS
// ══════════════════════════════════════════════════════════════
const BENCH = { henDay:89.0, fcr:2.15, mort:0.060, saleable:95.0, dirty:2.0, cracked:1.0 };

// Seed-based pseudo-random để mock data ổn định
const rnd = (seed, min, max) => {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
};

// Cấu hình nhà theo khu
const ZONE_CONFIG = {
  B: { houses: Array.from({length:10}, (_,i) => i+6),  color:'#22c55e', breed:'Maria',    birds: h => Math.round(rnd(h*7,16500,19500)) },
  C: { houses: Array.from({length:8},  (_,i) => i+16), color:'#3b82f6', breed:'Borisu',   birds: h => Math.round(rnd(h*7,15000,18000)) },
  D: { houses: Array.from({length:12}, (_,i) => i+24), color:'#a855f7', breed:'Julialai', birds: h => Math.round(rnd(h*7,14500,17500)) },
};

// Tạo mock weekly data cho 1 nhà
const makeWeeklyHouse = (house, zone) => {
  const base = { henDay: 90+rnd(house,0,3), fcr: 2.05+rnd(house*3,0,0.15),
                 mort: 0.040+rnd(house*5,0,0.025), feed: 111+rnd(house*2,0,5) };
  return [
    { label:'T18', dates:'29/04–05/05', henDay:+(base.henDay-0.8).toFixed(2), fcr:+(base.fcr+0.04).toFixed(3), mort:+(base.mort+0.003).toFixed(4), feed:+(base.feed+1.5).toFixed(1), dirty:+(1.8+rnd(house,0,0.4)).toFixed(2), cracked:+(0.85+rnd(house*2,0,0.2)).toFixed(2), saleable:+(95.5+rnd(house*3,0,1.5)).toFixed(2), temp:+(27.5+rnd(house,0,1.5)).toFixed(1) },
    { label:'T19', dates:'06/05–12/05', henDay:+(base.henDay-0.5).toFixed(2), fcr:+(base.fcr+0.02).toFixed(3), mort:+(base.mort+0.001).toFixed(4), feed:+(base.feed+0.8).toFixed(1), dirty:+(1.7+rnd(house,0,0.4)).toFixed(2), cracked:+(0.82+rnd(house*2,0,0.2)).toFixed(2), saleable:+(95.8+rnd(house*3,0,1.5)).toFixed(2), temp:+(27.3+rnd(house,0,1.5)).toFixed(1) },
    { label:'T20', dates:'13/05–19/05', henDay:+(base.henDay-0.2).toFixed(2), fcr:+(base.fcr+0.01).toFixed(3), mort:+(base.mort+0.002).toFixed(4), feed:+(base.feed+0.3).toFixed(1), dirty:+(1.65+rnd(house,0,0.4)).toFixed(2), cracked:+(0.80+rnd(house*2,0,0.2)).toFixed(2), saleable:+(96.0+rnd(house*3,0,1.5)).toFixed(2), temp:+(27.2+rnd(house,0,1.5)).toFixed(1) },
    { label:'T21', dates:'20/05–26/05', henDay:+base.henDay.toFixed(2), fcr:+base.fcr.toFixed(3), mort:+base.mort.toFixed(4), feed:+base.feed.toFixed(1), dirty:+(1.6+rnd(house,0,0.4)).toFixed(2), cracked:+(0.78+rnd(house*2,0,0.2)).toFixed(2), saleable:+(96.2+rnd(house*3,0,1.5)).toFixed(2), temp:+(27.0+rnd(house,0,1.5)).toFixed(1) },
  ];
};

// Tạo mock monthly data cho 1 nhà
const makeMonthlyHouse = (house, zone) => {
  const base = { henDay: 90+rnd(house,0,3), fcr: 2.05+rnd(house*3,0,0.15),
                 mort: 0.040+rnd(house*5,0,0.025), feed: 111+rnd(house*2,0,5) };
  const months = ['T12/2025','T01/2026','T02/2026','T03/2026','T04/2026','T05/2026'];
  const mdates = ['12/2025','01/2026','02/2026','03/2026','04/2026','05/2026'];
  return months.map((lbl, i) => ({
    label: lbl, dates: mdates[i],
    henDay:  +(base.henDay - (5-i)*0.4 + rnd(house+i,0,0.5)).toFixed(2),
    fcr:     +(base.fcr    + (5-i)*0.01 + rnd(house*2+i,0,0.03)).toFixed(3),
    mort:    +(base.mort   + (5-i)*0.001+ rnd(house*3+i,0,0.004)).toFixed(4),
    feed:    +(base.feed   + (5-i)*0.3  + rnd(house*4+i,0,1)).toFixed(1),
    dirty:   +(1.6+rnd(house+i*3,0,0.6)).toFixed(2),
    cracked: +(0.78+rnd(house*2+i*3,0,0.28)).toFixed(2),
    saleable:+(95.8+rnd(house*3+i,0,1.5)).toFixed(2),
    temp:    +(22+i*1.2+rnd(house+i,0,1.5)).toFixed(1),
  }));
};

// Tạo mock zone-level data
const makeZoneData = (zone) => {
  const { houses, birds, breed } = ZONE_CONFIG[zone];
  const baseHD = zone==='B'?92.82:zone==='C'?92.35:92.21;
  const weeklyBase = [
    { label:'T18', dates:'29/04–05/05', d:-1.2, fcrD:+0.04, mortD:+0.003 },
    { label:'T19', dates:'06/05–12/05', d:-0.8, fcrD:+0.02, mortD:+0.001 },
    { label:'T20', dates:'13/05–19/05', d:-0.4, fcrD:+0.01, mortD:+0.002 },
    { label:'T21', dates:'20/05–26/05', d: 0.0, fcrD:+0.00, mortD:+0.000 },
  ];
  const monthlyBase = [
    { label:'T12/2025', dates:'12/2025', d:-2.8 }, { label:'T01/2026', dates:'01/2026', d:-2.2 },
    { label:'T02/2026', dates:'02/2026', d:-1.6 }, { label:'T03/2026', dates:'03/2026', d:-1.0 },
    { label:'T04/2026', dates:'04/2026', d:-0.4 }, { label:'T05/2026', dates:'05/2026', d: 0.0 },
  ];
  const baseFCR = zone==='B'?2.06:zone==='C'?2.09:2.10;
  const baseMort = zone==='B'?0.048:zone==='C'?0.051:0.057;
  const baseFeed = zone==='B'?112.6:zone==='C'?113.8:113.1;
  const totalBirds = houses.reduce((s,h) => s+birds(h), 0);

  const buildRow = (b) => ({
    ...b, henDay: +(baseHD+b.d).toFixed(2),
    fcr:  +(baseFCR+(b.fcrD||0)).toFixed(3),
    mort: +(baseMort+(b.mortD||0)).toFixed(4),
    feed: +(baseFeed+rnd(b.d*10,0,0.5)).toFixed(1),
    dirty: +(1.8+rnd(b.d,0,0.3)).toFixed(2),
    cracked: +(0.88+rnd(b.d*2,0,0.15)).toFixed(2),
    saleable: +(96.0+rnd(b.d,0,0.8)).toFixed(2),
    temp: +(27+rnd(b.d*3,0,1.5)).toFixed(1),
  });

  return {
    zone, breed, totalBirds, houses,
    weekly:  weeklyBase.map(buildRow),
    monthly: monthlyBase.map(buildRow),
    houseList: houses.map(h => ({
      id: h, label: `Nhà ${h}`,
      birds: birds(h),
      weekly:  makeWeeklyHouse(h, zone),
      monthly: makeMonthlyHouse(h, zone),
    })),
  };
};

// Build all data once
const ALL_DATA = {
  farm: {
    weekly: [
      { label:'T18', dates:'29/04–05/05', henDay:91.20, fcr:2.11, mort:0.051, feed:114.5, eggs:519200, dirty:1.95, cracked:0.92, saleable:96.10, temp:28.2 },
      { label:'T19', dates:'06/05–12/05', henDay:91.72, fcr:2.10, mort:0.049, feed:113.8, eggs:521400, dirty:1.88, cracked:0.91, saleable:96.20, temp:27.9 },
      { label:'T20', dates:'13/05–19/05', henDay:92.10, fcr:2.09, mort:0.051, feed:113.5, eggs:524600, dirty:1.82, cracked:0.90, saleable:96.35, temp:27.7 },
      { label:'T21', dates:'20/05–26/05', henDay:92.46, fcr:2.08, mort:0.052, feed:113.2, eggs:528760, dirty:1.80, cracked:0.90, saleable:96.50, temp:27.6 },
    ],
    monthly: [
      { label:'T12/2025', dates:'12/2025', henDay:89.50, fcr:2.15, mort:0.055, feed:116.2, dirty:2.10, cracked:1.05, saleable:95.50, temp:22.1 },
      { label:'T01/2026', dates:'01/2026', henDay:90.20, fcr:2.13, mort:0.054, feed:115.8, dirty:2.02, cracked:1.00, saleable:95.80, temp:21.5 },
      { label:'T02/2026', dates:'02/2026', henDay:90.80, fcr:2.12, mort:0.053, feed:115.2, dirty:1.98, cracked:0.98, saleable:95.95, temp:22.8 },
      { label:'T03/2026', dates:'03/2026', henDay:91.20, fcr:2.11, mort:0.052, feed:114.8, dirty:1.95, cracked:0.95, saleable:96.05, temp:25.3 },
      { label:'T04/2026', dates:'04/2026', henDay:91.72, fcr:2.10, mort:0.051, feed:114.2, dirty:1.88, cracked:0.92, saleable:96.20, temp:27.1 },
      { label:'T05/2026', dates:'05/2026', henDay:92.46, fcr:2.08, mort:0.052, feed:113.2, dirty:1.80, cracked:0.90, saleable:96.50, temp:27.6 },
    ],
    zones: [
      { zone:'Khu B', zoneKey:'B', houses:10, birds:198240, henDay:92.82, fcr:2.06, mort:0.048, feed:112.6, saleable:96.80, temp:27.4, color:'#22c55e' },
      { zone:'Khu C', zoneKey:'C', houses:8,  birds:195860, henDay:92.35, fcr:2.09, mort:0.051, feed:113.8, saleable:96.30, temp:27.8, color:'#3b82f6' },
      { zone:'Khu D', zoneKey:'D', houses:12, birds:193350, henDay:92.21, fcr:2.10, mort:0.057, feed:113.1, saleable:96.40, temp:27.6, color:'#a855f7' },
    ],
  },
  B: makeZoneData('B'),
  C: makeZoneData('C'),
  D: makeZoneData('D'),
};

// ── Color palette ─────────────────────────────────────────────
const C = {
  bg:'#f8fafc', card:'#ffffff', border:'#e2e8f0',
  text:'#1e293b', muted:'#64748b',
  green:'#16a34a', red:'#dc2626', amber:'#d97706', blue:'#2563eb', purple:'#7c3aed',
  greenDim:'rgba(22,163,74,0.08)', redDim:'rgba(220,38,38,0.08)', amberDim:'rgba(217,119,6,0.08)',
  blueDim:'rgba(37,99,235,0.07)',
};
const fmt  = (n, d=2) => typeof n==='number' ? n.toFixed(d) : n;
const fmtK = n => n>=1000000?(n/1000000).toFixed(2)+'M':n>=1000?(n/1000).toFixed(1)+'K':String(n);
const dlt  = (curr, prev, inv=false) => {
  const d = curr-prev; const ok = inv ? d<0 : d>0;
  return { val:(d>=0?'+':'')+d.toFixed(2), color: ok?C.green:C.red };
};

// ── Shared sub-components ─────────────────────────────────────
function KpiCard({ icon, label, value, bench, delta, status, isJP }) {
  const sc = { good:C.green, warn:C.amber, bad:C.red, neutral:C.blue };
  const sb = { good:C.greenDim, warn:C.amberDim, bad:C.redDim, neutral:C.blueDim };
  return (
    <div style={{ background:sb[status], border:`1px solid ${sc[status]}33`, borderRadius:12, padding:'14px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:6 }}>{icon} {label}</div>
          <div style={{ fontSize:30, fontWeight:700, color:sc[status] }}>{value}</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>{isJP?'基準':'Chuẩn'}: {bench}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:14, fontWeight:600, color:delta.color, background:`${delta.color}22`, borderRadius:6, padding:'3px 8px' }}>
            {delta.val}
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>{isJP?'前期比':'vs kỳ trước'}</div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
      <span>{icon}</span> {title}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
function BaoCaoContent() {
  const { lang } = useFarm();
  const isJP = lang === 'ja';

  // Scope: 'farm' | 'zone' | 'house'
  const [scope,    setScope]    = useState('farm');
  const [selZone,  setSelZone]  = useState('B');
  const [selHouse, setSelHouse] = useState(6);
  const [period,   setPeriod]   = useState('month');
  const [selIdx,   setSelIdx]   = useState(5);

  // ── Resolve active dataset ──────────────────────────────────
  const activeData = useMemo(() => {
    if (scope === 'farm') return period==='week' ? ALL_DATA.farm.weekly : ALL_DATA.farm.monthly;
    if (scope === 'zone') return period==='week' ? ALL_DATA[selZone].weekly : ALL_DATA[selZone].monthly;
    // house
    const zd = ALL_DATA[selZone];
    const hd = zd.houseList.find(h => h.id === selHouse);
    return period==='week' ? hd.weekly : hd.monthly;
  }, [scope, selZone, selHouse, period]);

  const safeIdx = Math.min(selIdx, activeData.length-1);
  const curr = activeData[safeIdx] ?? activeData[activeData.length-1];
  const prev = activeData[safeIdx-1] ?? activeData[0];

  // ── Scope title ─────────────────────────────────────────────
  const scopeTitle = useMemo(() => {
    if (scope==='farm') return isJP ? '全農場' : 'Toàn trại';
    if (scope==='zone') return isJP ? `${selZone}団地` : `Khu ${selZone}`;
    return isJP ? `${selHouse}号舎` : `Nhà ${selHouse}`;
  }, [scope, selZone, selHouse, isJP]);

  const scopeColor = scope==='farm' ? C.green : scope==='zone' ? ZONE_CONFIG[selZone].color : C.amber;

  // ── House options for selector ───────────────────────────────
  const houseOptions = ZONE_CONFIG[selZone].houses;

  // ── Chart data ───────────────────────────────────────────────
  const keyMort = isJP ? '死亡率 (‰)' : 'Chết (‰)';
  const keyFeed = isJP ? '飼料 (g)' : 'Cám (g)';
  const keyHD   = isJP ? '産卵率 (%)' : 'Hen-Day (%)';
  const chartData = useMemo(() => activeData.map(d => ({
    name: d.label,
    [keyHD]: d.henDay,
    'FCR': d.fcr,
    [keyMort]: +(d.mort*1000).toFixed(2),
    [keyFeed]: d.feed,
  })), [activeData, isJP, keyMort, keyFeed, keyHD]);

  // ── KPI cards ────────────────────────────────────────────────
  const kpis = [
    { icon:'🥚', label:'Hen-Day Production', value:fmt(curr.henDay)+'%',   bench:'≥'+BENCH.henDay+'%', delta:dlt(curr.henDay,prev.henDay),       status:curr.henDay>=BENCH.henDay?'good':'warn' },
    { icon:'🌾', label:'FCR',                value:fmt(curr.fcr,2),         bench:'≤'+BENCH.fcr,        delta:dlt(curr.fcr,prev.fcr,true),         status:curr.fcr<=BENCH.fcr?'good':'warn' },
    { icon:'📉', label:isJP?'死亡率':'Tỉ lệ chết', value:(curr.mort*1000).toFixed(1)+'‰', bench:'≤'+(BENCH.mort*1000)+'‰', delta:dlt(curr.mort*1000,prev.mort*1000,true), status:curr.mort<=BENCH.mort?'good':'bad' },
    { icon:'✅', label:isJP?'合格卵率':'Thương phẩm', value:fmt(curr.saleable)+'%', bench:'≥'+BENCH.saleable+'%', delta:dlt(curr.saleable,prev.saleable), status:curr.saleable>=BENCH.saleable?'good':'warn' },
    { icon:'🌡️', label:isJP?'気温':'Nhiệt độ', value:fmt(curr.temp,1)+'°C', bench:'24–29°C', delta:dlt(curr.temp,prev.temp,true), status:curr.temp<=29&&curr.temp>=24?'good':'warn' },
    { icon:'🏭', label:isJP?'飼料':'Tiêu thụ cám', value:fmt(curr.feed,1)+' g', bench:'< 116 g', delta:dlt(curr.feed,prev.feed,true), status:curr.feed<116?'good':'warn' },
  ];

  const now = new Date();
  const printDate = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`;

  return (<>
      <style>{`
        @media print {
          body { background:#fff !important; color:#000 !important; }
          .no-print { display:none !important; }
          .pc { background:#fff !important; border:1px solid #ddd !important; color:#000 !important; box-shadow:none !important; }
          @page { size:A4 landscape; margin:12mm; }
          .pba { page-break-before: always; }
        }
        .btn { cursor:pointer; transition:all .15s; border:none; }
        .btn:hover { opacity:.82; }
        .rh:hover { background:#f1f5f9; }
      `}</style>

      <div style={{ padding:'22px', maxWidth:1200, margin:'0 auto', background:'#f8fafc', minHeight:'100vh' }}>

        {/* ── Header ────────────────────────────────────────── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontSize:22 }}>📋</span>
              <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:C.text }}>
                {isJP?'生産レポート':'Báo Cáo Sản Xuất'}
              </h1>
              <span style={{ background:`${scopeColor}22`, color:scopeColor, border:`1px solid ${scopeColor}44`,
                borderRadius:6, padding:'3px 10px', fontSize:13, fontWeight:600 }}>
                {scopeTitle}
              </span>
            </div>
            <div style={{ fontSize:14, color:C.muted }}>
              FarmTrack Poultry · {isJP?'出力':'Xuất'}: {printDate}
            </div>
          </div>

          {/* Controls */}
          <div className="no-print" style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'flex-end' }}>

            {/* Scope */}
            <div style={{ display:'flex', gap:3, background:C.card, borderRadius:8, padding:4, border:`1px solid ${C.border}` }}>
              {[['farm',isJP?'全農場':'Toàn trại','#22c55e'],
                ['zone',isJP?'団地別':'Theo khu','#3b82f6'],
                ['house',isJP?'鶏舎別':'Theo nhà','#f59e0b']].map(([v,lbl,col]) => (
                <button key={v} className="btn"
                  onClick={() => { setScope(v); setSelIdx(period==='week'?3:5); }}
                  style={{ padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:600,
                    background:scope===v?col:'transparent', color:scope===v?'#000':C.muted }}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* Zone selector */}
            {(scope==='zone'||scope==='house') && (
              <select value={selZone}
                onChange={e => { setSelZone(e.target.value); setSelHouse(ZONE_CONFIG[e.target.value].houses[0]); }}
                style={{ background:'#fff', color:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 12px', fontSize:13 }}>
                {['B','C','D'].map(z => <option key={z} value={z}>{isJP?`${z}団地`:`Khu ${z}`} ({ZONE_CONFIG[z].houses.length} {isJP?'舎':'nhà'})</option>)}
              </select>
            )}

            {/* House selector */}
            {scope==='house' && (
              <select value={selHouse} onChange={e => setSelHouse(+e.target.value)}
                style={{ background:'#fff', color:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 12px', fontSize:13 }}>
                {houseOptions.map(h => <option key={h} value={h}>{isJP?`${h}号舎`:`Nhà ${h}`}</option>)}
              </select>
            )}

            {/* Period */}
            <div style={{ display:'flex', gap:3, background:C.card, borderRadius:8, padding:4, border:`1px solid ${C.border}` }}>
              {[['week',isJP?'週':'Tuần'],['month',isJP?'月':'Tháng']].map(([v,lbl]) => (
                <button key={v} className="btn"
                  onClick={() => { setPeriod(v); setSelIdx(v==='week'?3:5); }}
                  style={{ padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:600,
                    background:period===v?C.green:'transparent', color:period===v?'#000':C.muted }}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* Period index */}
            <select value={safeIdx} onChange={e => setSelIdx(+e.target.value)}
              style={{ background:'#fff', color:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', fontSize:13 }}>
              {activeData.map((d,i) => <option key={i} value={i}>{d.label} ({d.dates})</option>)}
            </select>

            {/* PDF */}
            <button className="btn" onClick={() => window.print()}
              style={{ background:'#1d4ed8', color:'#fff', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600,
                display:'flex', alignItems:'center', gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z"/><polyline points="14,2 14,8 20,8"/>
                <line x1="12" y1="12" x2="12" y2="18"/><polyline points="9,15 12,18 15,15"/>
              </svg>
              {isJP?'PDF出力':'Xuất PDF'}
            </button>
          </div>
        </div>

        {/* ── Banner kỳ báo cáo ──────────────────────────────── */}
        <div style={{ background:`linear-gradient(135deg,#14532d,#166534)`, borderRadius:12,
          padding:'14px 20px', marginBottom:18, border:`1px solid ${C.green}33` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>
                {isJP?'対象期間':'Kỳ báo cáo'}: <span style={{ color:'#4ade80' }}>{curr.label}</span>
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginLeft:8 }}>({curr.dates})</span>
              </span>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', marginTop:2 }}>
                {isJP?'前期':'So với'}: {prev.label} ({prev.dates})
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>{scopeTitle}</div>
              {scope==='house' && (
                <div style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>
                  {fmtK(ALL_DATA[selZone].houseList.find(h=>h.id===selHouse)?.birds || 0)} {isJP?'羽':'con'}
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginLeft:6 }}>
                    {ZONE_CONFIG[selZone].breed}
                  </span>
                </div>
              )}
              {scope==='zone' && (
                <div style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>
                  {ALL_DATA[selZone].totalBirds.toLocaleString()} {isJP?'羽':'con'}
                  · {ZONE_CONFIG[selZone].houses.length} {isJP?'舎':'nhà'}
                </div>
              )}
              {scope==='farm' && (
                <div style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>587,450 {isJP?'羽':'con'} · 30 {isJP?'舎':'nhà'}</div>
              )}
            </div>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
          {kpis.map((k,i) => <KpiCard key={i} {...k} isJP={isJP} />)}
        </div>

        {/* ── Charts 2×2 ─────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
          {/* Hen-Day */}
          <div className="pc" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
            <SectionTitle icon="📈" title={isJP?'産卵率 Hen-Day (%)':'Xu hướng Hen-Day (%)'} />
            <ResponsiveContainer width="100%" height={195}>
              <LineChart data={chartData} margin={{top:4,right:8,bottom:0,left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                <XAxis dataKey="name" tick={{fill:C.muted,fontSize:11}}/>
                <YAxis domain={[87,96]} tick={{fill:C.muted,fontSize:11}}/>
                <Tooltip contentStyle={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b'}}/>
                <ReferenceLine y={BENCH.henDay} stroke={C.amber} strokeDasharray="4 2"
                  label={{value:isJP?'基準':'Chuẩn',fill:C.amber,fontSize:10,position:'right'}}/>
                <Line type="monotone" dataKey={keyHD} stroke={C.green} strokeWidth={2.5} dot={{fill:C.green,r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* FCR */}
          <div className="pc" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
            <SectionTitle icon="🌾" title={isJP?'FCRトレンド':'Xu hướng FCR'} />
            <ResponsiveContainer width="100%" height={195}>
              <LineChart data={chartData} margin={{top:4,right:8,bottom:0,left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                <XAxis dataKey="name" tick={{fill:C.muted,fontSize:11}}/>
                <YAxis domain={[2.0,2.2]} tick={{fill:C.muted,fontSize:11}}/>
                <Tooltip contentStyle={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b'}}/>
                <ReferenceLine y={BENCH.fcr} stroke={C.amber} strokeDasharray="4 2"
                  label={{value:isJP?'基準':'Chuẩn',fill:C.amber,fontSize:10,position:'right'}}/>
                <Line type="monotone" dataKey="FCR" stroke={C.blue} strokeWidth={2.5} dot={{fill:C.blue,r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Feed */}
          <div className="pc" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
            <SectionTitle icon="🏭" title={isJP?'飼料摂取量 (g/羽)':'Tiêu thụ cám (g/con/ngày)'} />
            <ResponsiveContainer width="100%" height={195}>
              <BarChart data={chartData} margin={{top:4,right:8,bottom:0,left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                <XAxis dataKey="name" tick={{fill:C.muted,fontSize:11}}/>
                <YAxis domain={[108,120]} tick={{fill:C.muted,fontSize:11}}/>
                <Tooltip contentStyle={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b'}}/>
                <Bar dataKey={keyFeed} fill={C.amber} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mortality */}
          <div className="pc" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
            <SectionTitle icon="📉" title={isJP?'死亡率 (‰)':'Tỉ lệ chết (‰)'} />
            <ResponsiveContainer width="100%" height={195}>
              <LineChart data={chartData} margin={{top:4,right:8,bottom:0,left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                <XAxis dataKey="name" tick={{fill:C.muted,fontSize:11}}/>
                <YAxis domain={[0.04,0.07]} tickFormatter={v=>(v*1000).toFixed(0)+'‰'} tick={{fill:C.muted,fontSize:11}}/>
                <Tooltip contentStyle={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b'}}
                  formatter={v=>[(v*1000).toFixed(2)+'‰', isJP?'死亡率':'Tỉ lệ chết']}/>
                <ReferenceLine y={BENCH.mort} stroke={C.red} strokeDasharray="4 2"
                  label={{value:isJP?'基準':'Chuẩn',fill:C.red,fontSize:10}}/>
                <Line type="monotone" dataKey={keyMort} stroke={C.red} strokeWidth={2.5} dot={{fill:C.red,r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Detail table: farm=zones, zone=houses, house=metrics ── */}
        {scope === 'farm' && (
          <ZoneTable zones={ALL_DATA.farm.zones} isJP={isJP} />
        )}
        {scope === 'zone' && (
          <HouseTable
            houseList={ALL_DATA[selZone].houseList}
            period={period} selIdx={safeIdx} isJP={isJP}
            zoneColor={ZONE_CONFIG[selZone].color}
            zoneName={isJP?`${selZone}団地`:`Khu ${selZone}`}
          />
        )}
        {scope === 'house' && (
          <HouseDetailTable curr={curr} prev={prev} isJP={isJP} />
        )}

        {/* ── Auto remarks ────────────────────────────────────── */}
        <AutoRemarks curr={curr} prev={prev} isJP={isJP} />

        {/* ── Footer ─────────────────────────────────────────── */}
        <div style={{ textAlign:'center', padding:'10px 0', borderTop:`1px solid ${C.border}`, marginTop:16 }}>
          <span style={{ fontSize:13, color:C.muted }}>
            FarmTrack · {isJP?'自動生成':'Tự động tạo'} · {printDate}
          </span>
        </div>

      </div>
  </>);
}

export default function BaoCaoPage() {
  return (
    <FarmLayout>
      <BaoCaoContent />
    </FarmLayout>
  );
}

// ── Zone table (dùng cho scope=farm) ─────────────────────────
function ZoneTable({ zones, isJP }) {
  const totalBirds = zones.reduce((s,z)=>s+z.birds,0);
  const avg = k => zones.reduce((s,z)=>s+z[k],0)/zones.length;
  const cols = [
    isJP?'エリア':'Khu', isJP?'鶏舎':'Nhà',
    isJP?'羽数':'Đàn', 'Hen-Day %', 'FCR',
    isJP?'死亡率':'Tỉ lệ chết', isJP?'飼料(g)':'Cám (g)',
    isJP?'合格卵':'Thương phẩm', isJP?'気温':'Nhiệt độ',
  ];
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>🏠 {isJP?'エリア別実績':'Kết quả theo khu'}</div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ background:'#f8fafc' }}>
            {cols.map((h,i) => <th key={i} style={{ padding:'9px 12px', textAlign:i===0?'left':'right', color:C.muted, fontWeight:600, fontSize:13 }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {zones.map((z,i) => (
            <tr key={i} className="rh" style={{ borderTop:`1px solid ${C.border}` }}>
              <td style={{ padding:'12px 14px', fontWeight:600, color:C.text }}>
                <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:z.color, marginRight:8 }}/>
                {z.zone}
              </td>
              <td style={{ padding:'12px 14px', textAlign:'right', color:C.muted, fontSize:13 }}>{z.houses}</td>
              <td style={{ padding:'10px 12px', textAlign:'right', color:C.text }}>{z.birds.toLocaleString()}</td>
              <td style={{ padding:'10px 12px', textAlign:'right', color:z.henDay>=BENCH.henDay?C.green:C.amber, fontWeight:600 }}>{z.henDay.toFixed(2)}%</td>
              <td style={{ padding:'10px 12px', textAlign:'right', color:z.fcr<=BENCH.fcr?C.green:C.amber, fontWeight:600 }}>{z.fcr.toFixed(2)}</td>
              <td style={{ padding:'10px 12px', textAlign:'right', color:z.mort<=BENCH.mort?C.green:C.red, fontWeight:600 }}>{(z.mort*1000).toFixed(1)}‰</td>
              <td style={{ padding:'10px 12px', textAlign:'right', color:C.text }}>{z.feed}</td>
              <td style={{ padding:'10px 12px', textAlign:'right', color:z.saleable>=BENCH.saleable?C.green:C.amber, fontWeight:600 }}>{z.saleable.toFixed(2)}%</td>
              <td style={{ padding:'12px 14px', textAlign:'right', color:C.muted, fontSize:13 }}>{z.temp}°C</td>
            </tr>
          ))}
          <tr style={{ borderTop:`2px solid ${C.border}`, background:'#f0fdf4' }}>
            <td style={{ padding:'10px 12px', fontWeight:700, color:C.green }} colSpan={2}>{isJP?'合計/平均':'Tổng / TB'}</td>
            <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:C.green }}>{totalBirds.toLocaleString()}</td>
            <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('henDay').toFixed(2)}%</td>
            <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('fcr').toFixed(2)}</td>
            <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:C.green }}>{(avg('mort')*1000).toFixed(1)}‰</td>
            <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('feed').toFixed(1)}</td>
            <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('saleable').toFixed(2)}%</td>
            <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('temp').toFixed(1)}°C</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── House table (dùng cho scope=zone) ────────────────────────
function HouseTable({ houseList, period, selIdx, isJP, zoneColor, zoneName }) {
  const rows = houseList.map(h => {
    const d = (period==='week'?h.weekly:h.monthly)[Math.min(selIdx,(period==='week'?3:5))];
    return { id:h.id, birds:h.birds, ...d };
  });
  const avg = k => rows.reduce((s,r)=>s+(r[k]||0),0)/rows.length;

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ width:10, height:10, borderRadius:'50%', background:zoneColor, display:'inline-block' }}/>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>
          🏠 {isJP?`${zoneName} — 鶏舎別実績`:`${zoneName} — Kết quả từng nhà`}
        </div>
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#f8fafc' }}>
              {[isJP?'鶏舎':'Nhà', isJP?'羽数':'Đàn', 'Hen-Day', 'FCR',
                isJP?'死亡率':'Tỉ lệ chết', isJP?'飼料':'Cám (g)',
                isJP?'汚卵':'Bẩn', isJP?'破卵':'Vỡ',
                isJP?'合格卵':'Thương phẩm', isJP?'気温':'Nhiệt độ'].map((h,i) => (
                <th key={i} style={{ padding:'9px 10px', textAlign:i===0?'left':'right', color:C.muted, fontWeight:600, fontSize:11, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={i} className="rh" style={{ borderTop:`1px solid ${C.border}` }}>
                <td style={{ padding:'9px 10px', fontWeight:600, color:zoneColor, whiteSpace:'nowrap' }}>
                  {isJP?`${r.id}号舎`:`Nhà ${r.id}`}
                </td>
                <td style={{ padding:'11px 10px', textAlign:'right', color:C.muted, fontSize:13 }}>{r.birds.toLocaleString()}</td>
                <td style={{ padding:'9px 10px', textAlign:'right', color:r.henDay>=BENCH.henDay?C.green:C.amber, fontWeight:600 }}>{r.henDay.toFixed(2)}%</td>
                <td style={{ padding:'9px 10px', textAlign:'right', color:r.fcr<=BENCH.fcr?C.green:C.amber, fontWeight:600 }}>{r.fcr.toFixed(2)}</td>
                <td style={{ padding:'9px 10px', textAlign:'right', color:r.mort<=BENCH.mort?C.green:C.red, fontWeight:600 }}>{(r.mort*1000).toFixed(1)}‰</td>
                <td style={{ padding:'9px 10px', textAlign:'right', color:C.text }}>{r.feed}</td>
                <td style={{ padding:'9px 10px', textAlign:'right', color:r.dirty<=BENCH.dirty?C.green:C.amber }}>{r.dirty.toFixed(2)}%</td>
                <td style={{ padding:'9px 10px', textAlign:'right', color:r.cracked<=BENCH.cracked?C.green:C.amber }}>{r.cracked.toFixed(2)}%</td>
                <td style={{ padding:'9px 10px', textAlign:'right', color:r.saleable>=BENCH.saleable?C.green:C.amber, fontWeight:600 }}>{r.saleable.toFixed(2)}%</td>
                <td style={{ padding:'11px 10px', textAlign:'right', color:C.muted, fontSize:13 }}>{r.temp}°C</td>
              </tr>
            ))}
            {/* Average row */}
            <tr style={{ borderTop:`2px solid ${C.border}`, background:`${zoneColor}0d` }}>
              <td style={{ padding:'9px 10px', fontWeight:700, color:zoneColor }} colSpan={2}>{isJP?'平均':'Trung bình'}</td>
              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('henDay').toFixed(2)}%</td>
              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('fcr').toFixed(2)}</td>
              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:C.green }}>{(avg('mort')*1000).toFixed(1)}‰</td>
              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('feed').toFixed(1)}</td>
              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('dirty').toFixed(2)}%</td>
              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('cracked').toFixed(2)}%</td>
              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('saleable').toFixed(2)}%</td>
              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:C.green }}>{avg('temp').toFixed(1)}°C</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── House detail (scope=house) ────────────────────────────────
function HouseDetailTable({ curr, prev, isJP }) {
  const rows = [
    { label:'Hen-Day (%)', curr:curr.henDay.toFixed(2)+'%', prev:prev.henDay.toFixed(2)+'%', ok:curr.henDay>=BENCH.henDay, bench:'≥'+BENCH.henDay+'%' },
    { label:'FCR',         curr:curr.fcr.toFixed(2),         prev:prev.fcr.toFixed(2),         ok:curr.fcr<=BENCH.fcr,       bench:'≤'+BENCH.fcr },
    { label:isJP?'死亡率':'Tỉ lệ chết', curr:(curr.mort*1000).toFixed(1)+'‰', prev:(prev.mort*1000).toFixed(1)+'‰', ok:curr.mort<=BENCH.mort, bench:'≤'+(BENCH.mort*1000)+'‰' },
    { label:isJP?'飼料摂取':'Tiêu thụ cám', curr:curr.feed.toFixed(1)+' g', prev:prev.feed.toFixed(1)+' g', ok:curr.feed<116, bench:'< 116 g' },
    { label:isJP?'汚卵率':'Trứng bẩn', curr:curr.dirty.toFixed(2)+'%', prev:prev.dirty.toFixed(2)+'%', ok:curr.dirty<=BENCH.dirty, bench:'≤'+BENCH.dirty+'%' },
    { label:isJP?'破卵率':'Trứng vỡ',  curr:curr.cracked.toFixed(2)+'%', prev:prev.cracked.toFixed(2)+'%', ok:curr.cracked<=BENCH.cracked, bench:'≤'+BENCH.cracked+'%' },
    { label:isJP?'合格卵率':'Thương phẩm', curr:curr.saleable.toFixed(2)+'%', prev:prev.saleable.toFixed(2)+'%', ok:curr.saleable>=BENCH.saleable, bench:'≥'+BENCH.saleable+'%' },
    { label:isJP?'気温':'Nhiệt độ', curr:curr.temp.toFixed(1)+'°C', prev:prev.temp.toFixed(1)+'°C', ok:curr.temp>=24&&curr.temp<=29, bench:'24–29°C' },
  ];
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>📊 {isJP?'鶏舎別指標詳細':'Chi tiết chỉ số nhà gà'}</div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ background:'#f8fafc' }}>
            {[isJP?'指標':'Chỉ số', isJP?'今期':'Kỳ này', isJP?'前期':'Kỳ trước', isJP?'差異':'Chênh', isJP?'基準':'Chuẩn', isJP?'判定':'Đánh giá'].map((h,i) => (
              <th key={i} style={{ padding:'9px 12px', textAlign:i===0?'left':'right', color:C.muted, fontWeight:600, fontSize:13 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i) => {
            const cv = parseFloat(r.curr); const pv = parseFloat(r.prev);
            const diff = isNaN(cv)||isNaN(pv) ? '—' : ((cv-pv)>=0?'+':'')+(cv-pv).toFixed(2);
            return (
              <tr key={i} className="rh" style={{ borderTop:`1px solid ${C.border}` }}>
                <td style={{ padding:'10px 12px', fontWeight:500, color:C.text }}>{r.label}</td>
                <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:r.ok?C.green:C.amber }}>{r.curr}</td>
                <td style={{ padding:'12px 14px', textAlign:'right', color:C.muted, fontSize:13 }}>{r.prev}</td>
                <td style={{ padding:'10px 12px', textAlign:'right', color:C.muted, fontSize:12 }}>{diff}</td>
                <td style={{ padding:'12px 14px', textAlign:'right', color:C.muted, fontSize:13 }}>{r.bench}</td>
                <td style={{ padding:'10px 12px', textAlign:'right' }}>
                  <span style={{ background:r.ok?C.greenDim:C.amberDim, color:r.ok?C.green:C.amber,
                    borderRadius:5, padding:'2px 8px', fontSize:11, fontWeight:600 }}>
                    {r.ok ? (isJP?'達成 ✓':'Đạt ✓') : (isJP?'要改善 ⚠':'Cần cải thiện ⚠')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Auto remarks ──────────────────────────────────────────────
function AutoRemarks({ curr, prev, isJP }) {
  const remarks = [
    curr.henDay>=BENCH.henDay
      ? { ok:true,  msg:isJP?`産卵率 ${curr.henDay.toFixed(2)}% — 基準達成 ✓`:`Hen-Day ${curr.henDay.toFixed(2)}% — đạt chuẩn ✓` }
      : { ok:false, msg:isJP?`産卵率 ${curr.henDay.toFixed(2)}% — 基準 ${BENCH.henDay}% 未達 ⚠`:`Hen-Day ${curr.henDay.toFixed(2)}% dưới chuẩn ${BENCH.henDay}% ⚠` },
    curr.fcr<=BENCH.fcr
      ? { ok:true,  msg:isJP?`FCR ${curr.fcr.toFixed(2)} — 良好 ✓`:`FCR ${curr.fcr.toFixed(2)} — đạt chuẩn ✓` }
      : { ok:false, msg:isJP?`FCR ${curr.fcr.toFixed(2)} — 基準超過 ⚠`:`FCR ${curr.fcr.toFixed(2)} vượt chuẩn ⚠` },
    curr.mort<=BENCH.mort
      ? { ok:true,  msg:isJP?`死亡率 ${(curr.mort*1000).toFixed(1)}‰ — 正常 ✓`:`Tỉ lệ chết ${(curr.mort*1000).toFixed(1)}‰ — trong ngưỡng ✓` }
      : { ok:false, msg:isJP?`死亡率 ${(curr.mort*1000).toFixed(1)}‰ — 要注意 ⚠`:`Tỉ lệ chết ${(curr.mort*1000).toFixed(1)}‰ — cần theo dõi ⚠` },
    { ok:curr.henDay>prev.henDay,
      msg:isJP
        ?`前期比: Hen-Day ${curr.henDay>prev.henDay?'改善':'低下'} (${(curr.henDay-prev.henDay>=0?'+':'')+((curr.henDay-prev.henDay).toFixed(2))}%)`
        :`So kỳ trước: Hen-Day ${curr.henDay>prev.henDay?'tăng':'giảm'} ${Math.abs(curr.henDay-prev.henDay).toFixed(2)}%` },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
      {remarks.map((r,i) => (
        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 12px', borderRadius:8,
          background:r.ok?C.greenDim:C.amberDim, border:`1px solid ${r.ok?C.green:C.amber}33` }}>
          <span style={{ fontSize:14 }}>{r.ok?'✅':'⚠️'}</span>
          <span style={{ fontSize:12, color:r.ok?C.green:C.amber, lineHeight:1.5 }}>{r.msg}</span>
        </div>
      ))}
    </div>
  );
}
