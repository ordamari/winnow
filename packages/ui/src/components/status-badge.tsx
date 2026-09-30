import { Badge } from "@winnow/ui/components/badge"
import { cn } from "cn"

export const applicationStatuses = [
  "saved",
  "applied",
  "screening",
  "technical",
  "home-assignment",
  "final",
  "offer",
  "accepted",
  "rejected",
  "ghosted",
  "withdrawn",
] as const

export type ApplicationStatus = (typeof applicationStatuses)[number]

const labels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  technical: "Technical",
  "home-assignment": "Home assignment",
  final: "Final",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
}

const tones: Record<ApplicationStatus, string> = {
  saved: "border-transparent bg-muted text-muted-foreground",
  applied: "border-transparent bg-secondary text-secondary-foreground",
  screening:
    "border-transparent bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100",
  technical:
    "border-transparent bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-100",
  "home-assignment":
    "border-transparent bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-100",
  final: "border-transparent bg-primary/15 text-primary",
  offer:
    "border-transparent bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100",
  accepted:
    "border-transparent bg-emerald-800 text-white dark:bg-emerald-300 dark:text-emerald-950",
  rejected: "border-transparent bg-muted text-muted-foreground",
  ghosted: "border-transparent bg-muted text-muted-foreground",
  withdrawn: "border-transparent bg-muted text-muted-foreground",
}

export function StatusBadge({
  status,
  label,
}: {
  status: ApplicationStatus
  label?: string
}) {
  return (
    <Badge variant="outline" className={cn(tones[status])}>
      {label ?? labels[status]}
    </Badge>
  )
}
