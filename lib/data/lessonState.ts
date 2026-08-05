import { getProgress, LessonProgress } from "./index";
import { getLessons, MODULES, SUBJECTS } from "@/constants/content";
import { isAlwaysOpen, lockStates, moduleLockStates, percentage } from "./rules";

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

  const passed = lessons.map((l) => !!byLesson.get(`${moduleId}/${l.id}`)?.completedAt);
  const locks = lockStates(passed, isAlwaysOpen(subject));

  return lessons.map((l, i) => ({
    id: l.id, num: l.num, ha: l.ha, en: l.en,
    stars: byLesson.get(`${moduleId}/${l.id}`)?.stars ?? 0,
    done: passed[i],
    locked: locks[i],
  }));
}

/**
 * Real state for every module in a subject — percentage complete, stars, and
 * sequential unlock. Module cards previously read a hardcoded `progress`
 * number from content.ts, so they showed 75% to a child who had done nothing.
 * Module N opens once the child has passed at least one lesson of module N-1;
 * hygiene is flat and always open (PRD §3.1).
 */
export type ModuleState = { id: string; num: number; en: string; ha: string; icon?: string; percent: number; stars: number; locked: boolean };

export async function getModuleStates(childId: string | null, subject: string): Promise<ModuleState[]> {
  const mods = MODULES[subject] ?? [];
  const perModule: LessonState[][] = [];
  for (const m of mods) perModule.push(await getLessonStates(childId, subject, m.id));

  const donePerModule = perModule.map((states) => states.filter((s) => s.done).length);
  const locks = moduleLockStates(donePerModule, isAlwaysOpen(subject));

  return mods.map((m, i) => ({
    id: m.id, num: m.num, en: m.en, ha: m.ha, icon: m.icon,
    percent: percentage(donePerModule[i], perModule[i].length),
    stars: perModule[i].reduce((a, s) => a + s.stars, 0),
    locked: locks[i],
  }));
}

/** Percentage of a module's lessons the child has passed. */
export async function getModuleProgress(childId: string | null, subject: string, moduleId: string): Promise<number> {
  const states = await getLessonStates(childId, subject, moduleId);
  return percentage(states.filter((s) => s.done).length, states.length);
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
  return { done, total, stars, percent: percentage(done, total) };
}

export type SubjectSummary = Awaited<ReturnType<typeof getSubjectSummary>>;

/** The next lesson a child should continue with (PRD FR-4.1: resume). */
export async function getNextLesson(childId: string | null, subject: string) {
  for (const m of await getModuleStates(childId, subject)) {
    if (m.locked) break;                           // never resume into a locked module
    const states = await getLessonStates(childId, subject, m.id);
    const next = states.find((s) => !s.done && !s.locked);
    if (next) return { moduleId: m.id, lessonId: next.id, moduleName: m.en };
  }
  return null;
}

/** Overall summary across all three strands. */
export async function getOverallSummary(childId: string | null) {
  const out: Record<string, SubjectSummary> = {};
  for (const s of SUBJECTS) out[s.id] = await getSubjectSummary(childId, s.id);
  return out;
}
