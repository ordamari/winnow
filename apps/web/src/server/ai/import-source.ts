import "server-only";

const TTL_MS = 2 * 60 * 60 * 1000;

type Entry = { sourceText: string; storedAt: number };

function sources(): Map<string, Entry> {
  const globalStore = globalThis as typeof globalThis & {
    __winnowResumeImport?: Map<string, Entry>;
  };
  globalStore.__winnowResumeImport ??= new Map();
  return globalStore.__winnowResumeImport;
}

export function rememberImportSource(userId: string, sourceText: string) {
  sources().set(userId, { sourceText, storedAt: Date.now() });
}

export function readImportSource(userId: string): string | null {
  const entry = sources().get(userId);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > TTL_MS) {
    sources().delete(userId);
    return null;
  }
  return entry.sourceText;
}

export function forgetImportSource(userId: string) {
  sources().delete(userId);
}
