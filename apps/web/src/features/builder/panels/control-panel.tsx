"use client";

import { useTranslations } from "next-intl";
import { ScrollArea } from "@winnow/ui/components/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@winnow/ui/components/tabs";

import { ContentPanel } from "./content-panel";
import { StylePanel } from "./style-panel";
import { TailorPanel } from "./tailor-panel";

export function ControlPanel({ hasApiKey }: { hasApiKey: boolean }) {
  const t = useTranslations("builder");

  return (
    <Tabs defaultValue="content" className="h-full min-h-0 gap-0">
      <TabsList className="h-auto w-full shrink-0 rounded-none bg-transparent p-0">
        {(["content", "tailor", "style"] as const).map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="rounded-none border-b-2 border-transparent py-2.5 text-xs font-semibold tracking-wide uppercase shadow-none data-active:border-primary data-active:bg-transparent data-active:text-primary data-active:shadow-none"
          >
            {t(`tabs.${tab}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="content" keepMounted className="min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <ContentPanel />
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="tailor" keepMounted className="min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <TailorPanel hasApiKey={hasApiKey} />
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="style" keepMounted className="min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <StylePanel />
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
