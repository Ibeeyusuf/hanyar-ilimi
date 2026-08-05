/**
 * The rules of the app, with no storage attached (PRD §3.1, §3.4, §3.5).
 *
 * These four decisions — what a score is worth, whether it passes, when a
 * child is flagged for help, and what is locked — are the ones a funder will
 * be shown and the ones a facilitator will act on. They were previously
 * inlined among AsyncStorage reads and writes, which meant the only way to
 * check them was to run the app and play through a lesson.
 *
 * Everything here is a pure function of its arguments so `npm test` can
 * exercise it directly. The repositories in progress.ts / lessonState.ts are
 * responsible for persistence and call into these; the rules themselves live
 * only here, so there is one place to change a threshold and one place to read
 * to find out what a threshold is.
 */

/** A quiz score at or above this passes the lesson and unlocks the next. */
export const PASS_MARK = 0.7;

/** Three stars are for near-perfect work, not merely passing. */
export const EXCELLENT_MARK = 0.9;

/** Failing the same skill this many times in a row raises a needs-help flag. */
export const FAIL_STREAK_FOR_HELP = 2;

/**
 * Stars for a score. A completed attempt always earns at least one: there are
 * no fail states in this app (§3.5), and a child who finishes a lesson has
 * done something worth marking even if they got it wrong.
 */
export function starsFor(score: number): number {
  if (score >= EXCELLENT_MARK) return 3;
  if (score >= PASS_MARK) return 2;
  return 1;
}

export function isPass(score: number): boolean {
  return score >= PASS_MARK;
}

/**
 * Merge a new attempt into an existing record. Stars and best score only ever
 * increase (§3.5) — a child who does worse on a retry must not be punished for
 * having tried again — and `completedAt` is set on the first pass and never
 * cleared.
 */
export type AttemptRecord = { stars: number; bestScore: number; attempts: number; completedAt?: number };

export function applyAttempt(
  previous: AttemptRecord | undefined,
  score: number,
  now: number
): AttemptRecord {
  const stars = starsFor(score);
  const passed = isPass(score);
  if (!previous) {
    return { stars, bestScore: score, attempts: 1, completedAt: passed ? now : undefined };
  }
  return {
    stars: Math.max(previous.stars, stars),
    bestScore: Math.max(previous.bestScore, score),
    attempts: previous.attempts + 1,
    completedAt: previous.completedAt ?? (passed ? now : undefined),
  };
}

/**
 * Update one skill's mastery counters after an attempt. A pass clears the fail
 * streak and the flag — a child who has got it should stop being flagged
 * without a facilitator having to dismiss anything.
 */
export type MasteryCounters = { correct: number; total: number; failStreak: number; needsHelp: boolean };

export function applyMastery(previous: MasteryCounters | undefined, passed: boolean): MasteryCounters {
  const m = previous ?? { correct: 0, total: 0, failStreak: 0, needsHelp: false };
  if (passed) {
    return { correct: m.correct + 1, total: m.total + 1, failStreak: 0, needsHelp: false };
  }
  const failStreak = m.failStreak + 1;
  return {
    correct: m.correct,
    total: m.total + 1,
    failStreak,
    needsHelp: failStreak >= FAIL_STREAK_FOR_HELP,
  };
}

/** Percentage, rounded, with an explicit answer for "nothing attempted yet". */
export function percentage(part: number, whole: number): number {
  return whole ? Math.round((part / whole) * 100) : 0;
}

/**
 * Hygiene is a flat list with everything open (§3.1): a child should be able
 * to learn to wash their hands on their first day without first working
 * through a lesson sequence. The academic strands unlock in order.
 */
export function isAlwaysOpen(subject: string): boolean {
  return subject === "hygiene";
}

/**
 * Lock state for an ordered list of lessons. Item N is open once N-1 has been
 * passed; the first is always open.
 */
export function lockStates(passed: boolean[], alwaysOpen: boolean): boolean[] {
  let previousPassed = true;
  return passed.map((done) => {
    const locked = alwaysOpen ? false : !previousPassed;
    previousPassed = done;
    return locked;
  });
}

/**
 * Lock state for modules. A module opens once the child has passed at least
 * one lesson of the module before it — finishing an entire module should not
 * be required to look at the next one.
 */
export function moduleLockStates(lessonsPassedPerModule: number[], alwaysOpen: boolean): boolean[] {
  let previousStarted = true;
  return lessonsPassedPerModule.map((done) => {
    const locked = alwaysOpen ? false : !previousStarted;
    previousStarted = done > 0;
    return locked;
  });
}
