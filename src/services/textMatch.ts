import { Lang } from '../i18n/strings';

export function normalizeArabic(text: string): string {
  return text.normalize('NFKC').toLowerCase()
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[إأآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x6f0))
    .replace(/[^a-z0-9\u0621-\u063a\u0641-\u064a\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

const STOPWORDS = new Set(normalizeArabic(
  'من في على الى عن مع هل هو هي ما لا او ان كان هذا هذه ذلك التي الذي بس يعني عايز عايزة عاوز عاوزه ' +
  'ابني بنتي الطفل طفلي بيبي ابنتي لسه مش عنده عندها عمره عمرها شهور شهر سنه سنوات ايه امتى ازاي طبيعي ' +
  'the a an is are was were to of in on at and or my he she it his her baby child son daughter not does do ' +
  'doesn don t yet still with for about how when what can should old months month years year'
).split(' '));

// Explicit concepts join dialect, formal Arabic and English without guessing roots
// from shared character prefixes, which previously returned unrelated matches.
const CONCEPTS: Record<string, string[]> = {
  speech: ['كلام', 'الكلام', 'كلامه', 'كلامها', 'تكلم', 'يتكلم', 'بيتكلم', 'بيتكلمش', 'تتكلم', 'بتتكلم', 'بتتكلمش', 'اتكلم', 'نطق', 'النطق', 'ينطق', 'بينطق', 'بينطقش', 'كلمه', 'كلمات', 'كلمتين', 'مفردات', 'مفرداته', 'جمل', 'جملا', 'جمله', 'يقول', 'بيقول', 'بيقولش', 'يقولش', 'بتقول', 'تخاطب', 'talk', 'talking', 'speak', 'speaks', 'speaking', 'speech', 'word', 'words', 'vocabulary', 'sentences', 'sentence'],
  walking: ['مشي', 'المشي', 'يمشي', 'بيمشي', 'بيمشيش', 'تمشي', 'بتمشي', 'بتمشيش', 'يمش', 'خطوات', 'walk', 'walks', 'walking', 'steps'],
  standing: ['يقف', 'واقف', 'الوقوف', 'وقوف', 'بيقف', 'بيقفش', 'تقف', 'بتقف', 'stand', 'stands', 'standing', 'pulls to stand'],
  sitting: ['يجلس', 'جلوس', 'الجلوس', 'يقعد', 'قاعد', 'قاعده', 'بيقعد', 'بيقعدش', 'بتقعد', 'بتقعدش', 'sit', 'sits', 'sitting'],
  crawling: ['زحف', 'الزحف', 'يزحف', 'بيزحف', 'بيزحفش', 'بيحبي', 'بيحبيش', 'يحبي', 'حبو', 'الحبو', 'بتحبي', 'بتحبيش', 'crawl', 'crawls', 'crawling'],
  hearing: ['سمع', 'السمع', 'يسمع', 'بيسمع', 'بيسمعش', 'اسمه', 'اسمها', 'باسمه', 'لاسْمه', 'لاسمه', 'لاسمها', 'صوت', 'صوته', 'الاصوات', 'للاصوات', 'سمعي', 'hear', 'hearing', 'sounds', 'sound', 'name', 'deaf'],
  babbling: ['مناغاه', 'المناغاه', 'يناغي', 'بيناغي', 'بيناغيش', 'بتناغي', 'مقاطع', 'يناغيش', 'babble', 'babbles', 'babbling', 'coo', 'cooing', 'syllables'],
  vision: ['نظر', 'النظر', 'الرؤيه', 'بعينيه', 'عينيه', 'عينه', 'يشوف', 'بيشوف', 'بيشوفش', 'يتابع', 'بيتتبع', 'vision', 'eyes', 'eye', 'track', 'tracks', 'tracking', 'moving objects'],
  smile: ['ابتسام', 'ابتسامه', 'الابتسامه', 'يبتسم', 'بيبتسم', 'بيبتسمش', 'يضحك', 'بيضحك', 'بيضحكش', 'بتضحك', 'بتضحكش', 'ضحك', 'smile', 'smiles', 'smiling', 'laugh', 'laughs', 'laughing'],
  head: ['راسه', 'راسها', 'الراس', 'رقبته', 'رقبتها', 'head', 'neck'],
  rolling: ['يتدحرج', 'تدحرج', 'يتقلب', 'بيتقلب', 'بيتقلبش', 'بتتقلب', 'تقلب', 'التقلب', 'roll', 'rolls', 'rolling'],
  hands: ['يمسك', 'بيمسك', 'بيمسكش', 'تمسك', 'بتمسك', 'يده', 'يديه', 'ايده', 'يمسكش', 'يلتقط', 'التقاط', 'grasp', 'grasping', 'grabs', 'holding', 'hold', 'holds', 'hand', 'hands', 'pick up'],
  play: ['لعب', 'اللعب', 'يلعب', 'بيلعب', 'بيلعبش', 'بتلعب', 'تفاعل', 'التفاعل', 'يتفاعل', 'بيتفاعل', 'بيتفاعلش', 'اجتماعي', 'اجتماعيه', 'play', 'plays', 'playing', 'social', 'interact', 'interaction'],
  pointing: ['يشير', 'بيشاور', 'بيشاورش', 'بتشاور', 'اشاره', 'الاشاره', 'ايماءات', 'point', 'points', 'pointing', 'gestures', 'wave', 'waving'],
  understanding: ['يفهم', 'بيفهم', 'بيفهمش', 'بتفهم', 'تعليمات', 'التعليمات', 'ادراك', 'الادراك', 'understand', 'understands', 'understanding', 'instructions', 'directions', 'cognitive'],
  running: ['يجري', 'بيجري', 'جري', 'الجري', 'يركض', 'سلم', 'السلم', 'درج', 'run', 'runs', 'running', 'stairs', 'climbs', 'climb'],
  drawing: ['يرسم', 'بيرسم', 'رسم', 'الرسم', 'قلم', 'القلم', 'مكعبات', 'draw', 'draws', 'drawing', 'scribbles', 'pen', 'blocks'],
};

const NORMALIZED_CONCEPTS = Object.entries(CONCEPTS).map(([concept, aliases]) => [concept,
  aliases.flatMap((alias) => alias.endsWith('ش') ? [alias, `م${alias}`] : [alias])
    .map((alias) => ` ${normalizeArabic(alias)} `),
] as const);

export function hasPhrase(text: string, phrase: string): boolean {
  return ` ${normalizeArabic(text)} `.includes(` ${normalizeArabic(phrase)} `);
}

export function conceptsIn(text: string): string[] {
  const normalized = ` ${normalizeArabic(text)} `;
  return NORMALIZED_CONCEPTS
    .filter(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))
    .map(([concept]) => concept);
}

export function significantWords(text: string, _lang: Lang = 'ar'): string[] {
  return [...new Set(normalizeArabic(text).split(' ')
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word) && !/^\d+$/.test(word))
    .map((word) => word.length > 4 && word.startsWith('ال') ? word.slice(2) : word))];
}

export function overlapScore(a: string, b: string, lang: Lang = 'ar'): number {
  const words = new Set(significantWords(a, lang));
  const concepts = new Set(conceptsIn(a));
  return significantWords(b, lang).filter((word) => words.has(word)).length +
    3 * conceptsIn(b).filter((concept) => concepts.has(concept)).length;
}
