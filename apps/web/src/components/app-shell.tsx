import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@winnow/ui/components/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset id="main" className="min-h-svh">
        <TopBar />
        <div className="flex flex-1 flex-col p-4 text-sm md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
