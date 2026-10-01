"use client";

import { markdownPlainText } from "@winnow/core";
import { cn } from "cn";

import { useBuilderStore } from "../store/builder-store";
import { SectionHeading } from "./section-heading";

export function SummarySection({ title }: { title: string }) {
  const bank = useBuilderStore((state) => state.bank);
  const selectedId = useBuilderStore(
    (state) =>
      state.selections.selectedVersionById[state.bank?.summary.id ?? ""],
  );
  const setVersion = useBuilderStore((state) => state.setVersion);

  if (!bank) return null;

  return (
    <section>
      <SectionHeading>{title}</SectionHeading>
      <div className="space-y-2">
        {bank.summary.versions.map((version) => {
          const selected = selectedId === version.id;
          return (
            <label
              key={version.id}
              className={cn(
                "flex cursor-pointer items-start gap-2 rounded-lg border p-2",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-ring",
              )}
            >
              <input
                type="radio"
                name={bank.summary.id}
                checked={selected}
                onChange={() => setVersion(bank.summary.id, version.id)}
                className="mt-0.5 accent-primary"
              />
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {version.label}
                </span>
                <span className="text-xs leading-tight text-muted-foreground">
                  {markdownPlainText(version.text)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
