import { Router } from 'express';
import { requireAuth } from '../../lib/auth.js';
import { supabaseForUser } from '../../lib/supabase.js';
import { ok, err } from '../../lib/response.js';

const router = Router();

// POST /api/notifications/subscribe
router.post('/subscribe', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { endpoint, p256dh, auth } = req.body;

  if (!endpoint || !p256dh || !auth) return err(res, 422, 'VALIDATION_ERROR', 'endpoint, p256dh, auth는 필수입니다.');

  const { data, error } = await sb
    .from('push_subscriptions')
    .upsert(
      { user_id: req.user.id, endpoint, p256dh, auth, user_agent: req.headers['user-agent'] ?? '', is_active: true },
      { onConflict: 'user_id,endpoint', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) return err(res, 422, 'PUSH_SUBSCRIPTION_FAILED', error.message);
  return ok(res, data, '푸시 알림 구독이 등록되었습니다.');
});

// GET /api/notifications/settings
router.get('/settings', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { data, error } = await sb
    .from('user_settings')
    .select('bowl_capacity_ml, reminder_enabled, reminder_time, anomaly_alert_enabled, report_alert_enabled')
    .eq('user_id', req.user.id)
    .single();

  if (error || !data) return err(res, 404, 'NOT_FOUND', '알림 설정을 찾을 수 없습니다.');
  return ok(res, data);
});

// PATCH /api/notifications/settings
router.patch('/settings', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const allowed = ['bowl_capacity_ml', 'reminder_enabled', 'reminder_time', 'anomaly_alert_enabled', 'report_alert_enabled'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await sb
    .from('user_settings')
    .update(updates)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error || !data) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, data, '알림 설정이 변경되었습니다.');
});

export default router;
