'use client';

import { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import { upsert, TODAY, ymd } from '@/utils/helpers';
import { supabase } from '@/lib/supabase-client';

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
  weights: [],
  waters: [],
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
  token: null,
  petId: null,
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

  const registerUser = useCallback(async (token) => {
    await fetch('/api/auth/social', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }, []);

  const loadUserPet = useCallback(async (token) => {
    const res = await fetch('/api/pets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] ?? null;
  }, []);

  const loadPetData = useCallback(async (token, petId) => {
    const from = ymd(new Date(Date.now() - 89 * 86400000));
    const [wRes, waRes] = await Promise.all([
      fetch(`/api/pets/${petId}/weights?from=${from}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/pets/${petId}/water-logs?from=${from}`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const [wJson, waJson] = await Promise.all([wRes.json(), waRes.json()]);
    const weights = (wJson.data ?? []).map((r) => ({ date: r.recorded_date, value: Number(r.weight_kg) }));
    const waters = (waJson.data ?? []).map((r) => ({ date: r.recorded_date, value: Number(r.amount_ml) }));
    set({ weights, waters });
  }, [set]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const token = session.access_token;
      await registerUser(token);
      const pet = await loadUserPet(token);
      if (pet) {
        set({ profile: { name: pet.name, species: pet.species, breed: pet.breed ?? '', birth: pet.birth_date ?? '', sex: pet.gender ?? '', neutered: pet.is_neutered ? 'yes' : 'no', photoUrl: pet.photo_url ?? null }, petId: pet.id, token });
        await loadPetData(token, pet.id);
        nav('home');
      } else {
        set({ token });
        nav('onb');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        set({ token: null, petId: null });
        nav('login');
        return;
      }
      const token = session.access_token;
      await registerUser(token);
      const pet = await loadUserPet(token);
      if (pet) {
        set({ profile: { name: pet.name, species: pet.species, breed: pet.breed ?? '', birth: pet.birth_date ?? '', sex: pet.gender ?? '', neutered: pet.is_neutered ? 'yes' : 'no', photoUrl: pet.photo_url ?? null }, petId: pet.id, token });
        await loadPetData(token, pet.id);
        nav('home');
      } else {
        set({ token });
        nav('onb');
      }
    });

    return () => subscription.unsubscribe();
  }, [nav, set, registerUser, loadUserPet, loadPetData]);

  const showToast = useCallback(
    (bg, msg) => {
      set({ toast: { bg, msg } });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => set({ toast: null }), 2400);
    },
    [set]
  );

  return (
    <AppContext.Provider value={{ state, set, nav, showToast, loadPetData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
