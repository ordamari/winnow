# T10: Onboarding: import an existing resume PDF into the bank

**Phase:** 1 · **Depends on:** T09.5 · **Size:** M

## Goal

Solve cold start for new users: upload the resume(s) they already have and get a draft bank in minutes.

## Principle check

This is _extraction_ of the user's own text, not generation. The LLM may split and classify existing sentences into slots, but must copy text verbatim. Enforce with a post-check (each extracted string must appear in the source text, allowing whitespace/bullet-char normalization).

## Scope

- Upload one or more PDFs (or paste text). Multiple resumes → the same bullet in different wordings becomes versions of one slot.
- Server: PDF text extraction → LLM structured output mapping to the bank schema (experience, bullets, summary, skills, education).
- Verbatim check; flag anything that fails it instead of importing it silently.
- Review screen: side-by-side source vs. parsed draft, accept/edit/merge before writing to the bank.
- Duplicate detection across uploads (similar bullets → suggest merging as versions).

## Out of scope

LinkedIn profile import (possible later via the extension).

## Decisions (resolve in Plan mode)

- PDF text extraction library (e.g. `unpdf`/`pdfjs`) vs. sending the PDF to a multimodal model.
- How similarity for "merge as versions" is computed (embeddings from T24 or LLM grouping in the same call).
- Whether this counts against AI quota (probably free once, as onboarding).

## Acceptance criteria

- Uploading your real resume yields a bank needing only minor fixes.
- No imported string fails the verbatim check without being flagged.

## Decisions log

- **Text first.** `unpdf` extracts a text layer on the server. A PDF with no text layer returns an error so the user can paste. The PDF is not sent to a model and is not stored.
- **Grouping.** The extraction call groups paraphrases as versions of one slot, including against bullets already in the bank. Exact duplicates are dropped in code after whitespace and bullet-character normalization. Embeddings stay in T24.
- **Quota.** Import is free until T33. Caps: 3 files, 4 MB each, 8 pages total, 60,000 characters of text. A separate in-memory per-IP limit sits next to the tailor limiter. The call is named `resume-import`. No credit counter.
