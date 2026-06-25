import { getAuthUser, unauthorized, ok, err } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const { user } = auth;

  const provider = user.app_metadata?.provider ?? 'unknown';
  const email = user.email ?? '';

  const { error } = await supabaseAdmin
    .from('users')
    .upsert({ id: user.id, email, provider }, { onConflict: 'id' });

  if (error) return err(500, 'INTERNAL_SERVER_ERROR', error.message);

  await supabaseAdmin
    .from('user_settings')
    .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true });

  return ok({ user_id: user.id, email, provider });
}
