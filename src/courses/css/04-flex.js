/* Modul „flex“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"flex-1", module:"flex", xp:200, title:"Do řady!",
    slides:[
      { title:"Flexbox řadí děti za sebe", html:`<p>Normálně jdou bloky <b>pod sebe</b>. Když rodiči dáš <code>display: flex</code>, jeho <b>přímé děti</b> se seřadí za sebe do řady.</p>
        ${fxGal([`<figure class="fx"><div class="fx-box" style="display:block;height:auto"><div class="fx-i" style="margin-bottom:6px">1</div><div class="fx-i" style="margin-bottom:6px">2</div><div class="fx-i">3</div></div><figcaption>bez flexu: bloky pod sebou</figcaption></figure>`,fx({code:"display: flex"})])}
        <p>Flex se vždy píše na <b>rodiče</b> (kontejner). Děti jsou pak <b>položky</b>.</p>` },
      { title:"Dvě osy", html:`<p>Flexbox myslí ve dvou osách. <b>Hlavní osa</b> vede ve směru řady, <b>příčná</b> je na ni kolmo. Skoro všechno ve flexboxu se ptá: „na které ose?“</p>${axesDiagram()}
        <p>Za chvíli: <code>justify-content</code> = hlavní osa, <code>align-items</code> = příčná osa.</p>` } ],
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
    slides:[
      { title:"justify-content rozděluje volné místo", html:`<p>Když jsou položky menší než kontejner, zbyde <b>volné místo</b> na hlavní ose. <code>justify-content</code> říká, kam ho dát:</p>
        ${fxGal([fx({jc:"flex-start",code:"flex-start",cap:"výchozí"}),fx({jc:"center",code:"center"}),fx({jc:"flex-end",code:"flex-end"}),fx({jc:"space-between",code:"space-between",cap:"jen mezi"}),fx({jc:"space-around",code:"space-around"}),fx({jc:"space-evenly",code:"space-evenly",cap:"všude stejně"})])}
        <p>Tmavé plochy v obrázcích jsou volné místo. U menu chceš krajní položky u okrajů a zbytek rozdělit mezi ně.</p>` } ],
    theory:`<p><code>justify-content</code> rozděluje volné místo na <b>hlavní ose</b> (u řady vodorovně). Hodnoty: <code>flex-start</code>, <code>center</code>, <code>flex-end</code>, <code>space-between</code>, <code>space-around</code>, <code>space-evenly</code>.</p>`,
    task:`Menu má mít první položku úplně vlevo, poslední úplně vpravo a zbytek rovnoměrně mezi nimi. Tmavá plocha je volné místo, které se rozdělí.`,
    html:`<nav class="row"><a>Domů</a><a>Ceník</a><a>Kontakt</a></nav>`,
    fixed:`.row{background:#14203a;padding:10px;border-radius:10px}.row a{color:#fff;background:#2f5bd3;padding:6px 12px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none}`,
    starter:`.row {\n  display: flex;\n  \n}`, solution:`.row {\n  display: flex;\n  justify-content: space-between;\n}`,
    hints:["Použij <code>justify-content</code>.","Hodnota, která dá mezery jen <i>mezi</i> položky: <code>space-between</code>."],
    checks:[{label:"justify-content: space-between", test:c=>c.cs(".row").justifyContent==="space-between"},
      {label:"První položka u levého okraje, poslední u pravého", test:c=>{const r=c.rect(".row"),a=c.qa(".row a").map(e=>e.getBoundingClientRect());return c.near(a[0].left,r.left+10)&&c.near(a[a.length-1].right,r.right-10)}}] },

  { id:"flex-3", module:"flex", xp:220, title:"Srovnej a nadechni",
    slides:[
      { title:"align-items zarovnává na příčné ose", html:`<p>U řady je příčná osa svislá. <code>align-items</code> říká, jak se položky různé výšky srovnají:</p>
        ${fxGal([fx({ai:"stretch",hs:[0,0,0],h:80,code:"stretch",cap:"výchozí: roztáhne"}),fx({ai:"flex-start",hs:[30,60,40],h:80,code:"flex-start"}),fx({ai:"center",hs:[30,60,40],h:80,code:"center"}),fx({ai:"flex-end",hs:[30,60,40],h:80,code:"flex-end"})])}` },
      { title:"gap: mezery bez marginů", html:`<p><code>gap: 16px</code> dá mezeru jen <b>mezi</b> položky, ne ke krajům. Dřív se to řešilo marginy a pak jejich odčítáním u první a poslední položky.</p>
        ${fxGal([fx({gap:2,code:"gap: 2px"}),fx({gap:24,code:"gap: 24px"})])}` } ],
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
    slides:[
      { title:"Střed na obou osách", html:`<p>Vycentrovat prvek znamená vyřešit obě osy zvlášť:</p><ul><li><code>justify-content: center</code> → střed na <b>hlavní</b> ose (vodorovně)</li><li><code>align-items: center</code> → střed na <b>příčné</b> ose (svisle)</li></ul>
        ${fxGal([fx({jc:"center",n:1,h:90,code:"justify-content: center",cap:"jen vodorovně"}),fx({jc:"center",ai:"center",n:1,h:90,code:"+ align-items: center",cap:"obě osy"})])}
        <p>Grid to umí zkratkou <code>place-items: center</code> — uznáme i to.</p>` } ],
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
