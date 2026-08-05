#!/usr/bin/env node
/**
 * Runs the rule tests.
 *
 * `lib/data/rules.ts` and `lib/clipKey.ts` are deliberately free of React
 * Native, Expo and storage imports, so they can be compiled alone and
 * exercised in plain node — no
 * Jest, no react-native preset, no extra dependencies to keep in step with the
 * Expo SDK. This script compiles them to `.tmp-test/` with the project's own
 * TypeScript (see tsconfig.test.json), runs `node --test` against them, and cleans up.
 *
 *   npm test
 */
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import process from "node:process";

const OUT = ".tmp-test";
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });

rmSync(OUT, { recursive: true, force: true });

try {
  run("npx", ["tsc", "-p", "tsconfig.test.json"]);
  run("node", ["--test", "tools/rules.test.mjs", "tools/clipkey.test.mjs"]);
} catch {
  // execFileSync has already streamed the failure; don't bury it in a stack.
  rmSync(OUT, { recursive: true, force: true });
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
