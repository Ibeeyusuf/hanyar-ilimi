/**
 * Per-lesson teaching content, keyed "subject/module/lesson".
 *
 * Every one of the 90 lessons in constants/content.ts has an entry here. The
 * fallback at the bottom is kept as a safety net for content added to
 * content.ts before its teaching card is written — it must never be the normal
 * path, because a question built from sibling lesson TITLES tests whether a
 * child can read a menu, not whether they learned anything.
 * `node tools/check_content.mjs` fails if any lesson is relying on it.
 *
 * House rules for writing an entry:
 *   word    — one thing the lesson teaches, short enough to be spoken cleanly
 *   visual  — an emoji; if it appears in artForVisual() real artwork is used
 *   prompt  — a Hausa sentence with a blank, answerable from the picture
 *   hint    — one plain Hausa sentence a facilitator could also say aloud
 *   options — exactly 3, one correct; wrong answers must be real words a child
 *             might plausibly choose, never nonsense and never another
 *             lesson's title
 *
 * Sentences avoid the "Wannan ___ ne/ce" frame unless the noun's gender is
 * certain; a verb or preposition frame is safer and reads more naturally.
 */

export type Option = { label: string; correct?: boolean };
export type LessonContent = {
  word: string;            // the word/concept being taught (spoken)
  visual: "kids" | string; // "kids" scene, or an emoji string
  prompt: string;          // Hausa sentence with a blank
  hint: string;            // Hausa helper line
  options: Option[];       // exactly 3, one correct
};

export const LESSON_CONTENT: Record<string, LessonContent> = {
  // ===================== LITERACY / GRAMMAR =====================
  "literacy/grammar/people": {
    word: "Yara", visual: "kids",
    prompt: "Waɗannan su ne __________.",
    hint: "Aminu da Zara yara ne. Suna cewa “Sannu!”",
    options: [{ label: "Yara", correct: true }, { label: "Littattafai" }, { label: "Dabbobi" }],
  },
  "literacy/grammar/objects": {
    word: "Kujera", visual: "🪑",
    prompt: "Muna zama a kan __________.",
    hint: "Kujera abu ne da muke zama a kansa.",
    options: [{ label: "Kujera", correct: true }, { label: "Ruwa" }, { label: "Yaro" }],
  },
  "literacy/grammar/actions": {
    word: "Gudu", visual: "🏃",
    prompt: "Yaron yana __________.",
    hint: "Idan muka yi sauri da ƙafa, muna gudu.",
    options: [{ label: "Gudu", correct: true }, { label: "Barci" }, { label: "Zama" }],
  },
  "literacy/grammar/sentence1": {
    word: "Kare yana gudu", visual: "🐕",
    prompt: "Kare yana __________.",
    hint: "Jimla mai kalmomi biyu: wanda ya yi, da abin da yake yi.",
    options: [{ label: "Gudu", correct: true }, { label: "Kujera" }, { label: "Uwa" }],
  },
  "literacy/grammar/sentence2": {
    word: "Uwa tana dafa abinci", visual: "👩",
    prompt: "Uwa tana dafa __________.",
    hint: "Yanzu jimla tana da kalmomi uku: uwa, tana dafa, abinci.",
    options: [{ label: "Abinci", correct: true }, { label: "Gudu" }, { label: "Jiya" }],
  },
  "literacy/grammar/qa": {
    word: "Ina?", visual: "❓",
    prompt: "Tambaya: “Ina uwa?” Amsa: “Uwa tana __________.”",
    hint: "Tambaya tana farawa da “Ina”. Amsa tana faɗin wurin.",
    options: [{ label: "Gida", correct: true }, { label: "Ja" }, { label: "Uku" }],
  },

  // ===================== LITERACY / READING =====================
  "literacy/reading/letters": {
    word: "A", visual: "🅰️",
    prompt: "Harafi na farko shi ne __________.",
    hint: "Haruffa suna farawa da A, B, C.",
    options: [{ label: "A", correct: true }, { label: "K" }, { label: "M" }],
  },
  "literacy/reading/sounds": {
    word: "Ba", visual: "🔤",
    prompt: "Harafin B yana yin sautin __________.",
    hint: "Kowane harafi yana da sautinsa. B tana cewa “ba”.",
    options: [{ label: "Ba", correct: true }, { label: "Sa" }, { label: "Ta" }],
  },
  "literacy/reading/syllables": {
    word: "Ka", visual: "🔡",
    prompt: "Baƙi K da wasali A suna ba mu __________.",
    hint: "Baƙi da wasali sun haɗu su zama gaɓa ɗaya.",
    options: [{ label: "Ka", correct: true }, { label: "Ak" }, { label: "Kk" }],
  },
  "literacy/reading/words": {
    word: "Kifi", visual: "🐟",
    prompt: "Karanta: KI-FI. Wannan __________ ne.",
    hint: "Kifi yana rayuwa cikin ruwa.",
    options: [{ label: "Kifi", correct: true }, { label: "Kaza" }, { label: "Kare" }],
  },
  "literacy/reading/sentences": {
    word: "Kare yana haushi", visual: "🐕",
    prompt: "Karanta jimlar: Kare yana __________.",
    hint: "Karanta kalma bayan kalma, a hankali.",
    options: [{ label: "Haushi", correct: true }, { label: "Karatu" }, { label: "Dafawa" }],
  },
  "literacy/reading/story": {
    word: "Labari", visual: "📖",
    prompt: "Zara ta tafi kasuwa da uwarta. Wa ya tafi kasuwa? __________.",
    hint: "Karanta labarin sannan ka amsa daga cikinsa.",
    options: [{ label: "Zara", correct: true }, { label: "Aminu" }, { label: "Malami" }],
  },

  // ===================== LITERACY / WRITING =====================
  "literacy/writing/hold-pen": {
    word: "Alƙalami", visual: "✏️",
    prompt: "Muna riƙe __________ da yatsu uku.",
    hint: "Babban yatsa da na gaba su riƙe shi, na uku ya taimaka.",
    options: [{ label: "Alƙalami", correct: true }, { label: "Cokali" }, { label: "Sabulu" }],
  },
  "literacy/writing/lines": {
    word: "Layi", visual: "📏",
    prompt: "Kafin haruffa, muna koyon zana __________.",
    hint: "Layi mikakke da layi mai kwana su ne farkon rubutu.",
    options: [{ label: "Layi", correct: true }, { label: "Waƙa" }, { label: "Lamba" }],
  },
  "literacy/writing/trace-letters": {
    word: "Harafi", visual: "🅰️",
    prompt: "Ka bi ɗigo-ɗigo don rubuta __________.",
    hint: "Fara daga sama zuwa ƙasa, kada ka gaggauta.",
    options: [{ label: "Harafi", correct: true }, { label: "Hoto" }, { label: "Ƙwallo" }],
  },
  "literacy/writing/write-name": {
    word: "Suna", visual: "📝",
    prompt: "Muna fara rubuta suna da __________ harafi.",
    hint: "Sunan mutum yana farawa da babban harafi.",
    options: [{ label: "Babban", correct: true }, { label: "Ƙaramin" }, { label: "Ja" }],
  },
  "literacy/writing/write-words": {
    word: "Kalma", visual: "🔤",
    prompt: "Haruffa sun haɗu su zama __________.",
    hint: "K-A-R-E ya zama kalmar “Kare”.",
    options: [{ label: "Kalma", correct: true }, { label: "Lamba" }, { label: "Launi" }],
  },
  "literacy/writing/write-sentence": {
    word: "Jimla", visual: "📄",
    prompt: "Jimla tana ƙarewa da __________.",
    hint: "Alamar tsayawa (.) tana nuna jimla ta ƙare.",
    options: [{ label: "Aya (.)", correct: true }, { label: "Lamba" }, { label: "Hoto" }],
  },

  // ===================== LITERACY / VOCABULARY =====================
  "literacy/vocab/family": {
    word: "Uwa", visual: "👩",
    prompt: "Wacce take kula da mu a gida? __________.",
    hint: "Uwa da uba su ne iyaye.",
    options: [{ label: "Uwa", correct: true }, { label: "Malami" }, { label: "Baƙo" }],
  },
  "literacy/vocab/body": {
    word: "Hannu", visual: "✋",
    prompt: "Muna riƙe abu da __________.",
    hint: "Hannu yana da yatsu biyar.",
    options: [{ label: "Hannu", correct: true }, { label: "Kunne" }, { label: "Hanci" }],
  },
  "literacy/vocab/animals": {
    word: "Kare", visual: "🐕",
    prompt: "Wanne dabba ce take yin haushi? __________.",
    hint: "Kare yana tsare gida.",
    options: [{ label: "Kare", correct: true }, { label: "Kifi" }, { label: "Tsuntsu" }],
  },
  "literacy/vocab/food": {
    word: "Shinkafa", visual: "🍚",
    prompt: "Muna ci __________ da miya.",
    hint: "Shinkafa abinci ne da ake dafawa.",
    options: [{ label: "Shinkafa", correct: true }, { label: "Sabulu" }, { label: "Tufafi" }],
  },
  "literacy/vocab/colors": {
    word: "Ja", visual: "🔴",
    prompt: "Launin jini da tumatir shi ne __________.",
    hint: "Ja, kore, rawaya — waɗannan launuka ne.",
    options: [{ label: "Ja", correct: true }, { label: "Kore" }, { label: "Baƙi" }],
  },
  "literacy/vocab/home": {
    word: "Ƙofa", visual: "🚪",
    prompt: "Muna shiga gida ta __________.",
    hint: "Ƙofa tana buɗewa da rufewa.",
    options: [{ label: "Ƙofa", correct: true }, { label: "Gado" }, { label: "Tebur" }],
  },

  // ===================== LITERACY / STORY TIME =====================
  "literacy/story/goat": {
    word: "Akuya", visual: "🐐",
    prompt: "Kura ta bi akuya, sai akuya ta shiga __________.",
    hint: "Akuya ta yi hankali, ta tsere zuwa gida.",
    options: [{ label: "Gida", correct: true }, { label: "Ruwa" }, { label: "Kasuwa" }],
  },
  "literacy/story/spider": {
    word: "Gizo-gizo", visual: "🕷️",
    prompt: "Gizo-gizo yana saƙa __________ don kama abinci.",
    hint: "A labaran Hausa, Gizo yana da wayo sosai.",
    options: [{ label: "Yanar gizo", correct: true }, { label: "Kujera" }, { label: "Tufafi" }],
  },
  "literacy/story/farmer": {
    word: "Manomi", visual: "🌾",
    prompt: "Manomi mai hikima ya shuka iri, sai ya samu __________.",
    hint: "Wanda ya yi haƙuri da aiki yana samun sakamako.",
    options: [{ label: "Amfani", correct: true }, { label: "Barci" }, { label: "Fushi" }],
  },
  "literacy/story/birds": {
    word: "Tsuntsaye", visual: "🐦",
    prompt: "Tsuntsaye biyu sun taimaki juna, don haka sun __________.",
    hint: "Haɗin kai yana sauƙaƙa kowane aiki.",
    options: [{ label: "Yi nasara", correct: true }, { label: "Yi kuka" }, { label: "Ɓace" }],
  },
  "literacy/story/moon": {
    word: "Wata", visual: "🌙",
    prompt: "Yarinyar ta kalli sama da dare, sai ta ga __________.",
    hint: "Da dare muna ganin wata da taurari.",
    options: [{ label: "Wata", correct: true }, { label: "Rana" }, { label: "Ruwa" }],
  },
  "literacy/story/lion": {
    word: "Zaki", visual: "🦁",
    prompt: "Ɓera ƙarami ne, amma ya ceci __________.",
    hint: "Ko ƙarami yana iya taimakon babba.",
    options: [{ label: "Zaki", correct: true }, { label: "Kura" }, { label: "Akuya" }],
  },

  // ===================== NUMERACY / COUNTING =====================
  "numeracy/counting/one-five": {
    word: "Uku", visual: "3️⃣",
    prompt: "Ɗaya, biyu, __________, huɗu, biyar.",
    hint: "Ƙidaya a hankali daga ɗaya zuwa biyar.",
    options: [{ label: "Uku", correct: true }, { label: "Biyar" }, { label: "Goma" }],
  },
  "numeracy/counting/six-ten": {
    word: "Takwas", visual: "8️⃣",
    prompt: "Shida, bakwai, __________, tara, goma.",
    hint: "Bayan bakwai sai takwas.",
    options: [{ label: "Takwas", correct: true }, { label: "Shida" }, { label: "Huɗu" }],
  },
  "numeracy/counting/count-things": {
    word: "Huɗu", visual: "🍎",
    prompt: "Ga apple huɗu. Nawa ne duka? __________.",
    hint: "Taɓa kowane abu sau ɗaya yayin ƙidaya.",
    options: [{ label: "Huɗu", correct: true }, { label: "Biyu" }, { label: "Bakwai" }],
  },
  "numeracy/counting/more-less": {
    word: "Fiye", visual: "⚖️",
    prompt: "Biyar ya fi __________ yawa.",
    hint: "Lamba mafi girma tana da abubuwa da yawa.",
    options: [{ label: "Biyu", correct: true }, { label: "Tara" }, { label: "Goma" }],
  },
  "numeracy/counting/order": {
    word: "Tsari", visual: "🔢",
    prompt: "Wanne ya zo kafin shida? __________.",
    hint: "Ƙidaya: huɗu, biyar, shida.",
    options: [{ label: "Biyar", correct: true }, { label: "Bakwai" }, { label: "Takwas" }],
  },
  "numeracy/counting/twenty": {
    word: "Ashirin", visual: "🔟",
    prompt: "Goma da goma su ne __________.",
    hint: "Bayan goma sha tara sai ashirin.",
    options: [{ label: "Ashirin", correct: true }, { label: "Goma" }, { label: "Talatin" }],
  },

  // ===================== NUMERACY / ADDITION =====================
  "numeracy/addition/add-1": {
    word: "Uku", visual: "➕",
    prompt: "2 + 1 = __________.",
    hint: "Ƙara ɗaya yana nufin ka ci gaba da lamba ɗaya.",
    options: [{ label: "3", correct: true }, { label: "2" }, { label: "4" }],
  },
  "numeracy/addition/add-small": {
    word: "Biyar", visual: "➕",
    prompt: "3 + 2 = __________.",
    hint: "Ƙidaya biyu bayan uku: huɗu, biyar.",
    options: [{ label: "5", correct: true }, { label: "4" }, { label: "6" }],
  },
  "numeracy/addition/add-objects": {
    word: "Bakwai", visual: "🍎",
    prompt: "Apple huɗu da apple uku su ne __________.",
    hint: "Haɗa su duka sannan ka ƙidaya.",
    options: [{ label: "7", correct: true }, { label: "6" }, { label: "8" }],
  },
  "numeracy/addition/add-ten": {
    word: "Goma", visual: "🔟",
    prompt: "6 + 4 = __________.",
    hint: "Yatsun hannu biyu su ne goma.",
    options: [{ label: "10", correct: true }, { label: "9" }, { label: "11" }],
  },
  "numeracy/addition/add-story": {
    word: "Biyar", visual: "🥭",
    prompt: "Musa yana da mangwaro uku, uwa ta ba shi biyu. Yanzu yana da __________.",
    hint: "Ka saurari tambayar, sannan ka ƙara lambobin.",
    options: [{ label: "5", correct: true }, { label: "3" }, { label: "6" }],
  },
  "numeracy/addition/add-fast": {
    word: "Goma", visual: "⚡",
    prompt: "5 + 5 = __________.",
    hint: "Lambobi biyu iri ɗaya suna da sauƙin haɗawa.",
    options: [{ label: "10", correct: true }, { label: "5" }, { label: "15" }],
  },

  // ===================== NUMERACY / SUBTRACTION =====================
  "numeracy/subtraction/sub-1": {
    word: "Huɗu", visual: "➖",
    prompt: "5 − 1 = __________.",
    hint: "Cire ɗaya yana nufin ka koma baya lamba ɗaya.",
    options: [{ label: "4", correct: true }, { label: "5" }, { label: "6" }],
  },
  "numeracy/subtraction/take-away": {
    word: "Huɗu", visual: "🍎",
    prompt: "Apple shida, an ci biyu. Sun rage __________.",
    hint: "Cire abin da ya tafi daga adadin farko.",
    options: [{ label: "4", correct: true }, { label: "3" }, { label: "8" }],
  },
  "numeracy/subtraction/sub-ten": {
    word: "Bakwai", visual: "🔟",
    prompt: "10 − 3 = __________.",
    hint: "Fara daga goma, ka koma baya sau uku.",
    options: [{ label: "7", correct: true }, { label: "6" }, { label: "13" }],
  },
  "numeracy/subtraction/sub-story": {
    word: "Uku", visual: "🐐",
    prompt: "Akuya biyar, uku sun fita. Sun rage __________.",
    hint: "Wanda ya fita ana cire shi.",
    options: [{ label: "2", correct: true }, { label: "3" }, { label: "5" }],
  },
  "numeracy/subtraction/diff": {
    word: "Bambanci", visual: "⚖️",
    prompt: "Bambanci tsakanin 8 da 5 shi ne __________.",
    hint: "Bambanci shi ne nawa babba ya fi ƙarami.",
    options: [{ label: "3", correct: true }, { label: "13" }, { label: "5" }],
  },
  "numeracy/subtraction/sub-fast": {
    word: "Biyar", visual: "⚡",
    prompt: "9 − 4 = __________.",
    hint: "Yi tunani da sauri, amma ka tabbatar.",
    options: [{ label: "5", correct: true }, { label: "4" }, { label: "6" }],
  },

  // ===================== NUMERACY / SHAPES =====================
  "numeracy/shapes/circle": {
    word: "Da'ira", visual: "⭕",
    prompt: "Siffa mai zagaye ba tare da kusurwa ba ita ce __________.",
    hint: "Rana da ƙwallo suna da siffar da'ira.",
    options: [{ label: "Da'ira", correct: true }, { label: "Murabba'i" }, { label: "Alwatika" }],
  },
  "numeracy/shapes/square": {
    word: "Murabba'i", visual: "🟦",
    prompt: "Siffa mai gefe huɗu daidai wa daida ita ce __________.",
    hint: "Murabba'i yana da gefe huɗu masu tsayi ɗaya.",
    options: [{ label: "Murabba'i", correct: true }, { label: "Da'ira" }, { label: "Alwatika" }],
  },
  "numeracy/shapes/triangle": {
    word: "Alwatika", visual: "🔺",
    prompt: "Siffa mai kusurwa uku ita ce __________.",
    hint: "Ƙidaya kusurwoyi: ɗaya, biyu, uku.",
    options: [{ label: "Alwatika", correct: true }, { label: "Da'ira" }, { label: "Murabba'i" }],
  },
  "numeracy/shapes/rectangle": {
    word: "Dogon murabba'i", visual: "▭",
    prompt: "Ƙofa tana da siffar __________.",
    hint: "Gefe biyu dogaye, gefe biyu gajeru.",
    options: [{ label: "Dogon murabba'i", correct: true }, { label: "Da'ira" }, { label: "Alwatika" }],
  },
  "numeracy/shapes/match-shapes": {
    word: "Daidaita", visual: "⚽",
    prompt: "Ƙwallo yana daidai da __________.",
    hint: "Nemo siffar da ta yi kama da abin.",
    options: [{ label: "Da'ira", correct: true }, { label: "Alwatika" }, { label: "Murabba'i" }],
  },
  "numeracy/shapes/shapes-around": {
    word: "Agogo", visual: "🕐",
    prompt: "Agogo yana da siffar __________.",
    hint: "Duba kewaye da kai — siffofi suna ko'ina.",
    options: [{ label: "Da'ira", correct: true }, { label: "Alwatika" }, { label: "Layi" }],
  },

  // ===================== NUMERACY / MATH GAMES =====================
  "numeracy/games/count-race": {
    word: "Tsere", visual: "🏁",
    prompt: "A tseren ƙidaya, muna ƙidaya daga ɗaya zuwa __________.",
    hint: "Yi sauri, amma kada ka tsallake lamba.",
    options: [{ label: "Goma", correct: true }, { label: "Uku" }, { label: "Ɗari" }],
  },
  "numeracy/games/number-match": {
    word: "Daidaita", visual: "🔢",
    prompt: "Lamba 4 tana daidai da abubuwa __________.",
    hint: "Ƙidaya abubuwan sannan ka nemi lambar.",
    options: [{ label: "Huɗu", correct: true }, { label: "Biyu" }, { label: "Bakwai" }],
  },
  "numeracy/games/add-game": {
    word: "Wasan ƙari", visual: "➕",
    prompt: "A wasan ƙari: 2 + 3 = __________.",
    hint: "Ƙidaya uku bayan biyu.",
    options: [{ label: "5", correct: true }, { label: "4" }, { label: "6" }],
  },
  "numeracy/games/shape-hunt": {
    word: "Neman siffa", visual: "🔍",
    prompt: "A cikin aji, taga tana da siffar __________.",
    hint: "Nemo siffofin da ke kewaye da kai.",
    options: [{ label: "Murabba'i", correct: true }, { label: "Da'ira" }, { label: "Alwatika" }],
  },
  "numeracy/games/memory": {
    word: "Tunawa", visual: "🧠",
    prompt: "Ka ga 2, 4, 6. Na gaba shi ne __________.",
    hint: "Kowace lamba tana ƙaruwa da biyu.",
    options: [{ label: "8", correct: true }, { label: "7" }, { label: "10" }],
  },
  "numeracy/games/puzzle": {
    word: "Wasan lamba", visual: "🧩",
    prompt: "1, 2, 3, __________, 5.",
    hint: "Wace lamba ta ɓace a tsakiya?",
    options: [{ label: "4", correct: true }, { label: "6" }, { label: "2" }],
  },

  // ===================== HYGIENE / HANDWASHING =====================
  "hygiene/handwash/why": {
    word: "Sabulu", visual: "🧼",
    prompt: "Muna wanke hannu da ruwa da __________.",
    hint: "Sabulu yana kashe ƙwayoyin cuta.",
    options: [{ label: "Sabulu", correct: true }, { label: "Yashi" }, { label: "Toka" }],
  },
  "hygiene/handwash/when": {
    word: "Kafin ci", visual: "🍽️",
    prompt: "Muna wanke hannu kafin __________.",
    hint: "Kullum ka wanke hannu kafin ka ci abinci.",
    options: [{ label: "Cin abinci", correct: true }, { label: "Barci" }, { label: "Wasa" }],
  },
  "hygiene/handwash/soap": {
    word: "Kumfa", visual: "🧼",
    prompt: "Ka shafa sabulu har sai ya yi __________.",
    hint: "Kumfa tana nuna sabulu ya isa hannu duka.",
    options: [{ label: "Kumfa", correct: true }, { label: "Kauri" }, { label: "Sanyi" }],
  },
  "hygiene/handwash/steps": {
    word: "Matakai", visual: "✋",
    prompt: "Bayan sabulu, ka goge hannu sannan ka __________.",
    hint: "Jiƙa, sabulu, goge, kurkura, bushe.",
    options: [{ label: "Kurkura da ruwa", correct: true }, { label: "Ci abinci" }, { label: "Yi wasa" }],
  },
  "hygiene/handwash/dry": {
    word: "Tawul", visual: "🧻",
    prompt: "Bayan wankewa, muna bushe hannu da __________.",
    hint: "Hannu jiƙaƙƙe yana ɗaukar ƙwayoyin cuta cikin sauƙi.",
    options: [{ label: "Tawul mai tsafta", correct: true }, { label: "Tufafi masu ƙazanta" }, { label: "Yashi" }],
  },
  "hygiene/handwash/germs": {
    word: "Ƙwayoyin cuta", visual: "🦠",
    prompt: "Ƙwayoyin cuta ba a gani da __________.",
    hint: "Ƙanana ne sosai, amma suna kawo ciwo.",
    options: [{ label: "Ido", correct: true }, { label: "Hannu" }, { label: "Kunne" }],
  },

  // ===================== HYGIENE / BRUSHING TEETH =====================
  "hygiene/teeth/why-brush": {
    word: "Buroshi", visual: "🪥",
    prompt: "Muna goge hakori da __________.",
    hint: "Buroshi yana cire saura abinci daga hakori.",
    options: [{ label: "Buroshi", correct: true }, { label: "Cokali" }, { label: "Yatsa" }],
  },
  "hygiene/teeth/brush-tools": {
    word: "Man goge baki", visual: "🪥",
    prompt: "Muna sa __________ a kan buroshi.",
    hint: "Kaɗan ya isa — kamar girman wake.",
    options: [{ label: "Man goge baki", correct: true }, { label: "Sabulu" }, { label: "Mai" }],
  },
  "hygiene/teeth/brush-how": {
    word: "Sama da ƙasa", visual: "🪥",
    prompt: "Muna goge hakori daga __________.",
    hint: "Goge a hankali, gaba da baya da sama-ƙasa.",
    options: [{ label: "Sama zuwa ƙasa", correct: true }, { label: "Hagu kaɗai" }, { label: "Sau ɗaya kawai" }],
  },
  "hygiene/teeth/brush-when": {
    word: "Safe da dare", visual: "🌙",
    prompt: "Muna goge hakori da safe da kuma da __________.",
    hint: "Sau biyu a rana: bayan farkawa, kafin barci.",
    options: [{ label: "Dare", correct: true }, { label: "Rana kawai" }, { label: "Sati" }],
  },
  "hygiene/teeth/sugar": {
    word: "Alewa", visual: "🍬",
    prompt: "Cin __________ da yawa yana ɓata hakori.",
    hint: "Sukari yana ba ƙwayoyin cuta abinci a bakinmu.",
    options: [{ label: "Alewa", correct: true }, { label: "Ganyaye" }, { label: "Ruwa" }],
  },
  "hygiene/teeth/smile": {
    word: "Murmushi", visual: "😁",
    prompt: "Hakori mai tsafta yana ba mu __________ mai kyau.",
    hint: "Kula da hakori yana sa mu kwarin gwiwa.",
    options: [{ label: "Murmushi", correct: true }, { label: "Ciwo" }, { label: "Barci" }],
  },

  // ===================== HYGIENE / BODY CARE =====================
  "hygiene/body/bath": {
    word: "Wanka", visual: "🚿",
    prompt: "Muna yin wanka da ruwa da __________.",
    hint: "Yi wanka aƙalla sau ɗaya kowace rana.",
    options: [{ label: "Sabulu", correct: true }, { label: "Yashi" }, { label: "Mai" }],
  },
  "hygiene/body/hair": {
    word: "Gashi", visual: "💇",
    prompt: "Muna wanke da tsefe __________.",
    hint: "Gashi mai tsafta ba ya ɗaukar ƙwarƙwata.",
    options: [{ label: "Gashi", correct: true }, { label: "Farce" }, { label: "Hakori" }],
  },
  "hygiene/body/nails": {
    word: "Farce", visual: "✋",
    prompt: "Muna yanke __________ don ƙazanta kada ta taru.",
    hint: "Ƙazanta tana ɓoyewa a ƙarƙashin farce.",
    options: [{ label: "Farce", correct: true }, { label: "Gashi" }, { label: "Tufafi" }],
  },
  "hygiene/body/face": {
    word: "Fuska", visual: "🧼",
    prompt: "Da safe muna wanke __________ da ruwa.",
    hint: "Wanke fuska yana kare ido daga cuta.",
    options: [{ label: "Fuska", correct: true }, { label: "Ƙafa" }, { label: "Gado" }],
  },
  "hygiene/body/feet": {
    word: "Ƙafa", visual: "🦶",
    prompt: "Bayan wasa a ƙasa, muna wanke __________.",
    hint: "Sa takalmi kuma yana kare ƙafa.",
    options: [{ label: "Ƙafa", correct: true }, { label: "Kunne" }, { label: "Hanci" }],
  },
  "hygiene/body/healthy-body": {
    word: "Lafiya", visual: "💪",
    prompt: "Tsafta da abinci mai kyau suna ba mu __________.",
    hint: "Jiki mai tsafta jiki ne mai lafiya.",
    options: [{ label: "Lafiya", correct: true }, { label: "Ciwo" }, { label: "Gajiya" }],
  },

  // ===================== HYGIENE / CLEAN CLOTHES =====================
  "hygiene/clothes/clean-clothes": {
    word: "Tufafi", visual: "👕",
    prompt: "Tufafi masu tsafta suna kare mu daga __________.",
    hint: "Ƙazanta a tufafi tana ɗauke da ƙwayoyin cuta.",
    options: [{ label: "Cuta", correct: true }, { label: "Ruwa" }, { label: "Abinci" }],
  },
  "hygiene/clothes/change": {
    word: "Canzawa", visual: "👚",
    prompt: "Muna canza tufafi idan sun yi __________.",
    hint: "Kada ka sa tufafi masu ƙazanta kwana biyu.",
    options: [{ label: "Ƙazanta", correct: true }, { label: "Tsafta" }, { label: "Sabo" }],
  },
  "hygiene/clothes/wash-clothes": {
    word: "Wanke", visual: "🧺",
    prompt: "Muna wanke tufafi da ruwa da __________.",
    hint: "Sabulu yana cire ƙazanta daga zare.",
    options: [{ label: "Sabulu", correct: true }, { label: "Yashi" }, { label: "Mai" }],
  },
  "hygiene/clothes/dry-clothes": {
    word: "Shanyawa", visual: "☀️",
    prompt: "Muna shanya tufafi a cikin __________.",
    hint: "Rana tana bushe tufafi tana kuma kashe ƙwayoyin cuta.",
    options: [{ label: "Rana", correct: true }, { label: "Ruwa" }, { label: "Duhu" }],
  },
  "hygiene/clothes/fold": {
    word: "Naɗewa", visual: "👔",
    prompt: "Bayan sun bushe, muna naɗe tufafi mu ajiye a __________.",
    hint: "Tufafi da aka naɗe ba sa ɗaukar ƙura.",
    options: [{ label: "Wuri mai tsafta", correct: true }, { label: "Ƙasa" }, { label: "Waje" }],
  },
  "hygiene/clothes/neat": {
    word: "Tsafta", visual: "✨",
    prompt: "Kasancewa da tsafta yana nuna muna kula da __________.",
    hint: "Tsafta al'ada ce ta yau da kullum.",
    options: [{ label: "Kanmu", correct: true }, { label: "Wasa" }, { label: "Kuɗi" }],
  },

  // ===================== HYGIENE / GOOD FOOD =====================
  "hygiene/food/good-food": {
    word: "Abinci mai kyau", visual: "🍽️",
    prompt: "Abinci mai kyau yana ba mu __________.",
    hint: "Yana taimaka mana mu girma mu yi ƙarfi.",
    options: [{ label: "Ƙarfi", correct: true }, { label: "Ciwo" }, { label: "Barci" }],
  },
  "hygiene/food/fruits": {
    word: "'Ya'yan itace", visual: "🍎",
    prompt: "Mangwaro da ayaba su ne __________.",
    hint: "'Ya'yan itace suna ba mu lafiya.",
    options: [{ label: "'Ya'yan itace", correct: true }, { label: "Alewa" }, { label: "Nama" }],
  },
  "hygiene/food/vegetables": {
    word: "Ganyaye", visual: "🥬",
    prompt: "Muna sa __________ a cikin miya.",
    hint: "Ganyaye suna da ƙarfin gina jiki.",
    options: [{ label: "Ganyaye", correct: true }, { label: "Sukari" }, { label: "Yashi" }],
  },
  "hygiene/food/water": {
    word: "Ruwa", visual: "💧",
    prompt: "Muna shan ruwa mai __________.",
    hint: "Ruwa mai ƙazanta yana kawo ciwon ciki.",
    options: [{ label: "Tsafta", correct: true }, { label: "Launi" }, { label: "Zafi" }],
  },
  "hygiene/food/wash-food": {
    word: "Wanke abinci", visual: "🥭",
    prompt: "Kafin cin 'ya'yan itace, muna __________.",
    hint: "Wanke da ruwa mai tsafta yana cire ƙura da cuta.",
    options: [{ label: "Wanke su", correct: true }, { label: "Ɓoye su" }, { label: "Dafa su" }],
  },
  "hygiene/food/healthy-eating": {
    word: "Cin lafiya", visual: "🍲",
    prompt: "Muna ci abinci iri-iri kowace __________.",
    hint: "Abinci iri ɗaya kaɗai bai isa jiki ba.",
    options: [{ label: "Rana", correct: true }, { label: "Shekara" }, { label: "Wata" }],
  },
};

/**
 * Safety net only. Every lesson in content.ts has a real entry above; this
 * exists so that adding a lesson id before writing its card degrades to
 * something usable instead of a blank screen. It is deliberately obvious in
 * review — if a child ever sees this, a lesson is missing content.
 */
export function contentFor(
  subject: string,
  module: string,
  lessonId: string,
  lessonHa: string,
  siblings?: { id: string; ha: string }[]
): LessonContent {
  const key = `${subject}/${module}/${lessonId}`;
  if (LESSON_CONTENT[key]) return LESSON_CONTENT[key];

  const visualBySubject: Record<string, string> = { literacy: "📖", numeracy: "🔢", hygiene: "💧" };
  const others = (siblings ?? [])
    .filter((s) => s.id !== lessonId && s.ha && s.ha !== lessonHa)
    .map((s) => s.ha);
  const seed = lessonId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = (n: number) => (others.length ? others[(seed + n) % others.length] : "—");

  return {
    word: lessonHa,
    visual: visualBySubject[subject] ?? "⭐",
    prompt: `Wanne ne "${lessonHa}"?`,
    hint: `Saurari sannan ka zaɓi "${lessonHa}".`,
    options: [
      { label: lessonHa, correct: true },
      { label: pick(0) },
      { label: others.length > 1 ? pick(1) : "—" },
    ],
  };
}
