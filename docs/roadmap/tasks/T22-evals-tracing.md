# T22: LLM evals, tracing & human-override capture

**Phase:** 3 · **Depends on:** T21, T13 · **Size:** M

## Goal

Make "a better-trained LLM" measurable. Before changing the tailor (T25), build the harness that proves each change is an improvement.

## Scope

- **Tracing**: every AI call traced (inputs, outputs, prompt version, model, latency, cost) in an observability tool.
- **Human-override capture**: after AI Tailor, record what the user changed before saving the version (bullets toggled on/off, version swaps, title changes). This is the best free training/eval signal you have.
- **Golden dataset**: N (start with 20–30) JD + bank pairs with the "ideal" final selection (from your own real applications and overrides).
- **Metrics**: selection precision/recall vs. golden, version-choice accuracy, one-page budget adherence, invalid-ID rate, override rate in production, cost and latency per run.
- `pnpm eval` script comparing prompt/model variants, output as a report; optional CI job on prompt changes.
- LLM-as-judge only for secondary checks (e.g. reason quality), never as the main metric.

## Out of scope

Fine-tuning (might become possible later with enough override data; note it in the decisions log).

## Decisions (resolve in Plan mode)

- Tracing/evals tool: Langfuse (open source, self-hostable) vs. LangSmith (pairs with LangChain) vs. Braintrust.
- Where golden data lives (repo fixtures vs. DB table).
- Privacy: traces contain resume content, so pick retention and redaction rules.

## Acceptance criteria

- `pnpm eval` prints metrics for the current tailor as a baseline.
- Overrides are stored for every AI-tailored saved version.

## Decisions log

_Fill in after planning._
