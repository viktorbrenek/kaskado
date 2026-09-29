/* Modul „nov-color“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"n-oklch", module:"nov-color", xp:380, support:{status:"baseline",test:"(color: oklch(60% 0.2 250))"}, title:"Barvy v oklch()",
    theory:`<p><code>oklch(L C H)</code> popisuje barvu tak, jak ji vnímá oko: <b>L</b> světlost (0–100 %), <b>C</b> sytost (0–0.37), <b>H</b> odstín (0–360°). Na rozdíl od HSL mají dvě barvy se stejným L opravdu stejnou světlost — palety a kontrasty se pak počítají předvídatelně. Design systémy (Tailwind 4, Radix) na něj přešly.</p>`,
    task:`Na <code>.ui</code> definuj <code>--brand: oklch(55% 0.2 255)</code> a použij ji jako pozadí <code>.btn</code>.`,
    html:`<div class="ui"><button class="btn">Pokračovat</button></div>`,
    fixed:`.btn{color:#fff;border:0;padding:10px 16px;border-radius:8px;font:inherit;font-weight:700}`,
    starter:`.ui {\n  \n}\n\n.btn {\n  \n}`, solution:`.ui {\n  --brand: oklch(55% 0.2 255);\n}\n\n.btn {\n  background: var(--brand);\n}`,
    hints:["Zápis: <code>oklch(55% 0.2 255)</code> — mezery, žádné čárky.","<code>.btn { background: var(--brand); }</code>"],
    checks:[
      {label:"--brand je v oklch()", test:c=>/^oklch\(\s*55%\s+0?\.2\s+255\s*\)$/.test(c.cs(".ui").getPropertyValue("--brand").trim())},
      {label:"Tlačítko má barvu --brand", test:c=>{const a=c.rgba(c.cs(".btn").backgroundColor),b=c.rgba("oklch(55% 0.2 255)");return a.every((v,k)=>Math.abs(v-b[k])<3)}} ],
    fallback:[{label:"--brand: oklch(55% 0.2 255)",re:/--brand\s*:\s*oklch\(\s*55%\s+0?\.2\s+255\s*\)/},{label:"background: var(--brand)",re:/background(-color)?\s*:\s*var\(--brand\)/}] },

  { id:"n-mix", module:"nov-color", xp:380, support:{status:"baseline",test:"(color: color-mix(in oklch, red, blue))"}, title:"Odstíny přes color-mix()",
    theory:`<p><code>color-mix(in oklch, var(--brand) 15%, white)</code> smíchá dvě barvy v daném poměru. Z jedné značkové barvy tak odvodíš světlé pozadí, tmavý hover i rámečky — bez ručního ladění desítek hex kódů.</p>`,
    task:`Štítek <code>.soft</code> dostane pozadí z 15 % značkové barvy a 85 % bílé (<code>color-mix</code> v <code>oklch</code>) a text v plné značkové barvě.`,
    html:`<div class="ui"><span class="soft">Nová funkce</span></div>`,
    fixed:`.ui{--brand:oklch(48% 0.2 255)}.soft{display:inline-block;padding:4px 12px;border-radius:99px;font-weight:700}`,
    starter:`.soft {\n  \n}`, solution:`.soft {\n  background: color-mix(in oklch, var(--brand) 15%, white);\n  color: var(--brand);\n}`,
    hints:["Tvar: <code>color-mix(in oklch, BARVA PODÍL, DRUHÁ_BARVA)</code>.","<code>background: color-mix(in oklch, var(--brand) 15%, white);</code>"],
    checks:[
      {label:"Pozadí používá color-mix() v oklch", test:c=>/color-mix\(in oklch/.test(c.decl(".soft","background-color")||c.decl(".soft","background"))},
      {label:"Pozadí je světlá varianta značky", test:c=>{const a=c.rgba(c.cs(".soft").backgroundColor),b=c.rgba("color-mix(in oklch, oklch(48% 0.2 255) 15%, white)");return a.every((v,k)=>Math.abs(v-b[k])<4)}},
      {label:"Text v barvě značky, kontrast aspoň 4.5 : 1", test:c=>/var\(--brand\)/.test(c.decl(".soft","color"))&&c.contrast(".soft")>=4.5} ],
    fallback:[{label:"color-mix(in oklch, var(--brand) 15%, white)",re:/color-mix\(\s*in oklch\s*,\s*var\(--brand\)\s*15%\s*,\s*white\s*\)/}] },

  { id:"n-rel", module:"nov-color", xp:400, support:{status:"baseline",test:"(color: oklch(from red l c h))"}, title:"Relativní barvy",
    theory:`<p>Relativní syntaxe vezme existující barvu a upraví jen část: <code>oklch(from var(--brand) l c calc(h + 180))</code> = stejná světlost a sytost, opačný odstín. <code>oklch(from var(--brand) calc(l - 0.15) c h)</code> = tmavší varianta pro hover.</p>`,
    task:`Odznak <code>.badge</code> dostane pozadí v <b>doplňkové barvě</b> ke značce: stejné <code>l</code> a <code>c</code>, odstín <code>h + 180</code>.`,
    html:`<div class="ui"><button class="btn">Koupit</button> <span class="badge">−20 %</span></div>`,
    fixed:`.ui{--brand:oklch(55% 0.2 255)}.btn{background:var(--brand);color:#fff;border:0;padding:8px 14px;border-radius:8px;font:inherit;font-weight:700}.badge{color:#fff;padding:4px 10px;border-radius:6px;font-weight:800}`,
    starter:`.badge {\n  background: ;\n}`, solution:`.badge {\n  background: oklch(from var(--brand) l c calc(h + 180));\n}`,
    hints:["Začni <code>oklch(from var(--brand) …)</code> a vypiš kanály <code>l c h</code>.","Odstín posuneš přes <code>calc(h + 180)</code>."],
    checks:[
      {label:"Používá oklch(from var(--brand) …)", test:c=>/oklch\(from var\(--brand\)/.test(c.decl(".badge","background-color")||c.decl(".badge","background"))},
      {label:"Výsledek je doplňková barva", test:c=>{const a=c.rgba(c.cs(".badge").backgroundColor),b=c.rgba("oklch(55% 0.2 75)");return a.every((v,k)=>Math.abs(v-b[k])<4)}} ],
    fallback:[{label:"oklch(from var(--brand) l c calc(h + 180))",re:/oklch\(\s*from\s+var\(--brand\)\s+l\s+c\s+calc\(\s*h\s*\+\s*180\s*\)\s*\)/}] },

  { id:"n-ld", module:"nov-color", xp:400, support:{status:"baseline",test:"(color: light-dark(red, blue))"}, title:"light-dark()",
    theory:`<p><code>light-dark(světlá, tmavá)</code> vybere hodnotu podle <code>color-scheme</code> prvku. Tmavý režim pak nepotřebuje duplikovat pravidla v media query — stačí přepnout <code>color-scheme: dark</code> (nebo ho převzít ze systému přes <code>color-scheme: light dark</code>).</p>`,
    task:`Karta <code>.card</code>: pozadí <code>light-dark(#ffffff, #0f172a)</code>, text <code>light-dark(#14203a, #e2e8f0)</code>. Druhá karta má <code>color-scheme: dark</code>.`,
    html:`<div class="card">Světlé schéma</div><div class="card dark">Tmavé schéma</div>`,
    fixed:`.card{padding:14px;border-radius:10px;border:1px solid #94a3b8;margin-bottom:8px;font-weight:700}.dark{color-scheme:dark}`,
    starter:`.card {\n  \n}`, solution:`.card {\n  background: light-dark(#ffffff, #0f172a);\n  color: light-dark(#14203a, #e2e8f0);\n}`,
    hints:["Obě vlastnosti mají tvar <code>light-dark(A, B)</code>.","<code>background: light-dark(#ffffff, #0f172a);</code>"],
    checks:[
      {label:"Světlá karta: bílé pozadí, tmavý text", test:c=>{const s=c.style(c.qa(".card")[0]);return s.backgroundColor==="rgb(255, 255, 255)"&&s.color==="rgb(20, 32, 58)"}},
      {label:"Tmavá karta: #0f172a a #e2e8f0", test:c=>{const s=c.cs(".dark");return s.backgroundColor==="rgb(15, 23, 42)"&&s.color==="rgb(226, 232, 240)"}},
      {label:"Jedno pravidlo s light-dark()", test:c=>/light-dark\(/.test(c.decl(".card","background-color")||c.decl(".card","background"))} ],
    fallback:[{label:"background: light-dark(#ffffff, #0f172a)",re:/light-dark\(\s*#fff(fff)?\s*,\s*#0f172a\s*\)/i}] },

  { id:"n-wrap", module:"nov-color", xp:380, support:{status:"baseline",test:"(text-wrap: balance)"}, title:"Hezké zalamování textu",
    theory:`<p><code>text-wrap: balance</code> rozloží nadpis rovnoměrně do řádků (žádné osamocené slovo na konci). <code>text-wrap: pretty</code> hlídá u odstavců „vdovy“ — poslední řádek s jedním slovem. Typografický detail, který dřív řešily jen tvrdé mezery.</p>`,
    task:`Nadpis <code>h2</code> vyvaž (<code>balance</code>), odstavec <code>p</code> zalamuj <code>pretty</code>.`,
    html:`<article class="post"><h2>Proč na typografii záleží víc, než si myslíte</h2><p>Dobře zalomený text se čte plynuleji a působí důvěryhodněji. Prohlížeč to dnes zvládne sám, jen mu to musíme říct.</p></article>`,
    fixed:`.post{width:320px}h2{font-size:24px;margin:0 0 8px}`,
    starter:`h2 {\n  \n}\n\np {\n  \n}`, solution:`h2 {\n  text-wrap: balance;\n}\n\np {\n  text-wrap: pretty;\n}`,
    hints:["Obě vlastnosti se jmenují <code>text-wrap</code>.","<code>h2 { text-wrap: balance; }</code> a <code>p { text-wrap: pretty; }</code>"],
    checks:[
      {label:"h2: text-wrap balance", test:c=>c.cs("h2").getPropertyValue("text-wrap-style")==="balance"},
      {label:"p: text-wrap pretty", test:c=>c.cs("p").getPropertyValue("text-wrap-style")==="pretty"} ],
    fallback:[{label:"text-wrap: balance",re:/text-wrap\s*:\s*balance/},{label:"text-wrap: pretty",re:/text-wrap\s*:\s*pretty/}] }
]);
