/* Modul „box“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"box-1", module:"box", xp:150, title:"Vnitřní odsazení",
    theory:`<p>Každý prvek je krabice: <b>obsah</b> → <b>padding</b> (vnitřní odsazení) → <b>border</b> → <b>margin</b> (vnější odsazení). V DevTools je uvidíš jako modrou, zelenou, žlutou a oranžovou vrstvu.</p><p><code>padding: 24px;</code> nastaví všechny čtyři strany najednou.</p>`,
    task:`Karta <code>.card</code> je nalepená na text. Dej jí vnitřní odsazení <code>24px</code> ze všech stran.`,
    html:`<div class="card"><b>Tip dne</b><br>Vzduch kolem obsahu zlepšuje čitelnost.</div>`,
    fixed:`.card{background:#e8f0fe;border-radius:10px}`,
    starter:`.card {\n  \n}`, solution:`.card {\n  padding: 24px;\n}`,
    hints:["Vnitřní odsazení = <code>padding</code>.","Jedna hodnota platí pro všechny strany: <code>padding: 24px;</code>"],
    checks:[{label:"Padding 24px na všech stranách", test:c=>{const s=c.cs(".card");return [s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].every(v=>v==="24px")}}] },

  { id:"box-2", module:"box", xp:150, title:"Rámeček a zaoblení",
    theory:`<p>Zkratka <code>border</code> bere tloušťku, styl a barvu: <code>border: 1px solid gray;</code></p><p>Rohy zaoblíš přes <code>border-radius</code>.</p>`,
    task:`Dej kartě rámeček <code>2px solid #1e3a8a</code> a zaoblení rohů <code>12px</code>.`,
    html:`<div class="card"><b>Objednávka #2041</b><br>Stav: odesláno</div>`,
    fixed:`.card{padding:20px;background:#fff}`,
    starter:`.card {\n  \n}`, solution:`.card {\n  border: 2px solid #1e3a8a;\n  border-radius: 12px;\n}`,
    hints:["Pořadí ve zkratce: tloušťka, styl, barva.","Zaoblení: <code>border-radius: 12px;</code>"],
    checks:[
      {label:"Rámeček 2px solid", test:c=>{const s=c.cs(".card");return s.borderTopWidth==="2px"&&s.borderTopStyle==="solid"&&s.borderLeftWidth==="2px"}},
      {label:"Barva rámečku #1e3a8a", test:c=>c.cs(".card").borderTopColor==="rgb(30, 58, 138)"},
      {label:"Zaoblení 12px", test:c=>{const s=c.cs(".card");return s.borderTopLeftRadius==="12px"&&s.borderBottomRightRadius==="12px"}} ] },

  { id:"box-3", module:"box", xp:180, title:"Přesná šířka",
    theory:`<p>Výchozí <code>box-sizing: content-box</code> počítá <code>width</code> jen pro obsah — padding a rámeček se <i>přičtou</i>. Krabice 200px s paddingem 20px a rámečkem 4px je tak ve skutečnosti 248px široká.</p>`,
    task:`Krabice <code>.box</code> musí být na stránce přesně <b>200px</b> široká — i s paddingem a rámečkem. <code>width</code> ani <code>padding</code> neměň.`,
    html:`<div class="box">Mám být 200px</div><div class="ruler"></div>`,
    fixed:`.ruler{width:200px;height:6px;margin-top:6px;background:repeating-linear-gradient(90deg,#e11d48 0 1px,transparent 1px 20px),#fde2e7}`,
    starter:`.box {\n  width: 200px;\n  padding: 20px;\n  border: 4px solid #0f766e;\n  \n}`,
    solution:`.box {\n  width: 200px;\n  padding: 20px;\n  border: 4px solid #0f766e;\n  box-sizing: border-box;\n}`,
    hints:["Hledáš vlastnost, která mění způsob výpočtu šířky.","<code>box-sizing</code> má hodnotu, která do šířky zahrne padding i border."],
    checks:[
      {label:"Padding zůstal 20px", test:c=>c.cs(".box").paddingLeft==="20px"},
      {label:"Celková šířka je přesně 200px", test:c=>Math.round(c.rect(".box").width)===200} ] }
]);
