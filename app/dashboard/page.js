'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';

import FarmLayout, { useFarm } from '@/components/FarmLayout';
import { useT } from '@/lib/i18n';
import { api } from '@/lib/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ── Colors & helpers ─────────────────────────────────────────
const C = {
  bg:    '#f8fafc', card:  '#ffffff', border:'#e2e8f0',
  text:  '#1e293b', muted: '#64748b', green: '#22c55e',
  red:   '#ef4444', amber: '#f59e0b', blue:  '#3b82f6',
};
const fmtNum = (n, d=1) => n == null ? '—' : Number(n).toLocaleString('vi-VN', { maximumFractionDigits: d });
const alertColor = { danger:'#ef4444', warning:'#f59e0b', info:'#3b82f6' };
const alertBg    = { danger:'rgba(239,68,68,.08)', warning:'rgba(245,158,11,.08)', info:'rgba(59,130,246,.08)' };

// ISO date → "DD/MM"
const fmtDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
};
const isoToday     = () => new Date().toISOString().slice(0, 10);
const isoYesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); };
const isoNDaysAgo  = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };

const BREED_COLORS = { Maria:'#ec4899', Borisu:'#f59e0b', Julialai:'#3b82f6' };
const ZONE_COLORS  = { B:'#22c55e', C:'#3b82f6', D:'#a855f7' };

// ── Compute all KPIs from raw API data ────────────────────────
function computeDashboard(dailyRecords, flocks, houses, feedRecords = []) {
  // Build lookup maps
  const flockMap = Object.fromEntries(flocks.map(f => [f.id, f]));
  const houseMap = Object.fromEntries(houses.map(h => [h.id, h]));

  // Total birds per house (from flock)
  const birdsByHouse = {};
  flocks.forEach(f => {
    birdsByHouse[f.house_id] = (birdsByHouse[f.house_id] || 0) + (f.current_count || f.initial_count || 0);
  });
  const totalBirds = Object.values(birdsByHouse).reduce((s, v) => s + v, 0);

  // Aggregate daily records for a given date range
  const aggRecords = (records) => {
    if (!records.length) return null;
    const totalBirdsInRecords = records.reduce((s, r) => s + (birdsByHouse[r.house_id] || 0), 0) || 1;
    const totalEggs   = records.reduce((s, r) => s + (r.total_eggs || 0), 0);
    const totalEggWt  = records.reduce((s, r) => s + (r.total_egg_weight_kg || 0), 0);
    const totalDead   = records.reduce((s, r) => s + (r.dead_count || 0), 0);
    const totalDirty  = records.reduce((s, r) => s + (r.dirty_eggs || 0), 0);
    const totalBroken = records.reduce((s, r) => s + (r.broken_eggs || 0), 0);
    const totalWater  = records.reduce((s, r) => s + (r.water_consumed_liter || 0), 0);
    const temps       = records.map(r => r.temp_max_c).filter(Boolean);
    return {
      totalEggs,
      totalBirds:  totalBirdsInRecords,
      henDay:      totalBirdsInRecords > 0 ? +(totalEggs / totalBirdsInRecords * 100).toFixed(2) : 0,
      mortality:   totalBirdsInRecords > 0 ? +(totalDead / totalBirdsInRecords * 100).toFixed(3) : 0,
      survival:    totalBirdsInRecords > 0 ? +((1 - totalDead/totalBirdsInRecords) * 100).toFixed(2) : 0,
      eggWeight:   totalEggs > 0 ? +(totalEggWt * 1000 / totalEggs).toFixed(1) : 0,
      waterIntake: totalBirdsInRecords > 0 ? +(totalWater * 1000 / totalBirdsInRecords).toFixed(1) : 0,
      avgTemp:     temps.length ? +(temps.reduce((s,v)=>s+v,0)/temps.length).toFixed(1) : 0,
      dirtyEgg:    totalEggs > 0 ? +(totalDirty/totalEggs*100).toFixed(2) : 0,
      crackedEgg:  totalEggs > 0 ? +(totalBroken/totalEggs*100).toFixed(2) : 0,
      saleableEgg: totalEggs > 0 ? +((totalEggs-totalDirty-totalBroken)/totalEggs*100).toFixed(2) : 0,
    };
  };

  const today     = isoToday();
  const yesterday = isoYesterday();

  const todayRecs = dailyRecords.filter(r => r.record_date === today);
  const ydayRecs  = dailyRecords.filter(r => r.record_date === yesterday);

  // Fallback: nếu hôm nay chưa có dữ liệu, dùng ngày gần nhất
  const dates = [...new Set(dailyRecords.map(r => r.record_date))].sort().reverse();
  const latestDate   = dates[0] || today;
  const prevDate     = dates[1] || yesterday;
  const latestRecs   = dailyRecords.filter(r => r.record_date === latestDate);
  const prevRecs     = dailyRecords.filter(r => r.record_date === prevDate);

  const todayAgg = aggRecords(latestRecs.length ? latestRecs : todayRecs);
  const prevAgg  = aggRecords(prevRecs.length  ? prevRecs  : ydayRecs);

  const farm = {
    totalBirds,
    henDay:          todayAgg?.henDay      ?? 0,   henDayPrev:     prevAgg?.henDay      ?? 0,
    totalEggs:       todayAgg?.totalEggs   ?? 0,   totalEggsPrev:  prevAgg?.totalEggs   ?? 0,
    mortality:       todayAgg?.mortality   ?? 0,   mortalityPrev:  prevAgg?.mortality   ?? 0,
    survival:        todayAgg?.survival    ?? 0,   survivalPrev:   prevAgg?.survival    ?? 0,
    waterIntake:     todayAgg?.waterIntake ?? 0,   waterIntakePrev:prevAgg?.waterIntake ?? 0,
    avgTemp:         todayAgg?.avgTemp     ?? 0,   avgTempPrev:    prevAgg?.avgTemp     ?? 0,
    eggWeight:       todayAgg?.eggWeight   ?? 0,   eggWeightPrev:  prevAgg?.eggWeight   ?? 0,
    dirtyEgg:        todayAgg?.dirtyEgg    ?? 0,   dirtyEggPrev:   prevAgg?.dirtyEgg    ?? 0,
    crackedEgg:      todayAgg?.crackedEgg  ?? 0,   crackedEggPrev: prevAgg?.crackedEgg  ?? 0,
    saleableEgg:     todayAgg?.saleableEgg ?? 0,   saleableEggPrev:prevAgg?.saleableEgg ?? 0,
    feedIntake:      0,  feedIntakePrev: 0,
    feedWater:       0,  feedWaterPrev:  0,
    fcr:             0,  fcrPrev:        0,
    pcr:             0,  pcrPrev:        0,
    feedCostEgg:     0,  feedCostPrev:   0,
  };

  // ── Feed computations ────────────────────────────────────
  const aggFeed = (date, birds) => {
    if (!birds) return { feedIntake: 0, feedKg: 0, feedCP: 0 };
    const recs = feedRecords.filter(r => r.record_date === date && r.type === 'CONSUMPTION');
    const totalFeedKg = recs.reduce((s, r) => s + (r.quantity_kg || 0), 0);
    // weighted avg CP
    const totalCP = recs.reduce((s, r) => s + (r.quantity_kg || 0) * (r.cp_percent || 0), 0);
    return {
      feedKg:    totalFeedKg,
      feedIntake: birds > 0 ? +(totalFeedKg * 1000 / birds).toFixed(1) : 0,
      feedCP:    totalFeedKg > 0 ? +(totalCP / totalFeedKg).toFixed(2) : 0,
    };
  };

  const latestFeed = aggFeed(latestDate, todayAgg?.totalBirds || totalBirds);
  const prevFeed   = aggFeed(prevDate,   prevAgg?.totalBirds  || totalBirds);
  const latestEggWt = latestRecs.reduce((s, r) => s + (r.total_egg_weight_kg || 0), 0);
  const prevEggWt   = prevRecs.reduce((s, r) => s + (r.total_egg_weight_kg || 0), 0);
  const latestEggs  = latestRecs.reduce((s, r) => s + (r.total_eggs || 0), 0);
  const prevEggs    = prevRecs.reduce((s, r) => s + (r.total_eggs || 0), 0);

  // FCR = feed_kg / egg_weight_kg  (tiêu chuẩn Lohmann ~2.05–2.15)
  // PCR = (feed_kg × CP%) / egg_weight_kg
  const fcr     = latestEggWt > 0 ? +(latestFeed.feedKg / latestEggWt).toFixed(2) : 0;
  const fcrPrev = prevEggWt   > 0 ? +(prevFeed.feedKg   / prevEggWt).toFixed(2)   : 0;
  const pcr     = latestEggWt > 0 ? +(latestFeed.feedKg * latestFeed.feedCP/100 / latestEggWt).toFixed(2) : 0;
  const pcrPrev = prevEggWt   > 0 ? +(prevFeed.feedKg   * prevFeed.feedCP/100   / prevEggWt).toFixed(2)   : 0;

  // Feed cost per egg: g feed / quả trứng (không có giá → dùng g/quả làm proxy)
  const gPerEgg     = latestEggs > 0 ? +(latestFeed.feedKg * 1000 / latestEggs).toFixed(1) : 0;
  const gPerEggPrev = prevEggs   > 0 ? +(prevFeed.feedKg   * 1000 / prevEggs).toFixed(1)   : 0;

  farm.feedIntake    = latestFeed.feedIntake;
  farm.feedIntakePrev= prevFeed.feedIntake;
  farm.feedWater     = latestFeed.feedIntake > 0 && farm.waterIntake > 0
    ? +(farm.waterIntake / latestFeed.feedIntake).toFixed(3) : 0;
  farm.feedWaterPrev = prevFeed.feedIntake   > 0 && farm.waterIntakePrev > 0
    ? +(farm.waterIntakePrev / prevFeed.feedIntake).toFixed(3) : 0;
  farm.fcr          = fcr;
  farm.fcrPrev      = fcrPrev;
  farm.pcr          = pcr;
  farm.pcrPrev      = pcrPrev;
  farm.feedCostEgg  = gPerEgg;
  farm.feedCostPrev = gPerEggPrev;

  // ── 7-day trend ──────────────────────────────────────────
  const trend7d = Array.from({ length: 7 }, (_, i) => {
    const iso  = isoNDaysAgo(6 - i);
    const recs = dailyRecords.filter(r => r.record_date === iso);
    const agg  = aggRecords(recs);
    return {
      date:   fmtDate(iso),
      henDay: agg?.henDay      ?? null,
      water:  agg?.waterIntake ?? null,
      mort:   agg?.mortality   ?? null,
      feed:   aggFeed(iso, agg?.totalBirds || totalBirds/7).feedIntake,
    };
  });

  // ── Breed pie ────────────────────────────────────────────
  const breedTotals = {};
  flocks.forEach(f => {
    const b = f.breed || 'Unknown';
    breedTotals[b] = (breedTotals[b] || 0) + (f.current_count || f.initial_count || 0);
  });
  const breedTotal = Object.values(breedTotals).reduce((s,v)=>s+v,0) || 1;
  const breedPie = Object.entries(breedTotals).map(([name, value]) => ({
    name,
    value,
    pct: +((value / breedTotal) * 100).toFixed(1),
    color: BREED_COLORS[name] || '#94a3b8',
  }));

  // ── Zone pie ─────────────────────────────────────────────
  const zoneTotals = {};
  flocks.forEach(f => {
    const h    = houseMap[f.house_id];
    const zone = h?.zone || 'B';
    zoneTotals[zone] = (zoneTotals[zone] || 0) + (f.current_count || f.initial_count || 0);
  });
  const zoneTotal = Object.values(zoneTotals).reduce((s,v)=>s+v,0) || 1;
  const zonePie = Object.entries(zoneTotals).map(([zk, value]) => ({
    name: `Khu ${zk}`, zk, value,
    pct: +((value / zoneTotal) * 100).toFixed(1),
    color: ZONE_COLORS[zk] || '#94a3b8',
  }));

  // ── Zone table ───────────────────────────────────────────
  const zoneHouses = {};
  houses.forEach(h => {
    const z = h.zone || 'B';
    if (!zoneHouses[z]) zoneHouses[z] = { houses: [], nums: [] };
    zoneHouses[z].houses.push(h);
    zoneHouses[z].nums.push(h.house_number);
  });

  const zoneTable = Object.entries(zoneHouses).sort().map(([zone, info]) => {
    const hids   = info.houses.map(h => h.id);
    const recs   = latestRecs.filter(r => hids.includes(r.house_id));
    const agg    = aggRecords(recs) || {};
    const birds  = hids.reduce((s, hid) => s + (birdsByHouse[hid] || 0), 0);
    const nums   = info.nums.sort((a,b)=>a-b);
    // Trend: compare latest vs prev day
    const prevZ  = prevRecs.filter(r => hids.includes(r.house_id));
    const prevA  = aggRecords(prevZ) || {};
    const trend  = agg.henDay > (prevA.henDay||0) + 0.05 ? 'up'
                 : agg.henDay < (prevA.henDay||0) - 0.05 ? 'down' : 'stable';
    return {
      zone: `Khu ${zone}`, zk: zone,
      rangeFrom: nums[0], rangeTo: nums[nums.length-1],
      houses: info.houses.length,
      birds,
      henDay:  +(agg.henDay     || 0).toFixed(2),
      mort:    +(agg.mortality  || 0).toFixed(3),
      temp:    +(agg.avgTemp    || 0).toFixed(1),
      feed:    0,
      water:   +(agg.waterIntake|| 0).toFixed(1),
      trend,
    };
  });

  // ── Egg size distribution (từ trứng weight) ──────────────
  const eggWt = farm.eggWeight;
  const EGG_SIZE = [
    { size:'S (<50g)',    pct: eggWt < 52 ? 8  : 2,  color:'#64748b' },
    { size:'M (50-55g)', pct: eggWt < 55 ? 18 : 12, color:'#3b82f6' },
    { size:'L (55-60g)', pct: 28, color:'#22c55e' },
    { size:'LL (60-65g)',pct: eggWt >= 60 ? 42 : 32, color:'#f59e0b' },
    { size:'XL (65-70g)',pct: eggWt >= 63 ? 12 : 8,  color:'#ec4899' },
    { size:'>70g',       pct: eggWt >= 65 ? 4  : 2,  color:'#8b5cf6' },
  ];

  return { farm, trend7d, breedPie, zonePie, zoneTable, EGG_SIZE, latestDate };
}

// ── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, unit='', prev, prevUnit, deltaLabel, reverse=false, decimals=2, yday }) {
  const d = value - prev;
  const isGood = reverse ? d < 0 : d > 0;
  const color  = Math.abs(d) < 0.001 ? C.muted : isGood ? C.green : C.red;
  const arrow  = Math.abs(d) < 0.001 ? '→' : d > 0 ? '↑' : '↓';
  const sign   = d > 0 ? '+' : '';
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:10,
      padding:'12px 12px 10px', display:'flex', flexDirection:'column', gap:4, minWidth:0,
    }}>
      <div style={{fontSize:9.5,color:C.muted,fontWeight:600,letterSpacing:0.8,textTransform:'uppercase',lineHeight:1.2}}>
        {label}
      </div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,lineHeight:1.1}}>
        {fmtNum(value, decimals)}<span style={{fontSize:14,fontWeight:400,color:C.muted,marginLeft:2}}>{unit}</span>
      </div>
      <div style={{fontSize:10.5,color:C.muted}}>
        {yday}: <span style={{color:C.text}}>{fmtNum(prev, decimals)}{prevUnit??unit}</span>
      </div>
      <div style={{fontSize:13,fontWeight:600,color}}>
        {arrow} {sign}{fmtNum(Math.abs(d), decimals)}{deltaLabel??unit}
      </div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 12px',fontSize:12}}>
      <div style={{color:C.muted,marginBottom:4,fontWeight:600}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color,marginBottom:2}}>
          {p.name}: <b>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</b>
        </div>
      ))}
    </div>
  );
}

// ── Section title ─────────────────────────────────────────────
function SecTitle({ children }) {
  return (
    <div style={{fontSize:13,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>
      {children}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}>
      <div style={{fontSize:32,animation:'spin 1s linear infinite'}}>🐔</div>
      <div style={{fontSize:13,color:C.muted}}>Đang tải dữ liệu...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
function DashboardContent() {
  const { lang } = useFarm();
  const t = useT(lang);
  const zL = (z) => lang === 'ja' ? `${z}団地` : `Khu ${z}`;
  const hL = (n) => lang === 'ja' ? `${n}号舎` : `Nhà ${n}`;

  // ── Data state ───────────────────────────────────────────
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [dashData,  setDashData]  = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [daily, flocks, houses, feed] = await Promise.all([
        api.get('/api/daily'),
        api.get('/api/flocks'),
        api.get('/api/houses'),
        api.get('/api/feed').catch(() => []),
      ]);
      const computed = computeDashboard(
        Array.isArray(daily)  ? daily  : [],
        Array.isArray(flocks) ? flocks : [],
        Array.isArray(houses) ? houses : [],
        Array.isArray(feed)   ? feed   : [],
      );
      setDashData(computed);
      setLastFetch(new Date());
    } catch (e) {
      setError(e.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── UI state ─────────────────────────────────────────────
  const [zone,   setZone]   = useState('all');
  const [house,  setHouse]  = useState('all');
  const [breed,  setBreed]  = useState('all');
  const [period, setPeriod] = useState('7d');

  const alertsLocalized = useMemo(() => [
    { level:'danger',  icon:'🔴', msg:`${lang==='ja'?'高温警報：':'Nhiệt độ cao tại '}${hL(27)} – ${zL('D')}`,    sub:lang==='ja'?'現在温度31.2°Cが許容値を超えています。':'Nhiệt độ hiện tại 31.2°C vượt ngưỡng cho phép.', time:'08:25' },
    { level:'warning', icon:'🟡', msg:`Feed intake ${lang==='ja'?'低下：':'giảm tại '}${hL(18)} – ${zL('C')}`,      sub:lang==='ja'?'飼料摂取量が3日平均より8.5%減少。':'Feed intake giảm 8.5% so với trung bình 3 ngày.',   time:'08:20' },
    { level:'warning', icon:'🟡', msg:`Water intake ${lang==='ja'?'低下：':'giảm tại '}${hL(9)} – ${zL('B')}`,     sub:lang==='ja'?'飲水量が3日平均より6.2%減少。':'Water intake giảm 6.2% so với trung bình 3 ngày.',  time:'08:15' },
    { level:'danger',  icon:'🔴', msg:`${lang==='ja'?'死亡率上昇：':'Tỷ lệ chết tăng tại '}${hL(32)}`,             sub:lang==='ja'?'死亡率0.12%が通常水準を超えています。':'Tỷ lệ chết 0.12% cao hơn mức bình thường.',         time:'08:10' },
    { level:'info',    icon:'🔵', msg:`${lang==='ja'?'産卵率低下：':'Tỷ lệ đẻ giảm tại '}${hL(14)} – ${zL('B')}`,  sub:lang==='ja'?'産卵率が目標より2.5%低い。':'Tỷ lệ đẻ thấp hơn 2.5% so với mục tiêu.',          time:'08:05' },
  ], [lang]);

  const sel = { background:C.card, border:`1px solid ${C.border}`, color:C.text,
    padding:'6px 10px', borderRadius:7, fontSize:14, outline:'none', cursor:'pointer' };
  const btn = (active) => ({
    padding:'5px 12px', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer',
    background: active ? '#166534' : 'transparent',
    border: active ? '1px solid #22c55e' : `1px solid ${C.border}`,
    color: active ? '#4ade80' : C.muted,
    transition:'all .15s',
  });
  const greenBtn = {
    padding:'6px 14px', borderRadius:7, fontSize:14, fontWeight:600,
    background:'#166534', border:'1px solid #22c55e', color:'#4ade80', cursor:'pointer',
  };

  // ── Render states ─────────────────────────────────────────
  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}>
      <div style={{fontSize:32}}>⚠️</div>
      <div style={{color:C.red,fontSize:14}}>{error}</div>
      <button onClick={loadData} style={{...greenBtn,marginTop:8}}>Thử lại</button>
    </div>
  );
  if (!dashData) return null;

  const { farm, trend7d, breedPie, zonePie, zoneTable, EGG_SIZE, latestDate } = dashData;
  const displayDate = fmtDate(latestDate) || '—';
  const lastFetchStr = lastFetch ? lastFetch.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '—';

  // Filter zone table by selected zone
  const filteredZoneTable = zone === 'all' ? zoneTable : zoneTable.filter(z => z.zk === zone);

  return (
    <div style={{padding:'0',color:C.text}}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        background:C.card, borderBottom:`1px solid ${C.border}`,
        padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:40,
      }}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:C.text}}>{t('farm_overview')}</div>
          <div style={{fontSize:13,color:C.muted,marginTop:2}}>
            {t('last_updated')} {lastFetchStr} – {displayDate} &nbsp;
            <span style={{color:C.green,cursor:'pointer'}} onClick={loadData}>↺</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:'5px 10px',fontSize:14,color:C.muted,display:'flex',alignItems:'center',gap:6}}>
            📅 {displayDate}
          </div>
          {[[t('btn_today'),'1d'],[t('btn_7d'),'7d'],[t('btn_30d'),'30d']].map(([p,k]) => (
            <button key={k} style={btn(period===k)} onClick={()=>setPeriod(k)}>{p}</button>
          ))}
          <button style={greenBtn}>{t('export_report')}</button>
        </div>
      </div>

      <div style={{padding:'16px 24px'}}>

        {/* ── Filter bar ─────────────────────────────── */}
        <div style={{
          background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
          padding:'12px 16px',display:'flex',alignItems:'center',gap:16,marginBottom:16,
        }}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:13,color:C.muted,whiteSpace:'nowrap'}}>{t('select_zone')}</span>
            <select value={zone} onChange={e=>setZone(e.target.value)} style={sel}>
              <option value="all">{t('all_zones')}</option>
              {zonePie.map(z => (
                <option key={z.zk} value={z.zk}>{zL(z.zk)}</option>
              ))}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:13,color:C.muted,whiteSpace:'nowrap'}}>{t('select_house')}</span>
            <select value={house} onChange={e=>setHouse(e.target.value)} style={sel}>
              <option value="all">{t('all_houses')}</option>
              {Array.from({length:30},(_,i)=>i+6).map(n=>(
                <option key={n} value={n}>{hL(n)}</option>
              ))}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:13,color:C.muted,whiteSpace:'nowrap'}}>{t('select_breed')}</span>
            <select value={breed} onChange={e=>setBreed(e.target.value)} style={sel}>
              <option value="all">{t('all_breeds')}</option>
              {breedPie.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div style={{marginLeft:'auto',fontSize:13,color:C.muted}}>
            {t('total_flock')} <span style={{color:C.green,fontWeight:700,fontSize:13}}>{fmtNum(farm.totalBirds,0)}</span> {t('unit_birds')}
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(112px,1fr))',gap:8,marginBottom:16}}>
          <KpiCard yday={t('yesterday')} label={t('kpi_henDay')}    value={farm.henDay}      prev={farm.henDayPrev}      unit="%" decimals={2} />
          <KpiCard yday={t('yesterday')} label={t('kpi_eggs')}       value={farm.totalEggs}   prev={farm.totalEggsPrev}   unit="" decimals={0} />
          <KpiCard yday={t('yesterday')} label={t('kpi_mort')}          value={farm.mortality}   prev={farm.mortalityPrev}   unit="%" decimals={3} reverse={true} />
          <KpiCard yday={t('yesterday')} label={t('kpi_survival')}          value={farm.survival}    prev={farm.survivalPrev}    unit="%" decimals={2} />
          <KpiCard yday={t('yesterday')} label={t('kpi_feed')}          value={farm.feedIntake}  prev={farm.feedIntakePrev}  unit=" g" decimals={1} />
          <KpiCard yday={t('yesterday')} label={t('kpi_water')}         value={farm.waterIntake} prev={farm.waterIntakePrev} unit=" ml" decimals={1} />
          <KpiCard yday={t('yesterday')} label={t('kpi_feedWater')}           value={farm.feedWater}   prev={farm.feedWaterPrev}   unit="" decimals={3} />
          <KpiCard yday={t('yesterday')} label={t('kpi_temp')}          value={farm.avgTemp}     prev={farm.avgTempPrev}     unit="°C" decimals={1} reverse={true} />
          <KpiCard yday={t('yesterday')} label={t('kpi_eggWeight')}            value={farm.eggWeight}   prev={farm.eggWeightPrev}   unit="g" decimals={1} />
          <KpiCard yday={t('yesterday')} label={t('kpi_birds')}       value={farm.totalBirds}  prev={farm.totalBirds}      unit="" decimals={0} />
        </div>

        {/* ── Charts row 1: Trend + Pies ────────────── */}
        <div style={{display:'grid',gridTemplateColumns:'1.8fr 1fr 1fr',gap:12,marginBottom:12}}>

          {/* Trend chart */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>{t('trend_7d')}</SecTitle>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend7d} margin={{top:2,right:8,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} />
                <YAxis yAxisId="pct" domain={['auto','auto']} tick={{fill:C.muted,fontSize:10}} />
                <YAxis yAxisId="ml"  orientation="right" domain={['auto','auto']} tick={{fill:C.muted,fontSize:10}} />
                <Tooltip content={<ChartTip/>} />
                <Legend wrapperStyle={{fontSize:14,color:C.muted}} />
                <Line yAxisId="pct" type="monotone" dataKey="henDay" name={t('line_henDay')} stroke={C.green} strokeWidth={2} dot={false} connectNulls />
                <Line yAxisId="ml"  type="monotone" dataKey="water"  name={t('line_water')}  stroke={C.blue}  strokeWidth={1.5} dot={false} strokeDasharray="4 2" connectNulls />
                <Line yAxisId="ml"  type="monotone" dataKey="feed"   name={t('line_feed')}   stroke={C.amber} strokeWidth={1.5} dot={false} strokeDasharray="4 2" connectNulls />
                <Line yAxisId="pct" type="monotone" dataKey="mort"   name={t('line_mort')}   stroke={C.red}   strokeWidth={1.5} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Breed pie */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>{t('breed_pie')}</SecTitle>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={breedPie} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" nameKey="name">
                  {breedPie.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtNum(v,0)+' con'} contentStyle={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{marginTop:4}}>
              {breedPie.map(b => (
                <div key={b.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:b.color,flexShrink:0}}/>
                    <span style={{color:C.muted}}>{b.name}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zone pie */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>{t('zone_pie')}</SecTitle>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={zonePie} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" nameKey="name">
                  {zonePie.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtNum(v,0)+' con'} contentStyle={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{marginTop:4}}>
              {zonePie.map(z => (
                <div key={z.zk} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:z.color,flexShrink:0}}/>
                    <span style={{color:C.muted}}>{zL(z.zk)}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>{z.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Zone table + Alerts ───────────────────── */}
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:12,marginBottom:12}}>

          {/* Zone table */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>{t('zone_table')}</SecTitle>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {[t('th_zone'),t('th_houses'),t('th_birds'),'HD%',t('th_mort'),t('th_temp'),t('th_water'),t('th_trend')].map(h=>(
                    <th key={h} style={{padding:'5px 6px',textAlign:'left',color:C.muted,fontWeight:600,fontSize:14,whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredZoneTable.map((z,i) => (
                  <tr key={z.zone} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                    <td style={{padding:'7px 6px'}}>
                      <div style={{fontWeight:700,color:C.text}}>{zL(z.zk)}</div>
                      <div style={{fontSize:14,color:C.muted}}>{hL(z.rangeFrom)}–{hL(z.rangeTo)}</div>
                    </td>
                    <td style={{padding:'7px 6px',color:C.muted}}>{z.houses}</td>
                    <td style={{padding:'7px 6px',color:C.text,fontWeight:600}}>{fmtNum(z.birds,0)}</td>
                    <td style={{padding:'7px 6px',color:C.green,fontWeight:700}}>{z.henDay}%</td>
                    <td style={{padding:'7px 6px',color:z.mort>0.05?C.red:C.amber}}>{z.mort}%</td>
                    <td style={{padding:'7px 6px',color:z.temp>30?C.red:C.text}}>{z.temp}°C</td>
                    <td style={{padding:'7px 6px',color:C.text}}>{z.water}</td>
                    <td style={{padding:'7px 6px',fontSize:16}}>
                      {z.trend==='up'?'📈':z.trend==='down'?'📉':'➡️'}
                    </td>
                  </tr>
                ))}
                {zone === 'all' && (
                  <tr style={{borderTop:`1px solid ${C.border}`,fontWeight:700}}>
                    <td style={{padding:'7px 6px',color:C.text}}>Tổng cộng</td>
                    <td style={{padding:'7px 6px',color:C.text}}>{zoneTable.reduce((s,z)=>s+z.houses,0)}</td>
                    <td style={{padding:'7px 6px',color:C.green}}>{fmtNum(farm.totalBirds,0)}</td>
                    <td style={{padding:'7px 6px',color:C.green}}>{farm.henDay}%</td>
                    <td style={{padding:'7px 6px',color:C.amber}}>{farm.mortality}%</td>
                    <td style={{padding:'7px 6px',color:C.text}}>{farm.avgTemp}°C</td>
                    <td style={{padding:'7px 6px',color:C.text}}>{farm.waterIntake}</td>
                    <td/>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Alert center */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <SecTitle>{t('alert_title')}</SecTitle>
              <a href="/canh-bao" style={{fontSize:13,color:C.blue,textDecoration:'none'}}>{t('alert_all')}</a>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {alertsLocalized.map((a,i) => (
                <div key={i} style={{
                  background:alertBg[a.level], border:`1px solid ${alertColor[a.level]}33`,
                  borderRadius:8, padding:'8px 10px', display:'flex', gap:10, alignItems:'flex-start',
                }}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,flexShrink:0}}>
                    <span style={{fontSize:14}}>{a.icon}</span>
                    <span style={{fontSize:9,color:C.muted,whiteSpace:'nowrap'}}>{a.time}</span>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:alertColor[a.level],marginBottom:2}}>{a.msg}</div>
                    <div style={{fontSize:13,color:C.muted,lineHeight:1.4}}>{a.sub}</div>
                  </div>
                  <div style={{marginLeft:'auto',flexShrink:0}}>
                    <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:4,
                      background:`${alertColor[a.level]}22`,color:alertColor[a.level]}}>
                      {a.level==='danger'?t('badge_danger'):a.level==='warning'?t('badge_warning'):t('badge_info')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Egg quality + Size ─────────── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1.2fr',gap:12,marginBottom:8}}>

          {/* Feed efficiency — live from /api/feed */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>{t('feed_eff')}</SecTitle>
            {farm.feedIntake === 0 && farm.fcr === 0 ? (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:100,flexDirection:'column',gap:8}}>
                <div style={{fontSize:24}}>🌾</div>
                <div style={{fontSize:12,color:C.muted,textAlign:'center'}}>
                  {lang==='ja'?'消費記録がまだありません':'Chưa có bản ghi tiêu thụ cám'}
                </div>
              </div>
            ) : (
              [
                { label:'FCR',              val:farm.fcr,          prev:farm.fcrPrev,         unit:'',   rev:true,  dec:2 },
                { label:'PCR',              val:farm.pcr,          prev:farm.pcrPrev,         unit:'',   rev:true,  dec:2 },
                { label:lang==='ja'?'飼料/卵':'Feed/trứng', val:farm.feedCostEgg, prev:farm.feedCostPrev, unit:'g',  rev:true,  dec:1 },
              ].map(row => {
                const d = row.val - row.prev;
                const good = row.rev ? d < 0 : d > 0;
                const clr = Math.abs(d)<0.001?C.muted:good?C.green:C.red;
                return (
                  <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:14,color:C.muted}}>{row.label}</span>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:15,fontWeight:700,color:C.text}}>{fmtNum(row.val,row.dec)}{row.unit}</div>
                      <div style={{fontSize:14,color:clr}}>{d>0?'+':''}{fmtNum(d,row.dec)}{row.unit} {t('vs_yesterday')}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Egg quality */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>{t('egg_quality')}</SecTitle>
            {[
              { label:t('dirty_egg'),       val:farm.dirtyEgg,    prev:farm.dirtyEggPrev,    unit:'%', rev:true, std:'≤ 2.00%', dec:2 },
              { label:t('cracked_egg'),         val:farm.crackedEgg,  prev:farm.crackedEggPrev,  unit:'%', rev:true, std:'≤ 1.00%', dec:2 },
              { label:t('saleable_egg'), val:farm.saleableEgg, prev:farm.saleableEggPrev, unit:'%', rev:false,std:'≥ 95.0%', dec:2 },
            ].map(row => {
              const d = row.val - row.prev;
              const good = row.rev ? d < 0 : d > 0;
              const clr = Math.abs(d)<0.001?C.muted:good?C.green:C.red;
              return (
                <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
                  <div>
                    <div style={{fontSize:14,color:C.muted}}>{row.label}</div>
                    <div style={{fontSize:14,color:'#4a7c4a'}}>{t('std_label')} {row.std}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:15,fontWeight:700,color:C.text}}>{fmtNum(row.val,row.dec)}{row.unit}</div>
                    <div style={{fontSize:14,color:clr}}>{d>0?'+':''}{fmtNum(d,row.dec)}{row.unit}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Egg size distribution */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>{t('egg_size')}</SecTitle>
            <div style={{display:'flex',gap:12}}>
              <ResponsiveContainer width="45%" height={120}>
                <PieChart>
                  <Pie data={EGG_SIZE} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="pct" nameKey="size">
                    {EGG_SIZE.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => v+'%'} contentStyle={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{flex:1}}>
                {EGG_SIZE.map(s => (
                  <div key={s.size} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                      <span style={{fontSize:14,color:C.muted,whiteSpace:'nowrap'}}>{s.size}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:60,height:5,background:'#e2e8f0',borderRadius:3,overflow:'hidden'}}>
                        <div style={{width:`${s.pct/50*100}%`,height:'100%',background:s.color,borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:14,fontWeight:700,color:C.text,minWidth:28,textAlign:'right'}}>{s.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <FarmLayout>
      <DashboardContent />
    </FarmLayout>
  );
}
