import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MILESTONES } from '../data/milestones';
import { BabyProfile, PersistedState, createWriteQueue, defaultState, restoreState, validateProfile } from './persistedState';
export type { BabyProfile } from './persistedState';

const STORAGE_KEY = 'mumai:v1';
const persist = createWriteQueue((value) => AsyncStorage.setItem(STORAGE_KEY, value));

interface AppStoreValue extends PersistedState {
  isLoading: boolean;
  storageError: 'load' | 'save' | null;
  retryStorage: () => void;
  setProfile: (profile: BabyProfile) => void;
  toggleMilestone: (milestoneId: string) => void;
  isMilestoneDone: (milestoneId: string) => boolean;
  resetProfile: () => void;
}

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<'load' | 'save' | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [revision, setRevision] = useState(0);
  const latestRevision = useRef(0);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const restored = restoreState(raw);
      if (active) { setState(restored); setStorageError(null); }
    }).catch(() => {
      if (active) setStorageError('load');
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [loadAttempt]);

  useEffect(() => {
    // Merely opening the app must never overwrite an unreadable saved profile.
    if (isLoading || revision === 0) return;
    let active = true;
    persist(JSON.stringify(state)).then(() => {
      if (active && latestRevision.current === revision) setStorageError(null);
    }).catch(() => {
      if (active && latestRevision.current === revision) setStorageError('save');
    });
    return () => { active = false; };
  }, [state, revision, isLoading]);

  function markChanged() {
    latestRevision.current += 1;
    setRevision(latestRevision.current);
  }

  const value = useMemo<AppStoreValue>(() => ({
    ...state, isLoading, storageError,
    retryStorage: () => {
      if (storageError === 'load' && revision === 0) {
        setIsLoading(true);
        setLoadAttempt((attempt) => attempt + 1);
      } else markChanged();
    },
    setProfile: (profile) => {
      const valid = validateProfile(profile);
      if (!valid || isLoading) return;
      setState((previous) => ({ ...previous, profile: valid }));
      markChanged();
    },
    toggleMilestone: (milestoneId) => {
      if (isLoading || !state.profile || !MILESTONES.some((item) => item.id === milestoneId)) return;
      setState((previous) => ({
        ...previous,
        completedMilestoneIds: previous.completedMilestoneIds.includes(milestoneId)
          ? previous.completedMilestoneIds.filter((id) => id !== milestoneId)
          : [...previous.completedMilestoneIds, milestoneId],
      }));
      markChanged();
    },
    isMilestoneDone: (id) => state.completedMilestoneIds.includes(id),
    resetProfile: () => { setState(defaultState); markChanged(); },
  }), [state, isLoading, storageError, revision]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
