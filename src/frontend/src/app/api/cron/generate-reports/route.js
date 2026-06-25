import { supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  if (request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const now = new Date();
  const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay  = new Date(year, month, 0).toISOString().slice(0, 10);

  const { data: pets } = await supabaseAdmin.from('pets').select('id, user_id');
  if (!pets) return NextResponse.json({ success: false }, { status: 500 });

  const results = await Promise.allSettled(pets.map(async (pet) => {
    const [{ data: weights }, { data: waters }] = await Promise.all([
      supabaseAdmin.from('weight_logs').select('recorded_date, weight_kg, is_anomaly').eq('pet_id', pet.id).gte('recorded_date', firstDay).lte('recorded_date', lastDay),
      supabaseAdmin.from('water_logs').select('recorded_date, amount_ml').eq('pet_id', pet.id).gte('recorded_date', firstDay).lte('recorded_date', lastDay),
    ]);
    const wVals  = (weights ?? []).map(r => Number(r.weight_kg));
    const waVals = (waters ?? []).map(r => r.amount_ml);
    const avg_weight_kg = wVals.length  ? +(wVals.reduce((a,b)=>a+b,0)/wVals.length).toFixed(2)  : null;
    const avg_water_ml  = waVals.length ? Math.round(waVals.reduce((a,b)=>a+b,0)/waVals.length)   : null;
    const anomaly_count = (weights ?? []).filter(r => r.is_anomaly).length;
    const record_days   = new Set([...(weights??[]).map(r=>r.recorded_date), ...(waters??[]).map(r=>r.recorded_date)]).size;

    await supabaseAdmin.from('monthly_reports').upsert({
      pet_id: pet.id, user_id: pet.user_id, year, month,
      avg_weight_kg, avg_water_ml, anomaly_count, record_days,
      daily_weight_data: (weights??[]).map(r=>({date:r.recorded_date,weight_kg:Number(r.weight_kg)})),
      daily_water_data:  (waters??[]).map(r=>({date:r.recorded_date,amount_ml:r.amount_ml})),
      anomaly_dates: (weights??[]).filter(r=>r.is_anomaly).map(r=>r.recorded_date),
      status: 'completed',
    }, { onConflict: 'pet_id,year,month' });
  }));

  const failed = results.filter(r => r.status === 'rejected').length;
  return NextResponse.json({ success: true, total: pets.length, failed });
}
