import { AGE_STAGES, Domain, MILESTONES } from '../data/milestones';
import { Lang } from '../i18n/strings';
import { isConcern } from './chatUnderstanding';
import { conceptsIn, normalizeArabic } from './textMatch';

export interface SpecialtyContext {
  ageMonths: number;
  lang: Lang;
  milestoneStatuses?: Record<string, 'achieved' | 'emerging' | 'not_observed'>;
}

type RouteKey = 'hearing' | 'speech' | 'motor' | 'occupational' | 'vision' | 'developmental';

const stageAge = (stageId: string) => AGE_STAGES.find((stage) => stage.id === stageId)?.maxMonths ?? 0;

export function asksForSpecialist(query: string): boolean {
  const text = normalizeArabic(query);
  return /(?:^|\s)(اكشف|نكشف|اروح|نروح|اعرضه|اعرضها).{0,24}(دكتور|طبيب|اخصائي|استشاري|تخصص|عياده|مين)/.test(text)
    || /(?:^|\s)(دكتور|طبيب|اخصائي|استشاري|تخصص).{0,24}(ايه|مين|انهي|مناسب)/.test(text)
    || /(?:which|what) (?:doctor|specialist)|who should (?:we|i) see|where should (?:we|i) go/.test(text);
}

function routesFromRecordedConcerns(ctx: SpecialtyContext): Set<RouteKey> {
  const domains = new Set<Domain>();
  for (const [id, status] of Object.entries(ctx.milestoneStatuses ?? {})) {
    const milestone = MILESTONES.find((item) => item.id === id);
    if (status === 'not_observed' && milestone && stageAge(milestone.ageStageId) <= ctx.ageMonths) domains.add(milestone.domain);
  }
  const routes = new Set<RouteKey>();
  if (domains.has('language')) { routes.add('hearing'); routes.add('speech'); }
  if (domains.has('gross_motor')) routes.add('motor');
  if (domains.has('fine_motor')) routes.add('occupational');
  if (domains.has('social_emotional') || domains.has('cognitive') || domains.size > 1) routes.add('developmental');
  return routes;
}

function recordedConcerns(ctx: SpecialtyContext) {
  return Object.entries(ctx.milestoneStatuses ?? {}).flatMap(([id, status]) => {
    const milestone = MILESTONES.find((item) => item.id === id);
    return status === 'not_observed' && milestone && stageAge(milestone.ageStageId) <= ctx.ageMonths ? [milestone] : [];
  });
}

function routesFromQuery(query: string, ageMonths: number): Set<RouteKey> {
  const concepts = new Set(conceptsIn(query));
  const routes = new Set<RouteKey>();
  if (concepts.has('hearing')) routes.add('hearing');
  if (concepts.has('vision')) routes.add('vision');
  if (concepts.has('babbling') && ageMonths >= 6) { routes.add('hearing'); routes.add('speech'); }
  if (concepts.has('speech') && ageMonths >= 12) { routes.add('hearing'); routes.add('speech'); }
  if ((concepts.has('walking') && ageMonths >= 15)
    || (concepts.has('standing') && ageMonths >= 12)
    || (concepts.has('sitting') && ageMonths >= 9)
    || (concepts.has('rolling') && ageMonths >= 6)
    || (concepts.has('head') && ageMonths >= 4)) routes.add('motor');
  if ((concepts.has('hands') && ageMonths >= 9) || (concepts.has('drawing') && ageMonths >= 36)) routes.add('occupational');
  if ((concepts.has('smile') && ageMonths >= 4) || (concepts.has('play') && ageMonths >= 12)
    || (concepts.has('pointing') && ageMonths >= 12) || (concepts.has('understanding') && ageMonths >= 18)) routes.add('developmental');
  if (routes.size > 2) routes.add('developmental');
  return routes;
}

export function specialtyRecommendation(query: string, ctx: SpecialtyContext): string | undefined {
  const explicit = asksForSpecialist(query);
  if (!explicit && !isConcern(query)) return undefined;
  const concepts = conceptsIn(query);
  const routes = routesFromQuery(query, ctx.ageMonths);
  const recorded = explicit && concepts.length === 0 ? recordedConcerns(ctx) : [];
  if (recorded.length) for (const route of routesFromRecordedConcerns(ctx)) routes.add(route);
  const say = (ar: string, en: string) => ctx.lang === 'ar' ? ar : en;

  if (!routes.size) {
    if (!explicit) return undefined;
    return say(
      'مسار التقييم المقترح:\n• ابدئي بطبيب الأطفال: يراجع العمر، يفحص الطفل ويحدد هل يحتاج فحص نمو أو إحالة متخصصة. التفاصيل الحالية لا تكفي لاختيار تخصص أدق، فاذكري المهارة المقلقة ومتى بدأت وهل كانت موجودة ثم اختفت.',
      'Suggested assessment route:\n• Start with the pediatrician, who can review age, examine the child, arrange developmental screening and coordinate any referral. There is not enough detail yet to choose a narrower specialty; describe the concerning skill, when it began, and whether it was present and then lost.'
    );
  }

  const lines = [say(
    'مسار التقييم المقترح (مش تشخيص):',
    'Suggested assessment route (not a diagnosis):'
  ), say(
    '• ابدئي بطبيب الأطفال: يراجع الطفل ككل ويعمل فحص نمو، وينسّق الإحالات بدل الاعتماد على تخصص واحد من الشات.',
    '• Start with the pediatrician for a whole-child exam and developmental screening, and to coordinate referrals rather than relying on a single specialty chosen by chat.'
  )];
  if (recorded.length) lines.push(say(
    `اعتمدت على المهارات المسجلة «لسه ملاحظتهاش»: ${recorded.slice(0, 3).map((item) => item.title.ar).join('، ')}. التسجيل ملاحظة عائلية وليس إثباتًا أن المهارة غائبة.`,
    `This uses skills recorded as “not observed yet”: ${recorded.slice(0, 3).map((item) => item.title.en).join(', ')}. A family check-in is not proof that a skill is absent.`
  ));
  if (routes.has('hearing')) lines.push(say(
    '• سمعيات أطفال أو أنف وأذن: لعمل تقييم سمع، خصوصًا مع عدم الاستجابة للصوت أو تأخر الكلام.',
    '• Pediatric audiology or ENT: for a hearing assessment, especially with poor response to sound or speech delay.'
  ));
  if (routes.has('speech')) lines.push(say(
    '• أخصائي تخاطب ولغة: يقيّم فهم اللغة والتعبير والكلام والتواصل، بالتوازي مع فحص السمع عند الحاجة.',
    '• Speech-language therapist: to assess understanding, expressive language, speech and communication, alongside hearing assessment when indicated.'
  ));
  if (routes.has('motor')) lines.push(say(
    '• علاج طبيعي أطفال: يقيّم الحركة والتوازن والقوة؛ وطبيب الأطفال قد يحوّل لأعصاب أطفال لو الفحص أظهر ضعفًا أو اختلافًا عصبيًا.',
    '• Pediatric physical therapy: to assess movement, balance and strength; the pediatrician may refer to pediatric neurology if the exam suggests weakness or a neurologic difference.'
  ));
  if (routes.has('occupational')) lines.push(say(
    '• علاج وظيفي أطفال: لمهارات اليد، الإمساك، التآزر والاعتماد على النفس.',
    '• Pediatric occupational therapy: for hand skills, grasp, coordination and daily activities.'
  ));
  if (routes.has('vision')) lines.push(say(
    '• طبيب عيون أطفال: لو المشكلة في تتبع الأشياء، التواصل البصري أو الرؤية.',
    '• Pediatric ophthalmology: for concerns about tracking objects, visual engagement or vision.'
  ));
  if (routes.has('developmental')) lines.push(say(
    '• طب نمو وسلوك أطفال أو عيادة تقييم نمو: لو القلق في التفاعل أو الفهم، أو في أكثر من مجال من مجالات النمو.',
    '• Developmental-behavioral pediatrics or a child-development clinic: when interaction or understanding is affected, or concerns span more than one developmental area.'
  ));
  lines.push(say(
    'خدي معاكِ عمر الطفل، أمثلة واضحة، وقت بداية المشكلة، وسجل المهارات من MUMAI. فقدان مهارة مكتسبة يحتاج تقييمًا طبيًا سريعًا.',
    'Bring the child’s age, concrete examples, when the concern began, and the MUMAI milestone record. Loss of an acquired skill needs prompt medical assessment.'
  ));
  return lines.join('\n');
}

export function hasTargetedSpecialty(recommendation: string): boolean {
  return /(سمعيات أطفال|أخصائي تخاطب|علاج طبيعي أطفال|علاج وظيفي أطفال|طبيب عيون أطفال|طب نمو وسلوك أطفال|pediatric audiology|speech-language therapist|pediatric physical therapy|pediatric occupational therapy|pediatric ophthalmology|developmental-behavioral pediatrics)/i.test(recommendation);
}
