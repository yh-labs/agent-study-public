export const ok = (res, data, message = '요청이 처리되었습니다.') =>
  res.status(200).json({ success: true, data, message });

export const created = (res, data) =>
  res.status(201).json({ success: true, data, message: '생성되었습니다.' });

export const err = (res, status, code, message) =>
  res.status(status).json({ success: false, error: { code, message } });
