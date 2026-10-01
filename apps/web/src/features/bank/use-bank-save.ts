"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ResumeData } from "@winnow/core";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBankUserId } from "@/components/query-provider";
import { useRouter } from "@/i18n/navigation";
import { saveBankAction } from "@/server/bank/actions";

import { bankQueryKey, type BankSnapshot } from "./bank-query";

export type SaveStatus = "saved" | "saving" | "error" | "conflict";

export function useBankSave() {
  const userId = useBankUserId();
  const queryClient = useQueryClient();
  const router = useRouter();
  const key = bankQueryKey(userId);
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
      const cached = queryClient.getQueryData<BankSnapshot | null>(key);
      if (!cached) {
        setStatus("error");
        return;
      }
      savingRef.current = true;
      setStatus("saving");
      const result = await saveBankAction(next, cached.updatedAt);
      savingRef.current = false;
      if (!result.ok) {
        if (result.conflict) {
          conflictRef.current = true;
          pendingRef.current = null;
          setStatus("conflict");
          await queryClient.invalidateQueries({ queryKey: key });
          router.refresh();
        } else {
          setStatus("error");
        }
        return;
      }
      queryClient.setQueryData<BankSnapshot | null>(key, (current) => {
        if (!current) return current;
        return { ...current, updatedAt: result.updatedAt };
      });
      savedAny = true;
    }
    if (savedAny) setStatus("saved");
  }, [key, queryClient, router]);

  const schedule = useCallback(
    (next: ResumeData) => {
      if (conflictRef.current) return;
      const current = queryClient.getQueryData<BankSnapshot | null>(key);
      if (!current) return;
      queryClient.setQueryData<BankSnapshot>(key, {
        data: next,
        updatedAt: current.updatedAt,
      });
      pendingRef.current = next;
      setStatus("saving");
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        void flush();
      }, 500);
    },
    [flush, key, queryClient],
  );

  const reload = useCallback(() => {
    conflictRef.current = false;
    pendingRef.current = null;
    setStatus("saved");
    router.refresh();
  }, [router]);

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

  return { status, schedule, reload };
}
