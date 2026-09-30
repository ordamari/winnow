import { SidebarInset, SidebarProvider } from "@winnow/ui/components/sidebar";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset id="main" className="min-h-0 overflow-hidden">
        <TopBar />
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 text-sm md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
