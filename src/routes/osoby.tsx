import { createFileRoute } from "@tanstack/react-router";
import { Building2, Search, User } from "lucide-react";
import { AppHeader, BottomNav, Card, PhoneFrame, RiskChip, Screen, SectionTitle } from "@/components/malte/Shell";
import { PlaceholderButton } from "@/components/malte/PlaceholderButton";
import { graphNodes } from "@/data/mock";

export const Route = createFileRoute("/osoby")({
  head: () => ({
    meta: [
      { title: "Osoby — Malte" },
      {
        name: "description",
        content: "Zoznam preverovaných osôb a firiem prípadu s rizikovým skóre a rolou.",
      },
      { property: "og:title", content: "Osoby — Malte" },
      { property: "og:description", content: "Evidencia osôb a subjektov prípadu s rizikovým hodnotením." },
    ],
  }),
  component: People,
});

const scores = [85, 62, 71, 34, 28, 44];

function People() {
  return (
    <PhoneFrame>
      <AppHeader title="Osoby" actions={<Search className="h-5 w-5 opacity-90" aria-hidden />} />
      <Screen>
        <div className="flex gap-2">
          <PlaceholderButton variant="primary" size="sm">
            Všetky
          </PlaceholderButton>
          <PlaceholderButton size="sm">Osoby</PlaceholderButton>
          <PlaceholderButton size="sm">Firmy</PlaceholderButton>
        </div>

        <SectionTitle>24 subjektov</SectionTitle>

        <Card className="divide-y divide-border p-0">
          {graphNodes.map((node, i) => {
            const score = scores[i] ?? 30;
            const level = score >= 70 ? "high" : score >= 45 ? "medium" : "low";
            return (
              <div key={node.id} className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  {node.kind === "person" ? (
                    <User className="h-4 w-4" aria-hidden />
                  ) : (
                    <Building2 className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{node.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{node.role}</p>
                </div>
                <span className="ml-auto">
                  <RiskChip level={level}>{score}/100</RiskChip>
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