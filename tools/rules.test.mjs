import test from "node:test";
import assert from "node:assert/strict";

import {
  PASS_MARK, EXCELLENT_MARK, FAIL_STREAK_FOR_HELP,
  starsFor, isPass, applyAttempt, applyMastery, percentage,
  isAlwaysOpen, lockStates, moduleLockStates,
} from "../.tmp-test/lib/data/rules.js";

const NOW = 1_700_000_000_000;

test("a completed attempt always earns at least one star", () => {
  // §3.5: there are no fail states. Zero stars for finishing a lesson would
  // tell a child their work was worth nothing.
  assert.equal(starsFor(0), 1);
  assert.equal(starsFor(0.5), 1);
  assert.equal(starsFor(PASS_MARK - 0.01), 1);
});

test("two stars at the pass mark, three only for near-perfect", () => {
  assert.equal(starsFor(PASS_MARK), 2);
  assert.equal(starsFor(0.8), 2);
  assert.equal(starsFor(EXCELLENT_MARK - 0.01), 2);
  assert.equal(starsFor(EXCELLENT_MARK), 3);
  assert.equal(starsFor(1), 3);
});

test("the pass mark is inclusive", () => {
  assert.equal(isPass(PASS_MARK), true);
  assert.equal(isPass(PASS_MARK - 0.0001), false);
});

test("a first attempt records the score it earned", () => {
  const a = applyAttempt(undefined, 0.95, NOW);
  assert.deepEqual(a, { stars: 3, bestScore: 0.95, attempts: 1, completedAt: NOW });
});

test("a failed first attempt is recorded but not completed", () => {
  const a = applyAttempt(undefined, 0.4, NOW);
  assert.equal(a.stars, 1);
  assert.equal(a.completedAt, undefined);
  assert.equal(a.attempts, 1);
});

test("a worse retry never takes stars away", () => {
  // The behaviour that matters most in this file: a child who tries again and
  // does worse must not be punished for having tried.
  const first = applyAttempt(undefined, 1, NOW);
  const second = applyAttempt(first, 0.2, NOW + 1000);
  assert.equal(second.stars, 3);
  assert.equal(second.bestScore, 1);
  assert.equal(second.attempts, 2);
});

test("a better retry raises stars", () => {
  const first = applyAttempt(undefined, 0.5, NOW);
  const second = applyAttempt(first, 0.95, NOW + 1000);
  assert.equal(second.stars, 3);
  assert.equal(second.bestScore, 0.95);
});

test("completion is stamped once and never moved or cleared", () => {
  const pass = applyAttempt(undefined, 0.8, NOW);
  const laterPass = applyAttempt(pass, 0.9, NOW + 50_000);
  assert.equal(laterPass.completedAt, NOW, "the original completion date must stand");

  const laterFail = applyAttempt(pass, 0.1, NOW + 90_000);
  assert.equal(laterFail.completedAt, NOW, "failing a retry must not un-complete a lesson");
});

test("a lesson first failed, then passed, completes at the passing attempt", () => {
  const failed = applyAttempt(undefined, 0.3, NOW);
  const passed = applyAttempt(failed, 0.75, NOW + 1000);
  assert.equal(passed.completedAt, NOW + 1000);
  assert.equal(passed.attempts, 2);
});

test("mastery counts every attempt but credits only passes", () => {
  let m = applyMastery(undefined, true);
  assert.deepEqual(m, { correct: 1, total: 1, failStreak: 0, needsHelp: false });
  m = applyMastery(m, false);
  assert.equal(m.correct, 1);
  assert.equal(m.total, 2);
});

test("the needs-help flag raises on consecutive failures, not scattered ones", () => {
  let m = applyMastery(undefined, false);
  assert.equal(m.needsHelp, false, "one failure is not a pattern");
  m = applyMastery(m, false);
  assert.equal(m.needsHelp, true);
  assert.equal(m.failStreak, FAIL_STREAK_FOR_HELP);
});

test("a pass clears the flag without a facilitator dismissing it", () => {
  let m = applyMastery(applyMastery(undefined, false), false);
  assert.equal(m.needsHelp, true);
  m = applyMastery(m, true);
  assert.equal(m.needsHelp, false);
  assert.equal(m.failStreak, 0);
});

test("alternating pass and fail never raises the flag", () => {
  let m;
  for (const passed of [false, true, false, true, false, true]) m = applyMastery(m, passed);
  assert.equal(m.needsHelp, false);
});

test("percentage answers zero for nothing attempted rather than dividing by zero", () => {
  assert.equal(percentage(0, 0), 0);
  assert.equal(percentage(1, 3), 33);
  assert.equal(percentage(2, 3), 67);
  assert.equal(percentage(3, 3), 100);
});

test("hygiene is the flat, always-open strand", () => {
  assert.equal(isAlwaysOpen("hygiene"), true);
  assert.equal(isAlwaysOpen("literacy"), false);
  assert.equal(isAlwaysOpen("numeracy"), false);
});

test("the first lesson is always open", () => {
  assert.deepEqual(lockStates([false, false, false], false), [false, true, true]);
});

test("passing a lesson opens exactly the next one", () => {
  assert.deepEqual(lockStates([true, false, false], false), [false, false, true]);
  assert.deepEqual(lockStates([true, true, false], false), [false, false, false]);
});

test("hygiene lessons are all open regardless of progress", () => {
  assert.deepEqual(lockStates([false, false, false, false], true), [false, false, false, false]);
});

test("a gap in progress still locks what follows it", () => {
  // A child cannot have passed lesson 3 without 2, but stored data can be
  // repaired or partially restored; the lock must follow the lesson before it.
  assert.deepEqual(lockStates([true, false, true], false), [false, false, true]);
});

test("a module opens once one lesson of the previous module is passed", () => {
  assert.deepEqual(moduleLockStates([0, 0, 0], false), [false, true, true]);
  assert.deepEqual(moduleLockStates([1, 0, 0], false), [false, false, true]);
  assert.deepEqual(moduleLockStates([6, 1, 0], false), [false, false, false]);
});

test("finishing a whole module is not required to see the next", () => {
  const partial = moduleLockStates([1, 0, 0, 0, 0], false);
  assert.equal(partial[1], false, "one passed lesson is enough to open the next module");
});

test("hygiene modules are all open", () => {
  assert.deepEqual(moduleLockStates([0, 0, 0, 0, 0], true), [false, false, false, false, false]);
});

test("empty lists do not throw", () => {
  assert.deepEqual(lockStates([], false), []);
  assert.deepEqual(moduleLockStates([], false), []);
});
