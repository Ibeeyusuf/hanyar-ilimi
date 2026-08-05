/**
 * Event sync (PRD §5.2).
 *
 * The device is the source of truth and works indefinitely offline; sync is a
 * one-way flush of the append-only event log. Events are immutable and carry
 * their own UUID, so a retry after a dropped connection is safe — the server
 * de-duplicates on event id and there are no conflicts to resolve.
 *
 * No endpoint ships with the app. Until a facilitator (or an MDM profile)
 * configures one, syncNow() reports the pending backlog honestly instead of
 * silently pretending to have synced.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUnsyncedEvents, markSynced } from "./events";

const ENDPOINT_KEY = "hi:sync-endpoint";
const LAST_SYNC_KEY = "hi:last-sync";
const BATCH = 200;          // keep request bodies small on a weak connection

export type SyncResult = {
  ok: boolean;
  sent: number;
  pending: number;
  reason?: "no-endpoint" | "network" | "server";
  lastSyncAt?: number | null;
};

export async function getSyncEndpoint(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ENDPOINT_KEY);
  } catch {
    return null;
  }
}

export async function setSyncEndpoint(url: string | null): Promise<void> {
  try {
    if (url) await AsyncStorage.setItem(ENDPOINT_KEY, url);
    else await AsyncStorage.removeItem(ENDPOINT_KEY);
  } catch {}
}

export async function getLastSyncAt(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

/** How many events are waiting to go up. Drives the dashboard chip. */
export async function pendingCount(): Promise<number> {
  return (await getUnsyncedEvents()).length;
}

export async function syncNow(): Promise<SyncResult> {
  const endpoint = await getSyncEndpoint();
  const unsynced = await getUnsyncedEvents();
  const lastSyncAt = await getLastSyncAt();

  if (!endpoint) {
    return { ok: false, sent: 0, pending: unsynced.length, reason: "no-endpoint", lastSyncAt };
  }
  if (unsynced.length === 0) {
    return { ok: true, sent: 0, pending: 0, lastSyncAt };
  }

  let sent = 0;
  for (let i = 0; i < unsynced.length; i += BATCH) {
    const batch = unsynced.slice(i, i + BATCH);
    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
      });
    } catch {
      // Offline or unreachable — stop, keep the rest queued, try again later.
      return { ok: false, sent, pending: unsynced.length - sent, reason: "network", lastSyncAt };
    }
    if (!res.ok) {
      return { ok: false, sent, pending: unsynced.length - sent, reason: "server", lastSyncAt };
    }
    // Only mark synced once the server has acknowledged the batch, so a
    // failure can never silently drop a child's work.
    await markSynced(batch.map((e) => e.id));
    sent += batch.length;
  }

  const now = Date.now();
  try { await AsyncStorage.setItem(LAST_SYNC_KEY, String(now)); } catch {}
  return { ok: true, sent, pending: 0, lastSyncAt: now };
}
