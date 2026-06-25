'use client';

import { useApp } from '@/context/AppContext';

const REPORT_INFO = {
  '2026-05': { bar: '2026년 5월 리포트', avgW: '4.9', dW: '▼ 0.1 kg', dWup: false, avgWa: '138', dWa: '▲ 8 ml', dWaup: true, anom: [{ d: '5월 12일', p: '7일 평균 대비 -11.2%' }], wcov: '28일 / 31일', wacov: '25일 / 31일' },
  '2026-04': { bar: '2026년 4월 리포트', avgW: '5.0', dW: '▼ 0.1 kg', dWup: false, avgWa: '130', dWa: '▲ 5 ml', dWaup: true, anom: [], wcov: '26일 / 30일', wacov: '22일 / 30일' },
  '2026-03': { bar: '2026년 3월 리포트', avgW: '5.1', dW: '— 0.0 kg', dWup: true, avgWa: '125', dWa: '▲ 3 ml', dWaup: true, anom: [], wcov: '24일 / 31일', wacov: '20일 / 31일' },
};
const REPORT_ORDER = ['2026-05', '2026-04', '2026-03'];

export { REPORT_INFO, REPORT_ORDER };

export default function ReportsScreen() {
  const { state, set } = useApp();
  const { profile } = state;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petFade .3s ease' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 8px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>리포트</div>
        <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          {profile.name}의 건강 리포트, 매월 1일 자동으로 생성됩니다
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px' }}>
        {REPORT_ORDER.map((key) => {
          const r = REPORT_INFO[key];
          return (
            <div key={key} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>{r.bar.replace(' 리포트', '')}</div>
                <button
                  onClick={() => set({ screen: 'detail', reportMonth: key, reportTab: 'weight' })}
                  style={{ border: 'none', background: 'none', color: '#028090', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  보기
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#028090" strokeWidth={2} strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>평균 체중</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>{r.avgW} kg</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>평균 음수량</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>{r.avgWa} ml</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
