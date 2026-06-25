import { supabase } from './supabase.js';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function request(method, path, body) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

export const api = {
  // 인증
  syncUser: () => request('POST', '/api/auth/social'),
  deleteAccount: () => request('DELETE', '/api/auth/me'),

  // 반려동물
  createPet: (body) => request('POST', '/api/pets', body),
  getPet: (id) => request('GET', `/api/pets/${id}`),
  updatePet: (id, body) => request('PATCH', `/api/pets/${id}`, body),
  deletePet: (id) => request('DELETE', `/api/pets/${id}`),

  // 체중
  upsertWeight: (petId, body) => request('POST', `/api/pets/${petId}/weights`, body),
  getWeights: (petId, from, to) => request('GET', `/api/pets/${petId}/weights?from=${from}&to=${to}`),
  updateWeight: (petId, date, body) => request('PATCH', `/api/pets/${petId}/weights/${date}`, body),
  deleteWeight: (petId, date) => request('DELETE', `/api/pets/${petId}/weights/${date}`),

  // 음수량
  upsertWater: (petId, body) => request('POST', `/api/pets/${petId}/water-logs`, body),
  getWaterLogs: (petId, from, to) => request('GET', `/api/pets/${petId}/water-logs?from=${from}&to=${to}`),
  updateWater: (petId, date, body) => request('PATCH', `/api/pets/${petId}/water-logs/${date}`, body),

  // 리포트
  getReports: (petId) => request('GET', `/api/pets/${petId}/reports`),
  getReport: (petId, year, month) => request('GET', `/api/pets/${petId}/reports/${year}/${month}`),

  // 알림 설정
  getNotifSettings: () => request('GET', '/api/notifications/settings'),
  updateNotifSettings: (body) => request('PATCH', '/api/notifications/settings', body),
  subscribePush: (body) => request('POST', '/api/notifications/subscribe', body),
};
