'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TODAY } from '@/utils/helpers';

function seg(active) {
  return active
    ? { bg: '#fff', col: '#028090', fw: '600', sh: '0 1px 2px rgba(0,0,0,0.08)' }
    : { bg: 'transparent', col: '#64748B', fw: '500', sh: 'none' };
}

export default function WaterRecordScreen() {
  const { state, set, nav, showToast, loadPetData } = useApp();
  const { waters, waterMode, waterValue, bowlTimes, bowlRemain, settings } = state;
  const [saving, setSaving] = useState(false);

  const lastWa = waters.length > 0 ? waters[waters.length - 1].value : null;
  const lastW = state.weights.length > 0 ? state.weights[state.weights.length - 1].value : null;
  const wRecLow = lastW != null ? Math.round(lastW * 27) : 0;
  const wRecHigh = lastW != null ? Math.round(lastW * 35.4) : 0;
  const waterAuto = Math.max(0, bowlTimes * settings.bowlCap - (parseInt(bowlRemain) || 0));

  const save = async () => {
    const val = waterMode === 'direct' ? waterValue : waterAuto;
    setSaving(true);
    try {
      const res = await fetch(`/api/pets/${state.petId}/water-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ recorded_date: TODAY, amount_ml: val }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? '저장 실패');

      await loadPetData(state.token, state.petId);
      showToast('#16A34A', '기록이 저장되었습니다');
      nav('home');
    } catch (e) {
      showToast('#DC2626', e.message);
    } finally {
      setSaving(false);
    }
  };

  const mDirect = seg(waterMode === 'direct');
  const mBowl = seg(waterMode === 'bowl');

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petScreen .3s ease' }}>
      {/* 헤더 */}
      <div style={{ flexShrink: 0, height: 52, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
        <button onClick={() => nav('home')} style={backBtn}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>음수량 기록</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 20px 16px' }}>
        {/* 날짜 */}
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>날짜</div>
        <div style={{ height: 48, border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px', background: '#fff', marginBottom: 22, color: '#1E293B', fontSize: 15 }}>
          오늘 ({TODAY})
        </div>

        {/* 모드 탭 */}
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 22 }}>
          <button onClick={() => set({ waterMode: 'direct' })} style={{ flex: 1, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, background: mDirect.bg, color: mDirect.col, fontWeight: mDirect.fw, boxShadow: mDirect.sh }}>직접 입력</button>
          <button onClick={() => set({ waterMode: 'bowl', bowlTimes: 1, bowlRemain: '0' })} style={{ flex: 1, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, background: mBowl.bg, color: mBowl.col, fontWeight: mBowl.fw, boxShadow: mBowl.sh }}>물그릇 기준</button>
        </div>

        {waterMode === 'direct' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
              <button onClick={() => set({ waterValue: Math.max(0, waterValue - 10) })} style={stepper}>−10</button>
              <div style={{ background: '#F1F5F9', borderRadius: 12, padding: '10px 24px', minWidth: 100, textAlign: 'center' }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: '#1E293B' }}>{waterValue}</span>
                <span style={{ fontSize: 14, color: '#64748B', marginLeft: 4 }}>ml</span>
              </div>
              <button onClick={() => set({ waterValue: waterValue + 10 })} style={{ ...stepper, background: '#028090', color: '#fff', border: 'none' }}>+10</button>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#64748B', marginBottom: 8 }}>
              권장 음수량: {wRecLow}~{wRecHigh} ml
            </div>
          </>
        ) : (
          <>
            {/* 물그릇 정보 */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>설정된 물그릇 용량</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>{settings.bowlCap} ml</div>
            </div>

            {/* 가득 채운 횟수 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>가득 채운 횟수</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => set({ bowlTimes: Math.max(0, bowlTimes - 1) })} style={stepper}>−</button>
                <div style={{ background: '#F1F5F9', borderRadius: 12, padding: '10px 24px', flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#1E293B' }}>{bowlTimes}</div>
                <button onClick={() => set({ bowlTimes: bowlTimes + 1 })} style={{ ...stepper, background: '#028090', color: '#fff', border: 'none' }}>+</button>
              </div>
            </div>

            {/* 남은 양 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>현재 남은 양 (ml)</div>
              <input
                type="number"
                value={bowlRemain}
                onChange={(e) => set({ bowlRemain: String(Math.round(parseInt(e.target.value.replace(/[^0-9]/g, '') || '0') / 10) * 10) })}
                step={10}
                placeholder="0"
                style={{ width: '100%', height: 50, border: '1px solid #E2E8F0', borderRadius: 12, padding: '0 16px', fontSize: 15, color: '#1E293B', outline: 'none' }}
                onFocus={(e) => (e.target.style.border = '2px solid #028090')}
                onBlur={(e) => (e.target.style.border = '1px solid #E2E8F0')}
              />
            </div>

            {/* 계산 결과 */}
            <div style={{ background: '#ECFBF6', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>오늘 마신 양</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#028090', marginTop: 4 }}>{waterAuto} ml</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>= {bowlTimes} × {settings.bowlCap} − {parseInt(bowlRemain) || 0}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '12px 20px 24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ width: '100%', height: 52, border: 'none', borderRadius: 14, background: saving ? '#94A3B8' : '#028090', color: '#fff', fontSize: 16, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? '저장 중...' : '기록 완료'}
        </button>
      </div>
    </div>
  );
}

const backBtn = {
  width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const stepper = {
  width: 54, height: 46, border: '1px solid #E2E8F0', borderRadius: 12,
  background: '#fff', color: '#1E293B', fontSize: 16, fontWeight: 600, cursor: 'pointer',
};
