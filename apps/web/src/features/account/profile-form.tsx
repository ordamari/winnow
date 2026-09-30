"use client";

import { Button } from "@winnow/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@winnow/ui/components/field";
import { Input } from "@winnow/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@winnow/ui/components/select";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { type ProfileInput, saveProfile } from "@/server/auth/actions";

function errorMessage(
  t: (key: "invalid" | "stale" | "error") => string,
  code: "invalid" | "failed" | "stale",
) {
  if (code === "invalid") return t("invalid");
  if (code === "stale") return t("stale");
  return t("error");
}

export function ProfileForm({
  initial,
  email,
  mode,
}: {
  initial: ProfileInput;
  email?: string;
  mode: "onboarding" | "settings";
}) {
  const t = useTranslations("settingsPage");
  const account = useTranslations("account");
  const onboarding = useTranslations("onboarding");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function setField(key: keyof ProfileInput, value: string) {
    setSaved(false);
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const result = await saveProfile(values, mode);
    setPending(false);
    if (!result.ok) {
      setError(errorMessage(t, result.error));
      return;
    }
    if (mode === "onboarding") {
      router.replace("/builder");
      return;
    }
    setSaved(true);
    const nextLocale = routing.locales.find((item) => item === values.locale);
    if (nextLocale && nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
  }

  const submitLabel = pending
    ? mode === "onboarding"
      ? onboarding("saving")
      : t("saving")
    : mode === "onboarding"
      ? onboarding("continue")
      : t("save");

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        {email ? (
          <Field>
            <FieldLabel htmlFor="profile-email">{t("email")}</FieldLabel>
            <Input id="profile-email" value={email} readOnly />
          </Field>
        ) : null}
        <Field>
          <FieldLabel htmlFor="profile-name">{t("name")}</FieldLabel>
          <Input
            id="profile-name"
            value={values.name}
            required
            autoComplete="name"
            onChange={(event) => setField("name", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-title">{t("title")}</FieldLabel>
          <Input
            id="profile-title"
            value={values.title}
            autoComplete="organization-title"
            onChange={(event) => setField("title", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-phone">{t("phone")}</FieldLabel>
          <Input
            id="profile-phone"
            value={values.phone}
            autoComplete="tel"
            onChange={(event) => setField("phone", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-linkedin">{t("linkedin")}</FieldLabel>
          <Input
            id="profile-linkedin"
            value={values.linkedin}
            onChange={(event) => setField("linkedin", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-github">{t("github")}</FieldLabel>
          <Input
            id="profile-github"
            value={values.github}
            onChange={(event) => setField("github", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-timezone">{t("timezone")}</FieldLabel>
          <Input
            id="profile-timezone"
            value={values.timezone}
            required
            onChange={(event) => setField("timezone", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-locale">{t("locale")}</FieldLabel>
          <Select
            value={values.locale}
            onValueChange={(value) => {
              if (value === "en" || value === "he") setField("locale", value);
            }}
          >
            <SelectTrigger id="profile-locale" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{account("locales.en")}</SelectItem>
              <SelectItem value="he">{account("locales.he")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {error ? <FieldError>{error}</FieldError> : null}
        {saved ? (
          <p className="text-sm text-muted-foreground" role="status">
            {t("saved")}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
