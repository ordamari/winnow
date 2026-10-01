"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext } from "react";

import { getQueryClient } from "@/lib/query-client";

const BankUserContext = createContext<string | null>(null);

export function QueryProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BankUserContext.Provider value={userId}>
        {children}
      </BankUserContext.Provider>
    </QueryClientProvider>
  );
}

export function useBankUserId() {
  const userId = useContext(BankUserContext);
  if (!userId) {
    throw new Error("Bank query is only available inside the app");
  }
  return userId;
}
