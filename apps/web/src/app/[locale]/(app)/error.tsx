"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@winnow/ui/components/error-state";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title={t("title")}
      description={t("description")}
      retryLabel={t("retry")}
      onRetry={retry}
    />
  );
}
