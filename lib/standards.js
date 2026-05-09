// ══════════════════════════════════════════════════════════════
// FARMTRACK — Breed Standard Database
// Giống: Maria | Borisu | Julialai
// ══════════════════════════════════════════════════════════════

export function getPhase(age) {
  if (age <= 42)  return 'Ủm';
  if (age <= 112) return 'Hậu ủm';
  if (age <= 182) return 'Sinh trưởng';
  if (age <= 250) return 'Peak';
  if (age <= 350) return 'Post Peak';
  return 'Late Production';
}

export const PHASES = [
  { name: 'Ủm',             minAge: 0,   maxAge: 42  },
  { name: 'Hậu ủm',        minAge: 43,  maxAge: 112 },
  { name: 'Sinh trưởng',   minAge: 113, maxAge: 182 },
  { name: 'Peak',           minAge: 183, maxAge: 250 },
  { name: 'Post Peak',      minAge: 251, maxAge: 350 },
  { name: 'Late Production',minAge: 351, maxAge: 700 },
];

export function interpolate(curve, age) {
  if (!curve || curve.length === 0) return null;
  if (age <= curve[0][0]) return curve[0][1];
  if (age >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];
  for (let i = 0; i < curve.length - 1; i++) {
    const [a1, v1] = curve[i];
    const [a2, v2] = curve[i + 1];
    if (age >= a1 && age <= a2) {
      const t = (age - a1) / (a2 - a1);
      return +(v1 + t * (v2 - v1)).toFixed(3);
    }
  }
  return curve[curve.length - 1][1];
}

export function getCurveData(breedKey, field, minAge = 140, maxAge = 580, step = 10) {
  const breed = BREED_STANDARDS[breedKey];
  if (!breed || !breed[field]) return [];
  const result = [];
  for (let age = minAge; age <= maxAge; age += step) {
    result.push({ age, std: interpolate(breed[field], age) });
  }
  return result;
}

export const BREED_STANDARDS = {
  Maria: {
    name: 'Maria', color: '#ec4899', colorLight: '#fce7f3',
    henDay: [
      [120,0],[140,15],[150,45],[160,72],[170,85],[180,90],[190,92],
      [200,93],[210,93],[220,92.8],[230,92.5],[240,92.3],[250,91.8],
      [260,91.5],[270,91.2],[280,91.0],[290,92.0],[300,92.3],[310,91.5],
      [320,91.0],[330,90.5],[340,90.0],[350,89.5],
      [370,88.5],[400,87.0],[430,85.0],[460,83.0],[500,80.0],[540,76.0],[580,72.0],
    ],
    eggWeight: [
      [140,44],[150,48],[160,53],[170,57],[180,60],[190,62],
      [200,63],[220,64],[250,64.3],[280,64.5],[300,64.5],
      [320,65.0],[350,65.5],[400,66.0],[450,66.5],[500,67.0],[550,67.0],
    ],
    eggMass: [
      [150,5],[160,38],[170,49],[180,54],[190,57],[200,58.8],
      [220,59.5],[250,59.3],[280,59.5],[300,59.0],[320,59.5],
      [350,58.7],[400,57.4],[450,55.2],[500,53.6],[550,50.9],
    ],
    feedIntake: [
      [120,80],[140,90],[160,100],[180,110],[200,115],[220,117],
      [250,118],[280,120],[300,122],[320,121],[350,120],
      [400,119],[450,118],[500,117],[550,116],
    ],
    waterIntake: [
      [120,165],[160,195],[200,215],[250,220],[300,225],
      [350,224],[400,222],[450,220],[500,218],
    ],
    fcr: [
      [160,3.0],[180,2.3],[200,2.1],[220,2.1],[250,2.12],
      [280,2.15],[300,2.18],[320,2.20],[350,2.22],[400,2.28],[450,2.35],
    ],
    pcr: [
      [160,2.8],[180,1.90],[200,1.70],[220,1.65],[250,1.60],
      [280,1.61],[300,1.62],[320,1.64],[350,1.67],[400,1.74],[450,1.82],
    ],
    mortality: [
      [0,0.020],[120,0.020],[180,0.025],[250,0.030],[350,0.035],[450,0.045],[550,0.055],
    ],
    phaseSurvival: [
      { phase:'Ủm',           minAge:0,   maxAge:42,  survival:98.80 },
      { phase:'Hậu ủm',      minAge:43,  maxAge:112, survival:98.40 },
      { phase:'Sinh trưởng', minAge:113, maxAge:182, survival:97.40 },
      { phase:'Peak',         minAge:183, maxAge:250, survival:96.60 },
      { phase:'Post Peak',    minAge:251, maxAge:350, survival:96.20 },
      { phase:'Late Prod.',   minAge:351, maxAge:700, survival:95.00 },
    ],
    nutrition: {
      'Sinh trưởng':   { ME:2800, CP:15.5, Lys:0.75, Met:0.36, Ca:1.0,  P:0.45 },
      'Peak':           { ME:2900, CP:17.5, Lys:0.90, Met:0.42, Ca:3.8,  P:0.42 },
      'Post Peak':      { ME:2900, CP:17.0, Lys:0.85, Met:0.40, Ca:4.0,  P:0.40 },
      'Late Production':{ ME:2850, CP:16.5, Lys:0.80, Met:0.38, Ca:4.2,  P:0.38 },
    },
    eggQuality: { dirtyEggMax:2.00, crackedEggMax:1.00, saleableMin:95.0, gradeOutMax:5.00 },
    eggSizeDist: {
      200: { S:8,  M:22, L:35, LL:28, XL:6,  Jumbo:1 },
      250: { S:4,  M:15, L:30, LL:36, XL:12, Jumbo:3 },
      300: { S:2,  M:10, L:28, LL:38, XL:16, Jumbo:6 },
      350: { S:1,  M:7,  L:22, LL:38, XL:22, Jumbo:10},
      400: { S:1,  M:5,  L:18, LL:36, XL:28, Jumbo:12},
      500: { S:0,  M:3,  L:12, LL:32, XL:34, Jumbo:19},
    },
  },

  Borisu: {
    name: 'Borisu', color: '#f59e0b', colorLight: '#fef3c7',
    henDay: [
      [120,0],[140,12],[150,40],[160,68],[170,82],[180,88],[190,90],
      [200,92],[210,92],[220,91.8],[230,91.5],[240,91.0],[250,90.5],
      [270,90.0],[290,90.5],[300,90.5],[310,90.0],[330,89.0],[350,88.0],
      [370,87.0],[400,85.5],[430,83.0],[460,81.0],[500,78.0],[540,74.0],[580,70.0],
    ],
    eggWeight: [
      [140,43],[150,47],[160,52],[170,56],[180,59],[190,61],
      [200,62],[220,63],[250,63.5],[280,64.0],[300,64.0],
      [320,64.5],[350,65.0],[400,65.5],[450,66.0],[500,66.5],[550,67.0],
    ],
    eggMass: [
      [150,4],[160,35],[170,46],[180,52],[190,55],[200,57],
      [220,58],[250,57.5],[280,58],[300,58.0],[320,58.2],
      [350,57.4],[400,55.9],[450,53.5],[500,51.5],[550,48.9],
    ],
    feedIntake: [
      [120,78],[140,88],[160,98],[180,108],[200,113],[220,115],
      [250,116],[280,118],[300,120],[320,119],[350,118],[400,117],[450,116],
    ],
    waterIntake: [
      [120,160],[160,188],[200,210],[250,215],[300,220],[350,219],[400,217],[450,215],
    ],
    fcr: [
      [160,3.1],[180,2.35],[200,2.15],[220,2.12],[250,2.15],
      [280,2.18],[300,2.20],[320,2.22],[350,2.25],[400,2.32],[450,2.40],
    ],
    pcr: [
      [160,2.9],[180,1.95],[200,1.75],[220,1.70],[250,1.67],
      [280,1.68],[300,1.68],[320,1.70],[350,1.74],[400,1.82],[450,1.90],
    ],
    mortality: [
      [0,0.025],[120,0.025],[180,0.028],[250,0.033],[350,0.038],[450,0.048],[550,0.058],
    ],
    phaseSurvival: [
      { phase:'Ủm',           minAge:0,   maxAge:42,  survival:98.60 },
      { phase:'Hậu ủm',      minAge:43,  maxAge:112, survival:98.20 },
      { phase:'Sinh trưởng', minAge:113, maxAge:182, survival:97.20 },
      { phase:'Peak',         minAge:183, maxAge:250, survival:96.40 },
      { phase:'Post Peak',    minAge:251, maxAge:350, survival:95.80 },
      { phase:'Late Prod.',   minAge:351, maxAge:700, survival:94.60 },
    ],
    nutrition: {
      'Sinh trưởng':   { ME:2780, CP:15.0, Lys:0.72, Met:0.34, Ca:1.0, P:0.44 },
      'Peak':           { ME:2880, CP:17.0, Lys:0.87, Met:0.40, Ca:3.7, P:0.40 },
      'Post Peak':      { ME:2880, CP:16.5, Lys:0.82, Met:0.38, Ca:3.9, P:0.38 },
      'Late Production':{ ME:2830, CP:16.0, Lys:0.78, Met:0.36, Ca:4.1, P:0.36 },
    },
    eggQuality: { dirtyEggMax:2.20, crackedEggMax:1.20, saleableMin:94.5, gradeOutMax:5.50 },
    eggSizeDist: {
      200: { S:10, M:25, L:35, LL:22, XL:7,  Jumbo:1 },
      250: { S:6,  M:18, L:32, LL:30, XL:12, Jumbo:2 },
      300: { S:3,  M:12, L:28, LL:35, XL:17, Jumbo:5 },
      350: { S:1,  M:8,  L:23, LL:36, XL:22, Jumbo:10},
      400: { S:1,  M:5,  L:19, LL:35, XL:28, Jumbo:12},
    },
  },

  Julialai: {
    name: 'Julialai', color: '#3b82f6', colorLight: '#dbeafe',
    henDay: [
      [120,0],[140,18],[150,50],[160,78],[170,88],[180,92],[190,94],
      [200,95],[210,95],[220,94.8],[230,94.5],[240,94.0],[250,93.5],
      [270,93.0],[290,93.5],[300,93.5],[310,93.0],[330,92.0],[350,91.0],
      [370,90.0],[400,88.5],[430,86.0],[460,84.0],[500,81.0],[540,77.0],[580,73.0],
    ],
    eggWeight: [
      [140,42],[150,46],[160,51],[170,54],[180,57],[190,59],
      [200,60],[220,61],[250,61.5],[280,62.0],[300,62.0],
      [320,62.5],[350,63.0],[400,63.5],[450,64.0],[500,64.5],[550,65.0],
    ],
    eggMass: [
      [150,6],[160,40],[170,52],[180,57],[190,60],[200,57],
      [220,57.8],[250,57.5],[280,58.0],[300,58.0],[320,58.2],
      [350,57.3],[400,55.7],[450,54.0],[500,52.2],[550,49.5],
    ],
    feedIntake: [
      [120,76],[140,86],[160,96],[180,106],[200,111],[220,113],
      [250,114],[280,116],[300,118],[320,117],[350,116],[400,115],[450,114],
    ],
    waterIntake: [
      [120,158],[160,182],[200,205],[250,210],[300,216],[350,215],[400,213],[450,211],
    ],
    fcr: [
      [160,2.9],[180,2.10],[200,1.95],[220,1.92],[250,1.95],
      [280,1.98],[300,2.00],[320,2.02],[350,2.05],[400,2.12],[450,2.20],
    ],
    pcr: [
      [160,2.6],[180,1.75],[200,1.55],[220,1.50],[250,1.48],
      [280,1.50],[300,1.50],[320,1.52],[350,1.56],[400,1.63],[450,1.70],
    ],
    mortality: [
      [0,0.018],[120,0.018],[180,0.022],[250,0.028],[350,0.032],[450,0.040],[550,0.050],
    ],
    phaseSurvival: [
      { phase:'Ủm',           minAge:0,   maxAge:42,  survival:99.00 },
      { phase:'Hậu ủm',      minAge:43,  maxAge:112, survival:98.60 },
      { phase:'Sinh trưởng', minAge:113, maxAge:182, survival:97.60 },
      { phase:'Peak',         minAge:183, maxAge:250, survival:96.80 },
      { phase:'Post Peak',    minAge:251, maxAge:350, survival:96.40 },
      { phase:'Late Prod.',   minAge:351, maxAge:700, survival:95.20 },
    ],
    nutrition: {
      'Sinh trưởng':   { ME:2820, CP:16.0, Lys:0.78, Met:0.38, Ca:1.0, P:0.46 },
      'Peak':           { ME:2920, CP:18.0, Lys:0.93, Met:0.44, Ca:3.9, P:0.44 },
      'Post Peak':      { ME:2920, CP:17.5, Lys:0.88, Met:0.42, Ca:4.1, P:0.42 },
      'Late Production':{ ME:2870, CP:17.0, Lys:0.83, Met:0.40, Ca:4.3, P:0.40 },
    },
    eggQuality: { dirtyEggMax:1.80, crackedEggMax:0.80, saleableMin:95.5, gradeOutMax:4.50 },
    eggSizeDist: {
      200: { S:15, M:30, L:35, LL:15, XL:4,  Jumbo:1 },
      250: { S:8,  M:22, L:35, LL:26, XL:8,  Jumbo:1 },
      300: { S:4,  M:14, L:30, LL:35, XL:14, Jumbo:3 },
      350: { S:2,  M:10, L:25, LL:36, XL:20, Jumbo:7 },
      400: { S:1,  M:6,  L:20, LL:36, XL:26, Jumbo:11},
    },
  },
};

export function getStd(breedKey, field, age) {
  const breed = BREED_STANDARDS[breedKey];
  if (!breed || !breed[field]) return null;
  return interpolate(breed[field], age);
}

export function getNutritionStd(breedKey, phase) {
  return BREED_STANDARDS[breedKey]?.nutrition?.[phase] ?? null;
}

export function getEggSizeStd(breedKey, age) {
  const dist = BREED_STANDARDS[breedKey]?.eggSizeDist;
  if (!dist) return null;
  const ages = Object.keys(dist).map(Number).sort((a, b) => a - b);
  let closest = ages[0];
  let minDiff = Math.abs(age - ages[0]);
  for (const a of ages) {
    const diff = Math.abs(age - a);
    if (diff < minDiff) { minDiff = diff; closest = a; }
  }
  return dist[closest];
}

export const avg = arr => {
  const a = arr.filter(v => v != null && !isNaN(v) && v > 0);
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
};
export const sum = arr => arr.filter(v => v != null && !isNaN(v)).reduce((a, b) => a + b, 0);
export const fmt = (n, d = 0) => n == null || isNaN(n) ? '—' : Number(n).toLocaleString('vi-VN', { maximumFractionDigits: d });
