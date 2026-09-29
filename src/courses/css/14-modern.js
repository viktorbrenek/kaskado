/* Modul „modern“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"mod-1", module:"modern", xp:360, title:"Rodičovský selektor :has()",
    theory:`<p><code>:has()</code> vybere prvek podle toho, co obsahuje. <code>.card:has(img)</code> = karty s obrázkem, <code>label:has(input:invalid)</code> = popisky chybných polí. Dlouho to bez JavaScriptu nešlo.</p>`,
    task:`Karty, které obsahují štítek <code>.new</code>, dostanou rámeček barvy <code>#e11d48</code>. Ostatní nechej být.`,
    html:`<div class="card"><span class="new">Nové</span> Kurz Grid</div><div class="card">Kurz Flexbox</div><div class="card"><span class="new">Nové</span> Kurz :has()</div>`,
    fixed:`.card{border:2px solid #cbd5e1;border-radius:10px;padding:10px 12px;margin-bottom:8px}.new{background:#e11d48;color:#fff;font-size:12px;padding:1px 6px;border-radius:99px}`,
    starter:`.card {\n  \n}`, solution:`.card:has(.new) {\n  border-color: #e11d48;\n}`,
    hints:["Selektor: <code>.card:has(.new)</code>.","Stačí změnit <code>border-color</code>."],
    checks:[
      {label:"Karty se štítkem mají červený rámeček", test:c=>c.qa(".card").filter(e=>e.querySelector(".new")).every(e=>c.style(e).borderTopColor==="rgb(225, 29, 72)")},
      {label:"Karta bez štítku zůstala šedá", test:c=>c.qa(".card").filter(e=>!e.querySelector(".new")).every(e=>c.style(e).borderTopColor==="rgb(203, 213, 225)")} ] },

  { id:"mod-2", wide:true, module:"modern", xp:360, title:"Poměr stran a ořez",
    theory:`<p><code>aspect-ratio: 16 / 9</code> drží poměr stran bez hacků s paddingem. <code>object-fit: cover</code> pak obrázek ořízne tak, aby vyplnil box a nedeformoval se.</p>`,
    task:`Náhled <code>.thumb</code> má mít poměr <code>16 / 9</code>, šířku 100 % a obrázek ho má vyplnit bez deformace (<code>cover</code>).`,
    html:`<div class="card"><img class="thumb" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3b184'/%3E%3Ccircle cx='200' cy='200' r='120' fill='%2314203a'/%3E%3C/svg%3E"><p>Video: Úvod do gridu</p></div>`,
    fixed:`.card{width:280px;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden}.card p{padding:8px 10px;margin:0}.thumb{display:block}`,
    starter:`.thumb {\n  \n}`, solution:`.thumb {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: cover;\n}`,
    hints:["Tři vlastnosti: <code>width</code>, <code>aspect-ratio</code>, <code>object-fit</code>.","<code>aspect-ratio: 16 / 9; object-fit: cover;</code>"],
    checks:[
      {label:"Plná šířka karty", test:c=>c.near(c.rect(".thumb").width,c.rect(".card").width-2)},
      {label:"Poměr stran 16:9", test:c=>{const r=c.rect(".thumb");return c.near(r.width/r.height,16/9,.02)}},
      {label:"object-fit: cover", test:c=>c.cs(".thumb").objectFit==="cover"} ] },

  { id:"mod-3", module:"modern", xp:380, title:"Logické vlastnosti",
    theory:`<p>V arabštině nebo hebrejštině se čte zprava doleva. <code>margin-left</code> tam je „na špatné straně“. Logické vlastnosti se řídí směrem textu: <code>inline-start</code> = začátek řádku, <code>block</code> = shora/zdola.</p><p><code>border-inline-start</code>, <code>padding-inline</code>, <code>margin-block</code>…</p>`,
    task:`Citát <code>.quote</code> má mít na <b>začátku řádku</b> čáru <code>4px solid #2f5bd3</code> a vnitřní odsazení <code>16px</code> ve směru řádku. V RTL verzi musí být čára vpravo.`,
    html:`<blockquote class="quote">Design je to, jak věc funguje.</blockquote><blockquote class="quote" dir="rtl">التصميم هو كيف يعمل الشيء.</blockquote>`,
    fixed:`.quote{margin:0 0 10px;background:#f8fafc;padding-block:10px}`,
    starter:`.quote {\n  \n}`, solution:`.quote {\n  border-inline-start: 4px solid #2f5bd3;\n  padding-inline: 16px;\n}`,
    hints:["Čára: <code>border-inline-start</code>, odsazení: <code>padding-inline</code>.","<code>border-inline-start: 4px solid #2f5bd3; padding-inline: 16px;</code>"],
    checks:[
      {label:"LTR: čára vlevo", test:c=>{const s=c.style(c.qa(".quote")[0]);return s.borderLeftWidth==="4px"&&s.borderRightWidth==="0px"}},
      {label:"RTL: čára vpravo", test:c=>{const s=c.style(c.qa(".quote")[1]);return s.borderRightWidth==="4px"&&s.borderLeftWidth==="0px"}},
      {label:"Odsazení 16px na obou stranách řádku", test:c=>{const s=c.style(c.qa(".quote")[0]);return s.paddingLeft==="16px"&&s.paddingRight==="16px"}} ] },

  { id:"mod-4", module:"modern", xp:400, kind:"debug", title:"Kaskádové vrstvy",
    theory:`<p><code>@layer</code> dělí CSS do vrstev. Pravidla ve vrstvě <b>vždy prohrají</b> s pravidly mimo vrstvu — bez ohledu na specificitu. Knihovnu zabalíš do vrstvy a tvoje jednoduché selektory ji přebijí bez eskalace specificity.</p>`,
    task:`Knihovna používá <code>#app .btn</code> a tvoje <code>.btn</code> prohrává. Zabal kód knihovny do <code>@layer vendor { … }</code>. Selektory neměň, žádné <code>!important</code>.`,
    html:`<div id="app"><button class="btn">Tlačítko</button></div>`,
    fixed:`.btn{color:#fff;border:0;padding:10px 16px;border-radius:8px;font:inherit;font-weight:700}`,
    starter:`/* knihovna */\n#app .btn {\n  background: #94a3b8;\n}\n\n/* tvoje styly */\n.btn {\n  background: #2f5bd3;\n}`,
    solution:`/* knihovna */\n@layer vendor {\n  #app .btn {\n    background: #94a3b8;\n  }\n}\n\n/* tvoje styly */\n.btn {\n  background: #2f5bd3;\n}`,
    hints:["Obal jen blok knihovny: <code>@layer vendor { … }</code>.","Tvoje <code>.btn</code> nech mimo vrstvu."],
    checks:[
      {label:"Tlačítko je modré #2f5bd3", test:c=>c.cs(".btn").backgroundColor==="rgb(47, 91, 211)"},
      {label:"Pravidlo knihovny je ve vrstvě vendor", test:c=>c.rules().some(r=>r.kind==="style"&&r.layer==="vendor"&&/#app \.btn/.test(r.sel))},
      {label:"Bez !important", test:c=>!c.important()} ] },

  { id:"mod-5", module:"modern", xp:400, title:"Nativní vnořování",
    theory:`<p>CSS dnes umí vnořovat jako Sass: uvnitř pravidla napíšeš další, <code>&amp;</code> znamená rodičovský selektor.</p><p><code>.card { &amp; .title { … } &amp;:hover { … } }</code></p>`,
    task:`Uvnitř jediného pravidla <code>.card</code> vnoř: <code>.title</code> s barvou <code>#2f5bd3</code> a <code>&amp;.featured</code> s pozadím <code>#fef3c7</code>.`,
    html:`<div class="card"><h3 class="title">Běžná karta</h3></div><div class="card featured"><h3 class="title">Doporučená karta</h3></div>`,
    fixed:`.card{border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;margin-bottom:8px}.title{margin:0;font-size:17px}`,
    starter:`.card {\n  \n}`, solution:`.card {\n  & .title {\n    color: #2f5bd3;\n  }\n  &.featured {\n    background: #fef3c7;\n  }\n}`,
    hints:["<code>&amp; .title</code> (s mezerou) = potomek, <code>&amp;.featured</code> (bez mezery) = stejný prvek s třídou.","<code>.card { &amp; .title { color: #2f5bd3; } &amp;.featured { background: #fef3c7; } }</code>"],
    checks:[
      {label:"Nadpisy jsou #2f5bd3", test:c=>c.qa(".title").every(e=>c.style(e).color==="rgb(47, 91, 211)")},
      {label:"Doporučená karta má pozadí #fef3c7", test:c=>c.cs(".featured").backgroundColor==="rgb(254, 243, 199)"&&c.style(c.qa(".card")[0]).backgroundColor==="rgba(0, 0, 0, 0)"},
      {label:"Zapsáno vnořením v .card", test:c=>c.rules().filter(r=>r.parent&&/\.card/.test(r.parent)).length>=2} ] }
]);
