# Jak přispět do Kaskády

Díky, že chceš pomoct! Nejčastější příspěvek je **nová úroveň** nebo **oprava textu**. Obojí zvládneš bez znalosti zbytku hry.

## Nová úroveň za 5 minut

1. Najdi modul ve `src/courses/css/` (třeba `08-pos.js` = Pozicování).
2. Přidej do pole objekt podle šablony níže.
3. Spusť `npm test` — ověří, že výchozí kód **neprojde** a vzorové řešení **projde**.
4. Pošli pull request.

```js
{ id:"pos-5",               // unikátní v rámci kurzu, nikdy neměň (váže se na něj postup hráčů)
  module:"pos",             // id modulu z 00-course.js
  xp:300,                   // 100–250 junior, 250–400 medior/senior, 1000+ zakázky
  title:"Název úrovně",
  theory:`<p>Krátký výklad. <code>kód</code> v textu.</p>`,
  task:`Co má hráč udělat — jedna, dvě věty.`,
  html:`<div class="card">Obsah, který hráč stylovat nesmí měnit</div>`,
  fixed:`.card{padding:12px}`,        // CSS, které tam je vždy (hráč ho nevidí)
  starter:`.card {\n  \n}`,          // co je v editoru na začátku
  solution:`.card {\n  color: red;\n}`,
  hints:["První nápověda — směr", "Druhá nápověda — skoro řešení"],
  checks:[
    { label:"Text je červený", test:c=>c.cs(".card").color==="rgb(255, 0, 0)" },
  ] },
```

### Volitelné vlastnosti

| Vlastnost | K čemu |
|---|---|
| `slides:[{title, html}]` | výklad po krocích místo `theory` (nováčkovské a grid lekce); v `html` můžeš použít `gd({...})` pro diagram mřížky a `{{anatomy}}` pro rozbor pravidla |
| `kind:"debug"` | štítek „Oprav chybu“ — starter obsahuje chybu |
| `wide:true` | náhledy pod sebou přes celou šířku |
| `support:{status, test}` | nová CSS funkce: `status` je `baseline` / `interop` / `chromium`, `test` je řetězec pro `CSS.supports()` nebo funkce |
| `fallback:[{label, re}]` | kontroly zápisem (regex), když prohlížeč funkci nezná |
| `project:true, brief:{…}, canvas:900, requires:[…]` | zakázka — viz `06-zak-jr.js` |

### Jak psát kontroly (`test: c => …`)

Kontrola dostane objekt `c` nad náhledem hráče:

| Funkce | Vrací |
|---|---|
| `c.cs(".sel")` | computed style prvního prvku (`c.cs(".x").color`) |
| `c.qa(".sel")` | pole prvků; `c.style(el)` jejich styl |
| `c.rect(".sel")` | poloha a rozměr (`left`, `top`, `width`…) |
| `c.pseudo(".sel","::after")` | styl pseudo-elementu |
| `c.decl(".sel","prop")` | hodnota **tak, jak ji hráč napsal** (třeba `"2rem"`), i v `@media` přes třetí argument |
| `c.rules()` | všechna pravidla hráče včetně `@media`, `@container`, `@layer`, `@keyframes` |
| `c.width(640, ()=>…)` | spustí kontrolu při jiné šířce náhledu (responzivita) |
| `c.cols(".sel")` | kolik prvků je v prvním řádku |
| `c.contrast(".sel")` | kontrastní poměr textu vůči pozadí (WCAG) |
| `c.near(a,b,tol)` | porovnání čísel s tolerancí |
| `c.important()`, `c.uses(/regex/)`, `c.font(".sel","Inter")`, `c.vars(".sel")` | další pomocníci |

**Zásady dobrých kontrol**

- Kontroluj **výsledek**, ne přesný zápis — `color: red`, `#f00` i `rgb(255,0,0)` mají projít. Barvy porovnávej v `rgb(…)` tvaru, jak je vrací prohlížeč.
- Label piš z pohledu hráče: „Nadpis je vycentrovaný“, ne „text-align === center“.
- U zakázek hlídej zadání klienta, ne pixelovou shodu s referenčním řešením.

## Texty

Píšeme česky, tykáme, krátce a konkrétně. Bez „jednoduše“ a „prostě“ — nováčkovi to nic neříká.

## Nový kurz nebo jazyk

Kurz = `registerCourse({...})` ve `src/courses/`. Nový jazyk potřebuje engine v `src/app/10-engines.js` se stejným rozhraním jako `ENGINES.css` (`mount`, `run`). Než začneš, otevři issue, ať se domluvíme.

## Verze pro claude.ai

`node build.mjs --target=claude` vytvoří `dist/claude-artifact.html` — stejná hra jako artifact na claude.ai, se sdíleným žebříčkem a AI posudkem (používá `window.claude`). Na GitHub Pages se tyhle funkce samy vypnou.
