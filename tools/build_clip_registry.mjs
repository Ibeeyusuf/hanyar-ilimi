#!/usr/bin/env node
/**
 * Writes `constants/audioClips.ts` — a static map of clip id to bundled asset.
 *
 * Metro resolves `require()` at build time, so the app cannot look a clip up by
 * building a path at runtime. Every recorded file needs a literal require, and
 * that file has to be generated from what is actually on disk: a require for a
 * clip that does not exist is a build failure, not a missing-audio fallback.
 *
 * Run this after adding or regenerating clips in `assets/audio/ha/`.
 *
 *   node tools/build_clip_registry.mjs
 */
import fs from "node:fs";

const DIR = "assets/audio/ha";
const OUT = "constants/audioClips.ts";
const MANIFEST = "assets/audio/manifest.json";

const ids = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter((f) => f.endsWith(".m4a")).map((f) => f.replace(/\.m4a$/, "")).sort()
  : [];

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : { clips: [] };
const texts = new Map(manifest.clips.map((c) => [c.id, c.text]));
const known = new Set(texts.keys());

/** Must match `normalise()` in extract_strings.mjs and lib/speech.ts. */
const normalise = (t) => t.replace(/\s+/g, " ").trim().toLowerCase();

const orphaned = ids.filter((id) => !known.has(id));
const usable = ids.filter((id) => known.has(id));

const body = usable.length
  ? usable.map((id) => `  // ${texts.get(id).replace(/\s+/g, " ").slice(0, 72)}\n  "${id}": require("@/assets/audio/${"ha"}/${id}.m4a"),`).join("\n")
  : "  // No clips recorded yet — see tools/generate_audio.py.";

fs.writeFileSync(OUT, `/**
 * GENERATED FILE — do not edit by hand.
 * Run \`node tools/build_clip_registry.mjs\` after changing assets/audio/ha/.
 *
 * Maps a clip id (sha1 of the normalised Hausa text, see
 * tools/extract_strings.mjs) to the bundled recording of that line.
 *
 * ${usable.length} of ${manifest.clips.length} lines recorded.
 * Anything missing falls back to device speech, which on most tablets means an
 * English voice reading Hausa — see lib/speech.ts.
 */
export const CLIPS: Record<string, number> = {
${body}
};

/**
 * Normalised Hausa text to clip id. Lets the app find a recording from the
 * string a screen passes to \`speak()\` without hashing at runtime.
 */
export const TEXT_TO_CLIP: Record<string, string> = {
${usable.map((id) => `  ${JSON.stringify(normalise(texts.get(id)))}: "${id}",`).join("\n") || "  // No clips recorded yet."}
};

/** How much of the narration is genuinely Hausa on this build. */
export const CLIP_COVERAGE = { recorded: ${usable.length}, total: ${manifest.clips.length} };
`);

console.log(`${OUT} written — ${usable.length} of ${manifest.clips.length} lines recorded.`);
if (orphaned.length) {
  console.log(`\n${orphaned.length} file(s) on disk are not in the manifest and were left out of the registry:`);
  for (const id of orphaned.slice(0, 10)) console.log("  " + id + ".m4a");
  console.log("The text they were recorded for has changed. Delete them, or re-run extract_strings.mjs.");
}
