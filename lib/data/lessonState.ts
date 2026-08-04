import { getProgress, LessonProgress } from "./index";
import { getLessons, MODULES, SUBJECTS } from "@/constants/content";

/**
 * Turns a child's stored progress into the state the UI shows.
 *
 * Previously lesson stars/locks were hardcoded in content.ts, so finishing a
 * lesson changed nothing on screen. This derives them from real data:
 *   - stars   : what the child actually earned
 *   - done    : they passed it
 *   - locked  : sequential unlock (PRD §3.1) — lesson N opens once N-1 passes
 * The first lesson of a module is always open.
 */
export type LessonState = { id: string; num: number; ha: string; en: string; stars: number; done: boolean; locked: boolean };

export async function getLessonStates(childId: string | null, subject: string, moduleId: string): Promise<LessonState[]> {
  const lessons = getLessons(subject, moduleId);
  const progress: LessonProgress[] = childId ? await getProgress(childId) : [];
  const byLesson = new Map(progress.map((p) => [p.lessonId, p]));

  // PRD §3.1 — the academic strands unlock sequentially, but Tsafta (hygiene)
  // is a flat list with everything open: a child should be able to learn to
  // wash their hands on day one without finishing a lesson sequence first.
  const alwaysOpen = subject === "hygiene";

  let previousPassed = true;                       // first lesson always open
  return lessons.map((l) => {
    const key = `${moduleId}/${l.id}`;
    const p = byLesson.get(key);
    const done = !!p?.completedAt;
    const state: LessonState = {
      id: l.id, num: l.num, ha: l.ha, en: l.en,
      stars: p?.stars ?? 0,
      done,
      locked: alwaysOpen ? false : !previousPassed,
    };
    previousPassed = done;
    return state;
  });
}

/** Percentage of a module's lessons the child has passed. */
export async function getModuleProgress(childId: string | null, subject: string, moduleId: string): Promise<number> {
  const states = await getLessonStates(childId, subject, moduleId);
  if (!states.length) return 0;
  return Math.round((states.filter((s) => s.done).length / states.length) * 100);
}

/** Total stars a child has earned across everything. */
export async function getTotalStars(childId: string | null): Promise<number> {
  if (!childId) return 0;
  const progress = await getProgress(childId);
  return progress.reduce((sum, p) => sum + p.stars, 0);
}

/** Per-subject summary for the Home screen and Progress screen. */
export async function getSubjectSummary(childId: string | null, subject: string) {
  const mods = MODULES[subject] ?? [];
  let done = 0, total = 0, stars = 0;
  for (const m of mods) {
    const states = await getLessonStates(childId, subject, m.id);
    total += states.length;
    done += states.filter((s) => s.done).length;
    stars += states.reduce((s, x) => s + x.stars, 0);
  }
  return { done, total, stars, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** The next lesson a child should continue with (PRD FR-4.1: resume). */
export async function getNextLesson(childId: string | null, subject: string) {
  for (const m of MODULES[subject] ?? []) {
    const states = await getLessonStates(childId, subject, m.id);
    const next = states.find((s) => !s.done);
    if (next) return { moduleId: m.id, lessonId: next.id, moduleName: m.en };
  }
  return null;
}

/** Overall summary across all three strands. */
export async function getOverallSummary(childId: string | null) {
  const out: Record<string, Awaited<ReturnType<typeof getSubjectSummary>>> = {};
  for (const s of SUBJECTS) out[s.id] = await getSubjectSummary(childId, s.id);
  return out;
}
