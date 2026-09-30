"use client";

import {
  buildTailorCatalog,
  OPENAI_MODELS,
  type OpenAIModelId,
  tailorResultSchema,
} from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { Label } from "@winnow/ui/components/label";
import { MatchPercent } from "@winnow/ui/components/match-percent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@winnow/ui/components/select";
import { Textarea } from "@winnow/ui/components/textarea";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { useBuilderStore } from "../store/builder-store";
import { SectionHeading } from "./section-heading";

const errorKeys = {
  "missing-key": "errors.missingKey",
  "empty-jd": "errors.emptyJd",
  "no-result": "errors.noResult",
  unknown: "errors.unknown",
  "invalid-input": "errors.invalidInput",
  "too-large": "errors.tooLarge",
  "rate-limited": "errors.rateLimited",
  "invalid-model": "errors.invalidModel",
} as const;

type TailorApiError = keyof typeof errorKeys;

const stageKeys = {
  preparing: "stagePreparing",
  calling: "stageCalling",
  applying: "stageApplying",
} as const;

type TailorStage = keyof typeof stageKeys;

function paint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function readErrorCode(payload: unknown): TailorApiError {
  if (!payload || typeof payload !== "object" || !("error" in payload)) {
    return "unknown";
  }
  const code = payload.error;
  if (typeof code === "string" && code in errorKeys) {
    return code as TailorApiError;
  }
  return "unknown";
}

export function TailorPanel({ hasApiKey }: { hasApiKey: boolean }) {
  const t = useTranslations("builder");
  const [model, setModel] = useState<OpenAIModelId>("gpt-5.6-terra");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [stage, setStage] = useState<TailorStage | null>(null);
  const [message, setMessage] = useState("");
  const [hideJdMatch, setHideJdMatch] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const bank = useBuilderStore((state) => state.bank);
  const selections = useBuilderStore((state) => state.selections);
  const jdMatch = useBuilderStore((state) => state.jdMatch);
  const applyContentSelections = useBuilderStore(
    (state) => state.applyContentSelections,
  );

  const resetIfCurrent = (id: number) => {
    if (requestId.current !== id) return;
    setStatus("idle");
    setStage(null);
    setMessage("");
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const handleApply = async () => {
    if (!bank) return;
    const id = ++requestId.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    setStage("preparing");
    setMessage("");

    try {
      await paint();
      if (controller.signal.aborted) {
        resetIfCurrent(id);
        return;
      }
      const catalog = buildTailorCatalog(bank, selections);
      setStage("calling");
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, model, catalog }),
        signal: controller.signal,
      });
      if (controller.signal.aborted || requestId.current !== id) {
        resetIfCurrent(id);
        return;
      }
      const payload: unknown = await response.json().catch(() => null);
      if (requestId.current !== id) return;
      if (!response.ok) {
        setStatus("error");
        setStage(null);
        setMessage(t(errorKeys[readErrorCode(payload)]));
        return;
      }
      const parsed = tailorResultSchema.safeParse(payload);
      if (!parsed.success) {
        setStatus("error");
        setStage(null);
        setMessage(t(errorKeys.unknown));
        return;
      }
      setStage("applying");
      await paint();
      if (controller.signal.aborted || requestId.current !== id) {
        resetIfCurrent(id);
        return;
      }
      applyContentSelections(parsed.data);
      setHideJdMatch(false);
      setStatus("success");
      setStage(null);
      setMessage(t("applied"));
    } catch (error) {
      if (requestId.current !== id) return;
      if (controller.signal.aborted || isAbortError(error)) {
        resetIfCurrent(id);
        return;
      }
      setStatus("error");
      setStage(null);
      setMessage(t(errorKeys.unknown));
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const loading = status === "loading";

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("tailorIntro")}
      </p>

      {!hasApiKey ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {t("missingKey")}
        </div>
      ) : null}

      <section className="space-y-2">
        <SectionHeading>{t("model")}</SectionHeading>
        <Label htmlFor="tailor-model" className="sr-only">
          {t("model")}
        </Label>
        <Select
          value={model}
          onValueChange={(value) => {
            if (value) setModel(value as OpenAIModelId);
          }}
          disabled={loading}
        >
          <SelectTrigger id="tailor-model" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPENAI_MODELS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="space-y-2">
        <SectionHeading>{t("jobDescription")}</SectionHeading>
        <Textarea
          value={jobDescription}
          onChange={(event) => {
            setJobDescription(event.target.value);
            setHideJdMatch(true);
            if (status !== "idle" && status !== "loading") {
              setStatus("idle");
              setMessage("");
            }
          }}
          placeholder={t("jobDescriptionPlaceholder")}
          rows={14}
          disabled={loading}
          className="min-h-44 text-xs leading-relaxed"
          aria-label={t("jobDescription")}
        />
      </section>

      <Button
        type="button"
        className="w-full"
        onClick={loading ? handleCancel : handleApply}
        disabled={!loading && (!jobDescription.trim() || !hasApiKey)}
      >
        {loading ? t("cancel") : t("apply")}
      </Button>

      {jdMatch && !hideJdMatch ? (
        <section className="rounded-lg border bg-muted/40 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t("jdMatch")}
            </h3>
            <MatchPercent
              value={jdMatch.matchPercent}
              matchLabel={t("match")}
            />
          </div>
          {jdMatch.reason ? (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {jdMatch.reason}
            </p>
          ) : null}
        </section>
      ) : null}

      {stage || message ? (
        <p
          aria-live="polite"
          className={
            status === "error"
              ? "text-xs leading-relaxed text-destructive"
              : status === "success"
                ? "text-xs leading-relaxed text-emerald-700 dark:text-emerald-400"
                : "inline-flex items-center gap-2 text-xs leading-relaxed text-muted-foreground"
          }
        >
          {stage ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              {t(stageKeys[stage])}
            </>
          ) : (
            message
          )}
        </p>
      ) : null}
    </div>
  );
}
