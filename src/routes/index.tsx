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
import { PlaceholderButton } from "@/components/malte/PlaceholderButton";
import { analyzeCase, eBabcanCase, formatEur, severityLabel } from "@/forensic";

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
          Najvážnejšie zistenia
        </SectionTitle>

        <Card className="divide-y divide-border p-0">
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 p-4">
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
            </div>
          ))}
        </Card>

        <PlaceholderButton variant="primary" size="lg" className="w-full">
          Exportovať trestné oznámenie
        </PlaceholderButton>
      </Screen>

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
