import { Router } from 'express';
import { requireAuth } from '../../lib/auth.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { ok, err } from '../../lib/response.js';

const router = Router();

// POST /api/auth/social
// Supabase Auth가 소셜 로그인을 처리하므로, 이 엔드포인트는 users 테이블 동기화 역할
router.post('/social', requireAuth, async (req, res) => {
  const { user } = req;
  const provider = user.app_metadata?.provider ?? 'unknown';
  const email = user.email ?? '';

  const { error } = await supabaseAdmin
    .from('users')
    .upsert({ id: user.id, email, provider }, { onConflict: 'id', ignoreDuplicates: false });

  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);

  // user_settings 기본값 생성 (없는 경우에만)
  await supabaseAdmin
    .from('user_settings')
    .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true });

  return ok(res, { user_id: user.id, email, provider });
});

// DELETE /api/auth/me — 소프트 삭제
router.delete('/me', requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', req.user.id);

  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, null, '회원 탈퇴가 처리되었습니다.');
});

export default router;
