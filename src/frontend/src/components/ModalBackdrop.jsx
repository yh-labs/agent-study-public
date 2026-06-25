export default function ModalBackdrop({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'petFade .2s ease',
        padding: '0 24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '24px 20px 20px',
          width: '100%',
          animation: 'petPop .2s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}
