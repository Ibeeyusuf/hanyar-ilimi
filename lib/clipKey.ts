/**
 * How a spoken line becomes a clip lookup key.
 *
 * This is the one place the app and the build pipeline have to agree exactly.
 * `tools/extract_strings.mjs` normalises text this way before hashing it into
 * a clip id; `lib/speech.ts` normalises the same way before looking the id up.
 * If the two drift apart, every lookup misses — and the failure is silent and
 * total: the app quietly reverts to an English voice reading Hausa, which is
 * the exact bug the recorded library exists to fix, and nothing on screen
 * changes to say so.
 *
 * So it lives here with no imports at all — not even the project's `@/` alias,
 * which TypeScript does not rewrite on emit — and `npm test` checks it.
 */

/**
 * Hausa number words. They live in this file rather than constants/phrases.ts
 * because `spokenForm` needs them and this module must stay import-free;
 * phrases.ts re-exports them for everyone else.
 */
export const NUMBER_WORDS: Record<number, string> = {
  0: "sifili",
  1: "ɗaya",
  2: "biyu",
  3: "uku",
  4: "huɗu",
  5: "biyar",
  6: "shida",
  7: "bakwai",
  8: "takwas",
  9: "tara",
  10: "goma",
  11: "goma sha ɗaya",
  12: "goma sha biyu",
  13: "goma sha uku",
  14: "goma sha huɗu",
  15: "goma sha biyar",
  16: "goma sha shida",
  17: "goma sha bakwai",
  18: "goma sha takwas",
  19: "goma sha tara",
  20: "ashirin",
};

/** Collapse whitespace, trim, lowercase. Mirrored in extract_strings.mjs. */
export function normaliseForClip(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * What a line should actually sound like. A numeric answer tile is labelled
 * "3", but a child learning to count in Hausa has to hear "uku" — a device
 * voice would say the English "three", and there is no recording keyed to a
 * digit.
 */
export function spokenForm(text: string): string {
  const trimmed = text.trim();
  if (/^\d{1,2}$/.test(trimmed)) {
    const word = NUMBER_WORDS[Number(trimmed)];
    if (word) return word;
  }
  return trimmed;
}
