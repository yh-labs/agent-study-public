'use client';

import { useApp } from '@/context/AppContext';

export default function SheetBackdrop({ children }) {
  const { set } = useApp();
  return (
    <div
      onClick={() => set({ sheet: null })}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.38)',
        zIndex: 100,
        animation: 'petFade .2s ease',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '0 20px 28px',
          animation: 'petSheet .3s ease',
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: '#CBD5E1',
            borderRadius: 2,
            margin: '12px auto 20px',
          }}
        />
        {children}
      </div>
    </div>
  );
}
