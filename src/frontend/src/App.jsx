import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import { RecordSheet, NotifSheet, TimeSheet, BowlSheet } from './components/Sheets';

import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import WeightRecordScreen from './screens/WeightRecordScreen';
import WaterRecordScreen from './screens/WaterRecordScreen';
import WeightHistoryScreen from './screens/WeightHistoryScreen';
import ReportsScreen from './screens/ReportsScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import MypageScreen from './screens/MypageScreen';

const SCREENS = {
  login: LoginScreen,
  onb: OnboardingScreen,
  home: HomeScreen,
  wrec: WeightRecordScreen,
  water: WaterRecordScreen,
  whist: WeightHistoryScreen,
  reports: ReportsScreen,
  detail: ReportDetailScreen,
  settings: SettingsScreen,
  mypage: MypageScreen,
};

function PhoneFrame() {
  const { state } = useApp();
  const { screen, offline } = state;
  const Screen = SCREENS[screen] || HomeScreen;

  return (
    <div
      style={{
        width: 393,
        height: 852,
        background: '#0c1417',
        borderRadius: 54,
        padding: 11,
        boxShadow: '0 40px 90px -20px rgba(15,23,42,0.55), 0 0 0 2px rgba(255,255,255,0.04) inset',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#F8FAFC',
          borderRadius: 43,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Dynamic island */}
        <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 108, height: 30, background: '#0c1417', borderRadius: 16, zIndex: 90 }} />

        {/* 상태바 */}
        <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px 0 28px', flexShrink: 0, fontWeight: 600, fontSize: 15, color: '#1E293B', zIndex: 5 }}>
          <span style={{ letterSpacing: '0.3px' }}>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width={18} height={12} viewBox="0 0 18 12" fill="#1E293B">
              <rect x={0} y={7} width={3} height={5} rx={1} />
              <rect x={5} y={4.5} width={3} height={7.5} rx={1} />
              <rect x={10} y={2} width={3} height={10} rx={1} />
              <rect x={15} y={0} width={3} height={12} rx={1} />
            </svg>
            <svg width={17} height={12} viewBox="0 0 17 12" fill="none" stroke="#1E293B" strokeWidth={1.4}>
              <path d="M1 4.2C3.2 2.2 5.8 1 8.5 1S13.8 2.2 16 4.2" />
              <path d="M3.4 6.6C4.9 5.3 6.6 4.6 8.5 4.6s3.6.7 5.1 2" />
              <circle cx={8.5} cy={9.6} r={1.2} fill="#1E293B" stroke="none" />
            </svg>
            <svg width={26} height={13} viewBox="0 0 26 13" fill="none">
              <rect x={0.5} y={0.5} width={22} height={12} rx={3} stroke="#1E293B" strokeOpacity={0.5} />
              <rect x={2} y={2} width={17} height={9} rx={1.5} fill="#1E293B" />
              <rect x={24} y={4} width={2} height={5} rx={1} fill="#1E293B" fillOpacity={0.5} />
            </svg>
          </div>
        </div>

        {/* 오프라인 배너 */}
        {offline && (
          <div style={{ background: '#028090', color: '#fff', fontSize: 13, fontWeight: 500, padding: '8px 16px', textAlign: 'center', flexShrink: 0 }}>
            오프라인 모드 · 기록은 저장돼요
          </div>
        )}

        {/* 화면 영역 */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <Screen key={screen} />

          {/* 시트/모달 오버레이 */}
          <RecordSheet />
          <NotifSheet />
          <TimeSheet />
          <BowlSheet />

          {/* 토스트 */}
          <Toast />
        </div>

        {/* 바텀 네비게이션 */}
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PhoneFrame />
    </AppProvider>
  );
}
