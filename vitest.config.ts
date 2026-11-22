import { defineConfig } from "vitest/config";
import { quickpickle } from "quickpickle";

export default defineConfig({
  test: {
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
    ],
  },
});
