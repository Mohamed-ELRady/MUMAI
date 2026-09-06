import { conceptsIn, hasPhrase, normalizeArabic } from './textMatch';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
}

const NUMBER_WORDS: Record<string, number> = {
  شهرين: 2, شهران: 2, سنتين: 24, سنتان: 24, عامين: 24,
  'سنه ونص': 18, 'سنه ونصف': 18, 'سنتين ونص': 30, 'سنتين ونصف': 30,
  'سنه وربع': 15, 'سنه': 12, 'عام': 12,
};

/** Parse ages, never an unrelated number such as a word count. */
export function ageInQuery(query: string): number | undefined {
  const text = normalizeArabic(query);
  const numberNames: Record<string, string> = {
    واحد: '1', اتنين: '2', اثنين: '2', تلاته: '3', ثلاثه: '3', اربعه: '4', خمسه: '5',
    سته: '6', ست: '6', سبعه: '7', تمانيه: '8', ثمانيه: '8', تسعه: '9', عشره: '10',
    one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', eighteen: '18',
  };
  const numeric = text.split(' ').map((word) => numberNames[word] ?? word).join(' ');
  const compoundYear = /(?:^|\s)سنه\s+و\s*(\d{1,2})\s*(?:شهر|شهور|اشهر)(?=\s|$)/.exec(numeric);
  if (compoundYear && !/(?:^|\s)(من|لمده|بقاله|بقالها)\s*$/.test(numeric.slice(0, compoundYear.index))) return 12 + Number(compoundYear[1]);
  const matches = [...numeric.matchAll(/(?:^|\s)(\d{1,3})\s*(شهور|اشهر|شهر|سنوات|سنين|سنه|عام|اعوام|months?|years?)(?=\s|$)/g)];
  const match = matches.find((candidate) => !/(?:^|\s)(من|لمده|بقاله|بقالها|for|since)\s*$/.test(numeric.slice(0, candidate.index)));
  if (match) {
    const years = /سن|عام|اعوام|year/.test(match[2]);
    let months = Number(match[1]) * (years ? 12 : 1);
    if (years) {
      const rest = numeric.slice((match.index ?? 0) + match[0].length);
      const extra = /^(?:\s+and\s+|\s+و\s*)(\d{1,2})\s*(?:شهر|شهور|اشهر|months?)(?=\s|$)/.exec(rest);
      if (extra) months += Number(extra[1]);
      else if (/^\s+و(?:نص|نصف)(?=\s|$)/.test(rest)) months += 6;
    }
    return months;
  }
  for (const [phrase, months] of Object.entries(NUMBER_WORDS).sort((a, b) => b[0].length - a[0].length)) {
    if (hasPhrase(text, phrase)) {
      const prefix = text.slice(0, text.indexOf(phrase));
      if (/(?:^|\s)(من|لمده|بقاله|بقالها|for|since|\d+)\s*$/.test(prefix)) continue;
      const extra = /سنه\s+و\s*(\d{1,2})\s*(?:شهر|شهور|اشهر)/.exec(numeric);
      return extra ? 12 + Number(extra[1]) : months;
    }
  }
  return undefined;
}

export function isConcern(query: string): boolean {
  const text = normalizeArabic(query);
  return /(?:^|\s)(مش|لا|مفيش|بدون|متاخر|متاخره|تاخر|صعوبه|قلقانه|قلقان|not|never|cannot|can t|doesn t|isn t|delay|delayed|difficulty|worried)(?:\s|$)/.test(text)
    || /(?:^|\s)[بتيم][\u0621-\u064a]+ش(?:\s|$)/.test(text);
}

export function isFollowUp(query: string): boolean {
  const text = normalizeArabic(query);
  return /^(طيب\s*)?(اعمل ايه|واعمل ايه|ازاي اساعده|ازاي اساعدها|اساعده ازاي|اساعدها ازاي|ليه|وضح اكتر|ده طبيعي|دا طبيعي|هل ده طبيعي|وايه الحل|what should i do|what can i do|how can i help|is that normal|why|tell me more)(\s|$)/.test(text)
    || (ageInQuery(query) !== undefined && conceptsIn(query).length === 0);
}

export function resolveConversation(query: string, history: ConversationMessage[]): string {
  if (conceptsIn(query).length || !isFollowUp(query)) return query;
  // Do not let an old topic bleed into a new question or mine the assistant's examples.
  const previous = [...history].reverse().find((message) => message.role === 'user');
  if (!previous) return query;
  if (isFollowUp(previous.text) && !conceptsIn(previous.text).length) {
    const index = history.lastIndexOf(previous);
    return `${resolveConversation(previous.text, history.slice(0, index))}\n${query}`;
  }
  return `${previous.text}\n${query}`;
}

export function urgentKind(query: string): 'emergency' | 'regression' | undefined {
  const text = normalizeArabic(query);
  const emergency = ['مش بيتنفس', 'مبيتنفسش', 'مش قادر يتنفس', 'صعوبه في التنفس', 'صعوبه تنفس', 'شفايفه زرقا', 'فاقد الوعي', 'مش بيصحي', 'تشنجات', 'بيتشنج', 'not breathing', 'cannot breathe', 'can t breathe', 'difficulty breathing', 'blue lips', 'unconscious', 'won t wake', 'seizure'];
  if (emergency.some((phrase) => hasPhrase(text, phrase))) return 'emergency';
  if (/(فقد|خسر|نسي).{0,25}(مهاره|مهارات|الكلام|المشي|المناغاه)/.test(text)
    || /كان.{0,30}ب[يت](تكلم|مشي|قعد|لعب|ستجيب|ناغي).{0,25}(بطل|مبقاش|مبقتش|وقف|مش)/.test(text)
    || /(?:بطل|بطلت|وقف|وقفت)\s+(?:يناغي|تناغي|المناغاه)/.test(text)
    || /(?:lost|losing).{0,30}(?:skill|skills|words|speech|babbling)|used to.{0,35}(?:no longer|stopped|can t)|stopped (?:babbling|cooing)/.test(text)) return 'regression';
  return undefined;
}
