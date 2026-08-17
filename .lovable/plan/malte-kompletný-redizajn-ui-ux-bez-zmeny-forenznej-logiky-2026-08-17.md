# Malte — kompletný redizajn UI/UX (bez zmeny forenznej logiky)

Cieľ: z demo mobilného kitu spraviť produkt, ktorý vyzerá ako reálny nástroj pre vyšetrovateľa — konzistentný vizuálny jazyk, čitateľná hierarchia dát, plynulé mikroanimácie, plnohodnotný desktop režim a poriadne stavy (načítanie, prázdno, chyba). Detekčné jadro v `src/forensic/`, MCP server a dáta prípadu E‑Babčan sa **nemenia**.

## 1. Dizajn systém (src/styles.css)

- Presnejšia fialová škála: pridám `--surface`, `--surface-2`, `--overlay`, `--brand-contrast` a jemné „glass" tokeny pre lepšie vrstvenie kariet (dnes je všetko rovnaká biela).
- Rozšírené tiene (`--shadow-soft`, `--shadow-card`, `--shadow-elevated`, `--shadow-glow`) a tokeny pre focus ring, ktoré rešpektujú klávesnicu (`:focus-visible`).
- Typografická škála ako utility (`.text-display`, `.text-metric`, `.text-label`) — dnes sú veľkosti roztrúsené ako `text-[10px]`/`text-[11px]` v každom súbore.
- Motion tokeny (trvanie + easing) a `@media (prefers-reduced-motion)` vypnutie.
- Doladený dark režim + prepínač témy (svetlá/tmavá/systém) uložený v existujúcom store.

## 2. Layout a navigácia

- **Responzívny shell**: na mobile ostáva dnešný telefónny rám; od `lg` sa appka rozloží do desktop pracovnej plochy — ľavý bočný panel s navigáciou, hlavný obsah v mriežke, pravý stĺpec s detailom (namiesto spodného panela). Jeden `AppShell` rieši oboje.
- Header: zmenší sa pri scrollovaní, drží názov prípadu + globálne skóre rizika stále na očiach.
- Spodná navigácia dostane indikátor aktívnej položky s animáciou a badge s počtom kritických alertov.
- **Globálne vyhľadávanie / command palette** (⌘K): subjekty, transakcie, zbrane, skoky na obrazovky.

## 3. Obrazovky

- `/` Prehľad: hero karta s radiálnym ukazovateľom rizika a trendom, kompaktné KPI dlaždice, „Top 3 zistenia" so zdôvodnením, časová os aktivity.
- `/analyza-vypisov`: lepšie grafy (osi, mriežka, hover tooltip, zvýraznenie rizikových bodov), sticky filtračná lišta so segmentmi a počtami, zoznam detekcií s prehľadnejšími riadkami a vysvetlením príznaku.
- `/osoby`: karty subjektov s avatarom/iniciálami, rizikovým pruhom a rýchlymi akciami; filtre ako segmentované ovládanie.
- `/vztahy` + `/siet`: zjednotený vizuál grafu (legenda, minimapa, zoom ovládače, farby podľa rizika, zvýraznenie cesty).
- `/zbrane`: EUROPOL zhody ako výrazný stavový blok, dávky sériových čísel ako vizuálna sekvencia.
- `/viac`: prepínač témy, prehľad auditu, odkaz na MCP dokumentáciu.
- Nová `/mcp-info`: prehľad 7 nástrojov a návod na pripojenie.

## 4. Interakcie a stavy

- Detail subjektu/transakcie: mobil = bottom sheet s drag úchytom a pružinovou animáciou, desktop = pravý panel; obsah rozdelený do sekcií (Príznaky / Transakcie / Prepojenia).
- Skeleton stavy pri analýze, prázdne stavy s ilustráciou a návrhom ďalšieho kroku, error boundary s peknou stránkou.
- Mikroanimácie: postupné objavovanie kariet, počítadlá skóre, plynulé prechody filtrov.
- Prístupnosť: kontrast AA, ARIA na sheet/taby/graf, plná ovládateľnosť klávesnicou, `aria-live` pre výsledky filtrovania.
- PDF export dostane vlastnú štýlovú šablónu (hlavička prípadu, sekcie, tabuľky) namiesto surového HTML.

## 5. Technické detaily

- Nové/upravené: `src/components/malte/AppShell.tsx` (nahrádza `PhoneFrame` interne), `Shell.tsx`, `Charts.tsx`, `NetworkGraph.tsx`, `DetectorSheet.tsx`, `RiskFilter.tsx`, plus nové `CommandPalette.tsx`, `RiskGauge.tsx`, `EmptyState.tsx`, `ThemeToggle.tsx`, `Skeleton` využitie.
- Rozšírenie `useCaseStore` o tému a stav palety (perzistencia cez existujúce IndexedDB).
- Žiadne nové ťažké závislosti; animácie cez `tw-animate-css` + CSS. Existujúci `@xyflow/react` ostáva.
- Každá route si ponechá vlastný `head()`; doplním `og:image` tam, kde má zmysel.
- Na záver lint, typecheck, produkčný build a QA prechod cez Playwright (mobil 393×852 aj desktop 1440) so screenshotmi.
