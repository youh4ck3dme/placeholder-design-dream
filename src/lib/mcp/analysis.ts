import { analyzeCase, eBabcanCase } from "@/forensic";
import type { CaseAnalysis } from "@/forensic";

let cached: CaseAnalysis | null = null;

/** Lazy, memoised analysis of the built-in E-Babčan case. */
export function caseAnalysis(): CaseAnalysis {
  cached ??= analyzeCase(eBabcanCase);
  return cached;
}

export function text(value: unknown) {
  return {
    content: [
      { type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) },
    ],
  };
}
