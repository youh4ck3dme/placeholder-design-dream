# Malte: onboarding, prihlásenie a čistý štart pre nových používateľov

Cieľ: aplikácia prestane byť demom prípadu E-Babčan. Každý nový používateľ dostane prázdnu, súkromnú aplikáciu pre vlastné prípady, sprevádzanú tromi úvodnými obrazovkami a rýchlym prihlásením cez Google. Zdrojový ZIP prestane byť verejný.

## 1. Ostrý test stiahnutia ZIP a presun do privátneho úložiska

Dnes je archív na verejnej adrese `/malte-source.zip` (391 kB) — stiahne ho ktokoľvek bez prihlásenia.

- Prebalím aktuálny stav repozitára (bez `node_modules`, `.git`, `.env`) do nového archívu.
- Nahrám ho do existujúceho privátneho bucketu `private-bucket` pod `source/malte-source.zip`.
- Verejný súbor z `public/` odstránim.
- V sekcii „Viac“ bude položka na stiahnutie viditeľná **iba pre admin účet `erikbabcan@gmail.com`**. Klik vygeneruje dočasný podpísaný odkaz (platnosť 5 minút) cez serverovú funkciu, ktorá najprv overí admin rolu.
- Ostrý test: prehliadačom prejdem celý tok — neprihlásený používateľ položku nevidí, bežný používateľ dostane odmietnutie, admin súbor reálne stiahne a overím veľkosť aj to, že ZIP sa dá rozbaliť.

## 2. Autentifikácia

- Nová verejná obrazovka `/auth`: Google prihlásenie (jedno tlačidlo, spravované cez Lovable) + e-mail/heslo registrácia a prihlásenie.
- Google provider zapnem v nastaveniach prihlasovania v tej istej zmene.
- Po prihlásení sa vytvorí profil používateľa a presmeruje sa do aplikácie (alebo do onboardingu, ak ho ešte neabsolvoval).
- Odhlásenie pribudne v sekcii „Viac“.
- Admin rola pre `erikbabcan@gmail.com` sa priraďuje automaticky pri prvom prihlásení, cez samostatnú tabuľku rolí.

## 3. Tri welcome / onboarding obrazovky

Zobrazia sa raz po prvom prihlásení (dá sa preskočiť aj znova spustiť z „Viac“):

1. **Čo Malte robí** — forenzná analýza finančných tokov: subjekty, transakcie, siete vzťahov.
2. **Ako to funguje** — nahráte alebo zadáte údaje prípadu, detektory automaticky vyhodnotia schránkové firmy, pranie peňazí, cezhraničné toky a časové vzorce; každé zistenie má vysvetlenie a právny kontext.
3. **Váš prípad, vaše dáta** — dáta sú viazané na váš účet, nikto iný ich nevidí; výstup viete exportovať do správy. Tlačidlo „Vytvoriť prvý prípad“.

Dizajn zostáva v existujúcom štýle (Flutter-like zaoblenie, neutrálna paleta, svetlý/tmavý režim), swipe/tečkový indikátor, plne responzívne.

## 4. Odstránenie demo prípadu E-Babčan

Podľa vášho rozhodnutia sa demo úplne odstráni z aplikácie — žiadne citlivé údaje nikde nezostanú.

- Zmažem `src/forensic/data/e-babcan.ts` a všetky natvrdo zapísané mená, adresy, IČO, sériové čísla a sumy.
- Obrazovky (Prehľad, Analýza, Osoby, Vzťahy, Sieť, Zbrane, Právny kontext) budú čítať prípad prihláseného používateľa z databázy. Bez prípadu zobrazia prázdny stav s výzvou na vytvorenie prípadu.
- MCP nástroje prestanú vracať demo dáta; budú pracovať nad prípadmi vlastníka tokenu (bez prípadu vracajú prázdny výsledok).
- Forenzná logika (detektory, skórovanie, právny modul) zostáva nedotknutá — mení sa iba zdroj dát.

## 5. Dáta používateľa v cloude

Nové tabuľky s prísnym oddelením podľa účtu (každý vidí len svoje riadky):

- `profiles` — meno, e-mail, stav onboardingu
- `user_roles` + funkcia na overenie roly (admin)
- `cases` — prípad používateľa (názov, popis, referenčný dátum)
- `case_entities` — osoby a firmy prípadu
- `case_transactions` — transakcie
- `case_weapons` — položky registra zbraní
- `case_events` — časová os

Prípady sa dajú vytvárať, upravovať a mazať priamo v aplikácii; jednoduchý CRUD formulár pre subjekty a transakcie, aby bol nový účet reálne použiteľný.

## Technické poznámky

- Chránené obrazovky pôjdu pod `src/routes/_authenticated/`, verejné zostanú `/auth` a onboarding.
- Čítanie/zápis dát cez `createServerFn` s `requireSupabaseAuth`; RLS podľa `auth.uid()`.
- Podpísaný odkaz na ZIP generuje serverová funkcia, ktorá overí admin rolu cez funkciu `has_role` (nie cez e-mail v kliente).
- `noindex` ochrana a MCP OAuth zostávajú zachované.

## Poradie prác

1. Migrácia databázy (tabuľky, role, RLS, trigger na profil)
2. Auth obrazovka + Google provider + chránený layout
3. Onboarding (3 obrazovky)
4. Prepojenie obrazoviek na dáta používateľa + odstránenie demo dát
5. ZIP do privátneho bucketu + admin gate
6. Ostrý test v prehliadači (stiahnutie ZIP, registrácia, onboarding, prázdny stav) a build
