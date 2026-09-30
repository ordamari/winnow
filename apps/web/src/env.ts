import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

type RuntimeEnv = Record<string, string | undefined>;

export function createWinnowEnv(runtime: RuntimeEnv = process.env) {
  const requireDsn =
    runtime.VERCEL_ENV === "preview" || runtime.VERCEL_ENV === "production";

  return createEnv({
    server: {
      OPENAI_API_KEY: z.string().min(1).optional(),
      SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
      SENTRY_ORG: z.string().min(1).optional(),
      SENTRY_PROJECT: z.string().min(1).optional(),
      DATABASE_URL: z.string().min(1).optional(),
      DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
    },
    client: {
      NEXT_PUBLIC_SENTRY_DSN: requireDsn
        ? z.string().min(1)
        : z.string().min(1).optional(),
    },
    runtimeEnv: {
      OPENAI_API_KEY: runtime.OPENAI_API_KEY,
      SENTRY_AUTH_TOKEN: runtime.SENTRY_AUTH_TOKEN,
      SENTRY_ORG: runtime.SENTRY_ORG,
      SENTRY_PROJECT: runtime.SENTRY_PROJECT,
      DATABASE_URL: runtime.DATABASE_URL,
      DATABASE_URL_UNPOOLED: runtime.DATABASE_URL_UNPOOLED,
      NEXT_PUBLIC_SENTRY_DSN: runtime.NEXT_PUBLIC_SENTRY_DSN,
    },
    emptyStringAsUndefined: true,
    onValidationError: (issues) => {
      throw new Error(
        `Invalid environment variables: ${JSON.stringify(issues)}`,
      );
    },
  });
}

export const env = createWinnowEnv();
