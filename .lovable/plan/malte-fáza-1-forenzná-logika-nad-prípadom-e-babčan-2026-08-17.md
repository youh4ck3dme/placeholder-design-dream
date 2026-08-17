# Malte — Fáza 1: forenzná logika nad prípadom E-Babčan

Appka prestane byť čistý UI kit. Demo prípad TATRA nahradím prípadom E-Babčan a pridám skutočnú detekčnú logiku, ktorá beží lokálne v prehliadači (žiadny backend, žiadna databáza). Všetko zostáva v slovenčine, mobile-first, v existujúcom fialovom dizajn systéme.

## Dáta prípadu

Nový modul s typovanými dátami prípadu E-Babčan: osoby (Erik Babčan, Dimitri Cohen), spoločnosti (EB-EU, TATRAGEN, PETRIS-SLOVAKIA, Bark Factory) s IČO, adresami a licenciami, transakcie (sumy 20–40 tis. €, dátumy vrátane dvoch v jeden deň), zbrane so sériovými číslami (Grand Power, STRIBOG, Glock), vzťahy medzi entitami a časová os udalostí. Mock „EUROPOL" a „ORSR" zoznamy slúžia ako lokálna referenčná databáza na overovanie.

## Detekčná logika (skutočné výpočty, nie mock výstupy)

- **Shell company detektor** — nesúlad adresy voči ORSR mocku, žiadny fyzický inventár, rýchla registrácia, nekontaktnosť, vysoké sumy pri nízkej aktivite. Každá vlajka má váhu.
- **Transakčný monitoring** — zaokrúhlené sumy, viac transakcií v jeden deň, rýchle opakovanie v okne 6 mesiacov, podiel hotovosti, platby od tretích strán.
- **Zbrane** — overenie licencie a zhoda sériových čísel voči EUROPOL mocku, detekcia náhleho nárastu objemu.
- **Sieťová analýza** — z hrán grafu sa počítajú reťazce dodávateľ → shell → odberateľ a izolované firmy.
- **Cross-border** — toky do rizikových krajín (ES, PL, FR, UK) nad limitom.
- **Risk scoring** — jedna funkcia, ktorá z vlajok počíta skóre 0–100 a stupeň (nízke/stredné/vysoké/kritické) pre entitu aj pre celý prípad. Skóre zobrazené v UI je výsledok tohto výpočtu, nie natvrdo zapísané číslo.

## Obrazovky

Zachovám spodnú navigáciu a telefónny rám, obsah prepnem na E-Babčan:

1. `/` — **Prehľad prípadu**: prípad E-BABČAN, vypočítané celkové skóre, top červené vlajky, štatistiky (entity, transakcie, zbrane, alerty), posledné detekcie.
2. `/analyza-vypisov` — **Transakčný monitoring**: sumár a grafy z reálnych transakcií, zoznam transakcií s vypočítanými štítkami vlajok, filtre podľa závažnosti (funkčné).
3. `/osoby` — **Entity**: zoznam osôb a firiem s vypočítaným skóre; detail entity s rozpisom vlajok, adresou, licenciou a zoznamom zbraní.
4. `/vztahy` — **Sieť**: graf entít prípadu, zvýraznené shell firmy a odhalené reťazce obchodovania.
5. `/casova-os` — **Časová os** prípadu s udalosťami a ich rizikovou farbou.
6. `/alerty` — **Alerty**: všetky detekcie zoradené podľa skóre, filtre (kritické/vysoké/stredné) fungujú.
7. `/viac` — nastavenia a odkazy, ako doteraz.

Interaktívne bude: navigácia, výber entity, filtre, prepínače záložiek a rozbaľovanie detailov. Akcie ako „Zmraziť účet", export a „Overiť v EUROPOL online" zostávajú placeholdery.

## Technické detaily

- Logika v `src/forensic/`: `types.ts`, `data/e-babcan.ts`, `core/shellCompany.ts`, `core/transactions.ts`, `core/weapons.ts`, `core/network.ts`, `core/crossBorder.ts`, `core/riskScore.ts`, `index.ts` s jedným `analyzeCase()` vstupom.
- Čisté funkcie bez závislostí — žiadny graphlib ani TensorFlow (AI detekcia je Fáza 4, teraz mimo rozsahu).
- Nové obrazovky ako TanStack route súbory v `src/routes/`, každá s vlastným `head()`; sieťový graf a časová os ako inline SVG/CSS, bez novej knižnice.
- Znovupoužijem existujúce komponenty (`PhoneFrame`, `AppHeader`, `BottomNav`, `Card`, `RiskChip`, `PlaceholderButton`), pribudnú `FlagList`, `RiskScoreBadge`, `EntityCard`, `TransactionRow`, `TimelineItem`, `AlertCard`.
- Spodná navigácia bude mať 5 položiek (Prehľad, Transakcie, Entity, Sieť, Viac); Časová os a Alerty budú dostupné z prehľadu.
- Žiadne natvrdo písané farby — výhradne sémantické tokeny; pribudne token pre `risk-critical`.
- `src/data/mock.ts` sa odstráni po prepnutí obrazoviek na forenzné dáta.
