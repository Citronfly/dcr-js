import { defineConfig } from "vitest/config";

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
    ],
  },
});
