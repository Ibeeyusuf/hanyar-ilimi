import { colors } from "@/constants/theme";

export type Subject = { id: string; en: string; ha: string; color: string; icon: string };

export const SUBJECTS: Subject[] = [
  { id: "literacy", en: "LITERACY", ha: "Koyo karatu da rubutu", color: colors.literacy, icon: "book" },
  { id: "numeracy", en: "NUMERACY", ha: "Koyi lissafi", color: colors.numeracy, icon: "calculator" },
  { id: "hygiene", en: "HYGIENE", ha: "Koyi tsabta", color: colors.hygiene, icon: "water" },
];

export type ModuleItem = { id: string; num: number; en: string; ha: string; critter: string; icon?: string };

export const MODULES: Record<string, ModuleItem[]> = {
  literacy: [
    { id: "grammar", num: 1, en: "GRAMMAR", ha: "Koyi nahawu", critter: "caterpillar", icon: "book" },
    { id: "reading", num: 2, en: "READING", ha: "Koyi karatu", critter: "ladybug", icon: "glasses" },
    { id: "writing", num: 3, en: "WRITING", ha: "Koyi rubutu", critter: "ant", icon: "pencil" },
    { id: "vocab", num: 4, en: "VOCABULARY", ha: "Koyi sababbin kalmomi", critter: "grasshopper", icon: "chatbubbles" },
    { id: "story", num: 5, en: "STORY TIME", ha: "Karin karatu", critter: "beetle", icon: "bookmarks" },
  ],
  numeracy: [
    { id: "counting", num: 1, en: "COUNTING", ha: "Koyi ƙidaya", critter: "bee", icon: "apps" },
    { id: "addition", num: 2, en: "ADDITION", ha: "Koyi ƙari", critter: "butterfly", icon: "add-circle" },
    { id: "subtraction", num: 3, en: "SUBTRACTION", ha: "Koyi ragi", critter: "snail", icon: "remove-circle" },
    { id: "shapes", num: 4, en: "SHAPES", ha: "San siffofi", critter: "frog", icon: "shapes" },
    { id: "games", num: 5, en: "MATH GAMES", ha: "Wasannin lissafi", critter: "fish", icon: "game-controller" },
  ],
  hygiene: [
    { id: "handwash", num: 1, en: "HANDWASHING", ha: "Wankan hannu", critter: "bird", icon: "water" },
    { id: "teeth", num: 2, en: "BRUSHING TEETH", ha: "Goge hakori", critter: "turtle", icon: "happy" },
    { id: "body", num: 3, en: "BODY CARE", ha: "Tsabtar jiki", critter: "worm", icon: "body" },
    { id: "clothes", num: 4, en: "CLEAN CLOTHES", ha: "Tsabtar sutura", critter: "spider", icon: "shirt" },
    { id: "food", num: 5, en: "GOOD FOOD", ha: "Abinci mai kyau", critter: "dragonfly", icon: "nutrition" },
  ],
};

export type LessonItem = { id: string; num: number; ha: string; en: string };

const GRAMMAR: LessonItem[] = [
  { id: "people", num: 1, ha: "Kalmomin Mutane", en: "People Words" },
  { id: "objects", num: 2, ha: "Kalmomin Abu", en: "Object Words" },
  { id: "actions", num: 3, ha: "Kalmomin Aiki", en: "Action Words" },
  { id: "sentence1", num: 4, ha: "Gina Jimloli (1)", en: "Build Sentence 1" },
  { id: "sentence2", num: 5, ha: "Gina Jimloli (2)", en: "Build Sentence 2" },
  { id: "qa", num: 6, ha: "Tambayoyi da Amsa", en: "Ask & Answer" },
];

const READING: LessonItem[] = [
  { id: "letters", num: 1, ha: "Haruffa", en: "Letters" },
  { id: "sounds", num: 2, ha: "Sautuka", en: "Letter Sounds" },
  { id: "syllables", num: 3, ha: "Baƙaƙe da Wasali", en: "Syllables" },
  { id: "words", num: 4, ha: "Karanta Kalmomi", en: "Reading Words" },
  { id: "sentences", num: 5, ha: "Karanta Jimloli", en: "Reading Sentences" },
  { id: "story", num: 6, ha: "Karanta Labari", en: "Reading a Story" },
];

const COUNTING: LessonItem[] = [
  { id: "one-five", num: 1, ha: "Ƙidaya 1-5", en: "Count 1-5" },
  { id: "six-ten", num: 2, ha: "Ƙidaya 6-10", en: "Count 6-10" },
  { id: "count-things", num: 3, ha: "Ƙidaya Abubuwa", en: "Count Objects" },
  { id: "more-less", num: 4, ha: "Fiye da Ƙasa", en: "More & Less" },
  { id: "order", num: 5, ha: "Tsari na Lambobi", en: "Number Order" },
  { id: "twenty", num: 6, ha: "Ƙidaya zuwa 20", en: "Count to 20" },
];

const HANDWASH: LessonItem[] = [
  { id: "why", num: 1, ha: "Me ya sa muke wanke hannu", en: "Why Wash Hands" },
  { id: "when", num: 2, ha: "Lokacin Wanke Hannu", en: "When to Wash" },
  { id: "soap", num: 3, ha: "Amfani da Sabulu", en: "Using Soap" },
  { id: "steps", num: 4, ha: "Matakan Wanke Hannu", en: "Washing Steps" },
  { id: "dry", num: 5, ha: "Bushe Hannu", en: "Drying Hands" },
  { id: "germs", num: 6, ha: "Yaƙi da Ƙwayoyin Cuta", en: "Fighting Germs" },
];

// ---- LITERACY ----
const WRITING: LessonItem[] = [
  { id: "hold-pen", num: 1, ha: "Riƙe Alƙalami", en: "Holding a Pen" },
  { id: "lines", num: 2, ha: "Zana Layuka", en: "Drawing Lines" },
  { id: "trace-letters", num: 3, ha: "Bi Haruffa", en: "Tracing Letters" },
  { id: "write-name", num: 4, ha: "Rubuta Sunanka", en: "Writing Your Name" },
  { id: "write-words", num: 5, ha: "Rubuta Kalmomi", en: "Writing Words" },
  { id: "write-sentence", num: 6, ha: "Rubuta Jimla", en: "Writing a Sentence" },
];
const VOCAB: LessonItem[] = [
  { id: "family", num: 1, ha: "Iyali", en: "Family" },
  { id: "body", num: 2, ha: "Sassan Jiki", en: "Body Parts" },
  { id: "animals", num: 3, ha: "Dabbobi", en: "Animals" },
  { id: "food", num: 4, ha: "Abinci", en: "Food" },
  { id: "colors", num: 5, ha: "Launuka", en: "Colours" },
  { id: "home", num: 6, ha: "Cikin Gida", en: "Around the Home" },
];
const STORY: LessonItem[] = [
  { id: "goat", num: 1, ha: "Akuya da Kura", en: "The Goat & the Hyena" },
  { id: "spider", num: 2, ha: "Gizo-gizo", en: "The Spider" },
  { id: "farmer", num: 3, ha: "Manomi mai Hikima", en: "The Wise Farmer" },
  { id: "birds", num: 4, ha: "Tsuntsaye Biyu", en: "Two Birds" },
  { id: "moon", num: 5, ha: "Yarinya da Wata", en: "The Girl & the Moon" },
  { id: "lion", num: 6, ha: "Zaki da Ɓera", en: "The Lion & the Mouse" },
];

// ---- NUMERACY ----
const ADDITION: LessonItem[] = [
  { id: "add-1", num: 1, ha: "Ƙari da 1", en: "Adding 1" },
  { id: "add-small", num: 2, ha: "Ƙari Ƙananan Lambobi", en: "Adding Small Numbers" },
  { id: "add-objects", num: 3, ha: "Ƙari da Abubuwa", en: "Adding Objects" },
  { id: "add-ten", num: 4, ha: "Ƙari zuwa 10", en: "Adding to 10" },
  { id: "add-story", num: 5, ha: "Tambayoyin Ƙari", en: "Word Problems" },
  { id: "add-fast", num: 6, ha: "Ƙari da Sauri", en: "Quick Adding" },
];
const SUBTRACTION: LessonItem[] = [
  { id: "sub-1", num: 1, ha: "Ragi da 1", en: "Subtracting 1" },
  { id: "take-away", num: 2, ha: "Cire Abubuwa", en: "Taking Away" },
  { id: "sub-ten", num: 3, ha: "Ragi daga 10", en: "Subtracting from 10" },
  { id: "sub-story", num: 4, ha: "Tambayoyin Ragi", en: "Word Problems" },
  { id: "diff", num: 5, ha: "Bambanci", en: "Finding the Difference" },
  { id: "sub-fast", num: 6, ha: "Ragi da Sauri", en: "Quick Subtracting" },
];
const SHAPES: LessonItem[] = [
  { id: "circle", num: 1, ha: "Da'ira", en: "Circle" },
  { id: "square", num: 2, ha: "Murabba'i", en: "Square" },
  { id: "triangle", num: 3, ha: "Alwatika", en: "Triangle" },
  { id: "rectangle", num: 4, ha: "Dogon Murabba'i", en: "Rectangle" },
  { id: "match-shapes", num: 5, ha: "Daidaita Siffofi", en: "Matching Shapes" },
  { id: "shapes-around", num: 6, ha: "Siffofi Kewaye da Mu", en: "Shapes Around Us" },
];
const MATHGAMES: LessonItem[] = [
  { id: "count-race", num: 1, ha: "Tseren Ƙidaya", en: "Counting Race" },
  { id: "number-match", num: 2, ha: "Daidaita Lambobi", en: "Number Match" },
  { id: "add-game", num: 3, ha: "Wasan Ƙari", en: "Addition Game" },
  { id: "shape-hunt", num: 4, ha: "Neman Siffofi", en: "Shape Hunt" },
  { id: "memory", num: 5, ha: "Wasan Tunawa", en: "Memory Game" },
  { id: "puzzle", num: 6, ha: "Wasan Wasa", en: "Number Puzzle" },
];

// ---- HYGIENE ----
const TEETH: LessonItem[] = [
  { id: "why-brush", num: 1, ha: "Me ya sa muke goge hakori", en: "Why Brush Teeth" },
  { id: "brush-tools", num: 2, ha: "Buroshi da Man Goge Baki", en: "Brush & Paste" },
  { id: "brush-how", num: 3, ha: "Yadda ake Goge Hakori", en: "How to Brush" },
  { id: "brush-when", num: 4, ha: "Lokacin Goge Hakori", en: "When to Brush" },
  { id: "sugar", num: 5, ha: "Sukari da Hakori", en: "Sugar & Teeth" },
  { id: "smile", num: 6, ha: "Murmushi Mai Ƙoshin Lafiya", en: "A Healthy Smile" },
];
const BODY: LessonItem[] = [
  { id: "bath", num: 1, ha: "Yin Wanka", en: "Taking a Bath" },
  { id: "hair", num: 2, ha: "Tsabtar Gashi", en: "Clean Hair" },
  { id: "nails", num: 3, ha: "Yanke Farce", en: "Cutting Nails" },
  { id: "face", num: 4, ha: "Wanke Fuska", en: "Washing Face" },
  { id: "feet", num: 5, ha: "Tsabtar Ƙafa", en: "Clean Feet" },
  { id: "healthy-body", num: 6, ha: "Jiki Mai Lafiya", en: "A Healthy Body" },
];
const CLOTHES: LessonItem[] = [
  { id: "clean-clothes", num: 1, ha: "Tufafi Masu Tsabta", en: "Clean Clothes" },
  { id: "change", num: 2, ha: "Canza Tufafi", en: "Changing Clothes" },
  { id: "wash-clothes", num: 3, ha: "Wanke Tufafi", en: "Washing Clothes" },
  { id: "dry-clothes", num: 4, ha: "Shanya Tufafi", en: "Drying Clothes" },
  { id: "fold", num: 5, ha: "Naɗe Tufafi", en: "Folding Clothes" },
  { id: "neat", num: 6, ha: "Kasancewa da Tsafta", en: "Staying Neat" },
];
const FOOD: LessonItem[] = [
  { id: "good-food", num: 1, ha: "Abinci Mai Kyau", en: "Good Food" },
  { id: "fruits", num: 2, ha: "'Ya'yan Itace", en: "Fruits" },
  { id: "vegetables", num: 3, ha: "Ganyaye", en: "Vegetables" },
  { id: "water", num: 4, ha: "Shan Ruwa", en: "Drinking Water" },
  { id: "wash-food", num: 5, ha: "Wanke Abinci", en: "Washing Food" },
  { id: "healthy-eating", num: 6, ha: "Cin Abinci Lafiya", en: "Healthy Eating" },
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

