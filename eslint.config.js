// ESLint 9 flat config. The project shipped an `expo lint` script but no
// config file, so linting failed outright on every run.
const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: ["node_modules/**", ".expo/**", ".tmp-test/**", "dist/**", "web-build/**", "android/**", "ios/**"],
  },
  {
    // The rule tests import `lib/data/rules.ts` compiled to `.tmp-test/`,
    // which exists only while `npm test` is running. The import is real; it
    // just cannot be resolved from a clean tree.
    files: ["tools/*.test.mjs"],
    rules: { "import/no-unresolved": "off" },
  },
];
