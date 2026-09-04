import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import malteMark from "@/assets/malte-mark.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Prihlásenie — Malte" },
      {
        name: "description",
        content: "Prihláste sa cez Google alebo e-mailom a získajte vlastný súkromný priestor.",
      },
      { property: "og:title", content: "Prihlásenie — Malte" },
      { property: "og:description", content: "Rýchle prihlásenie do forenznej platformy Malte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthScreen,
});

function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/prehlad", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void navigate({ to: "/prehlad", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result && "error" in result && result.error) {
      toast.error("Prihlásenie cez Google zlyhalo.");
      setBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Potvrďte registráciu v e-maile, ktorý sme vám poslali.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Prihlásenie zlyhalo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-background px-5 py-12">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={malteMark} alt="" width={30} height={30} className="h-7 w-7" aria-hidden />
            <span className="text-lg font-extrabold tracking-tight">Malte</span>
          </Link>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === "signin" ? "Prihlásenie" : "Vytvorenie účtu"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Váš priestor je súkromný — prípady vidíte iba vy.
          </p>
        </div>

        <Button className="w-full" variant="outline" onClick={handleGoogle} disabled={busy}>
          Pokračovať cez Google
        </Button>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          alebo e-mailom
          <span className="h-px flex-1 bg-border" />
        </div>

        {sent ? (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm">
            Skontrolujte si e-mail a potvrďte registráciu. Potom sa môžete prihlásiť.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signin" ? "Prihlásiť sa" : "Zaregistrovať sa"}
            </Button>
          </form>
        )}

        <button
          type="button"
          className="text-xs text-muted-foreground underline underline-offset-4"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setSent(false);
          }}
        >
          {mode === "signin" ? "Nemáte účet? Zaregistrujte sa" : "Už máte účet? Prihláste sa"}
        </button>
      </div>
    </main>
  );
}
