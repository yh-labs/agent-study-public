import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function POST(request) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const sb = supabaseForUser(auth.token);
  const { endpoint, p256dh, auth: authKey } = await request.json();

  if (!endpoint || !p256dh || !authKey) return err(422, 'VALIDATION_ERROR', 'endpoint, p256dh, auth는 필수입니다.');

  const { data, error } = await sb.from('push_subscriptions')
    .upsert(
      { user_id: auth.user.id, endpoint, p256dh, auth: authKey, user_agent: request.headers.get('user-agent') ?? '', is_active: true },
      { onConflict: 'user_id,endpoint' }
    ).select().single();

  if (error) return err(422, 'PUSH_SUBSCRIPTION_FAILED', error.message);
  return ok(data, '푸시 알림 구독이 등록되었습니다.');
}
