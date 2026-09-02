import { supabase } from "@/integrations/supabase/client";
import type {
  CaseEvent,
  Entity,
  ForensicCase,
  Relation,
  Severity,
  Transaction,
  Weapon,
} from "@/forensic";

export type CaseSummary = {
  id: string;
  name: string;
  subtitle: string;
  referenceDate: string;
  createdAt: string;
};

export async function listCases(): Promise<CaseSummary[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("id, name, subtitle, reference_date, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    subtitle: row.subtitle ?? "",
    referenceDate: row.reference_date,
    createdAt: row.created_at,
  }));
}

export async function createCase(input: {
  name: string;
  subtitle?: string;
  referenceDate?: string;
}): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Nie ste prihlásený.");
  const { data, error } = await supabase
    .from("cases")
    .insert({
      user_id: userId,
      name: input.name,
      subtitle: input.subtitle ?? "",
      reference_date: input.referenceDate ?? new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) throw error;
}

export async function addEntity(caseId: string, input: Partial<Entity> & { name: string }) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Nie ste prihlásený.");
  const { error } = await supabase.from("case_entities").insert({
    case_id: caseId,
    user_id: userId,
    name: input.name,
    kind: input.kind ?? "person",
    role: input.role ?? "",
    ico: input.ico ?? null,
    address: input.address ?? null,
    registered_address: input.registeredAddress ?? null,
    licence: input.licence ?? null,
    country: input.country ?? "SK",
    note: input.note ?? null,
    x: input.x ?? Math.round(20 + Math.random() * 60),
    y: input.y ?? Math.round(20 + Math.random() * 60),
  });
  if (error) throw error;
}

export async function deleteEntity(id: string) {
  const { error } = await supabase.from("case_entities").delete().eq("id", id);
  if (error) throw error;
}

export async function addTransaction(
  caseId: string,
  input: {
    date: string;
    amount: number;
    method: "cash" | "transfer";
    fromId: string;
    toId: string;
    originCountry?: string;
    destinationCountry?: string;
    description?: string;
  },
) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Nie ste prihlásený.");
  const { error } = await supabase.from("case_transactions").insert({
    case_id: caseId,
    user_id: userId,
    date: input.date,
    amount: input.amount,
    method: input.method,
    from_id: input.fromId,
    to_id: input.toId,
    origin_country: input.originCountry ?? "SK",
    destination_country: input.destinationCountry ?? "SK",
    description: input.description ?? "",
  });
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("case_transactions").delete().eq("id", id);
  if (error) throw error;
}

/** Načíta celý prípad a poskladá ho do tvaru, ktorý očakáva forenzné jadro. */
export async function loadCase(caseId: string): Promise<ForensicCase> {
  const [caseRow, entities, transactions, weapons, relations, events] = await Promise.all([
    supabase.from("cases").select("*").eq("id", caseId).maybeSingle(),
    supabase.from("case_entities").select("*").eq("case_id", caseId),
    supabase.from("case_transactions").select("*").eq("case_id", caseId),
    supabase.from("case_weapons").select("*").eq("case_id", caseId),
    supabase.from("case_relations").select("*").eq("case_id", caseId),
    supabase.from("case_events").select("*").eq("case_id", caseId),
  ]);

  const row = caseRow.data;
  if (!row) throw new Error("Prípad sa nenašiel.");

  const mappedEntities: Entity[] = (entities.data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    kind: e.kind === "company" ? "company" : "person",
    role: e.role ?? "",
    ico: e.ico ?? undefined,
    address: e.address ?? undefined,
    registeredAddress: e.registered_address ?? undefined,
    licence: e.licence ?? undefined,
    incorporatedAt: e.incorporated_at ?? undefined,
    physicalInventory: e.physical_inventory ?? undefined,
    responsive: e.responsive ?? undefined,
    country: e.country ?? "SK",
    x: Number(e.x ?? 50),
    y: Number(e.y ?? 50),
    note: e.note ?? undefined,
  }));

  const mappedTransactions: Transaction[] = (transactions.data ?? [])
    .filter((t) => t.from_id && t.to_id)
    .map((t) => ({
      id: t.id,
      date: t.date,
      amount: Number(t.amount ?? 0),
      method: t.method === "cash" ? "cash" : "transfer",
      fromId: t.from_id as string,
      toId: t.to_id as string,
      payerId: t.payer_id ?? undefined,
      originCountry: t.origin_country ?? "SK",
      destinationCountry: t.destination_country ?? "SK",
      description: t.description ?? "",
    }));

  const mappedWeapons: Weapon[] = (weapons.data ?? []).map((w) => ({
    id: w.id,
    brand: w.brand ?? "",
    model: w.model ?? "",
    serial: w.serial ?? "",
    holderId: w.holder_id ?? "",
    supplierId: w.supplier_id ?? "",
    acquiredAt: w.acquired_at ?? row.reference_date,
    licence: w.licence ?? undefined,
  }));

  const mappedRelations: Relation[] = (relations.data ?? [])
    .filter((r) => r.from_id && r.to_id)
    .map((r) => ({ fromId: r.from_id as string, toId: r.to_id as string, label: r.label ?? "" }));

  const mappedEvents: CaseEvent[] = (events.data ?? []).map((ev) => ({
    date: ev.date,
    title: ev.title ?? "",
    detail: ev.detail ?? "",
    severity: (["critical", "high", "medium", "low"].includes(ev.severity)
      ? ev.severity
      : "low") as Severity,
  }));

  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle ?? "",
    referenceDate: row.reference_date,
    entities: mappedEntities,
    transactions: mappedTransactions,
    weapons: mappedWeapons,
    relations: mappedRelations,
    events: mappedEvents,
    europolSerials: row.europol_serials ?? [],
    validLicences: row.valid_licences ?? [],
    orsrAddresses: (row.orsr_addresses as Record<string, string>) ?? {},
  };
}
