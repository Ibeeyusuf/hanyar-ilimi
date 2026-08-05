/**
 * IMAGE REGISTRY — real designer artwork. Components read from here and fall
 * back to clean placeholders when a slot is null.
 */
export type ImageSource = number | null;

export const characters = {
  mascot: require("@/assets/images/mascots/caterpillar.png"),  // the ONE guide
  bee: require("@/assets/images/mascots/bee.png"),
  ladybug: require("@/assets/images/mascots/ladybug.png"),
  caterpillar: require("@/assets/images/mascots/caterpillar.png"),
  kid1: require("@/assets/images/characters/kid1.png"),
  kid2: require("@/assets/images/characters/kid2.png"),
  boyWave: require("@/assets/images/characters/boy-wave.png"),
};

export const brand = { logo: require("@/assets/images/brand/logo.png") };

// Child profile portraits for the "Who are you?" picker (PRD S2).
// Six distinct faces so each child can recognise their own.
/**
 * Stock portraits, used when a child has no photo of their own.
 *
 * Split by sex because the fallback used to hash a child's ID across the whole
 * set, which handed girls a boy's face and vice versa — on the one screen where
 * a child has to recognise themselves.
 *
 * avatar6.png is deliberately absent: it is a log-out door icon, not a child.
 * It was in this list for two releases and could have been shown to a child as
 * their own face.
 */
export const girlAvatars = [
  require("@/assets/images/avatars/avatar1.png"),
  require("@/assets/images/avatars/avatar2.png"),
  require("@/assets/images/avatars/avatar4.png"),
];

export const boyAvatars = [
  require("@/assets/images/avatars/avatar3.png"),
  require("@/assets/images/avatars/avatar5.png"),
];

// Sidebar / top-bar navigation icons (designer artwork).
export const navIcons: Record<string, ImageSource> = {
  home: require("@/assets/images/nav/home.png"),
  literacy: require("@/assets/images/nav/literacy.png"),
  numeracy: require("@/assets/images/nav/numeracy.png"),
  hygiene: require("@/assets/images/nav/hygiene.png"),
};

export const backgrounds = {
  scene: require("@/assets/images/backgrounds/bg-scene.jpg"),
  login: require("@/assets/images/backgrounds/bg-login.jpg"),
};

// Real lesson objects (for lesson illustrations).
export const objects = {
  apple: require("@/assets/images/objects/apple.png"),
  chair: require("@/assets/images/objects/chair.png"),
  cup: require("@/assets/images/objects/cup.png"),
  pencil: require("@/assets/images/objects/pencil.png"),
  bird: require("@/assets/images/objects/bird.png"),
  bookOpen: require("@/assets/images/objects/book-open.png"),
  bookAb: require("@/assets/images/objects/book-ab.png"),
  dog: require("@/assets/images/objects/dog.png"),
  mother: require("@/assets/images/objects/mother.png"),
  soap: require("@/assets/images/objects/soap.png"),
  running: require("@/assets/images/objects/running.png"),
  toothbrush: require("@/assets/images/objects/toothbrush.png"),
  plate: require("@/assets/images/objects/plate.png"),
  fish: require("@/assets/images/objects/fish.png"),
  ball: require("@/assets/images/objects/ball.png"),
  clock: require("@/assets/images/objects/clock.png"),
  globe: require("@/assets/images/objects/globe.png"),
  tree: require("@/assets/images/objects/tree.png"),
};

// Picture-passcode icons (child login).
export const passcode = {
  ball: require("@/assets/images/passcode/ball.png"),
  star: require("@/assets/images/passcode/star.png"),
  paw: require("@/assets/images/passcode/paw.png"),
  apple: require("@/assets/images/passcode/apple.png"),
  cat: require("@/assets/images/passcode/cat.png"),
  drum: require("@/assets/images/passcode/drum.png"),
  mango: require("@/assets/images/passcode/mango.png"),
  bird: require("@/assets/images/passcode/bird.png"),
  car: require("@/assets/images/passcode/car.png"),
};
/**
 * Maps a lesson's `visual` key to real artwork. Both the lesson player and the
 * quiz used to keep their own private copy of this table, which meant a new
 * illustration had to be registered twice or the two screens disagreed.
 */
export function artForVisual(visual: string): ImageSource {
  const map: Record<string, ImageSource> = {
    "kids": characters.kid1,
    "\u{1F34E}": objects.apple,
    "\u{1FA91}": objects.chair,
    "\u2615": objects.cup,
    "\u270F\uFE0F": objects.pencil,
    "\u{1F426}": objects.bird,
    "\u{1F4D6}": objects.bookOpen,
    "\u{1F170}\uFE0F": objects.bookAb,
    "\u{1F415}": objects.dog,
    "\u{1F469}": objects.mother,
    "\u{1F9FC}": objects.soap,
    "\u{1F3C3}": objects.running,
    "\u{1FAA5}": objects.toothbrush,
    "\u{1F37D}\uFE0F": objects.plate,
    "\u{1F41F}": objects.fish,
    "\u26BD": objects.ball,
    "\u{1F550}": objects.clock,
    "\u{1F30D}": objects.globe,
    "\u{1F333}": objects.tree,
  };
  return map[visual] ?? null;
}

export const PASSCODE_ORDER = [
  passcode.ball, passcode.star, passcode.paw,
  passcode.apple, passcode.cat, passcode.drum,
  passcode.mango, passcode.bird, passcode.car,
];

// Module icons — still null; the designer's flat module tiles can drop in here.
export const moduleArt: Record<string, ImageSource> = {
  grammar: require("@/assets/images/modules/grammar.png"),
  reading: require("@/assets/images/modules/reading.png"),
  writing: require("@/assets/images/modules/writing.png"),
  vocab: require("@/assets/images/modules/vocab.png"),
  story: require("@/assets/images/modules/story.png"),
  counting: require("@/assets/images/modules/counting.png"),
  addition: require("@/assets/images/modules/addition.png"),
  subtraction: require("@/assets/images/modules/subtraction.png"),
  shapes: require("@/assets/images/modules/shapes.png"),
  games: require("@/assets/images/modules/games.png"),
  // hygiene set — no matching art on the supplied sheets; clean icons used
  handwash: require("@/assets/images/modules/handwash.png"),
  teeth: require("@/assets/images/modules/teeth.png"),
  body: require("@/assets/images/modules/body.png"),
  clothes: require("@/assets/images/modules/clothes.png"),
  food: require("@/assets/images/modules/food.png"),
};

/**
 * Lesson teaching clips (PRD FR-5.2: short MP4, <=3 MB, bundled on device).
 * Key is "<module>/<lesson>". Add a require() here and that lesson's player
 * plays real video instead of narrating with speech.
 *
 * Example entry (uncomment and point at a real file):
 *   "grammar/people": <require the mp4 from assets/videos here>
 */
export const lessonVideo: Record<string, ImageSource> = {
  // Sample clip so the video player can be demonstrated end to end.
  // Replace with the designer's recorded clips as they are produced.
  "food/fruits": require("@/assets/videos/sample-apple.mp4"),
};
