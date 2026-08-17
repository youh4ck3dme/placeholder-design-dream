import type { CrossBorderAlert, Transaction } from "../types";

export const EU_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
  "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
]);

export const HIGH_RISK_DESTINATIONS = new Set(["ES", "PL", "FR", "UK"]);
const AMOUNT_THRESHOLD = 50_000;

export function detectSuspiciousFlows(transactions: Transaction[]): CrossBorderAlert[] {
  return transactions
    .filter((t) => t.originCountry !== t.destinationCountry)
    .filter(
      (t) => HIGH_RISK_DESTINATIONS.has(t.destinationCountry) && t.amount >= AMOUNT_THRESHOLD,
    )
    .map((t) => ({
      transactionId: t.id,
      route: `${t.originCountry} → ${t.destinationCountry}`,
      amount: t.amount,
      score: Math.min(100, 55 + Math.round(t.amount / 4000)),
    }))
    .sort((a, b) => b.score - a.score);
}
