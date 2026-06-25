'use client';

import { useApp } from '@/context/AppContext';
import SheetBackdrop from './SheetBackdrop';

export function RecordSheet() {
  const { state, set, nav } = useApp();
  const lastW = state.weights[state.weights.length - 1].value;
  const lastWa = state.waters[state.waters.length - 1].value;

  if (state.sheet !== 'record') return null;

  return (
    <SheetBackdrop>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>
        무엇을 기록할까요?
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => set({ screen: 'wrec', sheet: null, wValue: '' })}
          style={recordBtnStyle}
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#028090" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7l3 4H9l3-4Z" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', marginTop: 8 }}>체중</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{lastW.toFixed(1)} kg</div>
        </button>
        <button
          onClick={() => set({ screen: 'water', sheet: null, waterMode: 'direct', waterValue: lastWa })}
          style={recordBtnStyle}
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#028090" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3s6 5.7 6 10a6 6 0 0 1-12 0c0-4.3 6-10 6-10Z" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', marginTop: 8 }}>음수량</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{lastWa} ml</div>
        </button>
      </div>
    </SheetBackdrop>
  );
}

const recordBtnStyle = {
  flex: 1,
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  padding: '20px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
};

export function NotifSheet() {
  const { state, set } = useApp();
  if (state.sheet !== 'notif') return null;

  const notifs = [
    { id: 1, msg: '오늘 체중 기록을 잊지 마세요!', time: '20:00', color: '#028090' },
    { id: 2, msg: '초코의 5월 리포트가 생성되었습니다', time: '6월 1일', color: '#16A34A' },
  ];

  return (
    <SheetBackdrop>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>알림</div>
      {notifs.map((n) => (
        <div
          key={n.id}
          style={{
            padding: '12px 0',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1E293B' }}>{n.msg}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{n.time}</div>
          </div>
        </div>
      ))}
    </SheetBackdrop>
  );
}

export function TimeSheet() {
  const { state, set, showToast } = useApp();
  if (state.sheet !== 'time') return null;

  const hours = ['18', '19', '20', '21', '22'];
  const mins = ['00', '30'];

  const confirm = () => {
    set({ settings: { ...state.settings, reminderTime: state.pickH + ':' + state.pickM }, sheet: null });
    showToast('#16A34A', '알림 시간이 설정되었습니다');
  };

  return (
    <SheetBackdrop>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>리마인더 시간</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8, fontWeight: 600 }}>시</div>
          <div style={{ maxHeight: 170, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 12 }}>
            {hours.map((h) => {
              const sel = state.pickH === h;
              return (
                <button
                  key={h}
                  onClick={() => set({ pickH: h })}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    background: sel ? '#ECFBF6' : 'transparent',
                    color: sel ? '#028090' : '#1E293B',
                    fontWeight: sel ? 700 : 400,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8, fontWeight: 600 }}>분</div>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            {mins.map((m) => {
              const sel = state.pickM === m;
              return (
                <button
                  key={m}
                  onClick={() => set({ pickM: m })}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    background: sel ? '#ECFBF6' : 'transparent',
                    color: sel ? '#028090' : '#1E293B',
                    fontWeight: sel ? 700 : 400,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <button
        onClick={confirm}
        style={{
          width: '100%',
          height: 50,
          border: 'none',
          borderRadius: 14,
          background: '#028090',
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        확인
      </button>
    </SheetBackdrop>
  );
}

export function BowlSheet() {
  const { state, set, showToast } = useApp();
  if (state.sheet !== 'bowl') return null;

  const caps = [200, 300, 400, 500];

  return (
    <SheetBackdrop>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>물그릇 용량 선택</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {caps.map((c) => {
          const sel = state.settings.bowlCap === c;
          return (
            <button
              key={c}
              onClick={() => {
                set({ settings: { ...state.settings, bowlCap: c }, sheet: null });
                showToast('#16A34A', '물그릇 용량이 변경되었습니다');
              }}
              style={{
                height: 52,
                border: `1px solid ${sel ? '#028090' : '#E2E8F0'}`,
                borderRadius: 12,
                background: sel ? '#ECFBF6' : '#fff',
                color: '#1E293B',
                fontWeight: sel ? 600 : 500,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                cursor: 'pointer',
              }}
            >
              <span>{c} ml</span>
              {sel && <span style={{ color: '#028090', fontWeight: 700 }}>✓</span>}
            </button>
          );
        })}
      </div>
    </SheetBackdrop>
  );
}
