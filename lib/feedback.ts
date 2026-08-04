import { createAudioPlayer, AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Central sound + haptic feedback.
 * Sound files live in assets/sounds/ (see assets/sounds/README for free
 * sources). If a file is missing the app still runs — sound just no-ops.
 */

let enabled = true;
export function setSoundEnabled(v: boolean) { enabled = v; }

// Lazy-loaded players so missing files never crash startup.
const players: Record<string, AudioPlayer | null> = {};

function tryLoad(key: string, mod: any) {
  if (players[key] !== undefined) return players[key];
  try {
    players[key] = createAudioPlayer(mod);
  } catch {
    players[key] = null;
  }
  return players[key];
}

// Each entry wrapped in try/require so a missing file is tolerated.
function sourceFor(key: SoundKey): any | null {
  try {
    switch (key) {
      case "tap": return require("@/assets/sounds/tap.mp3");
      case "correct": return require("@/assets/sounds/correct.mp3");
      case "wrong": return require("@/assets/sounds/wrong.mp3");
      case "success": return require("@/assets/sounds/success.mp3");
      default: return null;
    }
  } catch {
    return null;
  }
}

export type SoundKey = "tap" | "correct" | "wrong" | "success";

export function play(key: SoundKey) {
  if (!enabled) return;
  const src = sourceFor(key);
  if (!src) return;
  const p = tryLoad(key, src);
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {}
}

export function haptic(kind: "light" | "success" | "warning" = "light") {
  if (Platform.OS === "web") return;
  try {
    if (kind === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === "warning") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

// Convenience combos
export const feedback = {
  tap: () => { play("tap"); haptic("light"); },
  correct: () => { play("correct"); haptic("success"); },
  wrong: () => { play("wrong"); haptic("warning"); },
  success: () => { play("success"); haptic("success"); },
};
