'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function ReportsScreen() {
  const { state, set } = useApp();
  const { profile, petId, token } = state;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId || !token) return;
    fetch(`/api/pets/${petId}/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => setReports(json.data ?? []))
      .finally(() => setLoading(false));
  }, [petId, token]);

  const monthLabel = (year, month) => `${year}년 ${month}월`;
  const monthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petFade .3s ease' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 8px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>리포트</div>
        <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          {profile.name}의 건강 리포트, 매월 1일 자동으로 생성됩니다
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#028090', borderRadius: '50%', animation: 'petSpin .8s linear infinite' }} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94A3B8' }}>
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1={16} y1={13} x2={8} y2={13} />
              <line x1={16} y1={17} x2={8} y2={17} />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>아직 리포트가 없어요</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>매월 1일에 전월 건강 리포트가<br />자동으로 생성됩니다</div>
          </div>
        ) : (
          reports.map((r) => {
            const key = monthKey(r.year, r.month);
            return (
              <div key={r.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>{monthLabel(r.year, r.month)}</div>
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
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>
                      {r.avg_weight_kg != null ? Number(r.avg_weight_kg).toFixed(1) + ' kg' : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>평균 음수량</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>
                      {r.avg_water_ml != null ? Math.round(r.avg_water_ml) + ' ml' : '—'}
                    </div>
                  </div>
                  {r.anomaly_count > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>이상 징후</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#DC2626', marginTop: 2 }}>{r.anomaly_count}회</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
