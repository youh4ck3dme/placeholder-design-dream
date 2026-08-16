# Malte — UI/UX kit (dizajn tokeny + obrazovky, tlačidlá ako placeholdery)

Postavím kompletné vizuálne rozhranie aplikácie Malte podľa nahraného mockupu: fialová forenzno-analytická appka v slovenčine, mobile-first, ale použiteľná aj na desktope. Všetky tlačidlá, filtre a odkazy budú **placeholdery** — vyzerajú a reagujú (hover, stlačenie), ale nič nespúšťajú a nie je za nimi žiadna logika ani backend. Dáta na obrazovkách sú statické ukážkové hodnoty z mockupu.

## Dizajn systém

- Paleta v `src/styles.css` (oklch tokeny, light + dark): hlboká fialová `#4C1D95`-tón ako primary, jasná fialová `#7C3AED` ako accent/brand-glow, biele/svetlosivé plochy kariet, tmavý text.
- Sémantické stavové tokeny pre riziko: `risk-high` (červená), `risk-medium` (oranžová), `risk-low` (zelená/sivá), plus `income` (fialová) a `expense` (červená) pre grafy.
- Gradient tokeny (`--gradient-brand` na header a hero), jemné tiene (`--shadow-card`, `--shadow-elevated`), rádius 16–20 px pre karty, pill tvary pre chipy.
- Typografia: geometrický sans (Plus Jakarta Sans / Manrope) načítaný cez `<link>` v roote; číselné hodnoty tabulárne.
- Malte logo-mark (fialový „M" trojuholníkový znak) vygenerujem ako transparentné PNG a použijem v hlavičke a splash.

## Obrazovky (route pre každú)

1. `/` — **Prehľad prípadu**: fialový header s logom a zvončekom, karta „PRÍPAD: TATRA" s celkovou rizikovosťou (VYSOKÉ, 78/100, progress bar), chipy rizikových faktorov, 2×2 mriežka štatistík (Osoby 24, Vzťahy 47, Dôkazy 156, Výpisy 38), zoznam „Aktivita prípadu" s ikonami a časmi.
2. `/analyza-vypisov` — **Analýza výpisov**: sumár transakcií s donut grafom (príjmy/výdavky), rozpis súm, čiarový graf „Vývoj zostatku" s tooltipom, sekcia „Detekcia" s kartami anomálií a farebnými rizikovými štítkami.
3. `/vztahy` — **Vzťahy**: prepínač Graf/Zoznam (taby), grafové zobrazenie uzlov osôb a firiem s prepojeniami a označením „Vysoké riziko", spodná karta „Detail osoby" s údajmi (dátum narodenia, IČO, rizikové skóre, prepojenia) a placeholder CTA „Zobraziť detail osoby".
4. `/viac` — **Viac**: nastavenia a odkazy (dokumenty, audit log, bezpečnosť, o aplikácii) ako neaktívne položky.

Spoločný layout: telefónny rám na desktope (obsah centrovaný v mobilnom stĺpci), fixná spodná navigácia s 5 položkami (Prehľad, Analýza výpisov, Osoby, Vzťahy, Viac) — navigácia medzi obrazovkami funguje, ostatné ovládacie prvky sú placeholdery.

## Technické detaily

- TanStack Start route súbory v `src/routes/`, každá s vlastným `head()` (titul, popis, og).
- Znovupoužiteľné komponenty v `src/components/malte/`: `PhoneFrame`, `AppHeader`, `BottomNav`, `StatCard`, `RiskChip`, `RiskGauge`, `ActivityItem`, `DetectionCard`, `DonutChart`, `BalanceChart`, `RelationGraph`, `PlaceholderButton`.
- Grafy: donut a čiarový graf ako ľahké inline SVG komponenty (bez závislosti na dátovej vrstve), graf vzťahov tiež SVG s absolútne pozicovanými uzlami.
- `PlaceholderButton` je jediné miesto, kde sa „klikanie" rieši — bez akcie, s `aria-disabled` a jemným stlačením; varianty cez `cva`.
- Žiadny backend, žiadna databáza, žiadne stavové ukladanie; obsah v `src/data/mock.ts` ako typované konštanty.
- Bez natvrdo písaných farieb v komponentoch — výhradne sémantické tokeny; light aj dark režim ošetrený.
