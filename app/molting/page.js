'use client';
import { useState, useMemo } from 'react';
import FarmLayout from '@/components/FarmLayout';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { MOLTING_STD, interpolate } from '@/lib/standards';

const C = {
  bg:'#0f1117', card:'#161b22', border:'#21262d',
  text:'#e6edf3', muted:'#8b949e',
  green:'#22c55e', red:'#ef4444', amber:'#f59e0b', blue:'#3b82f6',
};
const fmtNum = (n, d=1) => n==null?'—':Number(n).toLocaleString('vi-VN',{maximumFractionDigits:d});

// Build chart data from MOLTING_STD
const MOLT_CHART = MOLTING_STD.bodyWeightRatio.map(([day]) => ({
  day,
  procDay: MOLTING_STD.bodyWeightRatio.findIndex(([d])=>d===day),
  bw:   interpolate(MOLTING_STD.bodyWeightRatio, day),
  hd:   interpolate(MOLTING_STD.henDay,          day),
  feed: interpolate(MOLTING_STD.feed,            day),
  light:interpolate(MOLTING_STD.light,           day),
}));

// Mock actual data (flock undergoing molting at day 458 = process day 28)
const CURRENT_DAY = 458;
const MOCK_ACTUAL = {
  bodyWeightRatio: 77.8,
  henDay:          0,
  feed:            49.2,
  light:           8,
  me:              2700,
  cp:              13.0,
};

function ChartTip({ active, payload, label }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'#1e2630',border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 12px',fontSize:11}}>
      <div style={{color:C.muted,marginBottom:4}}>Ngày tuổi: {label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color}}>{p.name}: <b>{typeof p.value==='number'?p.value.toFixed(1):p.value}</b></div>
      ))}
    </div>
  );
}

function MoltingContent() {
  const stdAtCurrent = {
    bw:    interpolate(MOLTING_STD.bodyWeightRatio, CURRENT_DAY),
    hd:    interpolate(MOLTING_STD.henDay,          CURRENT_DAY),
    feed:  interpolate(MOLTING_STD.feed,            CURRENT_DAY),
    light: interpolate(MOLTING_STD.light,           CURRENT_DAY),
    me:    interpolate(MOLTING_STD.me,              CURRENT_DAY),
    cp:    interpolate(MOLTING_STD.cp,              CURRENT_DAY),
  };

  const currentPhase = MOLTING_STD.phases.find(p => CURRENT_DAY >= p.startDay && CURRENT_DAY <= p.endDay);

  return (
    <div style={{color:C.text}}>
      {/* Header */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:'14px 24px',
        display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40}}>
        <div>
          <div style={{fontSize:11,color:C.muted,marginBottom:2}}>Molting &rsaquo; Theo dõi ép thay lông</div>
          <div style={{fontSize:18,fontWeight:700}}>MOLTING (ÉP THAY LÔNG)</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:'5px 12px',fontSize:12,color:C.muted}}>
            Ngày hiện tại: <b style={{color:C.amber}}>Ngày tuổi {CURRENT_DAY}</b> (Process day {CURRENT_DAY-430})
          </div>
          <div style={{background:'rgba(245,158,11,.1)',border:'1px solid #f59e0b55',borderRadius:7,padding:'5px 12px',fontSize:12,color:C.amber,fontWeight:700}}>
            📍 {currentPhase?.name}
          </div>
        </div>
      </div>

      <div style={{padding:'16px 24px'}}>

        {/* Phase info cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
          {MOLTING_STD.phases.map(p => {
            const isActive = CURRENT_DAY >= p.startDay && CURRENT_DAY <= p.endDay;
            const isDone   = CURRENT_DAY > p.endDay;
            return (
              <div key={p.name} style={{
                background:C.card, border:`1px solid ${isActive?C.amber:C.border}`,
                borderRadius:10, padding:'12px 14px',
                borderTop: isActive?`3px solid ${C.amber}`: isDone?`3px solid ${C.green}`:`3px solid ${C.border}`,
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div style={{fontSize:12,fontWeight:700,color:isActive?C.amber:isDone?C.green:C.muted}}>{p.name}</div>
                  <span style={{fontSize:10,padding:'2px 7px',borderRadius:4,fontWeight:700,
                    background:isActive?'rgba(245,158,11,.15)':isDone?'rgba(34,197,94,.15)':'rgba(255,255,255,.05)',
                    color:isActive?C.amber:isDone?C.green:C.muted}}>
                    {isActive?'● Đang thực hiện':isDone?'✓ Hoàn thành':'Sắp tới'}
                  </span>
                </div>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Process: {p.processDays} ngày</div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>{p.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Current status KPIs */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px',marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.8,textTransform:'uppercase',marginBottom:10}}>
            Trạng thái hiện tại — Ngày {CURRENT_DAY} (Process day {CURRENT_DAY-430})
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10}}>
            {[
              { label:'Tỷ lệ thể trọng', actual:MOCK_ACTUAL.bodyWeightRatio, std:stdAtCurrent.bw, unit:'%', rev:false },
              { label:'Tỷ lệ đẻ',         actual:MOCK_ACTUAL.henDay,           std:stdAtCurrent.hd,  unit:'%', rev:false },
              { label:'Lượng cám',         actual:MOCK_ACTUAL.feed,             std:stdAtCurrent.feed,unit:'g', rev:false },
              { label:'Giờ chiếu sáng',   actual:MOCK_ACTUAL.light,            std:stdAtCurrent.light,unit:'h',rev:false },
              { label:'ME mục tiêu',       actual:MOCK_ACTUAL.me,               std:stdAtCurrent.me,  unit:'', rev:false },
              { label:'CP mục tiêu',       actual:MOCK_ACTUAL.cp,               std:stdAtCurrent.cp,  unit:'%',rev:false },
            ].map(k => {
              const d = k.actual - (k.std??0);
              const good = k.rev ? d<0 : d>=0;
              const dClr = Math.abs(d)<0.1?C.muted:good?C.green:C.red;
              return (
                <div key={k.label} style={{background:C.bg,borderRadius:8,border:`1px solid ${C.border}`,padding:'10px 12px'}}>
                  <div style={{fontSize:9.5,color:C.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4,letterSpacing:.7}}>{k.label}</div>
                  <div style={{fontSize:19,fontWeight:700,color:C.text}}>{fmtNum(k.actual,1)}<span style={{fontSize:11,color:C.muted,marginLeft:2}}>{k.unit}</span></div>
                  {k.std!=null && <div style={{fontSize:10,color:dClr,marginTop:3}}>Chuẩn: {fmtNum(k.std,1)}{k.unit} &nbsp;({d>=0?'+':''}{fmtNum(d,1)})</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          {/* BW ratio + HD chart */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.8,textTransform:'uppercase',marginBottom:10}}>Tỷ lệ thể trọng & Tỷ lệ đẻ</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MOLT_CHART} margin={{top:2,right:8,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="day" tick={{fill:C.muted,fontSize:9}} label={{value:'Ngày tuổi',position:'insideBottom',offset:-2,fill:C.muted,fontSize:9}} />
                <YAxis tick={{fill:C.muted,fontSize:9}} />
                <Tooltip content={<ChartTip/>} />
                <Legend wrapperStyle={{fontSize:9}} />
                <ReferenceLine x={CURRENT_DAY} stroke={C.amber} strokeDasharray="4 2" label={{value:'Hôm nay',fill:C.amber,fontSize:8}} />
                <Line type="monotone" dataKey="bw"   name="Thể trọng (%)" stroke={C.amber} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hd"   name="Tỷ lệ đẻ (%)" stroke={C.green} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Feed + Light chart */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.8,textTransform:'uppercase',marginBottom:10}}>Lượng cám & Chiếu sáng</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MOLT_CHART} margin={{top:2,right:8,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="day" tick={{fill:C.muted,fontSize:9}} label={{value:'Ngày tuổi',position:'insideBottom',offset:-2,fill:C.muted,fontSize:9}} />
                <YAxis yAxisId="feed" tick={{fill:C.muted,fontSize:9}} />
                <YAxis yAxisId="light" orientation="right" domain={[0,18]} tick={{fill:C.muted,fontSize:9}} />
                <Tooltip content={<ChartTip/>} />
                <Legend wrapperStyle={{fontSize:9}} />
                <ReferenceLine yAxisId="feed" x={CURRENT_DAY} stroke={C.amber} strokeDasharray="4 2" />
                <Line yAxisId="feed"  type="monotone" dataKey="feed"  name="Cám (g/con)" stroke={C.blue}  strokeWidth={2} dot={false} />
                <Line yAxisId="light" type="monotone" dataKey="light" name="Sáng (h)"    stroke={C.amber} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Molting standard table */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px'}}>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.8,textTransform:'uppercase',marginBottom:10}}>
            Bảng chuẩn molting chi tiết (Process day 0–60)
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,minWidth:700}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {['Ngày tuổi','Process Day','Giai đoạn','Thể trọng %','Tỷ lệ đẻ %','Cám (g)','Sáng (h)','ME','CP %'].map(h=>(
                    <th key={h} style={{padding:'6px 8px',textAlign:'left',color:C.muted,fontSize:9.5,fontWeight:600,whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOLT_CHART.filter((_,i)=>i%3===0).map(row=>{
                  const isToday = row.day === CURRENT_DAY;
                  const phase   = MOLTING_STD.phases.find(p=>row.day>=p.startDay&&row.day<=p.endDay);
                  const me = interpolate(MOLTING_STD.me, row.day);
                  const cp = interpolate(MOLTING_STD.cp, row.day);
                  return (
                    <tr key={row.day} style={{
                      borderBottom:`1px solid ${C.border}`,
                      background:isToday?'rgba(245,158,11,.08)':'transparent',
                    }}>
                      <td style={{padding:'5px 8px',fontWeight:isToday?700:400,color:isToday?C.amber:C.text}}>{row.day}{isToday?' ◀':''}</td>
                      <td style={{padding:'5px 8px',color:C.muted}}>{row.day-430}</td>
                      <td style={{padding:'5px 8px',color:C.text,fontSize:10}}>{phase?.name??'—'}</td>
                      <td style={{padding:'5px 8px',color:C.text}}>{fmtNum(row.bw,1)}%</td>
                      <td style={{padding:'5px 8px',color:row.hd>0?C.green:C.muted}}>{fmtNum(row.hd,1)}%</td>
                      <td style={{padding:'5px 8px',color:C.text}}>{fmtNum(row.feed,0)}</td>
                      <td style={{padding:'5px 8px',color:C.text}}>{fmtNum(row.light,1)}</td>
                      <td style={{padding:'5px 8px',color:C.muted}}>{me>0?me:'—'}</td>
                      <td style={{padding:'5px 8px',color:C.muted}}>{cp>0?cp.toFixed(1):'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MoltingPage() {
  return <FarmLayout><MoltingContent /></FarmLayout>;
}
