'use client';
export default function BarChart({ data, color='#ef4444', height=100 }) {
  if (!data || !data.length) {
    return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--mu)', fontSize:11 }}>データなし</div>;
  }
  const W = Math.max(data.length * 22, 440);
  const H = height;
  const pad = { t:8, b:22, l:4, r:4 };
  const mx = Math.max(...data.map(d => d.val || 0)) * 1.1 || 1;
  const barW = Math.min(16, (W - pad.l - pad.r) / data.length * 0.7);
  const toX = i => pad.l + (i / (data.length - 1 || 1)) * (W - pad.l - pad.r);
  const toH = v => ((v || 0) / mx) * (H - pad.t - pad.b);
  const step = Math.max(1, Math.floor(data.length / 7));
  const xlabels = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map(d => {
      const idx = data.indexOf(d);
      const lbl = (d.date || '').slice(5).replace('-', '/');
      return `<text x="${toX(idx).toFixed(1)}" y="${H}" text-anchor="middle" style="font-family:monospace;font-size:8px;fill:var(--mu)">${lbl}</text>`;
    }).join('');
  const bars = data.map((d, i) => {
    const h = toH(d.val);
    const x = toX(i) - barW / 2;
    const y = H - pad.b - h;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" rx="2" fill="${color}" opacity="${d.val > 0 ? '1' : '0.3'}"/>`;
  }).join('');
  return (
    <div style={{ overflowX:'auto' }}>
      <svg width={W} height={H} style={{ display:'block', minWidth:'100%' }}
        dangerouslySetInnerHTML={{ __html: `
          <line x1="${pad.l}" y1="${H - pad.b}" x2="${W - pad.r}" y2="${H - pad.b}" stroke="var(--bd)" stroke-width=".5"/>
          ${bars}${xlabels}
        `}}
      />
    </div>
  );
}
