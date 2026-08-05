import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

import { normaliseForClip, spokenForm } from "../.tmp-test/lib/clipKey.js";

/**
 * The failure these guard against is silent and total: if the app's
 * normalisation drifts from the build pipeline's, every clip lookup misses and
 * narration reverts to an English voice reading Hausa, with nothing on screen
 * to say so.
 */

// The extractor's own hash, reimplemented here so the two are compared rather
// than one being derived from the other.
const idFor = (text) =>
  crypto.createHash("sha1").update(normaliseForClip(text), "utf8").digest("hex").slice(0, 12);

test("normalisation collapses whitespace, trims and lowercases", () => {
  assert.equal(normaliseForClip("  Sannu!   Danna  don farawa. "), "sannu! danna don farawa.");
  assert.equal(normaliseForClip("ZAƁI DARASI."), "zaɓi darasi.");
});

test("normalisation preserves Hausa hooked letters", () => {
  // ɓ ɗ ƙ ƴ carry meaning in Hausa. Stripping or folding them would merge
  // distinct words onto one clip.
  for (const ch of ["ɓ", "ɗ", "ƙ", "ƴ", "Ɓ", "Ɗ", "Ƙ"]) {
    assert.ok(normaliseForClip(ch).length > 0, `${ch} survived normalisation`);
  }
  assert.notEqual(normaliseForClip("ƙasa"), normaliseForClip("kasa"));
});

test("a bare numeral is spoken as a Hausa word", () => {
  assert.equal(spokenForm("3"), "uku");
  assert.equal(spokenForm("10"), "goma");
  assert.equal(spokenForm("20"), "ashirin");
});

test("numbers beyond the table and non-numbers are left alone", () => {
  assert.equal(spokenForm("21"), "21");
  assert.equal(spokenForm("Kujera"), "Kujera");
  assert.equal(spokenForm("2 + 1 = …."), "2 + 1 = ….");
});

test("every manifest entry round-trips to its own id", () => {
  // Catches the case where the extractor and the app disagree about how a
  // particular line is keyed — the whole library would still be present on
  // disk and never played.
  const manifest = JSON.parse(fs.readFileSync("assets/audio/manifest.json", "utf8"));
  assert.ok(manifest.clips.length > 0, "manifest is not empty");
  const wrong = manifest.clips.filter((c) => idFor(c.text) !== c.id);
  assert.deepEqual(wrong.map((c) => c.text), [], "all manifest ids match the app's normalisation");
});

test("manifest ids are unique and no line is blank", () => {
  const manifest = JSON.parse(fs.readFileSync("assets/audio/manifest.json", "utf8"));
  const ids = manifest.clips.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "no duplicate clip ids");
  assert.equal(manifest.clips.filter((c) => !c.text.trim()).length, 0, "no empty lines");
});

test("no manifest line is a bare numeral", () => {
  // These would be read as English digits by a fallback voice and can never
  // match a recording.
  const manifest = JSON.parse(fs.readFileSync("assets/audio/manifest.json", "utf8"));
  const numerals = manifest.clips.filter((c) => /^\d+$/.test(c.text.trim()));
  assert.deepEqual(numerals.map((c) => c.text), []);
});

test("the generated registry agrees with the manifest", () => {
  const src = fs.readFileSync("constants/audioClips.ts", "utf8");
  const manifest = JSON.parse(fs.readFileSync("assets/audio/manifest.json", "utf8"));
  const byId = new Map(manifest.clips.map((c) => [c.id, c.text]));

  for (const m of src.matchAll(/^\s*"([0-9a-f]{12})": "([0-9a-f]{12})",$/gm)) {
    assert.fail(`unexpected registry shape at ${m[0]}`);
  }
  // Every text->id pair the app will use must key a line the manifest knows.
  for (const m of src.matchAll(/^\s*("(?:[^"\\]|\\.)*"): "([0-9a-f]{12})",$/gm)) {
    const id = m[2];
    assert.ok(byId.has(id), `registry id ${id} is in the manifest`);
    assert.equal(JSON.parse(m[1]), normaliseForClip(byId.get(id)), `registry key for ${id} matches`);
  }
});
