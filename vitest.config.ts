import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "core",
          environment: "node",
          include: ["packages/core/src/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "ui",
          environment: "jsdom",
          include: ["packages/ui/src/**/*.test.tsx"],
        },
      },
      {
        test: {
          name: "web",
          environment: "node",
          include: ["apps/web/src/**/*.test.ts"],
        },
      },
    ],
  },
});
