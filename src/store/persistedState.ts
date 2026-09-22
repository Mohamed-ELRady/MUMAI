import { validBirthDate } from '../data/ageHelpers';
import { MILESTONES } from '../data/milestones';
import { Lang } from '../i18n/strings';

export interface BabyProfile {
  name: string;
  birthDateISO: string;
  photoUri?: string;
  bloodType?: BloodType;
  isDemo?: boolean;
}

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodType = typeof BLOOD_TYPES[number];
export type MilestoneStatus = 'achieved' | 'emerging' | 'not_observed';

export interface Observation { id: string; text: string; createdAt: string; milestoneId?: string; }
export interface SavedQuestion { id: string; text: string; createdAt: string; }
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  lang: Lang;
  source?: 'local' | 'proxy';
  connectionFailed?: boolean;
  createdAt: string;
}

export interface ChildData {
  id: string;
  profile: BabyProfile;
  milestoneStatuses: Record<string, MilestoneStatus>;
  milestoneUpdatedAt: Record<string, string>;
  weeklyActivityChecks: Record<string, string[]>;
  observations: Observation[];
  savedQuestions: SavedQuestion[];
  chatMessages: ChatMessage[];
}

export interface PersistedState { activeChildId: string | null; children: ChildData[]; }
export const defaultState: PersistedState = { activeChildId: null, children: [] };

const knownIds = new Set(MILESTONES.map((item) => item.id));
const statuses = new Set<MilestoneStatus>(['achieved', 'emerging', 'not_observed']);
const bloodTypes = new Set<string>(BLOOD_TYPES);
const MAX_PHOTO_URI_LENGTH = 750_000;

function validId(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : fallback;
}

function validDateTime(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(new Date(value).getTime());
}

function validPhotoUri(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > MAX_PHOTO_URI_LENGTH) return undefined;
  const photoUri = value.trim();
  return /^(file|content|ph|assets-library):/i.test(photoUri) || /^data:image\/(jpeg|png|webp);base64,/i.test(photoUri) ? photoUri : undefined;
}

export function validateProfile(value: unknown): BabyProfile | null {
  if (!value || typeof value !== 'object' || !('name' in value) || !('birthDateISO' in value)
    || typeof value.name !== 'string' || !value.name.trim() || typeof value.birthDateISO !== 'string') return null;
  const birthDateISO = validBirthDate(value.birthDateISO);
  if (!birthDateISO) return null;
  const photoUri = 'photoUri' in value ? validPhotoUri(value.photoUri) : undefined;
  const bloodType = 'bloodType' in value && typeof value.bloodType === 'string' && bloodTypes.has(value.bloodType) ? value.bloodType as BloodType : undefined;
  return {
    name: value.name.trim().slice(0, 80), birthDateISO,
    ...(photoUri ? { photoUri } : {}), ...(bloodType ? { bloodType } : {}),
    ...('isDemo' in value && value.isDemo === true ? { isDemo: true } : {}),
  };
}

function cleanStatuses(value: unknown): Record<string, MilestoneStatus> {
  const result: Record<string, MilestoneStatus> = {};
  if (value && typeof value === 'object') for (const [id, status] of Object.entries(value)) {
    if (knownIds.has(id) && typeof status === 'string' && statuses.has(status as MilestoneStatus)) result[id] = status as MilestoneStatus;
  }
  return result;
}

function cleanMilestoneDates(value: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (value && typeof value === 'object') for (const [id, date] of Object.entries(value)) {
    if (knownIds.has(id) && validDateTime(date)) result[id] = date;
  }
  return result;
}

function cleanWeekly(value: unknown): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  if (value && typeof value === 'object') for (const [week, ids] of Object.entries(value)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(week) && Array.isArray(ids)) result[week] = [...new Set(ids.filter((id): id is string => typeof id === 'string' && id.length <= 80))];
  }
  return result;
}

function cleanObservations(value: unknown): Observation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): Observation[] => {
    if (!item || typeof item !== 'object' || !('id' in item) || !('text' in item) || !('createdAt' in item)
      || typeof item.id !== 'string' || typeof item.text !== 'string' || !item.text.trim() || !validDateTime(item.createdAt)) return [];
    const milestoneId = 'milestoneId' in item && typeof item.milestoneId === 'string' && knownIds.has(item.milestoneId) ? item.milestoneId : undefined;
    return [{ id: item.id.slice(0, 80), text: item.text.trim().slice(0, 1000), createdAt: item.createdAt, milestoneId }];
  }).slice(-100);
}

function cleanQuestions(value: unknown): SavedQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): SavedQuestion[] => {
    if (!item || typeof item !== 'object' || !('id' in item) || !('text' in item) || !('createdAt' in item)
      || typeof item.id !== 'string' || typeof item.text !== 'string' || !item.text.trim() || !validDateTime(item.createdAt)) return [];
    return [{ id: item.id.slice(0, 80), text: item.text.trim().slice(0, 2000), createdAt: item.createdAt }];
  }).slice(-50);
}

function cleanChat(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ChatMessage[] => {
    if (!item || typeof item !== 'object' || !('id' in item) || !('role' in item) || !('text' in item) || !('lang' in item) || !('createdAt' in item)
      || typeof item.id !== 'string' || (item.role !== 'user' && item.role !== 'assistant') || typeof item.text !== 'string'
      || !item.text.trim() || (item.lang !== 'ar' && item.lang !== 'en') || !validDateTime(item.createdAt)) return [];
    const source = 'source' in item && (item.source === 'local' || item.source === 'proxy') ? item.source : undefined;
    return [{ id: item.id.slice(0, 80), role: item.role, text: item.text.trim().slice(0, 5000), lang: item.lang,
      ...(source ? { source } : {}), ...('connectionFailed' in item && item.connectionFailed === true ? { connectionFailed: true } : {}), createdAt: item.createdAt }];
  }).slice(-100);
}

function cleanChild(value: unknown, index: number): ChildData | null {
  if (!value || typeof value !== 'object' || !('profile' in value)) return null;
  const profile = validateProfile(value.profile);
  if (!profile) return null;
  const id = validId('id' in value ? value.id : undefined, `child-${index + 1}`);
  return {
    id, profile,
    milestoneStatuses: cleanStatuses('milestoneStatuses' in value ? value.milestoneStatuses : undefined),
    milestoneUpdatedAt: cleanMilestoneDates('milestoneUpdatedAt' in value ? value.milestoneUpdatedAt : undefined),
    weeklyActivityChecks: cleanWeekly('weeklyActivityChecks' in value ? value.weeklyActivityChecks : undefined),
    observations: cleanObservations('observations' in value ? value.observations : undefined),
    savedQuestions: cleanQuestions('savedQuestions' in value ? value.savedQuestions : undefined),
    chatMessages: cleanChat('chatMessages' in value ? value.chatMessages : undefined),
  };
}

/** Restores v2 data and transparently migrates the original single-child format. */
export function restoreState(raw: string | null): PersistedState {
  if (!raw) return { ...defaultState };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Invalid stored data');
  if ('children' in value) {
    if (!Array.isArray(value.children)) throw new Error('Invalid child list');
    const children = value.children.map(cleanChild).filter((child): child is ChildData => !!child).slice(0, 10);
    const requestedId = 'activeChildId' in value && typeof value.activeChildId === 'string' ? value.activeChildId : null;
    return { children, activeChildId: children.some((child) => child.id === requestedId) ? requestedId : children[0]?.id ?? null };
  }
  if (!('profile' in value)) throw new Error('Invalid stored profile');
  const profile = validateProfile(value.profile);
  if (value.profile !== null && !profile) throw new Error('Invalid stored birthday or name');
  if (!profile) return { ...defaultState };
  const milestoneStatuses = cleanStatuses('milestoneStatuses' in value ? value.milestoneStatuses : undefined);
  const legacyIds = 'completedMilestoneIds' in value && Array.isArray(value.completedMilestoneIds) ? value.completedMilestoneIds : [];
  for (const id of legacyIds) if (typeof id === 'string' && knownIds.has(id) && !milestoneStatuses[id]) milestoneStatuses[id] = 'achieved';
  const child: ChildData = {
    id: 'legacy-child', profile, milestoneStatuses, milestoneUpdatedAt: {},
    weeklyActivityChecks: cleanWeekly('weeklyActivityChecks' in value ? value.weeklyActivityChecks : undefined),
    observations: cleanObservations('observations' in value ? value.observations : undefined),
    savedQuestions: cleanQuestions('savedQuestions' in value ? value.savedQuestions : undefined), chatMessages: [],
  };
  return { activeChildId: child.id, children: [child] };
}

export function createEmptyChild(profile: BabyProfile, id = `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`): ChildData {
  return { id, profile, milestoneStatuses: {}, milestoneUpdatedAt: {}, weeklyActivityChecks: {}, observations: [], savedQuestions: [], chatMessages: [] };
}

/** All writes share one queue, so a slow older write cannot replace a newer state. */
export function createWriteQueue(write: (value: string) => Promise<void>): (value: string) => Promise<void> {
  let pending = Promise.resolve();
  return (value) => { pending = pending.catch(() => {}).then(() => write(value)); return pending; };
}
