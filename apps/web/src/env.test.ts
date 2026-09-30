import { describe, expect, it } from "vitest";

import { createWinnowEnv } from "./env";

describe("createWinnowEnv", () => {
  it("fails a preview build when the Sentry DSN is missing", () => {
    expect(() => createWinnowEnv({ VERCEL_ENV: "preview" })).toThrow(
      /Invalid environment variables/,
    );
  });

  it("allows a local build without a Sentry DSN", () => {
    expect(createWinnowEnv({}).NEXT_PUBLIC_SENTRY_DSN).toBeUndefined();
  });
});
