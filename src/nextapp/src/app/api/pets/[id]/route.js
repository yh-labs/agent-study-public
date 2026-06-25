import { getAuthUser, unauthorized, ok, created, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function GET(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const sb = supabaseForUser(auth.token);
  const { id } = await params;

  const { data, error } = await sb.from('pets').select('*').eq('id', id).single();
  if (error || !data) return err(404, 'PET_NOT_FOUND', '반려동물 프로필을 찾을 수 없습니다.');
  return ok(data);
}

export async function PATCH(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const sb = supabaseForUser(auth.token);
  const { id } = await params;
  const body = await request.json();
  const allowed = ['name', 'species', 'breed', 'birth_date', 'gender', 'is_neutered', 'photo_url'];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await sb.from('pets').update(updates).eq('id', id).select().single();
  if (error || !data) return err(404, 'PET_NOT_FOUND', '반려동물 프로필을 찾을 수 없습니다.');
  return ok(data);
}

export async function DELETE(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const sb = supabaseForUser(auth.token);
  const { id } = await params;

  const { error } = await sb.from('pets').delete().eq('id', id);
  if (error) return err(500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(null, '반려동물 프로필이 삭제되었습니다.');
}
