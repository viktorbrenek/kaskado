/* Modul „nov-logic“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"n-style", module:"nov-logic", xp:440, support:{status:"interop",test:()=>{try{const s=new CSSStyleSheet();s.replaceSync("@container style(--a: 1){a{color:red}}");return s.cssRules.length===1}catch(e){return false}}}, title:"Style queries",
    theory:`<p>Container <b>style</b> query se ptá na hodnotu custom property rodiče: <code>@container style(--tone: danger) { … }</code>. Varianta komponenty se pak řídí jednou proměnnou místo modifikátorových tříd.</p>`,
    task:`Karty uvnitř obalu se <code>--tone: danger</code> dostanou rámeček <code>#e11d48</code> a pozadí <code>#fff1f2</code>. Ostatní nechej být.`,
    html:`<div class="wrap" style="--tone: neutral"><div class="card">Záloha proběhla v pořádku.</div></div><div class="wrap" style="--tone: danger"><div class="card">Disk je téměř plný!</div></div>`,
    fixed:`.card{border:2px solid #cbd5e1;border-radius:10px;padding:12px;margin-bottom:8px;font-weight:700}`,
    starter:`@container () {\n  .card {\n    \n  }\n}`, solution:`@container style(--tone: danger) {\n  .card {\n    border-color: #e11d48;\n    background: #fff1f2;\n  }\n}`,
    hints:["Podmínka je <code>style(--tone: danger)</code>.","Uvnitř: <code>.card { border-color: #e11d48; background: #fff1f2; }</code>"],
    checks:[
      {label:"Karta v danger má červený rámeček a pozadí", test:c=>{const s=c.style(c.q('[style*="danger"] .card'));return s.borderTopColor==="rgb(225, 29, 72)"&&s.backgroundColor==="rgb(255, 241, 242)"}},
      {label:"Neutrální karta beze změny", test:c=>c.style(c.q('[style*="neutral"] .card')).borderTopColor==="rgb(203, 213, 225)"},
      {label:"Řešeno přes @container style()", test:c=>c.rules().some(r=>r.container&&/style\(/.test(r.container))} ],
    fallback:[{label:"@container style(--tone: danger)",re:/@container\s+style\(\s*--tone\s*:\s*danger\s*\)/}] },

  { id:"n-scope", module:"nov-logic", xp:440, support:{status:"baseline",test:()=>"CSSScopeRule" in window}, title:"@scope s „donutem“",
    theory:`<p><code>@scope (.card) to (.content)</code> omezí pravidla na oblast od <code>.card</code> po <code>.content</code> — dovnitř <code>.content</code> už nezasáhnou. Tzv. donut scope řeší kolize stylů komponent a vloženého obsahu (třeba z CMS) bez BEM a vysoké specificity.</p>`,
    task:`Obrázky <code>img</code> v kartě zaobli na <code>12px</code>, ale obrázky uvnitř <code>.content</code> (obsah z CMS) nech bez zaoblení. Použij <code>@scope</code>.`,
    html:`<div class="card"><img alt="" class="cover" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 1'%3E%3Crect width='2' height='1' fill='%238cb6c0'/%3E%3C/svg%3E"><div class="content"><p>Obrázek z redakčního systému:</p><img alt="" class="cms" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 1'%3E%3Crect width='2' height='1' fill='%23f3b184'/%3E%3C/svg%3E"></div></div>`,
    fixed:`.card{width:260px;border:1px solid #cbd5e1;border-radius:14px;padding:10px}img{display:block;width:100%}.cover{margin-bottom:8px}`,
    starter:`@scope () to () {\n  \n}`, solution:`@scope (.card) to (.content) {\n  img {\n    border-radius: 12px;\n  }\n}`,
    hints:["Začátek: <code>(.card)</code>, hranice: <code>(.content)</code>.","Uvnitř: <code>img { border-radius: 12px; }</code>"],
    checks:[
      {label:"Obrázek karty má zaoblení 12px", test:c=>c.cs(".cover").borderTopLeftRadius==="12px"},
      {label:"Obrázek v .content zůstal hranatý", test:c=>c.cs(".cms").borderTopLeftRadius==="0px"},
      {label:"Řešeno přes @scope", test:c=>c.rules().some(r=>r.scope)} ],
    fallback:[{label:"@scope (.card) to (.content)",re:/@scope\s*\(\s*\.card\s*\)\s*to\s*\(\s*\.content\s*\)/}] },

  { id:"n-if", module:"nov-logic", xp:460, support:{status:"chromium",test:"(width: if(style(--x: 1): 10px; else: 20px))"}, title:"Podmínky v CSS: if()",
    theory:`<p>Funkce <code>if()</code> vybírá hodnotu podle podmínky přímo ve vlastnosti:</p><p><code>padding: if(style(--size: big): 16px 24px; else: 8px 12px);</code></p><p>Zatím jen Chromium, ale ukazuje, kam CSS míří — logika bez preprocesorů.</p>`,
    task:`Tlačítka <code>.btn</code>: když mají <code>--size: big</code>, padding <code>16px 24px</code>, jinak <code>8px 12px</code>. Použij <code>if()</code>.`,
    html:`<button class="btn">Malé</button> <button class="btn" style="--size: big">Velké</button>`,
    fixed:`.btn{background:#2f5bd3;color:#fff;border:0;border-radius:8px;font:inherit;font-weight:700}`,
    starter:`.btn {\n  padding: ;\n}`, solution:`.btn {\n  padding: if(style(--size: big): 16px 24px; else: 8px 12px);\n}`,
    hints:["Tvar: <code>if(PODMÍNKA: HODNOTA; else: JINÁ)</code>.","Podmínka: <code>style(--size: big)</code>"],
    checks:[
      {label:"Malé tlačítko: 8px 12px", test:c=>{const s=c.style(c.qa(".btn")[0]);return s.paddingTop==="8px"&&s.paddingLeft==="12px"}},
      {label:"Velké tlačítko: 16px 24px", test:c=>{const s=c.style(c.qa(".btn")[1]);return s.paddingTop==="16px"&&s.paddingLeft==="24px"}},
      {label:"Řešeno přes if()", test:c=>c.uses(/if\(\s*style\(/)} ],
    fallback:[{label:"if(style(--size: big): 16px 24px; else: 8px 12px)",re:/if\(\s*style\(\s*--size\s*:\s*big\s*\)\s*:\s*16px 24px\s*;\s*else\s*:\s*8px 12px\s*\)/}] },

  { id:"n-sibling", module:"nov-logic", xp:460, support:{status:"chromium",test:"(width: calc(sibling-index() * 1px))"}, title:"sibling-index() a kaskáda zpoždění",
    theory:`<p><code>sibling-index()</code> vrátí pořadí prvku mezi sourozenci (od 1), <code>sibling-count()</code> jejich počet. Postupné zpoždění animace („stagger“) dřív vyžadovalo <code>:nth-child</code> pro každou položku nebo inline styly — teď je to jeden řádek.</p>`,
    task:`Položkám <code>.item</code> nastav <code>animation-delay</code> jako <code>sibling-index() × 80ms</code> (třetí položka tedy 240ms).`,
    html:`<ul class="list">${["Rozvrh","Úkoly","Zprávy","Nastavení"].map(t=>`<li class="item">${t}</li>`).join("")}</ul>`,
    fixed:`@keyframes rise{from{opacity:0;transform:translateY(8px)}}.list{list-style:none;padding:0;display:grid;gap:6px}.item{background:#eef2f7;padding:8px 12px;border-radius:8px;animation:rise .4s both}`,
    starter:`.item {\n  animation-delay: ;\n}`, solution:`.item {\n  animation-delay: calc(sibling-index() * 80ms);\n}`,
    hints:["Násobení jednotkou: <code>calc(… * 80ms)</code>.","<code>animation-delay: calc(sibling-index() * 80ms);</code>"],
    checks:[
      {label:"1. položka 80ms", test:c=>c.style(c.qa(".item")[0]).animationDelay==="0.08s"},
      {label:"3. položka 240ms", test:c=>c.style(c.qa(".item")[2]).animationDelay==="0.24s"},
      {label:"Řešeno přes sibling-index()", test:c=>c.uses(/sibling-index\(\)/)} ],
    fallback:[{label:"calc(sibling-index() * 80ms)",re:/calc\(\s*sibling-index\(\)\s*\*\s*80ms\s*\)/}] }
]);
