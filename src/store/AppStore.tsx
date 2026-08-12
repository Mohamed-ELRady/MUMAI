import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mumai:v1';

export interface BabyProfile {
  name: string;
  birthDateISO: string;
}

interface PersistedState {
  profile: BabyProfile | null;
  completedMilestoneIds: string[];
}

interface AppStoreValue extends PersistedState {
  isLoading: boolean;
  setProfile: (profile: BabyProfile) => void;
  toggleMilestone: (milestoneId: string) => void;
  isMilestoneDone: (milestoneId: string) => boolean;
  resetProfile: () => void;
}

const defaultState: PersistedState = { profile: null, completedMilestoneIds: [] };

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoading) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, isLoading]);

  const value = useMemo<AppStoreValue>(
    () => ({
      ...state,
      isLoading,
      setProfile: (profile) => setState((s) => ({ ...s, profile })),
      toggleMilestone: (milestoneId) =>
        setState((s) => {
          const has = s.completedMilestoneIds.includes(milestoneId);
          return {
            ...s,
            completedMilestoneIds: has
              ? s.completedMilestoneIds.filter((id) => id !== milestoneId)
              : [...s.completedMilestoneIds, milestoneId],
          };
        }),
      isMilestoneDone: (milestoneId) => state.completedMilestoneIds.includes(milestoneId),
      resetProfile: () => setState(defaultState),
    }),
    [state, isLoading]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
