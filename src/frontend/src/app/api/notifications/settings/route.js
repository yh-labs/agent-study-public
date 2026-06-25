import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function GET(request) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const sb = supabaseForUser(auth.token);

  const { data, error } = await sb.from('user_settings')
    .select('bowl_capacity_ml, reminder_enabled, reminder_time, anomaly_alert_enabled, report_alert_enabled')
    .eq('user_id', auth.user.id)
    .single();

  if (error || !data) return err(404, 'NOT_FOUND', '알림 설정을 찾을 수 없습니다.');
  return ok(data);
}

export async function PATCH(request) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const sb = supabaseForUser(auth.token);
  const body = await request.json();
  const allowed = ['bowl_capacity_ml', 'reminder_enabled', 'reminder_time', 'anomaly_alert_enabled', 'report_alert_enabled'];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await sb.from('user_settings').update(updates).eq('user_id', auth.user.id).select().single();
  if (error || !data) return err(500, 'INTERNAL_SERVER_ERROR', error?.message);
  return ok(data, '알림 설정이 변경되었습니다.');
}
