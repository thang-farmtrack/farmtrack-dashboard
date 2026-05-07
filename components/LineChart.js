'use client';
export default function LineChart({ data, color='#f5a623', height=110, formatY, stdData, stdColor }) {
  if (!data || data.length < 2) {
    return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--mu)', fontSize:11 }}>データなし</div>;
  }
  const W = Math.max(data.length * 20, 440);
  const H = height;
  const pad = { t:12, b:22, l:4, r:8 };
  const vals = data.map(d => d.val).filter(v => v != null);
  const mn = Math.min(...vals) * 0.96;
  const mx = Math.max(...vals) * 1.04;
  const toX = i => pad.l + (i / (data.length - 1 || 1)) * (W - pad.l - pad.r);
  const toY = v => pad.t + (1 - (v - mn) / (mx - mn || 1)) * (H - pad.t - pad.b);
  const pts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.val).toFixed(1)}`).join(' ');
  const area = `M${toX(0)},${H - pad.b} ` +
    data.map((d, i) => `L${toX(i).toFixed(1)},${toY(d.val).toFixed(1)}`).join(' ') +
    ` L${toX(data.length - 1)},${H - pad.b} Z`;
  const step = Math.max(1, Math.floor(data.length / 7));
  const xlabels = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map(d => {
      const idx = data.indexOf(d);
      const lbl = (d.date || '').slice(5).replace('-', '/');
      return `<text x="${toX(idx).toFixed(1)}" y="${H}" text-anchor="middle" style="font-family:monospace;font-size:8px;fill:var(--mu)">${lbl}</text>`;
    }).join('');
  const gradId = `g${color.replace('#', '')}`;
  let stdLine = '';
  if (stdData && stdData.length >= 2) {
    const sPts = stdData.map((d, i) => `${toX(i).toFixed(1)},${toY(Math.max(mn, Math.min(mx, d.val))).toFixed(1)}`).join(' ');
    stdLine = `<polyline points="${sPts}" fill="none" stroke="${stdColor || '#607080'}" stroke-dasharray="5,3" stroke-width="1.5" opacity=".7"/>`;
  }
  return (
    <div style={{ overflowX:'auto' }}>
      <svg width={W} height={H} style={{ display:'block', minWidth:'100%' }}
        dangerouslySetInnerHTML={{ __html: `
          <defs>
            <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${color}" stop-opacity=".3"/>
              <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <line x1="${pad.l}" y1="${H - pad.b}" x2="${W - pad.r}" y2="${H - pad.b}" stroke="var(--bd)" stroke-width=".5"/>
          <path d="${area}" fill="url(#${gradId})"/>
          <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
          ${stdLine}
          ${xlabels}
        `}}
      />
    </div>
  );
}
