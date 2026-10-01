"use client";

import {
  formatPeriod,
  parsePeriod,
  PERIOD_MONTHS,
  type PeriodMonth,
} from "@winnow/core";
import { Checkbox } from "@winnow/ui/components/checkbox";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { useTranslations } from "next-intl";
import { useState } from "react";

const selectClass =
  "h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground";

export function PeriodField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const t = useTranslations("bank");
  const parsed = parsePeriod(value);
  const [startMonth, setStartMonth] = useState<PeriodMonth>(
    parsed?.startMonth ?? "JAN",
  );
  const [startYear, setStartYear] = useState(
    parsed ? String(parsed.startYear) : "",
  );
  const [present, setPresent] = useState(parsed?.present ?? true);
  const [endMonth, setEndMonth] = useState<PeriodMonth>(
    parsed?.endMonth ?? parsed?.startMonth ?? "JAN",
  );
  const [endYear, setEndYear] = useState(
    parsed && !parsed.present && parsed.endYear !== undefined
      ? String(parsed.endYear)
      : "",
  );
  const [trackedValue, setTrackedValue] = useState(value);

  if (value !== trackedValue) {
    setTrackedValue(value);
    const next = parsePeriod(value);
    if (next) {
      setStartMonth(next.startMonth);
      setStartYear(String(next.startYear));
      setPresent(next.present);
      setEndMonth(next.endMonth ?? next.startMonth);
      setEndYear(
        !next.present && next.endYear !== undefined ? String(next.endYear) : "",
      );
    }
  }

  if (value && !parsed) {
    return (
      <div className="space-y-1">
        <Label htmlFor="period-raw">{t("period")}</Label>
        <Input
          id="period-raw"
          value={value}
          onChange={(event) => onChange(event.target.value || undefined)}
        />
        <p className="text-[11px] text-muted-foreground">{t("rawPeriod")}</p>
      </div>
    );
  }

  function write(next: {
    startMonth: PeriodMonth;
    startYear: string;
    present: boolean;
    endMonth: PeriodMonth;
    endYear: string;
  }) {
    if (!/^\d{4}$/.test(next.startYear)) return;
    if (!next.present && !/^\d{4}$/.test(next.endYear)) return;
    onChange(
      formatPeriod({
        startMonth: next.startMonth,
        startYear: Number(next.startYear),
        present: next.present,
        endMonth: next.endMonth,
        endYear: next.present ? undefined : Number(next.endYear),
      }),
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs text-muted-foreground">{t("period")}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={t("startMonth")}
          className={selectClass}
          value={startMonth}
          onChange={(event) => {
            const month = event.target.value as PeriodMonth;
            setStartMonth(month);
            write({ startMonth: month, startYear, present, endMonth, endYear });
          }}
        >
          {PERIOD_MONTHS.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <Input
          aria-label={t("startYear")}
          className="w-24"
          inputMode="numeric"
          placeholder="2024"
          value={startYear}
          onChange={(event) => {
            const year = event.target.value;
            setStartYear(year);
            if (year === "") onChange(undefined);
            else
              write({
                startMonth,
                startYear: year,
                present,
                endMonth,
                endYear,
              });
          }}
        />
        <Label className="gap-2 text-xs font-normal">
          <Checkbox
            checked={present}
            onCheckedChange={(checked) => {
              const isPresent = checked === true;
              const nextEnd = endYear || startYear;
              setPresent(isPresent);
              if (!isPresent) setEndYear(nextEnd);
              write({
                startMonth,
                startYear,
                present: isPresent,
                endMonth,
                endYear: isPresent ? endYear : nextEnd,
              });
            }}
          />
          {t("present")}
        </Label>
      </div>
      {present ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t("endMonth")}
            className={selectClass}
            value={endMonth}
            onChange={(event) => {
              const month = event.target.value as PeriodMonth;
              setEndMonth(month);
              write({
                startMonth,
                startYear,
                present,
                endMonth: month,
                endYear,
              });
            }}
          >
            {PERIOD_MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <Input
            aria-label={t("endYear")}
            className="w-24"
            inputMode="numeric"
            placeholder="2025"
            value={endYear}
            onChange={(event) => {
              const year = event.target.value;
              setEndYear(year);
              write({
                startMonth,
                startYear,
                present,
                endMonth,
                endYear: year,
              });
            }}
          />
        </div>
      )}
    </fieldset>
  );
}
