import { Router } from 'express';
import { requireAuth } from '../../lib/auth.js';
import { supabaseForUser, supabaseAdmin } from '../../lib/supabase.js';
import { ok, created, err } from '../../lib/response.js';

const router = Router();

// POST /api/pets
router.post('/', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { name, species, breed, birth_date, gender, is_neutered, photo_url } = req.body;

  if (!name || !species) return err(res, 422, 'VALIDATION_ERROR', 'name, species는 필수입니다.');

  const { data, error } = await sb
    .from('pets')
    .insert({ user_id: req.user.id, name, species, breed, birth_date, gender, is_neutered: is_neutered ?? false, photo_url })
    .select()
    .single();

  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return created(res, data);
});

// GET /api/pets/:id
router.get('/:id', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { data, error } = await sb.from('pets').select('*').eq('id', req.params.id).single();

  if (error || !data) return err(res, 404, 'PET_NOT_FOUND', '반려동물 프로필을 찾을 수 없습니다.');
  return ok(res, data);
});

// PATCH /api/pets/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const allowed = ['name', 'species', 'breed', 'birth_date', 'gender', 'is_neutered', 'photo_url'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await sb
    .from('pets')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return err(res, 404, 'PET_NOT_FOUND', '반려동물 프로필을 찾을 수 없습니다.');
  return ok(res, data);
});

// DELETE /api/pets/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { error } = await sb.from('pets').delete().eq('id', req.params.id);

  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, null, '반려동물 프로필이 삭제되었습니다.');
});

// -------------------------------------------------------
// 체중 기록
// -------------------------------------------------------

// POST /api/pets/:id/weights  (Upsert)
router.post('/:id/weights', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { recorded_date, weight_kg } = req.body;

  if (!recorded_date || weight_kg == null) return err(res, 422, 'VALIDATION_ERROR', 'recorded_date, weight_kg는 필수입니다.');
  if (weight_kg < 0.1 || weight_kg > 99.9) return err(res, 422, 'WEIGHT_OUT_OF_RANGE', '체중은 0.1~99.9kg 사이여야 합니다.');

  // 이상 징후 판단: 최근 7일 평균 대비 10% 이상 감소
  const { data: recent } = await sb
    .from('weight_logs')
    .select('weight_kg')
    .eq('pet_id', req.params.id)
    .lt('recorded_date', recorded_date)
    .order('recorded_date', { ascending: false })
    .limit(7);

  let is_anomaly = false;
  if (recent && recent.length >= 3) {
    const avg = recent.reduce((s, r) => s + Number(r.weight_kg), 0) / recent.length;
    is_anomaly = weight_kg < avg * 0.9;
  }

  const { data, error } = await sb
    .from('weight_logs')
    .upsert(
      { pet_id: req.params.id, user_id: req.user.id, recorded_date, weight_kg, is_anomaly },
      { onConflict: 'pet_id,recorded_date' }
    )
    .select()
    .single();

  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, data);
});

// GET /api/pets/:id/weights?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/:id/weights', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { from, to } = req.query;

  let query = sb.from('weight_logs').select('*').eq('pet_id', req.params.id).order('recorded_date', { ascending: true });
  if (from) query = query.gte('recorded_date', from);
  if (to)   query = query.lte('recorded_date', to);

  const { data, error } = await query;
  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, data);
});

// PATCH /api/pets/:id/weights/:date
router.patch('/:id/weights/:date', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { weight_kg } = req.body;

  if (weight_kg == null) return err(res, 422, 'VALIDATION_ERROR', 'weight_kg는 필수입니다.');
  if (weight_kg < 0.1 || weight_kg > 99.9) return err(res, 422, 'WEIGHT_OUT_OF_RANGE', '체중은 0.1~99.9kg 사이여야 합니다.');

  const { data, error } = await sb
    .from('weight_logs')
    .update({ weight_kg })
    .eq('pet_id', req.params.id)
    .eq('recorded_date', req.params.date)
    .select()
    .single();

  if (error || !data) return err(res, 404, 'WEIGHT_NOT_FOUND', '해당 날짜의 체중 기록이 없습니다.');
  return ok(res, data);
});

// DELETE /api/pets/:id/weights/:date
router.delete('/:id/weights/:date', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { error } = await sb
    .from('weight_logs')
    .delete()
    .eq('pet_id', req.params.id)
    .eq('recorded_date', req.params.date);

  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, null, '체중 기록이 삭제되었습니다.');
});

// -------------------------------------------------------
// 음수량 기록
// -------------------------------------------------------

// POST /api/pets/:id/water-logs  (Upsert)
router.post('/:id/water-logs', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { recorded_date, amount_ml } = req.body;

  if (!recorded_date || amount_ml == null) return err(res, 422, 'VALIDATION_ERROR', 'recorded_date, amount_ml는 필수입니다.');
  if (amount_ml < 0 || amount_ml > 9999) return err(res, 422, 'WATER_OUT_OF_RANGE', '음수량은 0~9999ml 사이여야 합니다.');

  const { data, error } = await sb
    .from('water_logs')
    .upsert(
      { pet_id: req.params.id, user_id: req.user.id, recorded_date, amount_ml },
      { onConflict: 'pet_id,recorded_date' }
    )
    .select()
    .single();

  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, data);
});

// GET /api/pets/:id/water-logs?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/:id/water-logs', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { from, to } = req.query;

  let query = sb.from('water_logs').select('*').eq('pet_id', req.params.id).order('recorded_date', { ascending: true });
  if (from) query = query.gte('recorded_date', from);
  if (to)   query = query.lte('recorded_date', to);

  const { data, error } = await query;
  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, data);
});

// PATCH /api/pets/:id/water-logs/:date
router.patch('/:id/water-logs/:date', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { amount_ml } = req.body;

  if (amount_ml == null) return err(res, 422, 'VALIDATION_ERROR', 'amount_ml는 필수입니다.');
  if (amount_ml < 0 || amount_ml > 9999) return err(res, 422, 'WATER_OUT_OF_RANGE', '음수량은 0~9999ml 사이여야 합니다.');

  const { data, error } = await sb
    .from('water_logs')
    .update({ amount_ml })
    .eq('pet_id', req.params.id)
    .eq('recorded_date', req.params.date)
    .select()
    .single();

  if (error || !data) return err(res, 404, 'WATER_LOG_NOT_FOUND', '해당 날짜의 음수량 기록이 없습니다.');
  return ok(res, data);
});

// -------------------------------------------------------
// 월간 리포트
// -------------------------------------------------------

// GET /api/pets/:id/reports
router.get('/:id/reports', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { data, error } = await sb
    .from('monthly_reports')
    .select('id, year, month, avg_weight_kg, avg_water_ml, anomaly_count, record_days, status, pdf_url')
    .eq('pet_id', req.params.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) return err(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
  return ok(res, data);
});

// GET /api/pets/:id/reports/:year/:month
router.get('/:id/reports/:year/:month', requireAuth, async (req, res) => {
  const sb = supabaseForUser(req.accessToken);
  const { data, error } = await sb
    .from('monthly_reports')
    .select('*')
    .eq('pet_id', req.params.id)
    .eq('year', req.params.year)
    .eq('month', req.params.month)
    .single();

  if (error || !data) return err(res, 404, 'REPORT_NOT_FOUND', '해당 월의 리포트를 찾을 수 없습니다.');
  return ok(res, data);
});

export default router;
