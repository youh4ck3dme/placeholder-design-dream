export type RiskLevel = "high" | "medium" | "low";

export const caseSummary = {
  name: "PRÍPAD: TATRA",
  updatedAt: "Aktualizované dnes 09:41",
  riskLabel: "VYSOKÉ",
  riskScore: 78,
  riskChips: ["Neobvyklé transakcie", "Prepojené osoby", "Hotovosť"],
};

export const caseStats = [
  { label: "Osoby", value: "24", icon: "users" as const },
  { label: "Vzťahy", value: "47", icon: "network" as const },
  { label: "Dôkazy", value: "156", icon: "file" as const },
  { label: "Výpisy", value: "38", icon: "receipt" as const },
];

export const caseActivity = [
  {
    title: "Nový bankový výpis",
    detail: "Tatra banka a.s. • 15. 3. 2024",
    time: "09:21",
    tone: "info" as const,
  },
  {
    title: "Zvýšené riziko",
    detail: "Neobvyklá štruktúra platieb",
    time: "08:47",
    tone: "high" as const,
  },
  {
    title: "Pridaná osoba",
    detail: "Ján Novák",
    time: "Včera",
    tone: "low" as const,
  },
];

export const statementSummary = {
  period: "1. 1. 2023 – 12. 5. 2024",
  total: "2 946 321,68 €",
  delta: "18,4 %",
  deltaNote: "vs. predch. obdobie",
  income: { label: "Príjmy", value: "1 782 129 €", compare: "1 641 92 €" },
  expense: { label: "Výdavky", value: "1 064 192 €", compare: "99 842 €" },
};

export const balanceSeries = [
  120, 140, 132, 168, 155, 190, 176, 210, 198, 236, 224, 258, 241, 268, 252, 290,
];

export const balancePeak = { label: "12. 4. 2024", value: "235 540 €" };

export const detections: {
  title: string;
  detail: string;
  level: RiskLevel;
  levelLabel: string;
}[] = [
  {
    title: "Neobvyklá transakcia",
    detail: "12. 4. 2024 • 235 000 €",
    level: "high",
    levelLabel: "Vysoké riziko",
  },
  {
    title: "Štrukturované platby",
    detail: "7.–9. 4. 2024 • 8 transakcií",
    level: "medium",
    levelLabel: "Stredné riziko",
  },
  {
    title: "Hotovostný výber",
    detail: "5. 4. 2024 • 19 000 €",
    level: "low",
    levelLabel: "Nízke riziko",
  },
];

export type GraphNode = {
  id: string;
  name: string;
  role: string;
  kind: "person" | "company";
  x: number;
  y: number;
  center?: boolean;
  risky?: boolean;
};

export const graphNodes: GraphNode[] = [
  { id: "center", name: "Ján Novák", role: "Preverovaný", kind: "person", x: 50, y: 50, center: true },
  { id: "peter", name: "Peter Kováč", role: "Spoločník", kind: "person", x: 50, y: 12 },
  { id: "tatra", name: "Tatra Consulting s.r.o.", role: "Firma", kind: "company", x: 12, y: 40, risky: true },
  { id: "alfa", name: "Alfa Trade s.r.o.", role: "Firma", kind: "company", x: 88, y: 40 },
  { id: "maria", name: "Mária Nováková", role: "Príbuzná osoba", kind: "person", x: 16, y: 88 },
  { id: "gregor", name: "Gregor Horváth", role: "Konateľ", kind: "person", x: 84, y: 88 },
];

export const graphEdges: [string, string][] = [
  ["center", "peter"],
  ["center", "tatra"],
  ["center", "alfa"],
  ["center", "maria"],
  ["center", "gregor"],
  ["tatra", "maria"],
  ["alfa", "gregor"],
];

export const personDetail = {
  name: "Ján Novák",
  subtitle: "Detail osoby",
  rows: [
    { label: "Dátum narodenia", value: "14. 3. 1978" },
    { label: "IČO", value: "36 123 456" },
    { label: "Rizikové skóre", value: "85/100", tone: "high" as const },
    { label: "Prepojenia", value: "12 osôb, 4 firmy" },
  ],
};

export const morePreview = [
  { title: "Dôkazy a dokumenty", detail: "Prehľadná správa evidencie" },
  { title: "Audit log", detail: "Kompletná história úkonov" },
  { title: "Bezpečnosť", detail: "Šifrované úložisko, 2FA" },
  { title: "Export prípadu", detail: "PDF / CSV výstup" },
  { title: "O aplikácii", detail: "Malte • verzia 1.0.0" },
];