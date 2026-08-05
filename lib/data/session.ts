/**
 * Session + device (PRD §2.2, §4 S8). Tracks the currently logged-in child,
 * handles picture-passcode verification, and the facilitator PIN.
 *
 * Neither secret is kept in plain AsyncStorage: both live in the device
 * keychain/keystore via lib/data/secure.ts.
 */
import { Device } from "./types";
import { KEYS, readJSON, writeJSON, uuid } from "./store";
import { getChildPasscode } from "./children";
import { secureGet, secureSet, SECURE_KEYS } from "./secure";
import { logEvent, hasLoggedInToday } from "./events";

const DEFAULT_PIN = "1234"; // seeded once; facilitator changes it on the dashboard

export async function getDevice(): Promise<Device> {
  const existing = await readJSON<Device | null>(KEYS.device, null);
  if (existing) return existing;
  const device: Device = {
    id: `d_${uuid().slice(0, 8)}`,
    name: "Tablet 1",
    pinIsDefault: true,
    assignedChildren: [],
    appVersion: "1.0.0",
    contentVersion: "1.0.0",
  };
  await writeJSON(KEYS.device, device);
  await secureSet(SECURE_KEYS.facilitatorPin, DEFAULT_PIN);
  return device;
}

/** True while the PIN is still the seeded default — the UI warns about this. */
export async function pinIsDefault(): Promise<boolean> {
  return (await getDevice()).pinIsDefault;
}

export async function setFacilitatorPin(pin: string): Promise<void> {
  await secureSet(SECURE_KEYS.facilitatorPin, pin);
  const d = await getDevice();
  await writeJSON(KEYS.device, { ...d, pinIsDefault: pin === DEFAULT_PIN });
}

export async function checkFacilitatorPin(pin: string): Promise<boolean> {
  await getDevice();                                   // ensures the PIN is seeded
  const stored = (await secureGet(SECURE_KEYS.facilitatorPin)) ?? DEFAULT_PIN;
  return stored === pin;
}

// Verify a child's ordered 3-picture passcode (§4 S3 / FR-3.1).
export async function verifyPasscode(childId: string, seq: number[]): Promise<boolean> {
  const passcode = await getChildPasscode(childId);
  if (!passcode.length) return false;
  return passcode.length === seq.length && passcode.every((v, i) => v === seq[i]);
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
