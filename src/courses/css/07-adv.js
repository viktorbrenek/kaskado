/* Modul „adv“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"adv-1", module:"adv", xp:260, title:"Zebra tabulka",
    theory:`<p>Pseudotřída <code>:nth-child()</code> vybírá prvky podle pořadí mezi sourozenci. <code>:nth-child(even)</code> = každý sudý, <code>:nth-child(odd)</code> = lichý, <code>:nth-child(3n)</code> = každý třetí.</p><p>Pruhované řádky zrychlují čtení dlouhých tabulek.</p>`,
    task:`Dej <b>sudým</b> řádkům v <code>tbody</code> pozadí <code>#eef2f7</code>. Liché zůstanou bez pozadí.`,
    html:`<table><thead><tr><th>Projekt</th><th>Stav</th></tr></thead><tbody><tr><td>Web</td><td>hotovo</td></tr><tr><td>Aplikace</td><td>ve vývoji</td></tr><tr><td>E-shop</td><td>testování</td></tr><tr><td>Intranet</td><td>plán</td></tr></tbody></table>`,
    fixed:`table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:8px 10px}thead th{border-bottom:2px solid #14203a}`,
    starter:`tbody tr {\n  \n}`, solution:`tbody tr:nth-child(even) {\n  background-color: #eef2f7;\n}`,
    hints:["Pseudotřída se píše přímo za selektor bez mezery: <code>tr:nth-child(…)</code>.","<code>tbody tr:nth-child(even) { background-color: #eef2f7; }</code>"],
    checks:[
      {label:"2. a 4. řádek má pozadí #eef2f7", test:c=>{const r=c.qa("tbody tr");return [1,3].every(i=>c.style(r[i]).backgroundColor==="rgb(238, 242, 247)")}},
      {label:"1. a 3. řádek je bez pozadí", test:c=>{const r=c.qa("tbody tr");return [0,2].every(i=>c.style(r[i]).backgroundColor==="rgba(0, 0, 0, 0)")}} ] },

  { id:"adv-2", module:"adv", xp:260, title:"Selektory atributů",
    theory:`<p>Hranaté závorky vybírají podle atributů: <code>[required]</code> (atribut existuje), <code>[type="email"]</code> (přesná hodnota), <code>a[href^="https"]</code> (začíná na), <code>[href$=".pdf"]</code> (končí na).</p>`,
    task:`Povinná pole (<code>input</code> s atributem <code>required</code>) dostanou rámeček <code>2px solid #e11d48</code>. Nepovinné pole se nemění.`,
    html:`<label>Jméno <input required></label><label>E-mail <input type="email" required></label><label>Poznámka <input></label>`,
    fixed:`label{display:block;margin-bottom:8px;font-size:14px}input{display:block;margin-top:2px;border:1px solid #94a3b8;padding:6px;border-radius:6px;width:220px}`,
    starter:`/* vyber jen povinná pole */\n`, solution:`input[required] {\n  border: 2px solid #e11d48;\n}`,
    hints:["Selektor podle existence atributu: <code>[required]</code>.","<code>input[required] { border: 2px solid #e11d48; }</code>"],
    checks:[
      {label:"Obě povinná pole mají rámeček 2px #e11d48", test:c=>c.qa("input[required]").every(e=>{const s=c.style(e);return s.borderTopWidth==="2px"&&s.borderTopColor==="rgb(225, 29, 72)"})},
      {label:"Nepovinné pole má původní rámeček", test:c=>c.cs("input:not([required])").borderTopWidth==="1px"} ] },

  { id:"adv-3", module:"adv", xp:280, title:"Pseudo-element ::after",
    theory:`<p>Pseudo-elementy <code>::before</code> a <code>::after</code> vloží dekoraci bez zásahu do HTML. Bez vlastnosti <code>content</code> se nevykreslí.</p><p><code>.x::after { content: "!"; }</code></p>`,
    task:`Za každý odkaz <code>.more</code> přidej šipku <code>→</code> (vlastnost <code>content</code>) s levým odsazením <code>4px</code>.`,
    html:`<p>Nový design systému. <a class="more">Číst dál</a></p><p>Výsledky testování. <a class="more">Detail</a></p>`,
    starter:`.more::after {\n  \n}`, solution:`.more::after {\n  content: "→";\n  margin-left: 4px;\n}`,
    hints:["Text pseudo-elementu je v uvozovkách: <code>content: \"→\";</code>","Odsazení: <code>margin-left: 4px;</code>"],
    checks:[
      {label:"::after obsahuje šipku →", test:c=>/→/.test(c.pseudo(".more","::after").content||"")},
      {label:"Šipka má margin-left 4px", test:c=>c.pseudo(".more","::after").marginLeft==="4px"} ] },

  { id:"adv-4", module:"adv", xp:300, kind:"debug", title:"Proč to nefunguje?",
    theory:`<p><b>Specificita</b> rozhoduje, které pravidlo vyhraje. Počítá se jako trojice (ID, třídy/atributy/pseudotřídy, tagy): <code>#app .card p</code> = (1,1,1), <code>.note</code> = (0,1,0). Vyšší vyhrává bez ohledu na pořadí.</p><p><code>!important</code> je nouzová brzda — v týmu se ho vyhýbej.</p>`,
    task:`Poznámka <code>.note</code> má být červená <code>#e11d48</code>, ale přebíjí ji pravidlo knihovny <code>#app .card p</code>. Oprav to <b>bez</b> <code>!important</code>.`,
    html:`<div id="app"><div class="card"><p>Běžný text karty.</p><p class="note">Pozor: změna termínu!</p></div></div>`,
    fixed:`#app .card p{color:#64748b}.card{background:#f8fafc;padding:14px;border-radius:10px}`,
    starter:`.note {\n  color: #e11d48;\n}`, solution:`#app .card .note {\n  color: #e11d48;\n}`,
    hints:["Tvůj selektor musí mít aspoň stejnou specificitu jako <code>#app .card p</code> — a být až za ním.","Zkus <code>#app .card .note</code> — (1,2,0) je víc než (1,1,1)."],
    checks:[
      {label:"Poznámka je červená", test:c=>c.cs(".note").color==="rgb(225, 29, 72)"},
      {label:"Bez !important", test:c=>!c.important()},
      {label:"Běžný text zůstal šedý", test:c=>c.cs(".card p:not(.note)").color==="rgb(100, 116, 139)"} ] },

  { id:"adv-5", module:"adv", xp:300, title:"Stavy: hover a focus",
    theory:`<p>Interaktivní prvky potřebují viditelné stavy. <code>:hover</code> = najetí myší, <code>:focus-visible</code> = fokus z klávesnice. Bez fokusu se lidé ovládající web klávesnicí ztratí — je to požadavek přístupnosti (WCAG 2.4.7).</p>`,
    task:`Tlačítko <code>.btn</code>: při <code>:hover</code> pozadí <code>#1e40af</code>, při <code>:focus-visible</code> obrys <code>3px solid #f59e0b</code>.`,
    html:`<button class="btn">Uložit změny</button>`,
    fixed:`.btn{background:#2f5bd3;color:#fff;border:0;padding:10px 16px;border-radius:8px;font:inherit;font-weight:700}`,
    starter:`.btn:hover {\n  \n}\n\n.btn:focus-visible {\n  \n}`, solution:`.btn:hover {\n  background: #1e40af;\n}\n\n.btn:focus-visible {\n  outline: 3px solid #f59e0b;\n}`,
    hints:["V <code>:hover</code> změň <code>background</code>, ve <code>:focus-visible</code> nastav <code>outline</code>.","<code>outline: 3px solid #f59e0b;</code>"],
    checks:[
      {label:":hover mění pozadí na #1e40af", test:c=>{const v=c.decl(/\.btn:hover/,"background-color")||c.decl(/\.btn:hover/,"background");return /#1e40af|rgb\(30, 64, 175\)/i.test(v)}},
      {label:":focus-visible má obrys 3px solid #f59e0b", test:c=>{const r=c.rules().find(r=>r.kind==="style"&&/\.btn:focus-visible/.test(r.sel));return !!r&&r.style.getPropertyValue("outline-width")==="3px"&&r.style.getPropertyValue("outline-style")==="solid"&&/#f59e0b|rgb\(245, 158, 11\)/i.test(r.style.getPropertyValue("outline-color"))}} ] }
]);
