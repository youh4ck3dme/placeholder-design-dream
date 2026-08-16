import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, Banknote, Layers, MoreVertical, SlidersHorizontal } from "lucide-react";
import {
  AppHeader,
  BottomNav,
  Card,
  PhoneFrame,
  RiskChip,
  Screen,
  SectionTitle,
} from "@/components/malte/Shell";
import { BalanceChart, DonutChart } from "@/components/malte/Charts";
import { PlaceholderButton } from "@/components/malte/PlaceholderButton";
import { balancePeak, balanceSeries, detections, statementSummary } from "@/data/mock";

export const Route = createFileRoute("/analyza-vypisov")({
  head: () => ({
    meta: [
      { title: "Analýza výpisov — Malte" },
      {
        name: "description",
        content: "Sumár transakcií, vývoj zostatku a automatická detekcia anomálií v bankových výpisoch.",
      },
      { property: "og:title", content: "Analýza výpisov — Malte" },
      {
        property: "og:description",
        content: "Príjmy, výdavky a detekcia neobvyklých transakcií v prehľadnom mobilnom rozhraní.",
      },
    ],
  }),
  component: StatementAnalysis,
});

const detectionIcons = { high: AlertTriangle, medium: Layers, low: Banknote };
const detectionTone = {
  high: "bg-risk-high/12 text-risk-high",
  medium: "bg-risk-medium/15 text-risk-medium",
  low: "bg-risk-low/15 text-risk-low",
};

function StatementAnalysis() {
  return (
    <PhoneFrame>
      <AppHeader
        title="Analýza výpisov"
        back
        actions={
          <>
            <SlidersHorizontal className="h-5 w-5 opacity-90" aria-hidden />
            <MoreVertical className="h-5 w-5 opacity-90" aria-hidden />
          </>
        }
      />

      <Screen>
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Sumár transakcií</p>
              <p className="text-[11px] text-muted-foreground">{statementSummary.period}</p>
              <p className="mt-3 text-2xl font-bold tracking-tight tnum">{statementSummary.total}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-risk-low">
                <ArrowUpRight className="h-3 w-3" aria-hidden />
                {statementSummary.delta}
              </p>
              <p className="text-[10px] text-muted-foreground">{statementSummary.deltaNote}</p>
            </div>
            <DonutChart />
          </div>

          <div className="mt-4 space-y-2">
            {[statementSummary.income, statementSummary.expense].map((row, i) => (
              <div key={row.label} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: i === 0 ? "var(--income)" : "var(--expense)" }}
                />
                <span className="text-muted-foreground">{row.label}</span>
                <span className="ml-auto font-semibold tnum">{row.value}</span>
                <span className="w-20 text-right text-muted-foreground tnum">{row.compare}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">Vývoj zostatku</p>
              <p className="text-[11px] text-muted-foreground">Denný prehľad</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">{balancePeak.label}</p>
              <p className="text-sm font-semibold tnum">{balancePeak.value}</p>
            </div>
          </div>
          <div className="mt-3">
            <BalanceChart data={balanceSeries} />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tnum">
              <span>1. 1.</span>
              <span>1. 2.</span>
              <span>1. 3.</span>
              <span>1. 4.</span>
              <span>1. 5.</span>
            </div>
          </div>
        </Card>

        <SectionTitle
          action={<PlaceholderButton variant="link" size="sm">Zobraziť všetky</PlaceholderButton>}
        >
          Detekcia
        </SectionTitle>

        <Card className="space-y-3">
          {detections.map((d) => {
            const Icon = detectionIcons[d.level];
            return (
              <div key={d.title} className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${detectionTone[d.level]}`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground tnum">{d.detail}</p>
                </div>
                <span className="ml-auto">
                  <RiskChip level={d.level}>{d.levelLabel}</RiskChip>
                </span>
              </div>
            );
          })}
        </Card>
      </Screen>

      <BottomNav />
    </PhoneFrame>
  );
}