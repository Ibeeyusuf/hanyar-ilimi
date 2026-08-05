import * as Speech from "expo-speech";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { CLIPS, CLIP_COVERAGE, TEXT_TO_CLIP } from "@/constants/audioClips";
import { normaliseForClip, spokenForm } from "@/lib/clipKey";

/**
 * Narration.
 *
 * The app teaches Hausa literacy to children who cannot read, so what they
 * hear IS the lesson. There are two ways to produce it and they are not
 * equivalent:
 *
 *   1. A recorded Hausa clip, generated once by YarnGPT-local and bundled with
 *      the app (see tools/generate_audio.py). Correct pronunciation, no
 *      network, instant.
 *
 *   2. expo-speech, the device's own text-to-speech. Almost no Android tablet
 *      ships a Hausa voice, so the engine silently falls back to whatever it
 *      has — usually English — and reads Hausa words with English phonology.
 *      "Ƙidaya" comes out as something no Hausa speaker would recognise.
 *
 * Option 2 is not a fallback in any meaningful sense: for a child learning to
 * decode words it is actively teaching the wrong thing. It is kept only so a
 * line with no recording is not silent, and the app is explicit in Settings
 * about how much of the narration is really Hausa.
 *
 * `speak()` therefore always tries the recording first.
 */

let speechEnabled = true;
export function setSpeechEnabled(v: boolean) {
  speechEnabled = v;
  if (!v) stop();
}

/**
 * How fast recordings play, 1 = as generated.
 *
 * The clips were produced by a model that speaks quickly, and how slow is slow
 * enough depends on the child — a six-year-old meeting a word for the first
 * time needs more room than a nine-year-old revising. Making this a preference
 * rather than baking it into the files means a facilitator can adjust it for
 * the group in front of them without anyone regenerating 558 recordings.
 *
 * Pitch is corrected, so a slower clip still sounds like the same speaker
 * rather than dropping into a growl.
 */
let clipRate = 0.9;
export function setClipRate(v: number) {
  clipRate = Math.min(1.2, Math.max(0.5, v));
}
export function getClipRate(): number {
  return clipRate;
}

/**
 * The clip id is a sha1 of the normalised text, computed at build time.
 * Recomputing it here would mean shipping a sha1 implementation to derive
 * something already known, so the generated registry carries the normalised
 * text alongside the id and the lookup is a plain map, built once on first use.
 */
let index: Map<string, string> | null = null;

function clipIdFor(text: string): string | undefined {
  if (!index) index = new Map(Object.entries(TEXT_TO_CLIP));
  return index.get(normaliseForClip(text));
}

// One reused player rather than one per clip: 550-odd players would be a large
// amount of native memory on a device that has very little of it.
let player: AudioPlayer | null = null;

// Bumped whenever new narration starts, so a queue that is still running is
// abandoned rather than talking over whatever replaced it.
let sequenceToken = 0;

function playClip(asset: number): boolean {
  try {
    if (!player) player = createAudioPlayer(asset);
    else player.replace(asset);
    player.seekTo(0);
    player.setPlaybackRate(clipRate, "high");
    player.play();
    return true;
  } catch {
    return false;
  }
}

// --- device speech, used only when there is no recording -------------------

type VoiceChoice = { identifier?: string; language: string; hausa: boolean };
let chosen: VoiceChoice | null = null;
let probing = false;

async function resolveVoice(): Promise<VoiceChoice> {
  if (chosen) return chosen;
  if (probing) return { language: "ha", hausa: false };
  probing = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const byLang = (pred: (l: string) => boolean) =>
      voices.find((v) => typeof v.language === "string" && pred(v.language.toLowerCase()));

    const hausa = byLang((l) => l.startsWith("ha"));
    if (hausa) {
      chosen = { identifier: hausa.identifier, language: hausa.language, hausa: true };
      return chosen;
    }
    const pick = byLang((l) => l.includes("ng")) ?? byLang((l) => l.startsWith("en"));
    chosen = pick
      ? { identifier: pick.identifier, language: pick.language, hausa: false }
      : { language: "ha", hausa: false };
  } catch {
    chosen = { language: "ha", hausa: false };
  } finally {
    probing = false;
  }
  return chosen!;
}

/** True only when the device genuinely has a Hausa voice installed. */
export async function hasHausaVoice(): Promise<boolean> {
  return (await resolveVoice()).hausa;
}

/**
 * How much of the narration is a real Hausa recording. Surfaced in Settings so
 * a facilitator knows what the children are actually hearing.
 */
export function clipCoverage(): { recorded: number; total: number; percent: number } {
  const { recorded, total } = CLIP_COVERAGE;
  return { recorded, total, percent: total ? Math.round((recorded / total) * 100) : 0 };
}

/** Is this exact line available as a Hausa recording? */
export function hasClip(text: string): boolean {
  const id = clipIdFor(spokenForm(text));
  return !!(id && CLIPS[id]);
}

/**
 * Speak several lines in turn, each looked up as its own recording.
 *
 * This exists because joining lines before speaking them silently destroys the
 * whole recorded library. Clips are keyed by exact text, so "Kujera" has a
 * recording and "Kujera. Muna zama a kan kujera." does not — the lookup misses,
 * the app falls through to the device voice, and every lesson narrates in
 * English while Settings insists 558 of 558 lines are recorded.
 *
 * Never concatenate before calling speak(). Pass the lines separately.
 */
export function speakLines(lines: string[], opts?: { gapMs?: number }) {
  if (!speechEnabled) return;
  const queue = lines.map((l) => l?.trim()).filter(Boolean) as string[];
  if (!queue.length) return;
  stop();

  const gap = opts?.gapMs ?? 320;
  const token = ++sequenceToken;

  const next = (i: number) => {
    if (i >= queue.length || token !== sequenceToken || !speechEnabled) return;
    const spoken = spokenForm(queue[i]);
    const id = clipIdFor(spoken);
    const asset = id ? CLIPS[id] : undefined;

    if (asset && playClip(asset)) {
      // Wait for the clip's real length rather than guessing, then pause
      // before the next line so the two do not run together.
      const started = Date.now();
      const check = setInterval(() => {
        if (token !== sequenceToken) { clearInterval(check); return; }
        const dur = player?.duration ?? 0;
        const elapsed = (Date.now() - started) / 1000;
        // duration is 0 until the clip loads; the 12s ceiling is a guard
        // against a clip that never reports one.
        if ((dur > 0 && elapsed >= dur / clipRate) || elapsed > 12) {
          clearInterval(check);
          setTimeout(() => next(i + 1), gap);
        }
      }, 120);
      return;
    }

    // No recording for this line — device voice, then move on.
    resolveVoice().then((v) => {
      if (token !== sequenceToken || !speechEnabled) return;
      Speech.speak(spoken, {
        language: v.language,
        voice: v.identifier,
        rate: v.hausa ? 0.92 : 0.82,
        pitch: 1.03,
        onDone: () => { if (token === sequenceToken) setTimeout(() => next(i + 1), gap); },
      });
    });
  };

  next(0);
}

export function speak(text: string, opts?: { lang?: string; rate?: number }) {
  if (!speechEnabled || !text) return;
  stop();
  sequenceToken++;

  const spoken = spokenForm(text);
  const id = clipIdFor(spoken);
  const asset = id ? CLIPS[id] : undefined;
  if (asset && playClip(asset)) return;

  // No recording for this line. Fall through to the device voice, slowed a
  // little, because a non-Hausa engine reading Hausa is at least more
  // intelligible slowly.
  try {
    resolveVoice().then((v) => {
      if (!speechEnabled) return;
      Speech.speak(spoken, {
        language: opts?.lang ?? v.language,
        voice: v.identifier,
        rate: opts?.rate ?? (v.hausa ? 0.92 : 0.82),
        pitch: 1.03,
      });
    });
  } catch {}
}

export function stop() {
  sequenceToken++;
  try { Speech.stop(); } catch {}
  try { player?.pause(); } catch {}
}

/** Clearer alias for callers that also deal with video playback. */
export const stopSpeaking = stop;
