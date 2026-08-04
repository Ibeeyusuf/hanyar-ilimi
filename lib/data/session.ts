/**
 * Session + device (PRD §2.2, §4 S8). Tracks the currently logged-in child,
 * handles picture-passcode verification, and the facilitator PIN.
 */
import { Device } from "./types";
import { KEYS, readJSON, writeJSON, uuid } from "./store";
import { getChild } from "./children";
import { logEvent, hasLoggedInToday } from "./events";

const DEFAULT_PIN = "1234"; // facilitator changes this in settings (§4 S8)

export async function getDevice(): Promise<Device> {
  const existing = await readJSON<Device | null>(KEYS.device, null);
  if (existing) return existing;
  const device: Device = {
    id: `d_${uuid().slice(0, 8)}`,
    name: "Tablet 1",
    pinHash: DEFAULT_PIN,
    assignedChildren: [],
    appVersion: "1.0.0",
    contentVersion: "1.0.0",
  };
  await writeJSON(KEYS.device, device);
  return device;
}

export async function setFacilitatorPin(pin: string): Promise<void> {
  const d = await getDevice();
  d.pinHash = pin;
  await writeJSON(KEYS.device, d);
}

export async function checkFacilitatorPin(pin: string): Promise<boolean> {
  const d = await getDevice();
  return d.pinHash === pin;
}

// Verify a child's ordered 3-picture passcode (§4 S3 / FR-3.1).
export async function verifyPasscode(childId: string, seq: number[]): Promise<boolean> {
  const child = await getChild(childId);
  if (!child) return false;
  return child.passcode.length === seq.length && child.passcode.every((v, i) => v === seq[i]);
}

// Log a successful login; records attendance on first login of the day.
export async function loginChild(childId: string): Promise<{ firstToday: boolean }> {
  const device = await getDevice();
  const firstToday = !(await hasLoggedInToday(childId));
  await logEvent("login", childId, device.id, { attendance: firstToday });
  await writeJSON(KEYS.session, childId);
  return { firstToday };
}

export async function getSessionChildId(): Promise<string | null> {
  return readJSON<string | null>(KEYS.session, null);
}

export async function logout(): Promise<void> {
  await writeJSON(KEYS.session, null);
}
