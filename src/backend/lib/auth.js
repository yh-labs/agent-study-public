import { supabaseAdmin } from './supabase.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: '인증 토큰이 필요합니다.' } });
  }
  const token = header.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: '유효하지 않은 토큰입니다.' } });
  }
  req.user = user;
  req.accessToken = token;
  next();
}
