import { Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronLeft,
  LayoutGrid,
  LineChart,
  MoreHorizontal,
  Network,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import malteMark from "@/assets/malte-mark.png";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background py-0 sm:py-10">
      <div className="mx-auto w-full max-w-[420px] sm:overflow-hidden sm:rounded-[2.5rem] sm:border sm:border-border sm:bg-card sm:shadow-elevated">
        <div className="relative flex min-h-screen flex-col sm:min-h-[860px]">{children}</div>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-primary-foreground/90 tnum">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-2 w-3 rounded-[2px] bg-primary-foreground/70" />
        <span className="inline-block h-2 w-2 rounded-full bg-primary-foreground/70" />
        <span className="inline-block h-2 w-5 rounded-[3px] border border-primary-foreground/70" />
      </span>
    </div>
  );
}

export function AppHeader({
  title,
  brand,
  actions,
  back,
  children,
}: {
  title: string;
  brand?: boolean;
  actions?: ReactNode;
  back?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="gradient-brand rounded-b-[1.75rem] pb-5 text-primary-foreground">
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2 pb-3">
        {back ? <ChevronLeft className="h-5 w-5 opacity-90" aria-hidden /> : null}
        {brand ? (
          <img src={malteMark} alt="Malte" width={28} height={28} className="h-7 w-7" />
        ) : null}
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {actions ?? <Bell className="h-5 w-5 opacity-90" aria-hidden />}
        </div>
      </div>
      {children}
    </header>
  );
}

const navItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Prehľad", icon: LayoutGrid },
  { to: "/analyza-vypisov", label: "Analýza", icon: LineChart },
  { to: "/osoby", label: "Osoby", icon: Users },
  { to: "/vztahy", label: "Vzťahy", icon: Network },
  { to: "/viac", label: "Viac", icon: MoreHorizontal },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-10 mt-auto border-t border-border bg-card/95 px-2 pt-2 pb-5 backdrop-blur">
      <ul className="flex items-stretch justify-between">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <main className="flex-1 space-y-4 px-4 py-4">{children}</main>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-4 shadow-card", className)}>
      {children}
    </section>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function RiskChip({
  level = "muted",
  children,
}: {
  level?: "high" | "medium" | "low" | "muted";
  children: ReactNode;
}) {
  const styles = {
    high: "bg-risk-high/12 text-risk-high",
    medium: "bg-risk-medium/15 text-risk-medium",
    low: "bg-risk-low/15 text-risk-low",
    muted: "bg-primary-foreground/15 text-primary-foreground",
  }[level];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap",
        styles,
      )}
    >
      {children}
    </span>
  );
}