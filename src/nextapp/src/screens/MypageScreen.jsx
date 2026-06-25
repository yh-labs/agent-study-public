'use client';

import { useApp } from '@/context/AppContext';
import { ageOf } from '@/utils/helpers';
import ModalBackdrop from '@/components/ModalBackdrop';

function ToggleBtn({ active, onClick, children }) {
  const c = active
    ? { bg: '#ECFBF6', bd: '#028090', col: '#028090', fw: '600' }
    : { bg: '#fff', bd: '#E2E8F0', col: '#64748B', fw: '500' };
  return (
    <button onClick={onClick} style={{ flex: 1, height: 50, borderRadius: 12, border: `1px solid ${c.bd}`, background: c.bg, color: c.col, fontSize: 15, fontWeight: c.fw, cursor: 'pointer' }}>
      {children}
    </button>
  );
}

function Label({ required, optional, children }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
      {children}
      {required && <span style={{ color: '#028090' }}> *</span>}
      {optional && <span style={{ color: '#94A3B8', fontWeight: 400 }}> (선택)</span>}
    </label>
  );
}

const inputStyle = { width: '100%', height: 50, border: '1px solid #E2E8F0', borderRadius: 12, padding: '0 16px', fontSize: 15, color: '#1E293B', outline: 'none', marginBottom: 20 };

export default function MypageScreen() {
  const { state, set, nav, showToast } = useApp();
  const { modal } = state;
  const e = state.edit || state.profile;

  const update = (field) => (ev) => set({ edit: { ...e, [field]: ev.target.value } });
  const pick = (field, val) => set({ edit: { ...e, [field]: val } });

  const save = () => {
    set({ profile: { ...e } });
    showToast('#16A34A', '저장 완료');
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petScreen .3s ease' }}>
      <div style={{ flexShrink: 0, height: 52, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
        <button onClick={() => nav('home')} style={backBtn}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>마이페이지</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 24px 24px' }}>
        {/* 프로필 아바타 */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #02C39A, #028090)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 36 }}>
              {(e.name || '초')[0]}
            </div>
            <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth={2} strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
            </button>
          </div>
        </div>

        <Label required>이름</Label>
        <input value={e.name} onChange={update('name')} placeholder="예: 초코" style={inputStyle}
          onFocus={(ev) => (ev.target.style.border = '2px solid #028090')}
          onBlur={(ev) => (ev.target.style.border = '1px solid #E2E8F0')} />

        <Label required>종</Label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <ToggleBtn active={e.species === 'dog'} onClick={() => pick('species', 'dog')}>강아지</ToggleBtn>
          <ToggleBtn active={e.species === 'cat'} onClick={() => pick('species', 'cat')}>고양이</ToggleBtn>
        </div>

        <Label optional>품종</Label>
        <input value={e.breed} onChange={update('breed')} placeholder="예: 말티즈" style={inputStyle}
          onFocus={(ev) => (ev.target.style.border = '2px solid #028090')}
          onBlur={(ev) => (ev.target.style.border = '1px solid #E2E8F0')} />

        <Label optional>생년월일</Label>
        <input value={e.birth} onChange={update('birth')} placeholder="YYYY.MM.DD" style={inputStyle}
          onFocus={(ev) => (ev.target.style.border = '2px solid #028090')}
          onBlur={(ev) => (ev.target.style.border = '1px solid #E2E8F0')} />
        {e.birth && <div style={{ fontSize: 12, color: '#64748B', marginTop: -14, marginBottom: 20 }}>{ageOf(e.birth)}</div>}

        <Label optional>성별</Label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <ToggleBtn active={e.sex === 'male'} onClick={() => pick('sex', 'male')}>수컷</ToggleBtn>
          <ToggleBtn active={e.sex === 'female'} onClick={() => pick('sex', 'female')}>암컷</ToggleBtn>
        </div>

        <Label optional>중성화 여부</Label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <ToggleBtn active={e.neutered === 'yes'} onClick={() => pick('neutered', 'yes')}>했어요</ToggleBtn>
          <ToggleBtn active={e.neutered === 'no'} onClick={() => pick('neutered', 'no')}>안 했어요</ToggleBtn>
        </div>

        <button onClick={save} style={{ width: '100%', height: 52, border: 'none', borderRadius: 14, background: '#028090', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>
          저장하기
        </button>
        <button onClick={() => set({ modal: 'delete' })} style={{ width: '100%', height: 44, border: 'none', background: 'none', color: '#DC2626', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          프로필 삭제
        </button>
      </div>

      {modal === 'delete' && (
        <ModalBackdrop onClose={() => set({ modal: null })}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>프로필 삭제</div>
          <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
            {e.name}의 모든 기록이 삭제됩니다. 정말 삭제하시겠어요?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => set({ modal: null })} style={{ flex: 1, height: 48, border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff', color: '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
              취소
            </button>
            <button
              onClick={() => { set({ modal: null }); showToast('#1E293B', '프로필이 삭제되었습니다'); nav('home'); }}
              style={{ flex: 1, height: 48, border: 'none', borderRadius: 12, background: '#DC2626', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
            >
              삭제
            </button>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}

const backBtn = { width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
