import type { EuropolRecord } from "../types";

/**
 * Mock EUROPOL / SIS II referenčná databáza zaistených zbraní.
 * Slúži ako lokálna náhrada za budúce napojenie na reálny register.
 */
export const EUROPOL_RECORDS: EuropolRecord[] = [
  {
    serial: "K086495",
    seizedCountry: "ES",
    seizedAt: "2025-11-28",
    caseRef: "EUR-2025-4471",
    context: "Zaistené pri razii v Málage",
    status: "seized",
  },
  {
    serial: "K055902",
    seizedCountry: "ES",
    seizedAt: "2025-11-28",
    caseRef: "EUR-2025-4471",
    context: "Zaistené pri razii v Málage",
    status: "seized",
  },
  {
    serial: "K055904",
    seizedCountry: "FR",
    seizedAt: "2025-12-19",
    caseRef: "EUR-2025-4602",
    context: "Nájdené pri domovej prehliadke v Marseille",
    status: "seized",
  },
  {
    serial: "K099486",
    seizedCountry: "PL",
    seizedAt: "2025-12-11",
    caseRef: "EUR-2025-4550",
    context: "Zadržaná zásielka pri hranici",
    status: "seized",
  },
  {
    serial: "K056254",
    seizedCountry: "PL",
    seizedAt: "2025-12-11",
    caseRef: "EUR-2025-4550",
    context: "Zadržaná zásielka pri hranici",
    status: "seized",
  },
  {
    serial: "GBA6496",
    seizedCountry: "FR",
    seizedAt: "2025-12-19",
    caseRef: "EUR-2025-4602",
    context: "Použitá pri streľbe, balistická zhoda",
    status: "crime_scene",
  },
  {
    serial: "GBA6501",
    seizedCountry: "FR",
    seizedAt: "2025-12-19",
    caseRef: "EUR-2025-4602",
    context: "Balistická zhoda s otvoreným prípadom",
    status: "crime_scene",
  },
  {
    serial: "GBA6517",
    seizedCountry: "ES",
    seizedAt: "2025-12-02",
    caseRef: "EUR-2025-4488",
    context: "Zaistené organizovanej skupine",
    status: "seized",
  },
  {
    serial: "GBA6525",
    seizedCountry: "PL",
    seizedAt: "2025-12-11",
    caseRef: "EUR-2025-4550",
    context: "Zaistené organizovanej skupine",
    status: "seized",
  },
  {
    serial: "GBA6530",
    seizedCountry: "UK",
    seizedAt: "2026-01-04",
    caseRef: "EUR-2026-0031",
    context: "Zaistené pri kontrole v Londýne",
    status: "seized",
  },
  {
    serial: "CDSV516",
    seizedCountry: "ES",
    seizedAt: "2025-12-02",
    caseRef: "EUR-2025-4488",
    context: "Zaistené organizovanej skupine",
    status: "seized",
  },
  {
    serial: "CGDV051",
    seizedCountry: "FR",
    seizedAt: "2025-12-19",
    caseRef: "EUR-2025-4602",
    context: "Zaistené pri prehliadke vozidla",
    status: "seized",
  },
  {
    serial: "CFVN153",
    seizedCountry: "ES",
    seizedAt: "2025-12-02",
    caseRef: "EUR-2025-4488",
    context: "Hlásené ako stratené",
    status: "wanted",
  },
  {
    serial: "CGAR841",
    seizedCountry: "PL",
    seizedAt: "2025-12-11",
    caseRef: "EUR-2025-4550",
    context: "Zaistené pri prevoze",
    status: "seized",
  },
  {
    serial: "CCZC426",
    seizedCountry: "UK",
    seizedAt: "2026-01-04",
    caseRef: "EUR-2026-0031",
    context: "Hľadaná zbraň",
    status: "wanted",
  },
  {
    serial: "CEDA468",
    seizedCountry: "FR",
    seizedAt: "2025-12-19",
    caseRef: "EUR-2025-4602",
    context: "Balistická zhoda s vraždou",
    status: "crime_scene",
  },
];

const BY_SERIAL = new Map(EUROPOL_RECORDS.map((r) => [normalizeSerial(r.serial), r]));

export function normalizeSerial(serial: string): string {
  return serial.replace(/[\s\-_.]/g, "").toUpperCase();
}

/** Presná zhoda sériového čísla (po normalizácii). */
export function matchEuropolSerial(serial: string): EuropolRecord | null {
  return BY_SERIAL.get(normalizeSerial(serial)) ?? null;
}

/**
 * Fuzzy zhoda — zachytí prepis s jedným chybným znakom (OCR, preklep v spise).
 * Vracia záznam len ak je práve jeden kandidát.
 */
export function fuzzyEuropolSerial(serial: string): EuropolRecord | null {
  const target = normalizeSerial(serial);
  const candidates = EUROPOL_RECORDS.filter((r) => {
    const other = normalizeSerial(r.serial);
    return other.length === target.length && hamming(other, target) === 1;
  });
  return candidates.length === 1 ? candidates[0]! : null;
}

function hamming(a: string, b: string): number {
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) diff += 1;
  return diff;
}

export const EUROPOL_STATUS_LABEL: Record<EuropolRecord["status"], string> = {
  seized: "Zaistená",
  wanted: "Hľadaná",
  crime_scene: "Miesto činu",
};
