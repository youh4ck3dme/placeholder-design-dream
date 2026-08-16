import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Download, FileText, History, Info, ShieldCheck } from "lucide-react";
import { AppHeader, BottomNav, Card, PhoneFrame, Screen, SectionTitle } from "@/components/malte/Shell";
import { PlaceholderButton } from "@/components/malte/PlaceholderButton";
import { morePreview } from "@/data/mock";

export const Route = createFileRoute("/viac")({
  head: () => ({
    meta: [
      { title: "Viac — Malte" },
      {
        name: "description",
        content: "Dokumenty, audit log, bezpečnosť a export prípadu v aplikácii Malte.",
      },
      { property: "og:title", content: "Viac — Malte" },
      { property: "og:description", content: "Nastavenia, bezpečnosť a správa dôkazov prípadu." },
    ],
  }),
  component: More,
});

const icons = [FileText, History, ShieldCheck, Download, Info];

function More() {
  return (
    <PhoneFrame>
      <AppHeader title="Viac" />
      <Screen>
        <SectionTitle>Správa prípadu</SectionTitle>
        <Card className="divide-y divide-border p-0">
          {morePreview.map((item, i) => {
            const Icon = icons[i] ?? Info;
            return (
              <div key={item.title} className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
            );
          })}
        </Card>

        <PlaceholderButton variant="outline" size="lg" className="w-full">
          Odhlásiť sa
        </PlaceholderButton>
        <p className="px-1 text-center text-[10px] text-muted-foreground">
          Ukážkové rozhranie — ovládacie prvky sú bez funkcie.
        </p>
      </Screen>
      <BottomNav />
    </PhoneFrame>
  );
}