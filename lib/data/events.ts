/**
 * Append-only event log (PRD §5.2). Events are immutable; the log is the
 * device's source of truth and what a sync pipeline would push to the server.
 */
import { AppEvent, EventType } from "./types";
import { KEYS, readJSON, writeJSON, uuid } from "./store";

const SCHEMA_VERSION = 1;

export async function logEvent(
  type: EventType,
  childId: string,
  deviceId: string,
  payload: Record<string, any> = {}
): Promise<AppEvent> {
  const events = await readJSON<AppEvent[]>(KEYS.events, []);
  const ev: AppEvent = {
    id: uuid(),
    type,
    childId,
    deviceId,
    ts: Date.now(),
    payload,
    syncedAt: null,
    schemaVersion: SCHEMA_VERSION,
  };
  events.push(ev);
  await writeJSON(KEYS.events, events);
  return ev;
}

export async function getEvents(): Promise<AppEvent[]> {
  return readJSON<AppEvent[]>(KEYS.events, []);
}

export async function getUnsyncedEvents(): Promise<AppEvent[]> {
  const events = await getEvents();
  return events.filter((e) => !e.syncedAt);
}

// Mark events as synced (called by a future sync routine after server ack).
export async function markSynced(ids: string[]): Promise<void> {
  const events = await getEvents();
  const set = new Set(ids);
  const now = Date.now();
  for (const e of events) if (set.has(e.id)) e.syncedAt = now;
  await writeJSON(KEYS.events, events);
}

// Attendance = first successful login per child per day (PRD §2.2 / FR-2.3).
export async function hasLoggedInToday(childId: string): Promise<boolean> {
  const events = await getEvents();
  const today = new Date().toDateString();
  return events.some(
    (e) => e.type === "login" && e.childId === childId && new Date(e.ts).toDateString() === today
  );
}
