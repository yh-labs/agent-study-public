import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function GET(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const sb = supabaseForUser(auth.token);

  let query = sb.from('water_logs').select('*').eq('pet_id', id).order('recorded_date', { ascending: true });
  if (from) query = query.gte('recorded_date', from);
  if (to)   query = query.lte('recorded_date', to);

  const { data, error } = await query;
  if (error) return err(500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(data);
}

export async function POST(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const { id } = await params;
  const { recorded_date, amount_ml } = await request.json();
  if (!recorded_date || amount_ml == null) return err(422, 'VALIDATION_ERROR', 'recorded_date, amount_ml는 필수입니다.');
  if (amount_ml < 0 || amount_ml > 9999) return err(422, 'WATER_OUT_OF_RANGE', '음수량은 0~9999ml 사이여야 합니다.');

  const sb = supabaseForUser(auth.token);
  const { data, error } = await sb.from('water_logs')
    .upsert({ pet_id: id, user_id: auth.user.id, recorded_date, amount_ml }, { onConflict: 'pet_id,recorded_date' })
    .select().single();

  if (error) return err(500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(data);
}
