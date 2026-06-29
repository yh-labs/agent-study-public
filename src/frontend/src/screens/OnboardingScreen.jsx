'use client';

import { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase-client';

function ToggleBtn({ active, onClick, children }) {
  const chip = active
    ? { bg: '#ECFBF6', bd: '#028090', col: '#028090', fw: '600' }
    : { bg: '#fff', bd: '#E2E8F0', col: '#64748B', fw: '500' };
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: 50,
        borderRadius: 12,
        border: `1px solid ${chip.bd}`,
        background: chip.bg,
        color: chip.col,
        fontSize: 15,
        fontWeight: chip.fw,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  width: '100%',
  height: 50,
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: '0 16px',
  fontSize: 15,
  color: '#1E293B',
  outline: 'none',
  marginBottom: 20,
  boxSizing: 'border-box',
};

function Label({ required, optional, children }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
      {children}
      {required && <span style={{ color: '#028090' }}> *</span>}
      {optional && <span style={{ color: '#94A3B8', fontWeight: 400 }}> (선택)</span>}
    </label>
  );
}

export default function OnboardingScreen() {
  const { state, set, nav, showToast } = useApp();
  const onb = state.onb;
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (petId) => {
    if (!photoFile) return null;
    const ext = photoFile.name.split('.').pop();
    const path = `${auth.user.id}/${petId}.${ext}`;
    const { error } = await supabase.storage
      .from('pet-photos')
      .upload(path, photoFile, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from('pet-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleStart = async () => {
    const name = onb.name.trim();
    if (!name) {
      showToast('#DC2626', '이름을 입력해주세요');
      return;
    }
    if (!onb.species) {
      showToast('#DC2626', '종을 선택해주세요');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('인증 정보가 없습니다');

      const body = {
        name,
        species: onb.species,
        breed: onb.breed.trim() || null,
        birth_date: onb.birth.trim() || null,
        gender: onb.sex || null,
        is_neutered: onb.neutered === 'yes',
        photo_url: null,
      };

      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? '등록 실패');

      const pet = json.data;

      // 사진이 있으면 업로드 후 pet 업데이트
      let photoUrl = null;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop();
        const { data: { user } } = await supabase.auth.getUser();
        const path = `${user.id}/${pet.id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('pet-photos')
          .upload(path, photoFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('pet-photos').getPublicUrl(path);
          photoUrl = urlData.publicUrl;
          await fetch(`/api/pets/${pet.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ photo_url: photoUrl }),
          });
        }
      }

      set({
        profile: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed ?? '',
          birth: pet.birth_date ?? '',
          sex: pet.gender ?? '',
          neutered: pet.is_neutered ? 'yes' : 'no',
          photoUrl,
        },
        petId: pet.id,
        token,
      });
      showToast('#16A34A', name + ' 등록이 완료되었어요');
      nav('home');
    } catch (e) {
      showToast('#DC2626', e.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => set({ onb: { ...onb, [field]: e.target.value } });
  const pick = (field, val) => set({ onb: { ...onb, [field]: val } });

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'petScreen .3s ease' }}>
      <div style={{ padding: '8px 24px 16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1E293B', margin: '8px 0 6px', letterSpacing: '-0.4px' }}>
          반려동물을 등록해주세요
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>나중에 추가 정보를 입력할 수 있어요</p>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 22px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 96, height: 96, borderRadius: '50%',
              background: photoPreview ? 'transparent' : '#F1F5F9',
              border: photoPreview ? 'none' : '2px dashed #CBD5E1',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, cursor: 'pointer', color: '#64748B', overflow: 'hidden',
            }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-1.5-2Z" />
                  <circle cx={12} cy={13} r={3.5} />
                </svg>
                <span style={{ fontSize: 11 }}>사진 추가</span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
        </div>

        <Label required>이름</Label>
        <input
          value={onb.name}
          onChange={update('name')}
          placeholder="예: 초코"
          style={inputStyle}
          onFocus={(e) => (e.target.style.border = '2px solid #028090')}
          onBlur={(e) => (e.target.style.border = '1px solid #E2E8F0')}
        />

        <Label required>종</Label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <ToggleBtn active={onb.species === 'dog'} onClick={() => pick('species', 'dog')}>강아지</ToggleBtn>
          <ToggleBtn active={onb.species === 'cat'} onClick={() => pick('species', 'cat')}>고양이</ToggleBtn>
        </div>

        <Label optional>품종</Label>
        <input
          value={onb.breed}
          onChange={update('breed')}
          placeholder="예: 말티즈"
          style={inputStyle}
          onFocus={(e) => (e.target.style.border = '2px solid #028090')}
          onBlur={(e) => (e.target.style.border = '1px solid #E2E8F0')}
        />

        <Label optional>생년월일</Label>
        <input
          value={onb.birth}
          onChange={update('birth')}
          placeholder="YYYY.MM.DD"
          style={inputStyle}
          onFocus={(e) => (e.target.style.border = '2px solid #028090')}
          onBlur={(e) => (e.target.style.border = '1px solid #E2E8F0')}
        />

        <Label optional>성별</Label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <ToggleBtn active={onb.sex === 'male'} onClick={() => pick('sex', 'male')}>수컷</ToggleBtn>
          <ToggleBtn active={onb.sex === 'female'} onClick={() => pick('sex', 'female')}>암컷</ToggleBtn>
        </div>

        <Label optional>중성화 여부</Label>
        <div style={{ display: 'flex', gap: 10 }}>
          <ToggleBtn active={onb.neutered === 'yes'} onClick={() => pick('neutered', 'yes')}>했어요</ToggleBtn>
          <ToggleBtn active={onb.neutered === 'no'} onClick={() => pick('neutered', 'no')}>안 했어요</ToggleBtn>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '12px 24px 24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <button
          onClick={handleStart}
          disabled={loading}
          style={{
            width: '100%', height: 52, border: 'none', borderRadius: 14,
            background: loading ? '#94A3B8' : '#028090',
            color: '#fff', fontSize: 16, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '저장 중...' : '시작하기'}
        </button>
      </div>
    </div>
  );
}
