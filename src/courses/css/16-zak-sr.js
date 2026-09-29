/* Modul „zak-sr“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"z-4", canvas:900, module:"zak-sr", project:true, xp:1600, requires:["anim","modern"], title:"Neobrutalistní e-shop Kolo",
    brief:{ client:"Kolo, pražský výrobce městských kol",
      story:"Značka pro mladé městské cyklisty. Nechtějí vypadat jako další čistý e-shop. Produktová stránka má být hravá a drzá, ale nákup musí zůstat jednoduchý a přístupný.",
      style:"Neobrutalismus", keywords:["tlusté černé rámečky","tvrdé stíny bez rozmazání","ploché syté barvy","hravé natočení"],
      palette:[["Žlutá","#ffd23f"],["Růžová","#ff5d8f"],["Modrá","#3a86ff"],["Černá","#111111"],["Bílá","#ffffff"]],
      fonts:[["Nadpisy","Archivo Black"],["Text","Inter"]],
      steps:["Styl: rámečky 3px #111 a tvrdé stíny (blur 0) na obrázku, tlačítku i recenzích","Layout: galerie vlevo, info vpravo; na úzko pod sebou","Varianty: zvolená barva (:has(:checked)) je vizuálně odlišená","Tlačítko: hover posun + stín, přechod do 200ms, vypnutý pohyb pro reduced motion","Recenze: hravě natočené, čitelné"] },
    html:`<div class="shop"><div class="product">
<div class="gallery"><div class="main-img"><span>KOLO&nbsp;01</span></div><div class="thumbs"><button class="thumb">1</button><button class="thumb">2</button><button class="thumb">3</button></div></div>
<div class="info"><p class="kicker">Městské kolo</p><h1>Kolo 01 Městák</h1><p class="price">18 990 Kč</p><p class="desc">Ocelový rám, 3 převody v náboji, blatníky a nosič v ceně. Sestaveno v Praze.</p>
<fieldset class="variants"><legend>Barva rámu</legend><label class="variant"><input type="radio" name="c" checked> Žlutá</label><label class="variant"><input type="radio" name="c"> Růžová</label><label class="variant"><input type="radio" name="c"> Modrá</label></fieldset>
<button class="add">Do košíku</button><p class="ship">Doprava zdarma · Vrácení do 30 dnů</p></div>
</div>
<section class="reviews">${[["Konečně kolo, které nevypadá jako z katalogu.","Míša, Karlín"],["Tři převody na Prahu stačí. Kopec na Letnou dám.","Honza, Holešovice"],["Žlutá je fakt žlutá. Řidiči mě vidí.","Bára, Vršovice"]].map(([t,a])=>`<blockquote class="review"><p>${t}</p><cite>${a}</cite></blockquote>`).join("")}</section></div>`,
    fixed:`h1,p{margin:0}blockquote{margin:0}fieldset{margin:0;min-inline-size:0}button{font:inherit;cursor:pointer}`,
    starter:`/* Kolo — neobrutalismus\n   Žlutá #ffd23f · Růžová #ff5d8f · Modrá #3a86ff · Černá #111 · Bílá #fff\n   Nadpisy Archivo Black, text Inter */\n\n.shop {\n  \n}\n`,
    solution:`.shop {
  --ink: #111111;
  --yellow: #ffd23f;
  --pink: #ff5d8f;
  --blue: #3a86ff;
  --border: 3px solid var(--ink);
  --shadow: 5px 5px 0 var(--ink);
  font-family: "Inter", system-ui, sans-serif;
  color: var(--ink);
  background: #fff7e0;
  padding: 24px;
  container-type: inline-size;
}
h1, .kicker, .main-img { font-family: "Archivo Black", Impact, sans-serif; }

.product { display: grid; grid-template-columns: 1fr; gap: 24px; }
@container (min-width: 620px) {
  .product { grid-template-columns: 1.1fr 1fr; }
}

.main-img {
  aspect-ratio: 4 / 3;
  background: var(--yellow);
  border: var(--border);
  box-shadow: var(--shadow);
  display: grid;
  place-items: center;
  font-size: 40px;
}
.thumbs { display: flex; gap: 10px; margin-top: 14px; }
.thumb { width: 52px; height: 52px; border: var(--border); background: #fff; font-weight: 800; }

.info { display: grid; gap: 12px; align-content: start; }
.kicker { font-size: 13px; text-transform: uppercase; }
.info h1 { font-size: 40px; line-height: 1; }
.price { font-size: 28px; font-weight: 800; background: var(--pink); justify-self: start; padding: 2px 10px; border: var(--border); }

.variants { border: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.variants legend { font-weight: 800; margin-bottom: 6px; }
.variant { border: var(--border); padding: 8px 12px; background: #fff; font-weight: 700; }
.variant:has(input:checked) { background: var(--blue); color: #fff; box-shadow: 3px 3px 0 var(--ink); }
.variant:has(:focus-visible) { outline: 3px solid var(--pink); outline-offset: 2px; }

.add {
  background: var(--ink);
  color: #fff;
  border: var(--border);
  box-shadow: 5px 5px 0 var(--pink);
  padding: 14px 20px;
  font-weight: 800;
  font-size: 18px;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.add:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--pink); }
.add:active { transform: translate(3px, 3px); box-shadow: 0 0 0 var(--pink); }
@media (prefers-reduced-motion: reduce) {
  .add { transition: none; }
}

.reviews { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 36px; }
.review { background: #fff; border: var(--border); box-shadow: var(--shadow); padding: 16px; transform: rotate(-1.5deg); }
.review:nth-child(even) { transform: rotate(1.5deg); background: var(--yellow); }
.review cite { display: block; margin-top: 8px; font-style: normal; font-weight: 700; }`,
    hints:["Styl si ulož do proměnných: <code>--border: 3px solid #111; --shadow: 5px 5px 0 #111;</code> a používej na <code>.main-img</code>, <code>.add</code>, <code>.review</code>.","Varianta: <code>.variant:has(input:checked) { … }</code>. Layout: <code>container-type: inline-size</code> na <code>.shop</code> a <code>@container (min-width: 620px)</code> pro dva sloupce."],
    checks:[
      {group:"Styl", label:"Rámečky 3px #111 na obrázku, tlačítku a recenzích", test:c=>[".main-img",".add",".review"].every(s=>{const x=c.cs(s);return x.borderTopWidth==="3px"&&x.borderTopColor==="rgb(17, 17, 17)"&&x.borderTopStyle==="solid"})},
      {group:"Styl", label:"Tvrdé stíny bez rozmazání", test:c=>[".main-img",".add",".review"].every(s=>{const v=c.cs(s).boxShadow;return v!=="none"&&/\d+px \d+px 0px/.test(v)})},
      {group:"Styl", label:"Nadpis v Archivo Black", test:c=>c.font(".info h1","archivo black")},
      {group:"Layout", label:"Na 900px galerie vlevo, info vpravo", test:c=>c.width(900,()=>{const g=c.rect(".gallery"),i=c.rect(".info");return g.right<=i.left+1&&c.near(g.top,i.top,4)})},
      {group:"Layout", label:"Na 380px pod sebou", test:c=>c.width(380,()=>c.rect(".info").top>=c.rect(".gallery").bottom-1)},
      {group:"Varianty", label:"Zvolená varianta má jiné pozadí (:has(:checked))", test:c=>{const v=c.qa(".variant");return c.style(v[0]).backgroundColor!==c.style(v[1]).backgroundColor&&c.rules().some(r=>r.kind==="style"&&/:has\(.*:checked/.test(r.sel))}},
      {group:"Varianty", label:"Fokus z klávesnice na variantě je vidět", test:c=>c.rules().some(r=>r.kind==="style"&&/:focus-visible/.test(r.sel)&&/variant|label/.test(r.sel))},
      {group:"Tlačítko", label:"Hover: posun (transform) a změna stínu", test:c=>{const r=c.rules().filter(r=>r.kind==="style"&&/\.add:hover/.test(r.sel));return r.some(x=>x.style.getPropertyValue("transform"))&&r.some(x=>x.style.getPropertyValue("box-shadow"))}},
      {group:"Tlačítko", label:"Přechod transform nejvýš 200ms", test:c=>{const s=c.cs(".add"),p=s.transitionProperty.split(",").map(x=>x.trim()),d=s.transitionDuration.split(",").map(x=>parseFloat(x));const k=p.findIndex(x=>x==="transform"||x==="all");return k>=0&&(d[k]??d[0])>0&&(d[k]??d[0])<=0.2}},
      {group:"Tlačítko", label:"prefers-reduced-motion vypne přechod", test:c=>c.rules().some(r=>r.media&&/reduce/.test(r.media)&&/\.add/.test(r.sel||""))},
      {group:"Kontrast", label:"Cena a tlačítko: kontrast ≥ 4.5 : 1", test:c=>c.contrast(".price")>=4.5&&c.contrast(".add")>=4.5},
      {group:"Recenze", label:"Recenze jsou hravě natočené", test:c=>c.qa(".review").some(e=>c.style(e).transform!=="none")} ] }
]);
