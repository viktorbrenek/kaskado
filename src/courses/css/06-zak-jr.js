/* Modul „zak-jr“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"z-1", canvas:900, module:"zak-jr", project:true, xp:1000, requires:["box","flex"], title:"Portfolio fotografky",
    brief:{ client:"Jana Světlá, svatební fotografka",
      story:"Jana má web z šablony, kterou používá půlka Prahy. Chce jednoduchou stránku, kde vyniknou fotky: klidná typografie, žádné efekty, jasná cesta ke kontaktu.",
      style:"Švýcarský minimalismus", keywords:["mřížka","hodně bílé","jedna akcentní barva","velký bezpatkový nadpis"],
      palette:[["Papír","#fafaf7"],["Inkoust","#111111"],["Šedá","#5f5f5f"],["Akcent","#e4572e"]],
      fonts:[["Vše","Inter"]],
      steps:["Základ: písmo Inter, barvy papíru a inkoustu","Hlavička: logo vlevo, menu vpravo, CTA Kontakt s akcentním rámečkem","Úvod: velký tučný nadpis (min. 40px), podtitulek šedě","Mřížka prací: 3 sloupce s mezerou, fotky min. 160px vysoké","Patička: řádek s linkou nahoře"] },
    html:`<div class="site">
<header class="top"><a class="logo">Jana Světlá</a><nav class="menu"><a>Portfolio</a><a>O mně</a><a>Ceník</a><a class="cta">Kontakt</a></nav></header>
<section class="intro"><h1>Fotím svatby, které nejsou naaranžované.</h1><p>Praha a okolí · od roku 2014 · přes 120 svateb</p></section>
<section class="works">${["Anna & Tomáš","Eliška & Jakub","Marie & Ondřej","Tereza & Filip","Klára & Adam","Lucie & Petr"].map(n=>`<figure class="work"><div class="ph"></div><figcaption>${n}</figcaption></figure>`).join("")}</section>
<footer class="foot"><span>© 2026 Jana Světlá</span><a>Instagram</a><a>E-mail</a></footer>
</div>`,
    fixed:`a{text-decoration:none;color:inherit;cursor:pointer}figure{margin:0}h1,p{margin:0}.work:nth-child(1) .ph{background:#c9c3b8}.work:nth-child(2) .ph{background:#a8b0a4}.work:nth-child(3) .ph{background:#d8cfc4}.work:nth-child(4) .ph{background:#9ea7ad}.work:nth-child(5) .ph{background:#cbbfae}.work:nth-child(6) .ph{background:#b4ada5}`,
    starter:`/* Jana Světlá — portfolio\n   Paleta: #fafaf7 papír, #111111 inkoust, #5f5f5f šedá, #e4572e akcent */\n\n.site {\n  \n}\n\n.top {\n  \n}\n`,
    solution:`.site {
  font-family: "Inter", system-ui, sans-serif;
  background: #fafaf7;
  color: #111111;
  padding: 32px 40px;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24px;
}
.logo { font-weight: 800; letter-spacing: -0.02em; }
.menu { display: flex; gap: 24px; align-items: center; }
.cta { border: 2px solid #e4572e; padding: 6px 14px; }

.intro { padding: 64px 0 48px; }
.intro h1 {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  max-width: 14ch;
}
.intro p { color: #5f5f5f; margin-top: 16px; }

.works {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.ph { height: 220px; }
.work figcaption { font-size: 13px; padding-top: 8px; }

.foot {
  display: flex;
  gap: 24px;
  margin-top: 48px;
  padding-top: 16px;
  border-top: 1px solid #111111;
  font-size: 13px;
}
.foot span { margin-right: auto; }`,
    hints:["Hlavička i patička jsou flexbox. <code>justify-content: space-between</code> rozdělí logo a menu.","Mřížka prací: <code>display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;</code> a <code>.ph { height: 200px; }</code>"],
    checks:[
      {group:"Základ", label:"Písmo Inter na celé stránce", test:c=>c.font(".site","inter")&&c.font(".intro p","inter")},
      {group:"Základ", label:"Pozadí papír #fafaf7, text inkoust #111111", test:c=>c.cs(".site").backgroundColor==="rgb(250, 250, 247)"&&c.cs(".site").color==="rgb(17, 17, 17)"},
      {group:"Hlavička", label:"Logo vlevo, menu vpravo, na jedné ose", test:c=>c.width(900,()=>{const t=c.rect(".top"),l=c.rect(".logo"),m=c.rect(".menu");return c.cs(".top").display==="flex"&&l.left<m.left&&c.near(m.right,t.right-parseFloat(c.cs(".top").paddingRight),2)&&c.near(l.top+l.height/2,m.top+m.height/2,3)})},
      {group:"Hlavička", label:"Položky menu v řadě s mezerou aspoň 16px", test:c=>c.width(900,()=>{const a=c.qa(".menu a").map(e=>e.getBoundingClientRect());return a.every(x=>c.near(x.top+x.height/2,a[0].top+a[0].height/2,3))&&a[1].left-a[0].right>=16})},
      {group:"Hlavička", label:"CTA Kontakt má akcentní rámeček", test:c=>{const s=c.cs(".cta");return parseFloat(s.borderTopWidth)>=1&&s.borderTopColor==="rgb(228, 87, 46)"}},
      {group:"Úvod", label:"Nadpis aspoň 40px a tučný (700+)", test:c=>parseFloat(c.cs(".intro h1").fontSize)>=40&&+c.cs(".intro h1").fontWeight>=700},
      {group:"Úvod", label:"Podtitulek šedou #5f5f5f, kontrast ≥ 4.5 : 1", test:c=>c.cs(".intro p").color==="rgb(95, 95, 95)"&&c.contrast(".intro p")>=4.5},
      {group:"Mřížka prací", label:"3 sloupce (při šířce 900px)", test:c=>c.width(900,()=>c.cols(".work")===3)},
      {group:"Mřížka prací", label:"Mezera mezi fotkami aspoň 12px", test:c=>c.width(900,()=>{const r=c.qa(".work").map(e=>e.getBoundingClientRect());return r[1].left-r[0].right>=12})},
      {group:"Mřížka prací", label:"Fotky aspoň 160px vysoké", test:c=>c.rect(".ph").height>=160},
      {group:"Patička", label:"Patička v řadě s linkou nahoře", test:c=>{const s=c.cs(".foot");return s.display==="flex"&&parseFloat(s.borderTopWidth)>=1&&parseFloat(s.paddingTop)>=12}} ] }
]);
