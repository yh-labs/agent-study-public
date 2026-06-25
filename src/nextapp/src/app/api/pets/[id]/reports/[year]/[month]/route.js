import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function GET(request, { params }) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const { id, year, month } = await params;
  const sb = supabaseForUser(auth.token);

  const { data, error } = await sb.from('monthly_reports')
    .select('*')
    .eq('pet_id', id)
    .eq('year', year)
    .eq('month', month)
    .single();

  if (error || !data) return err(404, 'REPORT_NOT_FOUND', '해당 월의 리포트를 찾을 수 없습니다.');
  return ok(data);
}
