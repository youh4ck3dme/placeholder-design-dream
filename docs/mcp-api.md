# Malte MCP API

Malte vystavuje svoju forenznú logiku ako **MCP server** (Model Context Protocol).
AI asistent (Claude, ChatGPT, Cursor, Lovable) sa naň pripojí a vie sa pýtať na
prípad **E-Babčan** bez toho, aby mal prístup k databáze alebo kódu.

| Položka | Hodnota |
| --- | --- |
| Endpoint | `/mcp` (napr. `https://placeholder-design-dream.lovable.app/mcp`) |
| Transport | MCP Streamable HTTP (JSON-RPC 2.0 cez POST) |
| Server | `pixel-polish` / „Pixel Polish", verzia `0.1.0` |
| Autentifikácia | **žiadna — verejný prístup** |
| Nástroje | 7, všetky **read-only** |
| Dáta | statické demo dáta prípadu E-Babčan zapísané v kóde (`src/forensic/`) |

> ⚠️ Server je verejný. Ktokoľvek s URL môže volať všetkých 7 nástrojov a prečítať
> celý dataset prípadu (subjekty, rizikové skóre, transakcie, zbrane, EUROPOL zhody).
> Je to v poriadku, kým ide o demo dáta. Pri reálnych dátach pozri sekciu
> [Prechod na OAuth](#prechod-na-oauth).

## Pripojenie z AI klienta

Do konektora zadaj URL `https://<tvoja-doména>/mcp` ako *Streamable HTTP* MCP server.
Prihlásenie sa nevyžaduje. Klient si sám načíta zoznam nástrojov cez `tools/list`.

## Volanie cez HTTP

MCP nie je „jedna metóda = jeden nástroj". Nástroj sa volá vždy metódou
`tools/call`, meno nástroja ide do `params.name`:

```bash
curl -X POST https://<tvoja-doména>/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": { "name": "case_overview", "arguments": {} }
  }'
```

Hlavička `Accept: application/json, text/event-stream` je **povinná** — bez nej
server odpovie `406 Not Acceptable`.

Plné spojenie (tak, ako to robí AI klient) má tri kroky:

1. `initialize` — odpoveď obsahuje hlavičku `Mcp-Session-Id`, posielaj ju v ďalších requestoch
2. notifikácia `notifications/initialized` (bez `id`)
3. `tools/list` a potom `tools/call`

Výsledok nástroja príde ako text v `result.content[0].text` a obsahuje JSON.
Pri chybe je `result.isError = true` a text obsahuje čitateľné vysvetlenie.

## Prehľad nástrojov

| Nástroj | Popis | Parametre |
| --- | --- | --- |
| `case_overview` | Prehľad prípadu: skóre, súčty, počty alertov, najsilnejšie red flagy | žiadne |
| `list_alerts` | Alerty zoradené podľa skóre | `severity?`, `source?`, `limit?` (1–100, default 20) |
| `list_entities` | Osoby a firmy so skóre a shell statusom | `kind?` (`person`\|`company`), `shellOnly?` (default `false`) |
| `analyze_entity` | Detektory pre jeden subjekt + jeho transakcie | `entity` (id alebo časť názvu) |
| `analyze_transaction` | Pravidlá monitoringu pre jednu transakciu | `transactionId` |
| `list_weapons` | Register zbraní, EUROPOL zhody, licencie | `europolOnly?` (default `false`) |
| `network_analysis` | Reťazce, cesty peňazí, pranie, koridory, časové vzory | žiadne |

Povolené hodnoty:

- `severity`: `critical` \| `high` \| `medium` \| `low` (filtruje presne na túto úroveň, nie „a vyššie")
- `source`: `entita` \| `transakcia` \| `zbraň` \| `sieť` \| `cezhraničné` \| `pranie peňazí` \| `časový vzor`

Identifikátory v demo dátach:

- subjekty: `ebeu`, `bark`, `tavira`, `cohen`, `babcan`, `petris`, `tatragen`
- transakcie: `t1` … `t10`

## Nástroje detailne

Ukážky nižšie sú **skrátené skutočné odpovede** zo živého servera.

### `case_overview`

```json
{ "name": "case_overview", "arguments": {} }
```

```json
{
  "case": { "id": "e-babcan", "name": "PRÍPAD: E-BABČAN", "referenceDate": "2026-01-10" },
  "caseScore": 100,
  "caseLevel": "critical",
  "totals": { "entities": 7, "companies": 5, "transactions": 10, "volume": 386000,
              "cashRatio": 0.4456, "weapons": 16, "europolMatches": 16 },
  "alertCounts": { "critical": 25, "high": 16, "medium": 3, "low": 5 },
  "topFlags": [ { "code": "SHELL_CONTROL", "label": "Ovládanie schránkových firiem", "weight": 46, "severity": "critical" } ],
  "chains": 3,
  "moneyPaths": 6
}
```

### `list_alerts`

```json
{ "name": "list_alerts", "arguments": { "severity": "critical", "limit": 2 } }
```

```json
{
  "total": 25,
  "items": [
    { "id": "entity-ebeu", "title": "Schránková firma: EB-EU s.r.o.",
      "detail": "Zbrane so zhodou v EUROPOL • Ovládanie schránkových firiem • …",
      "severity": "critical", "score": 100, "source": "entita" }
  ]
}
```

`total` je počet po filtrovaní, `items` je orezaný na `limit`.

### `list_entities`

```json
{ "name": "list_entities", "arguments": { "kind": "company", "shellOnly": true } }
```

```json
{
  "total": 3,
  "items": [
    { "id": "ebeu", "name": "EB-EU s.r.o.", "kind": "company", "role": "Odberateľ zbraní",
      "country": "SK", "ico": "51226511", "score": 100, "level": "critical",
      "isShell": true, "weaponCount": 9, "totalVolume": 259000 }
  ]
}
```

### `analyze_entity`

```json
{ "name": "analyze_entity", "arguments": { "entity": "ebeu" } }
```

Prijme id (`ebeu`) aj časť názvu (`EB-EU`).

```json
{
  "entity": { "id": "ebeu", "name": "EB-EU s.r.o.", "ico": "51226511",
              "address": "Kukučínova 22, Banská Bystrica", "licence": "LA002318",
              "incorporatedAt": "2025-04-02", "physicalInventory": false, "responsive": false },
  "score": 100, "level": "critical", "isShell": true,
  "flags": [
    { "code": "EUROPOL_HOLDER", "label": "Zbrane so zhodou v EUROPOL",
      "detail": "9 kusov evidovaných v kriminálnom prostredí", "weight": 30, "severity": "critical" },
    { "code": "NO_PHYSICAL_PRESENCE", "label": "Žiadny fyzický inventár", "weight": 22, "severity": "high" }
  ],
  "weaponCount": 9, "totalVolume": 259000,
  "transactions": [ { "id": "t3", "amount": 30000, "method": "cash", "score": 78, "level": "high" } ]
}
```

Neznámy subjekt vráti `isError` a zoznam známych id:

```
No entity matches "NEEXISTUJE". Known ids: ebeu, bark, tavira, cohen, babcan, petris, tatragen
```

### `analyze_transaction`

```json
{ "name": "analyze_transaction", "arguments": { "transactionId": "t3" } }
```

```json
{
  "transaction": { "id": "t3", "date": "2025-08-15", "amount": 30000, "method": "cash",
                   "from": "EB-EU s.r.o.", "to": "PETRIS-SLOVAKIA s.r.o.",
                   "originCountry": "SK", "destinationCountry": "SK" },
  "score": 78, "level": "high",
  "flags": [
    { "code": "ROUND_AMOUNT", "label": "Zaokrúhlená suma", "weight": 18, "severity": "medium" },
    { "code": "CASH_HIGH_VALUE", "label": "Vysoká hotovostná platba", "weight": 24, "severity": "high" },
    { "code": "SAME_DAY", "label": "Viac transakcií v jeden deň", "weight": 20, "severity": "high" },
    { "code": "RAPID_SUCCESSIVE", "label": "Rýchle opakovanie nákupov", "weight": 16, "severity": "high" }
  ]
}
```

### `list_weapons`

```json
{ "name": "list_weapons", "arguments": { "europolOnly": true } }
```

```json
{
  "total": 16,
  "items": [
    { "id": "w1", "brand": "Grand Power", "model": "K100", "serial": "K086495",
      "holder": "EB-EU s.r.o.", "supplier": "TATRAGEN s.r.o.", "acquiredAt": "2025-05-12",
      "licence": "LA002318", "europolMatch": true, "fuzzyMatch": false, "invalidLicence": false,
      "europolRecord": { "serial": "K086495", "seizedCountry": "ES", "seizedAt": "2025-11-28",
                         "caseRef": "EUR-2025-4471", "context": "Zaistené pri razii v Málage" } }
  ]
}
```

V demo dátach majú zhodu v (mock) EUROPOL databáze všetky evidované zbrane.

### `network_analysis`

```json
{ "name": "network_analysis", "arguments": {} }
```

```json
{
  "chains": [ { "shell": "EB-EU s.r.o.",
                "suppliers": ["Erik Babčan", "Dimitri Cohen", "TATRAGEN s.r.o.", "Tavira Trade S.L."],
                "buyers": ["Tavira Trade S.L.", "TATRAGEN s.r.o.", "PETRIS-SLOVAKIA s.r.o."],
                "severity": "critical" } ],
  "moneyPaths": [ { "id": "t5>t6", "route": ["Tavira Trade S.L.", "EB-EU s.r.o.", "TATRAGEN s.r.o."],
                    "hops": 2, "crossesBorder": true, "returnsToOrigin": false, "severity": "high" } ],
  "launderingSignals": [],
  "corridors": [],
  "crossBorderAlerts": [],
  "temporalPatterns": []
}
```

## Obmedzenia

- **Iba čítanie.** Žiadny nástroj nič nezapisuje ani nemení. Cez MCP sa dataset nedá upraviť.
- **Statické dáta.** Prípad E-Babčan je zapísaný v kóde, nie v databáze. Zmena dát = zmena kódu a nasadenie.
- **Bez multi-tenancy.** Existuje jediný prípad; nástroje neberú `caseId`.
- **Analýza je memoizovaná** počas života procesu — opakované volania vracajú identický výsledok.
- Odpoveď je JSON v textovom bloku; klient si ju musí sparsovať.

## Prechod na OAuth

Ak sa demo dáta nahradia reálnym spisom, verejný prístup musí skončiť. Postup:

1. Zapnúť OAuth 2.1 autorizačný server v Lovable Cloud (vrátane dynamickej registrácie klientov).
2. Doplniť súhlasnú (consent) obrazovku, na ktorej sa používateľ prihlási a schváli klienta.
3. V `src/lib/mcp/index.ts` pridať do `defineMcp` konfiguráciu `auth` s vydavateľom tokenov.
4. V nástrojoch čítať identitu z kontextu a dopytovať dáta v mene prihláseného používateľa, aby platili prístupové pravidlá databázy.

Do tej doby platí: **na tento server nepatria žiadne skutočné osobné ani spisové údaje.**
