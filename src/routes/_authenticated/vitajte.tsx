import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FolderPlus, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vitajte")({
  head: () => ({
    meta: [
      { title: "Vitajte v Malte" },
      {
        name: "description",
        content: "Tri kroky k prvému prípadu: čo Malte robí, ako funguje a kde sú vaše dáta.",
      },
      { property: "og:title", content: "Vitajte v Malte" },
      { property: "og:description", content: "Úvodný sprievodca forenznou platformou Malte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const steps = [
  {
    icon: Sparkles,
    title: "Čo Malte robí",
    body: "Malte je forenzná analýza finančných tokov. Sleduje subjekty, transakcie a siete vzťahov a upozorní na to, čo nesedí.",
  },
  {
    icon: Workflow,
    title: "Ako to funguje",
    body: "Zadáte údaje prípadu. Detektory automaticky vyhodnotia schránkové firmy, pranie peňazí, cezhraničné toky aj časové vzorce — každé zistenie má vysvetlenie a právny kontext.",
  },
  {
    icon: ShieldCheck,
    title: "Váš prípad, vaše dáta",
    body: "Dáta sú viazané na váš účet a nikto iný ich nevidí. Výstup viete kedykoľvek exportovať do správy.",
  },
];

function Welcome() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const step = steps[index]!;
  const last = index === steps.length - 1;

  async function finish() {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", data.user.id);
    }
    void navigate({ to: last ? "/pripady" : "/prehlad", replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-background px-5 py-10">
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col">
        <button
          type="button"
          onClick={() => void finish()}
          className="self-end text-xs text-muted-foreground underline underline-offset-4"
        >
          Preskočiť
        </button>

        <div className="flex flex-1 flex-col justify-center gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <step.icon className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">{step.title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        </div>

        <div className="mt-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-2 bg-border",
              )}
            />
          ))}
        </div>

        <div className="mt-5">
          {last ? (
            <Button className="w-full" size="lg" onClick={() => void finish()}>
              <FolderPlus className="mr-2 h-4 w-4" aria-hidden />
              Vytvoriť prvý prípad
            </Button>
          ) : (
            <Button className="w-full" size="lg" onClick={() => setIndex(index + 1)}>
              Ďalej
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
