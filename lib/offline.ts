import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Lightweight offline-content tracking. In this build it records which
 * subjects the user has "downloaded" so lessons are marked available offline.
 * Because all lesson content here is bundled in the app, everything already
 * works with no connection — this gives the user explicit control + a clear
 * "available offline" state, and is the hook where real media caching would
 * plug in later.
 */

const KEY = "hi:downloaded-subjects";

export async function getDownloaded(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function setDownloaded(subjectId: string, on: boolean): Promise<string[]> {
  const cur = await getDownloaded();
  const next = on ? Array.from(new Set([...cur, subjectId])) : cur.filter((s) => s !== subjectId);
  try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}

export async function isDownloaded(subjectId: string): Promise<boolean> {
  return (await getDownloaded()).includes(subjectId);
}
