#!/usr/bin/env node
// Regenerates the traction chart (v6/slide-6.html) from growth-dashboard data.
//
// Usage: node scripts/update-traction-chart.js <data.json>
//
// data.json shape:
// {
//   "weeks": [{ "date": "2026-06-01", "value": 5 }, ...],   // onboarded-population WAU, oldest first
//   "onboardedTotal": 253,
//   "registeredTotal": 736,
//   "sourceDate": "Aug 1, 2026"
// }

const fs = require('fs');
const path = require('path');

const dataPath = process.argv[2];
if (!dataPath) {
  console.error('Usage: node scripts/update-traction-chart.js <data.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const { weeks, onboardedTotal, registeredTotal, sourceDate } = data;

if (!Array.isArray(weeks) || weeks.length < 2) {
  console.error('weeks must be an array of at least 2 {date, value} entries');
  process.exit(1);
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// --- Layout constants (match the original hand-built chart) ---
const X_START = 110;
const X_END = 950;
const Y_TOP = 100;    // pixel y of the topmost gridline (value = chartTop)
const Y_BASE = 480;   // pixel y of the baseline (value = 0)
const AXIS_LABEL_X = 58;

const values = weeks.map(w => w.value);
const maxValue = Math.max(...values);

// Pick a "nice" top-of-chart value with ~10% headroom above the max data point,
// rounded to a step that divides evenly by 3 (gridlines are drawn at thirds).
const target = maxValue * 1.1;
const step = target >= 300 ? 90 : target >= 30 ? 30 : target >= 3 ? 3 : 1;
const chartTop = Math.ceil(target / step) * step;

const pxPerUnit = (Y_BASE - Y_TOP) / chartTop;
const yFor = (value) => +(Y_BASE - value * pxPerUnit).toFixed(1);

// x positions evenly spaced across the plot width
const n = weeks.length;
const xFor = (i) => +(X_START + i * ((X_END - X_START) / (n - 1))).toFixed(1);

const points = weeks.map((w, i) => ({ x: xFor(i), y: yFor(w.value), value: w.value }));

// --- Gridlines: chartTop, 2/3 chartTop, 1/3 chartTop, 0 ---
const gridValues = [chartTop, (chartTop * 2) / 3, chartTop / 3, 0];
const gridYs = gridValues.map((v) => +(Y_BASE - v * pxPerUnit).toFixed(1));

const internalGridlines = gridYs.slice(0, 3).map(
  (y) => `          <line x1="70" y1="${y}" x2="1000" y2="${y}"/>`
).join('\n');

const axisLabels = gridValues.map((v, i) => {
  const y = gridYs[i] + 5; // small offset so text sits on the line, matches original (+5)
  return `          <text x="${AXIS_LABEL_X}" y="${y}">${Math.round(v)}</text>`;
}).join('\n');

// --- Path + circles ---
const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
const fillPath = `${linePath} L${points[n - 1].x},${Y_BASE} L${points[0].x},${Y_BASE} Z`;

const circles = points.map((p, i) => {
  const r = i === n - 1 ? 9 : 6;
  return `          <circle cx="${p.x}" cy="${p.y}" r="${r}"/>`;
}).join('\n');

// --- First/last value labels ---
const first = points[0];
const last = points[n - 1];
const round1 = (v) => +v.toFixed(1);
const firstLabel = `        <text x="${round1(first.x)}" y="${round1(first.y - 18)}" fill="#999999" font-size="17" font-weight="600" text-anchor="middle">${first.value}</text>`;
const lastLabel = `        <text x="${round1(last.x + 14)}" y="${round1(last.y - 13.5)}" fill="#FFFFFF" font-size="34" font-weight="800" text-anchor="start">${last.value}</text>`;

// --- X-axis week labels ---
const weekLabels = weeks.map((w, i) => {
  const label = i === 0 ? `Week of ${formatDate(w.date)}` : formatDate(w.date);
  return `          <text x="${points[i].x}" y="508">${label}</text>`;
}).join('\n');

const ariaLabel = `Weekly active members by week: ${values.join(', ')}`;

const svg = `<svg viewBox="0 0 1020 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${ariaLabel}">
        <defs>
          <linearGradient id="s6goldfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#D4A574" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#D4A574" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <g stroke="#242424" stroke-width="1">
${internalGridlines}
        </g>
        <line x1="70" y1="${Y_BASE}" x2="1000" y2="${Y_BASE}" stroke="#404040" stroke-width="1.5"/>
        <g fill="#737373" font-size="15" text-anchor="end">
${axisLabels}
        </g>
        <path d="${fillPath}" fill="url(#s6goldfill)"/>
        <path d="${linePath}" fill="none" stroke="#D4A574" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <g fill="#D4A574" stroke="#0D0D0D" stroke-width="2.5">
${circles}
        </g>
${firstLabel}
${lastLabel}
        <g fill="#737373" font-size="14" text-anchor="middle">
${weekLabels}
        </g>
      </svg>`;

// --- Splice into slide-6.html ---
const slidePath = path.join(__dirname, '..', 'v6', 'slide-6.html');
let html = fs.readFileSync(slidePath, 'utf8');

html = html.replace(/<svg viewBox="0 0 1020 520"[\s\S]*?<\/svg>/, svg);

html = html.replace(
  /(<div class="s6-stat-num">)\d+(<\/div>\s*<div class="s6-stat-label">fully onboarded)/,
  `$1${onboardedTotal}$2`
);
html = html.replace(
  /(<div class="s6-stat-num">)\d+(<\/div>\s*<div class="s6-stat-label">registered since)/,
  `$1${registeredTotal}$2`
);
html = html.replace(
  /(How it's going: )\d+( weekly active members and rising\.)/,
  `$1${last.value}$2`
);
html = html.replace(
  /Referna growth dashboard \([^)]*\)/,
  `Referna growth dashboard (${sourceDate})`
);

fs.writeFileSync(slidePath, html);
console.log(`Updated ${slidePath}`);
console.log(`Chart: ${values.join(', ')} (top=${chartTop})`);
console.log(`Onboarded: ${onboardedTotal} · Registered: ${registeredTotal} · Source: ${sourceDate}`);
