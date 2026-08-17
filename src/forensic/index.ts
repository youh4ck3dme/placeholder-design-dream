import type {
  Alert,
  CaseAnalysis,
  EntityAnalysis,
  Flag,
  ForensicCase,
  TransactionAnalysis,
} from "./types";
import { detectShellCompany, isShell } from "./core/shellCompany";
import { cashRatio, flagTransaction } from "./core/transactions";
import { analyzeWeapon, detectVolumeSurge } from "./core/weapons";
import { detectChains } from "./core/network";
import { detectSuspiciousFlows } from "./core/crossBorder";
import { formatDate, formatEur, levelFromScore, scoreFromFlags, severityOrder } from "./core/utils";

export * from "./types";
export { eBabcanCase } from "./data/e-babcan";
export { formatDate, formatEur, levelFromScore, scoreFromFlags } from "./core/utils";
export { TX_RULES, monitorTransaction, flagTransaction } from "./core/transactions";
export { detectShellCompany, isShell } from "./core/shellCompany";
export { analyzeWeapon, detectVolumeSurge } from "./core/weapons";
export { detectChains } from "./core/network";
export { detectSuspiciousFlows } from "./core/crossBorder";
export { HIGH_RISK_DESTINATIONS } from "./core/crossBorder";

export function analyzeCase(forensicCase: ForensicCase): CaseAnalysis {
  const { transactions, weapons, entities, relations } = forensicCase;

  const transactionAnalyses: TransactionAnalysis[] = transactions.map((transaction) => {
    const flags = flagTransaction(transaction, transactions);
    const score = scoreFromFlags(flags);
    return { transaction, flags, score, level: levelFromScore(score) };
  });

  const weaponAnalyses = weapons.map((w) => analyzeWeapon(w, forensicCase));

  const shellSet = new Set(
    entities
      .filter((e) => isShell(detectShellCompany(e, forensicCase, transactions)))
      .map((e) => e.id),
  );

  const entityAnalyses: EntityAnalysis[] = entities.map((entity) => {
    const own = transactions.filter(
      (t) => t.fromId === entity.id || t.toId === entity.id || t.payerId === entity.id,
    );
    const flags: Flag[] = [...detectShellCompany(entity, forensicCase, transactions)];

    const surge = detectVolumeSurge(weapons, entity.id);
    if (surge) flags.push(surge);

    const europolHeld = weaponAnalyses.filter(
      (w) => w.weapon.holderId === entity.id && w.europolMatch,
    );
    if (europolHeld.length > 0) {
      flags.push({
        code: "EUROPOL_HOLDER",
        label: "Zbrane so zhodou v EUROPOL",
        detail: `${europolHeld.length} kusov evidovaných v kriminálnom prostredí`,
        weight: 30,
        severity: "critical",
      });
    }

    const badLicence = weaponAnalyses.filter(
      (w) => w.weapon.holderId === entity.id && w.invalidLicence,
    );
    if (badLicence.length > 0) {
      flags.push({
        code: "LICENSE_ISSUE",
        label: "Prevod bez platnej licencie",
        detail: `${badLicence.length} kusov bez platného oprávnenia`,
        weight: 22,
        severity: "high",
      });
    }

    const ownCash = cashRatio(own);
    if (own.length >= 3 && ownCash >= 0.8) {
      flags.push({
        code: "CASH_INTENSIVE",
        label: "Hotovostné podnikanie",
        detail: `${Math.round(ownCash * 100)} % objemu v hotovosti`,
        weight: 16,
        severity: "high",
      });
    }

    const thirdParty = own.filter((t) => t.payerId && t.payerId !== t.fromId && t.fromId === entity.id);
    if (thirdParty.length > 0) {
      flags.push({
        code: "THIRD_PARTY_FUNDING",
        label: "Financovanie treťou stranou",
        detail: `${thirdParty.length} transakcií uhradil iný subjekt`,
        weight: 14,
        severity: "medium",
      });
    }

    if (entity.kind === "person" && entity.responsive === false) {
      flags.push({
        code: "NO_CONTACT_PERSON",
        label: "Nekontaktná osoba",
        detail: "Nereaguje na výzvy orgánov",
        weight: 10,
        severity: "medium",
      });
    }

    const fundedByEntity = transactions.filter((t) => t.payerId === entity.id && t.fromId !== entity.id);
    if (fundedByEntity.length > 0) {
      flags.push({
        code: "THIRD_PARTY_PAYER",
        label: "Platby za iný subjekt",
        detail: `${fundedByEntity.length} nákupov uhradených za cudziu spoločnosť`,
        weight: 26,
        severity: "high",
      });
    }

    const controlled = relations.filter(
      (r) => r.fromId === entity.id && shellSet.has(r.toId) && r.label !== "dodávka",
    );
    if (controlled.length > 0) {
      flags.push({
        code: "SHELL_CONTROL",
        label: "Ovládanie schránkových firiem",
        detail: `${controlled.length} spoločností v reťazci pod kontrolou subjektu`,
        weight: controlled.length >= 2 ? 46 : 28,
        severity: "critical",
      });
    }

    const score = scoreFromFlags(flags);
    return {
      entity,
      flags: sortFlags(flags),
      score,
      level: levelFromScore(score),
      isShell: isShell(flags),
      weaponCount: weapons.filter((w) => w.holderId === entity.id).length,
      totalVolume: own.reduce((s, t) => s + t.amount, 0),
    };
  });

  const shellIds = entityAnalyses.filter((e) => e.isShell).map((e) => e.entity.id);
  const chains = detectChains(relations, transactions, shellIds);
  const crossBorder = detectSuspiciousFlows(transactions);

  const alerts: Alert[] = [
    ...entityAnalyses
      .filter((e) => e.flags.length > 0)
      .map((e) => ({
        id: `entity-${e.entity.id}`,
        title: e.isShell ? `Schránková firma: ${e.entity.name}` : e.entity.name,
        detail: e.flags.map((f) => f.label).join(" • "),
        severity: e.level,
        score: e.score,
        source: "entita" as const,
      })),
    ...transactionAnalyses
      .filter((t) => t.flags.length > 0)
      .map((t) => ({
        id: `tx-${t.transaction.id}`,
        title: `${formatEur(t.transaction.amount)} — ${t.transaction.description}`,
        detail: t.flags.map((f) => f.label).join(" • "),
        severity: t.level,
        score: t.score,
        source: "transakcia" as const,
        date: formatDate(t.transaction.date),
      })),
    ...weaponAnalyses
      .filter((w) => w.flags.length > 0)
      .map((w) => ({
        id: `weapon-${w.weapon.id}`,
        title: `${w.weapon.brand} ${w.weapon.model} • ${w.weapon.serial}`,
        detail: w.flags.map((f) => f.label).join(" • "),
        severity: (w.europolMatch ? "critical" : "high") as Alert["severity"],
        score: scoreFromFlags(w.flags),
        source: "zbraň" as const,
        date: formatDate(w.weapon.acquiredAt),
      })),
    ...chains.map((c) => ({
      id: `chain-${c.shellId}`,
      title: `Reťazec obchodovania cez ${nameOf(forensicCase, c.shellId)}`,
      detail: `${c.supplierIds.length} dodávateľov → ${c.buyerIds.length} odberateľov`,
      severity: c.severity,
      score: c.severity === "critical" ? 92 : 74,
      source: "sieť" as const,
    })),
    ...crossBorder.map((a) => ({
      id: `cb-${a.transactionId}`,
      title: `Cezhraničný tok ${a.route}`,
      detail: `${formatEur(a.amount)} do rizikovej destinácie`,
      severity: levelFromScore(a.score),
      score: a.score,
      source: "cezhraničné" as const,
    })),
  ].sort((a, b) => b.score - a.score);

  const allFlags = [
    ...entityAnalyses.flatMap((e) => e.flags),
    ...transactionAnalyses.flatMap((t) => t.flags),
    ...weaponAnalyses.flatMap((w) => w.flags),
  ];

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;
  const caseScore = Math.min(
    100,
    Math.round(criticalCount * 9 + highCount * 4 + chains.length * 6 + crossBorder.length * 3),
  );

  const companies = entities.filter((e) => e.kind === "company").length;

  return {
    case: forensicCase,
    entities: entityAnalyses.sort((a, b) => b.score - a.score),
    transactions: transactionAnalyses,
    weapons: weaponAnalyses,
    chains,
    crossBorder,
    alerts,
    caseScore,
    caseLevel: levelFromScore(caseScore),
    topFlags: dedupeFlags(allFlags).slice(0, 6),
    totals: {
      entities: entities.length,
      companies,
      transactions: transactions.length,
      volume: transactions.reduce((s, t) => s + t.amount, 0),
      cashRatio: cashRatio(transactions),
      weapons: weapons.length,
      europolMatches: weaponAnalyses.filter((w) => w.europolMatch).length,
    },
  };
}

export const severityLabel: Record<Alert["severity"], string> = {
  critical: "Kritické",
  high: "Vysoké",
  medium: "Stredné",
  low: "Nízke",
};

function sortFlags(flags: Flag[]): Flag[] {
  return [...flags].sort(
    (a, b) => severityOrder[b.severity] - severityOrder[a.severity] || b.weight - a.weight,
  );
}

function dedupeFlags(flags: Flag[]): Flag[] {
  const map = new Map<string, Flag>();
  for (const flag of sortFlags(flags)) if (!map.has(flag.code)) map.set(flag.code, flag);
  return [...map.values()];
}

function nameOf(forensicCase: ForensicCase, id: string): string {
  return forensicCase.entities.find((e) => e.id === id)?.name ?? id;
}
