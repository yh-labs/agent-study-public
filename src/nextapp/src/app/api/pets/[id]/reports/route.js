import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function GET(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const { id } = await params;
  const sb = supabaseForUser(auth.token);

  const { data, error } = await sb.from('monthly_reports')
    .select('id, year, month, avg_weight_kg, avg_water_ml, anomaly_count, record_days, status, pdf_url')
    .eq('pet_id', id)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) return err(500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(data);
}
