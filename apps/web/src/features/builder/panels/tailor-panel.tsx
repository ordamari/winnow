"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { buildTailorCatalog, OPENAI_MODELS, type OpenAIModelId } from "@winnow/core";
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

import { tailorResumeAction, type TailorActionError } from "../actions";
import { useBuilderStore } from "../store/builder-store";
import { SectionHeading } from "./section-heading";

const errorKeys: Record<TailorActionError, "errors.missingKey" | "errors.emptyJd" | "errors.noResult" | "errors.unknown"> = {
  "missing-key": "errors.missingKey",
  "empty-jd": "errors.emptyJd",
  "no-result": "errors.noResult",
  unknown: "errors.unknown",
};

export function TailorPanel({ hasApiKey }: { hasApiKey: boolean }) {
  const t = useTranslations("builder");
  const [model, setModel] = useState<OpenAIModelId>("gpt-5.6-terra");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [hideJdMatch, setHideJdMatch] = useState(false);
  const bank = useBuilderStore((state) => state.bank);
  const selections = useBuilderStore((state) => state.selections);
  const jdMatch = useBuilderStore((state) => state.jdMatch);
  const applyContentSelections = useBuilderStore(
    (state) => state.applyContentSelections
  );

  const handleApply = async () => {
    if (!bank) return;
    setStatus("loading");
    setMessage("");
    const catalog = buildTailorCatalog(bank, selections);
    const response = await tailorResumeAction({
      jobDescription,
      model,
      catalog,
    });
    if (!response.ok) {
      setStatus("error");
      setMessage(t(errorKeys[response.error]));
      return;
    }
    applyContentSelections(response.result);
    setHideJdMatch(false);
    setStatus("success");
    setMessage(t("applied"));
  };

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
          disabled={status === "loading"}
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
          disabled={status === "loading"}
          className="min-h-44 text-xs leading-relaxed"
          aria-label={t("jobDescription")}
        />
      </section>

      <Button
        type="button"
        className="w-full"
        onClick={handleApply}
        disabled={status === "loading" || !jobDescription.trim() || !hasApiKey}
      >
        {status === "loading" ? t("tailoring") : t("apply")}
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

      {message ? (
        <p
          className={
            status === "error"
              ? "text-xs leading-relaxed text-destructive"
              : status === "success"
                ? "text-xs leading-relaxed text-emerald-700 dark:text-emerald-400"
                : "text-xs leading-relaxed text-muted-foreground"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
