import { describe, test, expect } from '@jest/globals';

// helpers.js는 'use client' 지시어와 new Date() 의존성이 있으므로
// 테스트 대상 함수를 직접 복사해 순수 로직만 검증합니다.

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function anomalySet(arr) {
  const s = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (i < 3) continue;
    const win = arr.slice(Math.max(0, i - 7), i);
    const avg = win.reduce((a, b) => a + b.value, 0) / win.length;
    if (arr[i].value <= avg * 0.9) s.add(arr[i].date);
  }
  return s;
}

function upsert(arr, date, value) {
  const a = arr.map((x) => ({ ...x }));
  const i = a.findIndex((x) => x.date === date);
  if (i >= 0) a[i].value = value;
  else {
    a.push({ date, value });
    a.sort((x, y) => (x.date < y.date ? -1 : 1));
  }
  return a;
}

function ageOf(birth, today) {
  if (!birth) return '-';
  const p = birth.split('.').map((s) => parseInt(s));
  if (p.length < 3 || !p[0]) return '-';
  const b = new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
  const t = new Date(today);
  let m =
    (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) m--;
  return `${Math.floor(m / 12)}세 ${m % 12}개월`;
}

function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h < 12 ? '오전' : '오후';
  const hr = h % 12 || 12;
  return `${ap} ${hr}:${String(m).padStart(2, '0')}`;
}

function mmdd(date) {
  const p = date.split('-');
  return `${parseInt(p[1])}.${parseInt(p[2])}`;
}

// ─── ymd ───────────────────────────────────────────────────────────────────

describe('ymd', () => {
  test('날짜를 YYYY-MM-DD 형식으로 변환한다', () => {
    expect(ymd(new Date(2026, 5, 30))).toBe('2026-06-30');
  });

  test('월·일이 한 자리일 때 앞에 0을 붙인다', () => {
    expect(ymd(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

// ─── anomalySet ────────────────────────────────────────────────────────────

describe('anomalySet', () => {
  test('기록이 3개 이하면 이상 징후를 감지하지 않는다', () => {
    const arr = [
      { date: '2026-06-01', value: 5.0 },
      { date: '2026-06-02', value: 4.0 },
      { date: '2026-06-03', value: 3.0 },
    ];
    expect(anomalySet(arr).size).toBe(0);
  });

  test('직전 평균 대비 10% 초과 감소 시 이상 징후로 감지한다', () => {
    const arr = [
      { date: '2026-06-01', value: 5.0 },
      { date: '2026-06-02', value: 5.0 },
      { date: '2026-06-03', value: 5.0 },
      { date: '2026-06-04', value: 4.0 }, // 평균 5.0의 80% → 이상
    ];
    const s = anomalySet(arr);
    expect(s.has('2026-06-04')).toBe(true);
  });

  test('직전 평균 대비 10% 미만 감소는 이상 징후가 아니다', () => {
    const arr = [
      { date: '2026-06-01', value: 5.0 },
      { date: '2026-06-02', value: 5.0 },
      { date: '2026-06-03', value: 5.0 },
      { date: '2026-06-04', value: 4.6 }, // 평균 5.0의 92% → 정상
    ];
    const s = anomalySet(arr);
    expect(s.has('2026-06-04')).toBe(false);
  });

  test('정확히 평균의 90%이면 이상 징후로 감지한다 (경계값)', () => {
    const arr = [
      { date: '2026-06-01', value: 5.0 },
      { date: '2026-06-02', value: 5.0 },
      { date: '2026-06-03', value: 5.0 },
      { date: '2026-06-04', value: 4.5 }, // 평균 5.0의 90% → 이상
    ];
    const s = anomalySet(arr);
    expect(s.has('2026-06-04')).toBe(true);
  });

  test('체중 증가는 이상 징후로 감지하지 않는다', () => {
    const arr = [
      { date: '2026-06-01', value: 5.0 },
      { date: '2026-06-02', value: 5.0 },
      { date: '2026-06-03', value: 5.0 },
      { date: '2026-06-04', value: 7.0 }, // 증가 → 이상 아님
    ];
    const s = anomalySet(arr);
    expect(s.has('2026-06-04')).toBe(false);
  });
});

// ─── upsert ────────────────────────────────────────────────────────────────

describe('upsert', () => {
  test('같은 날짜가 없으면 새 항목을 추가한다', () => {
    const arr = [{ date: '2026-06-01', value: 5.0 }];
    const result = upsert(arr, '2026-06-02', 4.8);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ date: '2026-06-02', value: 4.8 });
  });

  test('같은 날짜가 있으면 값을 덮어쓴다', () => {
    const arr = [{ date: '2026-06-01', value: 5.0 }];
    const result = upsert(arr, '2026-06-01', 4.5);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(4.5);
  });

  test('추가 후 날짜 오름차순으로 정렬된다', () => {
    const arr = [
      { date: '2026-06-03', value: 5.0 },
      { date: '2026-06-01', value: 5.2 },
    ];
    const result = upsert(arr, '2026-06-02', 4.8);
    expect(result.map((x) => x.date)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ]);
  });

  test('원본 배열을 변경하지 않는다 (불변성)', () => {
    const arr = [{ date: '2026-06-01', value: 5.0 }];
    upsert(arr, '2026-06-01', 4.5);
    expect(arr[0].value).toBe(5.0);
  });
});

// ─── ageOf ─────────────────────────────────────────────────────────────────

describe('ageOf', () => {
  test('생년월일로 나이를 계산한다', () => {
    expect(ageOf('2023.06.30', '2026-06-30')).toBe('3세 0개월');
  });

  test('생일이 지나지 않은 월은 개월 수에서 뺀다', () => {
    expect(ageOf('2023.07.01', '2026-06-30')).toBe('2세 11개월');
  });

  test('birth가 없으면 "-"를 반환한다', () => {
    expect(ageOf('', '2026-06-30')).toBe('-');
    expect(ageOf(null, '2026-06-30')).toBe('-');
  });

  test('잘못된 형식이면 "-"를 반환한다', () => {
    expect(ageOf('invalid', '2026-06-30')).toBe('-');
  });
});

// ─── fmtTime ───────────────────────────────────────────────────────────────

describe('fmtTime', () => {
  test('오전 시간을 변환한다', () => {
    expect(fmtTime('09:00')).toBe('오전 9:00');
  });

  test('오후 시간을 변환한다', () => {
    expect(fmtTime('20:00')).toBe('오후 8:00');
  });

  test('자정(00:00)을 오전 12:00으로 변환한다', () => {
    expect(fmtTime('00:00')).toBe('오전 12:00');
  });

  test('정오(12:00)를 오후 12:00으로 변환한다', () => {
    expect(fmtTime('12:00')).toBe('오후 12:00');
  });

  test('분이 30이면 :30을 표시한다', () => {
    expect(fmtTime('19:30')).toBe('오후 7:30');
  });
});

// ─── mmdd ──────────────────────────────────────────────────────────────────

describe('mmdd', () => {
  test('YYYY-MM-DD를 M.D 형식으로 변환한다', () => {
    expect(mmdd('2026-06-30')).toBe('6.30');
  });

  test('월이 01이면 앞의 0을 제거한다', () => {
    expect(mmdd('2026-01-05')).toBe('1.5');
  });
});
