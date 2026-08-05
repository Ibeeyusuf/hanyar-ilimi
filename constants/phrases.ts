/**
 * Every fixed Hausa phrase the app speaks.
 *
 * These used to be string literals scattered across the screens, which meant
 * there was no way to enumerate what the app says — and therefore no way to
 * generate a recorded clip for each line. Narration is now looked up here so
 * `tools/extract_strings.mjs` can walk this file and produce the manifest the
 * audio pipeline works from.
 *
 * Add a phrase here, not at the call site. A phrase with no entry still works
 * — it falls through to device speech — but it will never get a Hausa clip.
 */
import { NUMBER_WORDS } from "@/lib/clipKey";

export const PHRASES = {
  // --- welcome / login ---
  welcome: "Sannu! Danna don farawa.",
  pickYourPhoto: "Danna hotonka.",
  pickThreePictures: "Danna hotunanka guda uku.",
  tryAgain: "Ka sake gwadawa.",
  callYourTeacher: "Ka kira malaminka.",

  // --- navigation ---
  chooseWhatToLearn: "Sannu! Zaɓi abin da za ka koya.",
  chooseAModule: "Zaɓi darasi.",
  chooseALesson: "Zaɓi darasi da kake so.",

  // --- lesson and quiz ---
  listenAndChoose: "Saurari kalmar, sannan ka zaɓi amsar da ta dace.",
  wellDone: "Madalla!",
  countTheMangoes: "Ƙidaya mangwaro.",
  whichGroupHas: "Wanne rukuni yake da wannan lamba?",
  addThemUp: "Ƙara su. Nawa ne duka?",

  // --- spoken on its own to test the voice ---
  hello: "Sannu.",
} as const;

export type PhraseKey = keyof typeof PHRASES;

/**
 * Hausa number words. The numeracy quiz previously spoke the numeral itself —
 * `speak("3")` — which a device voice reads as the English "three". A child
 * learning to count in Hausa needs to hear "uku".
 *
 * Defined in lib/clipKey.ts, which has to stay import-free, and re-exported
 * here so screens have one place to look for spoken text.
 */
export { NUMBER_WORDS };

/** The Hausa word for a number, falling back to the numeral above 20. */
export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** "biyu da ɗaya" — spoken form of an addition, for the numeracy quiz. */
export function additionPhrase(a: number, b: number): string {
  return `${numberWord(a)} da ${numberWord(b)}`;
}
