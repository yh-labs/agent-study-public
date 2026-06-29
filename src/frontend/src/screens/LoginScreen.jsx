'use client';

import { supabase } from '@/lib/supabase-client';

async function signInWith(provider) {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export default function LoginScreen() {

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 28px 40px',
        animation: 'petFade .4s ease',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #ECFBF6 100%)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 30,
            background: '#028090',
            boxShadow: '0 16px 30px -8px rgba(2,128,144,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span style={{ position: 'absolute', left: 30, top: 30, width: 14, height: 18, borderRadius: '50%', background: '#fff', transform: 'rotate(-20deg)' }} />
          <span style={{ position: 'absolute', left: 52, top: 30, width: 14, height: 18, borderRadius: '50%', background: '#fff', transform: 'rotate(20deg)' }} />
          <span style={{ position: 'absolute', left: 22, top: 40, width: 11, height: 14, borderRadius: '50%', background: '#02C39A' }} />
          <span style={{ position: 'absolute', left: 62, top: 40, width: 11, height: 14, borderRadius: '50%', background: '#02C39A' }} />
          <span style={{ position: 'absolute', left: 34, top: 50, width: 28, height: 24, borderRadius: '48% 48% 50% 50%', background: '#fff' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1E293B', letterSpacing: '-0.5px' }}>펫로그</div>
          <div style={{ fontSize: 16, color: '#64748B', marginTop: 10, lineHeight: 1.5 }}>
            오늘의 기록이<br />내일의 건강을 만든다
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => signInWith('kakao')}
          style={{
            height: 52,
            border: 'none',
            borderRadius: 14,
            background: '#FEE500',
            color: '#191919',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.8 2.6-.9 3-.1.5.2.5.4.4.2-.1 2.5-1.7 3.5-2.4.7.1 1.5.2 2.3.2 5.5 0 10-3.6 10-8s-4.5-8-10-8Z" />
          </svg>
          카카오로 시작하기
        </button>
        <button
          onClick={() => signInWith('google')}
          style={{
            height: 52,
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            background: '#fff',
            color: '#1E293B',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <svg width={19} height={19} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.8 3.2-7.9Z" />
            <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4Z" />
            <path fill="#EA4335" d="M12 5.6c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.6 3.2-4.6 6-4.6Z" />
          </svg>
          구글로 시작하기
        </button>
        <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6, margin: '8px 0 0' }}>
          로그인 시 <span style={{ color: '#64748B', textDecoration: 'underline' }}>개인정보처리방침</span> 및<br />
          <span style={{ color: '#64748B', textDecoration: 'underline' }}>서비스 이용약관</span>에 동의합니다
        </p>
      </div>
    </div>
  );
}
