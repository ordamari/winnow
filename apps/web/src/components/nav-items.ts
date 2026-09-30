import {
  ChartColumn,
  Kanban,
  Library,
  type LucideIcon,
  PenLine,
  Settings,
  Sparkles,
} from "lucide-react";

export const navItems: {
  href: string;
  labelKey:
    | "builder"
    | "bank"
    | "applications"
    | "recommendations"
    | "insights"
    | "settings";
  icon: LucideIcon;
}[] = [
  { href: "/builder", labelKey: "builder", icon: PenLine },
  { href: "/bank", labelKey: "bank", icon: Library },
  { href: "/applications", labelKey: "applications", icon: Kanban },
  { href: "/recommendations", labelKey: "recommendations", icon: Sparkles },
  { href: "/insights", labelKey: "insights", icon: ChartColumn },
  { href: "/settings", labelKey: "settings", icon: Settings },
];
