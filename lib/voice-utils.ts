/**
 * lib/voice-utils.ts
 * Utilities for dialect-aware Arabic speech matching
 */

/**
 * Normalizes Arabic text by removing diacritics, normalizing hamzas, 
 * taa-marbutas, and other variations to make it easier to compare words across dialects.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';

  return text
    .trim()
    .replace(/[\u064B-\u0652]/g, '') // Remove harakat (vowels)
    .replace(/[أإآ]/g, 'ا')           // Normalize Alef
    .replace(/ة/g, 'ه')              // Normalize Taa Marbuta
    .replace(/ى/g, 'ي')              // Normalize Alef Maqsura / Yaa
    .replace(/\s+/g, ' ');           // Normalize spaces
}

/**
 * Specialized normalization for dialectal variations.
 * Maps common phoneme shifts back to a clinical baseline.
 */
export function dialectNormalization(text: string): string {
  let normalized = normalizeArabic(text);
  
  // Rule-based mappings for common dialectal shifts
  // Note: These are simplified for the MVP naming test
  return normalized
    .replace(/ج/g, '[ج|ي]') // Some dialects swap Jim/Yaa
    .replace(/ق/g, '[ق|ا|ج|ك]'); // The most common dialectal shift (Qaf -> Alef, Jim, or Kaf)
}

/**
 * Basic Levenshtein distance for string similarity
 */
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Calculates a match score (0 to 1) between spoken input and clinical target
 */
export function calculateVoiceMatchScore(input: string, target: string): number {
  const normInput = normalizeArabic(input);
  const normTarget = normalizeArabic(target);

  if (normInput === normTarget) return 1.0;

  // Simple check for partial dialectal equivalence of target words
  // e.g. "قلم" (target) vs "ألم" (input) - we handle this specifically for common clinical words
  const dInput = normalizeArabic(input);
  const dTarget = normalizeArabic(target);

  // If input matches any major dialectal variant, it's a 100% win for clinical accuracy
  const dialVariantMatch = (inp: string, tar: string) => {
    // Basic substitution mapping check
    const variants = [
      tar.replace(/ق/g, 'ا'),
      tar.replace(/ق/g, 'ج'),
      tar.replace(/ق/g, 'ك'),
      tar.replace(/ج/g, 'ي'),
    ];
    return variants.includes(inp);
  };

  if (dialVariantMatch(dInput, dTarget)) return 1.0;

  // Otherwise fallback to fuzzy distance
  const distance = levenshtein(normInput, normTarget);
  const maxLength = Math.max(normInput.length, normTarget.length);
  
  return maxLength === 0 ? 0 : 1 - distance / maxLength;
}
