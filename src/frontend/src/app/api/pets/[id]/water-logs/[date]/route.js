import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function PATCH(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const { id, date } = await params;
  const { amount_ml } = await request.json();
  if (amount_ml == null) return err(422, 'VALIDATION_ERROR', 'amount_ml는 필수입니다.');
  if (amount_ml < 0 || amount_ml > 9999) return err(422, 'WATER_OUT_OF_RANGE', '음수량은 0~9999ml 사이여야 합니다.');

  const sb = supabaseForUser(auth.token);
  const { data, error } = await sb.from('water_logs').update({ amount_ml }).eq('pet_id', id).eq('recorded_date', date).select().single();
  if (error || !data) return err(404, 'WATER_LOG_NOT_FOUND', '해당 날짜의 음수량 기록이 없습니다.');
  return ok(data);
}
