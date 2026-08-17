import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, ShieldAlert } from "lucide-react";
import {
  AppHeader,
  BottomNav,
  Card,
  PhoneFrame,
  RiskChip,
  Screen,
  SectionTitle,
} from "@/components/malte/Shell";
import { analyzeCase, eBabcanCase, formatDate } from "@/forensic";

export const Route = createFileRoute("/zbrane")({
  head: () => ({
    meta: [
      { title: "Register zbraní — Malte" },
      {
        name: "description",
        content:
          "Evidencia zbraní prípadu s kontrolou sériových čísel voči databáze EUROPOL a platnosti zbrojných licencií.",
      },
      { property: "og:title", content: "Register zbraní — Malte" },
      {
        property: "og:description",
        content: "Sériové čísla, držitelia a zhody v medzinárodnej databáze odcudzených zbraní.",
      },
    ],
  }),
  component: Weapons,
});

const analysis = analyzeCase(eBabcanCase);
const names = new Map(eBabcanCase.entities.map((e) => [e.id, e.name]));

function Weapons() {
  const matches = analysis.weapons.filter((w) => w.europolMatch).length;

  return (
    <PhoneFrame>
      <AppHeader title="Zbrane" back actions={<Crosshair className="h-5 w-5 opacity-90" aria-hidden />} />

      <Screen>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-risk-high/12 text-risk-high">
            <ShieldAlert className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {matches} z {analysis.weapons.length} zbraní so zhodou v EUROPOL
            </p>
            <p className="text-[11px] text-muted-foreground">
              Kontrola sériových čísel a platnosti licencií
            </p>
          </div>
        </Card>

        <SectionTitle>Evidencia</SectionTitle>

        <Card className="divide-y divide-border p-0">
          {analysis.weapons.map(({ weapon, europolMatch, invalidLicence }) => (
            <div key={weapon.id} className="space-y-1 p-4">
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {weapon.brand} {weapon.model}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground tnum">
                    {weapon.serial} • {formatDate(weapon.acquiredAt)}
                  </p>
                </div>
                <span className="ml-auto">
                  <RiskChip level={europolMatch ? "critical" : invalidLicence ? "high" : "low"}>
                    {europolMatch ? "EUROPOL" : invalidLicence ? "Bez licencie" : "Čisté"}
                  </RiskChip>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Držiteľ {names.get(weapon.holderId) ?? weapon.holderId} • dodávateľ{" "}
                {names.get(weapon.supplierId) ?? weapon.supplierId}
              </p>
            </div>
          ))}
        </Card>
      </Screen>

      <BottomNav />
    </PhoneFrame>
  );
}
