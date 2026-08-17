import { createFileRoute } from "@tanstack/react-router";
import { Building2, Search, User } from "lucide-react";
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
import { analyzeCase, eBabcanCase, formatEur } from "@/forensic";

export const Route = createFileRoute("/osoby")({
  head: () => ({
    meta: [
      { title: "Subjekty — Malte" },
      {
        name: "description",
        content:
          "Osoby a firmy prípadu s vypočítaným rizikovým skóre, príznakmi schránkovej firmy a objemom transakcií.",
      },
      { property: "og:title", content: "Subjekty — Malte" },
      {
        property: "og:description",
        content: "Rizikový rebríček subjektov prípadu vrátane detekcie schránkových firiem.",
      },
    ],
  }),
  component: People,
});

const analysis = analyzeCase(eBabcanCase);

function People() {
  return (
    <PhoneFrame>
      <AppHeader title="Subjekty" actions={<Search className="h-5 w-5 opacity-90" aria-hidden />} />
      <Screen>
        <div className="flex gap-2">
          <PlaceholderButton variant="primary" size="sm">
            Všetky
          </PlaceholderButton>
          <PlaceholderButton size="sm">Osoby</PlaceholderButton>
          <PlaceholderButton size="sm">Firmy</PlaceholderButton>
          <PlaceholderButton size="sm">Schránkové</PlaceholderButton>
        </div>

        <SectionTitle>{analysis.entities.length} subjektov • zoradené podľa rizika</SectionTitle>

        <div className="space-y-3">
          {analysis.entities.map((item) => (
            <Card key={item.entity.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  {item.entity.kind === "person" ? (
                    <User className="h-4 w-4" aria-hidden />
                  ) : (
                    <Building2 className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.entity.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.entity.role}
                    {item.entity.ico ? ` • IČO ${item.entity.ico}` : ""}
                  </p>
                </div>
                <span className="ml-auto">
                  <RiskChip level={item.level}>{item.score}/100</RiskChip>
                </span>
              </div>

              {item.isShell ? (
                <p className="rounded-lg bg-risk-high/10 px-2 py-1 text-[11px] font-semibold text-risk-high">
                  Indikátory schránkovej firmy
                </p>
              ) : null}

              <div className="flex flex-wrap gap-1.5">
                {item.flags.map((flag) => (
                  <span
                    key={flag.code}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                    title={flag.detail}
                  >
                    {flag.label}
                  </span>
                ))}
                {item.flags.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground">Bez detegovaných príznakov</span>
                ) : null}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground tnum">
                <span>Objem {formatEur(item.totalVolume)}</span>
                <span>{item.weaponCount} zbraní</span>
              </div>
            </Card>
          ))}
        </div>
      </Screen>
      <BottomNav />
    </PhoneFrame>
  );
}
