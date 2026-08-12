import { AGE_STAGES, AgeStage } from './milestones';
import { Lang } from '../i18n/strings';

export function monthsBetween(birthDateISO: string, nowISO: string): number {
  const birth = new Date(birthDateISO);
  const now = new Date(nowISO);
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
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
