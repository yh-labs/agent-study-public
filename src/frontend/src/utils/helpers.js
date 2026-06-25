const pad = (n) => String(n).padStart(2, '0');

export const ymd = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const TODAY = ymd(new Date());

export function generateDemoData(today = TODAY) {
  const weights = [];
  const waters = [];
  const base = new Date(today + 'T00:00:00');

  for (let i = 89; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const date = ymd(d);
    const w = 4.85 + (i / 89) * 0.3 + Math.sin(i * 1.7) * 0.045;
    weights.push({ date, value: Math.round(w * 10) / 10 });
    const wa = 145 + Math.round(Math.sin(i * 0.9) * 14 + Math.cos(i * 0.5) * 6);
    waters.push({ date, value: wa });
  }

  weights[89].value = 4.8;
  weights[88].value = 4.9;
  weights[87].value = 4.9;
  weights[86].value = 5.0;
  weights[79].value = 4.4;
  weights[78].value = 4.6;
  waters[89].value = 120;
  waters[88].value = 128;

  return { weights, waters };
}

export function anomalySet(arr) {
  const s = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (i < 3) continue;
    const win = arr.slice(Math.max(0, i - 7), i);
    const avg = win.reduce((a, b) => a + b.value, 0) / win.length;
    if (arr[i].value <= avg * 0.9) s.add(arr[i].date);
  }
  return s;
}

export function upsert(arr, date, value) {
  const a = arr.map((x) => ({ ...x }));
  const i = a.findIndex((x) => x.date === date);
  if (i >= 0) a[i].value = value;
  else {
    a.push({ date, value });
    a.sort((x, y) => (x.date < y.date ? -1 : 1));
  }
  return a;
}

export function ageOf(birth, today = TODAY) {
  if (!birth) return '-';
  const p = birth.split('.').map((s) => parseInt(s));
  if (p.length < 3 || !p[0]) return '-';
  const b = new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
  const t = new Date(today);
  let m =
    (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) m--;
  return `${Math.floor(m / 12)}세 ${m % 12}개월`;
}

export function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h < 12 ? '오전' : '오후';
  const hr = h % 12 || 12;
  return `${ap} ${hr}:${String(m).padStart(2, '0')}`;
}

export function mmdd(date) {
  const p = date.split('-');
  return `${parseInt(p[1])}.${parseInt(p[2])}`;
}
