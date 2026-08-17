import { createFileRoute } from "@tanstack/react-router";
import { Building2, MoreVertical, Search, User } from "lucide-react";
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

export const Route = createFileRoute("/vztahy")({
  head: () => ({
    meta: [
      { title: "Sieť vzťahov — Malte" },
      {
        name: "description",
        content:
          "Sieť väzieb medzi osobami, schránkovými firmami a dodávateľmi vrátane detegovaných reťazcov obchodovania.",
      },
      { property: "og:title", content: "Sieť vzťahov — Malte" },
      {
        property: "og:description",
        content: "Vizualizácia prepojení prípadu a reťazcov dodávateľ → schránka → odberateľ.",
      },
    ],
  }),
  component: Relations,
});

const analysis = analyzeCase(eBabcanCase);
const byId = new Map(analysis.entities.map((e) => [e.entity.id, e]));

function Relations() {
  const focus = analysis.entities[0]!;

  return (
    <PhoneFrame>
      <AppHeader
        title="Vzťahy"
        actions={
          <>
            <Search className="h-5 w-5 opacity-90" aria-hidden />
            <MoreVertical className="h-5 w-5 opacity-90" aria-hidden />
          </>
        }
      />

      <Screen>
        <div className="flex gap-2">
          <PlaceholderButton variant="primary" size="sm">
            Graf
          </PlaceholderButton>
          <PlaceholderButton size="sm">Zoznam</PlaceholderButton>
        </div>

        <Card className="relative aspect-square overflow-hidden p-0">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            {eBabcanCase.relations.map((rel) => {
              const from = byId.get(rel.fromId)?.entity;
              const to = byId.get(rel.toId)?.entity;
              if (!from || !to) return null;
              const risky = byId.get(rel.fromId)?.isShell || byId.get(rel.toId)?.isShell;
              return (
                <line
                  key={`${rel.fromId}-${rel.toId}-${rel.label}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={risky ? "var(--risk-high)" : "var(--border)"}
                  strokeWidth={risky ? 0.7 : 0.5}
                  strokeDasharray={risky ? undefined : "2 2"}
                />
              );
            })}
          </svg>

          {analysis.entities.map((item) => (
            <div
              key={item.entity.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${item.entity.x}%`, top: `${item.entity.y}%` }}
            >
              <span
                className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-card ${
                  item.isShell
                    ? "border-risk-high bg-risk-high/15 text-risk-high"
                    : "border-border bg-card text-primary"
                }`}
              >
                {item.entity.kind === "person" ? (
                  <User className="h-4 w-4" aria-hidden />
                ) : (
                  <Building2 className="h-4 w-4" aria-hidden />
                )}
              </span>
              <p className="mt-1 w-24 truncate text-[10px] font-semibold">{item.entity.name}</p>
              <p className="text-[9px] text-muted-foreground tnum">{item.score}/100</p>
            </div>
          ))}
        </Card>

        <SectionTitle>Detegované reťazce ({analysis.chains.length})</SectionTitle>

        <Card className="space-y-3">
          {analysis.chains.map((chain) => (
            <div key={chain.shellId} className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{byId.get(chain.shellId)?.entity.name}</p>
                <span className="ml-auto">
                  <RiskChip level={chain.severity}>
                    {chain.severity === "critical" ? "Kritické" : "Vysoké"}
                  </RiskChip>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {chain.supplierIds.map((id) => byId.get(id)?.entity.name ?? id).join(", ")} →{" "}
                <span className="font-semibold text-risk-high">schránka</span> →{" "}
                {chain.buyerIds.map((id) => byId.get(id)?.entity.name ?? id).join(", ")}
              </p>
            </div>
          ))}
        </Card>

        <SectionTitle>Detail subjektu</SectionTitle>

        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {focus.entity.kind === "person" ? (
                <User className="h-4 w-4" aria-hidden />
              ) : (
                <Building2 className="h-4 w-4" aria-hidden />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold">{focus.entity.name}</p>
              <p className="text-[11px] text-muted-foreground">{focus.entity.role}</p>
            </div>
            <span className="ml-auto">
              <RiskChip level={focus.level}>{focus.score}/100</RiskChip>
            </span>
          </div>

          <dl className="space-y-1 text-xs">
            <Row label="Adresa" value={focus.entity.address ?? "—"} />
            <Row label="IČO" value={focus.entity.ico ?? "—"} />
            <Row label="Objem" value={formatEur(focus.totalVolume)} />
            <Row label="Zbrane" value={`${focus.weaponCount} ks`} />
          </dl>

          <PlaceholderButton variant="primary" className="w-full">
            Zobraziť kompletný profil
          </PlaceholderButton>
        </Card>
      </Screen>

      <BottomNav />
    </PhoneFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-semibold">{value}</dd>
    </div>
  );
}
