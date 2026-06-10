# ERIOS — web (geteri.com / erios.cz)

Tento priečinok obsahuje produkčný web firmy ERIOS. Pri každej úprave súborov
dodržiavaj pravidlá nižšie. Kompletné podklady značky sú v `.claude/skills/erios/`
(SKILL.md + references + assets) — pri písaní textov a tvorbe vizuálov si ich načítaj.

## Čo je ERIOS

ERIOS je systém, ktorý z jednej objednávky nastaví celý firemný flow — od objednávky
cez sklad a výrobu až po logistiku — vizualizuje dáta pre rýchle rozhodnutia a beží
bez závislosti od IT oddelenia. Posúvame ERP (enterprise resource *planning*) na
ERI (enterprise resource *intelligence*). Trh: SK/CZ.

## NEPREKROČITEĽNÉ pravidlá

1. **Žiadne konkrétne sumy úspor ani cenník** nikde na webe. Komunikuj metódu
   a princíp návratnosti, nie čísla „od stola".
2. **Nič si nevymýšľaj.** Žiadne falošné referencie, logá klientov ani vymyslené
   metriky. Jediné schválené verejné metriky: **~10 s sync** a **inštalácia do 7 dní**
   (presné znenie v `.claude/skills/erios/references/web-copy-and-faq.md`).
3. **Predávaj návratnosť, nie funkcie.** Prvé posolstvo je vždy benefit/návratnosť;
   funkcia je len dôkaz benefitu.
4. **Tón:** profesionálne, formálne, vykanie, sebavedomé, ale ľudské. Texty v slovenčine
   (resp. češtine pre erios.cz) — opak strohých sivých legacy ERP.
5. **Logo:** používaj výhradne oficiálne súbory (`erios_logo.png` wordmark,
   `erios_symbol.png` bodkové „O" pre favicon/malé plochy). Nedeformovať, neprefarbovať,
   nepridávať efekty, „O" nikdy nenahrádzať plným krúžkom. Gradientová verzia len na
   čistom/svetlom pozadí; na tmavom/rušivom jednofarebná.

## Vizuálny systém (potvrdené z produkcie)

CSS tokeny — pri úpravách štýlov používaj tieto premenné, nie nové farby:

```css
:root{
  --crimson:#C8003C; --magenta:#98154B; --plum:#6C2448; --teal:#0C5448; --teal-ink:#0B201D;
  --paper:#FAF8F3; --ink:#0E211C; --ink2:#3C5048; --ink3:#647A71; --teal-light:#7FD9C9;
  --grad:linear-gradient(100deg,var(--crimson) 0%,var(--magenta) 32%,var(--plum) 55%,var(--teal) 100%);
}
```

Typografia (návrh, drž sa jej kým sa neodsúhlasí iná): Manrope 700–800 nadpisy,
Source Sans 3 text, JetBrains Mono technické metriky a štítky.

## Technické poznámky k projektu

- Web beží na klasickom Apache/PHP hostingu (`.htaccess`, `default.php`) — statické
  HTML stránky + assets. Nezavádzaj build nástroje ani frameworky bez výslovného súhlasu.
- Štruktúra stránok: index, workflow, konfigurator, porovnanie, login / eri-login,
  app, wapp a ďalšie — pred úpravou si súbor vždy prečítaj, zachovaj existujúce
  prelinkovanie a názvy súborov (sú nasadené na produkcii).
- Zmeny rob v malých commitoch s popisom v slovenčine. Pred väčšou prerábkou
  commitni aktuálny stav.
- Nikdy neuploaduj ani necommituj prihlasovacie údaje či exporty databáz.

## Kontrola pred dokončením úlohy

- Vedie text benefitom/návratnosťou, nie zoznamom funkcií?
- Je bez konkrétnych čísel úspor a cenníka?
- Sedí tón (vykanie, sebavedomé, ľudské) a jazyk (SK/CZ)?
- Sú farby z tokenov a logo podľa pravidiel?
- Funguje prelinkovanie medzi stránkami po zmene?
