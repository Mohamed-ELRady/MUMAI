import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';
import { MILESTONES } from '../data/milestones';
import {
  BabyProfile, ChatMessage, ChildData, MilestoneStatus, Observation, PersistedState,
  createEmptyChild, createWriteQueue, defaultState, restoreState, validateProfile,
} from './persistedState';
export type { BabyProfile, ChatMessage, ChildData, MilestoneStatus, Observation, SavedQuestion } from './persistedState';

const STORAGE_KEY = 'mumai:v1';
const persist = createWriteQueue((value) => AsyncStorage.setItem(STORAGE_KEY, value));
const emptyChildFields = { milestoneStatuses: {}, milestoneUpdatedAt: {}, weeklyActivityChecks: {}, observations: [], savedQuestions: [], chatMessages: [] };

function deleteManagedPhoto(uri?: string) {
  if (!uri || !uri.startsWith('file:') || !uri.includes('child-profile-')) return;
  try { new File(uri).delete(); } catch { /* A missing cache file is already private/deleted. */ }
}

interface AppStoreValue extends Omit<ChildData, 'id' | 'profile'> {
  profile: BabyProfile | null;
  activeChildId: string | null;
  children: ChildData[];
  completedMilestoneIds: string[];
  isLoading: boolean;
  storageError: 'load' | 'save' | null;
  retryStorage: () => void;
  createChild: (profile: BabyProfile) => void;
  setProfile: (profile: BabyProfile) => void;
  switchChild: (id: string) => void;
  deleteChild: (id: string) => void;
  deleteAllData: () => void;
  exportData: () => string;
  importData: (raw: string) => boolean;
  loadDemoData: () => void;
  setMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => void;
  toggleWeeklyActivity: (weekKey: string, activityId: string) => void;
  addObservation: (text: string, milestoneId?: string) => void;
  removeObservation: (id: string) => void;
  recordQuestion: (text: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  clearChatMessages: () => void;
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
    }).catch(() => { if (active) setStorageError('load'); }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [loadAttempt]);

  useEffect(() => {
    if (isLoading || revision === 0) return;
    let active = true;
    persist(JSON.stringify(state)).then(() => {
      if (active && latestRevision.current === revision) setStorageError(null);
    }).catch(() => { if (active && latestRevision.current === revision) setStorageError('save'); });
    return () => { active = false; };
  }, [state, revision, isLoading]);

  function markChanged() { latestRevision.current += 1; setRevision(latestRevision.current); }
  const activeChild = state.children.find((child) => child.id === state.activeChildId) ?? state.children[0] ?? null;

  function updateActive(updater: (child: ChildData) => ChildData) {
    if (!activeChild || isLoading) return;
    setState((previous) => ({ ...previous, children: previous.children.map((child) => child.id === activeChild.id ? updater(child) : child) }));
    markChanged();
  }

  const value = useMemo<AppStoreValue>(() => ({
    profile: activeChild?.profile ?? null,
    activeChildId: activeChild?.id ?? null,
    children: state.children,
    ...(activeChild ? {
      milestoneStatuses: activeChild.milestoneStatuses, milestoneUpdatedAt: activeChild.milestoneUpdatedAt,
      weeklyActivityChecks: activeChild.weeklyActivityChecks, observations: activeChild.observations,
      savedQuestions: activeChild.savedQuestions, chatMessages: activeChild.chatMessages,
    } : emptyChildFields),
    completedMilestoneIds: Object.keys(activeChild?.milestoneStatuses ?? {}).filter((id) => activeChild?.milestoneStatuses[id] === 'achieved'),
    isLoading, storageError,
    retryStorage: () => {
      if (storageError === 'load' && revision === 0) { setIsLoading(true); setLoadAttempt((attempt) => attempt + 1); } else markChanged();
    },
    createChild: (profile) => {
      const valid = validateProfile(profile);
      if (!valid || isLoading) return;
      const child = createEmptyChild(valid);
      setState((previous) => ({ children: [...previous.children, child].slice(-10), activeChildId: child.id }));
      markChanged();
    },
    setProfile: (profile) => {
      const valid = validateProfile(profile);
      if (!valid || isLoading) return;
      if (!activeChild) {
        const child = createEmptyChild(valid);
        setState({ children: [child], activeChildId: child.id });
      } else {
        const oldPhoto = activeChild.profile.photoUri;
        updateActive((child) => ({ ...child, profile: valid }));
        if (oldPhoto !== valid.photoUri) deleteManagedPhoto(oldPhoto);
      }
      if (!activeChild) markChanged();
    },
    switchChild: (id) => {
      if (state.children.some((child) => child.id === id)) { setState((previous) => ({ ...previous, activeChildId: id })); markChanged(); }
    },
    deleteChild: (id) => {
      deleteManagedPhoto(state.children.find((child) => child.id === id)?.profile.photoUri);
      setState((previous) => {
        const children = previous.children.filter((child) => child.id !== id);
        return { children, activeChildId: previous.activeChildId === id ? children[0]?.id ?? null : previous.activeChildId };
      });
      markChanged();
    },
    deleteAllData: () => { state.children.forEach((child) => deleteManagedPhoto(child.profile.photoUri)); AsyncStorage.removeItem(STORAGE_KEY).catch(() => {}); setState(defaultState); markChanged(); },
    exportData: () => JSON.stringify(state, null, 2),
    importData: (raw) => {
      try {
        const restored = restoreState(raw);
        if (!restored.children.length) return false;
        setState(restored); markChanged(); return true;
      } catch { return false; }
    },
    loadDemoData: () => {
      const birthday = new Date(); birthday.setHours(12, 0, 0, 0); birthday.setMonth(birthday.getMonth() - 7);
      const now = new Date().toISOString();
      const child = createEmptyChild({ name: 'نور', birthDateISO: birthday.toISOString().slice(0, 10), isDemo: true }, 'demo-child');
      const sample = MILESTONES.filter((item) => item.ageStageId === 'm6').slice(0, 5);
      sample.forEach((item, index) => { child.milestoneStatuses[item.id] = index < 3 ? 'achieved' : index === 3 ? 'emerging' : 'not_observed'; child.milestoneUpdatedAt[item.id] = now; });
      child.observations = [{ id: 'demo-note', text: 'بدأت تلتفت للصوت وتضحك أثناء اللعب.', createdAt: now }];
      setState({ children: [child], activeChildId: child.id }); markChanged();
    },
    setMilestoneStatus: (milestoneId, status) => {
      if (!MILESTONES.some((item) => item.id === milestoneId)) return;
      updateActive((child) => ({ ...child, milestoneStatuses: { ...child.milestoneStatuses, [milestoneId]: status }, milestoneUpdatedAt: { ...child.milestoneUpdatedAt, [milestoneId]: new Date().toISOString() } }));
    },
    toggleWeeklyActivity: (weekKey, activityId) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) return;
      updateActive((child) => {
        const current = child.weeklyActivityChecks[weekKey] ?? [];
        return { ...child, weeklyActivityChecks: { ...child.weeklyActivityChecks, [weekKey]: current.includes(activityId) ? current.filter((id) => id !== activityId) : [...current, activityId] } };
      });
    },
    addObservation: (text, milestoneId) => {
      const clean = text.trim().slice(0, 1000); if (!clean) return;
      updateActive((child) => ({ ...child, observations: [...child.observations, { id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: clean, createdAt: new Date().toISOString(), milestoneId: milestoneId && MILESTONES.some((item) => item.id === milestoneId) ? milestoneId : undefined }].slice(-100) }));
    },
    removeObservation: (id) => updateActive((child) => ({ ...child, observations: child.observations.filter((item) => item.id !== id) })),
    recordQuestion: (text) => {
      const clean = text.trim().slice(0, 2000); if (!clean) return;
      updateActive((child) => ({ ...child, savedQuestions: [...child.savedQuestions, { id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: clean, createdAt: new Date().toISOString() }].slice(-50) }));
    },
    addChatMessage: (message) => updateActive((child) => ({ ...child, chatMessages: [...child.chatMessages, { ...message, id: `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() }].slice(-100) })),
    clearChatMessages: () => updateActive((child) => ({ ...child, chatMessages: [] })),
    isMilestoneDone: (id) => activeChild?.milestoneStatuses[id] === 'achieved',
    resetProfile: () => { state.children.forEach((child) => deleteManagedPhoto(child.profile.photoUri)); setState(defaultState); markChanged(); },
  }), [state, activeChild, isLoading, storageError, revision]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
