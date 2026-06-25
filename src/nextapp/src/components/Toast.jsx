'use client';

import { useApp } from '@/context/AppContext';

export default function Toast() {
  const { state } = useApp();
  const { toast } = state;

  if (!toast) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        background: toast.bg,
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        zIndex: 200,
        animation: 'petToast .25s ease',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      }}
    >
      {toast.msg}
    </div>
  );
}
