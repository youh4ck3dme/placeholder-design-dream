import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import {
  AppHeader,
  BottomNav,
  Card,
  PhoneFrame,
  Screen,
  SectionTitle,
} from "@/components/malte/Shell";
import { EmptyState } from "@/components/malte/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveCase } from "@/hooks/useActiveCase";
import {
  addEntity,
  addTransaction,
  createCase,
  deleteCase,
  deleteEntity,
  deleteTransaction,
} from "@/lib/case-data";
import { formatDate, formatEur } from "@/forensic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pripady")({
  head: () => ({
    meta: [
      { title: "Prípady — Malte" },
      {
        name: "description",
        content: "Vytvárajte prípady a spravujte subjekty aj transakcie svojej forenznej analýzy.",
      },
      { property: "og:title", content: "Prípady — Malte" },
      { property: "og:description", content: "Správa prípadov, subjektov a transakcií." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CasesScreen,
});

function CasesScreen() {
  const { cases, activeCaseId, setActiveCaseId, activeCase, refresh, loading } = useActiveCase();
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [busy, setBusy] = useState(false);

  const [entityName, setEntityName] = useState("");
  const [entityKind, setEntityKind] = useState<"person" | "company">("person");
  const [entityRole, setEntityRole] = useState("");
  const [entityIco, setEntityIco] = useState("");

  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txAmount, setTxAmount] = useState("");
  const [txFrom, setTxFrom] = useState("");
  const [txTo, setTxTo] = useState("");
  const [txDescription, setTxDescription] = useState("");

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    try {
      await action();
      refresh();
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operácia zlyhala.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateCase(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await run(async () => {
      const id = await createCase({ name: name.trim(), subtitle: subtitle.trim() });
      setActiveCaseId(id);
      setName("");
      setSubtitle("");
    }, "Prípad vytvorený.");
  }

  async function onAddEntity(e: FormEvent) {
    e.preventDefault();
    if (!activeCaseId || !entityName.trim()) return;
    await run(async () => {
      await addEntity(activeCaseId, {
        name: entityName.trim(),
        kind: entityKind,
        role: entityRole.trim(),
        ico: entityIco.trim() || null,
      });
      setEntityName("");
      setEntityRole("");
      setEntityIco("");
    }, "Subjekt pridaný.");
  }

  async function onAddTransaction(e: FormEvent) {
    e.preventDefault();
    if (!activeCaseId || !txFrom || !txTo) return;
    await run(async () => {
      await addTransaction(activeCaseId, {
        date: txDate,
        amount: Number(txAmount || 0),
        method: "transfer",
        fromId: txFrom,
        toId: txTo,
        description: txDescription.trim(),
      });
      setTxAmount("");
      setTxDescription("");
    }, "Transakcia pridaná.");
  }

  return (
    <PhoneFrame>
      <AppHeader title="Prípady" />
      <Screen>
        <SectionTitle>Nový prípad</SectionTitle>
        <Card>
          <form className="space-y-3" onSubmit={onCreateCase}>
            <div className="space-y-1.5">
              <Label htmlFor="case-name">Názov</Label>
              <Input
                id="case-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Napr. Prípad 2026/14"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-subtitle">Popis</Label>
              <Input
                id="case-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Krátka charakteristika"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Vytvoriť prípad
            </Button>
          </form>
        </Card>

        <SectionTitle>Moje prípady ({cases.length})</SectionTitle>
        {cases.length === 0 ? (
          <Card className="p-0">
            <EmptyState
              title={loading ? "Načítavam…" : "Zatiaľ žiadne prípady"}
              detail="Vytvorte prvý prípad a začnite pridávať subjekty a transakcie."
            />
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {cases.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setActiveCaseId(item.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      item.id === activeCaseId && "text-primary",
                    )}
                  >
                    {item.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.subtitle || "bez popisu"} • {formatDate(item.referenceDate)}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Zmazať prípad ${item.name}`}
                  disabled={busy}
                  onClick={() => void run(() => deleteCase(item.id), "Prípad zmazaný.")}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
          </Card>
        )}

        {activeCaseId ? (
          <>
            <SectionTitle>Subjekty prípadu ({activeCase.entities.length})</SectionTitle>
            <Card>
              <form className="space-y-3" onSubmit={onAddEntity}>
                <div className="space-y-1.5">
                  <Label htmlFor="entity-name">Meno / názov</Label>
                  <Input
                    id="entity-name"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  {(["person", "company"] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setEntityKind(kind)}
                      aria-pressed={entityKind === kind}
                      className={cn(
                        "h-9 flex-1 rounded-full border text-xs font-medium transition-colors",
                        entityKind === kind
                          ? "border-transparent gradient-brand text-foreground"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {kind === "person" ? "Osoba" : "Firma"}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="entity-role">Rola</Label>
                  <Input
                    id="entity-role"
                    value={entityRole}
                    onChange={(e) => setEntityRole(e.target.value)}
                    placeholder="Napr. konateľ, dodávateľ"
                  />
                </div>
                {entityKind === "company" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="entity-ico">IČO</Label>
                    <Input
                      id="entity-ico"
                      value={entityIco}
                      onChange={(e) => setEntityIco(e.target.value)}
                    />
                  </div>
                ) : null}
                <Button type="submit" className="w-full" disabled={busy}>
                  Pridať subjekt
                </Button>
              </form>
            </Card>

            {activeCase.entities.length > 0 ? (
              <Card className="divide-y divide-border p-0">
                {activeCase.entities.map((entity) => (
                  <div key={entity.id} className="flex items-center gap-3 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {entity.kind === "person" ? (
                        <User className="h-4 w-4" aria-hidden />
                      ) : (
                        <Building2 className="h-4 w-4" aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{entity.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {entity.role || "bez roly"}
                      </p>
                    </div>
                    <Button
                      className="ml-auto"
                      variant="ghost"
                      size="icon"
                      aria-label={`Zmazať subjekt ${entity.name}`}
                      disabled={busy}
                      onClick={() => void run(() => deleteEntity(entity.id), "Subjekt zmazaný.")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                ))}
              </Card>
            ) : null}

            <SectionTitle>Transakcie ({activeCase.transactions.length})</SectionTitle>
            {activeCase.entities.length < 2 ? (
              <Card className="p-0">
                <EmptyState
                  title="Najprv pridajte aspoň dva subjekty"
                  detail="Transakcia potrebuje odosielateľa aj príjemcu."
                />
              </Card>
            ) : (
              <Card>
                <form className="space-y-3" onSubmit={onAddTransaction}>
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-date">Dátum</Label>
                    <Input
                      id="tx-date"
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-amount">Suma (EUR)</Label>
                    <Input
                      id="tx-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-from">Odosielateľ</Label>
                    <select
                      id="tx-from"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                      value={txFrom}
                      onChange={(e) => setTxFrom(e.target.value)}
                      required
                    >
                      <option value="">Vyberte…</option>
                      {activeCase.entities.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-to">Príjemca</Label>
                    <select
                      id="tx-to"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                      value={txTo}
                      onChange={(e) => setTxTo(e.target.value)}
                      required
                    >
                      <option value="">Vyberte…</option>
                      {activeCase.entities.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-desc">Popis</Label>
                    <Input
                      id="tx-desc"
                      value={txDescription}
                      onChange={(e) => setTxDescription(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Pridať transakciu
                  </Button>
                </form>
              </Card>
            )}

            {activeCase.transactions.length > 0 ? (
              <Card className="divide-y divide-border p-0">
                {activeCase.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {tx.description || "bez popisu"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground tnum">
                        {formatDate(tx.date)} • {formatEur(tx.amount)}
                      </p>
                    </div>
                    <Button
                      className="ml-auto"
                      variant="ghost"
                      size="icon"
                      aria-label="Zmazať transakciu"
                      disabled={busy}
                      onClick={() => void run(() => deleteTransaction(tx.id), "Transakcia zmazaná.")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                ))}
              </Card>
            ) : null}
          </>
        ) : null}
      </Screen>
      <BottomNav />
    </PhoneFrame>
  );
}
