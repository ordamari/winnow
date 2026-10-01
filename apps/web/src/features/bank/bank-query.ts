"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ResumeData } from "@winnow/core";
import { useLayoutEffect } from "react";

import { useBankUserId } from "@/components/query-provider";
import { loadBankAction } from "@/server/bank/actions";

export type BankSnapshot = {
  data: ResumeData;
  updatedAt: string;
};

export function bankQueryKey(userId: string) {
  return ["bank", userId] as const;
}

function bankQuery(userId: string) {
  return {
    queryKey: bankQueryKey(userId),
    queryFn: loadBankAction,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };
}

export function useBankData() {
  const userId = useBankUserId();
  const query = useQuery(bankQuery(userId));
  return query.data ?? null;
}

/**
 * Seeds the cache from the server payload when the cache is empty, and
 * replaces it only when the server `updatedAt` is newer. An equal timestamp
 * keeps the cache so an edit that has not been saved yet is not discarded.
 */
export function useHydrateBank(initial: BankSnapshot | null) {
  const userId = useBankUserId();
  const queryClient = useQueryClient();
  const query = useQuery({
    ...bankQuery(userId),
    initialData: initial,
  });

  useLayoutEffect(() => {
    if (!initial) return;
    const key = bankQueryKey(userId);
    const cached = queryClient.getQueryData<BankSnapshot | null>(key);
    if (!cached || cached.updatedAt < initial.updatedAt) {
      queryClient.setQueryData(key, initial);
    }
  }, [initial, queryClient, userId]);

  return query.data ?? null;
}
