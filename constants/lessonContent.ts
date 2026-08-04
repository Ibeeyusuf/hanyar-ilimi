/**
 * Per-lesson teaching content. Keyed by "subject/module/lesson".
 * Each lesson provides: a headline word being taught, a visual (emoji or the
 * kids scene), a Hausa prompt with a blank, three answer options (one correct),
 * and a spoken word. Lessons without an explicit entry fall back to a sensible
 * auto-generated card so nothing is ever blank.
 */

export type Option = { label: string; correct?: boolean };
export type LessonContent = {
  word: string;          // the word/concept being taught (spoken)
  visual: "kids" | string; // "kids" scene, or an emoji string
  prompt: string;        // Hausa sentence with a blank
  hint: string;          // Hausa helper line
  options: Option[];     // 3 options
};

export const LESSON_CONTENT: Record<string, LessonContent> = {
  // ---------- LITERACY / GRAMMAR ----------
  "literacy/grammar/people": {
    word: "Sannu", visual: "kids",
    prompt: "Wadannan su ne __________.",
    hint: "Wannan su ne Aminu da Zara. Suna cewa 'Sannu!'",
    options: [{ label: "Yara", correct: true }, { label: "Littattafai" }, { label: "Kwakwa" }],
  },
  "literacy/grammar/objects": {
    word: "Kujera", visual: "🪑",
    prompt: "Wannan __________ ne.",
    hint: "Muna zama a kan kujera.",
    options: [{ label: "Kujera", correct: true }, { label: "Yaro" }, { label: "Ruwa" }],
  },
  "literacy/grammar/actions": {
    word: "Gudu", visual: "🏃",
    prompt: "Yaron yana __________.",
    hint: "Idan muka yi sauri da ƙafa, muna gudu.",
    options: [{ label: "Gudu", correct: true }, { label: "Barci" }, { label: "Ci" }],
  },

  // ---------- LITERACY / READING ----------
  "literacy/reading/letters": {
    word: "A", visual: "🅰️",
    prompt: "Wannan harafin __________ ne.",
    hint: "A shine harafi na farko.",
    options: [{ label: "A", correct: true }, { label: "B" }, { label: "K" }],
  },
  "literacy/reading/words": {
    word: "Kifi", visual: "🐟",
    prompt: "Karanta: wannan __________ ne.",
    hint: "Kifi yana rayuwa cikin ruwa.",
    options: [{ label: "Kifi", correct: true }, { label: "Kaza" }, { label: "Kare" }],
  },

  // ---------- LITERACY / VOCABULARY ----------
  "literacy/vocab/family": {
    word: "Uwa", visual: "👩",
    prompt: "Wannan __________ ce.",
    hint: "Uwa tana kula da mu.",
    options: [{ label: "Uwa", correct: true }, { label: "Uba" }, { label: "Yaro" }],
  },
  "literacy/vocab/animals": {
    word: "Kare", visual: "🐕",
    prompt: "Wannan __________ ne.",
    hint: "Kare yana yin haushi.",
    options: [{ label: "Kare", correct: true }, { label: "Kyanwa" }, { label: "Akuya" }],
  },

  // ---------- HYGIENE / HANDWASH ----------
  "hygiene/handwash/why": {
    word: "Wanke Hannu", visual: "🧼",
    prompt: "Muna wanke hannu da __________.",
    hint: "Sabulu yana kashe ƙwayoyin cuta.",
    options: [{ label: "Sabulu", correct: true }, { label: "Yashi" }, { label: "Toka" }],
  },
  "hygiene/handwash/when": {
    word: "Kafin Ci", visual: "🍽️",
    prompt: "Muna wanke hannu kafin __________.",
    hint: "Kullum ka wanke hannu kafin ka ci abinci.",
    options: [{ label: "Cin abinci", correct: true }, { label: "Barci" }, { label: "Wasa" }],
  },

  // ---------- HYGIENE / TEETH ----------
  "hygiene/teeth/why-brush": {
    word: "Goge Hakori", visual: "🪥",
    prompt: "Muna goge hakori da __________.",
    hint: "Buroshi da man goge baki suna tsabtace hakori.",
    options: [{ label: "Buroshi", correct: true }, { label: "Cokali" }, { label: "Zare" }],
  },

  // ---------- HYGIENE / FOOD ----------
  "hygiene/food/fruits": {
    word: "'Ya'yan Itace", visual: "🍎",
    prompt: "Wannan __________ ne mai amfani.",
    hint: "'Ya'yan itace suna ba mu lafiya.",
    options: [{ label: "'Ya'yan itace", correct: true }, { label: "Alewa" }, { label: "Sukari" }],
  },
};

// Auto-fallback so every lesson shows meaningful, DISTINCT content even
// without a hand-written entry. Distractors are drawn from sibling lessons in
// the same module, so no two lessons present the same question.
export function contentFor(
  subject: string,
  module: string,
  lessonId: string,
  lessonHa: string,
  siblings?: Array<{ id: string; ha: string }>
): LessonContent {
  const key = `${subject}/${module}/${lessonId}`;
  if (LESSON_CONTENT[key]) return LESSON_CONTENT[key];

  const visualBySubject: Record<string, string> = { literacy: "📖", numeracy: "🔢", hygiene: "💧" };

  // two different sibling lessons become the wrong answers
  const others = (siblings ?? [])
    .filter((s) => s.id !== lessonId && s.ha && s.ha !== lessonHa)
    .map((s) => s.ha);
  // deterministic pick so a lesson's options don't change on every render
  const seed = lessonId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = (n: number) => (others.length ? others[(seed + n) % others.length] : "—");
  const wrongA = pick(0);
  const wrongB = others.length > 1 ? pick(1) : "—";

  return {
    word: lessonHa,
    visual: visualBySubject[subject] ?? "⭐",
    prompt: `Wanne ne "${lessonHa}"?`,
    hint: `Saurari sannan ka zaɓi "${lessonHa}".`,
    options: [
      { label: lessonHa, correct: true },
      { label: wrongA },
      { label: wrongB },
    ],
  };
}
