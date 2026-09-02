import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyzeCase, EMPTY_CASE, type CaseAnalysis, type ForensicCase } from "@/forensic";
import { listCases, loadCase, type CaseSummary } from "@/lib/case-data";

type Ctx = {
  cases: CaseSummary[];
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  activeCase: ForensicCase;
  analysis: CaseAnalysis;
  hasCase: boolean;
  loading: boolean;
  refresh: () => void;
};

const ActiveCaseContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "malte:active-case";

export function ActiveCaseProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activeCaseId, setActiveCaseIdState] = useState<string | null>(null);

  const casesQuery = useQuery({ queryKey: ["cases"], queryFn: listCases });
  const cases = useMemo(() => casesQuery.data ?? [], [casesQuery.data]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setActiveCaseIdState(stored);
  }, []);

  useEffect(() => {
    if (!cases.length) {
      if (activeCaseId) setActiveCaseIdState(null);
      return;
    }
    if (!activeCaseId || !cases.some((c) => c.id === activeCaseId)) {
      setActiveCaseIdState(cases[0]!.id);
    }
  }, [cases, activeCaseId]);

  const setActiveCaseId = (id: string | null) => {
    setActiveCaseIdState(id);
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const caseQuery = useQuery({
    queryKey: ["case", activeCaseId],
    queryFn: () => loadCase(activeCaseId as string),
    enabled: Boolean(activeCaseId),
  });

  const activeCase = caseQuery.data ?? EMPTY_CASE;
  const analysis = useMemo(() => analyzeCase(activeCase), [activeCase]);

  const value: Ctx = {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    analysis,
    hasCase: Boolean(caseQuery.data),
    loading: casesQuery.isLoading || caseQuery.isLoading,
    refresh: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      void queryClient.invalidateQueries({ queryKey: ["case"] });
    },
  };

  return <ActiveCaseContext.Provider value={value}>{children}</ActiveCaseContext.Provider>;
}

export function useActiveCase(): Ctx {
  const ctx = useContext(ActiveCaseContext);
  if (!ctx) throw new Error("useActiveCase musí byť použitý v ActiveCaseProvider");
  return ctx;
}
