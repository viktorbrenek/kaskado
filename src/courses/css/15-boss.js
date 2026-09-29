/* Modul „boss“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"boss-1", module:"boss", xp:500, boss:true, title:"Karta produktu",
    theory:`<p>Projekt z praxe. Poskládej komponentu z toho, co umíš: flex ve sloupci, poměr stran, odsazení, zaoblení a tlačítko přilepené dole — i když má karta vedle delší text.</p>`,
    task:`Karty v <code>.shop</code> (grid se 2 sloupci je hotový):<br>1) <code>.product</code> jako flex sloupec, <code>border-radius: 12px</code>, <code>overflow: hidden</code><br>2) <code>.product img</code> šířka 100 %, poměr <code>4 / 3</code>, <code>cover</code><br>3) <code>.body</code> padding <code>16px</code>, roste (<code>flex: 1</code>) a je také flex sloupec<br>4) <code>.buy</code> přilepené dole (<code>margin-top: auto</code>), přes celou šířku`,
    html:`<div class="shop">${[["Klávesnice","Mechanická, tichá.","2 490 Kč"],["Monitor 27\"","4K panel s kalibrací barev a nastavitelným stojanem, ideální pro design.","8 990 Kč"]].map(([n,d,p])=>`<article class="product"><img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%238cb6c0'/%3E%3Crect x='60' y='110' width='180' height='80' rx='12' fill='%2314203a'/%3E%3C/svg%3E"><div class="body"><b>${n}</b><p>${d}</p><strong class="price">${p}</strong><button class="buy">Do košíku</button></div></article>`).join("")}</div>`,
    fixed:`.shop{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:stretch}.product{border:1px solid #cbd5e1;background:#fff}.product img{display:block}.body p{margin:4px 0 8px;font-size:13px;color:#475569}.price{font-size:18px}.buy{background:#2f5bd3;color:#fff;border:0;padding:8px;border-radius:8px;font:inherit;font-weight:700;margin-top:8px}`,
    starter:`.product {\n  \n}\n\n.product img {\n  \n}\n\n.body {\n  \n}\n\n.buy {\n  \n}`,
    solution:`.product {\n  display: flex;\n  flex-direction: column;\n  border-radius: 12px;\n  overflow: hidden;\n}\n\n.product img {\n  width: 100%;\n  aspect-ratio: 4 / 3;\n  object-fit: cover;\n}\n\n.body {\n  padding: 16px;\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n}\n\n.buy {\n  margin-top: auto;\n  width: 100%;\n}`,
    hints:["Flex sloupec = <code>display: flex; flex-direction: column;</code> — potřebuješ ho na <code>.product</code> i <code>.body</code>.","Tlačítka se srovnají dolů díky <code>flex: 1</code> na <code>.body</code> a <code>margin-top: auto</code> na <code>.buy</code>."],
    checks:[
      {label:"Karta: flex sloupec, zaoblení 12px", test:c=>{const s=c.cs(".product");return s.display==="flex"&&s.flexDirection==="column"&&s.borderTopLeftRadius==="12px"&&s.overflow==="hidden"}},
      {label:"Obrázek 4:3 přes celou šířku, cover", test:c=>{const r=c.rect(".product img");return c.near(r.width/r.height,4/3,.02)&&c.near(r.width,c.rect(".product").width-2)&&c.cs(".product img").objectFit==="cover"}},
      {label:"Tělo: padding 16px", test:c=>c.cs(".body").paddingLeft==="16px"&&c.cs(".body").paddingTop==="16px"},
      {label:"Tlačítka obou karet jsou na stejné výšce dole", test:c=>{const b=c.qa(".buy").map(e=>e.getBoundingClientRect());const p=c.qa(".product").map(e=>e.getBoundingClientRect());return c.near(b[0].bottom,b[1].bottom)&&c.near(p[0].bottom-b[0].bottom,17,1.5)}},
      {label:"Tlačítko přes celou šířku těla", test:c=>c.near(c.rect(".buy").width,c.rect(".body").width-32)} ] },

  { id:"boss-2", module:"boss", xp:550, boss:true, title:"Ceník",
    theory:`<p>Tři tarify vedle sebe, prostřední zvýrazněný. Na úzkém místě se mají sloupce skládat pod sebe — bez media query.</p>`,
    task:`1) <code>.plans</code>: grid s <code>repeat(auto-fit, minmax(160px, 1fr))</code> a mezerou <code>12px</code><br>2) <code>.plan</code>: padding <code>20px</code>, rámeček <code>1px solid #cbd5e1</code>, zaoblení <code>12px</code><br>3) <code>.plan.featured</code>: rámeček <code>2px solid #2f5bd3</code>, pozadí <code>#eef4ff</code><br>Test: na 640px tři sloupce, na 320px jeden.`,
    html:`<div class="plans">${[["Start","0 Kč",""],["Tým","490 Kč"," featured"],["Firma","1 490 Kč",""]].map(([n,p,f])=>`<div class="plan${f}"><b>${n}</b><div class="price">${p}</div><small>měsíčně</small></div>`).join("")}</div>`,
    fixed:`.price{font-size:26px;font-weight:800;margin:6px 0 0}`,
    starter:`.plans {\n  \n}\n\n.plan {\n  \n}\n\n.plan.featured {\n  \n}`,
    solution:`.plans {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));\n  gap: 12px;\n}\n\n.plan {\n  padding: 20px;\n  border: 1px solid #cbd5e1;\n  border-radius: 12px;\n}\n\n.plan.featured {\n  border: 2px solid #2f5bd3;\n  background: #eef4ff;\n}`,
    hints:["Grid a formule z úrovně „Mřížka bez media query“.","Zvýraznění patří na <code>.plan.featured</code> (bez mezery — stejný prvek)."],
    checks:[
      {label:"Na 640px tři sloupce", test:c=>c.width(640,()=>c.cols(".plan")===3)},
      {label:"Na 320px jeden sloupec", test:c=>c.width(320,()=>c.cols(".plan")===1)},
      {label:"Mezera 12px", test:c=>c.cs(".plans").columnGap==="12px"},
      {label:"Tarif: padding 20px, rámeček 1px, zaoblení 12px", test:c=>{const s=c.style(c.qa(".plan")[0]);return s.paddingTop==="20px"&&s.borderTopWidth==="1px"&&s.borderTopColor==="rgb(203, 213, 225)"&&s.borderTopLeftRadius==="12px"}},
      {label:"Zvýrazněný tarif: 2px #2f5bd3, pozadí #eef4ff", test:c=>{const s=c.cs(".featured");return s.borderTopWidth==="2px"&&s.borderTopColor==="rgb(47, 91, 211)"&&s.backgroundColor==="rgb(238, 244, 255)"}} ] },

  { id:"boss-3", module:"boss", xp:600, boss:true, title:"Modální okno",
    theory:`<p>Finále: vrstvení, pozicování, centrování a detail zavíracího tlačítka. Tady se pozná senior.</p>`,
    task:`V ploše <code>.app</code> (je <code>position: relative</code>):<br>1) <code>.backdrop</code> absolutně přes celou plochu, pozadí <code>rgba(15, 23, 42, 0.6)</code>, <code>z-index: 10</code>, obsah vycentrovaný (flex nebo grid)<br>2) <code>.dialog</code> max. šířka <code>300px</code>, šířka 100 %, padding <code>20px</code>, zaoblení <code>14px</code>, <code>position: relative</code><br>3) <code>.close</code> absolutně <code>8px</code> od horního a pravého rohu dialogu`,
    html:`<div class="app"><p>Obsah aplikace pod modálním oknem. Tabulka, grafy, formuláře…</p><div class="backdrop"><div class="dialog" role="dialog" aria-label="Smazat projekt"><button class="close" aria-label="Zavřít">×</button><h3>Smazat projekt?</h3><p>Tuto akci nejde vrátit.</p></div></div></div>`,
    fixed:`.app{position:relative;height:260px;background:#eef2f7;border-radius:12px;padding:14px;overflow:hidden}.dialog{background:#fff;box-sizing:border-box}.dialog h3{margin:0 0 6px}.close{border:0;background:#eef2f7;width:28px;height:28px;border-radius:50%;font-size:18px;line-height:1}`,
    starter:`.backdrop {\n  \n}\n\n.dialog {\n  \n}\n\n.close {\n  \n}`,
    solution:`.backdrop {\n  position: absolute;\n  inset: 0;\n  background: rgba(15, 23, 42, 0.6);\n  z-index: 10;\n  display: grid;\n  place-items: center;\n}\n\n.dialog {\n  position: relative;\n  width: 100%;\n  max-width: 300px;\n  padding: 20px;\n  border-radius: 14px;\n}\n\n.close {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}`,
    hints:["Backdrop = úroveň „Překryv přes celou plochu“ + centrování z „Dokonalý střed“ (nebo <code>display: grid; place-items: center;</code>).","Zavírací tlačítko = úroveň „Štítek v rohu“: rodič <code>.dialog</code> relative, <code>.close</code> absolute."],
    checks:[
      {label:"Backdrop pokrývá celou .app", test:c=>{const a=c.rect(".app"),b=c.rect(".backdrop");return c.near(a.width,b.width)&&c.near(a.height,b.height)&&c.near(a.top,b.top)}},
      {label:"Backdrop: rgba(15, 23, 42, 0.6), z-index 10", test:c=>{const s=c.cs(".backdrop");return s.backgroundColor==="rgba(15, 23, 42, 0.6)"&&s.zIndex==="10"}},
      {label:"Dialog vycentrovaný na obou osách", test:c=>{const a=c.rect(".backdrop"),d=c.rect(".dialog");return c.near(a.left+a.width/2,d.left+d.width/2)&&c.near(a.top+a.height/2,d.top+d.height/2)}},
      {label:"Dialog: max. 300px, padding 20px, zaoblení 14px", test:c=>{const s=c.cs(".dialog");return s.maxWidth==="300px"&&c.near(c.rect(".dialog").width,Math.min(300,c.rect(".backdrop").width))&&s.paddingTop==="20px"&&s.borderTopLeftRadius==="14px"}},
      {label:"Zavírací tlačítko 8px od rohu dialogu", test:c=>{const d=c.rect(".dialog"),x=c.rect(".close");return c.near(x.top-d.top,8)&&c.near(d.right-x.right,8)}} ] }
]);
