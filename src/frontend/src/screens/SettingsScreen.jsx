'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtTime } from '@/utils/helpers';
import { supabase } from '@/lib/supabase-client';
import ModalBackdrop from '@/components/ModalBackdrop';

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
  const [modal, setModal] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const toggle = (key) => set({ settings: { ...settings, [key]: !settings[key] } });
  const openTime = () => {
    const [h, m] = settings.reminderTime.split(':');
    set({ sheet: 'time', pickH: h, pickM: m });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    set({ token: null, petId: null, weights: [], waters: [] });
    nav('login');
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (!res.ok) throw new Error('탈퇴 처리 실패');
      await supabase.auth.signOut();
      set({ token: null, petId: null, weights: [], waters: [] });
      nav('login');
    } catch {
      showToast('#DC2626', '탈퇴 처리 중 오류가 발생했습니다');
    } finally {
      setWithdrawing(false);
      setModal(null);
    }
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petFade .3s ease' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 4px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>설정</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 24px' }}>
        <SectionLabel>알림</SectionLabel>
        <SectionCard>
          <SettingRow
            label="기록 리마인더"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>v1.1 예정</span>
                <Toggle on={false} onToggle={() => {}} />
              </div>
            }
          />
          <SettingRow
            label="이상 징후 알림"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>앱 내 자동 표시</span>
                <Toggle on={true} onToggle={() => {}} />
              </div>
            }
          />
          <SettingRow
            label="리포트 생성 알림"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>v1.1 예정</span>
                <Toggle on={false} onToggle={() => {}} />
              </div>
            }
          />
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
          <button onClick={() => setModal('logout')} style={textRowBtn}>
            <span>로그아웃</span>
          </button>
          <button onClick={() => setModal('withdraw')} style={{ ...textRowBtn, color: '#DC2626', borderBottom: 'none' }}>
            <span>회원 탈퇴</span>
          </button>
        </SectionCard>
      </div>

      {modal === 'logout' && (
        <ModalBackdrop onClose={() => setModal(null)}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>로그아웃</div>
          <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
            로그아웃 하시겠어요?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setModal(null)} style={cancelBtn}>취소</button>
            <button onClick={handleLogout} style={confirmBtn}>로그아웃</button>
          </div>
        </ModalBackdrop>
      )}

      {modal === 'withdraw' && (
        <ModalBackdrop onClose={() => setModal(null)}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>회원 탈퇴</div>
          <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
            탈퇴하면 모든 기록이 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠어요?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setModal(null)} style={cancelBtn}>취소</button>
            <button onClick={handleWithdraw} disabled={withdrawing} style={{ ...confirmBtn, background: '#DC2626', opacity: withdrawing ? 0.6 : 1 }}>
              {withdrawing ? '처리 중...' : '탈퇴'}
            </button>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}

const textRowBtn = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
  fontSize: 14, color: '#1E293B', borderBottom: '1px solid #F1F5F9',
};

const cancelBtn = {
  flex: 1, height: 48, border: '1px solid #E2E8F0', borderRadius: 12,
  background: '#fff', color: '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: 15,
};

const confirmBtn = {
  flex: 1, height: 48, border: 'none', borderRadius: 12,
  background: '#028090', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 15,
};
