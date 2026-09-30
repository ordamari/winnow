import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...Object.fromEntries(
        Object.entries(process.env).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      ),
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgres://winnow:winnow@localhost:5432/winnow",
      DATABASE_URL_UNPOOLED:
        process.env.DATABASE_URL_UNPOOLED ??
        process.env.DATABASE_URL ??
        "postgres://winnow:winnow@localhost:5432/winnow",
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ??
        "e2e-better-auth-secret-at-least-32-chars",
      BETTER_AUTH_URL: "http://127.0.0.1:3000",
      E2E_TEST: "1",
    },
  },
});
