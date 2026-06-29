'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TODAY } from '@/utils/helpers';
import ModalBackdrop from '@/components/ModalBackdrop';

const PAD_STYLE = {
  height: 46,
  border: 'none',
  background: '#F8FAFC',
  borderRadius: 11,
  fontSize: 21,
  fontWeight: 600,
  color: '#1E293B',
  cursor: 'pointer',
};

export default function WeightRecordScreen() {
  const { state, set, nav, showToast, loadPetData } = useApp();
  const { weights, wValue, modal } = state;
  const [saving, setSaving] = useState(false);

  const lastW = weights.length > 0 ? weights[weights.length - 1].value : null;
  const prevW = weights.length >= 2 ? weights[weights.length - 2].value : null;

  const addDigit = (d) => {
    let v = wValue;
    if (v === '0') v = '';
    if (v.includes('.')) {
      if (v.split('.')[1].length >= 1) return;
    } else if (v.replace('.', '').length >= 2) return;
    set({ wValue: v + d });
  };

  const addDot = () => {
    if (wValue.includes('.') || wValue === '') return;
    set({ wValue: wValue + '.' });
  };

  const del = () => set({ wValue: wValue.slice(0, -1) });

  const save = () => {
    const val = parseFloat(wValue || '0');
    if (!val || val <= 0) { showToast('#DC2626', '체중을 입력해주세요'); return; }
    if (prevW && Math.abs(val - prevW) / prevW > 0.15) {
      set({ modal: 'weight' });
      return;
    }
    commit(val);
  };

  const commit = async (val) => {
    setSaving(true);
    set({ modal: null });
    try {
      const res = await fetch(`/api/pets/${state.petId}/weights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ recorded_date: TODAY, weight_kg: val }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? '저장 실패');

      await loadPetData(state.token, state.petId);

      if (json.data?.is_anomaly) {
        showToast('#D97706', '체중 변화가 평소보다 큽니다. 확인해보세요');
      } else {
        showToast('#16A34A', '기록이 저장되었습니다');
      }
      nav('home');
    } catch (e) {
      showToast('#DC2626', e.message);
    } finally {
      setSaving(false);
    }
  };

  const prevDelta = (() => {
    if (lastW == null || prevW == null) return null;
    const d = lastW - prevW;
    const pc = (d / prevW) * 100;
    return {
      text: `${d > 0 ? '▲' : d < 0 ? '▼' : '—'} ${Math.abs(d).toFixed(1)} kg (${pc > 0 ? '+' : ''}${pc.toFixed(1)}%)`,
      color: d > 0 ? '#16A34A' : d < 0 ? '#DC2626' : '#64748B',
    };
  })();

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petScreen .3s ease' }}>
      {/* 헤더 */}
      <div style={{ flexShrink: 0, height: 52, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
        <button aria-label="뒤로" onClick={() => nav('home')} style={backBtn}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>체중 기록</div>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 20px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>날짜</div>
        <div style={{ height: 48, border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px', background: '#fff', marginBottom: 22, color: '#1E293B', fontSize: 15 }}>
          오늘 ({TODAY})
        </div>

        <div style={{ textAlign: 'center', padding: '14px 0 6px' }}>
          <span style={{ fontSize: 60, fontWeight: 700, color: '#1E293B', letterSpacing: '-1px' }}>{wValue || '0'}</span>
          <span style={{ fontSize: 22, color: '#64748B', fontWeight: 600, marginLeft: 6 }}>kg</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginBottom: 18 }}>
          {lastW != null ? `최근 기록: ${lastW.toFixed(1)} kg` : '첫 번째 체중을 기록해보세요'}
        </div>

        {prevW != null && prevDelta && (
          <div style={{ background: '#F1F5F9', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>이전 기록 · {weights[weights.length - 2].date}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', marginTop: 2 }}>{prevW.toFixed(1)} kg</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: prevDelta.color }}>{prevDelta.text}</div>
          </div>
        )}
      </div>

      {/* 키패드 + 저장 */}
      <div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid #F1F5F9', padding: '10px 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
          {['1','2','3','4','5','6','7','8','9'].map((d) => (
            <button key={d} onClick={() => addDigit(d)} style={PAD_STYLE}>{d}</button>
          ))}
          <button onClick={addDot} style={PAD_STYLE}>.</button>
          <button onClick={() => addDigit('0')} style={PAD_STYLE}>0</button>
          <button onClick={del} style={{ ...PAD_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 5H8l-5 7 5 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
              <path d="m17 9-5 5M12 9l5 5" />
            </svg>
          </button>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{ width: '100%', height: 52, border: 'none', borderRadius: 14, background: saving ? '#94A3B8' : '#028090', color: '#fff', fontSize: 16, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? '저장 중...' : '기록 완료'}
        </button>
      </div>

      {/* 체중 확인 모달 */}
      {modal === 'weight' && (
        <ModalBackdrop onClose={() => set({ modal: null })}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>체중 변화 확인</div>
          <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
            입력하신 체중이 전일({prevW?.toFixed(1)}kg) 대비 많이 차이납니다.{' '}
            {parseFloat(wValue || '0').toFixed(1)} kg으로 기록할까요?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => set({ modal: null })} style={{ flex: 1, height: 48, border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff', color: '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
              다시 입력
            </button>
            <button onClick={() => commit(parseFloat(wValue || '0'))} style={{ flex: 1, height: 48, border: 'none', borderRadius: 12, background: '#028090', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
              저장
            </button>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}

const backBtn = {
  width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
