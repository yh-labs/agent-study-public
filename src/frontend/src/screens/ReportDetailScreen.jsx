import { useApp } from '../context/AppContext';
import { anomalySet } from '../utils/helpers';
import { LineChart } from '../utils/chart';
import { REPORT_INFO } from './ReportsScreen';

function seg(active) {
  return active
    ? { bg: '#fff', col: '#028090', fw: '600', sh: '0 1px 2px rgba(0,0,0,0.08)' }
    : { bg: 'transparent', col: '#64748B', fw: '500', sh: 'none' };
}

export default function ReportDetailScreen() {
  const { state, set, nav, showToast } = useApp();
  const { weights, waters, reportMonth, reportTab, pdfLoading, pdfOpen } = state;
  const ri = REPORT_INFO[reportMonth];
  const wAnom = anomalySet(weights);
  const waAnom = anomalySet(waters);

  const monthW = weights.filter((x) => x.date.startsWith(reportMonth));
  const monthWa = waters.filter((x) => x.date.startsWith(reportMonth));
  const detailSeries = reportTab === 'weight' ? monthW : monthWa;
  const detailAnom = reportTab === 'weight' ? wAnom : waAnom;

  const openPdf = () => {
    set({ pdfLoading: true });
    setTimeout(() => set({ pdfLoading: false, pdfOpen: true }), 1500);
  };

  if (pdfOpen) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'petFade .3s ease', background: '#1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#1E293B' }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{state.profile.name}_건강리포트_{reportMonth}.pdf</div>
          <button onClick={() => set({ pdfOpen: false })} style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 13 }}>닫기</button>
        </div>
        <div style={{ flex: 1, background: '#fff', margin: '0 16px 16px', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>{ri.bar}</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>기간: {ri.bar.replace(' 리포트', '')}</div>
          <LineChart series={monthW} color="#028090" gradientId="gPdf" anomalySet={wAnom} />
          <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
            <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>평균 체중</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginTop: 4 }}>{ri.avgW} kg</div>
            </div>
            <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>평균 음수량</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginTop: 4 }}>{ri.avgWa} ml</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 16px 20px' }}>
          <button onClick={() => showToast('#16A34A', 'PDF가 저장되었습니다')} style={{ width: '100%', height: 50, border: 'none', borderRadius: 14, background: '#028090', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            저장
          </button>
        </div>
      </div>
    );
  }

  if (pdfLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#028090', borderRadius: '50%', animation: 'petSpin .8s linear infinite' }} />
        <div style={{ fontSize: 14, color: '#64748B' }}>PDF를 생성하고 있어요...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petScreen .3s ease' }}>
      {/* 헤더 */}
      <div style={{ flexShrink: 0, height: 52, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
        <button onClick={() => nav('reports')} style={backBtn}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>{ri.bar}</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px' }}>
        {/* 요약 카드 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 12 }}>{ri.bar.replace(' 리포트', '')} 건강 요약</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[
            { label: '평균 체중', val: ri.avgW, unit: 'kg', delta: ri.dW, up: ri.dWup },
            { label: '평균 음수량', val: ri.avgWa, unit: 'ml', delta: ri.dWa, up: ri.dWaup },
          ].map((c) => (
            <div key={c.label} style={{ flex: 1, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', marginTop: 4 }}>{c.val}<span style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginLeft: 3 }}>{c.unit}</span></div>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.up ? '#16A34A' : '#DC2626', marginTop: 4 }}>{c.delta}</div>
            </div>
          ))}
        </div>

        {/* 추이 차트 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 10 }}>30일 건강 추이</div>
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 14 }}>
          {[{ id: 'weight', label: '체중' }, { id: 'water', label: '음수량' }].map(({ id, label }) => {
            const s = seg(reportTab === id);
            return (
              <button key={id} onClick={() => set({ reportTab: id })} style={{ flex: 1, height: 34, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: s.bg, color: s.col, fontWeight: s.fw, boxShadow: s.sh }}>
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '16px 12px 10px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <LineChart series={detailSeries} color="#028090" gradientId="gDet" anomalySet={detailAnom} />
        </div>

        {/* 이상 징후 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 10 }}>이상 징후 기록</div>
        {ri.anom.length === 0 ? (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <span style={{ fontSize: 14, color: '#16A34A', fontWeight: 600 }}>이상 징후가 없었어요</span>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {ri.anom.map((a, i) => (
              <div key={i} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2} strokeLinecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} /></svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>{a.d}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>{a.p}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 기록 현황 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 10 }}>기록 현황</div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 24 }}>
          {[{ label: '체중 기록', val: ri.wcov }, { label: '음수량 기록', val: ri.wacov }].map((it, i) => (
            <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: i > 0 ? '10px 0 0' : '0 0 10px', borderBottom: i === 0 ? '1px solid #F1F5F9' : 'none' }}>
              <span style={{ fontSize: 14, color: '#64748B' }}>{it.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{it.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PDF / 공유 버튼 */}
      <div style={{ flexShrink: 0, padding: '10px 16px 16px', display: 'flex', gap: 10, background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <button onClick={openPdf} style={{ flex: 1, height: 48, border: '1px solid #028090', borderRadius: 12, background: '#fff', color: '#028090', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          PDF 저장
        </button>
        <button onClick={() => showToast('#028090', '공유 시트를 여는 중...')} style={{ flex: 1, height: 48, border: 'none', borderRadius: 12, background: '#028090', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          공유
        </button>
      </div>
    </div>
  );
}

const backBtn = {
  width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
