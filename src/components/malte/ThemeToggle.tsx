import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCaseStore, type ThemeMode } from "@/hooks/useCaseStore";

const modes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Svetlá téma", icon: Sun },
  { id: "dark", label: "Tmavá téma", icon: Moon },
  { id: "system", label: "Podľa systému", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { state, setTheme } = useCaseStore();

  return (
    <div
      role="group"
      aria-label="Téma"
      className={cn("inline-flex items-center rounded-full border border-border p-0.5", className)}
    >
      {modes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={state.theme === id}
          onClick={() => setTheme(id)}
          className={cn(
            "rounded-full p-1.5 transition-colors",
            state.theme === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </button>
      ))}
    </div>
  );
}
