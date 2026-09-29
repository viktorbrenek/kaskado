/* Modul „sel“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"sel-1", module:"sel", xp:100, title:"První barva",
    theory:`<p>CSS pravidlo má tři části: <b>selektor</b> (koho stylujeme), <b>vlastnost</b> (co měníme) a <b>hodnotu</b>.</p><p><code>.title { color: navy; }</code> — tečka znamená třídu, takže to platí pro každý prvek s <code>class="title"</code>.</p>`,
    task:`Obarvi nadpis <code>.title</code> na barvu <code>#e11d48</code>.`,
    html:`<h1 class="title">Ahoj, CSS!</h1><p>Tohle je tvoje první úprava stylu.</p>`,
    starter:`.title {\n  \n}`, solution:`.title {\n  color: #e11d48;\n}`,
    hints:["Barvu textu mění vlastnost <code>color</code>.","Zápis uvnitř závorek: <code>vlastnost: hodnota;</code> — nezapomeň středník."],
    checks:[{label:"Nadpis .title má barvu #e11d48", test:c=>c.cs(".title").color==="rgb(225, 29, 72)"}] },

  { id:"sel-2", module:"sel", xp:100, title:"Třída, ne tag",
    theory:`<p>Selektor <code>span</code> zasáhne <i>všechny</i> spany. Selektor <code>.tag</code> jen ty, které mají třídu <code>tag</code>. Třídy jsou proto v praxi nejčastější.</p>`,
    task:`Dej všem štítkům <code>.tag</code> pozadí <code>#fde68a</code>. Poslední <code>span</code> bez třídy musí zůstat bez pozadí.`,
    html:`<p><span class="tag">UX</span> <span class="tag">CSS</span> <span class="tag">Figma</span> <span>obyčejný span</span></p>`,
    fixed:`span{padding:4px 8px;border-radius:6px;font-weight:600}`,
    starter:`/* napiš selektor pro třídu tag */\n`, solution:`.tag {\n  background-color: #fde68a;\n}`,
    hints:["Selektor třídy začíná tečkou: <code>.tag</code>.","Pozadí nastavuje <code>background-color</code>."],
    checks:[
      {label:"Všechny .tag mají pozadí #fde68a", test:c=>c.qa(".tag").every(e=>c.style(e).backgroundColor==="rgb(253, 230, 138)")},
      {label:"Span bez třídy zůstal bez pozadí", test:c=>c.cs("span:not(.tag)").backgroundColor==="rgba(0, 0, 0, 0)"} ] },

  { id:"sel-3", module:"sel", xp:120, title:"Typografie titulku",
    theory:`<p>Text ladíme hlavně přes <code>font-size</code> (velikost), <code>font-weight</code> (tloušťka, 100–900) a <code>text-align</code> (zarovnání).</p><p>V jednom pravidle může být deklarací kolik chceš.</p>`,
    task:`Nastav <code>.headline</code>: velikost <code>40px</code>, tloušťka <code>800</code>, zarovnání na střed.`,
    html:`<h1 class="headline">Design, který dává smysl</h1><p class="lead">Podtitulek zůstává, jak je.</p>`,
    fixed:`.headline{font-size:22px;font-weight:400;margin:0 0 8px}`,
    starter:`.headline {\n  \n}`, solution:`.headline {\n  font-size: 40px;\n  font-weight: 800;\n  text-align: center;\n}`,
    hints:["Potřebuješ tři deklarace — každou na vlastní řádek se středníkem.","<code>text-align: center;</code> zarovná text na střed."],
    checks:[
      {label:"font-size je 40px", test:c=>c.cs(".headline").fontSize==="40px"},
      {label:"font-weight je 800", test:c=>c.cs(".headline").fontWeight==="800"},
      {label:"Text je zarovnaný na střed", test:c=>c.cs(".headline").textAlign==="center"} ] }
]);
