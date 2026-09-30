"use client";

import { Button } from "@winnow/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@winnow/ui/components/field";
import { Input } from "@winnow/ui/components/input";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

import { localePath } from "@/lib/app-paths";
import { authClient } from "@/lib/auth-client";

export function SignInForm({
  locale,
  nextPath,
  google,
  github,
}: {
  locale: string;
  nextPath: string;
  google: boolean;
  github: boolean;
}) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<"email" | "google" | "github" | null>(
    null,
  );
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const callbackURL = nextPath;
  const newUserCallbackURL = localePath(locale, "/onboarding");

  async function signInWith(provider: "google" | "github") {
    setPending(provider);
    setError(false);
    const result = await authClient.signIn.social({
      provider,
      callbackURL,
      newUserCallbackURL,
    });
    if (result.error) {
      setPending(null);
      setError(true);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("email");
    setError(false);
    const result = await authClient.signIn.magicLink({
      email,
      callbackURL,
      newUserCallbackURL,
    });
    setPending(null);
    if (result.error) {
      setError(true);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status">{t("checkEmail")}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
        >
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        {google ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={() => signInWith("google")}
          >
            {pending === "google" ? t("sending") : t("google")}
          </Button>
        ) : null}
        {github ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={() => signInWith("github")}
          >
            {pending === "github" ? t("sending") : t("github")}
          </Button>
        ) : null}
        {google || github ? <FieldSeparator>{t("or")}</FieldSeparator> : null}
        <Field>
          <FieldLabel htmlFor="sign-in-email">{t("email")}</FieldLabel>
          <Input
            id="sign-in-email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        {error ? <FieldError>{t("error")}</FieldError> : null}
        <Button type="submit" disabled={pending !== null}>
          {pending === "email" ? t("sending") : t("sendLink")}
        </Button>
      </FieldGroup>
    </form>
  );
}
