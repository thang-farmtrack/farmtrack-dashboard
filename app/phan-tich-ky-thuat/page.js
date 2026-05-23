'use client';
import { useState, useMemo } from 'react';
import FarmLayout, { useFarm } from '@/components/FarmLayout';
import { useT } from '@/lib/i18n';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { BREED_STANDARDS, getStd, interpolate, getCurveData, getPhase, getNutritionAtDay } from '@/lib/standards';

// ══════════════════════════════════════════════════════════════
// MOCK DATA — Nhà 6, Khu B, Maria, 300 ngày
// ══════════════════════════════════════════════════════════════
const HOUSES = {
  B: Array.from({length:10},(_,i)=>({id:i+6,  label:`Nhà ${i+6}`,  birds:Math.floor(16000+Math.random()*5000), breed:'Maria',    entryDate:'15/07/2024', layStart:'15/11/2024', age:300})),
  C: Array.from({length:8}, (_,i)=>({id:i+16, label:`Nhà ${i+16}`, birds:Math.floor(15000+Math.random()*5000), breed:'Borisu',   entryDate:'20/08/2024', layStart:'20/12/2024', age:260})),
  D: Array.from({length:12},(_,i)=>({id:i+24, label:`Nhà ${i+24}`, birds:Math.floor(14000+Math.random()*5000), breed:'Julialai', entryDate:'10/06/2024', layStart:'10/10/2024', age:340})),
};
// Fix specific values for House 6 to match reference
HOUSES.B[0] = { id:6, label:'Nhà 6', birds:18620, breed:'Maria', entryDate:'15/07/2024', layStart:'15/11/2024', age:300 };

// Actual KPIs for house 6
// Actual KPIs — Nhà 6, Maria, tuần 42 (300 ngày)
// Chuẩn thực tế (CSV): HD=89.22%, EW=62.28g, Via=97.04%, EM=55.57g
const ACTUAL_H6 = {
  survival:    96.26, survivalPrev:  96.35,   // std 97.04%, delta -0.78%
  henDay:      87.37, henDayPrev:    87.65,   // std 89.22%, delta -1.85%
  eggWeight:   61.58, eggWeightPrev: 61.42,   // std 62.28g, delta -0.70g
  eggMass:     53.80, eggMassPrev:   54.05,   // std 55.57g, delta -1.77g
  fcr:         2.24,  fcrPrev:       2.26,    // std 2.18, delta +0.06 (kém)
  pcr:         1.70,  pcrPrev:       1.72,    // std 1.62, delta +0.08 (kém)
  dirtyEgg:    1.80,  dirtyEggPrev:  1.75,    // std ≤2.00% → đạt
  crackedEgg:  0.90,  crackedEggPrev:0.92,    // std ≤1.00% → đạt
  saleableEgg:96.50,  saleableEggPrev:96.40,  // std ≥95.0% → đạt
  feedIntake:  119.5, waterIntake:   226.0,   // g/con/ngày
  feedCostEgg: 238,   feedCostDay:   2244000, // đ
};

// Nutrition actuals (khẩu phần hiện tại)
// Khẩu phần thực tế — thấp hơn chuẩn (ME std=2825, CP std=16.8)
const NUTRITION_ACTUAL = {
  ME:2775, CP:16.30, Lys:0.78, Met:0.37, Ca:3.80, P:0.36,
};

// Phase survival actuals
// Survival thực tế theo phase — so chuẩn CSV (tại cuối mỗi phase)
// Chuẩn Maria: Sinh trưởng 99.49%, Peak 98.84%, PostPeak 97.45%
const PHASE_SURVIVAL_ACTUAL = {
  'Sinh trưởng': { actual:99.10, age:'113–182' },  // std 99.49%, delta -0.39%
  'Peak':         { actual:98.52, age:'183–250' },  // std 98.84%, delta -0.32%
  'Post Peak':    { actual:96.26, age:'251–300 (HT)' }, // std 97.04%, delta -0.78%
};

// Generate 7-day daily trend
const genTrend = () => {
  const dates = ['02/05','03/05','04/05','05/05','06/05','07/05','08/05'];
  return dates.map((date, i) => ({
    date,
    henDay:     +(90.2 + (i*0.04) + (Math.random()-0.5)*0.3).toFixed(2),
    eggWeight:  +(63.5 + (i*0.05) + (Math.random()-0.5)*0.2).toFixed(1),
    dirtyEgg:   +(1.85 - (i*0.01) + (Math.random()-0.5)*0.1).toFixed(2),
    crackedEgg: +(0.92 - (i*0.003)+ (Math.random()-0.5)*0.05).toFixed(2),
  }));
};

// Generate actual + standard curve data (age 140–350 for current flock)
const genActualCurve = (breed, field, currentAge) => {
  const result = [];
  for (let age = 140; age <= currentAge; age += 10) {
    const std = getStd(breed, field, age);
    // Add slight realistic variation to actual vs standard
    const noise = (Math.sin(age*0.1)*0.8 + Math.cos(age*0.07)*0.5);
    const actual = std ? +(std - Math.abs(noise) * (field==='henDay'?0.8:field==='eggWeight'?0.4:0.6)).toFixed(2) : null;
    result.push({ age, actual, std: std ? +std.toFixed(2) : null });
  }
  return result;
};

// EGG SIZE distribution actual
const EGG_SIZE_ACTUAL = [
  { size:'S (<50g)',    pct:2.0,  color:'#64748b', stdPct:2.0  },
  { size:'M (50-55g)', pct:12.0, color:'#3b82f6', stdPct:10.0 },
  { size:'L (55-60g)', pct:28.0, color:'#22c55e', stdPct:28.0 },
  { size:'LL (60-65g)',pct:42.0, color:'#f59e0b', stdPct:38.0 },
  { size:'XL (65-70g)',pct:12.0, color:'#ec4899', stdPct:16.0 },
  { size:'>70g',       pct:4.0,  color:'#8b5cf6', stdPct:6.0  },
];

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg:'#0f1117', card:'#161b22', border:'#21262d',
  text:'#e6edf3', muted:'#8b949e',
  green:'#22c55e', red:'#ef4444', amber:'#f59e0b', blue:'#3b82f6', purple:'#a855f7',
};
const fmtNum = (n, d=2) => n == null ? '—' : Number(n).toLocaleString('vi-VN', {maximumFractionDigits:d});

// ── Helpers ───────────────────────────────────────────────────
function deltaColor(d, reverse=false) {
  if (Math.abs(d) < 0.001) return C.muted;
  return (reverse ? d < 0 : d > 0) ? C.green : C.red;
}
function evalText(d, reverse=false, thr=0, t_=null) {
  const ok   = t_ ? t_('eval_ok')   : 'Đạt';
  const good = t_ ? t_('eval_good') : 'Tốt';
  const lack = t_ ? t_('eval_lack') : 'Thiếu';
  if (Math.abs(d) <= thr) return { text:ok, color:C.green };
  return (reverse ? d < 0 : d > 0)
    ? { text:good, color:C.green }
    : { text:lack, color:C.red };
}

function SecTitle({ children, sub }) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.9,textTransform:'uppercase'}}>{children}</div>
      {sub && <div style={{fontSize:10,color:'#4a7c4a',marginTop:2}}>{sub}</div>}
    </div>
  );
}
function ChartTip({ active, payload, label }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 12px',fontSize:11}}>
      <div style={{color:C.muted,marginBottom:4,fontWeight:600}}>{label} {t('age_unit')}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,marginBottom:1}}>
          {p.name}: <b>{typeof p.value==='number'?p.value.toFixed(2):p.value}</b>
        </div>
      ))}
    </div>
  );
}

// ── Score donut ───────────────────────────────────────────────
function ScoreDonut({ score }) {
  const r = 36, circ = 2*Math.PI*r;
  const fill = circ*(1 - score/100);
  const color = score>=90?C.green:score>=75?C.amber:C.red;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#21262d" strokeWidth="8"/>
      <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round" transform="rotate(-90 45 45)"/>
      <text x="45" y="47" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="18" fontWeight="700">{score}</text>
      <text x="45" y="62" textAnchor="middle" fill={C.muted} fontSize="9">/100</text>
    </svg>
  );
}

// ── Technical KPI card ────────────────────────────────────────
function TechKpiCard({ label, actual, std, unit='', reverse=false, decimals=2, highlight=false, stdLabel='' }) {
  const delta = actual - std;
  const isGood = reverse ? delta < 0 : delta > 0;
  const dColor = Math.abs(delta)<0.005 ? C.muted : isGood ? C.green : C.red;
  const sign   = delta >= 0 ? '+' : '';
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:10,
      padding:'11px 12px', display:'flex', flexDirection:'column', gap:3,
      borderTop: highlight ? `2px solid ${C.green}` : undefined,
    }}>
      <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:.8,textTransform:'uppercase'}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color:C.text}}>
        {fmtNum(actual,decimals)}<span style={{fontSize:11,color:C.muted,marginLeft:2}}>{unit}</span>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:2}}>
        <span style={{fontSize:10,color:C.muted}}>{stdLabel} <b style={{color:C.text}}>{fmtNum(std,decimals)}{unit}</b></span>
        <span style={{fontSize:11,fontWeight:700,color:dColor}}>{sign}{fmtNum(Math.abs(delta),decimals)}{unit}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
function TechContent() {
  const [zone,     setZone]    = useState('B');
  const [houseId,  setHouseId] = useState(6);
  const [showComp, setShowComp]= useState(false);

  const { lang } = useFarm();
  const t  = useT(lang);
  const zL = (z) => lang === 'ja' ? `${z}団地` : `Khu ${z}`;
  const hL = (n) => lang === 'ja' ? `${n}号舎` : `Nhà ${n}`;


  const house   = useMemo(() => HOUSES[zone]?.find(h=>h.id===houseId) ?? HOUSES.B[0], [zone, houseId]);
  const breed   = house.breed;
  const age     = house.age;
  const phase   = getPhase(age);
  const std     = BREED_STANDARDS[breed];
  // Get nutrition standard from real CSV data via getNutritionAtDay
  const _nutrStd = getNutritionAtDay ? getNutritionAtDay(breed, age) : null;
  const nutrStd  = _nutrStd ?? std?.nutritionByDay?.find(p=>age>=p.minDay&&age<=p.maxDay) ?? {};
  const hdStd   = getStd(breed, 'henDay', age) ?? 92.30;
  const ewStd   = getStd(breed, 'eggWeight', age) ?? 64.5;
  const emStd   = getStd(breed, 'eggMass', age) ?? 59.0;
  const fcrStd  = getStd(breed, 'fcr', age) ?? 2.18;   // estimated
  const pcrStd  = getStd(breed, 'pcr', age) ?? 1.62;   // estimated
  // viability from real CSV: use getStd for 'viability' field
  const surStd  = getStd(breed, 'viability', age) ?? 97.04;

  const hdCurve   = useMemo(()=>genActualCurve(breed,'henDay',age),   [breed,age]);
  const ewCurve   = useMemo(()=>genActualCurve(breed,'eggWeight',age),[breed,age]);
  const emCurve   = useMemo(()=>genActualCurve(breed,'eggMass',age),  [breed,age]);
  const surCurve  = useMemo(()=>genActualCurve(breed,'viability',age), [breed,age]);

  const comboCurve = useMemo(() => hdCurve.map((pt, i) => ({
    age:     pt.age,
    hd_act:  pt.actual,           hd_std:  pt.std,
    ew_act:  ewCurve[i]?.actual,  ew_std:  ewCurve[i]?.std,
    sur_act: surCurve[i]?.actual, sur_std: surCurve[i]?.std,
  })), [hdCurve, ewCurve, surCurve]);
  const trendData = useMemo(()=>genTrend(),[]);

  const sel = { background:C.card,border:`1px solid ${C.border}`,color:C.text,
    padding:'6px 10px',borderRadius:7,fontSize:12,outline:'none',cursor:'pointer' };
  const greenBtn = { padding:'6px 14px',borderRadius:7,fontSize:12,fontWeight:600,
    background:'#166534',border:'1px solid #22c55e',color:'#4ade80',cursor:'pointer' };
  const outlineBtn = { padding:'6px 14px',borderRadius:7,fontSize:12,fontWeight:600,
    background:'transparent',border:`1px solid ${C.border}`,color:C.muted,cursor:'pointer' };

  return (
    <div style={{color:C.text}}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        background:C.card, borderBottom:`1px solid ${C.border}`,
        padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:40,
      }}>
        <div>
          <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{t('tech_breadcrumb')}</div>
          <div style={{fontSize:18,fontWeight:700,color:C.text}}>{t('tech_title')}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <select value={zone} onChange={e=>{setZone(e.target.value);setHouseId(HOUSES[e.target.value][0].id)}} style={sel}>
              <option value="B">{zL('B')}</option>
              <option value="C">{zL('C')}</option>
              <option value="D">{zL('D')}</option>
            </select>
            <select value={houseId} onChange={e=>setHouseId(Number(e.target.value))} style={sel}>
              {(HOUSES[zone]||[]).map(h=>(
                <option key={h.id} value={h.id}>{hL(h.id)}</option>
              ))}
            </select>
          </div>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:'5px 10px',fontSize:12,color:C.muted}}>
            📅 08/05/2026
          </div>
          <select style={sel} defaultValue="7d">
            <option value="7d">{t('period_7d')}</option>
            <option value="30d">{t('period_30d')}</option>
            <option value="all">{t('period_all')}</option>
          </select>
          <button style={greenBtn}>{t('compare_house')}</button>
        </div>
      </div>

      <div style={{padding:'14px 24px'}}>

        {/* ── House info header ─────────────────────── */}
        <div style={{
          background:C.card, border:`1px solid ${C.border}`, borderRadius:12,
          padding:'16px 20px', marginBottom:14, display:'flex', gap:20, alignItems:'center',
        }}>
          <div style={{flex:1}}>
            <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:8}}>
              {lang==='ja' ? `${zone}団地 — ${houseId}号舎` : `KHU ${zone} — NHÀ ${houseId}`}
            </div>
            <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
              {[
                { label:`${t('breed_label')} ${breed}`, color:'#ec4899', bg:'rgba(236,72,153,.12)' },
                { label:`${t('age_label')} ${age} ${t('age_unit')}`, color:'#22c55e', bg:'rgba(34,197,94,.12)' },
                { label:`${t('phase_label')} ${phase}`, color:'#f59e0b', bg:'rgba(245,158,11,.12)' },
              ].map(t=>(
                <span key={t.label} style={{
                  fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:99,
                  background:t.bg,color:t.color,border:`1px solid ${t.color}33`,
                }}>{t.label}</span>
              ))}
            </div>
            <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
              {[
                { label:t('bird_count'), val:`${fmtNum(house.birds,0)} ${t('unit_birds')}` },
                { label:t('entry_date'),  val:house.entryDate },
                { label:t('lay_start'),   val:house.layStart },
              ].map(i=>(
                <div key={i.label}>
                  <div style={{fontSize:10,color:C.muted}}>{i.label}</div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{i.val}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Performance score */}
          <div style={{textAlign:'center',background:'rgba(34,197,94,.05)',border:'1px solid rgba(34,197,94,.2)',borderRadius:12,padding:'14px 20px'}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:600,letterSpacing:.8}}>{t('perf_title')}</div>
            <ScoreDonut score={87} />
            <div style={{fontSize:11,color:C.green,fontWeight:700,marginTop:4}}>{t('perf_good')}</div>
            <div style={{fontSize:9,color:C.muted,marginTop:2,maxWidth:120}}>{t('perf_vs_breed')} 87% {t('perf_vs_week')} {breed}</div>
            <div style={{fontSize:9,color:C.green,marginTop:2}}>{t('perf_up_week')}</div>
          </div>
        </div>

        {/* ── Technical KPI cards (9) ────────────────── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(118px,1fr))',gap:8,marginBottom:14}}>
          <TechKpiCard stdLabel={t('tech_std')} label={t('tech_survival')}       actual={ACTUAL_H6.survival}    std={surStd}   unit="%" reverse={false} />
          <TechKpiCard stdLabel={t('tech_std')} label={t('tech_henDay')}   actual={ACTUAL_H6.henDay}      std={hdStd}    unit="%" reverse={false} />
          <TechKpiCard stdLabel={t('tech_std')} label={t('tech_ewt')}          actual={ACTUAL_H6.eggWeight}   std={ewStd}    unit="g" reverse={false} />
          <TechKpiCard stdLabel={t('tech_std')} label={t('tech_em')}           actual={ACTUAL_H6.eggMass}     std={emStd}    unit="g" reverse={false} />
          <TechKpiCard label="FCR"               actual={ACTUAL_H6.fcr}         std={fcrStd}   unit=""  reverse={true}  />
          <TechKpiCard label="PCR"               actual={ACTUAL_H6.pcr}         std={pcrStd}   unit=""  reverse={true}  />
          <TechKpiCard stdLabel={t('tech_std')} label={t('tech_dirty')}       actual={ACTUAL_H6.dirtyEgg}    std={2.00}     unit="%" reverse={true} decimals={2} />
          <TechKpiCard stdLabel={t('tech_std')} label={t('tech_cracked')}        actual={ACTUAL_H6.crackedEgg}  std={1.00}     unit="%" reverse={true} decimals={2} />
          <TechKpiCard stdLabel={t('tech_std')} label={t('tech_saleable')}   actual={ACTUAL_H6.saleableEgg} std={95.00}    unit="%" reverse={false} decimals={2} highlight />
        </div>

        {/* ── Row 1: Phase survival table + Combined chart ─── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 2.8fr',gap:10,marginBottom:10}}>

          {/* 1. Phase survival table */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <SecTitle>{t('sec_phase_sur')}</SecTitle>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {[t('ph_phase'),t('ph_age'),t('ph_actual'),t('ph_std'),t('ph_delta')].map(h=>(
                    <th key={h} style={{padding:'4px 5px',textAlign:'left',color:C.muted,fontSize:9.5,fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(std?.phaseSurvival??[]).filter(p=>PHASE_SURVIVAL_ACTUAL[p.phase]).map(p=>{
                  const act = PHASE_SURVIVAL_ACTUAL[p.phase];
                  if (!act) return null;
                  const d = act.actual - p.survival;
                  return (
                    <tr key={p.phase} style={{borderBottom:`1px solid ${C.border}`}}>
                      <td style={{padding:'5px 5px',color:C.text,fontWeight:600,fontSize:11}}>{p.phase}</td>
                      <td style={{padding:'5px 5px',color:C.muted,fontSize:10,whiteSpace:'nowrap'}}>{act.age}</td>
                      <td style={{padding:'5px 5px',color:C.text,fontWeight:600}}>{act.actual.toFixed(2)}</td>
                      <td style={{padding:'5px 5px',color:C.muted}}>{p.survival.toFixed(2)}</td>
                      <td style={{padding:'5px 5px',fontWeight:700,color:deltaColor(d)}}>{d>=0?'+':''}{d.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. Combined chart: Tỷ lệ sống + Tỷ lệ đẻ + KL Trứng (thực tế vs chuẩn) */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <SecTitle>{t('sec_combo')}</SecTitle>
              <div style={{display:'flex',gap:12,fontSize:9.5,color:C.muted,flexShrink:0,marginTop:2}}>
                <span style={{color:'#f97316'}}>{t('leg_surv')}</span>
                <span style={{color:C.green}}>{t('leg_hd')}</span>
                <span style={{color:'#eab308'}}>{t('leg_ew')}</span>
                <span style={{color:'#94a3b8'}}>{t('leg_std_dash')}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={comboCurve} margin={{top:4,right:40,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="age" tick={{fill:C.muted,fontSize:9}}
                  label={{value:t('age_axis'),position:'insideBottomRight',offset:-4,fill:C.muted,fontSize:9}} />
                <YAxis yAxisId="pct" domain={[80,100]} tick={{fill:C.muted,fontSize:9}}
                  label={{value:'%',angle:-90,position:'insideLeft',offset:28,fill:C.muted,fontSize:9}} />
                <YAxis yAxisId="g" orientation="right" domain={[52,72]} tick={{fill:C.muted,fontSize:9}}
                  label={{value:'g',angle:90,position:'insideRight',offset:-10,fill:C.muted,fontSize:9}} />
                <Tooltip content={<ChartTip/>} />
                <ReferenceLine yAxisId="pct" x={age} stroke="#ffffff22" strokeDasharray="3 3"
                  label={{value:`${age}d`,fill:C.muted,fontSize:8}} />
                {/* Tỷ lệ sống */}
                <Line yAxisId="pct" type="monotone" dataKey="sur_act" name={t('leg_sur_act')}   stroke="#f97316" strokeWidth={2}   dot={false} />
                <Line yAxisId="pct" type="monotone" dataKey="sur_std" name={t('leg_sur_std')}stroke="#f97316" strokeWidth={1.2} dot={false} strokeDasharray="5 3" opacity={0.6} />
                {/* Tỷ lệ đẻ */}
                <Line yAxisId="pct" type="monotone" dataKey="hd_act"  name={t('leg_hd_act')}        stroke={C.green} strokeWidth={2}   dot={false} />
                <Line yAxisId="pct" type="monotone" dataKey="hd_std"  name={t('leg_hd_std')}   stroke={C.green} strokeWidth={1.2} dot={false} strokeDasharray="5 3" opacity={0.6} />
                {/* KL Trứng */}
                <Line yAxisId="g"   type="monotone" dataKey="ew_act"  name={t('leg_ew_act')}     stroke="#eab308" strokeWidth={2}   dot={false} />
                <Line yAxisId="g"   type="monotone" dataKey="ew_std"  name={t('leg_ew_std')}  stroke="#eab308" strokeWidth={1.2} dot={false} strokeDasharray="5 3" opacity={0.6} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 2: Egg Mass + Nutrition + Feed Eff ─── */}
        <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr',gap:10,marginBottom:10}}>

          {/* 4. Egg Mass chart */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <SecTitle>{t('sec_em')}</SecTitle>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={emCurve} margin={{top:2,right:8,left:-24,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="age" tick={{fill:C.muted,fontSize:9}} label={{value:t('age_axis'),position:'insideBottom',offset:-2,fill:C.muted,fontSize:9}} />
                <YAxis domain={[0,70]} tick={{fill:C.muted,fontSize:9}} />
                <Tooltip content={<ChartTip/>} />
                <Legend wrapperStyle={{fontSize:9,color:C.muted}} />
                <ReferenceLine x={age} stroke="#ffffff33" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="actual" name={t('ph_actual')} stroke={C.green} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="std"    name={`${t('ph_std')} ${breed}`} stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 5. Nutrition table */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <SecTitle sub={`${t('nut_sub')} ${breed} — ${age} ${t('age_unit')} (${phase})`}>{t('sec_nutrition')}</SecTitle>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {[t('th_kpi'),t('th_unit'),t('th_actual'),t('th_std'),t('th_delta'),t('th_eval')].map(h=>(
                    <th key={h} style={{padding:'4px 4px',textAlign:'left',color:C.muted,fontSize:9.5,fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key:'ME',  unit:'kcal/kg', actual:NUTRITION_ACTUAL.ME,  std:nutrStd.ME??2825 },
                  { key:'CP',  unit:'%',       actual:NUTRITION_ACTUAL.CP,  std:nutrStd.CP??16.8 },
                  { key:'Lys', unit:'%',       actual:NUTRITION_ACTUAL.Lys, std:nutrStd.Lys??0.85 },
                  { key:'Met', unit:'%',       actual:NUTRITION_ACTUAL.Met, std:nutrStd.Met??0.40 },
                  { key:'Ca',  unit:'%',       actual:NUTRITION_ACTUAL.Ca,  std:nutrStd.Ca??4.0  },
                  { key:'P',   unit:'%',       actual:NUTRITION_ACTUAL.P,   std:nutrStd.P??0.40  },
                ].map(r=>{
                  const d = r.actual - r.std;
                  const ev = evalText(d, false, 0, t);
                  return (
                    <tr key={r.key} style={{borderBottom:`1px solid ${C.border}`}}>
                      <td style={{padding:'5px 4px',fontWeight:700,color:C.text}}>{r.key}</td>
                      <td style={{padding:'5px 4px',color:C.muted,fontSize:10}}>{r.unit}</td>
                      <td style={{padding:'5px 4px',color:C.text,fontWeight:600}}>{r.actual}</td>
                      <td style={{padding:'5px 4px',color:C.muted}}>{r.std}</td>
                      <td style={{padding:'5px 4px',fontWeight:700,color:deltaColor(d)}}>{d>=0?'+':''}{d.toFixed(2)}</td>
                      <td style={{padding:'5px 4px'}}>
                        <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:`${ev.color}22`,color:ev.color}}>{ev.text}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 6. Feed efficiency */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <SecTitle>{t('sec_feed_eff')}</SecTitle>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {[t('th_item'),t('th_unit'),t('th_actual'),t('th_std'),t('th_delta'),t('th_eval')].map(h=>(
                    <th key={h} style={{padding:'4px 4px',textAlign:'left',color:C.muted,fontSize:9.5,fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label:t('feed_intake'), unit:'g/con/ngày', actual:ACTUAL_H6.feedIntake, std:getStd(breed,'feedIntake',age)??122, dec:1, rev:false },
                  { label:'FCR',         unit:'',           actual:ACTUAL_H6.fcr,        std:fcrStd,  dec:2, rev:true },
                  { label:'PCR',         unit:'',           actual:ACTUAL_H6.pcr,        std:pcrStd,  dec:2, rev:true },
                  { label:t('feed_egg'),    unit:'đ/quả',      actual:ACTUAL_H6.feedCostEgg,std:238, dec:0, rev:true },
                ].map(r=>{
                  const d = r.actual - r.std;
                  const ev = r.rev
                    ? { text:d<0?t('eval_good'):t('eval_high'), color:d<0?C.green:C.red }
                    : { text:d>0?t('eval_good'):t('eval_lack'), color:d>0?C.green:C.amber };
                  return (
                    <tr key={r.label} style={{borderBottom:`1px solid ${C.border}`}}>
                      <td style={{padding:'5px 4px',fontWeight:600,color:C.text,fontSize:10,whiteSpace:'nowrap'}}>{r.label}</td>
                      <td style={{padding:'5px 4px',color:C.muted,fontSize:9,whiteSpace:'nowrap'}}>{r.unit}</td>
                      <td style={{padding:'5px 4px',color:C.text,fontWeight:600}}>{fmtNum(r.actual,r.dec)}</td>
                      <td style={{padding:'5px 4px',color:C.muted}}>{fmtNum(r.std,r.dec)}</td>
                      <td style={{padding:'5px 4px',fontWeight:700,color:deltaColor(d,r.rev)}}>{d>=0?'+':''}{fmtNum(Math.abs(d),r.dec)}</td>
                      <td style={{padding:'5px 4px'}}>
                        <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:`${ev.color}22`,color:ev.color}}>{ev.text}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Egg Quality Section ───────────────────── */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px',marginBottom:10}}>
          <SecTitle>{t('sec_egg_qual')}</SecTitle>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1.5fr 1.5fr',gap:12}}>

            {/* Mini quality KPIs */}
            <div>
              <div style={{fontSize:10,color:C.muted,marginBottom:8,fontWeight:600}}>{t('qual_kpi')}</div>
              {[
                { label:t('tech_dirty'),       val:ACTUAL_H6.dirtyEgg,   std:'≤2.0%', clr:ACTUAL_H6.dirtyEgg<=2?C.green:C.red },
                { label:t('tech_cracked'),         val:ACTUAL_H6.crackedEgg, std:'≤1.0%', clr:ACTUAL_H6.crackedEgg<=1?C.green:C.red },
                { label:t('tech_saleable'),  val:ACTUAL_H6.saleableEgg,std:'≥95%',  clr:ACTUAL_H6.saleableEgg>=95?C.green:C.red },
              ].map(q=>(
                <div key={q.label} style={{marginBottom:10,padding:'8px 10px',background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{q.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:q.clr}}>{q.val.toFixed(2)}%</div>
                  <div style={{fontSize:9,color:'#4a7c4a'}}>{t('std_label')} {q.std}</div>
                </div>
              ))}
            </div>

            {/* 7-day dirty/cracked trend */}
            <div>
              <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>{t('trend_7d_cap')}</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData} margin={{top:2,right:4,left:-28,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="date" tick={{fill:C.muted,fontSize:8}} />
                  <YAxis tick={{fill:C.muted,fontSize:8}} />
                  <Tooltip contentStyle={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,fontSize:10}} />
                  <Legend wrapperStyle={{fontSize:9}} />
                  <Line type="monotone" dataKey="dirtyEgg"   name={t('dirty_short')}  stroke={C.amber} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="crackedEgg" name={t('cracked_short')}   stroke={C.red}   strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Size pie */}
            <div>
              <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>{t('size_today')}</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <ResponsiveContainer width="55%" height={160}>
                  <PieChart>
                    <Pie data={EGG_SIZE_ACTUAL} cx="50%" cy="50%" innerRadius={30} outerRadius={55}
                      dataKey="pct" nameKey="size">
                      {EGG_SIZE_ACTUAL.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v)=>v+'%'} contentStyle={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,fontSize:10}} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{flex:1}}>
                  {EGG_SIZE_ACTUAL.map(s=>(
                    <div key={s.size} style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <div style={{width:6,height:6,borderRadius:'50%',background:s.color}}/>
                        <span style={{fontSize:9,color:C.muted}}>{s.size}</span>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:C.text}}>{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Size comparison actual vs standard */}
            <div>
              <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>{t('size_cmp')} {breed.toUpperCase()} ({age} {t('age_unit')})</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={EGG_SIZE_ACTUAL} margin={{top:2,right:4,left:-28,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="size" tick={{fill:C.muted,fontSize:8}} />
                  <YAxis tick={{fill:C.muted,fontSize:8}} />
                  <Tooltip contentStyle={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,fontSize:10}} />
                  <Legend wrapperStyle={{fontSize:9}} />
                    <Bar dataKey="pct"    name={t('bar_actual')} fill={C.green} opacity={0.85} radius={[3,3,0,0]} />
                    <Bar dataKey="stdPct" name={t('bar_std')}   fill="#a855f7" opacity={0.6}  radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Alerts + Recommendations + House info ─── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 0.7fr',gap:10}}>

          {/* Alerts */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <SecTitle>{t('sec_alerts')}</SecTitle>
            {[
              { color:C.amber, text:t('alert_t1') },
              { color:C.amber, text:t('alert_t2') },
              { color:C.red,   text:t('alert_t3') },
              { color:C.amber, text:t('alert_t4') },
            ].map((a,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8,padding:'7px 8px',background:`${a.color}11`,border:`1px solid ${a.color}33`,borderRadius:7}}>
                <span style={{color:a.color,flexShrink:0,marginTop:1}}>⚠</span>
                <span style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{a.text}</span>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <SecTitle>{t('sec_reco')}</SecTitle>
            {[
              { text:t('reco1') },
              { text:t('reco2') },
              { text:t('reco3') },
              { text:t('reco4') },
            ].map((r,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8,padding:'7px 8px',background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)',borderRadius:7}}>
                <span style={{color:C.green,flexShrink:0,marginTop:1,fontWeight:700}}>✓</span>
                <span style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{r.text}</span>
              </div>
            ))}
          </div>

          {/* Technical notes */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <SecTitle>{t('sec_notes')}</SecTitle>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.7}}>
              <p>{t('note1')}</p>
              <br/>
              <p>{t('note2')}</p>
              <br/>
              <p>{t('note3')}</p>
            </div>
          </div>

          {/* House info */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px'}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:10,letterSpacing:.8,textTransform:'uppercase'}}>{t('sec_house_info')}</div>
            {[
              { label:t('cage_type'),  val:t('cage_val') },
              { label:t('feed_sys'),   val:t('feed_sys_val') },
              { label:t('water_sys'),  val:'Nipple' },
              { label:t('density'),    val:`480 ${t('unit_birds')}/m²` },
              { label:t('light_sch'),  val:'16L : 8D' },
            ].map(i=>(
              <div key={i.label} style={{display:'flex',justifyContent:'space-between',marginBottom:7,fontSize:11}}>
                <span style={{color:C.muted}}>{i.label}</span>
                <span style={{color:C.text,fontWeight:600}}>{i.val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function TechPage() {
  return (
    <FarmLayout>
      <TechContent />
    </FarmLayout>
  );
}
