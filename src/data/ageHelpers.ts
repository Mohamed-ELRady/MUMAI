import { AGE_STAGES, AgeStage } from './milestones';
import { Lang } from '../i18n/strings';

/** Store birthdays as calendar dates so changing timezone cannot move the birthday. */
export function toDateInputValue(date: Date): string {
  if (!Number.isFinite(date.getTime())) return '';
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return toDateInputValue(date) === value ? date : null;
}

export function validBirthDate(value: string, now = new Date()): string | null {
  // Older profiles used timestamps; preserve their local calendar day on migration.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseCalendarDate(value)
    : /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : null;
  if (!date || !Number.isFinite(date.getTime())) return null;
  const result = toDateInputValue(date);
  return result <= toDateInputValue(now) ? result : null;
}

export function monthsBetween(birthDateISO: string, nowISO: string): number {
  const birth = parseCalendarDate(birthDateISO) ?? new Date(birthDateISO);
  const now = parseCalendarDate(nowISO) ?? new Date(nowISO);
  if (!Number.isFinite(birth.getTime()) || !Number.isFinite(now.getTime())) return 0;
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  const anniversaryDay = Math.min(birth.getDate(), new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
  if (now.getDate() < anniversaryDay) months -= 1;
  return Math.max(0, months);
}

export function currentStageForAge(ageMonths: number): AgeStage {
  const found = [...AGE_STAGES].reverse().find((s) => ageMonths >= s.minMonths);
  return found ?? AGE_STAGES[0];
}

export function stageIndex(stageId: string): number {
  return AGE_STAGES.findIndex((s) => s.id === stageId);
}

export function formatAge(ageMonths: number, lang: Lang = 'ar'): string {
  ageMonths = Number.isFinite(ageMonths) ? Math.max(0, Math.floor(ageMonths)) : 0;
  if (lang === 'en') {
    if (ageMonths < 1) return 'less than a month';
    if (ageMonths < 24) return `${ageMonths} month${ageMonths === 1 ? '' : 's'}`;
    const years = Math.floor(ageMonths / 12);
    const rem = ageMonths % 12;
    if (rem === 0) return `${years} year${years === 1 ? '' : 's'}`;
    return `${years} year${years === 1 ? '' : 's'} ${rem} month${rem === 1 ? '' : 's'}`;
  }
  if (ageMonths < 1) return 'أقل من شهر';
  if (ageMonths < 24) return `${ageMonths} شهر`;
  const years = Math.floor(ageMonths / 12);
  const rem = ageMonths % 12;
  return rem === 0 ? `${years} سنة` : `${years} سنة و${rem} شهر`;
}
