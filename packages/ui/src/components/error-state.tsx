"use client"

import { Button } from "@winnow/ui/components/button"

export function ErrorState({
  title = "Something went wrong",
  description = "This screen could not be loaded.",
  retryLabel = "Try again",
  onRetry,
}: {
  title?: string
  description?: string
  retryLabel?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
    >
      <div className="space-y-1">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}
