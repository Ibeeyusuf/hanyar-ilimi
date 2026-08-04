/**
 * PRD FR-6.1 — question order and distractor positions are randomised per
 * attempt, so a child can't learn "the answer is always the middle one".
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
