/* Modul „flex“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"flex-1", module:"flex", xp:200, title:"Do řady!",
    theory:`<p>Flexbox se zapíná na <b>rodiči</b>: <code>display: flex;</code>. Jeho přímé děti se pak seřadí vedle sebe.</p>`,
    task:`Seřaď tři dlaždice v kontejneru <code>.row</code> vedle sebe.`,
    html:`<div class="row"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>`,
    fixed:`.row{background:#eef2f7;padding:10px;border-radius:10px;gap:10px}.item{width:56px;height:56px;background:#8cb6c0;border-radius:8px;display:grid;place-items:center;font-weight:700;margin:4px}`,
    starter:`.row {\n  \n}`, solution:`.row {\n  display: flex;\n}`,
    hints:["Styluj rodiče, ne dlaždice.","<code>display: flex;</code>"],
    checks:[
      {label:".row je flex kontejner", test:c=>/flex/.test(c.cs(".row").display)},
      {label:"Dlaždice jsou v jedné řadě", test:c=>{const t=c.qa(".item").map(e=>Math.round(e.getBoundingClientRect().top));return t.length===3&&t.every(v=>v===t[0])}} ] },

  { id:"flex-2", module:"flex", xp:200, title:"Rozprostři to",
    theory:`<p><code>justify-content</code> rozděluje volné místo na <b>hlavní ose</b> (u řady vodorovně). Hodnoty: <code>flex-start</code>, <code>center</code>, <code>flex-end</code>, <code>space-between</code>, <code>space-around</code>, <code>space-evenly</code>.</p>`,
    task:`Menu má mít první položku úplně vlevo, poslední úplně vpravo a zbytek rovnoměrně mezi nimi. Tmavá plocha je volné místo, které se rozdělí.`,
    html:`<nav class="row"><a>Domů</a><a>Ceník</a><a>Kontakt</a></nav>`,
    fixed:`.row{background:#14203a;padding:10px;border-radius:10px}.row a{color:#fff;background:#2f5bd3;padding:6px 12px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none}`,
    starter:`.row {\n  display: flex;\n  \n}`, solution:`.row {\n  display: flex;\n  justify-content: space-between;\n}`,
    hints:["Použij <code>justify-content</code>.","Hodnota, která dá mezery jen <i>mezi</i> položky: <code>space-between</code>."],
    checks:[{label:"justify-content: space-between", test:c=>c.cs(".row").justifyContent==="space-between"},
      {label:"První položka u levého okraje, poslední u pravého", test:c=>{const r=c.rect(".row"),a=c.qa(".row a").map(e=>e.getBoundingClientRect());return c.near(a[0].left,r.left+10)&&c.near(a[a.length-1].right,r.right-10)}}] },

  { id:"flex-3", module:"flex", xp:220, title:"Srovnej a nadechni",
    theory:`<p><code>align-items</code> zarovnává na <b>příčné ose</b> (u řady svisle). <code>gap</code> přidá mezery mezi položky bez marginů.</p>`,
    task:`Dlaždice různé výšky vycentruj svisle a dej mezi ně mezeru <code>16px</code>.`,
    html:`<div class="row"><div class="item">S</div><div class="item tall">M</div><div class="item">L</div></div>`,
    fixed:`.row{height:150px;background:#eef2f7;padding:10px;border-radius:10px}.item{width:56px;height:48px;background:#b9c77a;border-radius:8px;display:grid;place-items:center;font-weight:700}.item.tall{height:110px}`,
    starter:`.row {\n  display: flex;\n  \n}`, solution:`.row {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}`,
    hints:["Svislé zarovnání v řadě = <code>align-items</code>.","Mezery: <code>gap: 16px;</code>"],
    checks:[
      {label:"align-items: center", test:c=>c.cs(".row").alignItems==="center"},
      {label:"Mezera mezi dlaždicemi 16px", test:c=>{const r=c.qa(".item").map(e=>e.getBoundingClientRect());return r.length===3&&Math.round(r[1].left-r[0].right)===16}} ] },

  { id:"flex-4", module:"flex", xp:250, title:"Dokonalý střed",
    theory:`<p>Legendární úkol webu: vycentrovat prvek vodorovně i svisle. S flexboxem stačí kombinace <code>justify-content</code> a <code>align-items</code> na rodiči.</p><p>Uznáme i jiné řešení — třeba přes grid.</p>`,
    task:`Umísti odznak <code>.badge</code> přesně doprostřed plochy <code>.stage</code>.`,
    html:`<div class="stage"><div class="badge">CSS</div></div>`,
    fixed:`.stage{height:220px;background:repeating-linear-gradient(0deg,#eef2f7 0 19px,#dde4ee 19px 20px),#eef2f7;border-radius:12px}.badge{width:90px;height:90px;border-radius:50%;background:#f3b184;display:grid;place-items:center;font-weight:800;font-size:20px}`,
    starter:`.stage {\n  \n}`, solution:`.stage {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`,
    hints:["Styluj rodiče <code>.stage</code> — zapni flexbox.","Potřebuješ střed na obou osách: <code>justify-content</code> i <code>align-items</code> na <code>center</code>."],
    checks:[
      {label:"Vodorovně na středu", test:c=>{const s=c.rect(".stage"),b=c.rect(".badge");return Math.abs((s.left+s.width/2)-(b.left+b.width/2))<1.5}},
      {label:"Svisle na středu", test:c=>{const s=c.rect(".stage"),b=c.rect(".badge");return Math.abs((s.top+s.height/2)-(b.top+b.height/2))<1.5}} ] }
]);
