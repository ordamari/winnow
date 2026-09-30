"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { buttonVariants } from "@winnow/ui/components/button";

import { ResumePDF, type ResumePDFProps } from "./resume-pdf";

export function ResumePdfPreview({
  documentProps,
}: {
  documentProps: ResumePDFProps;
}) {
  return (
    <div className="h-full min-h-0">
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <ResumePDF {...documentProps} />
      </PDFViewer>
    </div>
  );
}

export function ResumePdfDownload({
  documentProps,
  fileName,
  label,
  preparingLabel,
}: {
  documentProps: ResumePDFProps;
  fileName: string;
  label: string;
  preparingLabel: string;
}) {
  return (
    <PDFDownloadLink
      key={fileName}
      document={<ResumePDF {...documentProps} />}
      fileName={fileName}
      className={buttonVariants({ size: "sm" })}
    >
      {({ loading }) => (loading ? preparingLabel : label)}
    </PDFDownloadLink>
  );
}
