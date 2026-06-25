import { supabaseAdmin } from './supabase-server';
import { NextResponse } from 'next/server';

export async function getAuthUser(request) {
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return { user, token };
}

export function unauthorized() {
  return NextResponse.json(
    { success: false, error: { code: 'AUTH_REQUIRED', message: '인증 토큰이 필요합니다.' } },
    { status: 401 }
  );
}

export const ok = (data, message = '요청이 처리되었습니다.') =>
  NextResponse.json({ success: true, data, message }, { status: 200 });

export const created = (data) =>
  NextResponse.json({ success: true, data, message: '생성되었습니다.' }, { status: 201 });

export const err = (status, code, message) =>
  NextResponse.json({ success: false, error: { code, message } }, { status });
