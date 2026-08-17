import { defineMcp, type AnyToolDefinition } from "@lovable.dev/mcp-js";
import analyzeEntity from "./tools/analyze-entity";
import analyzeTransaction from "./tools/analyze-transaction";
import caseOverview from "./tools/case-overview";
import listAlerts from "./tools/list-alerts";
import listEntities from "./tools/list-entities";
import listWeapons from "./tools/list-weapons";
import networkAnalysis from "./tools/network-analysis";

export default defineMcp({
  name: "pixel-polish",
  title: "Pixel Polish",
  version: "0.1.0",
  instructions:
    "Forensic analysis tools for the built-in E-Babčan case (Malte). Start with `case_overview`, then use `list_alerts`, `list_entities`, `analyze_entity`, `analyze_transaction`, `list_weapons` and `network_analysis` for detail. All data is static demo case data; tools are read-only.",
  // exactOptionalPropertyTypes: tools without an outputSchema widen fine at runtime.
  tools: [
    caseOverview,
    listAlerts,
    listEntities,
    analyzeEntity,
    analyzeTransaction,
    listWeapons,
    networkAnalysis,
  ] as unknown as AnyToolDefinition[],
});
