import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Building2,
  Crosshair,
  Network,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  AppHeader,
  BottomNav,
  Card,
  PhoneFrame,
  RiskChip,
  Screen,
  SectionTitle,
} from "@/components/malte/Shell";
import { Button } from "@/components/ui/button";
import { RiskFilter } from "@/components/malte/RiskFilter";
import { DetectorSheet, type DetectorTarget } from "@/components/malte/DetectorSheet";
import { useCaseStore, passesFilter } from "@/hooks/useCaseStore";
import { exportCaseReport } from "@/lib/report";
import { toast } from "sonner";
import { analyzeCase, eBabcanCase, formatEur, severityLabel, type Severity } from "@/forensic";
import { alertTarget } from "@/lib/alert-target";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Malte — Prehľad prípadu E-Babčan" },
      {
        name: "description",
        content:
          "Forenzná analýza prípadu nelegálneho obchodu so zbraňami: rizikové skóre, schránkové firmy a detekcia anomálií.",
      },
      { property: "og:title", content: "Malte — Prehľad prípadu E-Babčan" },
      {
        property: "og:description",
        content: "Analýza. Dôkazy. Rozhodnutia. Rizikový profil prípadu na jednej obrazovke.",
      },
    ],
  }),
  component: Index,
});

const analysis = analyzeCase(eBabcanCase);

function Index() {
  const { totals, caseScore, caseLevel, alerts, topFlags, chains } = analysis;
  const { state, countExport } = useCaseStore();
  const [target, setTarget] = useState<DetectorTarget | null>(null);
  const counts = alerts.reduce<Partial<Record<Severity, number>>>((acc, a) => {
    acc[a.severity] = (acc[a.severity] ?? 0) + 1;
    return acc;
  }, {});
  const visible = alerts.filter((a) => passesFilter(state.riskFilter, a.severity));
  const stats = [
    { label: "Subjekty", value: String(totals.entities), icon: Users },
    { label: "Firmy", value: String(totals.companies), icon: Building2 },
    { label: "Zbrane", value: String(totals.weapons), icon: Crosshair },
    { label: "Reťazce", value: String(chains.length), icon: Network },
  ];

  return (
    <PhoneFrame>
      <AppHeader title="Malte" brand>
        <div className="px-5">
          <div className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
            <p className="text-[10px] tracking-wide uppercase opacity-80">Prebiehajúci prípad</p>
            <p className="mt-1 text-base font-semibold">{eBabcanCase.name}</p>
            <p className="text-[11px] opacity-75">{eBabcanCase.subtitle}</p>

            <div className="mt-4 rounded-xl bg-primary-foreground/10 p-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] opacity-80">Celková rizikovosť</p>
                  <p className="text-xl font-bold">{severityLabel[caseLevel].toUpperCase()}</p>
                </div>
                <p className="text-sm font-semibold tnum">
                  {caseScore}
                  <span className="opacity-70">/100</span>
                </p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
                <div className="h-full rounded-full bg-risk-high" style={{ width: `${caseScore}%` }} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {topFlags.slice(0, 4).map((flag) => (
                <RiskChip key={flag.code}>{flag.label}</RiskChip>
              ))}
            </div>
          </div>
        </div>
      </AppHeader>

      <Screen>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="text-lg font-bold tnum">{value}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-risk-high" aria-hidden />
            <p className="text-sm font-semibold">Kľúčové ukazovatele</p>
          </div>
          <Metric label="Objem transakcií" value={formatEur(totals.volume)} />
          <Metric label="Podiel hotovosti" value={`${Math.round(totals.cashRatio * 100)} %`} />
          <Metric
            label="Zhody EUROPOL"
            value={`${totals.europolMatches} / ${totals.weapons}`}
            tone="high"
          />
        </Card>

        <SectionTitle
          action={
            <Link to="/analyza-vypisov" className="text-xs font-medium text-primary hover:underline">
              Všetko
            </Link>
          }
        >
          Zistenia ({visible.length})
        </SectionTitle>

        <RiskFilter counts={counts} />

        <Card className="divide-y divide-border p-0">
          {visible.slice(0, 8).map((alert) => (
            <button
              type="button"
              key={alert.id}
              onClick={() => setTarget(alertTarget(alert.id))}
              disabled={alertTarget(alert.id) === null}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent disabled:cursor-default disabled:hover:bg-transparent"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-risk-high/12 text-risk-high">
                <AlertTriangle className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{alert.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{alert.detail}</p>
              </div>
              <span className="ml-auto">
                <RiskChip level={alert.severity}>{alert.score}</RiskChip>
              </span>
            </button>
          ))}
          {visible.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">
              Pre zvolený filter neexistujú žiadne zistenia.
            </p>
          ) : null}
        </Card>

        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            const ok = exportCaseReport(analysis, state.riskFilter);
            if (ok) {
              countExport();
              toast.success("Správa vygenerovaná — uložte ako PDF v dialógu tlače.");
            } else {
              toast.error("Export sa nepodarilo spustiť.");
            }
          }}
        >
          Exportovať správu do PDF
        </Button>
      </Screen>

      <DetectorSheet target={target} onClose={() => setTarget(null)} />
      <BottomNav />
    </PhoneFrame>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "high" }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold tnum ${tone === "high" ? "text-risk-high" : ""}`}>{value}</span>
    </div>
  );
}
