import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { idbClear, idbGet, idbSet } from "@/lib/idb";
import type { Severity } from "@/forensic";

export type RunLogEntry = {
  id: string;
  at: number;
  target: string;
  detector: string;
  score: number;
  level: Severity;
  flagCount: number;
};

export type ThemeMode = "light" | "dark" | "system";

export type CaseState = {
  riskFilter: Severity[];
  reviewed: string[];
  runLog: RunLogEntry[];
  exports: number;
  theme: ThemeMode;
};

const EMPTY: CaseState = {
  riskFilter: [],
  reviewed: [],
  runLog: [],
  exports: 0,
  theme: "system",
};
const KEY = "case:e-babcan";

type Ctx = {
  state: CaseState;
  ready: boolean;
  toggleRisk: (level: Severity) => void;
  clearRisk: () => void;
  toggleReviewed: (id: string) => void;
  logRun: (entry: Omit<RunLogEntry, "at">) => void;
  countExport: () => void;
  setTheme: (theme: ThemeMode) => void;
  reset: () => void;
};

const CaseStoreContext = createContext<Ctx | null>(null);

export function CaseStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CaseState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    idbGet<CaseState>(KEY)
      .then((stored) => {
        if (active && stored) setState({ ...EMPTY, ...stored });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((next: (prev: CaseState) => CaseState) => {
    setState((prev) => {
      const value = next(prev);
      void idbSet(KEY, value).catch(() => undefined);
      return value;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = state.theme === "dark" || (state.theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [state.theme]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      toggleRisk: (level) =>
        update((prev) => ({
          ...prev,
          riskFilter: prev.riskFilter.includes(level)
            ? prev.riskFilter.filter((l) => l !== level)
            : [...prev.riskFilter, level],
        })),
      clearRisk: () => update((prev) => ({ ...prev, riskFilter: [] })),
      toggleReviewed: (id) =>
        update((prev) => ({
          ...prev,
          reviewed: prev.reviewed.includes(id)
            ? prev.reviewed.filter((r) => r !== id)
            : [...prev.reviewed, id],
        })),
      logRun: (entry) =>
        update((prev) => ({
          ...prev,
          runLog: [
            { ...entry, at: Date.now() },
            ...prev.runLog.filter((r) => r.id !== entry.id),
          ].slice(0, 30),
        })),
      countExport: () => update((prev) => ({ ...prev, exports: prev.exports + 1 })),
      setTheme: (theme) => update((prev) => ({ ...prev, theme })),
      reset: () => {
        void idbClear().catch(() => undefined);
        setState(EMPTY);
      },
    }),
    [state, ready, update],
  );

  return <CaseStoreContext.Provider value={value}>{children}</CaseStoreContext.Provider>;
}

export function useCaseStore(): Ctx {
  const ctx = useContext(CaseStoreContext);
  if (!ctx) throw new Error("useCaseStore musí byť použitý v CaseStoreProvider");
  return ctx;
}

/** Vráti true, ak položka prejde aktívnym rizikovým filtrom. */
export function passesFilter(filter: Severity[], level: Severity): boolean {
  return filter.length === 0 || filter.includes(level);
}
