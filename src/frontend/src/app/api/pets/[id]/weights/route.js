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

  let query = sb.from('weight_logs').select('*').eq('pet_id', id).order('recorded_date', { ascending: true });
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
  const { recorded_date, weight_kg } = await request.json();
  if (!recorded_date || weight_kg == null) return err(422, 'VALIDATION_ERROR', 'recorded_date, weight_kg는 필수입니다.');
  if (weight_kg < 0.1 || weight_kg > 99.9) return err(422, 'WEIGHT_OUT_OF_RANGE', '체중은 0.1~99.9kg 사이여야 합니다.');

  const sb = supabaseForUser(auth.token);
  const { data: recent } = await sb.from('weight_logs').select('weight_kg').eq('pet_id', id).lt('recorded_date', recorded_date).order('recorded_date', { ascending: false }).limit(7);
  let is_anomaly = false;
  if (recent && recent.length >= 3) {
    const avg = recent.reduce((s, r) => s + Number(r.weight_kg), 0) / recent.length;
    is_anomaly = weight_kg < avg * 0.9;
  }

  const { data, error } = await sb.from('weight_logs')
    .upsert({ pet_id: id, user_id: auth.user.id, recorded_date, weight_kg, is_anomaly }, { onConflict: 'pet_id,recorded_date' })
    .select().single();

  if (error) return err(500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(data);
}
