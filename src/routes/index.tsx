import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Network, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import malteMark from "@/assets/malte-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Malte — forenzná analýza finančných tokov" },
      {
        name: "description",
        content:
          "Malte je súkromný forenzný nástroj: subjekty, transakcie, siete vzťahov a právny kontext vo vašom vlastnom prípade.",
      },
      { property: "og:title", content: "Malte — forenzná analýza finančných tokov" },
      {
        property: "og:description",
        content: "Vytvorte si vlastný prípad a nechajte detektory odhaliť rizikové vzorce.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Sparkles,
    title: "Automatické detektory",
    detail: "Schránkové firmy, pranie peňazí, cezhraničné toky a časové vzorce.",
  },
  {
    icon: Network,
    title: "Sieť vzťahov",
    detail: "Prepojenia medzi osobami, firmami a transakciami v jednom grafe.",
  },
  {
    icon: ShieldCheck,
    title: "Súkromné dáta",
    detail: "Každý prípad je viazaný na váš účet. Nikto iný ho nevidí.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) void navigate({ to: "/prehlad", replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-12 px-5 py-14 sm:py-20">
        <header className="flex items-center gap-2">
          <img src={malteMark} alt="" width={32} height={32} className="h-8 w-8" aria-hidden />
          <span className="text-xl font-extrabold tracking-tight">Malte</span>
          <span className="ml-auto">
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Prihlásiť sa
              </Button>
            </Link>
          </span>
        </header>

        <section className="space-y-5">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Analýza. Dôkazy. Rozhodnutia.
          </p>
          <h1 className="max-w-[20ch] text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Forenzná analýza finančných tokov
          </h1>
          <p className="max-w-[60ch] text-sm text-muted-foreground sm:text-base">
            Zadajte subjekty a transakcie svojho prípadu. Malte vyhodnotí schránkové firmy, pranie
            peňazí, cezhraničné toky aj časové vzorce — s vysvetlením a právnym kontextom.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg" disabled={checking}>
                Začať zadarmo
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-3 text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </section>

        <footer className="text-xs text-muted-foreground">
          Malte • súkromný nástroj, obsah nie je indexovaný.
        </footer>
      </div>
    </main>
  );
}
