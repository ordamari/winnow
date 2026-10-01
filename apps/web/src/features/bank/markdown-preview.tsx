"use client";

import { safeMarkdownUrl } from "@winnow/core";
import ReactMarkdown from "react-markdown";

export function MarkdownPreview({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="text-xs leading-snug text-foreground [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_em]:italic [&_p]:m-0 [&_strong]:font-semibold">
      <ReactMarkdown
        urlTransform={(url) => safeMarkdownUrl(url) ?? ""}
        components={{
          a: ({ href, children }) =>
            href ? (
              <a href={href} rel="noreferrer" target="_blank">
                {children}
              </a>
            ) : (
              <span>{children}</span>
            ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
