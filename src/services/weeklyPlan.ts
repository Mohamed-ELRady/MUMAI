import { currentStageForAge } from '../data/ageHelpers';
import { DOMAIN_LABELS, Domain, Localized, MILESTONES, Milestone } from '../data/milestones';
import { MilestoneStatus } from '../store/persistedState';

export interface WeeklyActivity {
  id: string;
  domain: Domain;
  milestoneId: string;
  moment: Localized;
  title: Localized;
  instruction: Localized;
}

const domainCopy: Record<Domain, Pick<WeeklyActivity, 'moment' | 'title' | 'instruction'>> = {
  language: {
    moment: { ar: 'وقت الحكاية', en: 'Story time' },
    title: { ar: 'دورك ودوري', en: 'Your turn, my turn' },
    instruction: { ar: 'اتكلمي عن صورة أو حاجة لفتت نظره، وبعدها اسكتي 5 ثواني عشان تسيبي له دور بصوت أو كلمة أو إشارة.', en: 'Talk about a picture or something that caught their attention, then pause for five seconds for a sound, word or gesture.' },
  },
  gross_motor: {
    moment: { ar: 'لعب على الأرض', en: 'Floor play' },
    title: { ar: 'حركة على قدّه', en: 'Move at their level' },
    instruction: { ar: 'اعملي مساحة آمنة، وحطي لعبة قريبة تشجعه يتحرك بالطريقة اللي يقدر عليها من غير شد أو إجبار.', en: 'Make a safe space and place a toy nearby to invite movement without pulling or forcing a position.' },
  },
  fine_motor: {
    moment: { ar: 'وقت اللعب', en: 'Play time' },
    title: { ar: 'إيدين بتستكشف', en: 'Hands explore' },
    instruction: { ar: 'قدّمي له غرضين آمنين بأشكال مختلفة، وسيبيه يمسك وينقل ويستكشف تحت إشرافك.', en: 'Offer two safe objects with different shapes and let your child grasp, move and explore them with supervision.' },
  },
  social_emotional: {
    moment: { ar: 'لحظة تواصل', en: 'Connection moment' },
    title: { ar: 'قلّديني وأقلّدك', en: 'Copy each other' },
    instruction: { ar: 'قلّدي حركة أو صوت بيعمله، استني رده، وبعدها اعملي حركة بسيطة وشوفي هل يحاول يقلدها.', en: 'Copy a movement or sound your child makes, wait for a response, then try one simple action for them to copy.' },
  },
  cognitive: {
    moment: { ar: 'لعبة يومية', en: 'Everyday game' },
    title: { ar: 'اكتشاف وحل بسيط', en: 'Discover and solve' },
    instruction: { ar: 'حوّلي مهارة المرحلة للعبة قصيرة باستخدام حاجات آمنة في البيت، واديه وقت يجرب قبل ما تساعديه.', en: 'Turn the stage skill into a short game with safe household objects and allow time to try before helping.' },
  },
};

export function weekKey(now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function priority(item: Milestone, statuses: Record<string, MilestoneStatus>): number {
  return statuses[item.id] === 'emerging' ? 0 : statuses[item.id] === 'not_observed' ? 1 : statuses[item.id] === undefined ? 2 : 3;
}

export function buildWeeklyPlan(ageMonths: number, statuses: Record<string, MilestoneStatus>): WeeklyActivity[] {
  const stage = currentStageForAge(ageMonths);
  const stageItems = MILESTONES.filter((item) => item.ageStageId === stage.id)
    .sort((a, b) => priority(a, statuses) - priority(b, statuses));
  const chosen: Milestone[] = [];
  for (const item of stageItems) {
    if (!chosen.some((entry) => entry.domain === item.domain) && statuses[item.id] !== 'achieved') chosen.push(item);
    if (chosen.length === 3) break;
  }
  for (const item of stageItems) {
    if (!chosen.includes(item)) chosen.push(item);
    if (chosen.length === 3) break;
  }
  return chosen.map((item) => ({ id: `weekly-${item.id}`, milestoneId: item.id, domain: item.domain, ...domainCopy[item.domain] }));
}

export function planFocusLabel(activity: WeeklyActivity, lang: 'ar' | 'en'): string {
  const milestone = MILESTONES.find((item) => item.id === activity.milestoneId);
  return milestone ? milestone.title[lang] : DOMAIN_LABELS[activity.domain][lang];
}
