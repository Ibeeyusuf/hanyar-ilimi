#!/usr/bin/env node
/**
 * Checks that the course defined in constants/content.ts is actually taught by
 * constants/lessonContent.ts.
 *
 * This exists because the failure it catches is invisible in the running app:
 * a lesson with no card silently falls back to a generated question built from
 * its neighbours' titles. It renders, it is answerable, and it teaches nothing.
 * Nobody notices until a child has been through it.
 *
 * Reads the source as text rather than importing it, so it runs on plain node
 * with no bundler, transform or React Native runtime.
 *
 *   node tools/check_content.mjs
 */
import fs from "node:fs";

const content = fs.readFileSync("constants/content.ts", "utf8");
const cards = fs.readFileSync("constants/lessonContent.ts", "utf8");

const failures = [];

// --- what the course claims to contain -------------------------------------
const byConst = {};
for (const b of content.matchAll(/const ([A-Z]+): LessonItem\[\] = \[([\s\S]*?)\];/g)) {
  byConst[b[1]] = [...b[2].matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
}
const realLessons = content.match(/const REAL_LESSONS[\s\S]*?\n};/);
if (!realLessons) {
  console.error("Could not find REAL_LESSONS in constants/content.ts.");
  process.exit(1);
}
const modules = [...realLessons[0].matchAll(/"([a-z]+)\/([a-z]+)": ([A-Z]+),/g)];

const expected = [];
for (const [, subject, module, constName] of modules) {
  for (const id of byConst[constName] ?? []) expected.push(`${subject}/${module}/${id}`);
}

// --- what has actually been written ----------------------------------------
const body = cards.slice(cards.indexOf("export const LESSON_CONTENT"), cards.indexOf("Safety net only"));
const written = new Map();
for (const m of body.matchAll(/^  "([^"]+)": \{([\s\S]*?)^  \},/gm)) written.set(m[1], m[2]);

for (const key of expected) if (!written.has(key)) failures.push(`${key} — no teaching card, would fall back to a generated question`);
for (const key of written.keys()) if (!expected.includes(key)) failures.push(`${key} — card exists but no such lesson in content.ts`);

// --- each card has to be answerable ----------------------------------------
for (const [key, card] of written) {
  const options = [...card.matchAll(/\{ label: "((?:[^"\\]|\\.)*)"(, correct: true)? \}/g)];
  const labels = options.map((o) => o[1]);
  const correct = options.filter((o) => o[2]).length;

  if (options.length !== 3) failures.push(`${key} — ${options.length} options, expected 3`);
  if (correct !== 1) failures.push(`${key} — ${correct} correct answers, expected exactly 1`);
  if (new Set(labels).size !== labels.length) failures.push(`${key} — duplicate answer labels`);
  if (labels.some((l) => l.trim() === "" || l === "—")) failures.push(`${key} — placeholder answer label`);
  if (!/__________/.test(card)) failures.push(`${key} — prompt has no blank for the child to fill`);
  if (!/hint: "[^"]+"/.test(card)) failures.push(`${key} — no hint`);
}

if (failures.length) {
  console.error(`Content check failed (${failures.length} problem${failures.length === 1 ? "" : "s"}):\n`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}

console.log(`Content check passed — ${expected.length} lessons, all with a written card.`);
