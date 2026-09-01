import {
  Crosshair,
  LayoutGrid,
  LineChart,
  MoreHorizontal,
  Network,
  Plug,
  Scale,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export const navItems: NavItem[] = [
  { to: "/", label: "Prehľad", icon: LayoutGrid },
  { to: "/analyza-vypisov", label: "Analýza", icon: LineChart },
  { to: "/osoby", label: "Osoby", icon: Users },
  { to: "/vztahy", label: "Vzťahy", icon: Network },
  { to: "/viac", label: "Viac", icon: MoreHorizontal },
];

export const secondaryItems: NavItem[] = [
  { to: "/siet", label: "Sieť tokov", icon: Share2 },
  { to: "/zbrane", label: "Zbrane", icon: Crosshair },
  { to: "/mcp-info", label: "Agentné API", icon: Plug },
];
