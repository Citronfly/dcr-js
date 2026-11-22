import { defineConfig } from "vitest/config";
import { quickpickle } from "quickpickle";

// happy-dom has no SVGTransformList.consolidate(), which diagram-js calls from an
// event listener while rendering. The modeler tests pass; only this known
// environment gap is ignored, every other unhandled error still fails the run.
const isHappyDomSvgGap = (error: { message?: string }) =>
  error.message?.includes("transformList.consolidate is not a function") ?? false;

export default defineConfig({
  test: {
    onUnhandledError: (error) => !isHappyDomSvgGap(error),
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "html", "json-summary", "lcov"],
      include: ["dcr-engine/src/**/*.ts", "dcr-engine/index.ts", "app/src/**/*.{ts,tsx}", "modeler/lib/**/*.js"],
      exclude: ["dcr-engine/src/extraction/**", "dcr-engine/src/prompts/**", "**/*.test.*", "app/src/test/**"],
      // Ratchet: the measured value rounded down. Raise when adding tests, never lower.
      thresholds: {
        "dcr-engine/**": { lines: 31, statements: 30, functions: 31, branches: 27 },
        "app/src/**": { lines: 0, statements: 0, functions: 0, branches: 0 },
        "modeler/lib/**": { lines: 18, statements: 18, functions: 15, branches: 3 },
      },
    },
    projects: [
      {
        test: {
          name: "engine-unit",
          root: "./dcr-engine",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        plugins: [quickpickle()],
        test: {
          name: "engine-features",
          root: "./dcr-engine",
          environment: "node",
          include: ["features/**/*.feature"],
          setupFiles: ["features/steps/dcr.steps.ts"],
        },
      },
      "app/vitest.config.ts",
      "modeler/vitest.config.js",
    ],
  },
});
