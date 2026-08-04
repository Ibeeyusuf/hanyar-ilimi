/**
 * Core data model — mirrors PRD §6 (Data model) and §5.2 (event log).
 * This is the on-device source of truth for events; a server would later be
 * the source of truth for roster + content (PRD §5.2). Kept storage-agnostic
 * so the AsyncStorage implementation here can be swapped for encrypted SQLite
 * (SQLCipher) in production without changing callers.
 */

export type StrandId = "karatu" | "lissafi" | "tsafta";

export type Child = {
  id: string;            // coded id (no PII leaves device — PRD §7)
  name: string;
  sex: "f" | "m";
  dobEst?: number;       // approximate birth year
  photoUri?: string;     // local-only, never synced (PRD §7)
  passcode: number[];    // ordered indices into the 9-icon grid (hashed in prod)
  deviceId: string;
  groupId?: string;
  enrolledAt: number;
  status: "active" | "exited";
};

export type Device = {
  id: string;
  name: string;
  pinHash: string;       // facilitator PIN (plain-ish for prototype; hash in prod)
  assignedChildren: string[];
  appVersion: string;
  contentVersion: string;
};

// Append-only event log (PRD §5.2). Events are immutable — no conflicts.
export type EventType =
  | "login"
  | "lesson_complete"
  | "item_response"
  | "assessment"
  | "flag"
  | "attendance_edit";

export type AppEvent = {
  id: string;            // UUID
  type: EventType;
  childId: string;
  deviceId: string;
  ts: number;            // device timestamp
  payload: Record<string, any>;
  syncedAt?: number | null;
  schemaVersion: number;
};

// Per-child, per-lesson progress derived from events + stored for quick reads.
export type LessonProgress = {
  childId: string;
  strand: StrandId;
  levelId: string;
  lessonId: string;
  stars: number;         // 0-3
  bestScore: number;     // 0-1
  attempts: number;
  completedAt?: number;
};

// Per-child, per-skill mastery (the mastery unit — PRD §6 Skill).
export type SkillMastery = {
  childId: string;
  skillId: string;
  correct: number;
  total: number;
  failStreak: number;    // consecutive fails; 2 => "needs help" (PRD §3.4)
  needsHelp: boolean;
};

export type Assessment = {
  childId: string;
  strand: StrandId;
  kind: "baseline" | "month6" | "month12";
  levelResult: number;
  ts: number;
};
