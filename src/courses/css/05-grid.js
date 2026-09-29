/* Modul „grid“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"grid-1", module:"grid", xp:220, title:"Tři sloupce",
    slides:[
      { title:"Mřížka je jako tabulka", html:`<p>Grid rozdělí rodiče na <b>sloupce</b> a <b>řádky</b>. Jeho přímé děti se pak samy skládají do buněk: zleva doprava, a když je řádek plný, pokračují na dalším.</p>
        ${gd({cols:"1fr 1fr 1fr",items:["1","2","3","4","5","6"],cap:"Kontejner (rodič) má display: grid. Položky 1–6 jsou jeho děti — nikde jim neříkáš, kam patří, grid je rozmístí sám."})}
        <ul><li><b>Kontejner</b> — rodič, na kterém zapneš <code>display: grid</code></li><li><b>Položky</b> — jeho přímé děti</li><li><b>Stopa</b> — jeden sloupec nebo řádek</li></ul>` },
      { title:"Jednotka fr = díl zbylého místa", html:`<p><code>grid-template-columns</code> říká, kolik sloupců chceš a jak široké. Jednotka <code>fr</code> (fraction, zlomek) rozdělí volné místo v poměru:</p>
        ${gd({cols:"1fr 1fr 1fr",items:["1fr","1fr","1fr"],cap:"1fr 1fr 1fr — tři stejné třetiny"})}
        ${gd({cols:"1fr 2fr 1fr",items:["1fr","2fr","1fr"],cap:"1fr 2fr 1fr — prostřední dostane dva díly ze čtyř"})}
        ${gd({cols:"120px 1fr",items:["120px","1fr = celý zbytek"],cap:"120px 1fr — pevný sloupec a zbytek pro druhý"})}
        <p><code>repeat(3, 1fr)</code> je jen zkratka pro <code>1fr 1fr 1fr</code>.</p>` },
      { title:"Co se stane s šesti kartami?", html:`<p>Když nastavíš tři sloupce a máš šest karet, grid vytvoří <b>dva řádky sám</b>. Řádky se ti přizpůsobí obsahu — nemusíš je vůbec psát.</p><p><b>Tip:</b> pod editorem zapni <b>Ukázat mřížku</b>. Uvidíš sloupce, řádky i čísla čar přímo v náhledu.</p>` } ],
    task:`Rozlož šest karet v <code>.grid</code> do <b>tří stejně širokých sloupců</b>.`,
    html:`<div class="grid">${[1,2,3,4,5,6].map(n=>`<div class="cell">${n}</div>`).join("")}</div>`,
    fixed:`.grid{background:#eef2f7;padding:10px;border-radius:10px}.cell{background:#f3b184;border-radius:8px;height:44px;display:grid;place-items:center;font-weight:700;margin:3px}`,
    starter:`.grid {\n  \n}`, solution:`.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}`,
    hints:["Začni <code>display: grid;</code> na <code>.grid</code>.","Sloupce: <code>grid-template-columns: repeat(3, 1fr);</code>"],
    checks:[
      {label:".grid je grid kontejner", test:c=>/grid/.test(c.cs(".grid").display)},
      {label:"Karty jsou ve 2 řádcích po 3", test:c=>{const t=c.qa(".cell").map(e=>Math.round(e.getBoundingClientRect().top));return t[0]===t[1]&&t[1]===t[2]&&t[3]>t[0]&&t[3]===t[5]}},
      {label:"Sloupce jsou stejně široké", test:c=>{const w=c.qa(".cell").slice(0,3).map(e=>Math.round(e.getBoundingClientRect().width));return w.every(v=>Math.abs(v-w[0])<=1)}} ] },

  { id:"grid-lines", module:"grid", xp:230, title:"Čísla čar",
    slides:[
      { title:"Mřížka má čáry", html:`<p>Mezi sloupci a kolem nich vedou <b>čáry</b>. Grid je čísluje od 1 zleva. Čtyři sloupce = pět čar. Poslední čára má navíc číslo <code>-1</code>.</p>
        ${gd({cols:"1fr 1fr 1fr 1fr",items:["sloupec 1","sloupec 2","sloupec 3","sloupec 4"],nums:true,cap:"Čísla nad mřížkou jsou čísla čar, ne sloupců."})}` },
      { title:"Prvek umístíš mezi dvě čáry", html:`<p><code>grid-column: 2 / 4</code> čti: <b>začni na čáře 2, skonči na čáře 4</b>. Prvek tak zabere sloupce 2 a 3.</p>
        ${gd({cols:"1fr 1fr 1fr 1fr",items:["1",{t:"grid-column: 2 / 4",col:"2 / 4",hl:1},"2"],nums:true,cap:"Ostatní položky se kolem něj samy přeskládají."})}
        <p>Stejně funguje <code>grid-row</code> pro řádky.</p>` } ],
    task:`Akční karta <code>.feature</code> má v prvním řádku zabírat <b>sloupce 2 a 3</b> — tedy od čáry 2 do čáry 4.`,
    html:`<div class="grid"><div class="cell">1</div><div class="cell feature">Akce týdne</div>${[2,3,4,5,6,7].map(n=>`<div class="cell">${n}</div>`).join("")}</div>`,
    fixed:`.grid{background:#eef2f7;padding:10px;border-radius:10px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.cell{background:#f3b184;border-radius:8px;height:44px;display:grid;place-items:center;font-weight:700}.feature{background:#14203a;color:#fff}`,
    starter:`.feature {\n  \n}`, solution:`.feature {\n  grid-column: 2 / 4;\n}`,
    hints:["Vlastnost je <code>grid-column</code>, hodnota má tvar <code>začátek / konec</code>.","<code>grid-column: 2 / 4;</code>"],
    checks:[
      {label:"Začíná na čáře 2 (vedle karty 1)", test:c=>{const a=c.qa(".cell")[0].getBoundingClientRect(),f=c.rect(".feature");return c.near(f.left,a.right+8)&&c.near(f.top,a.top)}},
      {label:"Končí na čáře 4 (zabírá 2 sloupce)", test:c=>{const w=c.qa(".cell")[0].getBoundingClientRect().width;return c.near(c.rect(".feature").width,2*w+8)}} ] },

  { id:"grid-2", module:"grid", xp:220, title:"Spáry v mřížce",
    slides:[
      { title:"gap: mezera jen mezi buňkami", html:`<p><code>gap</code> nastaví mezeru mezi sloupci i řádky. Na rozdíl od <code>margin</code> se nepřidá k okrajům mřížky — okraje zůstanou zarovnané.</p>
        ${gd({cols:"1fr 1fr 1fr",items:["1","2","3","4","5","6"],gap:14,cap:"Šrafované pruhy jsou spáry (gap). Jsou jen mezi buňkami, ne kolem."})}
        <p>Zvlášť se dají nastavit přes <code>row-gap</code> a <code>column-gap</code>, nebo zkratkou <code>gap: 12px 24px</code> (řádky, sloupce).</p>` } ],
    task:`Karty mají margin, který dělá nerovnou mezeru i u okrajů. Nastav kartám <code>margin: 0</code> a mřížce mezeru <code>12px</code>.`,
    html:`<div class="grid">${[1,2,3,4,5,6].map(n=>`<div class="cell">${n}</div>`).join("")}</div>`,
    fixed:`.grid{background:#eef2f7;padding:10px;border-radius:10px;display:grid;grid-template-columns:repeat(3,1fr)}.cell{background:#f3b184;border-radius:8px;height:44px;display:grid;place-items:center;font-weight:700;margin:6px}`,
    starter:`.grid {\n  \n}\n\n.cell {\n  \n}`, solution:`.grid {\n  gap: 12px;\n}\n\n.cell {\n  margin: 0;\n}`,
    hints:["Na <code>.grid</code> patří <code>gap</code>, na <code>.cell</code> vynulovaný <code>margin</code>.","<code>.grid { gap: 12px; }</code> a <code>.cell { margin: 0; }</code>"],
    checks:[
      {label:"Karty nemají margin", test:c=>c.cs(".cell").marginLeft==="0px"&&c.cs(".cell").marginTop==="0px"},
      {label:"Mezera mezi sloupci 12px", test:c=>{const r=c.qa(".cell").map(e=>e.getBoundingClientRect());return Math.round(r[1].left-r[0].right)===12}},
      {label:"Mezera mezi řádky 12px", test:c=>{const r=c.qa(".cell").map(e=>e.getBoundingClientRect());return Math.round(r[3].top-r[0].bottom)===12}} ] },

  { id:"grid-3", module:"grid", xp:240, title:"Přes dva sloupce",
    slides:[
      { title:"span: roztáhni se o kus", html:`<p>Místo čísel čar můžeš říct jen <b>kolik sloupců</b> má prvek zabrat: <code>grid-column: span 2</code>. Začne tam, kam by ho grid stejně dal, a roztáhne se o dva sloupce.</p>
        ${gd({cols:"1fr 1fr 1fr",items:[{t:"span 2",col:"span 2",hl:1},"2","3","4","5"],cap:"První položka zabere dva sloupce, ostatní se posunou."})}
        <p><b>Kdy co:</b> <code>span 2</code> = „buď dvakrát širší, kdekoli jsi“. <code>1 / 3</code> = „buď přesně tady“.</p>` } ],
    task:`Hlavní karta <code>.hero</code> má zabírat <b>první dva sloupce</b> prvního řádku.`,
    html:`<div class="grid"><div class="cell hero">Novinka</div><div class="cell">2</div><div class="cell">3</div><div class="cell">4</div><div class="cell">5</div></div>`,
    fixed:`.grid{background:#eef2f7;padding:10px;border-radius:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.cell{background:#f3b184;border-radius:8px;height:48px;display:grid;place-items:center;font-weight:700}.hero{background:#14203a;color:#fff}`,
    starter:`.hero {\n  \n}`, solution:`.hero {\n  grid-column: span 2;\n}`,
    hints:["Vlastnost pro sloupce konkrétního prvku je <code>grid-column</code>.","<code>grid-column: span 2;</code>"],
    checks:[
      {label:".hero začíná v prvním sloupci", test:c=>Math.abs(c.rect(".hero").left-c.rect(".grid").left-10)<1.5},
      {label:".hero je široká jako 2 sloupce + mezera", test:c=>{const n=c.qa(".cell:not(.hero)")[0].getBoundingClientRect().width;return Math.abs(c.rect(".hero").width-(2*n+10))<1.5}} ] },

  { id:"grid-rows", module:"grid", xp:240, title:"Řádky, které si grid vytvoří sám",
    slides:[
      { title:"Sloupce určuješ ty, řádky přibývají", html:`<p>Když nastavíš jen sloupce a položek je víc, grid si <b>další řádky vytvoří sám</b>. Říká se jim <i>implicitní</i> řádky. Jejich výška se jinak řídí obsahem, takže každý řádek může být jinak vysoký.</p>
        ${gd({cols:"1fr 1fr 1fr",items:["1","2","3","4","5","6","7"],cap:"Sedm položek, tři sloupce → grid založí tři řádky."})}` },
      { title:"grid-auto-rows = výška řádků navíc", html:`<ul><li><code>grid-template-rows: 100px 60px</code> — výška řádků, které si <b>naplánuješ</b></li><li><code>grid-auto-rows: 70px</code> — výška všech řádků, které grid <b>přidá sám</b></li></ul><p>Pro galerie a seznamy karet je <code>grid-auto-rows</code> ideální: nevíš, kolik položek bude, ale všechny řádky budou stejné.</p>` } ],
    task:`Karty mají různě dlouhé texty, a tak jsou řádky nestejné. Nastav všem řádkům mřížky výšku <code>70px</code> — bez ohledu na to, kolik jich bude.`,
    html:`<div class="grid">${["Krátké","Tady je text o něco delší než ostatní","Střední text","Ok","Tady je zase delší text, co se zalomí","Krátké","Sedm"].map(t=>`<div class="cell">${t}</div>`).join("")}</div>`,
    fixed:`.grid{background:#eef2f7;padding:10px;border-radius:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.cell{background:#b9c77a;border-radius:8px;padding:8px;font-size:13px;font-weight:600}`,
    starter:`.grid {\n  \n}`, solution:`.grid {\n  grid-auto-rows: 70px;\n}`,
    hints:["Řádky tu nikdo neplánoval — grid je přidává sám. Vlastnost pro ně začíná <code>grid-auto-</code>.","<code>grid-auto-rows: 70px;</code>"],
    checks:[
      {label:"Všechny karty jsou 70px vysoké", test:c=>c.qa(".cell").every(e=>c.near(e.getBoundingClientRect().height,70,.6))},
      {label:"Pořád 3 sloupce a 3 řádky", test:c=>{const t=[...new Set(c.qa(".cell").map(e=>Math.round(e.getBoundingClientRect().top)))];return t.length===3&&c.cols(".cell")===3}} ] },

  { id:"grid-4", module:"grid", xp:280, title:"Layout stránky",
    slides:[
      { title:"Nakresli layout slovy", html:`<p><code>grid-template-areas</code> je nejnázornější část gridu: layout doslova napíšeš jako obrázek. Každý řetězec v uvozovkách je jeden <b>řádek</b>, každé slovo jedna <b>buňka</b>:</p>
        <div class="areas-demo"><pre class="mini">"head head"\n"side main"\n"foot foot"</pre>${gd({cols:"90px 1fr",areas:`"head head" "side main" "foot foot"`,items:[{t:"head",a:"head",c:"#14203a",f:"#fff"},{t:"side",a:"side",c:"#b9c77a"},{t:"main",a:"main",c:"#fff"},{t:"foot",a:"foot",c:"#f3b184"}],cap:""})}</div>
        <p>Stejné slovo dvakrát vedle sebe = ta oblast se roztáhne přes oba sloupce.</p>` },
      { title:"Pravidla, na která se zapomíná", html:`<ul><li>Každý řádek má <b>stejný počet slov</b> jako je sloupců.</li><li>Oblast musí tvořit <b>obdélník</b> — tvar L nejde.</li><li><code>.</code> (tečka) je prázdná buňka.</li><li>Pojmenovat oblasti nestačí: každému prvku musíš říct, kam patří: <code>.side { grid-area: side; }</code></li></ul>` },
      { title:"A proč má menu 160px?", html:`<p>Oblasti říkají <i>co kde je</i>. Šířky sloupců dál určuje <code>grid-template-columns</code>: <code>160px 1fr</code> = první sloupec pevných 160px, druhý dostane zbytek. Výška řádků se řídí obsahem.</p><p>Zapni si pod editorem <b>Ukázat mřížku</b> a sleduj, jak se čáry posunou, když změníš 160px třeba na 100px.</p>` } ],
    task:`Poskládej stránku: hlavička přes celou šířku, pod ní úzký <code>.side</code> vlevo (<code>160px</code>) a <code>.main</code> vpravo, dole patička přes celou šířku.`,
    html:`<div class="page"><header class="head">Hlavička</header><aside class="side">Menu</aside><main class="main">Obsah</main><footer class="foot">Patička</footer></div>`,
    fixed:`.page{background:#eef2f7;padding:10px;border-radius:10px;gap:8px}.page>*{border-radius:8px;padding:12px;font-weight:700;min-width:0}.head{background:#14203a;color:#fff}.side{background:#b9c77a}.main{background:#fff;min-height:90px}.foot{background:#f3b184}`,
    starter:`.page {\n  display: grid;\n  \n}\n\n.head { }\n.side { }\n.main { }\n.foot { }`,
    solution:`.page {\n  display: grid;\n  grid-template-columns: 160px 1fr;\n  grid-template-areas:\n    "head head"\n    "side main"\n    "foot foot";\n}\n\n.head { grid-area: head; }\n.side { grid-area: side; }\n.main { grid-area: main; }\n.foot { grid-area: foot; }`,
    hints:["Sloupce: <code>grid-template-columns: 160px 1fr;</code>. Pak nakresli oblasti v <code>grid-template-areas</code>.","Nezapomeň každému prvku přiřadit <code>grid-area</code> se jménem oblasti."],
    checks:[
      {label:"Hlavička je nahoře přes celou šířku", test:c=>{const h=c.rect(".head"),m=c.rect(".main");return h.bottom<=m.top&&Math.abs(h.width-(c.rect(".side").width+m.width+8))<2}},
      {label:"Menu vlevo, 160px široké", test:c=>{const s=c.rect(".side"),m=c.rect(".main");return Math.round(s.width)===160&&s.right<=m.left&&Math.abs(s.top-m.top)<1.5}},
      {label:"Patička dole přes celou šířku", test:c=>{const f=c.rect(".foot"),h=c.rect(".head"),m=c.rect(".main");return f.top>=m.bottom&&Math.abs(f.width-h.width)<1.5}} ] }
]);
