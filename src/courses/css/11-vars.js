/* Modul „vars“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"var-1", module:"vars", xp:300, title:"Vlastní proměnná",
    theory:`<p>Custom properties začínají dvěma pomlčkami: <code>--brand: #2f5bd3;</code>. Použiješ je přes <code>var(--brand)</code>. Dědí se, takže je stačí definovat na společném předkovi. Změna na jednom místě přebarví celé UI — základ design tokenů.</p>`,
    task:`Na <code>.ui</code> definuj <code>--brand: #2f5bd3</code> a použij ji jako pozadí <code>.btn</code> i barvu textu <code>.link</code>.`,
    html:`<div class="ui"><button class="btn">Objednat</button> <a class="link">Podmínky</a></div>`,
    fixed:`.btn{color:#fff;border:0;padding:8px 14px;border-radius:8px;font:inherit;font-weight:700}.link{font-weight:700;margin-left:8px}`,
    starter:`.ui {\n  \n}\n\n.btn {\n  \n}\n\n.link {\n  \n}`, solution:`.ui {\n  --brand: #2f5bd3;\n}\n\n.btn {\n  background: var(--brand);\n}\n\n.link {\n  color: var(--brand);\n}`,
    hints:["Definice: <code>--brand: #2f5bd3;</code> uvnitř <code>.ui</code>.","Použití: <code>background: var(--brand);</code> a <code>color: var(--brand);</code>"],
    checks:[
      {label:"--brand je definovaná na .ui", test:c=>c.cs(".ui").getPropertyValue("--brand").trim().toLowerCase()==="#2f5bd3"},
      {label:".btn používá var(--brand)", test:c=>/var\(--brand/.test(c.decl(".btn","background-color")||c.decl(".btn","background"))&&c.cs(".btn").backgroundColor==="rgb(47, 91, 211)"},
      {label:".link používá var(--brand)", test:c=>/var\(--brand/.test(c.decl(".link","color"))&&c.cs(".link").color==="rgb(47, 91, 211)"} ] },

  { id:"var-2", module:"vars", xp:320, title:"Tmavý motiv",
    theory:`<p>Motivy se dělají přepsáním proměnných, ne přepsáním komponent. Komponenty používají <code>var(--bg)</code> a <code>var(--fg)</code>; tmavý motiv jen změní hodnoty:</p><p><code>[data-theme="dark"] { --bg: …; --fg: …; }</code></p>`,
    task:`Pro prvek s <code>data-theme="dark"</code> nastav <code>--bg: #0f172a</code> a <code>--fg: #e2e8f0</code>. Světlý panel se nesmí změnit.`,
    html:`<div class="ui"><b>Světlý panel</b><br>Výchozí motiv.</div><div class="ui" data-theme="dark"><b>Tmavý panel</b><br>Stejná komponenta, jiné tokeny.</div>`,
    fixed:`.ui{--bg:#ffffff;--fg:#14203a;background:var(--bg);color:var(--fg);border:1px solid #cbd5e1;border-radius:10px;padding:14px;margin-bottom:8px}`,
    starter:`/* přepiš jen proměnné */\n`, solution:`[data-theme="dark"] {\n  --bg: #0f172a;\n  --fg: #e2e8f0;\n}`,
    hints:["Selektor atributu s hodnotou: <code>[data-theme=\"dark\"]</code>.","Uvnitř jen dvě proměnné, žádné <code>background</code> ani <code>color</code>."],
    checks:[
      {label:"Tmavý panel má pozadí #0f172a", test:c=>c.style(c.q("[data-theme=dark]")).backgroundColor==="rgb(15, 23, 42)"},
      {label:"Tmavý panel má text #e2e8f0", test:c=>c.style(c.q("[data-theme=dark]")).color==="rgb(226, 232, 240)"},
      {label:"Světlý panel se nezměnil", test:c=>c.style(c.q(".ui:not([data-theme])")).backgroundColor==="rgb(255, 255, 255)"},
      {label:"Měníš jen proměnné, ne background/color", test:c=>!c.rules().some(r=>r.kind==="style"&&(r.style.getPropertyValue("background")||r.style.getPropertyValue("background-color")||r.style.getPropertyValue("color")))} ] },

  { id:"var-3", module:"vars", xp:320, title:"Počítáme s calc()",
    theory:`<p><code>calc()</code> kombinuje jednotky: <code>calc(100% - 240px)</code>, <code>calc(var(--space) * 2)</code>. Kolem <code>+</code> a <code>-</code> musí být mezery.</p>`,
    task:`Na <code>.layout</code> je <code>--side: 180px</code>. Nastav <code>.main</code> šířku na <b>celý zbytek</b> pomocí <code>calc()</code> a proměnné (<code>.side</code> je vedle, bez mezery).`,
    html:`<div class="layout"><div class="side">Menu</div><div class="main">Obsah</div></div>`,
    fixed:`.layout{--side:180px;display:flex;background:#eef2f7;border-radius:10px;overflow:hidden}.side{width:var(--side);flex:none;background:#b9c77a;padding:12px;box-sizing:border-box}.main{flex:none;background:#fff;padding:12px;box-sizing:border-box;border:1px solid #cbd5e1}`,
    starter:`.main {\n  width: ;\n}`, solution:`.main {\n  width: calc(100% - var(--side));\n}`,
    hints:["Celá šířka minus menu: <code>100% - …</code>.","<code>width: calc(100% - var(--side));</code>"],
    checks:[
      {label:"Používá calc() s var(--side)", test:c=>/calc\(.*var\(--side\)/.test(c.decl(".main","width"))},
      {label:".main vyplní přesně zbytek", test:c=>c.near(c.rect(".side").width+c.rect(".main").width,c.rect(".layout").width)} ] }
]);
