import { createAudioPlayer, AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Central sound + haptic feedback.
 *
 * The four cues live in assets/sounds/ and are bundled with the app. They must
 * exist: Metro resolves require() statically, so a missing file breaks the
 * build rather than degrading at runtime.
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

export type SoundKey = "tap" | "correct" | "wrong" | "success";

const SOURCES: Record<SoundKey, any> = {
  tap: require("@/assets/sounds/tap.wav"),
  correct: require("@/assets/sounds/correct.wav"),
  wrong: require("@/assets/sounds/wrong.wav"),
  success: require("@/assets/sounds/success.wav"),
};

export function play(key: SoundKey) {
  if (!enabled) return;
  const p = tryLoad(key, SOURCES[key]);
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
