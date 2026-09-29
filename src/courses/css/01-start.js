/* Modul „start“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"s-1", module:"start", xp:50, title:"Co tu vlastně děláš",
    slides:[
      { title:"Web má dvě vrstvy", html:`<p><b>HTML</b> říká, <i>co</i> na stránce je: nadpis, odstavec, obrázek, tlačítko. <b>CSS</b> říká, <i>jak</i> to vypadá: barvy, písmo, velikosti, rozložení.</p>
        <div class="duo"><div><div class="lab2">Jen HTML</div><div class="raw"><h4>Kavárna Zrnko</h4><p>Otevřeno denně od 8:00.</p></div></div><div><div class="lab2">HTML + CSS</div><div class="styled"><h4>Kavárna Zrnko</h4><p>Otevřeno denně od 8:00.</p></div></div></div>
        <p>Obsah je v obou stejný. Rozdíl dělá jen CSS — a to se tu naučíš.</p>` },
      { title:"Jak vypadá obrazovka úrovně", html:`<ul class="uimap">
        <li><b class="n">1</b><span><b>Vlevo</b> je vysvětlení a úkol. Pod ním kolečka s podmínkami — zezelenají, jakmile je splníš.</span></li>
        <li><b class="n">2</b><span><b>Vpravo nahoře</b> je tmavý editor. Sem píšeš CSS. Klikni do něj a piš jako do Wordu.</span></li>
        <li><b class="n">3</b><span><b>Pod editorem</b> vidíš „Tvůj výsledek“ — mění se hned, jak píšeš. Vedle je „Cíl“: takhle to má vypadat.</span></li>
        <li><b class="n">4</b><span>Když je všechno zelené, klikni na <b>Odevzdat</b> a dostaneš body.</span></li></ul>` },
      { title:"Nemůžeš nic rozbít", html:`<p>Chyby jsou úplně v pořádku — tak se to učí každý.</p><ul><li><b>Vrátit kód</b> vrátí editor do původního stavu.</li><li><b>Nápověda</b> ti poradí (vezme si malý kousek bodů).</li><li><b>Tahák</b> v hlavičce editoru ukáže přehled základů, kdykoli si nevíš rady.</li><li>Když se v zápisu spleteš, pod editorem se objeví <b>Kontrola zápisu</b> a řekne, na kterém řádku a co chybí.</li></ul>` } ],
    task:`V editoru je hotové pravidlo, které barví nadpis. Přepiš slovo <code>black</code> na <code>red</code> — nic jiného neměň.`,
    html:`<h1>Ahoj, tohle je můj první styl</h1><p>Za chvíli budu umět CSS.</p>`,
    starter:`h1 {\n  color: black;\n}`, solution:`h1 {\n  color: red;\n}`,
    hints:["Dvakrát klikni na slovo <code>black</code> v editoru — označí se. Pak napiš <code>red</code>.","Výsledek má být <code>color: red;</code> — středník na konci nech."],
    checks:[{label:"Nadpis je červený", test:c=>c.cs("h1").color==="rgb(255, 0, 0)"}] },

  { id:"s-2", module:"start", xp:50, title:"Anatomie pravidla",
    slides:[
      { title:"Každé CSS pravidlo má stejný tvar", html:`<p>Když chceš něco obarvit, napíšeš pravidlo. Je jako věta: <b>komu</b> — <b>co</b> — <b>na co</b>.</p>{{anatomy}}` },
      { title:"Selektor = komu to platí", html:`<p>Selektor je první slovo před závorkou. Říká prohlížeči, které prvky na stránce má pravidlo změnit.</p><ul><li><code>h1</code> — všechny hlavní nadpisy</li><li><code>p</code> — všechny odstavce (p jako paragraph)</li><li><code>a</code> — všechny odkazy</li></ul><p>Jsou to stejná jména jako značky v HTML: <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;a&gt;</code>.</p>` } ],
    task:`Pravidlo teď barví nadpis <code>h1</code>. Změň <b>selektor</b> tak, aby barvu dostal <b>odstavec</b> <code>p</code> a nadpis zůstal černý.`,
    html:`<h1>Kavárna Zrnko</h1><p>Otevřeno denně od 8:00 do 18:00.</p>`,
    starter:`h1 {\n  color: tomato;\n}`, solution:`p {\n  color: tomato;\n}`,
    hints:["Selektor je slovo <code>h1</code> na prvním řádku, před <code>{</code>.","Přepiš <code>h1</code> na <code>p</code>. Závorky i zbytek nech."],
    checks:[{label:"Odstavec je tomato (oranžovočervený)", test:c=>c.cs("p").color==="rgb(255, 99, 71)"},{label:"Nadpis zůstal černý", test:c=>c.cs("h1").color!=="rgb(255, 99, 71)"}] },

  { id:"s-3", module:"start", xp:50, title:"Víc vlastností najednou",
    slides:[
      { title:"Jedno pravidlo, víc změn", html:`<p>Mezi závorky můžeš napsat kolik chceš <b>deklarací</b> (dvojic vlastnost: hodnota). Každou na vlastní řádek a každou ukonči středníkem:</p><pre class="mini">p {\n  color: navy;\n  font-size: 24px;\n  font-weight: 700;\n}</pre><p>Mezery na začátku řádků jsou jen pro přehlednost. Prohlížeči je to jedno, lidem ne.</p>` },
      { title:"Co jsou ty px?", html:`<p>U velikostí musíš napsat i <b>jednotku</b>. Nejběžnější je <code>px</code> — pixel, jeden bod obrazovky.</p><ul><li><code>16px</code> — běžná velikost textu</li><li><code>24px</code> — větší text, podnadpis</li><li><code>40px</code> — velký nadpis</li></ul><p>Samotné <code>24</code> bez jednotky prohlížeč nepochopí a řádek přeskočí.</p>` } ],
    task:`Odstavec už je tmavě modrý. Přidej pod <code>color</code> druhý řádek, který mu nastaví velikost písma <code>24px</code> (vlastnost <code>font-size</code>).`,
    html:`<p>Káva, která voní celou ulicí.</p>`,
    starter:`p {\n  color: navy;\n  \n}`, solution:`p {\n  color: navy;\n  font-size: 24px;\n}`,
    hints:["Klikni na prázdný řádek pod <code>color: navy;</code> a napiš novou deklaraci.","<code>font-size: 24px;</code> — dvojtečka, mezera, hodnota s px, středník."],
    checks:[{label:"Písmo má 24px", test:c=>c.cs("p").fontSize==="24px"},{label:"Barva zůstala navy", test:c=>c.cs("p").color==="rgb(0, 0, 128)"}] },

  { id:"s-4", module:"start", xp:50, kind:"debug", title:"Když se něco pokazí",
    slides:[
      { title:"Prohlížeč je přísný na interpunkci", html:`<p>Stačí jeden chybějící znak a prohlížeč část kódu tiše přeskočí. Nejčastější chyby:</p><ul><li>chybí <b>středník</b> <code>;</code> na konci řádku</li><li>chybí <b>zavírací závorka</b> <code>}</code></li><li>místo dvojtečky je rovnítko: <code>color = red</code></li><li>překlep ve vlastnosti: <code>colr</code></li></ul>` },
      { title:"Kontrola zápisu ti pomůže", html:`<p>Pod editorem se objeví žlutý panel <b>Kontrola zápisu</b>. Řekne ti číslo řádku a co chybí, a číslo řádku v editoru se obarví.</p><p>V tomhle úkolu jsou schválně dvě chyby. Najdi je.</p>` } ],
    task:`Kód má udělat zelený text velikosti <code>20px</code>, ale nefunguje. Oprav obě chyby v zápisu.`,
    html:`<p>Objednávka byla odeslána.</p>`,
    starter:`p {\n  color: green\n  font-size: 20px;\n`, solution:`p {\n  color: green;\n  font-size: 20px;\n}`,
    hints:["Podívej se na konec řádku s <code>color</code>.","Na konci řádku 2 chybí <code>;</code> a na úplném konci chybí <code>}</code>."],
    checks:[{label:"Text je zelený", test:c=>c.cs("p").color==="rgb(0, 128, 0)"},{label:"Písmo má 20px", test:c=>c.cs("p").fontSize==="20px"}] },

  { id:"s-5", module:"start", xp:60, title:"Třída: vyber jen něco",
    slides:[
      { title:"Co když nechci obarvit všechny odstavce?", html:`<p>Selektor <code>p</code> zasáhne <i>každý</i> odstavec. Často ale chceš jen jeden. Proto mají prvky v HTML <b>třídy</b> — štítky, které jim dá autor HTML:</p><pre class="mini">&lt;p class="tip"&gt;Tip: rezervujte si stůl.&lt;/p&gt;</pre><p>V CSS třídu vybereš <b>tečkou</b> a jejím názvem: <code>.tip</code></p>` },
      { title:"Barvy jako hex kód", html:`<p>Kromě názvů (<code>red</code>, <code>navy</code>) se barvy píšou <b>hex kódem</b>: mřížka a šest znaků, třeba <code>#fde68a</code>. Přesně ten zkopíruješ z Figmy v panelu Inspect.</p><p>Pozadí prvku nastaví vlastnost <code>background-color</code>.</p>` } ],
    task:`Dej pozadí <code>#fde68a</code> <b>jen</b> odstavci s třídou <code>tip</code>. Ostatní odstavce zůstanou bez pozadí.`,
    html:`<p>Kavárna Zrnko je otevřená denně.</p><p class="tip">Tip: o víkendu si rezervujte stůl.</p><p>Platit můžete kartou.</p>`,
    starter:`/* napiš pravidlo pro třídu tip */\n`, solution:`.tip {\n  background-color: #fde68a;\n}`,
    hints:["Selektor třídy začíná tečkou: <code>.tip</code>, pak <code>{</code>.","Celé pravidlo: <code>.tip { background-color: #fde68a; }</code>"],
    checks:[{label:"Odstavec .tip má žluté pozadí #fde68a", test:c=>c.cs(".tip").backgroundColor==="rgb(253, 230, 138)"},{label:"Ostatní odstavce jsou bez pozadí", test:c=>c.qa("p:not(.tip)").every(e=>c.style(e).backgroundColor==="rgba(0, 0, 0, 0)")}] }
]);
