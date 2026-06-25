import { getAuthUser, unauthorized, created, err } from '@/lib/auth';
import { supabaseForUser } from '@/lib/supabase-server';

export async function POST(request) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  const sb = supabaseForUser(auth.token);
  const { name, species, breed, birth_date, gender, is_neutered, photo_url } = await request.json();

  if (!name || !species) return err(422, 'VALIDATION_ERROR', 'name, species는 필수입니다.');

  const { data, error } = await sb
    .from('pets')
    .insert({ user_id: auth.user.id, name, species, breed, birth_date, gender, is_neutered: is_neutered ?? false, photo_url })
    .select().single();

  if (error) return err(500, 'INTERNAL_SERVER_ERROR', error.message);
  return created(data);
}
