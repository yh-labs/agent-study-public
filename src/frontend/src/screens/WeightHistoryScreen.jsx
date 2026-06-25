import { useApp } from '../context/AppContext';
import { anomalySet, mmdd } from '../utils/helpers';
import { LineChart } from '../utils/chart';

function seg(active) {
  return active
    ? { bg: '#fff', col: '#028090', fw: '600', sh: '0 1px 2px rgba(0,0,0,0.08)' }
    : { bg: 'transparent', col: '#64748B', fw: '500', sh: 'none' };
}

export default function WeightHistoryScreen() {
  const { state, set, nav } = useApp();
  const { weights, histRange } = state;
  const wAnom = anomalySet(weights);
  const histSeries = weights.slice(-histRange);

  const histList = [...histSeries].reverse().map((p, i, arr) => {
    const prev = i < arr.length - 1 ? arr[i + 1].value : null;
    let arrow = '—', ac = '#94A3B8';
    if (prev !== null) {
      if (p.value > prev) { arrow = '▲'; ac = '#16A34A'; }
      else if (p.value < prev) { arrow = '▼'; ac = '#DC2626'; }
    }
    return { date: p.date, val: p.value.toFixed(1), arrow, arrowColor: ac, dot: wAnom.has(p.date) ? '#DC2626' : '#02C39A' };
  });

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petScreen .3s ease' }}>
      <div style={{ flexShrink: 0, height: 52, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
        <button onClick={() => nav('home')} style={backBtn}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>체중 이력</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px' }}>
        {/* 범위 탭 */}
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {[7, 30, 90].map((r) => {
            const s = seg(histRange === r);
            return (
              <button key={r} onClick={() => set({ histRange: r })} style={{ flex: 1, height: 34, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: s.bg, color: s.col, fontWeight: s.fw, boxShadow: s.sh }}>
                {r}일
              </button>
            );
          })}
        </div>

        {/* 차트 */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '16px 12px 10px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <LineChart series={histSeries} color="#028090" gradientId="gHist" anomalySet={wAnom} />
        </div>

        {/* 목록 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 12 }}>날짜별 기록</div>
        {histList.map((it) => (
          <div key={it.date} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: it.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: '#64748B', flex: 1 }}>{it.date}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>{it.val} kg</span>
            <span style={{ fontSize: 13, color: it.arrowColor, fontWeight: 600, width: 14, textAlign: 'center' }}>{it.arrow}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const backBtn = {
  width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
