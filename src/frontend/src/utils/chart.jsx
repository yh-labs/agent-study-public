'use client';

import { mmdd } from './helpers';

export function LineChart({ series, color = '#028090', gradientId, anomalySet }) {
  if (!series || series.length === 0) {
    return (
      <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: 13 }}>
        체중을 기록하면 추이를 볼 수 있어요
      </div>
    );
  }

  if (series.length === 1) {
    return (
      <div style={{ height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B' }}>{series[0].value.toFixed(1)} kg</div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>{series[0].date}</div>
        <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>기록이 쌓이면 추이 차트가 표시됩니다</div>
      </div>
    );
  }

  const W = 311, H = 150, padT = 14, padB = 24, padX = 6;
  const n = series.length;
  const xs = series.map((_, i) => padX + (i / (n - 1)) * (W - padX * 2));
  const vals = series.map((p) => p.value);
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if (mn === mx) { mn -= 1; mx += 1; }
  let rng = mx - mn;
  mn -= rng * 0.25;
  mx += rng * 0.25;
  const yOf = (v) => padT + (1 - (v - mn) / (mx - mn)) * (H - padT - padB);
  const pts = xs.map((x, i) => [x, yOf(vals[i])]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${xs[n - 1].toFixed(1)} ${H - padB} L${xs[0].toFixed(1)} ${H - padB} Z`;

  const grid = [0, 0.5, 1].map((t, i) => (
    <line
      key={'g' + i}
      x1={padX} x2={W - padX}
      y1={(padT + t * (H - padT - padB)).toFixed(1)}
      y2={(padT + t * (H - padT - padB)).toFixed(1)}
      stroke="#EEF2F6" strokeWidth={1} strokeDasharray="2 5"
    />
  ));

  const dots = pts.map((p, i) => {
    const isAnom = anomalySet && anomalySet.has(series[i].date);
    if (isAnom) return (
      <g key={'d' + i}>
        <circle cx={p[0]} cy={p[1]} r={7} fill="#DC2626" opacity={0.18} />
        <circle cx={p[0]} cy={p[1]} r={4} fill="#DC2626" />
      </g>
    );
    if (i === n - 1) return (
      <circle key={'d' + i} cx={p[0]} cy={p[1]} r={4.5} fill={color} stroke="#fff" strokeWidth={2} />
    );
    return null;
  });

  const labelIdxs = [0, Math.floor((n - 1) / 2), n - 1];
  const labels = labelIdxs.map((idx, i) => (
    <text
      key={'l' + i}
      x={Math.min(Math.max(xs[idx], 10), W - 10)}
      y={H - 6}
      fontSize={10}
      fill="#94A3B8"
      textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}
      fontFamily="Inter"
    >
      {mmdd(series[idx].date)}
    </text>
  ));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1={0} y1={0} x2={0} y2={1}>
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {grid}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      {dots}
      {labels}
    </svg>
  );
}
