import "server-only";

import { Resend } from "resend";

import { env } from "@/env";

import { rememberMagicLink } from "./magic-link-outbox";

export async function sendMagicLinkEmail(email: string, url: string) {
  if (process.env.E2E_TEST === "1") {
    rememberMagicLink(email, url);
  }

  if (env.RESEND_API_KEY) {
    if (!env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is not set");
    }
    const resend = new Resend(env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Sign in to Winnow",
      text: `Sign in to Winnow: ${url}`,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`Magic link for ${email}: ${url}`);
    return;
  }

  if (process.env.E2E_TEST === "1") return;

  throw new Error("RESEND_API_KEY is not set");
}
