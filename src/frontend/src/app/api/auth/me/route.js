import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function DELETE(request) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const { error: markErr } = await supabaseAdmin
    .from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', auth.user.id);

  if (markErr) return err(500, 'INTERNAL_SERVER_ERROR', markErr.message);

  const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(auth.user.id);
  if (authErr) return err(500, 'INTERNAL_SERVER_ERROR', authErr.message);

  return ok(null, '회원 탈퇴가 처리되었습니다.');
}
