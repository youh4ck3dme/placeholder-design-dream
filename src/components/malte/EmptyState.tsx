import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon = SearchX,
  title,
  detail,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      {detail ? <p className="max-w-[38ch] text-caption">{detail}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
