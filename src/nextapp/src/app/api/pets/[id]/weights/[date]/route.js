import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function PATCH(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const { id, date } = await params;
  const { weight_kg } = await request.json();
  if (weight_kg == null) return err(422, 'VALIDATION_ERROR', 'weight_kg는 필수입니다.');
  if (weight_kg < 0.1 || weight_kg > 99.9) return err(422, 'WEIGHT_OUT_OF_RANGE', '체중은 0.1~99.9kg 사이여야 합니다.');

  const sb = supabaseForUser(auth.token);
  const { data, error } = await sb.from('weight_logs').update({ weight_kg }).eq('pet_id', id).eq('recorded_date', date).select().single();
  if (error || !data) return err(404, 'WEIGHT_NOT_FOUND', '해당 날짜의 체중 기록이 없습니다.');
  return ok(data);
}

export async function DELETE(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const { id, date } = await params;
  const sb = supabaseForUser(auth.token);

  const { error } = await sb.from('weight_logs').delete().eq('pet_id', id).eq('recorded_date', date);
  if (error) return err(500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(null, '체중 기록이 삭제되었습니다.');
}
