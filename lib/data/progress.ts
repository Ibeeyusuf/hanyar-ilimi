/**
 * Progress + mastery + adaptivity (PRD §3.3–§3.5).
 * - Stars only ever increase (§3.5).
 * - Pass ≥70% unlocks next lesson (§3.4).
 * - Same skill failed twice => needsHelp flag (§3.4).
 */
import { LessonProgress, SkillMastery, StrandId, Assessment } from "./types";
import { KEYS, readJSON, writeJSON } from "./store";
import { logEvent } from "./events";

const PASS = 0.7;

function starsFor(score: number): number {
  if (score >= 0.9) return 3;
  if (score >= PASS) return 2;
  return 1; // attempt still earns 1 — no fail states (§3.5)
}

export async function getProgress(childId: string): Promise<LessonProgress[]> {
  const all = await readJSON<LessonProgress[]>(KEYS.progress, []);
  return all.filter((p) => p.childId === childId);
}

export async function getLessonProgress(childId: string, lessonId: string): Promise<LessonProgress | undefined> {
  return (await getProgress(childId)).find((p) => p.lessonId === lessonId);
}

// Record a completed lesson quiz. Returns stars earned + whether it passed.
export async function completeLesson(
  childId: string, deviceId: string, strand: StrandId, levelId: string, lessonId: string,
  score: number, skillIds: string[]
): Promise<{ stars: number; passed: boolean }> {
  const all = await readJSON<LessonProgress[]>(KEYS.progress, []);
  const stars = starsFor(score);
  const passed = score >= PASS;

  const i = all.findIndex((p) => p.childId === childId && p.lessonId === lessonId);
  if (i >= 0) {
    const prev = all[i];
    all[i] = {
      ...prev,
      stars: Math.max(prev.stars, stars),      // stars only increase (§3.5)
      bestScore: Math.max(prev.bestScore, score),
      attempts: prev.attempts + 1,
      completedAt: passed ? Date.now() : prev.completedAt,
    };
  } else {
    all.push({ childId, strand, levelId, lessonId, stars, bestScore: score, attempts: 1, completedAt: passed ? Date.now() : undefined });
  }
  await writeJSON(KEYS.progress, all);
  await updateMastery(childId, deviceId, skillIds, passed);
  await logEvent("lesson_complete", childId, deviceId, { strand, levelId, lessonId, score, stars, passed });
  return { stars, passed };
}

export async function getMastery(childId: string): Promise<SkillMastery[]> {
  const all = await readJSON<SkillMastery[]>(KEYS.mastery, []);
  return all.filter((m) => m.childId === childId);
}

async function updateMastery(childId: string, deviceId: string, skillIds: string[], passed: boolean): Promise<void> {
  const all = await readJSON<SkillMastery[]>(KEYS.mastery, []);
  for (const skillId of skillIds) {
    let m = all.find((x) => x.childId === childId && x.skillId === skillId);
    if (!m) { m = { childId, skillId, correct: 0, total: 0, failStreak: 0, needsHelp: false }; all.push(m); }
    m.total += 1;
    if (passed) { m.correct += 1; m.failStreak = 0; m.needsHelp = false; }
    else {
      m.failStreak += 1;
      if (m.failStreak >= 2) { m.needsHelp = true; await logEvent("flag", childId, deviceId, { skillId, reason: "failed_twice" }); }
    }
  }
  await writeJSON(KEYS.mastery, all);
}

// Children needing help (PRD §3.4 / FR-9.2) — computed on device in real time.
export async function childrenNeedingHelp(): Promise<Record<string, string[]>> {
  const all = await readJSON<SkillMastery[]>(KEYS.mastery, []);
  const out: Record<string, string[]> = {};
  for (const m of all) if (m.needsHelp) { (out[m.childId] ||= []).push(m.skillId); }
  return out;
}

// Overall mastery % for a child (for dashboards / reward framing).
export async function masteryPercent(childId: string): Promise<number> {
  const ms = await getMastery(childId);
  if (!ms.length) return 0;
  const c = ms.reduce((s, m) => s + m.correct, 0);
  const t = ms.reduce((s, m) => s + m.total, 0);
  return t ? Math.round((c / t) * 100) : 0;
}

/**
 * Placement / assessment records (PRD §3.4, §10).
 * The placement game's result is the child's BASELINE — it is the evidence
 * base for funder reporting ("baseline vs month-6/12"), so it must persist.
 */
export async function saveAssessment(
  childId: string, deviceId: string, strand: StrandId,
  kind: "baseline" | "month6" | "month12", levelResult: number
): Promise<void> {
  const all = await readJSON<Assessment[]>(KEYS.assessments, []);
  all.push({ childId, strand, kind, levelResult, ts: Date.now() });
  await writeJSON(KEYS.assessments, all);
  await logEvent("assessment", childId, deviceId, { strand, kind, levelResult });
}

export async function getAssessments(childId: string): Promise<Assessment[]> {
  const all = await readJSON<Assessment[]>(KEYS.assessments, []);
  return all.filter((a) => a.childId === childId);
}

/** Has this child already completed a baseline placement? */
export async function hasBaseline(childId: string): Promise<boolean> {
  return (await getAssessments(childId)).some((a) => a.kind === "baseline");
}
