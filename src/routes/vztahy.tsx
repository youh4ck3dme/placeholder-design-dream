import { createFileRoute } from "@tanstack/react-router";
import { Building2, MoreVertical, Search, User } from "lucide-react";
import { AppHeader, BottomNav, Card, PhoneFrame, PhoneFrame as _P, Screen } from "@/components/malte/Shell";
import { PlaceholderButton } from "@/components/malte/PlaceholderButton";
import { graphEdges, graphNodes, personDetail } from "@/data/mock";

export const Route = createFileRoute("/vztahy")({
  head: () => ({
    meta: [
      { title: "Vzťahy — Malte" },
      {
        name: "description",
        content: "Grafické zobrazenie väzieb medzi osobami a firmami vrátane rizikových prepojení.",
      },
      { property: "og:title", content: "Vzťahy — Malte" },
      {
        property: "og:description",
        content: "Sieť osôb a firiem s rizikovým skóre a detailom preverovanej osoby.",
      },
    ],
  }),
  component: Relations,
});

function Relations() {
  const byId = Object.fromEntries(graphNodes.map((n) => [n.id, n]));

  return (
    <PhoneFrame>
      <AppHeader
        title="Vzťahy"
        back
        actions={
          <>
            <Search className="h-5 w-5 opacity-90" aria-hidden />
            <MoreVertical className="h-5 w-5 opacity-90" aria-hidden />
          </>
        }
      >
        <div className="mt-1 flex gap-6 px-6 text-xs font-medium">
          <span className="border-b-2 border-primary-foreground pb-2">Graf vzťahov</span>
          <span className="pb-2 opacity-70">Zoznam</span>
        </div>
      </AppHeader>

      <Screen>
        <Card className="relative h-[320px] overflow-hidden">
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            {graphEdges.map(([a, b]) => {
              const from = byId[a]!;
              const to = byId[b]!;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="var(--border)"
                  strokeWidth="1.5"
                  strokeDasharray={to.risky || from.risky ? "4 4" : undefined}
                />
              );
            })}
          </svg>

          {graphNodes.map((node) => (
            <div
              key={node.id}
              className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span
                className={
                  node.center
                    ? "flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-primary-foreground shadow-card"
                    : node.risky
                      ? "flex h-9 w-9 items-center justify-center rounded-full border border-risk-high/40 bg-risk-high/10 text-risk-high"
                      : "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground"
                }
              >
                {node.kind === "person" ? (
                  <User className={node.center ? "h-6 w-6" : "h-4 w-4"} aria-hidden />
                ) : (
                  <Building2 className="h-4 w-4" aria-hidden />
                )}
              </span>
              <span className="text-[10px] leading-tight font-semibold">{node.name}</span>
              <span className="text-[9px] leading-tight text-muted-foreground">{node.role}</span>
              {node.center ? (
                <span className="rounded-full bg-risk-high/12 px-2 py-0.5 text-[9px] font-semibold text-risk-high">
                  Vysoké riziko
                </span>
              ) : null}
            </div>
          ))}
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold">{personDetail.name}</p>
              <p className="text-[11px] text-muted-foreground">{personDetail.subtitle}</p>
            </div>
            <MoreVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>

          <dl className="mt-4 space-y-2">
            {personDetail.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd
                  className={
                    "tone" in row && row.tone === "high"
                      ? "font-semibold text-risk-high tnum"
                      : "font-semibold tnum"
                  }
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <PlaceholderButton variant="primary" size="lg" className="mt-4 w-full">
            Zobraziť detail osoby
          </PlaceholderButton>
        </Card>
      </Screen>

      <BottomNav />
    </PhoneFrame>
  );
}