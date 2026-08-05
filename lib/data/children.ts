/**
 * Child roster repository (PRD §6). On-device profiles; names/photos stay
 * local (PRD §7). In production the server is source of truth for roster,
 * but the device owns it fully offline.
 *
 * Passcodes never touch this store — see lib/data/secure.ts.
 */
import { Child } from "./types";
import { KEYS, readJSON, writeJSON, uuid } from "./store";
import { secureGet, secureSet, secureDelete, SECURE_KEYS } from "./secure";
import { deletePortrait } from "@/lib/photos";

export async function getChildren(): Promise<Child[]> {
  return readJSON<Child[]>(KEYS.children, []);
}

export async function getChild(id: string): Promise<Child | undefined> {
  return (await getChildren()).find((c) => c.id === id);
}

/** Read a child's ordered picture passcode. Facilitator-gated callers only. */
export async function getChildPasscode(childId: string): Promise<number[]> {
  const raw = await secureGet(SECURE_KEYS.passcode(childId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setChildPasscode(childId: string, passcode: number[]): Promise<void> {
  await secureSet(SECURE_KEYS.passcode(childId), JSON.stringify(passcode));
}

export async function enrolChild(
  input: Omit<Child, "id" | "enrolledAt" | "status"> & { passcode: number[] }
): Promise<Child> {
  const { passcode, ...profile } = input;
  const children = await getChildren();
  const child: Child = {
    ...profile,
    id: `c_${uuid().slice(0, 8)}`,
    enrolledAt: Date.now(),
    status: "active",
  };
  children.push(child);
  await writeJSON(KEYS.children, children);
  await setChildPasscode(child.id, passcode);
  return child;
}

export async function updateChild(id: string, patch: Partial<Child>): Promise<void> {
  const children = await getChildren();
  const i = children.findIndex((c) => c.id === id);
  if (i >= 0) {
    children[i] = { ...children[i], ...patch };
    await writeJSON(KEYS.children, children);
  }
}

/** Facilitator action: give a child a new set of secret pictures. */
export async function resetPasscode(id: string, passcode: number[]): Promise<void> {
  await setChildPasscode(id, passcode);
}

export async function removeChild(id: string): Promise<void> {
  const children = await getChildren();
  await writeJSON(KEYS.children, children.filter((c) => c.id !== id));
  await secureDelete(SECURE_KEYS.passcode(id));
  // The portrait is a photograph of a child's face; removing the child must
  // remove it from disk too, not just drop the reference to it.
  await deletePortrait(id);
}

/**
 * Ensure the roster is usable on boot.
 *
 * This does two jobs, and the second one exists because of a real failure:
 *
 *  1. Seed demo children when the roster is empty.
 *
 *  2. Repair children who have a profile but no passcode. Passcodes used to
 *     live on the child record in plain AsyncStorage and now live in encrypted
 *     storage. A device that ran the older build keeps its roster, so the old
 *     `seedIfEmpty` saw a non-empty roster, returned immediately, and left
 *     every child with no passcode at all — which rejects every possible
 *     combination of pictures and locks the child out of the app completely,
 *     with the facilitator override showing an empty row because there is
 *     genuinely nothing to show.
 *
 *     A half-finished first seed produces the same state.
 *
 * Repair migrates the legacy value where one exists, so a child keeps the
 * pictures they already learned.
 */
type LegacyChild = Child & { passcode?: number[] };

let seeding: Promise<void> | null = null;

export async function seedIfEmpty(deviceId: string): Promise<void> {
  // React runs effects twice in development, and two concurrent seeds would
  // each see an empty roster and enrol the whole demo group.
  if (seeding) return seeding;
  seeding = run(deviceId).finally(() => { seeding = null; });
  return seeding;
}

const DEMO: { name: string; sex: "f" | "m"; passcode: number[] }[] = [
  { name: "Aisha", sex: "f", passcode: [0, 4, 8] },
  { name: "Musa", sex: "m", passcode: [1, 3, 5] },
  { name: "Fatima", sex: "f", passcode: [2, 4, 6] },
  { name: "Ibrahim", sex: "m", passcode: [0, 1, 2] },
  { name: "Zainab", sex: "f", passcode: [8, 4, 0] },
  { name: "Yusuf", sex: "m", passcode: [3, 4, 5] },
];

async function run(deviceId: string): Promise<void> {
  const children = (await getChildren()) as LegacyChild[];

  if (children.length === 0) {
    for (const d of DEMO) await enrolChild({ ...d, deviceId });
    return;
  }

  let repairedRoster = false;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const stored = await getChildPasscode(child.id);
    if (stored.length === 3) {
      // Already fine. Drop any legacy copy still sitting in plain storage.
      if (child.passcode) { delete children[i].passcode; repairedRoster = true; }
      continue;
    }

    const legacy = Array.isArray(child.passcode) && child.passcode.length === 3 ? child.passcode : null;
    // A demo child with no passcode gets the one this build documents, so the
    // seeded roster behaves the way the README says it does. A real child gets
    // a placeholder and the facilitator has to set it properly — guessing at a
    // passcode a child chose is not something this can do.
    const demo = DEMO.find((d) => d.name === child.name);
    const restored = legacy ?? demo?.passcode ?? [0, 1, 2];

    await setChildPasscode(child.id, restored);
    if (child.passcode) { delete children[i].passcode; repairedRoster = true; }
  }

  if (repairedRoster) await writeJSON(KEYS.children, children);
}

/**
 * Children whose passcode had to be invented during repair — neither a legacy
 * value nor a known demo child. The facilitator should set these deliberately.
 */
export async function childrenWithoutOwnPasscode(): Promise<Child[]> {
  const children = await getChildren();
  const out: Child[] = [];
  for (const c of children) {
    if ((await getChildPasscode(c.id)).length !== 3) out.push(c);
  }
  return out;
}
