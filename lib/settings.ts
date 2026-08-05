/**
 * App preferences that must survive a restart.
 *
 * The settings screen previously held its toggles in component state only, so
 * a child who turned the sound off got it back the moment they left the
 * screen. These are persisted and re-applied on boot.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setSoundEnabled } from "@/lib/feedback";
import { setSpeechEnabled, setClipRate } from "@/lib/speech";

const KEY = "hi:prefs";

export type Prefs = { sound: boolean; speech: boolean; clipRate: number };
const DEFAULTS: Prefs = { sound: true, speech: true, clipRate: 0.9 };

/** The speeds offered in Settings, slowest first. */
export const CLIP_RATES = [
  { value: 0.7, label: "Very slow" },
  { value: 0.8, label: "Slow" },
  { value: 0.9, label: "Normal" },
  { value: 1.0, label: "Fast" },
];

export async function getPrefs(): Promise<Prefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function setPrefs(patch: Partial<Prefs>): Promise<Prefs> {
  const next = { ...(await getPrefs()), ...patch };
  try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  apply(next);
  return next;
}

function apply(p: Prefs) {
  setSoundEnabled(p.sound);
  setSpeechEnabled(p.speech);
  setClipRate(p.clipRate);
}

/** Called once on boot so stored preferences take effect immediately. */
export async function loadPrefs(): Promise<Prefs> {
  const p = await getPrefs();
  apply(p);
  return p;
}
