import { validBirthDate } from '../data/ageHelpers';
import { MILESTONES } from '../data/milestones';

export interface BabyProfile {
  name: string;
  birthDateISO: string;
}

export interface PersistedState {
  profile: BabyProfile | null;
  completedMilestoneIds: string[];
}

export const defaultState: PersistedState = { profile: null, completedMilestoneIds: [] };
const knownIds = new Set(MILESTONES.map((item) => item.id));

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
  const ids = 'completedMilestoneIds' in value && Array.isArray(value.completedMilestoneIds) ? value.completedMilestoneIds : [];
  return { profile, completedMilestoneIds: profile ? [...new Set(ids.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))] : [] };
}

/** All writes share one queue, so a slow older write cannot replace a newer state. */
export function createWriteQueue(write: (value: string) => Promise<void>): (value: string) => Promise<void> {
  let pending = Promise.resolve();
  return (value) => {
    pending = pending.catch(() => {}).then(() => write(value));
    return pending;
  };
}
