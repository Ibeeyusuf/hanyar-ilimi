#!/usr/bin/env node
/**
 * Builds `assets/audio/manifest.json` — every Hausa line the app can speak.
 *
 * This is the input to `tools/generate_audio.py`. It exists because the app's
 * narration has to be enumerable: a lesson word, a prompt, a hint, an answer
 * option and a screen instruction are all things a child hears, and every one
 * of them needs a Hausa clip. Anything not in this manifest will fall back to
 * device speech, which on almost every tablet means an English voice reading
 * Hausa — the exact problem the recorded library is here to solve.
 *
 * IDs are a content hash of the normalised text, so:
 *   - the same sentence used on two screens shares one clip
 *   - editing a lesson changes its ID, and the stale clip is reported as
 *     orphaned rather than silently played against the new text
 *
 *   node tools/extract_strings.mjs
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const OUT = "assets/audio/manifest.json";

/** Normalisation must match `normalise()` in lib/speech.ts exactly. */
function normalise(text) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function idFor(text) {
  return crypto.createHash("sha1").update(normalise(text), "utf8").digest("hex").slice(0, 12);
}

const entries = new Map(); // id -> { id, text, sources: [] }

const phrasesSrc = fs.readFileSync("constants/phrases.ts", "utf8");
const clipKeySrc = fs.readFileSync("lib/clipKey.ts", "utf8");
const numberBlock = clipKeySrc.slice(clipKeySrc.indexOf("export const NUMBER_WORDS"));
const words = Object.fromEntries(
  [...numberBlock.matchAll(/^\s*(\d+):\s*"([^"]+)",/gm)].map((m) => [Number(m[1]), m[2]])
);

function add(text, source) {
  if (!text || typeof text !== "string") return;
  let trimmed = text.trim();
  if (!trimmed) return;
  // A numeric answer tile is labelled "3", but a child must hear "uku".
  // Runtime `speak()` applies the same substitution, so the two agree.
  if (/^\d{1,2}$/.test(trimmed) && words[Number(trimmed)]) trimmed = words[Number(trimmed)];
  const id = idFor(trimmed);
  const existing = entries.get(id);
  if (existing) {
    if (!existing.sources.includes(source)) existing.sources.push(source);
    return;
  }
  entries.set(id, { id, text: trimmed, sources: [source] });
}

// --- fixed UI phrases ------------------------------------------------------
const phraseBlock = phrasesSrc.slice(phrasesSrc.indexOf("export const PHRASES"), phrasesSrc.indexOf("} as const;"));
for (const m of phraseBlock.matchAll(/^\s*([a-zA-Z]+):\s*"((?:[^"\\]|\\.)*)",/gm)) add(m[2], `phrase:${m[1]}`);

// --- Hausa number words ----------------------------------------------------
for (const [n, w] of Object.entries(words)) add(w, `number:${n}`);

// The numeracy quiz speaks additions as "<a> da <b>". Only small sums appear,
// so every combination that can be generated is enumerated rather than left to
// fall back mid-lesson.
for (let a = 1; a <= 10; a++) {
  for (let b = 1; b <= 10; b++) {
    if (a + b > 20) continue;
    add(`${words[a]} da ${words[b]}`, `addition:${a}+${b}`);
  }
}

// --- lesson content --------------------------------------------------------
const cards = fs.readFileSync("constants/lessonContent.ts", "utf8");
const body = cards.slice(cards.indexOf("export const LESSON_CONTENT"), cards.indexOf("Safety net only"));

let lessonCount = 0;
for (const entry of body.matchAll(/^  "([^"]+)": \{([\s\S]*?)^  \},/gm)) {
  const [, key, card] = entry;
  lessonCount++;

  const word = card.match(/word: "((?:[^"\\]|\\.)*)"/);
  const prompt = card.match(/prompt: "((?:[^"\\]|\\.)*)"/);
  const hint = card.match(/hint: "((?:[^"\\]|\\.)*)"/);

  if (word) add(word[1], `${key}:word`);
  // The blank is read aloud as a pause, not as eleven underscores.
  if (prompt) add(prompt[1].replace(/_{2,}/g, "…"), `${key}:prompt`);
  if (hint) add(hint[1], `${key}:hint`);

  for (const o of card.matchAll(/\{ label: "((?:[^"\\]|\\.)*)"(?:, correct: true)? \}/g)) {
    add(o[1], `${key}:option`);
  }
}

// --- lesson titles, spoken in the lesson rail ------------------------------
const content = fs.readFileSync("constants/content.ts", "utf8");
for (const m of content.matchAll(/id: "[^"]+", num: \d+, ha: "((?:[^"\\]|\\.)*)"/g)) add(m[1], "lesson-title");
for (const m of content.matchAll(/^\s*\{ id: "[a-z]+", en: "[A-Z ]+", ha: "((?:[^"\\]|\\.)*)"/gm)) add(m[1], "subject-title");

// --- write -----------------------------------------------------------------
const manifest = {
  generatedAt: new Date().toISOString().slice(0, 10),
  normalisation: "collapse whitespace, trim, lowercase",
  idAlgorithm: "sha1(normalised text) truncated to 12 hex chars",
  language: "ha",
  count: entries.size,
  clips: [...entries.values()].sort((a, b) => a.text.localeCompare(b.text, "ha")),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");

// --- report ----------------------------------------------------------------
const dir = "assets/audio/ha";
const present = fs.existsSync(dir)
  ? new Set(fs.readdirSync(dir).filter((f) => f.endsWith(".m4a")).map((f) => f.replace(/\.m4a$/, "")))
  : new Set();

const missing = manifest.clips.filter((c) => !present.has(c.id));
const orphaned = [...present].filter((id) => !entries.has(id));

console.log(`Manifest written: ${manifest.count} lines from ${lessonCount} lessons.`);
console.log(`Recorded: ${present.size}  ·  missing: ${missing.length}  ·  orphaned: ${orphaned.length}`);
if (orphaned.length) {
  console.log("\nOrphaned clips — the text they were recorded for has changed. Delete or regenerate:");
  for (const id of orphaned.slice(0, 20)) console.log("  " + id);
  if (orphaned.length > 20) console.log(`  …and ${orphaned.length - 20} more`);
}
if (missing.length) {
  console.log(`\nRun tools/generate_audio.py on a GPU machine to record the ${missing.length} missing lines.`);
}
