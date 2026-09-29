/* Modul „resp“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"resp-1", module:"resp", xp:300, kind:"debug", title:"Obrázek přetéká",
    theory:`<p>Obrázek s pevnou šířkou vyteče z úzkého kontejneru a rozbije layout na mobilu. Základní pojistka responzivního webu:</p><p><code>img { max-width: 100%; height: auto; }</code></p>`,
    task:`Obrázek v kartě je širší než karta. Zajisti, aby se vešel a zachoval poměr stran.`,
    html:`<div class="card"><img alt="Graf" width="800" height="400" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%238cb6c0'/%3E%3Cpath d='M0 320 L200 220 L400 260 L600 120 L800 160' stroke='%2314203a' stroke-width='14' fill='none'/%3E%3C/svg%3E"><p>Tržby za Q3</p></div>`,
    fixed:`.card{width:260px;border:1px solid #cbd5e1;border-radius:10px;padding:10px;overflow:visible}img{display:block}`,
    starter:`img {\n  \n}`, solution:`img {\n  max-width: 100%;\n  height: auto;\n}`,
    hints:["Omez maximální šířku na šířku rodiče.","<code>max-width: 100%; height: auto;</code>"],
    checks:[
      {label:"Obrázek se vejde do karty", test:c=>c.rect("img").width<=c.rect(".card").width-20+0.5},
      {label:"Zachovaný poměr stran 2:1", test:c=>{const r=c.rect("img");return c.near(r.width/r.height,2,.05)}} ] },

  { id:"resp-2", wide:true, module:"resp", xp:300, title:"Zalomení řady",
    theory:`<p>Flex řada se defaultně nezalomí — položky se smrští nebo vytečou. <code>flex-wrap: wrap</code> je pošle na další řádek, když nestačí místo.</p>`,
    task:`Štítky v <code>.tags</code> vytékají z boxu. Nech je zalomit na víc řádků a dej jim mezeru <code>8px</code>.`,
    html:`<div class="tags">${["Figma","CSS","UX research","Prototyp","Přístupnost","Design systém","Testování","Copywriting"].map(t=>`<span>${t}</span>`).join("")}</div>`,
    fixed:`.tags{display:flex;width:300px;border:1px dashed #94a3b8;padding:8px;border-radius:8px}.tags span{flex:none;background:#fde68a;padding:4px 10px;border-radius:99px;font-size:13px;white-space:nowrap}`,
    starter:`.tags {\n  \n}`, solution:`.tags {\n  flex-wrap: wrap;\n  gap: 8px;\n}`,
    hints:["<code>flex-wrap: wrap;</code>","A mezera <code>gap: 8px;</code>"],
    checks:[
      {label:"flex-wrap: wrap", test:c=>c.cs(".tags").flexWrap==="wrap"},
      {label:"Nic nevytéká z boxu", test:c=>{const b=c.rect(".tags");return c.qa(".tags span").every(e=>e.getBoundingClientRect().right<=b.right+0.5)}},
      {label:"Mezera 8px", test:c=>c.cs(".tags").columnGap==="8px"&&c.cs(".tags").rowGap==="8px"} ] },

  { id:"resp-3", module:"resp", xp:340, title:"Mřížka bez media query",
    theory:`<p>Kouzelná formule: <code>grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))</code>. Grid si sám spočítá, kolik sloupců minimálně 140px se vejde, a zbytek místa rozdělí. Na mobilu 1–2 sloupce, na desktopu víc.</p>`,
    task:`Karty v <code>.gallery</code> se mají samy přizpůsobit šířce: každá aspoň <code>140px</code>, zbytek místa rovnoměrně. Otestujeme to na šířkách 640px a 320px.`,
    html:`<div class="gallery">${[1,2,3,4,5,6].map(n=>`<div class="tile">${n}</div>`).join("")}</div>`,
    fixed:`.gallery{display:grid;gap:10px}.tile{background:#b9c77a;border-radius:8px;height:60px;display:grid;place-items:center;font-weight:700}`,
    starter:`.gallery {\n  grid-template-columns: ;\n}`, solution:`.gallery {\n  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));\n}`,
    hints:["Kombinuj <code>repeat()</code>, <code>auto-fit</code> a <code>minmax()</code>.","<code>repeat(auto-fit, minmax(140px, 1fr))</code>"],
    checks:[
      {label:"Při šířce 640px aspoň 4 sloupce", test:c=>c.width(640,()=>c.cols(".tile")>=4)},
      {label:"Při šířce 320px nejvýš 2 sloupce", test:c=>c.width(320,()=>{const n=c.cols(".tile");return n>=1&&n<=2})},
      {label:"Karty nejsou užší než 140px", test:c=>c.width(320,()=>c.rect(".tile").width>=139.5)} ] },

  { id:"resp-4", module:"resp", xp:340, title:"Media query",
    theory:`<p><code>@media (max-width: 600px) { … }</code> použije pravidla jen na obrazovkách do 600px. Přístup <b>mobile-first</b> píše základ pro mobil a rozšiřuje přes <code>min-width</code>.</p><p>Media query se řídí šířkou okna, proto tady kontrolujeme hlavně správný zápis.</p>`,
    task:`Navigace <code>.nav</code> je v řadě. Na obrazovkách <b>do 600px</b> ji přepni do sloupce (<code>flex-direction: column</code>).`,
    html:`<nav class="nav"><a>Domů</a><a>Služby</a><a>Reference</a><a>Kontakt</a></nav>`,
    fixed:`.nav{display:flex;gap:12px;background:#14203a;padding:12px;border-radius:10px}.nav a{color:#fff;font-weight:600;text-decoration:none}`,
    starter:`@media () {\n  \n}`, solution:`@media (max-width: 600px) {\n  .nav {\n    flex-direction: column;\n  }\n}`,
    hints:["Podmínka: <code>(max-width: 600px)</code>.","Uvnitř media query je normální pravidlo: <code>.nav { flex-direction: column; }</code>"],
    checks:[
      {label:"Je tu @media s max-width: 600px", test:c=>c.rules().some(r=>r.media&&/max-width:\s*600px/.test(r.media))},
      {label:"Uvnitř přepíná .nav na column", test:c=>c.decl(".nav","flex-direction",r=>r.media&&/max-width:\s*600px/.test(r.media))==="column"},
      {label:"Mimo media query zůstává .nav v řadě", test:c=>c.decl(".nav","flex-direction",r=>!r.media)!=="column"} ] },

  { id:"resp-5", module:"resp", xp:380, title:"Container query",
    theory:`<p>Media query sleduje okno, <b>container query</b> sleduje rodiče. Komponenta se pak přizpůsobí tomu, kam ji vložíš — do úzkého sidebaru i do širokého obsahu.</p><p>1) Rodiči: <code>container-type: inline-size;</code><br>2) Pravidlo: <code>@container (min-width: 400px) { … }</code></p>`,
    task:`Když je <code>.wrap</code> široký aspoň <code>400px</code>, karta <code>.card</code> se přepne na <code>display: flex</code> (obrázek vedle textu). Pod 400px zůstane pod sebou. Otestujeme na 500px a 300px.`,
    html:`<div class="wrap"><div class="card"><div class="img"></div><div class="txt"><b>Kurz UX</b><br>Obrázek vedle textu, když je místo.</div></div></div>`,
    fixed:`.card{border:1px solid #cbd5e1;border-radius:10px;padding:10px;gap:12px}.img{width:120px;height:80px;background:#8cb6c0;border-radius:8px;flex:none}`,
    starter:`.wrap {\n  \n}\n\n@container () {\n  .card {\n    \n  }\n}`, solution:`.wrap {\n  container-type: inline-size;\n}\n\n@container (min-width: 400px) {\n  .card {\n    display: flex;\n  }\n}`,
    hints:["Nejdřív z <code>.wrap</code> udělej kontejner: <code>container-type: inline-size;</code>","<code>@container (min-width: 400px) { .card { display: flex; } }</code>"],
    checks:[
      {label:".wrap je kontejner (inline-size)", test:c=>c.cs(".wrap").containerType==="inline-size"},
      {label:"Na 500px je karta flex", test:c=>c.width(500,()=>c.cs(".card").display==="flex")},
      {label:"Na 300px je karta pod sebou", test:c=>c.width(300,()=>c.cs(".card").display!=="flex")} ] }
]);
