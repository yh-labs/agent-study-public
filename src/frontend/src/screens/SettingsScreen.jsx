'use client';

import { useApp } from '@/context/AppContext';
import { fmtTime } from '@/utils/helpers';

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 48, height: 28, borderRadius: 14, border: 'none',
        background: on ? '#028090' : '#CBD5E1', position: 'relative', cursor: 'pointer',
        transition: 'background .2s', flexShrink: 0,
      }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
    </button>
  );
}

function SettingRow({ label, right, isRed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: 14, color: isRed ? '#DC2626' : '#1E293B' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>{right}</div>
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 8 }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', padding: '16px 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{children}</div>;
}

const chevron = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
);

export default function SettingsScreen() {
  const { state, set, nav, showToast } = useApp();
  const { settings } = state;

  const toggle = (key) => set({ settings: { ...settings, [key]: !settings[key] } });
  const openTime = () => {
    const [h, m] = settings.reminderTime.split(':');
    set({ sheet: 'time', pickH: h, pickM: m });
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petFade .3s ease' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 4px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>설정</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 24px' }}>
        <SectionLabel>알림</SectionLabel>
        <SectionCard>
          <SettingRow label="기록 리마인더" right={<Toggle on={settings.reminder} onToggle={() => toggle('reminder')} />} />
          {settings.reminder && (
            <SettingRow
              label="리마인더 시간"
              right={
                <button onClick={openTime} style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#028090', cursor: 'pointer' }}>
                  {fmtTime(settings.reminderTime)}
                </button>
              }
            />
          )}
          <SettingRow label="이상 징후 알림" right={<Toggle on={settings.anomaly} onToggle={() => toggle('anomaly')} />} />
          <SettingRow label="리포트 생성 알림" right={<Toggle on={settings.report} onToggle={() => toggle('report')} />} />
        </SectionCard>

        <SectionLabel>기록 설정</SectionLabel>
        <SectionCard>
          <SettingRow
            label="물그릇 용량"
            right={
              <button onClick={() => set({ sheet: 'bowl' })} style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#028090', cursor: 'pointer' }}>
                {settings.bowlCap} ml
              </button>
            }
          />
        </SectionCard>

        <SectionLabel>서비스 정보</SectionLabel>
        <SectionCard>
          <button onClick={() => {}} style={textRowBtn}><span>이용약관</span>{chevron}</button>
          <button onClick={() => {}} style={textRowBtn}><span>개인정보처리방침</span>{chevron}</button>
          <SettingRow label="버전" right={<span style={{ fontSize: 13, color: '#94A3B8' }}>1.0.0</span>} />
        </SectionCard>

        <SectionLabel>계정</SectionLabel>
        <SectionCard>
          <button onClick={() => { showToast('#028090', '로그아웃되었습니다'); nav('login'); }} style={textRowBtn}>
            <span>로그아웃</span>
          </button>
          <button onClick={() => showToast('#DC2626', '회원 탈퇴는 고객센터를 통해 진행돼요')} style={{ ...textRowBtn, color: '#DC2626' }}>
            <span>회원 탈퇴</span>
          </button>
        </SectionCard>
      </div>
    </div>
  );
}

const textRowBtn = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
  fontSize: 14, color: '#1E293B', borderBottom: '1px solid #F1F5F9',
};
