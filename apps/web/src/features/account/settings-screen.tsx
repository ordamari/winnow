"use client";

import { Button } from "@winnow/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@winnow/ui/components/card";
import { ConfirmDialog } from "@winnow/ui/components/confirm-dialog";
import { EmptyState } from "@winnow/ui/components/empty-state";
import { FieldError } from "@winnow/ui/components/field";
import { Input } from "@winnow/ui/components/input";
import { PageHeader } from "@winnow/ui/components/page-header";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import {
  deleteAccount,
  issueExtensionCode,
  type ProfileInput,
  revokeAllSessions,
  unlinkConnectedAccount,
} from "@/server/auth/actions";

import { ProfileForm } from "./profile-form";

type ConnectedAccount = {
  id: string;
  providerId: string;
};

export function SettingsScreen({
  title,
  email,
  profile,
  accounts,
  google,
  github,
}: {
  title: string;
  email: string;
  profile: ProfileInput;
  accounts: ConnectedAccount[];
  google: boolean;
  github: boolean;
}) {
  const t = useTranslations("settingsPage");
  const router = useRouter();
  const [rows, setRows] = useState(accounts);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codePending, setCodePending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dangerError, setDangerError] = useState<string | null>(null);

  const methodCount = rows.length + 1;
  const linked = new Set(rows.map((row) => row.providerId));

  async function unlink(accountId: string) {
    setUnlinking(accountId);
    setAccountError(null);
    const result = await unlinkConnectedAccount(accountId);
    setUnlinking(null);
    if (!result.ok) {
      setAccountError(result.error === "stale" ? t("stale") : t("unlinkError"));
      return;
    }
    setRows((current) => current.filter((row) => row.id !== accountId));
  }

  async function connect(provider: "google" | "github") {
    setAccountError(null);
    const result = await authClient.linkSocial({
      provider,
      callbackURL: "/settings",
    });
    if (result.error) setAccountError(t("unlinkError"));
  }

  async function generateCode() {
    setCodePending(true);
    setCodeError(null);
    setCopied(false);
    const result = await issueExtensionCode();
    setCodePending(false);
    if (!result.ok || !("code" in result)) {
      setCodeError(
        !result.ok && result.error === "stale" ? t("stale") : t("codeError"),
      );
      return;
    }
    setCode(result.code);
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <PageHeader title={title} />
      <div className="flex max-w-xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("profileTitle")}</CardTitle>
            <CardDescription>{t("profileDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm mode="settings" email={email} initial={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("accountsTitle")}</CardTitle>
            <CardDescription>{t("accountsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span>{t("emailMethod")}</span>
              <span className="text-muted-foreground">{email}</span>
            </div>
            {rows.length === 0 ? (
              <EmptyState
                title={t("accountsEmpty")}
                description={t("accountsDescription")}
              />
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="capitalize">{row.providerId}</span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={methodCount <= 1 || unlinking === row.id}
                    onClick={() => unlink(row.id)}
                  >
                    {unlinking === row.id ? t("unlinking") : t("unlink")}
                  </Button>
                </div>
              ))
            )}
            {google && !linked.has("google") ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => connect("google")}
              >
                {t("connectGoogle")}
              </Button>
            ) : null}
            {github && !linked.has("github") ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => connect("github")}
              >
                {t("connectGithub")}
              </Button>
            ) : null}
            {accountError ? <FieldError>{accountError}</FieldError> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("extensionTitle")}</CardTitle>
            <CardDescription>{t("extensionDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button type="button" disabled={codePending} onClick={generateCode}>
              {codePending ? t("generating") : t("generateCode")}
            </Button>
            {code ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">{t("codeHelp")}</p>
                <div className="flex gap-2">
                  <Input readOnly value={code} aria-label={t("generateCode")} />
                  <Button type="button" variant="outline" onClick={copyCode}>
                    {copied ? t("copied") : t("copy")}
                  </Button>
                </div>
              </div>
            ) : null}
            {codeError ? <FieldError>{codeError}</FieldError> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sessionsTitle")}</CardTitle>
            <CardDescription>{t("sessionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSessionOpen(true)}
            >
              {t("signOutEverywhere")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("deleteTitle")}</CardTitle>
            <CardDescription>{t("deleteDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              {t("delete")}
            </Button>
            {dangerError ? <FieldError>{dangerError}</FieldError> : null}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={sessionOpen}
        onOpenChange={setSessionOpen}
        title={t("signOutEverywhereTitle")}
        description={t("signOutEverywhereDescription")}
        confirmLabel={t("confirm")}
        cancelLabel={t("cancel")}
        onConfirm={() => {
          void (async () => {
            const result = await revokeAllSessions();
            if (!result.ok) {
              setDangerError(
                result.error === "stale" ? t("stale") : t("error"),
              );
              return;
            }
            router.replace("/sign-in");
          })();
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        destructive
        onConfirm={() => {
          void (async () => {
            const result = await deleteAccount();
            if (!result.ok) {
              setDangerError(
                result.error === "stale" ? t("stale") : t("deleteError"),
              );
              return;
            }
            router.replace("/sign-in");
          })();
        }}
      />
    </>
  );
}
