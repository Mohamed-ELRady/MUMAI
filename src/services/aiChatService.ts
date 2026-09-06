import { AGE_STAGES, DOMAIN_LABELS, MILESTONES, RED_FLAGS, Domain, Localized } from '../data/milestones';
import { currentStageForAge, formatAge } from '../data/ageHelpers';
import { conceptsIn, hasPhrase, normalizeArabic, overlapScore } from './textMatch';
import { ageInQuery, ConversationMessage, isConcern, isFollowUp, resolveConversation, urgentKind } from './chatUnderstanding';
import strings, { Lang } from '../i18n/strings';

export interface ChatContext {
  babyName?: string;
  ageMonths: number;
  currentStageId: string;
  lang: Lang;
  completedMilestoneIds?: string[];
}

export interface AssistantResponse {
  text: string;
  source: 'local' | 'proxy';
  connectionFailed?: boolean;
}

export const MAX_QUERY_LENGTH = 2000;
export const PROXY_TIMEOUT_MS = 12000;
const CDC_SOURCE = 'https://www.cdc.gov/act-early/milestones/index.html';
const URGENT_SOURCE = 'https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/';

function bilingual(ctx: ChatContext, ar: string, en: string): string {
  return ctx.lang === 'ar' ? ar : en;
}

function stageAge(id: string): number {
  return AGE_STAGES.find((stage) => stage.id === id)?.maxMonths ?? 0;
}

function domainIn(query: string): Domain | undefined {
  const aliases: Partial<Record<Domain, string[]>> = {
    language: ['اللغة', 'لغة', 'التواصل', 'language', 'communication'],
    gross_motor: ['حركة', 'الحركة', 'حركي', 'حركية', 'gross motor', 'movement'],
    fine_motor: ['الحركة الدقيقة', 'fine motor'],
    cognitive: ['الادراك', 'ادراكية', 'cognitive', 'learning'],
    social_emotional: ['اجتماعي', 'اجتماعية', 'social', 'emotional'],
  };
  return (Object.entries(aliases) as [Domain, string[]][])
    .sort((a, b) => b[1][0].length - a[1][0].length)
    .find(([, values]) => values.some((value) => hasPhrase(query, value)))?.[0];
}

function relevantItems<T extends { ageStageId: string; domain: Domain }>(
  items: T[], query: string, ctx: ChatContext, getText: (item: T) => Localized
): T[] {
  const concepts = conceptsIn(query);
  const domain = domainIn(query);
  return items.map((item) => {
    const localized = getText(item);
    const text = `${localized.ar} ${localized.en}`;
    const matchesConcept = conceptsIn(text).some((concept) => concepts.includes(concept));
    const lexical = Math.max(overlapScore(query, localized.ar), overlapScore(query, localized.en, 'en'));
    const score = concepts.length ? (matchesConcept ? lexical : 0) : domain ? (domain === item.domain ? 3 : 0) : lexical;
    return { item, score, distance: Math.abs(stageAge(item.ageStageId) - ctx.ageMonths) };
  }).filter(({ score }) => score >= 1)
    .sort((a, b) => a.distance - b.distance || b.score - a.score)
    .map(({ item }) => item);
}

function contextForQuery(query: string, ctx: ChatContext, history: ConversationMessage[]): ChatContext {
  const previousAge = [...history].reverse().filter((item) => item.role === 'user')
    .map((item) => ageInQuery(item.text)).find((age) => age !== undefined);
  const explicitAge = ageInQuery(query) ?? previousAge;
  const ageMonths = explicitAge ?? (Number.isFinite(ctx.ageMonths) ? Math.max(0, ctx.ageMonths) : 0);
  const currentStageId = explicitAge !== undefined || !AGE_STAGES.some((stage) => stage.id === ctx.currentStageId)
    ? currentStageForAge(ageMonths).id : ctx.currentStageId;
  return { ...ctx, lang: ctx.lang === 'en' ? 'en' : 'ar', ageMonths, currentStageId };
}

function supportTip(query: string, ctx: ChatContext): string {
  const concepts = conceptsIn(query);
  if (concepts.some((concept) => ['speech', 'babbling', 'hearing'].includes(concept))) {
    return bilingual(ctx,
      'جرّبي تتكلمي معاه أثناء يومكم، سمّي الأشياء واقرؤوا كتاب صور سوا، واديه فرصة يرد بصوت أو إشارة. لو مش بيستجيب للأصوات، اطلبي فحص سمع من طبيب الأطفال.',
      'Talk during everyday activities, name objects, and look at picture books together. Give your child time to respond with sounds or gestures. Ask the pediatrician about a hearing check if sounds get no response.');
  }
  return bilingual(ctx,
    'وفّري وقت لعب آمن تحت إشرافك، واتبعي اهتمام طفلك من غير ضغط عليه. اكتبي أمثلة للي بيعمله واللي صعب عليه عشان تناقشيها مع طبيب الأطفال.',
    'Offer supervised, safe play and follow your child’s interests without pressure. Note examples of what your child can do and what is difficult to discuss with the pediatrician.');
}

function finish(text: string, ctx: ChatContext, source = CDC_SOURCE): string {
  return `${text}\n\n${strings.chatDisclaimer[ctx.lang]}\n${bilingual(ctx, 'المصدر:', 'Source:')} ${source}`;
}

export function ruleBasedReply(query: string, originalContext: ChatContext, history: ConversationMessage[] = []): string {
  const ctx = contextForQuery(query, originalContext, history);
  const resolved = resolveConversation(query, history);
  const name = ctx.babyName || strings.defaultChildName[ctx.lang];
  const urgent = urgentKind(query);
  if (urgent === 'emergency') return finish(bilingual(ctx,
    'لو طفلك عنده العلامة دي دلوقتي، زي صعوبة التنفس أو فقدان الوعي أو تشنج، اتصلي بالإسعاف المحلي أو روحي الطوارئ فورًا. ما تستنيش رد الشات أو موعد متابعة النمو.',
    'If your child has this symptom now, such as breathing difficulty, loss of consciousness or a seizure, call local emergency services or go to emergency care immediately. Do not wait for this chat or a development appointment.'), ctx, URGENT_SOURCE);
  if (urgent === 'regression') return finish(bilingual(ctx,
    'فقدان مهارة كان طفلك بيعملها قبل كده محتاج تقييم طبي سريع في أي عمر. تواصلي مع طبيب الأطفال في أقرب وقت واذكري إيه المهارة اللي اختفت وإمتى بدأ التغيير. لو التغيير مفاجئ ومعاه صعوبة تنفس أو فقدان وعي أو تشنج، روحي الطوارئ فورًا.',
    'Losing a previously acquired skill needs prompt medical assessment at any age. Contact the pediatrician as soon as possible and explain which skill was lost and when. Sudden change with breathing difficulty, loss of consciousness or a seizure needs emergency care.'), ctx);

  const normalized = normalizeArabic(query);
  if (/^(اهلا|اهلين|مرحبا|السلام عليكم|هاي|hi|hello|hey)$/.test(normalized)) return bilingual(ctx,
    `أهلاً! أقدر أساعدك تتابعي نمو ${name}. اسأليني عن الكلام، المشي، الجلوس أو التفاعل، أو اختاري سؤال من الاقتراحات.`,
    `Hi! I can help you follow ${name}’s development. Ask about speech, walking, sitting or interaction, or choose a suggested question.`);
  if (/^(شكرا|شكرا جدا|متشكره|تسلمي|thanks|thank you)$/.test(normalized)) return bilingual(ctx,
    'العفو! لو عندك ملاحظة تانية عن نمو طفلك اكتبيها ونشوفها سوا.',
    'You’re welcome! Share any other observations about your child’s development.');

  if (ctx.ageMonths > 60) return finish(bilingual(ctx,
    'المراحل الموجودة هنا بتغطي من الولادة لحد 5 سنين. لطفل أكبر من كده، طبيب الأطفال يقدر يراجع المهارات المناسبة لعمره. قولي إيه التغيير اللي لاحظتيه، خصوصًا لو فيه فقدان مهارة قديمة.',
    'The checklists here cover birth through age 5. For an older child, a pediatrician can review age-appropriate skills. Describe the change you noticed, especially any loss of a previously acquired skill.'), ctx);

  if (conceptsIn(resolved).includes('crawling')) return finish(bilingual(ctx,
    'الأطفال بيتحركوا بطرق مختلفة، وفيه أطفال بيتخطوا الزحف. غياب الزحف لوحده ما يكفيش للحكم على النمو. تابعي الجلوس والحركة واستخدام الناحيتين، ووفّري لعبًا آمنًا على الأرض تحت إشرافك. لو طفلك مش بيجلس من غير مساندة عند 9 شهور، أو عندك قلق عن حركته، ناقشي ده مع طبيب الأطفال.',
    'Babies move in different ways, and some skip crawling. Crawling alone cannot establish whether development is on track. Watch sitting, movement and use of both sides, and offer supervised floor play. Discuss missing unsupported sitting at 9 months, or any movement concern, with the pediatrician.'), ctx,
    'https://www.healthychildren.org/English/ages-stages/baby/Pages/Movement-8-to-12-Months.aspx');

  const remaining = ['المهارات المتبقية', 'المهارات اللي معملهاش', 'remaining', 'unchecked'].some((phrase) => hasPhrase(resolved, phrase));
  const overview = remaining || ['مهارات', 'المهارات', 'نمو', 'النمو', 'تطور', 'التطور', 'يعمل ايه', 'بيعمل ايه', 'يقدر يعمل', 'milestones', 'development', 'what can', 'what should'].some((phrase) => hasPhrase(resolved, phrase));
  const relevant = relevantItems(MILESTONES, resolved, ctx, (item) => item.title);
  const useOverview = overview && conceptsIn(resolved).length === 0 && !domainIn(resolved);
  const milestones = useOverview
    ? MILESTONES.filter((item) => item.ageStageId === ctx.currentStageId && (!remaining || !ctx.completedMilestoneIds?.includes(item.id)))
    : relevant.slice(0, 3);
  const intro = bilingual(ctx,
    `بالنسبة لـ${name}، هستخدم عمر ${formatAge(ctx.ageMonths, ctx.lang)} في الإجابة.`,
    `For ${name}, I’m using an age of ${formatAge(ctx.ageMonths, ctx.lang)}.`);
  if (remaining && !milestones.length) return finish(`${intro}\n\n${bilingual(ctx,
    'كل مهارات المرحلة دي متعلّم عليها في المتابعة. لو فيه مهارة لاحظتي إنها اتغيّرت، قوليلي عنها.',
    'All skills in this stage are checked off. If you have noticed a change in a skill, tell me about it.')}`, ctx);
  if (!milestones.length) return bilingual(ctx,
    `أقدر أساعدك في مراحل نمو ${name}: الكلام، الحركة، السمع، اللعب والتواصل. سؤالك محتاج تفاصيل أكتر أو معلومات خارج دليل النمو هنا. إيه اللي لاحظتيه وإمتى بدأ؟ ممكن تبدأي بـ«إيه المهارات المناسبة لعمره؟». لو السؤال عن مرض أو دواء، تواصلي مع طبيب الأطفال لتقييمه.`,
    `I can help with ${name}’s speech, movement, hearing, play and communication. This question needs more detail or information beyond this development guide. What have you noticed, and when did it start? Try “What milestones fit this age?” For an illness or medicine question, contact the pediatrician for an assessment.`);

  if (isFollowUp(query) && ageInQuery(query) === undefined && resolved !== query) return finish([
    intro,
    supportTip(resolved, ctx),
    bilingual(ctx,
      'اكتبي المهارات اللي بيعملها دلوقتي وإمتى بدأ القلق. لو مهارة مناسبة لعمره مش موجودة، احجزي تقييم مع طبيب الأطفال وشاركيه الملاحظات. هل المهارة دي كانت موجودة قبل كده واختفت، ولا لسه مبدأتش؟',
      'Note the skills your child currently uses and when the concern began. If an age-appropriate skill is missing, arrange an assessment with the pediatrician and share your notes. Was this skill present before and then lost, or has it not started yet?'),
  ].join('\n\n'), ctx);

  const lines = [intro, bilingual(ctx, 'من دليل النمو (العمر موضح جنب كل مهارة):', 'From the development guide (each skill includes its reference age):')];
  for (const item of milestones) {
    const future = stageAge(item.ageStageId) > ctx.ageMonths;
    lines.push(`• ${item.title[ctx.lang]} — ${formatAge(stageAge(item.ageStageId), ctx.lang)}${future ? bilingual(ctx, ' (مرحلة لاحقة)', ' (later stage)') : ''}`);
  }
  if (isConcern(resolved)) {
    const warnings = relevantItems(RED_FLAGS.filter((item) => stageAge(item.ageStageId) <= ctx.ageMonths), resolved, ctx, (item) => item.warningSign).slice(0, 2);
    if (warnings.length) {
      lines.push(bilingual(ctx, '\nعلامات للنقاش مع الطبيب لو بتنطبق على طفلك؛ السؤال لوحده ما يثبتش وجودها:', '\nSigns to discuss with a doctor if they apply; the question alone does not establish them:'));
      for (const warning of warnings) {
        lines.push(`• ${warning.warningSign[ctx.lang]} — ${formatAge(stageAge(warning.ageStageId), ctx.lang)}. ${warning.specialist[ctx.lang]}.`);
      }
    }
    lines.push(bilingual(ctx,
      '\nلو مهارة مناسبة لعمره مش موجودة أو عندك قلق مستمر، تواصلي مع طبيب الأطفال واطلبي تقييم النمو. ما تستنيش فقدان مهارات تانية.',
      '\nIf an age-appropriate skill is missing or you are concerned, contact the pediatrician and ask about developmental screening. Do not wait for other skills to be lost.'));
  }
  lines.push(`\n${supportTip(resolved, ctx)}`);
  return finish(lines.join('\n'), ctx);
}

export function buildGrounding(query: string, originalContext: ChatContext, history: ConversationMessage[] = []): string {
  const ctx = contextForQuery(query, originalContext, history);
  const resolved = resolveConversation(query, history);
  const relevant = relevantItems(MILESTONES, resolved, ctx, (item) => item.title).slice(0, 4);
  const reference = relevant.length ? relevant : MILESTONES.filter((item) => item.ageStageId === ctx.currentStageId);
  return [
    'Educational child-development support, not diagnosis. Respond in the requested language.',
    'Use only the reference below for medical claims. Ask a focused clarification for uncovered topics.',
    'Reference ages are not a diagnosis. Do not apply future-age warnings to a younger child.',
    'Do not infer a disorder or recommend waiting when a parent reports a missing skill or regression.',
    ...reference.map((item) => `Reference skill at ${stageAge(item.ageStageId)} months: ${item.title[ctx.lang]}`),
    ruleBasedReply(query, ctx, history),
  ].join('\n');
}

function proxyURL(): string | undefined {
  // Expo replaces this exact property access when bundling. Secrets belong on the server.
  const value = process.env.EXPO_PUBLIC_AI_PROXY_URL?.trim();
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new Error('The AI proxy must use HTTPS (HTTP is allowed only on localhost).');
  }
  if (url.username || url.password) throw new Error('Credentials must not be embedded in the proxy URL.');
  return url.toString();
}

async function callProxy(url: string, query: string, ctx: ChatContext, history: ConversationMessage[]): Promise<string> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, context: ctx, history, grounding: buildGrounding(query, ctx, history) }),
        });
        if (!response.ok) throw new Error(`AI proxy returned ${response.status}`);
        const data: unknown = await response.json();
        if (!data || typeof data !== 'object' || !('reply' in data) || typeof data.reply !== 'string' || !data.reply.trim() || data.reply.length > 20000) {
          throw new Error('AI proxy returned an invalid reply');
        }
        return data.reply.trim();
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error('AI proxy timed out')); }, PROXY_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function getAssistantResponse(query: string, ctx: ChatContext, history: ConversationMessage[] = []): Promise<AssistantResponse> {
  const text = query.trim().slice(0, MAX_QUERY_LENGTH);
  const boundedHistory = history.filter((message) => (message.role === 'user' || message.role === 'assistant') && typeof message.text === 'string')
    .slice(-12).map((message) => ({ role: message.role, text: message.text.slice(0, MAX_QUERY_LENGTH) }));
  const local = () => ruleBasedReply(text, ctx, boundedHistory);
  if (!text || urgentKind(text)) return { text: local(), source: 'local' };
  try {
    const url = proxyURL();
    if (url) return { text: await callProxy(url, text, contextForQuery(text, ctx, boundedHistory), boundedHistory), source: 'proxy' };
  } catch {
    return { text: local(), source: 'local', connectionFailed: true };
  }
  return { text: local(), source: 'local' };
}

export async function getAssistantReply(query: string, ctx: ChatContext, history: ConversationMessage[] = []): Promise<string> {
  return (await getAssistantResponse(query, ctx, history)).text;
}
