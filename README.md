# Kaskáda

**Hra, ve které se naučíš CSS — od úplných základů po moderní layouty.** Zdarma, open source, bez registrace.

Píšeš CSS do editoru, vidíš výsledek živě vedle cíle a hra kontroluje, jestli sedí. Za úrovně dostáváš XP, hvězdy, úspěchy a certifikáty.

**▶ Hrát:** https://viktorbrenek.github.io/kaskado/

## Co v ní je

- **74 úrovní CSS v pěti stupních:** Úplné základy (pro úplné nováčky) → Junior → Medior → Senior → Novinky 2025–26
- **Zakázky:** celé weby a appky podle klientského zadání (styl, paleta, písma), kontrolované podle zadání, ne podle předlohy
- **Novinky:** oklch, anchor positioning, scroll-driven animace, style queries, `if()`… u každé funkce stav podpory v prohlížečích
- **Editor pro nováčky:** barevné zvýraznění kódu, našeptávání vlastností, hodnot i tříd z HTML úrovně, automatické závorky, na mobilu lišta se znaky `{ } : ; # .`
- **Pomůcky:** Kontrola zápisu (česky řekne, co chybí a kde), Tahák, náhled HTML, Prozkoumat prvky, Ukázat mřížku (jako v DevTools), Prolnout s cílem (posuvník), Co se liší? (seznam rozdílů oproti cíli)
- **Výklad s nákresy:** flexbox (osy, justify-content, align-items), pozicování (tok, relative, absolute, z-index, sticky) a grid
- **Galerie:** hotové zakázky sdílíš přes GitHub Discussions
- Beta kurzy HTML a JavaScript

## Soukromí

Nic se neukládá na server. Postup je jen v tvém prohlížeči (dá se zálohovat do souboru). Žádné cookies ani analytika. Viz [PRIVACY.md](PRIVACY.md).

## Spuštění u sebe

Potřebuješ jen [Node.js](https://nodejs.org) 20+, žádné balíčky.

```bash
node build.mjs          # vytvoří dist/index.html
open dist/index.html    # nebo otevři soubor v prohlížeči
```

Testy všech úrovní (stáhne Playwright a Chromium):

```bash
npm install
npx playwright install chromium
npm test
```

## Struktura

```
src/
  page.html                 HTML kostra a styly hry
  app/20-editor.js          editor: zvýraznění, našeptávání, párové závorky
  app/10-engines.js         jak se úlohy spouštějí a kontrolují (CSS, HTML, JS), nástroje, diagramy
  app/90-core.js            stav hráče, XP, úspěchy, obrazovky
  app/95-community.js       verze pro GitHub Pages: galerie, záloha, AI prompt
  courses/css/00-course.js  kurz CSS: stupně, moduly, úspěchy
  courses/css/NN-modul.js   úrovně jednoho modulu (pořadí = číslo v názvu)
  courses/html.js, js.js    beta kurzy
public/fonts/               lokálně hostovaná písma
kaskada.config.json         nastavení galerie (giscus)
build.mjs                   sestaví dist/ (bez závislostí)
tests/levels.mjs            ověří, že každá úroveň funguje
```

## Chceš přispět?

Nová úroveň je jeden objekt v jednom souboru. Návod a šablona: [CONTRIBUTING.md](CONTRIBUTING.md).

## Pro správce: první nastavení

1. **GitHub Pages:** Settings → Pages → Source: **GitHub Actions**. Po každém pushi do `main` se web sám sestaví a nasadí.
2. **Galerie (giscus):**
   1. Settings → General → Features → zaškrtni **Discussions**.
   2. V Discussions vytvoř kategorii **Galerie** (typ *Announcement*, aby nová vlákna zakládala jen hra/správce, komentovat může každý).
   3. Nainstaluj aplikaci [giscus](https://github.com/apps/giscus) do tohoto repozitáře.
   4. Na [giscus.app](https://giscus.app/cs) zadej `viktorbrenek/kaskado`, vyber kategorii Galerie a z vygenerovaného kódu zkopíruj `data-repo-id` a `data-category-id` do `kaskada.config.json`.

## Licence

Kód: [MIT](LICENSE). Obsah kurzu (texty, úlohy, zakázky): [CC BY 4.0](LICENSE-CONTENT.md). Písma: SIL Open Font License.
