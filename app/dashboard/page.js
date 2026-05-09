'use client';
import { useState, useMemo } from 'react';

import FarmLayout from '@/components/FarmLayout';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ══════════════════════════════════════════════════════════════
// MOCK DATA — sẽ kết nối API thực tế sau
// ══════════════════════════════════════════════════════════════
const TODAY = '08/05/2026';

const MOCK_FARM = {
  totalBirds:  587450,
  henDay:      92.46, henDayPrev:    91.72,
  totalEggs:   528760, totalEggsPrev: 517296,
  mortality:   0.052,  mortalityPrev: 0.048,
  survival:    95.81,  survivalPrev:  95.85,
  feedIntake:  113.2,  feedIntakePrev:114.5,
  waterIntake: 207.4,  waterIntakePrev:210.6,
  feedWater:   0.545,  feedWaterPrev: 0.544,
  avgTemp:     27.6,   avgTempPrev:   28.1,
  eggWeight:   63.2,   eggWeightPrev: 63.0,
  fcr:         2.08,   fcrPrev:       2.11,
  pcr:         1.55,   pcrPrev:       1.56,
  feedCostEgg: 223,    feedCostPrev:  228,
  dirtyEgg:    1.80,   dirtyEggPrev:  1.95,
  crackedEgg:  0.90,   crackedEggPrev:0.92,
  saleableEgg: 96.50,  saleableEggPrev:96.10,
};

const TREND_7D = [
  { date:'02/05', henDay:91.20, feed:114.8, water:211.2, mort:0.048 },
  { date:'03/05', henDay:91.50, feed:114.5, water:210.8, mort:0.050 },
  { date:'04/05', henDay:91.80, feed:114.0, water:210.3, mort:0.051 },
  { date:'05/05', henDay:91.90, feed:113.8, water:209.8, mort:0.049 },
  { date:'06/05', henDay:91.72, feed:114.5, water:210.6, mort:0.048 },
  { date:'07/05', henDay:92.10, feed:113.8, water:208.5, mort:0.051 },
  { date:'08/05', henDay:92.46, feed:113.2, water:207.4, mort:0.052 },
];

const BREED_PIE = [
  { name:'Maria',    value:248750, pct:42.3, color:'#ec4899' },
  { name:'Borisu',   value:194350, pct:33.1, color:'#f59e0b' },
  { name:'Julialai', value:144350, pct:24.6, color:'#3b82f6' },
];

const ZONE_PIE = [
  { name:'Khu B', value:198240, pct:33.8, color:'#22c55e' },
  { name:'Khu C', value:195860, pct:33.3, color:'#3b82f6' },
  { name:'Khu D', value:193350, pct:32.9, color:'#a855f7' },
];

const ZONE_TABLE = [
  { zone:'Khu B', range:'Nhà 6–15',  houses:10, birds:198240, henDay:92.82, mort:0.048, temp:27.4, feed:112.6, water:206.3, trend:'up' },
  { zone:'Khu C', range:'Nhà 16–23', houses:8,  birds:195860, henDay:92.35, mort:0.051, temp:27.8, feed:113.8, water:208.1, trend:'stable' },
  { zone:'Khu D', range:'Nhà 24–35', houses:12, birds:193350, henDay:92.21, mort:0.057, temp:27.6, feed:113.1, water:207.8, trend:'down' },
];

const ALERTS = [
  { level:'danger',  icon:'🔴', msg:'Nhiệt độ cao tại Nhà 27 – Khu D', sub:'Nhiệt độ hiện tại 31.2°C vượt ngưỡng cho phép.', time:'08:25' },
  { level:'warning', icon:'🟡', msg:'Feed intake giảm tại Nhà 18 – Khu C', sub:'Feed intake giảm 8.5% so với trung bình 3 ngày.', time:'08:20' },
  { level:'warning', icon:'🟡', msg:'Water intake giảm tại Nhà 9 – Khu B', sub:'Water intake giảm 6.2% so với trung bình 3 ngày.', time:'08:15' },
  { level:'danger',  icon:'🔴', msg:'Tỷ lệ chết tăng tại Nhà 32', sub:'Tỷ lệ chết 0.12% cao hơn mức bình thường.', time:'08:10' },
  { level:'info',    icon:'🔵', msg:'Tỷ lệ đẻ giảm tại Nhà 14 – Khu B', sub:'Tỷ lệ đẻ thấp hơn 2.5% so với mục tiêu.', time:'08:05' },
];

const EGG_SIZE = [
  { size:'S (<50g)',   pct:2.0,  color:'#64748b' },
  { size:'M (50-55g)',pct:12.0, color:'#3b82f6' },
  { size:'L (55-60g)',pct:28.0, color:'#22c55e' },
  { size:'LL (60-65g)',pct:42.0,color:'#f59e0b' },
  { size:'XL (65-70g)',pct:12.0,color:'#ec4899' },
  { size:'>70g',      pct:4.0,  color:'#8b5cf6' },
];

// ── Colors & helpers ─────────────────────────────────────────
const C = {
  bg:    '#0f1117', card:  '#161b22', border:'#21262d',
  text:  '#e6edf3', muted: '#8b949e', green: '#22c55e',
  red:   '#ef4444', amber: '#f59e0b', blue:  '#3b82f6',
};
const pct = (v, prev) => {
  const d = v - prev;
  return { d, pos: d > 0, zero: Math.abs(d) < 0.001 };
};
const fmtNum = (n, d=1) => n == null ? '—' : Number(n).toLocaleString('vi-VN', { maximumFractionDigits: d });
const alertColor = { danger:'#ef4444', warning:'#f59e0b', info:'#3b82f6' };
const alertBg    = { danger:'rgba(239,68,68,.08)', warning:'rgba(245,158,11,.08)', info:'rgba(59,130,246,.08)' };

// ── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, unit='', prev, prevUnit, deltaLabel, reverse=false, decimals=2, good='green' }) {
  const d = value - prev;
  const isGood = reverse ? d < 0 : d > 0;
  const color  = Math.abs(d) < 0.001 ? C.muted : isGood ? C.green : C.red;
  const arrow  = Math.abs(d) < 0.001 ? '→' : d > 0 ? '↑' : '↓';
  const sign   = d > 0 ? '+' : '';
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:10,
      padding:'12px 12px 10px', display:'flex', flexDirection:'column', gap:4,
      minWidth:0,
    }}>
      <div style={{fontSize:9.5, color:C.muted, fontWeight:600, letterSpacing:0.8, textTransform:'uppercase', lineHeight:1.2}}>
        {label}
      </div>
      <div style={{fontSize:22, fontWeight:700, color:C.text, lineHeight:1.1}}>
        {fmtNum(value, decimals)}<span style={{fontSize:12, fontWeight:400, color:C.muted, marginLeft:2}}>{unit}</span>
      </div>
      <div style={{fontSize:10.5, color:C.muted}}>
        Hôm qua: <span style={{color:C.text}}>{fmtNum(prev, decimals)}{prevUnit??unit}</span>
      </div>
      <div style={{fontSize:11, fontWeight:600, color}}>
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
    <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
function DashboardContent() {
  const [zone,   setZone]   = useState('all');
  const [house,  setHouse]  = useState('all');
  const [breed,  setBreed]  = useState('all');
  const [period, setPeriod] = useState('7d');

  const sel = { background:C.card, border:`1px solid ${C.border}`, color:C.text,
    padding:'6px 10px', borderRadius:7, fontSize:12, outline:'none', cursor:'pointer' };
  const btn = (active) => ({
    padding:'5px 12px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer',
    background: active ? '#166534' : 'transparent',
    border: active ? '1px solid #22c55e' : `1px solid ${C.border}`,
    color: active ? '#4ade80' : C.muted,
    transition:'all .15s',
  });
  const greenBtn = {
    padding:'6px 14px', borderRadius:7, fontSize:12, fontWeight:600,
    background:'#166534', border:'1px solid #22c55e', color:'#4ade80', cursor:'pointer',
  };

  return (
    <div style={{padding:'0',color:C.text}}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        background:C.card, borderBottom:`1px solid ${C.border}`,
        padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:40,
      }}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:C.text}}>TỔNG QUAN TRẠI</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>Cập nhật lần cuối: 08:30 – {TODAY} &nbsp;
            <span style={{color:C.green,cursor:'pointer'}}>↺</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:'5px 10px',fontSize:12,color:C.muted,display:'flex',alignItems:'center',gap:6}}>
            📅 {TODAY}
          </div>
          {['Hôm nay','7 ngày','30 ngày'].map((p,i) => {
            const k = ['1d','7d','30d'][i];
            return <button key={k} style={btn(period===k)} onClick={()=>setPeriod(k)}>{p}</button>;
          })}
          <button style={greenBtn}>↓ Xuất báo cáo</button>
        </div>
      </div>

      <div style={{padding:'16px 24px'}}>

        {/* ── Filter bar ─────────────────────────────── */}
        <div style={{
          background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
          padding:'12px 16px',display:'flex',alignItems:'center',gap:16,marginBottom:16,
        }}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:11,color:C.muted,whiteSpace:'nowrap'}}>Chọn khu</span>
            <select value={zone} onChange={e=>setZone(e.target.value)} style={sel}>
              <option value="all">Tất cả khu</option>
              <option value="B">Khu B (Nhà 6–15)</option>
              <option value="C">Khu C (Nhà 16–23)</option>
              <option value="D">Khu D (Nhà 24–35)</option>
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:11,color:C.muted,whiteSpace:'nowrap'}}>Chọn nhà</span>
            <select value={house} onChange={e=>setHouse(e.target.value)} style={sel}>
              <option value="all">Tất cả nhà</option>
              {Array.from({length:30},(_,i)=>i+6).map(n=>(
                <option key={n} value={n}>Nhà {n}</option>
              ))}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:11,color:C.muted,whiteSpace:'nowrap'}}>Chọn giống</span>
            <select value={breed} onChange={e=>setBreed(e.target.value)} style={sel}>
              <option value="all">Tất cả giống</option>
              <option value="Maria">Maria</option>
              <option value="Borisu">Borisu</option>
              <option value="Julialai">Julialai</option>
            </select>
          </div>
          <div style={{marginLeft:'auto',fontSize:11,color:C.muted}}>
            Tổng đàn: <span style={{color:C.green,fontWeight:700,fontSize:13}}>{fmtNum(MOCK_FARM.totalBirds,0)}</span> con
          </div>
        </div>

        {/* ── KPI Cards (10) ─────────────────────────── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(112px,1fr))',gap:8,marginBottom:16}}>
          <KpiCard label="Tỷ lệ đẻ (HD%)"     value={MOCK_FARM.henDay}     prev={MOCK_FARM.henDayPrev}     unit="%" decimals={2} />
          <KpiCard label="Trứng hôm nay"        value={MOCK_FARM.totalEggs}  prev={MOCK_FARM.totalEggsPrev}  unit="" decimals={0} />
          <KpiCard label="Tỷ lệ chết"           value={MOCK_FARM.mortality}  prev={MOCK_FARM.mortalityPrev}  unit="%" decimals={3} reverse={true} />
          <KpiCard label="Tỷ lệ sống"           value={MOCK_FARM.survival}   prev={MOCK_FARM.survivalPrev}   unit="%" decimals={2} />
          <KpiCard label="Feed Intake"           value={MOCK_FARM.feedIntake} prev={MOCK_FARM.feedIntakePrev} unit=" g" decimals={1} />
          <KpiCard label="Water Intake"          value={MOCK_FARM.waterIntake}prev={MOCK_FARM.waterIntakePrev}unit=" ml" decimals={1} />
          <KpiCard label="Feed/Water"            value={MOCK_FARM.feedWater}  prev={MOCK_FARM.feedWaterPrev}  unit="" decimals={3} />
          <KpiCard label="Nhiệt độ TB"           value={MOCK_FARM.avgTemp}    prev={MOCK_FARM.avgTempPrev}    unit="°C" decimals={1} reverse={true} />
          <KpiCard label="KL Trứng"             value={MOCK_FARM.eggWeight}  prev={MOCK_FARM.eggWeightPrev}  unit="g" decimals={1} />
          <KpiCard label="Số gà hiện tại"        value={MOCK_FARM.totalBirds} prev={MOCK_FARM.totalBirds}     unit="" decimals={0} />
        </div>

        {/* ── Charts row 1: Trend + Pies ────────────── */}
        <div style={{display:'grid',gridTemplateColumns:'1.8fr 1fr 1fr',gap:12,marginBottom:12}}>

          {/* Trend chart */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>Xu hướng 7 ngày qua</SecTitle>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={TREND_7D} margin={{top:2,right:8,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} />
                <YAxis yAxisId="pct" domain={[88,96]} tick={{fill:C.muted,fontSize:10}} />
                <YAxis yAxisId="g"   orientation="right" domain={[100,220]} tick={{fill:C.muted,fontSize:10}} />
                <Tooltip content={<ChartTip/>} />
                <Legend wrapperStyle={{fontSize:10,color:C.muted}} />
                <Line yAxisId="pct" type="monotone" dataKey="henDay"  name="Tỷ lệ đẻ (%)" stroke={C.green} strokeWidth={2} dot={false} />
                <Line yAxisId="g"   type="monotone" dataKey="feed"    name="Feed (g)"       stroke={C.amber} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line yAxisId="g"   type="monotone" dataKey="water"   name="Water (ml)"     stroke={C.blue}  strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line yAxisId="pct" type="monotone" dataKey="mort"    name="Mort (%)"       stroke={C.red}   strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Breed pie */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>Tổng đàn theo giống</SecTitle>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={BREED_PIE} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                  dataKey="value" nameKey="name">
                  {BREED_PIE.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtNum(v,0)+' con'} contentStyle={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{marginTop:4}}>
              {BREED_PIE.map(b => (
                <div key={b.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:b.color,flexShrink:0}}/>
                    <span style={{color:C.muted}}>{b.name}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:600,color:C.text}}>{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zone pie */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>Tổng đàn theo khu</SecTitle>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={ZONE_PIE} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                  dataKey="value" nameKey="name">
                  {ZONE_PIE.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtNum(v,0)+' con'} contentStyle={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{marginTop:4}}>
              {ZONE_PIE.map(z => (
                <div key={z.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:z.color,flexShrink:0}}/>
                    <span style={{color:C.muted}}>{z.name}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:600,color:C.text}}>{z.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Zone table + Alerts ───────────────────── */}
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:12,marginBottom:12}}>

          {/* Zone table */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>Tổng quan theo khu</SecTitle>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {['Khu','Số nhà','Đàn gà','HD%','Tỷ lệ chết','Nhiệt độ','Feed (g)','Water (ml)','Trend'].map(h=>(
                    <th key={h} style={{padding:'5px 6px',textAlign:'left',color:C.muted,fontWeight:600,fontSize:10,whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ZONE_TABLE.map((z,i) => (
                  <tr key={z.zone} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                    <td style={{padding:'7px 6px'}}>
                      <div style={{fontWeight:700,color:C.text}}>{z.zone}</div>
                      <div style={{fontSize:10,color:C.muted}}>{z.range}</div>
                    </td>
                    <td style={{padding:'7px 6px',color:C.muted}}>{z.houses}</td>
                    <td style={{padding:'7px 6px',color:C.text,fontWeight:600}}>{fmtNum(z.birds,0)}</td>
                    <td style={{padding:'7px 6px',color:C.green,fontWeight:700}}>{z.henDay.toFixed(2)}%</td>
                    <td style={{padding:'7px 6px',color:z.mort>0.05?C.red:C.amber}}>{z.mort.toFixed(3)}%</td>
                    <td style={{padding:'7px 6px',color:z.temp>30?C.red:C.text}}>{z.temp}°C</td>
                    <td style={{padding:'7px 6px',color:C.text}}>{z.feed}</td>
                    <td style={{padding:'7px 6px',color:C.text}}>{z.water}</td>
                    <td style={{padding:'7px 6px',fontSize:16}}>
                      {z.trend==='up'?'📈':z.trend==='down'?'📉':'➡️'}
                    </td>
                  </tr>
                ))}
                <tr style={{borderTop:`1px solid ${C.border}`,fontWeight:700}}>
                  <td style={{padding:'7px 6px',color:C.text}}>Tổng cộng</td>
                  <td style={{padding:'7px 6px',color:C.text}}>30</td>
                  <td style={{padding:'7px 6px',color:C.green}}>{fmtNum(MOCK_FARM.totalBirds,0)}</td>
                  <td style={{padding:'7px 6px',color:C.green}}>{MOCK_FARM.henDay.toFixed(2)}%</td>
                  <td style={{padding:'7px 6px',color:C.amber}}>{MOCK_FARM.mortality.toFixed(3)}%</td>
                  <td style={{padding:'7px 6px',color:C.text}}>{MOCK_FARM.avgTemp}°C</td>
                  <td style={{padding:'7px 6px',color:C.text}}>{MOCK_FARM.feedIntake}</td>
                  <td style={{padding:'7px 6px',color:C.text}}>{MOCK_FARM.waterIntake}</td>
                  <td/>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Alert center */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <SecTitle>Cảnh báo hệ thống</SecTitle>
              <a href="/canh-bao" style={{fontSize:11,color:C.blue,textDecoration:'none'}}>Xem tất cả →</a>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {ALERTS.map((a,i) => (
                <div key={i} style={{
                  background:alertBg[a.level],
                  border:`1px solid ${alertColor[a.level]}33`,
                  borderRadius:8, padding:'8px 10px',
                  display:'flex', gap:10, alignItems:'flex-start',
                }}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,flexShrink:0}}>
                    <span style={{fontSize:14}}>{a.icon}</span>
                    <span style={{fontSize:9,color:C.muted,whiteSpace:'nowrap'}}>{a.time}</span>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:alertColor[a.level],marginBottom:2}}>{a.msg}</div>
                    <div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{a.sub}</div>
                  </div>
                  <div style={{marginLeft:'auto',flexShrink:0}}>
                    <span style={{
                      fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:4,
                      background:`${alertColor[a.level]}22`,color:alertColor[a.level],
                    }}>
                      {a.level==='danger'?'Nguy hiểm':a.level==='warning'?'Cảnh báo':'Thông tin'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Feed + Egg quality + Size ──── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1.2fr',gap:12,marginBottom:8}}>

          {/* Feed efficiency */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>Hiệu quả sử dụng thức ăn</SecTitle>
            {[
              { label:'FCR',          val:MOCK_FARM.fcr,       prev:MOCK_FARM.fcrPrev,       unit:'', rev:true,  dec:2 },
              { label:'PCR',          val:MOCK_FARM.pcr,       prev:MOCK_FARM.pcrPrev,       unit:'', rev:true,  dec:2 },
              { label:'Feed cost/egg',val:MOCK_FARM.feedCostEgg,prev:MOCK_FARM.feedCostPrev, unit:'đ',rev:true,  dec:0 },
            ].map(row => {
              const d = row.val - row.prev;
              const good = row.rev ? d < 0 : d > 0;
              const clr = Math.abs(d)<0.001?C.muted:good?C.green:C.red;
              return (
                <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:12,color:C.muted}}>{row.label}</span>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:15,fontWeight:700,color:C.text}}>{fmtNum(row.val,row.dec)}{row.unit}</div>
                    <div style={{fontSize:10,color:clr}}>{d>0?'+':''}{fmtNum(d,row.dec)}{row.unit} vs hôm qua</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Egg quality */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>Chất lượng trứng</SecTitle>
            {[
              { label:'Trứng bẩn',       val:MOCK_FARM.dirtyEgg,   prev:MOCK_FARM.dirtyEggPrev,   unit:'%', rev:true, std:'≤ 2.00%', dec:2 },
              { label:'Trứng vỡ',         val:MOCK_FARM.crackedEgg, prev:MOCK_FARM.crackedEggPrev, unit:'%', rev:true, std:'≤ 1.00%', dec:2 },
              { label:'Trứng đạt chuẩn', val:MOCK_FARM.saleableEgg,prev:MOCK_FARM.saleableEggPrev,unit:'%', rev:false,std:'≥ 95.0%', dec:2 },
            ].map(row => {
              const d = row.val - row.prev;
              const good = row.rev ? d < 0 : d > 0;
              const clr = Math.abs(d)<0.001?C.muted:good?C.green:C.red;
              return (
                <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
                  <div>
                    <div style={{fontSize:12,color:C.muted}}>{row.label}</div>
                    <div style={{fontSize:10,color:'#4a7c4a'}}>Chuẩn: {row.std}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:15,fontWeight:700,color:C.text}}>{fmtNum(row.val,row.dec)}{row.unit}</div>
                    <div style={{fontSize:10,color:clr}}>{d>0?'+':''}{fmtNum(d,row.dec)}{row.unit}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Egg size distribution */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <SecTitle>Phân bố size trứng (hôm nay)</SecTitle>
            <div style={{display:'flex',gap:12}}>
              <ResponsiveContainer width="45%" height={120}>
                <PieChart>
                  <Pie data={EGG_SIZE} cx="50%" cy="50%" innerRadius={28} outerRadius={48}
                    dataKey="pct" nameKey="size">
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
                      <span style={{fontSize:10,color:C.muted,whiteSpace:'nowrap'}}>{s.size}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:60,height:5,background:'#21262d',borderRadius:3,overflow:'hidden'}}>
                        <div style={{width:`${s.pct/50*100}%`,height:'100%',background:s.color,borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:C.text,minWidth:28,textAlign:'right'}}>{s.pct}%</span>
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
