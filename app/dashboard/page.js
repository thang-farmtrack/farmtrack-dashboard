'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { flocksApi, housesApi, dailyApi, kpiApi } from '@/lib/api';

// ══════════════════════════════════════════════════════
// BREED STANDARDS
// ══════════════════════════════════════════════════════
const BREED_STD = {
  'ボリス':   { color:'#f5a623', peakLay:0.92, peakAge:'160〜200日',
    layRate:[[120,160,0.78],[160,200,0.90],[200,280,0.92],[280,350,0.88],[350,450,0.82],[450,999,0.74]],
    egWt:[[120,160,55],[160,200,60],[200,280,63],[280,450,64],[450,999,65]],
    feed:[[120,200,100],[200,350,112],[350,999,118]], fcr:[[120,200,2.0],[200,350,2.1],[350,999,2.2]],
  },
  'マリア':   { color:'#ec4899', peakLay:0.90, peakAge:'160〜200日',
    layRate:[[120,160,0.75],[160,200,0.88],[200,280,0.90],[280,350,0.86],[350,450,0.80],[450,999,0.72]],
    egWt:[[120,160,56],[160,200,61],[200,280,64],[280,450,65],[450,999,66]],
    feed:[[120,200,102],[200,350,114],[350,999,120]], fcr:[[120,200,2.05],[200,350,2.12],[350,999,2.25]],
  },
  'ジュリアL':{ color:'#3b82f6', peakLay:0.95, peakAge:'160〜200日',
    layRate:[[120,160,0.80],[160,200,0.93],[200,280,0.95],[280,350,0.91],[350,450,0.85],[450,999,0.76]],
    egWt:[[120,160,54],[160,200,59],[200,280,62],[280,450,63],[450,999,64]],
    feed:[[120,200,98],[200,350,110],[350,999,116]], fcr:[[120,200,1.95],[200,350,2.05],[350,999,2.15]],
  },
};
function getStd(breed, field, age) {
  const std = BREED_STD[breed]; if (!std) return null;
  for (const [mn,mx,v] of std[field]) { if (age>=mn && age<mx) return v; }
  return std[field].at(-1)[2];
}

// ══════════════════════════════════════════════════════
// ZONE CONFIG
// ══════════════════════════════════════════════════════
const getZone = (houseId) => {
  const id = parseInt(houseId) || 0;
  if (id >= 6  && id <= 15) return 'B';
  if (id >= 16 && id <= 23) return 'C';
  if (id >= 24 && id <= 35) return 'D';
  return 'B';
};
const ZONE_COLORS = { B:'#3b82f6', C:'#22c55e', D:'#a855f7' };

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════
const avg = (arr) => { const a=arr.filter(v=>v!=null&&!isNaN(v)&&v>0); return a.length?a.reduce((x,y)=>x+y,0)/a.length:0; };
const sum = (arr) => arr.filter(v=>v!=null&&!isNaN(v)).reduce((a,b)=>a+b,0);
const fmt = (n, d=0) => n==null||isNaN(n)?'—':Number(n).toLocaleString('ja-JP',{maximumFractionDigits:d});
const fmtPct = (v) => v!=null ? (v*100).toFixed(1)+'%' : '—';

// ══════════════════════════════════════════════════════
// CSS (dark theme matching reference)
// ══════════════════════════════════════════════════════
const CSS = `
  .ft-shell{display:flex;min-height:100vh;background:#080c10;color:#f0f4f8;font-family:'Inter',system-ui,sans-serif;}
  .ft-sidebar{width:220px;flex-shrink:0;background:#0f1419;border-right:1px solid #243040;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;}
  .ft-sb-logo{padding:16px 14px;border-bottom:1px solid #243040;}
  .ft-sb-logo-t{font-size:18px;font-weight:700;color:#f5a623;letter-spacing:2px;}
  .ft-sb-logo-s{font-size:9px;color:#607080;letter-spacing:1px;margin-top:2px;}
  .ft-sb-sec{padding:12px 12px 10px;border-bottom:1px solid #243040;}
  .ft-sb-sec-t{font-size:9px;color:#607080;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
  .ft-date-label{font-size:10px;color:#b0bec5;margin-bottom:3px;}
  .ft-date-input{width:100%;background:#161d26;border:1px solid #2d3d50;color:#f0f4f8;padding:5px 8px;border-radius:6px;font-size:11px;outline:none;}
  .ft-date-input:focus{border-color:#f5a623;}
  .ft-presets{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;}
  .ft-pre{padding:3px 7px;border-radius:4px;font-size:9px;cursor:pointer;border:1px solid #2d3d50;color:#607080;background:transparent;transition:all .15s;}
  .ft-pre:hover,.ft-pre.active{border-color:#f5a623;color:#f5a623;background:rgba(245,166,35,.1);}
  .ft-breed-btn{display:flex;align-items:center;gap:7px;width:100%;padding:7px 10px;border-radius:7px;font-size:11px;cursor:pointer;border:1px solid #2d3d50;color:#b0bec5;background:#161d26;margin-bottom:4px;transition:all .2s;}
  .ft-breed-btn:hover{border-color:#f5a623;}
  .ft-breed-btn.active{border-color:var(--bc);color:var(--bc);background:rgba(0,0,0,.2);}
  .ft-breed-dot{width:7px;height:7px;border-radius:50%;}
  .ft-zone-btn{display:flex;justify-content:space-between;align-items:center;width:100%;padding:7px 10px;border-radius:6px;font-size:11px;cursor:pointer;border:1px solid #2d3d50;color:#b0bec5;background:#161d26;margin-bottom:3px;transition:all .2s;}
  .ft-zone-btn:hover,.ft-zone-btn.active{border-color:#f5a623;color:#f5a623;background:rgba(245,166,35,.08);}
  .ft-house-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;max-height:160px;overflow-y:auto;}
  .ft-hbtn{padding:3px 2px;border-radius:4px;font-size:9px;cursor:pointer;border:1px solid #243040;color:#607080;background:#161d26;transition:all .15s;text-align:center;}
  .ft-hbtn.sel-B{border-color:#3b82f6;color:#3b82f6;background:rgba(59,130,246,.15);}
  .ft-hbtn.sel-C{border-color:#22c55e;color:#22c55e;background:rgba(34,197,94,.15);}
  .ft-hbtn.sel-D{border-color:#a855f7;color:#a855f7;background:rgba(168,85,247,.15);}
  .ft-hact{padding:3px 7px;border-radius:4px;font-size:9px;cursor:pointer;border:1px solid #2d3d50;color:#607080;background:transparent;margin-right:4px;margin-bottom:4px;}
  .ft-hact:hover{border-color:#f5a623;color:#f5a623;}
  .ft-sb-footer{padding:12px 12px;margin-top:auto;border-top:1px solid #243040;}
  .ft-user-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
  .ft-avatar{width:30px;height:30px;border-radius:50%;background:#1e2836;border:1.5px solid #2d3d50;display:flex;align-items:center;justify-content:center;color:#f5a623;font-size:11px;font-weight:700;}
  .ft-uname{font-size:11px;font-weight:500;color:#f0f4f8;}
  .ft-urole{font-size:9px;color:#607080;}
  .ft-logout{width:100%;padding:7px;background:transparent;border:1px solid #2d3d50;color:#607080;border-radius:6px;font-size:11px;cursor:pointer;transition:all .2s;}
  .ft-logout:hover{border-color:#ef4444;color:#ef4444;}
  .ft-main{flex:1;padding:20px;overflow-x:hidden;min-width:0;}
  .ft-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;}
  .ft-title{font-size:24px;font-weight:700;color:#f5a623;letter-spacing:2px;}
  .ft-badges{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}
  .ft-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:10px;}
  .ft-badge.a{color:#f5a623;background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.25);}
  .ft-badge.g{color:#22c55e;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);}
  .ft-badge.b{color:#3b82f6;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);}
  .ft-pdf-btn{background:#f5a623;color:#000;border:none;padding:6px 14px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:1px;}
  .ft-sec{font-size:9px;letter-spacing:3px;color:#607080;text-transform:uppercase;margin:16px 0 10px;display:flex;align-items:center;gap:10px;}
  .ft-sec::after{content:'';flex:1;height:1px;background:#243040;}
  .ft-kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px;margin-bottom:4px;}
  .ft-kcard{background:#0f1419;border:1px solid #243040;border-radius:10px;padding:13px;position:relative;overflow:hidden;transition:all .2s;}
  .ft-kcard:hover{border-color:var(--kc,#f5a623);transform:translateY(-1px);}
  .ft-kcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--kc,#f5a623);}
  .ft-klbl{font-size:9px;color:#607080;margin-bottom:5px;}
  .ft-kval{font-size:26px;font-weight:700;line-height:1;color:#f0f4f8;}
  .ft-kunit{font-size:11px;color:#607080;margin-left:1px;}
  .ft-ksub{margin-top:4px;font-size:9px;}
  .ft-ksub.g{color:#22c55e}.ft-ksub.r{color:#ef4444}.ft-ksub.n{color:#607080}.ft-ksub.b{color:#3b82f6}.ft-ksub.y{color:#eab308}
  .ft-kico{position:absolute;top:10px;right:10px;font-size:20px;opacity:.15;}
  .ft-cgrid2{display:grid;grid-template-columns:1.5fr 1fr;gap:10px;margin-bottom:10px;}
  .ft-cgrid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px;}
  .ft-cgrid2b{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
  .ft-ccard{background:#0f1419;border:1px solid #243040;border-radius:10px;padding:14px;}
  .ft-ctitle{font-size:10px;color:#607080;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;font-weight:500;}
  .ft-ctitle span{color:#f5a623;font-size:10px;}
  .ft-breed3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px;}
  .ft-bc{background:#0f1419;border:1px solid #243040;border-radius:10px;padding:14px;position:relative;overflow:hidden;}
  .ft-bc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--bcc,#f5a623);}
  .ft-bc-name{font-size:20px;font-weight:700;letter-spacing:1px;margin-bottom:3px;}
  .ft-bc-count{font-size:9px;color:#607080;margin-bottom:10px;}
  .ft-bc-row{display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border-radius:5px;margin-bottom:3px;background:#161d26;}
  .ft-bc-lbl{font-size:10px;color:#b0bec5;}
  .ft-bc-v{font-size:11px;font-weight:700;}
  .ft-bc-std{font-size:9px;color:#607080;}
  .ft-rank-row{display:flex;align-items:center;gap:6px;margin-bottom:5px;}
  .ft-rank-bar-wrap{flex:1;position:relative;height:18px;background:#1e2836;border-radius:4px;overflow:visible;}
  .ft-rank-bar-fill{height:100%;border-radius:4px;display:flex;align-items:center;padding-left:6px;font-size:9px;color:rgba(255,255,255,.85);transition:width .6s;}
  .ft-rank-std{position:absolute;top:-2px;width:2px;height:22px;border-radius:1px;opacity:.7;}
  .ft-tbl-wrap{overflow-x:auto;}
  .ft-table{width:100%;border-collapse:collapse;font-size:11px;}
  .ft-table th{color:#607080;font-weight:500;padding:8px 8px;border-bottom:1px solid #243040;font-size:9px;text-align:center;white-space:nowrap;letter-spacing:.5px;}
  .ft-table td{padding:7px 8px;border-bottom:1px solid rgba(36,48,64,.5);color:#f0f4f8;text-align:center;}
  .ft-table tr:hover td{background:#161d26;}
  .ft-pill{display:inline-block;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;}
  .ft-pill.g{background:rgba(34,197,94,.15);color:#22c55e;}
  .ft-pill.w{background:rgba(234,179,8,.15);color:#eab308;}
  .ft-pill.r{background:rgba(239,68,68,.15);color:#ef4444;}
  .ft-pill.b{background:rgba(59,130,246,.15);color:#3b82f6;}
  .ft-khu{padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700;}
  .ft-nodata{text-align:center;padding:40px;color:#607080;font-size:13px;}
  .ft-loading{display:flex;align-items:center;justify-content:center;height:200px;flex-direction:column;gap:12px;}
  .ft-spin{width:36px;height:36px;border:3px solid #243040;border-top-color:#f5a623;border-radius:50%;animation:spin .8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .ft-prog-wrap{margin-bottom:8px;}
  .ft-prog-hdr{display:flex;justify-content:space-between;font-size:9px;color:#607080;margin-bottom:3px;}
  .ft-prog-track{height:6px;background:#1e2836;border-radius:3px;position:relative;}
  .ft-prog-fill{height:100%;border-radius:3px;transition:width .8s;}
  .ft-prog-marker{position:absolute;top:-3px;width:2px;height:12px;background:#607080;border-radius:1px;}
  @media(max-width:900px){.ft-cgrid2,.ft-cgrid3,.ft-cgrid2b,.ft-breed3{grid-template-columns:1fr!important;}}
`;

// ══════════════════════════════════════════════════════
// CUSTOM TOOLTIP
// ══════════════════════════════════════════════════════
const DarkTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#161d26',border:'1px solid #2d3d50',borderRadius:6,padding:'8px 10px',fontSize:10}}>
      <p style={{color:'#607080',marginBottom:4}}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color||'#f5a623'}}>
          {p.name}: <strong>{formatter ? formatter(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [lang, setLang]       = useState('ja');
  const [ready, setReady]     = useState(false);

  // Raw data
  const [flocks,  setFlocks]  = useState([]);
  const [houses,  setHouses]  = useState([]);
  const [daily,   setDaily]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [preset,   setPreset]   = useState('all');
  const [filterBreed, setFilterBreed] = useState('all');
  const [filterZone,  setFilterZone]  = useState('all');
  const [selHouses,   setSelHouses]   = useState(new Set());

  // ── Auth + load ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    setUser(getUser());
    const sl = localStorage.getItem('farmtrack_lang') || 'ja';
    setLang(sl);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      setLoading(true);
      try {
        const [f, h, d] = await Promise.allSettled([flocksApi.getAll(), housesApi.getAll(), dailyApi.getAll()]);
        const fl = f.status==='fulfilled' ? f.value : [];
        const hl = h.status==='fulfilled' ? h.value : [];
        const dl = d.status==='fulfilled' ? d.value : [];
        setFlocks(fl); setHouses(hl); setDaily(dl);
        // init date range
        const dates = dl.map(r => r.record_date).filter(Boolean).sort();
        if (dates.length) { setDateFrom(dates[0]); setDateTo(dates[dates.length-1]); }
        // init house selection: all active flock house_ids
        setSelHouses(new Set(fl.map(f => String(f.house_id || f.houseId))));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [ready]);

  function applyPreset(p) {
    setPreset(p);
    const dates = daily.map(r => r.record_date).filter(Boolean).sort();
    if (!dates.length) return;
    const last = dates[dates.length-1];
    if (p === 'all') { setDateFrom(dates[0]); setDateTo(last); return; }
    const d = new Date(last); d.setDate(d.getDate() - parseInt(p));
    setDateFrom(d.toISOString().slice(0,10)); setDateTo(last);
  }

  function toggleHouse(hid) {
    setSelHouses(prev => {
      const next = new Set(prev);
      next.has(hid) ? next.delete(hid) : next.add(hid);
      return next;
    });
  }

  // ── Build house→flock map ──────────────────────────
  const flockByHouse = useMemo(() => {
    const m = {};
    flocks.forEach(f => { m[String(f.house_id||f.houseId)] = f; });
    return m;
  }, [flocks]);

  // ── Filtered rows ──────────────────────────────────
  const filteredRows = useMemo(() => {
    return daily.filter(r => {
      const hid = String(r.house_id || r.houseId || '');
      const flock = flockByHouse[hid];
      const breed = flock?.breed || '';
      const zone  = getZone(hid);
      if (!selHouses.has(hid)) return false;
      if (filterBreed !== 'all' && breed !== filterBreed) return false;
      if (filterZone  !== 'all' && zone  !== filterZone)  return false;
      if (dateFrom && r.record_date < dateFrom) return false;
      if (dateTo   && r.record_date > dateTo)   return false;
      return true;
    });
  }, [daily, flockByHouse, selHouses, filterBreed, filterZone, dateFrom, dateTo]);

  // ── House summaries ────────────────────────────────
  const houseSummaries = useMemo(() => {
    const byHouse = {};
    filteredRows.forEach(r => {
      const hid = String(r.house_id || r.houseId || '');
      if (!byHouse[hid]) byHouse[hid] = [];
      byHouse[hid].push(r);
    });
    return Object.entries(byHouse).map(([hid, rows]) => {
      const flock = flockByHouse[hid] || {};
      return { hid, zone: getZone(hid), breed: flock.breed||'', rows, flock };
    }).sort((a,b) => a.hid.localeCompare(b.hid, undefined, {numeric:true}));
  }, [filteredRows, flockByHouse]);

  // ── KPI computations ──────────────────────────────
  const kpi = useMemo(() => {
    const r = filteredRows;
    if (!r.length) return null;
    const totalEggs  = sum(r.map(x => x.total_eggs||0));
    const totalDead  = sum(r.map(x => x.dead_count||0));
    const totalWater = sum(r.map(x => x.water_consumed_liter||0));
    const avgLay     = avg(r.map(x => x.lay_rate || (x.total_eggs&&x.hens ? x.total_eggs/x.hens : null)));
    const avgFCR     = avg(r.filter(x=>x.fcr>0).map(x=>x.fcr));
    const avgEgWt    = avg(r.filter(x=>x.total_egg_weight_kg>0).map(x=>x.total_egg_weight_kg*1000/(x.total_eggs||1)));
    const avgFeed    = avg(r.filter(x=>x.feed_per_bird_g>0).map(x=>x.feed_per_bird_g));
    const avgLight   = avg(r.filter(x=>x.light_hours>0).map(x=>x.light_hours));
    const dirtyR     = totalEggs>0 ? sum(r.map(x=>x.dirty_eggs||0))/totalEggs : 0;
    const brokenR    = totalEggs>0 ? sum(r.map(x=>x.broken_eggs||0))/totalEggs : 0;
    const days       = new Set(r.map(x=>x.record_date).filter(Boolean)).size || 1;
    // last day hen count
    const lastDate   = r.map(x=>x.record_date).filter(Boolean).sort().pop();
    const lastRows   = r.filter(x=>x.record_date===lastDate);
    const curHens    = sum(lastRows.map(x=>x.hens||x.hen_count||0));
    const avgHens    = avg(r.filter(x=>(x.hens||x.hen_count)>0).map(x=>x.hens||x.hen_count||0));
    const avgWR      = totalWater&&avgFeed ? (totalWater*1000/days)/(avgFeed*avgHens||1) : avg(r.filter(x=>x.water_feed_ratio>0).map(x=>x.water_feed_ratio));
    return { totalEggs, totalDead, totalWater, avgLay, avgFCR, avgEgWt, avgFeed, avgLight,
             dirtyR, brokenR, days, curHens, avgHens, avgWR,
             deadRate: avgHens>0?totalDead/(avgHens*days):0 };
  }, [filteredRows]);

  // ── Time-series chart data ─────────────────────────
  const chartData = useMemo(() => {
    const byDate = {};
    filteredRows.forEach(r => {
      const d = r.record_date; if (!d) return;
      if (!byDate[d]) byDate[d] = { date: d.slice(5), eggs:[], dead:[], feed:[], water:[], fcr:[], egWt:[], light:[], hens:[] };
      const e = byDate[d];
      if (r.total_eggs)       e.eggs.push(r.total_eggs);
      if (r.dead_count)       e.dead.push(r.dead_count);
      if (r.feed_per_bird_g)  e.feed.push(r.feed_per_bird_g);
      if (r.water_consumed_liter) e.water.push(r.water_consumed_liter);
      if (r.fcr>0)            e.fcr.push(r.fcr);
      if (r.light_hours>0)    e.light.push(r.light_hours);
      const ew = r.total_eggs&&r.total_egg_weight_kg ? r.total_egg_weight_kg*1000/r.total_eggs : 0;
      if (ew>0) e.egWt.push(ew);
      if (r.hens||r.hen_count) e.hens.push(r.hens||r.hen_count||0);
    });
    return Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).map(([,e])=>({
      date:  e.date,
      eggs:  e.eggs.reduce((a,b)=>a+b,0),
      dead:  e.dead.reduce((a,b)=>a+b,0),
      feed:  avg(e.feed)||null,
      water: e.water.reduce((a,b)=>a+b,0)||null,
      fcr:   avg(e.fcr)||null,
      egWt:  avg(e.egWt)||null,
      light: avg(e.light)||null,
      hens:  e.hens.reduce((a,b)=>a+b,0)||null,
      layR:  e.eggs.length&&e.hens.length ? (e.eggs.reduce((a,b)=>a+b,0)/e.hens.reduce((a,b)=>a+b,0))*100 : null,
    }));
  }, [filteredRows]);

  // ── Toggle lang ───────────────────────────────────
  function toggleLang() {
    const nl = lang==='vi'?'ja':'vi';
    setLang(nl); localStorage.setItem('farmtrack_lang', nl);
  }

  function logout() { clearAuth(); router.replace('/login'); }

  // ── House grid ────────────────────────────────────
  const allHouseIds = useMemo(() => {
    const ids = new Set(flocks.map(f => String(f.house_id||f.houseId)));
    return [...ids].sort((a,b) => parseInt(a)-parseInt(b));
  }, [flocks]);

  if (!ready) return <div style={{background:'#080c10',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'#f5a623',fontSize:18}}>⟳ Loading…</div></div>;

  return (
    <>
      <style>{CSS}</style>
      <div className="ft-shell">
        {/* ── SIDEBAR ── */}
        <aside className="ft-sidebar">
          <div className="ft-sb-logo">
            <div className="ft-sb-logo-t">🐔 FARMTRACK</div>
            <div className="ft-sb-logo-s">採卵鶏 分析システム</div>
          </div>

          {/* DATE */}
          <div className="ft-sb-sec">
            <div className="ft-sb-sec-t">📅 期間選択</div>
            <div style={{marginBottom:6}}>
              <div className="ft-date-label">開始日</div>
              <input type="date" className="ft-date-input" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPreset('');}} />
            </div>
            <div style={{marginBottom:6}}>
              <div className="ft-date-label">終了日</div>
              <input type="date" className="ft-date-input" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPreset('');}} />
            </div>
            <div className="ft-presets">
              {[['all','全期間'],['7','7日'],['14','14日'],['30','30日']].map(([p,l])=>(
                <button key={p} className={`ft-pre${preset===p?' active':''}`} onClick={()=>applyPreset(p)}>{l}</button>
              ))}
            </div>
          </div>

          {/* BREED */}
          <div className="ft-sb-sec">
            <div className="ft-sb-sec-t">🐔 品種選択</div>
            {[['all','全品種','#22c55e'],['ボリス','ボリス','#f5a623'],['マリア','マリア','#ec4899'],['ジュリアL','ジュリアL','#3b82f6']].map(([v,l,c])=>(
              <button key={v} className={`ft-breed-btn${filterBreed===v?' active':''}`}
                style={filterBreed===v?{'--bc':c}:{}} onClick={()=>setFilterBreed(v)}>
                <div className="ft-breed-dot" style={{background:c}}></div>{l}
              </button>
            ))}
          </div>

          {/* ZONE */}
          <div className="ft-sb-sec">
            <div className="ft-sb-sec-t">📍 区選択</div>
            {[['all','全区','B+C+D'],['B','B区','鶏舎6〜15'],['C','C区','鶏舎16〜23'],['D','D区','鶏舎24〜35']].map(([v,l,s])=>(
              <button key={v} className={`ft-zone-btn${filterZone===v?' active':''}`} onClick={()=>setFilterZone(v)}>
                <span>{l}</span><span style={{fontSize:9,color:v==='all'?'#607080':ZONE_COLORS[v]}}>{s}</span>
              </button>
            ))}
          </div>

          {/* HOUSE GRID */}
          <div className="ft-sb-sec">
            <div className="ft-sb-sec-t">🏠 鶏舎選択</div>
            <div style={{marginBottom:6}}>
              <button className="ft-hact" onClick={()=>setSelHouses(new Set(allHouseIds))}>全選択</button>
              <button className="ft-hact" onClick={()=>setSelHouses(new Set())}>全解除</button>
            </div>
            <div className="ft-house-grid">
              {allHouseIds.map(hid => {
                const zone = getZone(hid);
                const sel  = selHouses.has(hid);
                return (
                  <div key={hid} className={`ft-hbtn${sel?' sel-'+zone:''}`} onClick={()=>toggleHouse(hid)}>
                    {hid}
                  </div>
                );
              })}
            </div>
          </div>

          {/* USER */}
          <div className="ft-sb-footer">
            <div className="ft-user-row">
              <div className="ft-avatar">{user?.name?.[0]?.toUpperCase()||'U'}</div>
              <div><div className="ft-uname">{user?.name}</div>
                <div className="ft-urole">{user?.is_admin?'管理者':'作業員'}</div>
              </div>
            </div>
            <button className="ft-logout" onClick={logout}>← ログアウト</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="ft-main">
          {/* TOP BAR */}
          <div className="ft-topbar">
            <div className="ft-title">採卵鶏農場ダッシュボード</div>
            <div className="ft-badges">
              <div className="ft-badge a">{dateFrom?.slice(5)?.replace('-','/')}〜{dateTo?.slice(5)?.replace('-','/')}</div>
              <div className="ft-badge g">● {houseSummaries.length}鶏舎選択中</div>
              <div className="ft-badge b">{filteredRows.length}件データ</div>
              <button className="ft-pdf-btn" onClick={()=>window.print()}>⬇ PDF</button>
              <button style={{background:'transparent',border:'1px solid #2d3d50',color:'#607080',padding:'6px 10px',borderRadius:6,fontSize:10,cursor:'pointer'}}
                onClick={toggleLang}>{lang==='ja'?'🇻🇳 VI':'🇯🇵 JP'}</button>
            </div>
          </div>

          {loading ? (
            <div className="ft-loading">
              <div className="ft-spin"></div>
              <div style={{color:'#607080',fontSize:13}}>データ読み込み中...</div>
            </div>
          ) : !kpi ? (
            <div className="ft-nodata">選択条件に一致するデータがありません</div>
          ) : (<>
            {/* ── KPI ── */}
            <div className="ft-sec">主要KPI — 選択期間・鶏舎の集計値</div>
            <div className="ft-kgrid">
              {[
                {l:'現在の生存羽数',v:fmt(kpi.curHens),u:'羽',i:'🐔',c:'#22c55e',s:<span className="ft-ksub n">期間平均 {fmt(kpi.avgHens,0)} 羽</span>},
                {l:'期間内 死亡数', v:fmt(kpi.totalDead),u:'羽',i:'💀',c:'#ef4444',s:<span className={`ft-ksub ${kpi.deadRate<=0.005?'g':'r'}`}>{(kpi.deadRate*100).toFixed(3)}%/日</span>},
                {l:'総産卵数',      v:fmt(kpi.totalEggs),u:'個',i:'🥚',c:'#f5a623',s:<span className="ft-ksub n">日平均 {fmt(kpi.totalEggs/kpi.days,0)} 個</span>},
                {l:'産卵率 平均',   v:kpi.avgLay?(kpi.avgLay*100).toFixed(1):'—',u:'%',i:'📈',c:kpi.avgLay>=0.85?'#22c55e':'#eab308',s:<span className={`ft-ksub ${kpi.avgLay>=0.85?'g':'y'}`}>{kpi.avgLay>=0.85?'✓ 85%以上':'⚠ 要改善'}</span>},
                {l:'FCR 平均',      v:kpi.avgFCR>0?kpi.avgFCR.toFixed(3):'—',u:'',i:'🌾',c:kpi.avgFCR>0&&kpi.avgFCR<=2.1?'#22c55e':'#ef4444',s:<span className={`ft-ksub ${kpi.avgFCR<=2.1?'g':'r'}`}>{kpi.avgFCR<=2.1?'✓ ≤2.10':'⚠ 超過'}</span>},
                {l:'卵重 平均',     v:kpi.avgEgWt>0?kpi.avgEgWt.toFixed(1):'—',u:'g',i:'⚖',c:'#a855f7',s:<span className="ft-ksub n">品種標準と比較↓</span>},
                {l:'飼料摂取量 平均',v:kpi.avgFeed>0?kpi.avgFeed.toFixed(1):'—',u:'g/羽',i:'🌾',c:'#06b6d4',s:<span className="ft-ksub n">日次平均</span>},
                {l:'飲水量 合計',   v:fmt(kpi.totalWater,0),u:'L',i:'💧',c:'#3b82f6',s:<span className="ft-ksub n">日平均 {fmt(kpi.totalWater/kpi.days,1)} L</span>},
                {l:'水/飼料比 平均',v:kpi.avgWR>0?kpi.avgWR.toFixed(2):'—',u:'倍',i:'💧',c:kpi.avgWR>=1.8&&kpi.avgWR<=2.2?'#3b82f6':'#eab308',s:<span className={`ft-ksub ${kpi.avgWR>=1.8&&kpi.avgWR<=2.2?'b':'y'}`}>{kpi.avgWR>=1.8&&kpi.avgWR<=2.2?'✓ 基準内':'⚠ 確認要'}</span>},
                {l:'照明時間 平均', v:kpi.avgLight>0?kpi.avgLight.toFixed(1):'—',u:'時間',i:'💡',c:kpi.avgLight>=14?'#22c55e':'#eab308',s:<span className={`ft-ksub ${kpi.avgLight>=14?'g':'y'}`}>{kpi.avgLight>=14?'✓ 適正':'⚠ 確認要'}</span>},
                {l:'汚染卵率',      v:(kpi.dirtyR*100).toFixed(1),u:'%',i:'🟤',c:kpi.dirtyR<=0.03?'#22c55e':'#eab308',s:<span className="ft-ksub n">破損: {(kpi.brokenR*100).toFixed(1)}%</span>},
                {l:'分析期間',      v:kpi.days,u:'日',i:'📅',c:'#607080',s:<span className="ft-ksub n">{houseSummaries.length} 鶏舎</span>},
              ].map((c,i)=>(
                <div key={i} className="ft-kcard" style={{'--kc':c.c}}>
                  <div className="ft-klbl">{c.l}</div>
                  <div className="ft-kval">{c.v}<span className="ft-kunit">{c.u}</span></div>
                  {c.s}
                  <div className="ft-kico">{c.i}</div>
                </div>
              ))}
            </div>

            {/* ── 産卵率 & 生存羽数 ── */}
            <div className="ft-sec">産卵率・生存羽数の推移（日次）</div>
            <div className="ft-cgrid2">
              <div className="ft-ccard">
                <div className="ft-ctitle">産卵率 推移 (%)<span>平均 {kpi.avgLay?(kpi.avgLay*100).toFixed(1):'—'}%</span></div>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false} domain={['auto','auto']}/>
                    <Tooltip content={<DarkTooltip formatter={v=>`${(v||0).toFixed(1)}%`}/>}/>
                    <ReferenceLine y={85} stroke="#f5a623" strokeDasharray="4 3" strokeWidth={1} opacity={.6}/>
                    <Line type="monotone" dataKey="layR" stroke="#f5a623" strokeWidth={2} dot={false} name="産卵率"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="ft-ccard">
                <div className="ft-ctitle">生存羽数 推移 (羽)<span>累計</span></div>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false} domain={['auto','auto']}/>
                    <Tooltip content={<DarkTooltip formatter={v=>fmt(v,0)+'羽'}/>}/>
                    <Line type="monotone" dataKey="hens" stroke="#22c55e" strokeWidth={2} dot={false} name="生存羽数"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── 卵重 & FCR ── */}
            <div className="ft-sec">卵重・FCR — 日次推移</div>
            <div className="ft-cgrid2">
              <div className="ft-ccard">
                <div className="ft-ctitle">卵重 推移 (g/個)<span>平均 {kpi.avgEgWt>0?kpi.avgEgWt.toFixed(1):'—'}g</span></div>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false} domain={['auto','auto']}/>
                    <Tooltip content={<DarkTooltip formatter={v=>`${(v||0).toFixed(1)}g`}/>}/>
                    <Line type="monotone" dataKey="egWt" stroke="#a855f7" strokeWidth={2} dot={false} name="卵重"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="ft-ccard">
                <div className="ft-ctitle">FCR 推移<span>平均 {kpi.avgFCR>0?kpi.avgFCR.toFixed(3):'—'}</span></div>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false} domain={['auto','auto']}/>
                    <Tooltip content={<DarkTooltip formatter={v=>`${(v||0).toFixed(3)}`}/>}/>
                    <ReferenceLine y={2.1} stroke="#607080" strokeDasharray="4 3" strokeWidth={1}/>
                    <Line type="monotone" dataKey="fcr" stroke="#a855f7" strokeWidth={2} dot={false} name="FCR"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── 飼料・飲水 ── */}
            <div className="ft-sec">飼料・飲水 — 消費量と比率</div>
            <div className="ft-cgrid3">
              <div className="ft-ccard">
                <div className="ft-ctitle">飼料摂取量 (g/羽/日)<span>平均 {kpi.avgFeed>0?kpi.avgFeed.toFixed(1):'—'}g</span></div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false} domain={['auto','auto']}/>
                    <Tooltip content={<DarkTooltip formatter={v=>`${(v||0).toFixed(1)}g`}/>}/>
                    <Line type="monotone" dataKey="feed" stroke="#06b6d4" strokeWidth={2} dot={false} name="飼料"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="ft-ccard">
                <div className="ft-ctitle">飲水量 (L/日)<span>合計 {fmt(kpi.totalWater,0)}L</span></div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false} domain={['auto','auto']}/>
                    <Tooltip content={<DarkTooltip formatter={v=>fmt(v,1)+'L'}/>}/>
                    <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} dot={false} name="飲水"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="ft-ccard">
                <div className="ft-ctitle">死亡数 (羽/日)<span>累計 {fmt(kpi.totalDead)}羽</span></div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <Tooltip content={<DarkTooltip formatter={v=>fmt(v,0)+'羽'}/>}/>
                    <Bar dataKey="dead" fill="#ef4444" radius={[2,2,0,0]} name="死亡数"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── 照明 & 産卵数 ── */}
            <div className="ft-sec">照明時間・総産卵数 — 日次</div>
            <div className="ft-cgrid2b">
              <div className="ft-ccard">
                <div className="ft-ctitle">照明時間 (時間/日)<span>平均 {kpi.avgLight>0?kpi.avgLight.toFixed(1):'—'}h</span></div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false} domain={[10,18]}/>
                    <Tooltip content={<DarkTooltip formatter={v=>`${(v||0).toFixed(1)}h`}/>}/>
                    <ReferenceLine y={14} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1} opacity={.6}/>
                    <Line type="monotone" dataKey="light" stroke="#eab308" strokeWidth={2} dot={false} name="照明"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="ft-ccard">
                <div className="ft-ctitle">産卵数 推移 (個/日)<span>合計 {fmt(kpi.totalEggs)}</span></div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2836"/>
                    <XAxis dataKey="date" tick={{fontSize:8,fill:'#607080'}} tickLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'#607080'}} tickLine={false} domain={['auto','auto']}/>
                    <Tooltip content={<DarkTooltip formatter={v=>fmt(v,0)+'個'}/>}/>
                    <Line type="monotone" dataKey="eggs" stroke="#f5a623" strokeWidth={2} dot={false} name="産卵数"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── BREED COMPARE ── */}
            <div className="ft-sec">品種別成績比較 — ボリス / マリア / ジュリアL × 品種標準値</div>
            <div className="ft-breed3">
              {['ボリス','マリア','ジュリアL'].map(br => {
                const std = BREED_STD[br];
                const brows = filteredRows.filter(r => {
                  const flock = flockByHouse[String(r.house_id||r.houseId||'')];
                  return flock?.breed === br;
                });
                if (!brows.length) return (
                  <div key={br} className="ft-bc" style={{'--bcc':std.color,opacity:.35}}>
                    <div className="ft-bc-name" style={{color:std.color}}>{br}</div>
                    <div className="ft-bc-count">データなし</div>
                  </div>
                );
                const al  = avg(brows.map(r => r.lay_rate || (r.total_eggs&&(r.hens||r.hen_count)?r.total_eggs/(r.hens||r.hen_count):null)));
                const af  = avg(brows.filter(r=>r.fcr>0).map(r=>r.fcr));
                const aw  = avg(brows.filter(r=>r.water_feed_ratio>0).map(r=>r.water_feed_ratio));
                const ew  = avg(brows.filter(r=>r.total_egg_weight_kg>0&&r.total_eggs>0).map(r=>r.total_egg_weight_kg*1000/r.total_eggs));
                const nHouses = new Set(brows.map(r=>String(r.house_id||r.houseId))).size;
                const stdLay = getStd(br,'layRate',200)||0;
                const stdEw  = getStd(br,'egWt',200)||0;
                const stdFCR = getStd(br,'fcr',200)||0;
                const mkRow = (lbl, val, stdVal, fmtA, fmtS, good) => {
                  if (!val) return null;
                  const col = good ? '#22c55e' : '#eab308';
                  return (
                    <div className="ft-bc-row" key={lbl}>
                      <span className="ft-bc-lbl">{lbl}</span>
                      <span><span className="ft-bc-v" style={{color:col}}>{fmtA}</span>
                      {stdVal ? <span className="ft-bc-std"> / 標{fmtS}</span> : null}</span>
                    </div>
                  );
                };
                return (
                  <div key={br} className="ft-bc" style={{'--bcc':std.color}}>
                    <div className="ft-bc-name" style={{color:std.color}}>{br}</div>
                    <div className="ft-bc-count">{nHouses}鶏舎 | ピーク産卵率 {(std.peakLay*100).toFixed(0)}%（{std.peakAge}）</div>
                    {mkRow('産卵率', al, stdLay, (al*100).toFixed(1)+'%', (stdLay*100).toFixed(0)+'%', al>=stdLay*0.98)}
                    {mkRow('卵重',   ew, stdEw,  ew.toFixed(1)+'g', stdEw+'g', ew>=stdEw*0.97)}
                    {mkRow('FCR',    af, stdFCR, af.toFixed(3), stdFCR, af<=stdFCR*1.03)}
                    {mkRow('水/飼料', aw, null, aw>0?aw.toFixed(2)+'×':'—', null, aw>=1.8&&aw<=2.2)}
                  </div>
                );
              })}
            </div>

            {/* ── HOUSE RANK ── */}
            <div className="ft-sec">産卵率 鶏舎別ランキング（期間平均）vs 標準値</div>
            <div className="ft-ccard">
              <div className="ft-ctitle">鶏舎ランキング <span>{houseSummaries.length}鶏舎</span></div>
              {(() => {
                const sorted = [...houseSummaries].sort((a,b) => {
                  const al = avg(a.rows.map(r=>r.lay_rate||(r.total_eggs&&(r.hens||r.hen_count)?r.total_eggs/(r.hens||r.hen_count):null)));
                  const bl = avg(b.rows.map(r=>r.lay_rate||(r.total_eggs&&(r.hens||r.hen_count)?r.total_eggs/(r.hens||r.hen_count):null)));
                  return bl-al;
                });
                const maxLay = (() => {
                  if (!sorted.length) return 1;
                  return avg(sorted[0].rows.map(r=>r.lay_rate||(r.total_eggs&&(r.hens||r.hen_count)?r.total_eggs/(r.hens||r.hen_count):null))) || 1;
                })();
                return sorted.map((s, i) => {
                  const al = avg(s.rows.map(r=>r.lay_rate||(r.total_eggs&&(r.hens||r.hen_count)?r.total_eggs/(r.hens||r.hen_count):null)));
                  const stdLay = BREED_STD[s.breed] ? getStd(s.breed,'layRate',200) : null;
                  const pct = Math.min(al/(maxLay||1)*100, 100);
                  const stdPct = stdLay ? Math.min(stdLay/(maxLay||1)*100, 100) : null;
                  const col = al>=0.9?'#22c55e':al>=0.8?'#f5a623':'#ef4444';
                  const bCol = BREED_STD[s.breed]?.color||ZONE_COLORS[s.zone]||'#607080';
                  return (
                    <div key={s.hid} className="ft-rank-row">
                      <div style={{fontSize:9,color:'#607080',width:14,textAlign:'right'}}>{i+1}</div>
                      <div style={{fontSize:9,color:ZONE_COLORS[s.zone]||'#607080',width:28,fontWeight:700}}>{s.zone}{s.hid}</div>
                      <div style={{fontSize:9,color:bCol,width:56}}>{s.breed||'—'}</div>
                      <div className="ft-rank-bar-wrap">
                        <div className="ft-rank-bar-fill" style={{width:`${pct}%`,background:col}}>
                          {al>0 ? `${(al*100).toFixed(1)}%` : ''}
                        </div>
                        {stdPct && <div className="ft-rank-std" style={{left:`${stdPct}%`,background:bCol}}/>}
                      </div>
                      {stdLay && <div style={{fontSize:8,color:bCol,width:40}}>標{(stdLay*100).toFixed(0)}%</div>}
                    </div>
                  );
                });
              })()}
            </div>

            {/* ── DETAIL TABLE ── */}
            <div className="ft-sec">鶏舎別 詳細集計表</div>
            <div className="ft-ccard">
              <div className="ft-ctitle">期間内 鶏舎別集計 <span>{houseSummaries.length}鶏舎</span></div>
              <div className="ft-tbl-wrap">
                <table className="ft-table">
                  <thead><tr>
                    {['区','鶏舎','品種','死亡数','産卵数','産卵率','卵重','飼料g/羽','FCR','飲水計','照明'].map(h=>(
                      <th key={h}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {[...houseSummaries].sort((a,b)=>{
                      if(a.zone!==b.zone) return a.zone.localeCompare(b.zone);
                      return parseInt(a.hid)-parseInt(b.hid);
                    }).map(s => {
                      const r  = s.rows;
                      const al = avg(r.map(x=>x.lay_rate||(x.total_eggs&&(x.hens||x.hen_count)?x.total_eggs/(x.hens||x.hen_count):null)));
                      const af = avg(r.filter(x=>x.fcr>0).map(x=>x.fcr));
                      const ew = avg(r.filter(x=>x.total_egg_weight_kg>0&&x.total_eggs>0).map(x=>x.total_egg_weight_kg*1000/x.total_eggs));
                      const fd = avg(r.filter(x=>x.feed_per_bird_g>0).map(x=>x.feed_per_bird_g));
                      const lt = avg(r.filter(x=>x.light_hours>0).map(x=>x.light_hours));
                      const td = sum(r.map(x=>x.dead_count||0));
                      const te = sum(r.map(x=>x.total_eggs||0));
                      const tw = sum(r.map(x=>x.water_consumed_liter||0));
                      const zc = ZONE_COLORS[s.zone]||'#607080';
                      const bc = BREED_STD[s.breed]?.color||zc;
                      const layCls = al>=0.9?'g':al>=0.8?'w':'r';
                      const fcrCls = af<=2.0?'g':af<=2.1?'b':af<=2.2?'w':'r';
                      return (
                        <tr key={s.hid}>
                          <td><span className="ft-khu" style={{background:`${zc}22`,color:zc}}>{s.zone}区</span></td>
                          <td style={{fontWeight:700,color:zc}}>{s.zone}{s.hid}</td>
                          <td style={{color:bc,fontSize:10}}>{s.breed||'—'}</td>
                          <td style={{color:'#ef4444'}}>{fmt(td)}</td>
                          <td>{fmt(te)}</td>
                          <td><span className={`ft-pill ${layCls}`}>{al>0?(al*100).toFixed(1)+'%':'—'}</span></td>
                          <td>{ew>0?ew.toFixed(1)+'g':'—'}</td>
                          <td>{fd>0?fd.toFixed(1):'—'}</td>
                          <td><span className={`ft-pill ${fcrCls}`}>{af>0?af.toFixed(3):'—'}</span></td>
                          <td>{fmt(tw,0)} L</td>
                          <td>{lt>0?lt.toFixed(1)+'h':'—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}
        </main>
      </div>
    </>
  );
}
