export interface NarrationSegment {
  index: number;
  stanzaIndex: number;
  lineIndex: number;
  rawText: string;
  spokenText: string;
}

/**
 * Normalizes stylistic poetic typography (decorative stars, hearts, tildes,
 * repeated dashes, double commas, double dari) into clean spoken text so browser
 * speech synthesis reads verses fluidly instead of vocalizing ASCII/Unicode symbols.
 * Display text in the DOM is never altered by this function.
 */
export function sanitizeVerseForSpeech(rawLine: string): string {
  if (!rawLine) return '';

  let cleaned = rawLine
    // Strip decorative stars, hearts, ornaments, and musical notes
    .replace(/[♡♥❤❥★☆✦✧♪♫•·]/g, ' ')
    // Replace runs of tildes or decorative hyphens with a gentle pause comma or space
    .replace(/~+/g, ' ')
    .replace(/-{2,}/g, ', ')
    .replace(/\s+-\s+/g, ', ')
    // Normalize Bangla double dari (।।) and repeated dari (।) into a clean pause
    .replace(/।{2,}/g, '। ')
    // Collapse stylistic double commas (,,) into a single comma + space
    .replace(/,{2,}/g, ', ')
    // Collapse repeated exclamation or question marks
    .replace(/!{2,}/g, '!')
    .replace(/\?{2,}/g, '?')
    // Clean up stray ".!" or ",!" combinations
    .replace(/\.\s*!/g, '!')
    .replace(/,\s*!/g, '!')
    .replace(/,\s*\?/g, '?')
    // Normalize whitespace around punctuation
    .replace(/\s+([,।!?])/g, '$1')
    .replace(/([,।!?])([^\s])/g, '$1 $2')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Strip leading or trailing isolated punctuation if nothing meaningful surrounds it
  cleaned = cleaned.replace(/^[,.\s]+/, '').replace(/[,\s]+$/, '').trim();

  // Check if any alphanumeric/Bengali letter characters remain
  if (!/[\p{L}\p{N}]/u.test(cleaned)) {
    return '';
  }

  return cleaned;
}

export function buildPoemNarrationQueue(
  stanzas: readonly (readonly string[])[]
): NarrationSegment[] {
  const queue: NarrationSegment[] = [];

  stanzas.forEach((stanza, stanzaIndex) => {
    stanza.forEach((line, lineIndex) => {
      const spokenText = sanitizeVerseForSpeech(line);
      if (!spokenText) return;

      queue.push({
        index: queue.length,
        stanzaIndex,
        lineIndex,
        rawText: line,
        spokenText,
      });
    });
  });

  return queue;
}

export function buildExcerptNarrationQueue(
  lines: readonly string[]
): NarrationSegment[] {
  return buildPoemNarrationQueue([lines]);
}

export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

/**
 * Picks the best available voice from the browser's SpeechSynthesis list,
 * prioritizing Bengali (Bangladesh `bn-BD`, India `bn-IN`, generic `bn`),
 * then falling back gracefully when Bengali system voices are absent.
 */
export function selectPreferredVoice<T extends VoiceLike>(
  voices: readonly T[],
  preferredLangs: readonly string[] = ['bn-BD', 'bn-IN', 'bn']
): T | null {
  if (!voices || voices.length === 0) return null;

  const normalizedTargets = preferredLangs.map((code) =>
    code.toLowerCase().replace('_', '-')
  );

  for (const target of normalizedTargets) {
    const exactMatches = voices.filter(
      (v) => v.lang.toLowerCase().replace('_', '-') === target
    );
    if (exactMatches.length > 0) {
      return exactMatches.find((v) => v.localService) ?? exactMatches[0];
    }

    const prefix = target.split('-')[0];
    const prefixMatches = voices.filter((v) => {
      const voiceLang = v.lang.toLowerCase().replace('_', '-');
      return voiceLang === prefix || voiceLang.startsWith(`${prefix}-`);
    });
    if (prefixMatches.length > 0) {
      return prefixMatches.find((v) => v.localService) ?? prefixMatches[0];
    }
  }

  return voices.find((v) => v.default) ?? voices[0] ?? null;
}

export function isWebSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'speechSynthesis' in window &&
    typeof window.speechSynthesis?.speak === 'function' &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export const NARRATION_RATES = [0.8, 0.92, 1.08] as const;
export type NarrationRate = (typeof NARRATION_RATES)[number];

export function clampNarrationRate(rate: number): NarrationRate {
  if (!Number.isFinite(rate)) return 0.92;
  let closest: NarrationRate = NARRATION_RATES[1];
  let minDiff = Number.POSITIVE_INFINITY;
  for (const option of NARRATION_RATES) {
    const diff = Math.abs(option - rate);
    if (diff < minDiff) {
      minDiff = diff;
      closest = option;
    }
  }
  return closest;
}
