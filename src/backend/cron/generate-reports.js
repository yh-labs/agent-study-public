import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { ok, err } from '../lib/response.js';

const router = Router();

// POST /api/cron/generate-reports
// Vercel Cron Job이 매월 1일 00:05에 호출 (vercel.json 설정)
router.post('/generate-reports', async (req, res) => {
  // Cron 시크릿 검증
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const now = new Date();
  // 전월 기준
  const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay  = new Date(year, month, 0).toISOString().slice(0, 10);

  const { data: pets, error: petsErr } = await supabaseAdmin
    .from('pets')
    .select('id, user_id');

  if (petsErr) return err(res, 500, 'INTERNAL_SERVER_ERROR', petsErr.message);

  const results = await Promise.allSettled(pets.map(async (pet) => {
    const [{ data: weights }, { data: waters }] = await Promise.all([
      supabaseAdmin.from('weight_logs').select('recorded_date, weight_kg, is_anomaly')
        .eq('pet_id', pet.id).gte('recorded_date', firstDay).lte('recorded_date', lastDay),
      supabaseAdmin.from('water_logs').select('recorded_date, amount_ml')
        .eq('pet_id', pet.id).gte('recorded_date', firstDay).lte('recorded_date', lastDay),
    ]);

    const wVals  = (weights ?? []).map(r => Number(r.weight_kg));
    const waVals = (waters ?? []).map(r => r.amount_ml);

    const avg_weight_kg = wVals.length  ? +(wVals.reduce((a,b)=>a+b,0) / wVals.length).toFixed(2)  : null;
    const avg_water_ml  = waVals.length ? Math.round(waVals.reduce((a,b)=>a+b,0) / waVals.length)   : null;
    const anomaly_count = (weights ?? []).filter(r => r.is_anomaly).length;
    const record_days   = new Set([...(weights??[]).map(r=>r.recorded_date), ...(waters??[]).map(r=>r.recorded_date)]).size;

    const daily_weight_data = (weights ?? []).map(r => ({ date: r.recorded_date, weight_kg: Number(r.weight_kg) }));
    const daily_water_data  = (waters ?? []).map(r => ({ date: r.recorded_date, amount_ml: r.amount_ml }));
    const anomaly_dates     = (weights ?? []).filter(r => r.is_anomaly).map(r => r.recorded_date);

    await supabaseAdmin.from('monthly_reports').upsert({
      pet_id: pet.id, user_id: pet.user_id, year, month,
      avg_weight_kg, avg_water_ml, anomaly_count, record_days,
      daily_weight_data, daily_water_data, anomaly_dates,
      status: 'completed',
    }, { onConflict: 'pet_id,year,month' });
  }));

  const failed = results.filter(r => r.status === 'rejected').length;
  return ok(res, { total: pets.length, failed }, `월간 리포트 생성 완료 (실패: ${failed}건)`);
});

export default router;
