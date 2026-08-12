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

export function significantWords(text: string, lang: Lang = 'ar'): string[] {
  if (lang === 'en') {
    return normalizeEnglish(text)
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !EN_STOPWORDS.has(w));
  }
  return normalizeArabic(text)
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !AR_STOPWORDS.has(w));
}

export function overlapScore(a: string, b: string, lang: Lang = 'ar'): number {
  const wa = new Set(significantWords(a, lang));
  const wb = significantWords(b, lang);
  let score = 0;
  for (const w of wb) {
    if (wa.has(w)) score += 1;
    else {
      for (const x of wa) {
        if (x.length >= 3 && (x.includes(w) || w.includes(x))) {
          score += 0.5;
          break;
        }
      }
    }
  }
  return score;
}
