/**
 * Thin persistence layer over AsyncStorage. All reads/writes go through here
 * so the backing store can later be swapped for encrypted SQLite (PRD §5.1)
 * without touching the repositories.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = {
  children: "hi:children",
  device: "hi:device",
  events: "hi:events",
  progress: "hi:progress",
  mastery: "hi:mastery",
  assessments: "hi:assessments",
  session: "hi:session", // current logged-in child id
};

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // swallow — offline device should never crash on a write failure
  }
}

export async function remove(key: string): Promise<void> {
  try { await AsyncStorage.removeItem(key); } catch {}
}

// Simple UUID (sufficient for on-device event ids; server assigns nothing).
export function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
