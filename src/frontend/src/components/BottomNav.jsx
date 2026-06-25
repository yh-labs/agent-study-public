import { useApp } from '../context/AppContext';

const NAV_SCREENS = ['home', 'whist', 'reports', 'detail', 'settings', 'mypage'];
const TAB_FOR = { home: 'home', whist: 'home', reports: 'reports', detail: 'reports', settings: 'settings', mypage: 'my' };

export default function BottomNav() {
  const { state, nav, set } = useApp();
  const { screen, pdfOpen } = state;

  if (!NAV_SCREENS.includes(screen) || pdfOpen) return null;

  const at = TAB_FOR[screen] || '';
  const c = (t) => (at === t ? '#028090' : '#94A3B8');

  return (
    <div
      style={{
        flex: 'none',
        height: 64,
        borderTop: '1px solid #F1F5F9',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {[
        { id: 'home', label: '홈', icon: HomeIcon, action: () => nav('home') },
        {
          id: 'rec',
          label: '기록',
          icon: PlusIcon,
          action: () => set({ sheet: 'record' }),
          primary: true,
        },
        { id: 'reports', label: '리포트', icon: ReportIcon, action: () => nav('reports') },
        {
          id: 'my',
          label: 'MY',
          icon: MyIcon,
          action: () => set({ screen: 'mypage', edit: { ...state.profile }, modal: null, sheet: null }),
        },
        { id: 'settings', label: '설정', icon: SettingsIcon, action: () => nav('settings') },
      ].map(({ id, label, icon: Icon, action, primary }) => (
        <button
          key={id}
          onClick={action}
          style={{
            flex: 1,
            height: '100%',
            border: 'none',
            background: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            cursor: 'pointer',
          }}
        >
          <Icon color={primary ? '#94A3B8' : c(id)} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: primary ? '#94A3B8' : c(id),
            }}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

function HomeIcon({ color }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PlusIcon({ color }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <circle cx={12} cy={12} r={9} />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function ReportIcon({ color }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1={16} y1={13} x2={8} y2={13} />
      <line x1={16} y1={17} x2={8} y2={17} />
    </svg>
  );
}

function MyIcon({ color }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx={12} cy={7} r={4} />
    </svg>
  );
}

function SettingsIcon({ color }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={3} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
