export type Severity = "critical" | "high" | "medium" | "low";

export type Flag = {
  code: string;
  label: string;
  detail: string;
  weight: number;
  severity: Severity;
};

export type EntityKind = "person" | "company";

export type Entity = {
  id: string;
  name: string;
  kind: EntityKind;
  role: string;
  ico?: string;
  address?: string;
  /** Adresa evidovaná v ORSR (mock referenčná databáza). */
  registeredAddress?: string;
  licence?: string;
  incorporatedAt?: string;
  physicalInventory?: boolean;
  responsive?: boolean;
  country: string;
  x: number;
  y: number;
  note?: string;
};

export type PaymentMethod = "cash" | "transfer";

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  fromId: string;
  toId: string;
  /** Skutočný platiteľ, ak sa líši od zmluvnej strany (platba tretej strany). */
  payerId?: string;
  originCountry: string;
  destinationCountry: string;
  description: string;
};

export type Weapon = {
  id: string;
  brand: string;
  model: string;
  serial: string;
  holderId: string;
  supplierId: string;
  acquiredAt: string;
  licence?: string;
};

export type Relation = {
  fromId: string;
  toId: string;
  label: string;
};

export type CaseEvent = {
  date: string;
  title: string;
  detail: string;
  severity: Severity;
};

export type ForensicCase = {
  id: string;
  name: string;
  subtitle: string;
  referenceDate: string;
  entities: Entity[];
  transactions: Transaction[];
  weapons: Weapon[];
  relations: Relation[];
  events: CaseEvent[];
  /** Mock referenčné databázy. */
  europolSerials: string[];
  validLicences: string[];
  orsrAddresses: Record<string, string>;
};

export type EntityAnalysis = {
  entity: Entity;
  flags: Flag[];
  score: number;
  level: Severity;
  isShell: boolean;
  weaponCount: number;
  totalVolume: number;
};

export type TransactionAnalysis = {
  transaction: Transaction;
  flags: Flag[];
  score: number;
  level: Severity;
};

export type WeaponAnalysis = {
  weapon: Weapon;
  flags: Flag[];
  europolMatch: boolean;
  invalidLicence: boolean;
};

export type TraffickingChain = {
  shellId: string;
  supplierIds: string[];
  buyerIds: string[];
  severity: Severity;
};

export type CrossBorderAlert = {
  transactionId: string;
  route: string;
  amount: number;
  score: number;
};

export type Alert = {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
  score: number;
  source: "entita" | "transakcia" | "zbraň" | "sieť" | "cezhraničné";
  date?: string;
};

export type CaseAnalysis = {
  case: ForensicCase;
  entities: EntityAnalysis[];
  transactions: TransactionAnalysis[];
  weapons: WeaponAnalysis[];
  chains: TraffickingChain[];
  crossBorder: CrossBorderAlert[];
  alerts: Alert[];
  caseScore: number;
  caseLevel: Severity;
  topFlags: Flag[];
  totals: {
    entities: number;
    companies: number;
    transactions: number;
    volume: number;
    cashRatio: number;
    weapons: number;
    europolMatches: number;
  };
};
