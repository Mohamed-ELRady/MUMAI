import { AGE_STAGES, DOMAIN_LABELS, MILESTONES, RED_FLAGS, RedFlag, Milestone } from '../data/milestones';
import { stageIndex } from '../data/ageHelpers';
import { overlapScore } from './textMatch';
import { severityStringKey } from '../theme/theme';
import strings, { Lang } from '../i18n/strings';

// ملاحظة أمان: أي مفتاح API لنموذج ذكاء اصطناعي يجب ألا يُستدعى مباشرة من تطبيق موبايل في الإنتاج
// (المفتاح يكون مكشوفًا داخل التطبيق). في هذا البروتوتايب نفضّل استخدام EXPO_PUBLIC_AI_PROXY_URL
// يشير لباك-إند وسيط يحمي المفتاح. استدعاء Anthropic مباشرة هنا مخصص للتجربة المحلية فقط.
const PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL;
const DIRECT_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

export interface ChatContext {
  babyName?: string;
  ageMonths: number;
  currentStageId: string;
  lang: Lang;
}

function tr(key: keyof typeof strings, lang: Lang, vars?: Record<string, string | number>): string {
  let text: string = strings[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  return text;
}

// أقل درجة تخلي المطابقة "موثوقة" — لازم تطابق كلمة معنى كاملة على الأقل مش بس تشابه سطحي
// (زي اسم المجال المشترك بين عشرات العناصر)، عشان محدش يطلع كرد "عشوائي" مش مرتبط بالسؤال فعليًا.
const MIN_CONFIDENT_SCORE = 1;

function nearbyStages(currentStageId: string): string[] {
  const idx = stageIndex(currentStageId);
  const ids = AGE_STAGES.slice(Math.max(0, idx - 1), idx + 2).map((s) => s.id);
  return ids.length ? ids : AGE_STAGES.map((s) => s.id);
}

function findRelevantRedFlags(query: string, ctx: ChatContext): RedFlag[] {
  const pool = RED_FLAGS.filter((rf) => nearbyStages(ctx.currentStageId).includes(rf.ageStageId));
  const scored = pool
    .map((rf) => ({
      rf,
      // اسم المجال بوزن أقل (تعتيم) عشان لوحده منعتبروش تطابق كافي
      score: overlapScore(query, rf.warningSign[ctx.lang], ctx.lang) + 0.3 * overlapScore(query, DOMAIN_LABELS[rf.domain][ctx.lang], ctx.lang),
    }))
    .filter((x) => x.score >= MIN_CONFIDENT_SCORE)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 2).map((x) => x.rf);
}

function findRelevantMilestones(query: string, ctx: ChatContext): Milestone[] {
  const pool = MILESTONES.filter((m) => nearbyStages(ctx.currentStageId).includes(m.ageStageId));
  const scored = pool
    .map((m) => ({
      m,
      score: overlapScore(query, m.title[ctx.lang], ctx.lang) + 0.3 * overlapScore(query, DOMAIN_LABELS[m.domain][ctx.lang], ctx.lang),
    }))
    .filter((x) => x.score >= MIN_CONFIDENT_SCORE)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((x) => x.m);
}

function ruleBasedReply(query: string, ctx: ChatContext): string {
  const name = ctx.babyName || tr('defaultChildName', ctx.lang);
  const redFlags = findRelevantRedFlags(query, ctx);
  const milestones = findRelevantMilestones(query, ctx);
  const disclaimer = tr('chatDisclaimer', ctx.lang);

  if (redFlags.length === 0 && milestones.length === 0) {
    return `${tr('chatNoMatch', ctx.lang, { name })}\n\n${disclaimer}`;
  }

  const lines: string[] = [];
  if (redFlags.length > 0) {
    lines.push(tr('chatRedFlagIntro', ctx.lang, { name }));
    for (const rf of redFlags) {
      lines.push(`\n• ${tr('chatSignLabel', ctx.lang)} ${rf.warningSign[ctx.lang]}`);
      const sep = ctx.lang === 'ar' ? '، ' : ', ';
      lines.push(`  ${tr('possibleCausesLabel', ctx.lang)} ${rf.possibleCauses.map((c) => c[ctx.lang]).join(sep)}`);
      lines.push(`  ${tr('assessmentLabel', ctx.lang)} ${tr(severityStringKey[rf.severity], ctx.lang)}`);
      lines.push(`  ${tr('specialistLabel', ctx.lang)} ${rf.specialist[ctx.lang]}`);
      if (rf.notes[ctx.lang]) lines.push(`  ${tr('chatNoteLabel', ctx.lang)} ${rf.notes[ctx.lang]}`);
    }
  } else if (milestones.length > 0) {
    lines.push(tr('chatMilestoneIntro', ctx.lang));
    for (const m of milestones) {
      lines.push(`• ${m.title[ctx.lang]} (${DOMAIN_LABELS[m.domain][ctx.lang]})`);
    }
    lines.push(`\n${tr('chatMilestoneOutro', ctx.lang, { name })}`);
  }

  lines.push(`\n${disclaimer}`);
  return lines.join('\n');
}

async function callProxy(query: string, ctx: ChatContext, grounding: string): Promise<string> {
  const res = await fetch(PROXY_URL as string, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, context: ctx, grounding }),
  });
  if (!res.ok) throw new Error(`proxy error ${res.status}`);
  const data = await res.json();
  return data.reply as string;
}

async function callAnthropicDirect(query: string, ctx: ChatContext, grounding: string): Promise<string> {
  const languageInstruction =
    ctx.lang === 'ar'
      ? 'انتِ مساعدة داعمة لأم بتتابع نمو طفلها. جاوبي بالعربية المصرية ببساطة ودفء.'
      : "You are a supportive assistant for a mother tracking her child's growth. Reply in warm, simple English.";
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': DIRECT_API_KEY as string,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 500,
      system:
        `${languageInstruction} ` +
        'استخدمي المعلومات المرجعية اللي هتوصلك بس، ومتخترعيش معلومات طبية. ' +
        'لو السؤال بيوحي بمشكلة تستحق تقييم طبي، وضّحي ده بوضوح واقترحي التخصص المناسب. ' +
        `Reference information for this age stage:\n${grounding}`,
      messages: [{ role: 'user', content: query }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic error ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

function buildGrounding(query: string, ctx: ChatContext): string {
  const redFlags = findRelevantRedFlags(query, ctx);
  const milestones = findRelevantMilestones(query, ctx);
  const parts: string[] = [];
  redFlags.forEach((rf) =>
    parts.push(
      `Warning sign: ${rf.warningSign[ctx.lang]} | Possible causes: ${rf.possibleCauses.map((c) => c[ctx.lang]).join(', ')} | ` +
        `Classification: ${tr(severityStringKey[rf.severity], ctx.lang)} | Specialist: ${rf.specialist[ctx.lang]} | ${rf.notes[ctx.lang]}`
    )
  );
  milestones.forEach((m) => parts.push(`Expected skill: ${m.title[ctx.lang]} (${DOMAIN_LABELS[m.domain][ctx.lang]})`));
  return parts.join('\n') || 'No directly matching data; answer cautiously based on general knowledge of growth milestones.';
}

export async function getAssistantReply(query: string, ctx: ChatContext): Promise<string> {
  const grounding = buildGrounding(query, ctx);
  try {
    if (PROXY_URL) return await callProxy(query, ctx, grounding);
    if (DIRECT_API_KEY) return await callAnthropicDirect(query, ctx, grounding);
  } catch {
    // يقع تلقائيًا على الرد المبني على القواعد لو فشل الاتصال
  }
  return ruleBasedReply(query, ctx);
}
