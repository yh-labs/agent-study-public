'use client';

import { useApp } from '@/context/AppContext';
import { anomalySet } from '@/utils/helpers';
import { LineChart } from '@/utils/chart';

function SegBtn({ seg, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, height: 34, border: 'none', borderRadius: 8, cursor: 'pointer',
        fontSize: 13,
        background: seg.bg, color: seg.col, fontWeight: seg.fw, boxShadow: seg.sh,
        transition: 'background .2s',
      }}
    >
      {children}
    </button>
  );
}

function seg(active) {
  return active
    ? { bg: '#fff', col: '#028090', fw: '600', sh: '0 1px 2px rgba(0,0,0,0.08)' }
    : { bg: 'transparent', col: '#64748B', fw: '500', sh: 'none' };
}

export default function HomeScreen() {
  const { state, set, nav, showToast } = useApp();
  const { weights, waters, homeRange, profile } = state;

  const lastW = weights[weights.length - 1].value;
  const prevW = weights[weights.length - 2].value;
  const lastWa = waters[waters.length - 1].value;
  const wDelta = Math.round((lastW - prevW) * 10) / 10;
  const wRecLow = Math.round(lastW * 27);
  const wRecHigh = Math.round(lastW * 35.4);
  const waterBelow = lastWa < wRecLow;
  const wAnom = anomalySet(weights);

  const homeSeries = weights.slice(-homeRange);
  const wDeltaColor = wDelta > 0 ? '#16A34A' : wDelta < 0 ? '#DC2626' : '#64748B';
  const wDeltaText =
    (wDelta > 0 ? '▲ ' : wDelta < 0 ? '▼ ' : '— ') + Math.abs(wDelta).toFixed(1) + ' kg';

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petFade .3s ease' }}>
      {/* 헤더 */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 10px' }}>
        <button
          onClick={() => set({ screen: 'mypage', edit: { ...profile }, modal: null, sheet: null })}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 12 }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #02C39A, #028090)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 17,
            }}
          >
            {(profile.name || '초')[0]}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1E293B', lineHeight: 1.2 }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{profile.breed}</div>
          </div>
        </button>
        <button
          onClick={() => set({ sheet: 'notif' })}
          style={{ width: 44, height: 44, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span style={{ position: 'absolute', top: 9, right: 11, width: 8, height: 8, borderRadius: '50%', background: '#DC2626', border: '1.5px solid #F8FAFC' }} />
        </button>
      </div>

      {/* 스크롤 본문 */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', margin: '4px 2px 10px' }}>오늘의 건강 요약</div>

        {/* 요약 카드 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => set({ screen: 'wrec', wValue: '' })}
            style={summaryCard}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#028090" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <circle cx={12} cy={12} r={9} />
                <path d="M12 7l3 4H9l3-4Z" />
              </svg>
              체중
            </div>
            <div>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#1E293B' }}>{lastW.toFixed(1)}</span>
              <span style={{ fontSize: 14, color: '#64748B', marginLeft: 3 }}>kg</span>
            </div>
            <div style={{ fontSize: 13, color: wDeltaColor, marginTop: 4, fontWeight: 500 }}>
              전일 대비 {wDeltaText}
            </div>
          </button>

          <button
            onClick={() => set({ screen: 'water', waterMode: 'direct', waterValue: lastWa })}
            style={summaryCard}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#028090" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3s6 5.7 6 10a6 6 0 0 1-12 0c0-4.3 6-10 6-10Z" />
              </svg>
              음수
            </div>
            <div>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#1E293B' }}>{lastWa}</span>
              <span style={{ fontSize: 14, color: '#64748B', marginLeft: 3 }}>ml</span>
            </div>
            <div style={{ fontSize: 13, color: waterBelow ? '#D97706' : '#64748B', marginTop: 4, fontWeight: 500 }}>
              권장 {wRecLow}~{wRecHigh} ml
            </div>
          </button>
        </div>

        {/* 체중 추이 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 12px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1E293B' }}>체중 추이</div>
          <button
            onClick={() => nav('whist')}
            style={{ background: 'none', border: 'none', color: '#028090', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
          >
            이력 보기
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#028090" strokeWidth={2} strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
          </button>
        </div>

        {/* 범위 탭 */}
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 14 }}>
          <SegBtn seg={seg(homeRange === 7)} onClick={() => set({ homeRange: 7 })}>7일</SegBtn>
          <SegBtn seg={seg(homeRange === 30)} onClick={() => set({ homeRange: 30 })}>30일</SegBtn>
          <SegBtn seg={seg(homeRange === 90)} onClick={() => set({ homeRange: 90 })}>90일</SegBtn>
        </div>

        {/* 차트 */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '16px 12px 10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <LineChart series={homeSeries} color="#028090" gradientId="gHome" anomalySet={wAnom} />
        </div>
      </div>

      {/* 기록 버튼 */}
      <div style={{ flexShrink: 0, padding: '10px 16px 14px' }}>
        <button
          onClick={() => set({ sheet: 'record' })}
          style={{
            width: '100%', height: 54, border: 'none', borderRadius: 15,
            background: '#028090', color: '#fff', fontSize: 16, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 20px -6px rgba(2,128,144,0.5)',
          }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          오늘 기록하기
        </button>
      </div>
    </div>
  );
}

const summaryCard = {
  flex: 1,
  textAlign: 'left',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  cursor: 'pointer',
};
