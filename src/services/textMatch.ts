import { Lang } from '../i18n/strings';

const AR_STOPWORDS = new Set([
  'من', 'في', 'على', 'الى', 'إلى', 'عن', 'مع', 'هل', 'هو', 'هي', 'ما', 'لا', 'او', 'أو',
  'ان', 'إن', 'كان', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'بس', 'يعني', 'عايز', 'عايزة',
  'ابني', 'بنتي', 'الطفل', 'طفلي',
]);

const EN_STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 'and', 'or',
  'my', 'he', 'she', 'it', 'his', 'her', 'baby', 'child', 'son', 'daughter', 'not', 'does',
  'do', 'doesn\'t', 'don\'t', 'yet', 'still', 'with', 'for', 'about',
]);

export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ٟ]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^؀-ۿ\s]/g, ' ')
    .toLowerCase()
    .trim();
}

function normalizeEnglish(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .trim();
}

// بتشيل "ال" التعريف عشان "اللغة" و"لغة" يتحسبوا نفس الكلمة، من غير ما نعمل مطابقة فضفاضة تجيب نتايج عشوائية
function stripArabicPrefix(word: string): string {
  return word.length > 4 && word.startsWith('ال') ? word.slice(2) : word;
}

export function significantWords(text: string, lang: Lang = 'ar'): string[] {
  if (lang === 'en') {
    return normalizeEnglish(text)
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !EN_STOPWORDS.has(w));
  }
  return normalizeArabic(text)
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !AR_STOPWORDS.has(w))
    .map(stripArabicPrefix);
}

// درجة تطابق قوية (كلمة كاملة) = 1، ودرجة تطابق ضعيفة (نفس الجذر تقريبًا، أول 4 حروف) = 0.5.
// المطابقة الضعيفة وحدها مش كافية عشان نعتبر النتيجة "ذات صلة" (شوفي MIN_CONFIDENT_SCORE في aiChatService)
// علشان منجيبش إجابات عشوائية من تشابه كلمات سطحي زي اسم المجال (حركة/لغة/إلخ).
export function overlapScore(a: string, b: string, lang: Lang = 'ar'): number {
  const wa = new Set(significantWords(a, lang));
  const wb = significantWords(b, lang);
  let score = 0;
  for (const w of wb) {
    if (wa.has(w)) {
      score += 1;
      continue;
    }
    for (const x of wa) {
      if (x.length >= 4 && w.length >= 4 && x.slice(0, 4) === w.slice(0, 4)) {
        score += 0.5;
        break;
      }
    }
  }
  return score;
}
