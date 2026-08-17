import type { Flag, ForensicCase, Weapon, WeaponAnalysis } from "../types";
import { daysBetween } from "./utils";

export function analyzeWeapon(weapon: Weapon, forensicCase: ForensicCase): WeaponAnalysis {
  const flags: Flag[] = [];
  const europolMatch = forensicCase.europolSerials.includes(weapon.serial);
  const invalidLicence = !weapon.licence || !forensicCase.validLicences.includes(weapon.licence);

  if (europolMatch) {
    flags.push({
      code: "EUROPOL_MATCH",
      label: "Zhoda v EUROPOL databáze",
      detail: `Sériové číslo ${weapon.serial} evidované v kriminálnom prostredí`,
      weight: 35,
      severity: "critical",
    });
  }
  if (invalidLicence) {
    flags.push({
      code: "INVALID_LICENSE",
      label: "Neplatná zbrojná licencia",
      detail: weapon.licence ? `Licencia ${weapon.licence} nie je platná` : "Prevod bez licencie",
      weight: 28,
      severity: "critical",
    });
  }

  return { weapon, flags, europolMatch, invalidLicence };
}

/** Náhly nárast objemu: prvé nadobudnutie vs. počet kusov v okne 8 mesiacov. */
export function detectVolumeSurge(weapons: Weapon[], holderId: string): Flag | null {
  const own = weapons.filter((w) => w.holderId === holderId).sort((a, b) => a.acquiredAt.localeCompare(b.acquiredAt));
  if (own.length < 3) return null;
  const first = own[0]!.acquiredAt;
  const last = own[own.length - 1]!.acquiredAt;
  if (daysBetween(first, last) > 245) return null;
  return {
    code: "VOLUME_SURGE",
    label: "Náhly nárast objemu",
    detail: `${own.length} zbraní nadobudnutých za menej než 8 mesiacov`,
    weight: 20,
    severity: "high",
  };
}
