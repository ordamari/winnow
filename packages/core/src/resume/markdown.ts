import type { Parent, PhrasingContent, Root, RootContent } from "mdast";
import { toString } from "mdast-util-to-string";
import { remark } from "remark";

/** Rough fit hint for default body type. Not a page-layout measurement. */
export const MARKDOWN_CHARS_PER_LINE = 100;

export type MarkdownRun =
  | { type: "text"; value: string }
  | { type: "bold"; children: MarkdownRun[] }
  | { type: "italic"; children: MarkdownRun[] }
  | { type: "code"; value: string }
  | { type: "link"; url: string; children: MarkdownRun[] }
  | { type: "break" };

export function safeMarkdownUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:"
    ) {
      return parsed.href;
    }
  } catch {
    return null;
  }
  return null;
}

export function markdownPlainText(source: string): string {
  return toString(remark().parse(source));
}

export function markdownLineHint(source: string): {
  characters: number;
  lines: number;
} {
  const characters = markdownPlainText(source).length;
  const lines =
    characters === 0 ? 0 : Math.ceil(characters / MARKDOWN_CHARS_PER_LINE);
  return { characters, lines };
}

function phrasing(node: PhrasingContent): MarkdownRun[] {
  switch (node.type) {
    case "text":
      return node.value ? [{ type: "text", value: node.value }] : [];
    case "strong":
      return [{ type: "bold", children: node.children.flatMap(phrasing) }];
    case "emphasis":
      return [{ type: "italic", children: node.children.flatMap(phrasing) }];
    case "inlineCode":
      return [{ type: "code", value: node.value }];
    case "break":
      return [{ type: "break" }];
    case "link": {
      const url = safeMarkdownUrl(node.url);
      const children = node.children.flatMap(phrasing);
      return url ? [{ type: "link", url, children }] : children;
    }
    case "image":
      return node.alt ? [{ type: "text", value: node.alt }] : [];
    default:
      if ("children" in node) {
        return (node.children as PhrasingContent[]).flatMap(phrasing);
      }
      if ("value" in node && typeof node.value === "string") {
        return [{ type: "text", value: node.value }];
      }
      return [];
  }
}

function block(node: RootContent): MarkdownRun[] {
  if (node.type === "paragraph" || node.type === "heading") {
    return node.children.flatMap(phrasing);
  }
  if (node.type === "list") {
    return node.children.flatMap((item, index) => {
      const runs = item.children.flatMap((child) => block(child));
      return index === 0 ? runs : [{ type: "break" }, ...runs];
    });
  }
  if ("children" in node) {
    return (node as Parent).children.flatMap((child) =>
      block(child as RootContent),
    );
  }
  return [];
}

/** CommonMark runs for the PDF. Unsafe link URLs stay as plain text. */
export function markdownRuns(source: string): MarkdownRun[] {
  const tree = remark().parse(source) as Root;
  const runs: MarkdownRun[] = [];
  tree.children.forEach((child, index) => {
    if (index > 0) runs.push({ type: "break" });
    runs.push(...block(child));
  });
  return runs;
}
