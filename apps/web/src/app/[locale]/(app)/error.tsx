"use client";

import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@winnow/ui/components/error-state";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorState
      title={t("title")}
      description={t("description")}
      retryLabel={t("retry")}
      onRetry={reset}
    />
  );
}
