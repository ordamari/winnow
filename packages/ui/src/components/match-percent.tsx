import { cn } from "cn"

export function MatchPercent({
  value,
  reason,
  matchLabel = "Match",
}: {
  value: number
  reason?: string
  matchLabel?: string
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)))
  const tone =
    percent >= 70
      ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100"
      : percent >= 40
        ? "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100"
        : "bg-muted text-muted-foreground"

  return (
    <span className="inline-flex min-w-0 flex-col gap-0.5">
      <span
        className={cn(
          "w-fit rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums leading-none",
          tone
        )}
      >
        <span className="sr-only">{matchLabel} </span>
        {percent}%
      </span>
      {reason ? (
        <span className="text-[10px] leading-snug text-muted-foreground">
          {reason}
        </span>
      ) : null}
    </span>
  )
}
