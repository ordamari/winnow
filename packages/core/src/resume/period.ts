export const PERIOD_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export type PeriodMonth = (typeof PERIOD_MONTHS)[number];

export type ParsedPeriod = {
  startMonth: PeriodMonth;
  startYear: number;
  present: boolean;
  endMonth?: PeriodMonth;
  endYear?: number;
};

const MONTH = PERIOD_MONTHS.join("|");
const PERIOD_PATTERN = new RegExp(
  `^(${MONTH}) (\\d{4}) - (PRESENT|(${MONTH}) (\\d{4}))$`,
);

function isMonth(value: string): value is PeriodMonth {
  return (PERIOD_MONTHS as readonly string[]).includes(value);
}

export function parsePeriod(value: string | undefined): ParsedPeriod | null {
  if (!value) return null;
  const match = PERIOD_PATTERN.exec(value);
  if (!match) return null;
  const startMonth = match[1];
  const startYear = Number(match[2]);
  if (!startMonth || !isMonth(startMonth) || !Number.isInteger(startYear)) {
    return null;
  }
  if (match[3] === "PRESENT") {
    return { startMonth, startYear, present: true };
  }
  const endMonth = match[4];
  const endYear = Number(match[5]);
  if (!endMonth || !isMonth(endMonth) || !Number.isInteger(endYear)) {
    return null;
  }
  return {
    startMonth,
    startYear,
    present: false,
    endMonth,
    endYear,
  };
}

export function formatPeriod(period: ParsedPeriod): string {
  const start = `${period.startMonth} ${period.startYear}`;
  if (period.present || !period.endMonth || period.endYear === undefined) {
    return `${start} - PRESENT`;
  }
  return `${start} - ${period.endMonth} ${period.endYear}`;
}
