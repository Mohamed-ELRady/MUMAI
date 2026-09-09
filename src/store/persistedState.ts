import { validBirthDate } from '../data/ageHelpers';
import { MILESTONES } from '../data/milestones';

export interface BabyProfile {
  name: string;
  birthDateISO: string;
}

export type MilestoneStatus = 'achieved' | 'emerging' | 'not_observed';

export interface Observation {
  id: string;
  text: string;
  createdAt: string;
  milestoneId?: string;
}

export interface SavedQuestion { id: string; text: string; createdAt: string; }

export interface PersistedState {
  profile: BabyProfile | null;
  milestoneStatuses: Record<string, MilestoneStatus>;
  weeklyActivityChecks: Record<string, string[]>;
  observations: Observation[];
  savedQuestions: SavedQuestion[];
}

export const defaultState: PersistedState = { profile: null, milestoneStatuses: {}, weeklyActivityChecks: {}, observations: [], savedQuestions: [] };
const knownIds = new Set(MILESTONES.map((item) => item.id));
const statuses = new Set<MilestoneStatus>(['achieved', 'emerging', 'not_observed']);

export function validateProfile(value: unknown): BabyProfile | null {
  if (!value || typeof value !== 'object' || !('name' in value) || !('birthDateISO' in value)
    || typeof value.name !== 'string' || !value.name.trim() || typeof value.birthDateISO !== 'string') return null;
  const birthDateISO = validBirthDate(value.birthDateISO);
  return birthDateISO ? { name: value.name.trim().slice(0, 80), birthDateISO } : null;
}

export function restoreState(raw: string | null): PersistedState {
  if (!raw) return { ...defaultState };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('profile' in value)) throw new Error('Invalid stored profile');
  const profile = validateProfile(value.profile);
  if (value.profile !== null && !profile) throw new Error('Invalid stored birthday or name');
  if (!profile) return { ...defaultState };
  const legacyIds = 'completedMilestoneIds' in value && Array.isArray(value.completedMilestoneIds) ? value.completedMilestoneIds : [];
  const milestoneStatuses: Record<string, MilestoneStatus> = {};
  if ('milestoneStatuses' in value && value.milestoneStatuses && typeof value.milestoneStatuses === 'object') {
    for (const [id, status] of Object.entries(value.milestoneStatuses)) {
      if (knownIds.has(id) && typeof status === 'string' && statuses.has(status as MilestoneStatus)) milestoneStatuses[id] = status as MilestoneStatus;
    }
  }
  for (const id of legacyIds) if (typeof id === 'string' && knownIds.has(id) && !milestoneStatuses[id]) milestoneStatuses[id] = 'achieved';
  const weeklyActivityChecks: Record<string, string[]> = {};
  if ('weeklyActivityChecks' in value && value.weeklyActivityChecks && typeof value.weeklyActivityChecks === 'object') {
    for (const [week, ids] of Object.entries(value.weeklyActivityChecks)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(week) && Array.isArray(ids)) weeklyActivityChecks[week] = [...new Set(ids.filter((id): id is string => typeof id === 'string' && id.length <= 80))];
    }
  }
  const observations = 'observations' in value && Array.isArray(value.observations) ? value.observations.flatMap((item): Observation[] => {
    if (!item || typeof item !== 'object' || !('id' in item) || !('text' in item) || !('createdAt' in item)
      || typeof item.id !== 'string' || typeof item.text !== 'string' || typeof item.createdAt !== 'string'
      || !item.text.trim() || !Number.isFinite(new Date(item.createdAt).getTime())) return [];
    const milestoneId = 'milestoneId' in item && typeof item.milestoneId === 'string' && knownIds.has(item.milestoneId) ? item.milestoneId : undefined;
    return [{ id: item.id.slice(0, 80), text: item.text.trim().slice(0, 1000), createdAt: item.createdAt, milestoneId }];
  }).slice(-100) : [];
  const savedQuestions = 'savedQuestions' in value && Array.isArray(value.savedQuestions) ? value.savedQuestions.flatMap((item): SavedQuestion[] => {
    if (!item || typeof item !== 'object' || !('id' in item) || !('text' in item) || !('createdAt' in item)
      || typeof item.id !== 'string' || typeof item.text !== 'string' || typeof item.createdAt !== 'string'
      || !item.text.trim() || !Number.isFinite(new Date(item.createdAt).getTime())) return [];
    return [{ id: item.id.slice(0, 80), text: item.text.trim().slice(0, 2000), createdAt: item.createdAt }];
  }).slice(-50) : [];
  return { profile, milestoneStatuses, weeklyActivityChecks, observations, savedQuestions };
}

/** All writes share one queue, so a slow older write cannot replace a newer state. */
export function createWriteQueue(write: (value: string) => Promise<void>): (value: string) => Promise<void> {
  let pending = Promise.resolve();
  return (value) => {
    pending = pending.catch(() => {}).then(() => write(value));
    return pending;
  };
}
