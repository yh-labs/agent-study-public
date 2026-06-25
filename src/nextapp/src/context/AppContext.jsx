'use client';

import { createContext, useContext, useReducer, useRef, useCallback } from 'react';
import { generateDemoData, upsert, TODAY } from '@/utils/helpers';

const { weights, waters } = generateDemoData();

const initialState = {
  screen: 'login',
  sheet: null,
  modal: null,
  pdfOpen: false,
  pdfLoading: false,
  toast: null,
  offline: false,
  profile: {
    name: '초코',
    species: 'dog',
    breed: '말티즈',
    birth: '2011.03.15',
    sex: 'male',
    neutered: 'yes',
  },
  onb: { name: '', species: '', breed: '', birth: '', sex: '', neutered: '' },
  weights,
  waters,
  homeRange: 30,
  histRange: 30,
  reportMonth: '2026-05',
  reportTab: 'weight',
  wValue: '',
  waterMode: 'direct',
  waterValue: 120,
  bowlTimes: 2,
  bowlRemain: '60',
  settings: {
    reminder: true,
    reminderTime: '20:00',
    anomaly: true,
    report: true,
    bowlCap: 300,
  },
  edit: null,
  pickH: '20',
  pickM: '00',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, ...action.payload };
    case 'NAV':
      return { ...state, screen: action.screen, sheet: null, modal: null };
    case 'UPSERT_WEIGHT': {
      const weights = upsert(state.weights, TODAY, action.value);
      return { ...state, weights };
    }
    case 'UPSERT_WATER': {
      const waters = upsert(state.waters, TODAY, action.value);
      return { ...state, waters };
    }
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimer = useRef(null);

  const set = useCallback((payload) => dispatch({ type: 'SET', payload }), []);
  const nav = useCallback((screen) => dispatch({ type: 'NAV', screen }), []);

  const showToast = useCallback(
    (bg, msg) => {
      set({ toast: { bg, msg } });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => set({ toast: null }), 2400);
    },
    [set]
  );

  return (
    <AppContext.Provider value={{ state, set, nav, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
