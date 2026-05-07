// Tiêu chuẩn giống gà đẻ trứng (theo ngày tuổi)
export const BREED_STD = {
  'ボリス': {
    name: 'ボリス', nameVi: 'Boris',
    color: '#f5a623', icon: '🟡',
    layRate: [[120,140,.60],[140,160,.78],[160,200,.90],[200,280,.92],[280,350,.88],[350,450,.82],[450,999,.74]],
    egWt:   [[120,160,55],[160,200,60],[200,280,63],[280,450,64],[450,999,65]],
    feed:   [[120,200,100],[200,350,112],[350,999,118]],
    fcr:    [[120,200,2.0],[200,350,2.1],[350,999,2.2]],
    water:  [[120,200,1.9],[200,999,2.0]],
    peakLay: 0.92, peakAge: '160〜200日',
  },
  'マリア': {
    name: 'マリア', nameVi: 'Maria',
    color: '#ec4899', icon: '🌸',
    layRate: [[120,140,.55],[140,160,.75],[160,200,.88],[200,280,.90],[280,350,.86],[350,450,.80],[450,999,.72]],
    egWt:   [[120,160,56],[160,200,61],[200,280,64],[280,450,65],[450,999,66]],
    feed:   [[120,200,102],[200,350,114],[350,999,120]],
    fcr:    [[120,200,2.05],[200,350,2.12],[350,999,2.25]],
    water:  [[120,200,1.95],[200,999,2.05]],
    peakLay: 0.90, peakAge: '160〜200日',
  },
  'ジュリアL': {
    name: 'ジュリアL', nameVi: 'Julia L',
    color: '#3b82f6', icon: '🔵',
    layRate: [[120,140,.58],[140,160,.80],[160,200,.93],[200,280,.95],[280,350,.91],[350,450,.85],[450,999,.76]],
    egWt:   [[120,160,54],[160,200,59],[200,280,62],[280,450,63],[450,999,64]],
    feed:   [[120,200,98],[200,350,110],[350,999,116]],
    fcr:    [[120,200,1.95],[200,350,2.05],[350,999,2.15]],
    water:  [[120,200,1.85],[200,999,1.95]],
    peakLay: 0.95, peakAge: '160〜200日',
  },
};

export function getStd(breed, field, age) {
  const std = BREED_STD[breed];
  if (!std) return null;
  const tbl = std[field];
  for (const [mn, mx, val] of tbl) {
    if (age >= mn && age < mx) return val;
  }
  return tbl[tbl.length - 1][2];
}

export const avg = arr => {
  const a = arr.filter(v => v != null && !isNaN(v) && v > 0);
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
};
export const sum = arr => arr.filter(v => v != null && !isNaN(v)).reduce((a, b) => a + b, 0);
export const fmt = (n, d = 0) => n == null || isNaN(n) ? '—' : n.toLocaleString('ja-JP', { maximumFractionDigits: d });
