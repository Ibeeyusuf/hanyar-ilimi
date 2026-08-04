/**
 * Child roster repository (PRD §6). On-device profiles; names/photos stay
 * local (PRD §7). In production the server is source of truth for roster,
 * but the device owns it fully offline.
 */
import { Child } from "./types";
import { KEYS, readJSON, writeJSON, uuid } from "./store";

export async function getChildren(): Promise<Child[]> {
  return readJSON<Child[]>(KEYS.children, []);
}

export async function getChild(id: string): Promise<Child | undefined> {
  return (await getChildren()).find((c) => c.id === id);
}

export async function enrolChild(input: Omit<Child, "id" | "enrolledAt" | "status">): Promise<Child> {
  const children = await getChildren();
  const child: Child = {
    ...input,
    id: `c_${uuid().slice(0, 8)}`,
    enrolledAt: Date.now(),
    status: "active",
  };
  children.push(child);
  await writeJSON(KEYS.children, children);
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

export async function resetPasscode(id: string, passcode: number[]): Promise<void> {
  await updateChild(id, { passcode });
}

// Seed a few demo children so a fresh install isn't empty (facilitator would
// enrol real ones). Safe to call on boot — only seeds when roster is empty.
export async function seedIfEmpty(deviceId: string): Promise<void> {
  const children = await getChildren();
  if (children.length > 0) return;
  const demo: Array<Omit<Child, "id" | "enrolledAt" | "status">> = [
    { name: "Aisha", sex: "f", passcode: [0, 4, 8], deviceId },
    { name: "Musa", sex: "m", passcode: [1, 3, 5], deviceId },
    { name: "Fatima", sex: "f", passcode: [2, 4, 6], deviceId },
    { name: "Ibrahim", sex: "m", passcode: [0, 1, 2], deviceId },
    { name: "Zainab", sex: "f", passcode: [8, 4, 0], deviceId },
    { name: "Yusuf", sex: "m", passcode: [3, 4, 5], deviceId },
  ];
  for (const d of demo) await enrolChild(d);
}
