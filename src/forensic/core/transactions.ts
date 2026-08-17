import type { Flag, Transaction, TransactionAnalysis } from "../types";
import { daysBetween, formatEur, levelFromScore, scoreFromFlags } from "./utils";

export const TX_RULES = {
  roundAmounts: [20_000, 25_000, 30_000, 35_000, 40_000],
  rapidSuccessive: { count: 3, days: 183 },
  sameDay: { count: 2, amount: 50_000 },
  cashIntensiveRatio: 0.8,
};

export function flagTransaction(tx: Transaction, all: Transaction[]): Flag[] {
  const flags: Flag[] = [];

  if (TX_RULES.roundAmounts.includes(tx.amount)) {
    flags.push({
      code: "ROUND_AMOUNT",
      label: "Zaokrúhlená suma",
      detail: `${formatEur(tx.amount)} presne na tisíce`,
      weight: 18,
      severity: "medium",
    });
  }

  if (tx.method === "cash" && tx.amount >= 15_000) {
    flags.push({
      code: "CASH_HIGH_VALUE",
      label: "Vysoká hotovostná platba",
      detail: `${formatEur(tx.amount)} v hotovosti`,
      weight: 24,
      severity: "high",
    });
  }

  const sameDay = all.filter((t) => t.date === tx.date);
  const sameDaySum = sameDay.reduce((s, t) => s + t.amount, 0);
  if (sameDay.length >= TX_RULES.sameDay.count && sameDaySum >= TX_RULES.sameDay.amount) {
    flags.push({
      code: "SAME_DAY",
      label: "Viac transakcií v jeden deň",
      detail: `${sameDay.length} transakcie • spolu ${formatEur(sameDaySum)}`,
      weight: 20,
      severity: "high",
    });
  }

  const related = all.filter(
    (t) =>
      (t.fromId === tx.fromId || t.payerId === tx.payerId) &&
      daysBetween(t.date, tx.date) <= TX_RULES.rapidSuccessive.days,
  );
  if (related.length >= TX_RULES.rapidSuccessive.count) {
    flags.push({
      code: "RAPID_SUCCESSIVE",
      label: "Rýchle opakovanie nákupov",
      detail: `${related.length} transakcií rovnakej strany za 6 mesiacov`,
      weight: 16,
      severity: "high",
    });
  }

  if (tx.payerId && tx.payerId !== tx.fromId) {
    flags.push({
      code: "THIRD_PARTY_PAYMENT",
      label: "Platba tretej strany",
      detail: "Skutočný platiteľ nie je zmluvnou stranou",
      weight: 18,
      severity: "high",
    });
  }

  return flags;
}

export function cashRatio(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  const cash = transactions.filter((t) => t.method === "cash").reduce((s, t) => s + t.amount, 0);
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  return total === 0 ? 0 : cash / total;
}

/** Vyhodnotí jednu transakciu v kontexte celého prípadu. */
export function monitorTransaction(
  transaction: Transaction,
  all: Transaction[],
): TransactionAnalysis {
  const flags = flagTransaction(transaction, all);
  const score = scoreFromFlags(flags);
  return { transaction, flags, score, level: levelFromScore(score) };
}

function unusedCashRatio(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  const cash = transactions.filter((t) => t.method === "cash").reduce((s, t) => s + t.amount, 0);
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  return total === 0 ? 0 : cash / total;
}

export function isCashIntensive(transactions: Transaction[]): boolean {
  return cashRatio(transactions) >= TX_RULES.cashIntensiveRatio;
}
