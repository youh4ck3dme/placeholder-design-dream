import { createFileRoute } from "@tanstack/react-router";
import { FileText, Network, Receipt, Users, AlertTriangle, UserPlus, Landmark } from "lucide-react";
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
import { caseActivity, caseStats, caseSummary } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Malte — Prehľad prípadu" },
      {
        name: "description",
        content:
          "Malte: analýza bankových výpisov, prepojené vzťahy a dôkazy v jednej forenznej aplikácii.",
      },
      { property: "og:title", content: "Malte — Prehľad prípadu" },
      {
        property: "og:description",
        content: "Analýza. Dôkazy. Rozhodnutia. Prehľad rizika prípadu na jednej obrazovke.",
      },
    ],
  }),
  component: Index,
});

const statIcons = { users: Users, network: Network, file: FileText, receipt: Receipt };
const activityIcons = { info: Landmark, high: AlertTriangle, low: UserPlus };
const activityTone = {
  info: "bg-primary/12 text-primary",
  high: "bg-risk-high/12 text-risk-high",
  low: "bg-risk-low/15 text-risk-low",
};

function Index() {
  return (
    <PhoneFrame>
      <AppHeader title="Malte" brand>
        <div className="px-5">
          <div className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
            <p className="text-[10px] tracking-wide uppercase opacity-80">Prebiehajúci prípad</p>
            <p className="mt-1 text-base font-semibold">{caseSummary.name}</p>
            <p className="text-[11px] opacity-75">{caseSummary.updatedAt}</p>

            <div className="mt-4 rounded-xl bg-primary-foreground/10 p-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] opacity-80">Celková rizikovosť</p>
                  <p className="text-xl font-bold text-risk-medium">{caseSummary.riskLabel}</p>
                </div>
                <p className="text-sm font-semibold tnum">
                  {caseSummary.riskScore}
                  <span className="opacity-70">/100</span>
                </p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
                <div
                  className="h-full rounded-full bg-risk-high"
                  style={{ width: `${caseSummary.riskScore}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {caseSummary.riskChips.map((chip) => (
                <RiskChip key={chip}>{chip}</RiskChip>
              ))}
            </div>
          </div>
        </div>
      </AppHeader>

      <Screen>
        <div className="grid grid-cols-2 gap-3">
          {caseStats.map((stat) => {
            const Icon = statIcons[stat.icon];
            return (
              <Card key={stat.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold tnum">{stat.value}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <SectionTitle action={<PlaceholderButton variant="link" size="sm">Všetko</PlaceholderButton>}>
          Aktivita prípadu
        </SectionTitle>

        <Card className="divide-y divide-border p-0">
          {caseActivity.map((item) => {
            const Icon = activityIcons[item.tone];
            return (
              <div key={item.title} className="flex items-center gap-3 p-4">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${activityTone[item.tone]}`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{item.detail}</p>
                </div>
                <span className="ml-auto text-[11px] text-muted-foreground tnum">{item.time}</span>
              </div>
            );
          })}
        </Card>

        <PlaceholderButton variant="primary" size="lg" className="w-full">
          Otvoriť analýzu prípadu
        </PlaceholderButton>
      </Screen>

      <BottomNav />
    </PhoneFrame>
  );
}
