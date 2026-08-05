/**
 * Progress + mastery storage (PRD §3.3–§3.5).
 *
 * This file is responsible for reading and writing; the rules it applies —
 * pass mark, stars, the needs-help threshold — live in ./rules.ts so they can
 * be tested without a device. Do not re-inline a threshold here.
 */
import { LessonProgress, SkillMastery, StrandId, Assessment } from "./types";
import { KEYS, readJSON, writeJSON } from "./store";
import { logEvent } from "./events";
import { applyAttempt, applyMastery, isPass, percentage, FAIL_STREAK_FOR_HELP } from "./rules";

export async function getProgress(childId: string): Promise<LessonProgress[]> {
  const all = await readJSON<LessonProgress[]>(KEYS.progress, []);
  return all.filter((p) => p.childId === childId);
}

// Record a completed lesson quiz. Returns stars earned + whether it passed.
export async function completeLesson(
  childId: string, deviceId: string, strand: StrandId, levelId: string, lessonId: string,
  score: number, skillIds: string[]
): Promise<{ stars: number; passed: boolean }> {
  const all = await readJSON<LessonProgress[]>(KEYS.progress, []);
  const passed = isPass(score);

  const i = all.findIndex((p) => p.childId === childId && p.lessonId === lessonId);
  const merged = applyAttempt(i >= 0 ? all[i] : undefined, score, Date.now());
  if (i >= 0) all[i] = { ...all[i], ...merged };
  else all.push({ childId, strand, levelId, lessonId, ...merged });
  const stars = merged.stars;
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
    const i = all.findIndex((x) => x.childId === childId && x.skillId === skillId);
    const before = i >= 0 ? all[i] : undefined;
    const after = applyMastery(before, passed);
    if (i >= 0) all[i] = { ...all[i], ...after };
    else all.push({ childId, skillId, ...after });
    // Flag only on the transition, so a child who is already flagged does not
    // generate a fresh event on every further attempt.
    if (after.needsHelp && !before?.needsHelp) {
      await logEvent("flag", childId, deviceId, { skillId, reason: `failed_${FAIL_STREAK_FOR_HELP}_times` });
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
  return percentage(c, t);
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
