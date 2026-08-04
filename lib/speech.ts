import * as Speech from "expo-speech";

/**
 * Text-to-speech for lessons.
 *
 * IMPORTANT, and worth being honest about: Hausa ("ha") text-to-speech is not
 * installed on most devices or browsers. When it is missing, the engine falls
 * back to whatever default voice exists — usually English — which then reads
 * Hausa words with English pronunciation. That is a limitation of the device,
 * not of the app.
 *
 * This module therefore:
 *   1. looks for a genuine Hausa voice and uses it if present;
 *   2. otherwise tries the closest available (Nigerian / African English);
 *   3. otherwise uses the default voice, slowed slightly so Hausa words are
 *      still reasonably intelligible.
 *
 * The real fix, per PRD §8, is the recorded Hausa audio library (~700 clips).
 * Once those exist, playClip() replaces this for all child-facing narration.
 */

let enabled = true;
export function setSpeechEnabled(v: boolean) { enabled = v; }

type VoiceChoice = { identifier?: string; language: string; hausa: boolean };
let chosen: VoiceChoice | null = null;
let probing = false;

/** Find the best available voice once, then reuse it. */
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
    // closest cultural match — Nigerian English, then any English
    const ng = byLang((l) => l.includes("ng"));
    const en = byLang((l) => l.startsWith("en"));
    const pick = ng ?? en;
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

/** True when the device genuinely has a Hausa voice installed. */
export async function hasHausaVoice(): Promise<boolean> {
  return (await resolveVoice()).hausa;
}

export function speak(text: string, opts?: { lang?: string; rate?: number }) {
  if (!enabled || !text) return;
  try {
    Speech.stop();
    resolveVoice().then((v) => {
      if (!enabled) return;
      Speech.speak(text, {
        language: opts?.lang ?? v.language,
        voice: v.identifier,
        // a non-Hausa voice reading Hausa is clearer a little slower
        rate: opts?.rate ?? (v.hausa ? 0.92 : 0.82),
        pitch: 1.03,
      });
    });
  } catch {}
}

export function stop() {
  try { Speech.stop(); } catch {}
}

/** Clearer alias for callers that also deal with media playback. */
export const stopSpeaking = stop;
