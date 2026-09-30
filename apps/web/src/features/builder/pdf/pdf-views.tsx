"use client";

import { Skeleton } from "@winnow/ui/components/skeleton";
import dynamic from "next/dynamic";

function PreviewFallback() {
  return <Skeleton className="h-full min-h-64 w-full" />;
}

function DownloadFallback() {
  return <Skeleton className="h-7 w-28" />;
}

export const ResumePdfPreview = dynamic(
  () => import("./pdf-client").then((mod) => mod.ResumePdfPreview),
  { ssr: false, loading: PreviewFallback },
);

export const ResumePdfDownload = dynamic(
  () => import("./pdf-client").then((mod) => mod.ResumePdfDownload),
  { ssr: false, loading: DownloadFallback },
);
