"use client";

import type { ResumeData } from "@winnow/core";
import { useCallback, useEffect, useRef, useState } from "react";

import { saveBankAction } from "@/server/bank/actions";

export type SaveStatus = "saved" | "saving" | "error" | "conflict";

export function useBankSave(initialUpdatedAt: string) {
  const updatedAtRef = useRef(initialUpdatedAt);
  const pendingRef = useRef<ResumeData | null>(null);
  const savingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const conflictRef = useRef(false);
  const [status, setStatus] = useState<SaveStatus>("saved");

  const flush = useCallback(async () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (savingRef.current || conflictRef.current) return;

    let savedAny = false;
    while (pendingRef.current) {
      const next = pendingRef.current;
      pendingRef.current = null;
      savingRef.current = true;
      setStatus("saving");
      const result = await saveBankAction(next, updatedAtRef.current);
      savingRef.current = false;
      if (!result.ok) {
        if (result.conflict) conflictRef.current = true;
        setStatus(result.conflict ? "conflict" : "error");
        return;
      }
      updatedAtRef.current = result.updatedAt;
      savedAny = true;
    }
    if (savedAny) setStatus("saved");
  }, []);

  const schedule = useCallback(
    (next: ResumeData) => {
      if (conflictRef.current) return;
      pendingRef.current = next;
      setStatus("saving");
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        void flush();
      }, 500);
    },
    [flush],
  );

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      void flush();
    };
  }, [flush]);

  return { status, schedule };
}
