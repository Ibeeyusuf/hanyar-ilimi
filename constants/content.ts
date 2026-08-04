import { colors } from "@/constants/theme";

export type Subject = { id: string; en: string; ha: string; color: string; icon: string };

export const SUBJECTS: Subject[] = [
  { id: "literacy", en: "LITERACY", ha: "Koyo karatu da rubutu", color: colors.literacy, icon: "book" },
  { id: "numeracy", en: "NUMERACY", ha: "Koyi lissafi", color: colors.numeracy, icon: "calculator" },
  { id: "hygiene", en: "HYGIENE", ha: "Koyi tsabta", color: colors.hygiene, icon: "water" },
];

export type ModuleItem = { id: string; num: number; en: string; ha: string; progress: number; critter: string; icon?: string };

export const MODULES: Record<string, ModuleItem[]> = {
  literacy: [
    { id: "grammar", num: 1, en: "GRAMMAR", ha: "Koyi nahawu", progress: 75, critter: "caterpillar", icon: "book" },
    { id: "reading", num: 2, en: "READING", ha: "Koyi karatu", progress: 60, critter: "ladybug", icon: "glasses" },
    { id: "writing", num: 3, en: "WRITING", ha: "Koyi rubutu", progress: 40, critter: "ant", icon: "pencil" },
    { id: "vocab", num: 4, en: "VOCABULARY", ha: "Koyi sababbin kalmomi", progress: 20, critter: "grasshopper", icon: "chatbubbles" },
    { id: "story", num: 5, en: "STORY TIME", ha: "Karin karatu", progress: 0, critter: "beetle", icon: "bookmarks" },
  ],
  numeracy: [
    { id: "counting", num: 1, en: "COUNTING", ha: "Koyi ƙidaya", progress: 55, critter: "bee", icon: "apps" },
    { id: "addition", num: 2, en: "ADDITION", ha: "Koyi ƙari", progress: 15, critter: "butterfly", icon: "add-circle" },
    { id: "subtraction", num: 3, en: "SUBTRACTION", ha: "Koyi ragi", progress: 0, critter: "snail", icon: "remove-circle" },
    { id: "shapes", num: 4, en: "SHAPES", ha: "San siffofi", progress: 0, critter: "frog", icon: "shapes" },
    { id: "games", num: 5, en: "MATH GAMES", ha: "Wasannin lissafi", progress: 0, critter: "fish", icon: "game-controller" },
  ],
  hygiene: [
    { id: "handwash", num: 1, en: "HANDWASHING", ha: "Wankan hannu", progress: 30, critter: "bird", icon: "water" },
    { id: "teeth", num: 2, en: "BRUSHING TEETH", ha: "Goge hakori", progress: 0, critter: "turtle", icon: "happy" },
    { id: "body", num: 3, en: "BODY CARE", ha: "Tsabtar jiki", progress: 0, critter: "worm", icon: "body" },
    { id: "clothes", num: 4, en: "CLEAN CLOTHES", ha: "Tsabtar sutura", progress: 0, critter: "spider", icon: "shirt" },
    { id: "food", num: 5, en: "GOOD FOOD", ha: "Abinci mai kyau", progress: 0, critter: "dragonfly", icon: "nutrition" },
  ],
};

export type LessonItem = { id: string; num: number; ha: string; en: string; stars: number; done?: boolean; locked?: boolean };

const GRAMMAR: LessonItem[] = [
  { id: "people", num: 1, ha: "Kalmomin Mutane", en: "People Words", stars: 1, done: true },
  { id: "objects", num: 2, ha: "Kalmomin Abu", en: "Object Words", stars: 1, locked: true },
  { id: "actions", num: 3, ha: "Kalmomin Aiki", en: "Action Words", stars: 0, locked: true },
  { id: "sentence1", num: 4, ha: "Gina Jimloli (1)", en: "Build Sentence 1", stars: 0, locked: true },
  { id: "sentence2", num: 5, ha: "Gina Jimloli (2)", en: "Build Sentence 2", stars: 0, locked: true },
  { id: "qa", num: 6, ha: "Tambayoyi da Amsa", en: "Ask & Answer", stars: 0, locked: true },
];

const READING: LessonItem[] = [
  { id: "letters", num: 1, ha: "Haruffa", en: "Letters", stars: 1, done: true },
  { id: "sounds", num: 2, ha: "Sautuka", en: "Letter Sounds", stars: 0, locked: true },
  { id: "syllables", num: 3, ha: "Baƙaƙe da Wasali", en: "Syllables", stars: 0, locked: true },
  { id: "words", num: 4, ha: "Karanta Kalmomi", en: "Reading Words", stars: 0, locked: true },
  { id: "sentences", num: 5, ha: "Karanta Jimloli", en: "Reading Sentences", stars: 0, locked: true },
  { id: "story", num: 6, ha: "Karanta Labari", en: "Reading a Story", stars: 0, locked: true },
];

const COUNTING: LessonItem[] = [
  { id: "one-five", num: 1, ha: "Ƙidaya 1-5", en: "Count 1-5", stars: 1, done: true },
  { id: "six-ten", num: 2, ha: "Ƙidaya 6-10", en: "Count 6-10", stars: 0, locked: true },
  { id: "count-things", num: 3, ha: "Ƙidaya Abubuwa", en: "Count Objects", stars: 0, locked: true },
  { id: "more-less", num: 4, ha: "Fiye da Ƙasa", en: "More & Less", stars: 0, locked: true },
  { id: "order", num: 5, ha: "Tsari na Lambobi", en: "Number Order", stars: 0, locked: true },
  { id: "twenty", num: 6, ha: "Ƙidaya zuwa 20", en: "Count to 20", stars: 0, locked: true },
];

const HANDWASH: LessonItem[] = [
  { id: "why", num: 1, ha: "Me ya sa muke wanke hannu", en: "Why Wash Hands", stars: 1, done: true },
  { id: "when", num: 2, ha: "Lokacin Wanke Hannu", en: "When to Wash", stars: 0, locked: true },
  { id: "soap", num: 3, ha: "Amfani da Sabulu", en: "Using Soap", stars: 0, locked: true },
  { id: "steps", num: 4, ha: "Matakan Wanke Hannu", en: "Washing Steps", stars: 0, locked: true },
  { id: "dry", num: 5, ha: "Bushe Hannu", en: "Drying Hands", stars: 0, locked: true },
  { id: "germs", num: 6, ha: "Yaƙi da Ƙwayoyin Cuta", en: "Fighting Germs", stars: 0, locked: true },
];

// ---- LITERACY ----
const WRITING: LessonItem[] = [
  { id: "hold-pen", num: 1, ha: "Riƙe Alƙalami", en: "Holding a Pen", stars: 1, done: true },
  { id: "lines", num: 2, ha: "Zana Layuka", en: "Drawing Lines", stars: 0, locked: true },
  { id: "trace-letters", num: 3, ha: "Bi Haruffa", en: "Tracing Letters", stars: 0, locked: true },
  { id: "write-name", num: 4, ha: "Rubuta Sunanka", en: "Writing Your Name", stars: 0, locked: true },
  { id: "write-words", num: 5, ha: "Rubuta Kalmomi", en: "Writing Words", stars: 0, locked: true },
  { id: "write-sentence", num: 6, ha: "Rubuta Jimla", en: "Writing a Sentence", stars: 0, locked: true },
];
const VOCAB: LessonItem[] = [
  { id: "family", num: 1, ha: "Iyali", en: "Family", stars: 1, done: true },
  { id: "body", num: 2, ha: "Sassan Jiki", en: "Body Parts", stars: 0, locked: true },
  { id: "animals", num: 3, ha: "Dabbobi", en: "Animals", stars: 0, locked: true },
  { id: "food", num: 4, ha: "Abinci", en: "Food", stars: 0, locked: true },
  { id: "colors", num: 5, ha: "Launuka", en: "Colours", stars: 0, locked: true },
  { id: "home", num: 6, ha: "Cikin Gida", en: "Around the Home", stars: 0, locked: true },
];
const STORY: LessonItem[] = [
  { id: "goat", num: 1, ha: "Akuya da Kura", en: "The Goat & the Hyena", stars: 1, done: true },
  { id: "spider", num: 2, ha: "Gizo-gizo", en: "The Spider", stars: 0, locked: true },
  { id: "farmer", num: 3, ha: "Manomi mai Hikima", en: "The Wise Farmer", stars: 0, locked: true },
  { id: "birds", num: 4, ha: "Tsuntsaye Biyu", en: "Two Birds", stars: 0, locked: true },
  { id: "moon", num: 5, ha: "Yarinya da Wata", en: "The Girl & the Moon", stars: 0, locked: true },
  { id: "lion", num: 6, ha: "Zaki da Ɓera", en: "The Lion & the Mouse", stars: 0, locked: true },
];

// ---- NUMERACY ----
const ADDITION: LessonItem[] = [
  { id: "add-1", num: 1, ha: "Ƙari da 1", en: "Adding 1", stars: 1, done: true },
  { id: "add-small", num: 2, ha: "Ƙari Ƙananan Lambobi", en: "Adding Small Numbers", stars: 0, locked: true },
  { id: "add-objects", num: 3, ha: "Ƙari da Abubuwa", en: "Adding Objects", stars: 0, locked: true },
  { id: "add-ten", num: 4, ha: "Ƙari zuwa 10", en: "Adding to 10", stars: 0, locked: true },
  { id: "add-story", num: 5, ha: "Tambayoyin Ƙari", en: "Word Problems", stars: 0, locked: true },
  { id: "add-fast", num: 6, ha: "Ƙari da Sauri", en: "Quick Adding", stars: 0, locked: true },
];
const SUBTRACTION: LessonItem[] = [
  { id: "sub-1", num: 1, ha: "Ragi da 1", en: "Subtracting 1", stars: 1, done: true },
  { id: "take-away", num: 2, ha: "Cire Abubuwa", en: "Taking Away", stars: 0, locked: true },
  { id: "sub-ten", num: 3, ha: "Ragi daga 10", en: "Subtracting from 10", stars: 0, locked: true },
  { id: "sub-story", num: 4, ha: "Tambayoyin Ragi", en: "Word Problems", stars: 0, locked: true },
  { id: "diff", num: 5, ha: "Bambanci", en: "Finding the Difference", stars: 0, locked: true },
  { id: "sub-fast", num: 6, ha: "Ragi da Sauri", en: "Quick Subtracting", stars: 0, locked: true },
];
const SHAPES: LessonItem[] = [
  { id: "circle", num: 1, ha: "Da'ira", en: "Circle", stars: 1, done: true },
  { id: "square", num: 2, ha: "Murabba'i", en: "Square", stars: 0, locked: true },
  { id: "triangle", num: 3, ha: "Alwatika", en: "Triangle", stars: 0, locked: true },
  { id: "rectangle", num: 4, ha: "Dogon Murabba'i", en: "Rectangle", stars: 0, locked: true },
  { id: "match-shapes", num: 5, ha: "Daidaita Siffofi", en: "Matching Shapes", stars: 0, locked: true },
  { id: "shapes-around", num: 6, ha: "Siffofi Kewaye da Mu", en: "Shapes Around Us", stars: 0, locked: true },
];
const MATHGAMES: LessonItem[] = [
  { id: "count-race", num: 1, ha: "Tseren Ƙidaya", en: "Counting Race", stars: 1, done: true },
  { id: "number-match", num: 2, ha: "Daidaita Lambobi", en: "Number Match", stars: 0, locked: true },
  { id: "add-game", num: 3, ha: "Wasan Ƙari", en: "Addition Game", stars: 0, locked: true },
  { id: "shape-hunt", num: 4, ha: "Neman Siffofi", en: "Shape Hunt", stars: 0, locked: true },
  { id: "memory", num: 5, ha: "Wasan Tunawa", en: "Memory Game", stars: 0, locked: true },
  { id: "puzzle", num: 6, ha: "Wasan Wasa", en: "Number Puzzle", stars: 0, locked: true },
];

// ---- HYGIENE ----
const TEETH: LessonItem[] = [
  { id: "why-brush", num: 1, ha: "Me ya sa muke goge hakori", en: "Why Brush Teeth", stars: 1, done: true },
  { id: "brush-tools", num: 2, ha: "Buroshi da Man Goge Baki", en: "Brush & Paste", stars: 0, locked: true },
  { id: "brush-how", num: 3, ha: "Yadda ake Goge Hakori", en: "How to Brush", stars: 0, locked: true },
  { id: "brush-when", num: 4, ha: "Lokacin Goge Hakori", en: "When to Brush", stars: 0, locked: true },
  { id: "sugar", num: 5, ha: "Sukari da Hakori", en: "Sugar & Teeth", stars: 0, locked: true },
  { id: "smile", num: 6, ha: "Murmushi Mai Ƙoshin Lafiya", en: "A Healthy Smile", stars: 0, locked: true },
];
const BODY: LessonItem[] = [
  { id: "bath", num: 1, ha: "Yin Wanka", en: "Taking a Bath", stars: 1, done: true },
  { id: "hair", num: 2, ha: "Tsabtar Gashi", en: "Clean Hair", stars: 0, locked: true },
  { id: "nails", num: 3, ha: "Yanke Farce", en: "Cutting Nails", stars: 0, locked: true },
  { id: "face", num: 4, ha: "Wanke Fuska", en: "Washing Face", stars: 0, locked: true },
  { id: "feet", num: 5, ha: "Tsabtar Ƙafa", en: "Clean Feet", stars: 0, locked: true },
  { id: "healthy-body", num: 6, ha: "Jiki Mai Lafiya", en: "A Healthy Body", stars: 0, locked: true },
];
const CLOTHES: LessonItem[] = [
  { id: "clean-clothes", num: 1, ha: "Tufafi Masu Tsabta", en: "Clean Clothes", stars: 1, done: true },
  { id: "change", num: 2, ha: "Canza Tufafi", en: "Changing Clothes", stars: 0, locked: true },
  { id: "wash-clothes", num: 3, ha: "Wanke Tufafi", en: "Washing Clothes", stars: 0, locked: true },
  { id: "dry-clothes", num: 4, ha: "Shanya Tufafi", en: "Drying Clothes", stars: 0, locked: true },
  { id: "fold", num: 5, ha: "Naɗe Tufafi", en: "Folding Clothes", stars: 0, locked: true },
  { id: "neat", num: 6, ha: "Kasancewa da Tsafta", en: "Staying Neat", stars: 0, locked: true },
];
const FOOD: LessonItem[] = [
  { id: "good-food", num: 1, ha: "Abinci Mai Kyau", en: "Good Food", stars: 1, done: true },
  { id: "fruits", num: 2, ha: "'Ya'yan Itace", en: "Fruits", stars: 0, locked: true },
  { id: "vegetables", num: 3, ha: "Ganyaye", en: "Vegetables", stars: 0, locked: true },
  { id: "water", num: 4, ha: "Shan Ruwa", en: "Drinking Water", stars: 0, locked: true },
  { id: "wash-food", num: 5, ha: "Wanke Abinci", en: "Washing Food", stars: 0, locked: true },
  { id: "healthy-eating", num: 6, ha: "Cin Abinci Lafiya", en: "Healthy Eating", stars: 0, locked: true },
];

const REAL_LESSONS: Record<string, LessonItem[]> = {
  "literacy/grammar": GRAMMAR,
  "literacy/reading": READING,
  "literacy/writing": WRITING,
  "literacy/vocab": VOCAB,
  "literacy/story": STORY,
  "numeracy/counting": COUNTING,
  "numeracy/addition": ADDITION,
  "numeracy/subtraction": SUBTRACTION,
  "numeracy/shapes": SHAPES,
  "numeracy/games": MATHGAMES,
  "hygiene/handwash": HANDWASH,
  "hygiene/teeth": TEETH,
  "hygiene/body": BODY,
  "hygiene/clothes": CLOTHES,
  "hygiene/food": FOOD,
};

export function getLessons(subjectId: string, moduleId: string): LessonItem[] {
  const real = REAL_LESSONS[`${subjectId}/${moduleId}`];
  if (real) return real;
  const mod = MODULES[subjectId]?.find((m) => m.id === moduleId);
  return [1, 2, 3, 4, 5, 6].map((n) => ({
    id: `${moduleId}-${n}`,
    num: n,
    ha: `${mod?.ha ?? "Darasi"} ${n}`,
    en: `Lesson ${n}`,
    stars: n === 1 ? 1 : 0,
    done: n === 1 && (mod?.progress ?? 0) > 0,
    locked: n > 1,
  }));
}

// Lesson sub-list shown in the DARUSSA rail (photo 7)
export const LESSON_SUBTITLES: Record<string, string> = {
  people: "Sannu, Ina, To",
  objects: "Kujera, Apple, Kofi",
  actions: "Tafi, Zo, Ci",
  sentence1: "Kalmomi biyu",
  sentence2: "Kalmomi uku",
  qa: "Tambaya da amsa",
};

export const SECRET_ICONS = ["⚽", "⭐", "🐾", "🍎", "🐱", "🥁", "🥭", "🐦", "🚗"];

export const AVATARS: { id: string; icon: string; color: string }[] = [
  { id: "a1", icon: "happy", color: colors.purple },
  { id: "a2", icon: "star", color: colors.gold },
  { id: "a3", icon: "rocket", color: colors.green },
  { id: "a4", icon: "leaf", color: colors.blue },
  { id: "a5", icon: "sunny", color: colors.orange },
  { id: "a6", icon: "paw", color: colors.red },
];
