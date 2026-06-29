'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { anomalySet } from '@/utils/helpers';
import { LineChart } from '@/utils/chart';

function seg(active) {
  return active
    ? { bg: '#fff', col: '#028090', fw: '600', sh: '0 1px 2px rgba(0,0,0,0.08)' }
    : { bg: 'transparent', col: '#64748B', fw: '500', sh: 'none' };
}

export default function ReportDetailScreen() {
  const { state, set, nav } = useApp();
  const { petId, token, reportMonth, reportTab } = state;
  const [weights, setWeights] = useState([]);
  const [waters, setWaters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId || !token || !reportMonth) return;
    const [year, month] = reportMonth.split('-');
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const from = `${reportMonth}-01`;
    const to = `${reportMonth}-${String(lastDay).padStart(2, '0')}`;

    setLoading(true);
    Promise.all([
      fetch(`/api/pets/${petId}/weights?from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`/api/pets/${petId}/water-logs?from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([wJson, waJson]) => {
      setWeights((wJson.data ?? []).map((r) => ({ date: r.recorded_date, value: Number(r.weight_kg) })));
      setWaters((waJson.data ?? []).map((r) => ({ date: r.recorded_date, value: Number(r.amount_ml) })));
    }).finally(() => setLoading(false));
  }, [petId, token, reportMonth]);

  const wAnom = anomalySet(weights);
  const detailSeries = reportTab === 'weight' ? weights : waters;
  const detailAnom = reportTab === 'weight' ? wAnom : new Set();

  const avgWeight = weights.length > 0 ? (weights.reduce((s, x) => s + x.value, 0) / weights.length).toFixed(1) : null;
  const avgWater = waters.length > 0 ? Math.round(waters.reduce((s, x) => s + x.value, 0) / waters.length) : null;
  const anomDates = [...wAnom];

  const [year, month] = (reportMonth ?? '').split('-');
  const title = year && month ? `${year}년 ${month}월 리포트` : '리포트';
  const lastDay = year && month ? new Date(Number(year), Number(month), 0).getDate() : 30;

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#028090', borderRadius: '50%', animation: 'petSpin .8s linear infinite' }} />
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
        <div style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>{title}</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px' }}>
        {/* 요약 카드 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 12 }}>{year}년 {month}월 건강 요약</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={summaryCard}>
            <div style={{ fontSize: 12, color: '#64748B' }}>평균 체중</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', marginTop: 4 }}>
              {avgWeight != null ? <>{avgWeight}<span style={{ fontSize: 13, color: '#64748B', marginLeft: 3 }}>kg</span></> : '—'}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{weights.length}일 기록</div>
          </div>
          <div style={summaryCard}>
            <div style={{ fontSize: 12, color: '#64748B' }}>평균 음수량</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', marginTop: 4 }}>
              {avgWater != null ? <>{avgWater}<span style={{ fontSize: 13, color: '#64748B', marginLeft: 3 }}>ml</span></> : '—'}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{waters.length}일 기록</div>
          </div>
        </div>

        {/* 추이 차트 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 10 }}>월간 건강 추이</div>
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
        {anomDates.length === 0 ? (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <span style={{ fontSize: 14, color: '#16A34A', fontWeight: 600 }}>이상 징후가 없었어요</span>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {anomDates.map((date) => (
              <div key={date} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2} strokeLinecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} /></svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>{date}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>7일 평균 대비 10% 이상 감소</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 기록 현황 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 10 }}>기록 현황</div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 24 }}>
          {[
            { label: '체중 기록', val: `${weights.length}일 / ${lastDay}일` },
            { label: '음수량 기록', val: `${waters.length}일 / ${lastDay}일` },
          ].map((it, i) => (
            <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: i > 0 ? '10px 0 0' : '0 0 10px', borderBottom: i === 0 ? '1px solid #F1F5F9' : 'none' }}>
              <span style={{ fontSize: 14, color: '#64748B' }}>{it.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{it.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const backBtn = {
  width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const summaryCard = {
  flex: 1, background: '#fff', border: '1px solid #E2E8F0',
  borderRadius: 16, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};
