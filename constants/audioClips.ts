/**
 * GENERATED FILE — do not edit by hand.
 * Run `node tools/build_clip_registry.mjs` after changing assets/audio/ha/.
 *
 * Maps a clip id (sha1 of the normalised Hausa text, see
 * tools/extract_strings.mjs) to the bundled recording of that line.
 *
 * 0 of 558 lines recorded.
 * Anything missing falls back to device speech, which on most tablets means an
 * English voice reading Hausa — see lib/speech.ts.
 */
export const CLIPS: Record<string, number> = {
  // No clips recorded yet — see tools/generate_audio.py.
};

/**
 * Normalised Hausa text to clip id. Lets the app find a recording from the
 * string a screen passes to `speak()` without hashing at runtime.
 */
export const TEXT_TO_CLIP: Record<string, string> = {
  // No clips recorded yet.
};

/** How much of the narration is genuinely Hausa on this build. */
export const CLIP_COVERAGE = { recorded: 0, total: 558 };
