/* Modul „zak-md“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"z-2", canvas:900, module:"zak-md", project:true, xp:1300, requires:["pos","resp"], title:"Kavárna Zrnko — landing page",
    brief:{ client:"Kavárna Zrnko, Brno-Veveří",
      story:"Malá výběrová kavárna, která si sama praží. Web má lákat na atmosféru, ukázat menu a otevírací dobu. Většina návštěv je z mobilu přes Instagram — musí fungovat i úzce.",
      style:"Organický a teplý", keywords:["krémové pozadí","patkový nadpis","zaoblené tvary","ruční, ne korporátní"],
      palette:[["Krém","#f6efe6"],["Espresso","#3b2a20"],["Karamel","#c8814a"],["Šalvěj","#8a9a7b"]],
      fonts:[["Nadpisy","Fraunces"],["Text","Inter"]],
      steps:["Tokeny: aspoň 4 barvy jako custom properties na .page","Navigace se při rolování přilepí nahoru","Hero: min. 320px, nadpis přes clamp(), štítek „Pražíme sami“ absolutně v hero","Menu: responzivní grid (auto-fit), na úzko 1 sloupec, ceny čitelně","Tlačítka jako pilulky s viditelným :focus-visible","Aspoň jedna @media nebo @container úprava pro mobil"] },
    html:`<div class="page">
<nav class="nav"><b class="logo">Zrnko</b><div class="links"><a>Menu</a><a>Pražírna</a><a>Kde jsme</a></div><a class="btn order">Objednat zrnka</a></nav>
<section class="hero"><span class="badge">Pražíme sami</span><h1>Káva, která voní celou ulicí.</h1><p>Výběrová zrnka z malých farem, pražená každý čtvrtek o dva domy vedle.</p><a class="btn">Prohlédnout menu</a></section>
<section class="menu"><h2>Menu</h2><div class="items">${[["Espresso","Etiopie, Yirgacheffe","55 Kč"],["Flat white","dvojité espresso, mléko","85 Kč"],["Filtr V60","denní nabídka","75 Kč"],["Cold brew","16 hodin louhování","90 Kč"],["Chai latte","domácí směs koření","89 Kč"],["Skořicový šnek","z vedlejší pekárny","65 Kč"]].map(([n,d,p])=>`<article class="item"><h3>${n}</h3><p>${d}</p><span class="price">${p}</span></article>`).join("")}</div></section>
<section class="visit"><h2>Kde nás najdete</h2><p>Veveří 42, Brno · Po–Pá 7:30–18:00 · So 9:00–16:00</p></section>
</div>`,
    fixed:`a{text-decoration:none;color:inherit;cursor:pointer}h1,h2,h3,p{margin:0}.visit,.menu{padding:32px 24px}`,
    starter:`/* Kavárna Zrnko\n   Krém #f6efe6 · Espresso #3b2a20 · Karamel #c8814a · Šalvěj #8a9a7b\n   Nadpisy Fraunces, text Inter */\n\n.page {\n  \n}\n`,
    solution:`.page {
  --cream: #f6efe6;
  --espresso: #3b2a20;
  --caramel: #c8814a;
  --sage: #8a9a7b;
  --radius: 20px;
  background: var(--cream);
  color: var(--espresso);
  font-family: "Inter", system-ui, sans-serif;
  height: 520px;
  overflow: auto;
}
h1, h2, h3 { font-family: "Fraunces", Georgia, serif; }

.nav {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 24px;
  background: var(--cream);
  border-bottom: 1px solid color-mix(in srgb, var(--espresso) 15%, transparent);
}
.logo { font-family: "Fraunces", serif; font-size: 22px; }
.links { display: flex; gap: 16px; margin-right: auto; }

.btn {
  display: inline-block;
  background: var(--espresso);
  color: var(--cream);
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
}
.btn:focus-visible { outline: 3px solid var(--caramel); outline-offset: 3px; }

.hero {
  position: relative;
  min-height: 340px;
  padding: 56px 24px;
  display: grid;
  align-content: center;
  gap: 16px;
  background: radial-gradient(circle at 85% 20%, color-mix(in srgb, var(--caramel) 35%, transparent), transparent 55%), var(--cream);
}
.hero h1 { font-size: clamp(2rem, 6vw, 3.5rem); line-height: 1.05; max-width: 14ch; }
.hero p { max-width: 42ch; }
.hero .btn { justify-self: start; }
.badge {
  position: absolute;
  top: 24px;
  right: 24px;
  background: var(--sage);
  color: #1d2419;
  padding: 8px 14px;
  border-radius: 999px;
  transform: rotate(6deg);
  font-weight: 600;
}

.menu h2, .visit h2 { font-size: 32px; margin-bottom: 16px; }
.items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}
.item {
  background: #fff;
  border-radius: var(--radius);
  padding: 18px;
  display: grid;
  gap: 4px;
}
.item p { font-size: 14px; opacity: .8; }
.price { font-weight: 700; font-variant-numeric: tabular-nums; }

@media (max-width: 600px) {
  .links { display: none; }
}`,
    hints:["Proměnné na <code>.page</code> (<code>--espresso: #3b2a20;</code> …) a pak všude <code>var(--espresso)</code>. Navigace: <code>position: sticky; top: 0;</code>.","Menu: <code>grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))</code>. Štítek: hero <code>position: relative</code>, štítek <code>absolute</code>."],
    checks:[
      {group:"Tokeny", label:"Aspoň 4 custom properties na .page", test:c=>c.vars(".page").length>=4},
      {group:"Tokeny", label:"Nadpisy ve Fraunces, text v Inter", test:c=>c.font(".hero h1","fraunces")&&c.font(".menu h2","fraunces")&&c.font(".hero p","inter")},
      {group:"Tokeny", label:"Pozadí krém #f6efe6", test:c=>c.cs(".page").backgroundColor==="rgb(246, 239, 230)"},
      {group:"Navigace", label:"Navigace je sticky nahoře a má pozadí", test:c=>{const s=c.cs(".nav");return s.position==="sticky"&&s.top==="0px"&&c.rgba(s.backgroundColor)[3]>0.9}},
      {group:"Hero", label:"Hero aspoň 320px vysoké", test:c=>c.rect(".hero").height>=320},
      {group:"Hero", label:"Nadpis přes clamp(), kontrast ≥ 4.5 : 1", test:c=>/clamp\(/.test(c.decl(".hero h1","font-size")||c.decl("h1","font-size"))&&c.contrast(".hero h1")>=4.5},
      {group:"Hero", label:"Štítek absolutně uvnitř hero", test:c=>{const h=c.rect(".hero"),b=c.rect(".badge");return c.cs(".badge").position==="absolute"&&c.cs(".hero").position!=="static"&&b.top>=h.top&&b.right<=h.right+1}},
      {group:"Menu", label:"Responzivní mřížka: 900px ≥ 3 sloupce, 360px = 1 sloupec", test:c=>c.width(900,()=>c.cols(".item")>=3)&&c.width(360,()=>c.cols(".item")===1)},
      {group:"Menu", label:"Ceny: kontrast ≥ 4.5 : 1", test:c=>c.contrast(".price")>=4.5},
      {group:"Tlačítka", label:"Tlačítka jako pilulky s paddingem aspoň 10px", test:c=>{const s=c.cs(".hero .btn");return parseFloat(s.borderTopLeftRadius)>=18&&parseFloat(s.paddingTop)>=10}},
      {group:"Tlačítka", label:"Tlačítka mají :focus-visible s obrysem", test:c=>c.rules().some(r=>r.kind==="style"&&/\.btn:focus-visible/.test(r.sel)&&(r.style.getPropertyValue("outline-style")||r.style.getPropertyValue("outline")||r.style.getPropertyValue("box-shadow")))},
      {group:"Mobil", label:"Aspoň jedna @media nebo @container úprava", test:c=>c.rules().some(r=>r.kind==="style"&&(r.media||r.container))} ] },

  { id:"z-3", canvas:1000, module:"zak-md", project:true, xp:1400, requires:["vars","typo"], title:"Fintech dashboard Mince",
    brief:{ client:"Mince, startup pro správu osobních financí",
      story:"Mince spouští webovou verzi aplikace. Uživatelé se na přehled dívají večer, proto tmavý motiv. Čísla musí být okamžitě čitelná a zarovnaná — jde o peníze.",
      style:"Tmavé sklo (glassmorphism)", keywords:["tmavé pozadí","průsvitné karty","rozmazání pozadí","neonový akcent","tabulková čísla"],
      palette:[["Noc","#0b1020"],["Text","#e6ebff"],["Mint","#3ee6a8"],["Korál","#ff6b6b"],["Sklo","rgba(255,255,255,0.06)"]],
      fonts:[["Vše","Manrope"]],
      steps:["Layout: menu vlevo (200–260px) přes celou výšku, lišta nahoře, obsah pod ní","Tmavý motiv a čitelný text","Karty jako sklo: průsvitné pozadí, backdrop-filter blur, jemný rámeček","KPI: 3 karty v řadě, velká čísla s tabular-nums, růst mint, pokles korál","Graf: výška sloupců z proměnné --h","Tabulka: čísla zarovnaná doprava"] },
    html:`<div class="dash">
<aside class="side"><b class="logo">mince</b><nav><a class="on">Přehled</a><a>Účty</a><a>Rozpočty</a><a>Cíle</a><a>Nastavení</a></nav></aside>
<header class="bar"><h1>Přehled</h1><input class="search" placeholder="Hledat transakci"><span class="avatar">PB</span></header>
<main class="content">
<div class="kpis"><div class="kpi card"><span class="label">Zůstatek</span><b class="value">184 250 Kč</b><span class="delta up">+4,2 %</span></div><div class="kpi card"><span class="label">Výdaje v září</span><b class="value">23 480 Kč</b><span class="delta down">+12,8 %</span></div><div class="kpi card"><span class="label">Spořeno</span><b class="value">9 100 Kč</b><span class="delta up">+2,1 %</span></div></div>
<section class="chart card"><span class="label">Výdaje po dnech</span><div class="bars">${[40,65,30,85,55,70,45].map(h=>`<div class="b" style="--h:${h}%"></div>`).join("")}</div></section>
<section class="tx card"><table><thead><tr><th>Obchodník</th><th>Kategorie</th><th class="num">Částka</th></tr></thead><tbody><tr><td>Rohlík.cz</td><td>Potraviny</td><td class="num">−1 284 Kč</td></tr><tr><td>Výplata</td><td>Příjem</td><td class="num">+48 000 Kč</td></tr><tr><td>Spotify</td><td>Předplatné</td><td class="num">−199 Kč</td></tr></tbody></table></section>
</main></div>`,
    fixed:`a{color:inherit;text-decoration:none;cursor:pointer}h1{margin:0}table{border-collapse:collapse;width:100%}th{text-align:left;font-weight:600}.dash{background-image:radial-gradient(circle at 70% 10%,rgba(62,230,168,.25),transparent 40%),radial-gradient(circle at 20% 90%,rgba(120,90,255,.3),transparent 45%)}`,
    starter:`/* Mince — dashboard\n   Noc #0b1020 · Text #e6ebff · Mint #3ee6a8 · Korál #ff6b6b · Sklo rgba(255,255,255,0.06) */\n\n.dash {\n  \n}\n`,
    solution:`.dash {
  --bg: #0b1020;
  --text: #e6ebff;
  --muted: #9aa6c7;
  --mint: #3ee6a8;
  --coral: #ff6b6b;
  --glass: rgba(255, 255, 255, 0.06);
  --line: rgba(255, 255, 255, 0.12);
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-areas: "side bar" "side content";
  grid-template-rows: auto 1fr;
  gap: 16px;
  padding: 16px;
  background-color: var(--bg);
  color: var(--text);
  font-family: "Manrope", system-ui, sans-serif;
  min-height: 560px;
}
.side { grid-area: side; display: grid; align-content: start; gap: 24px; padding: 20px; }
.side nav { display: grid; gap: 4px; }
.side a { padding: 8px 12px; border-radius: 10px; color: var(--muted); }
.side a.on { background: var(--glass); color: var(--text); }
.logo { font-size: 22px; font-weight: 800; color: var(--mint); }

.bar { grid-area: bar; display: flex; align-items: center; gap: 12px; }
.bar h1 { font-size: 26px; margin-right: auto; }
.search { background: var(--glass); border: 1px solid var(--line); color: var(--text); border-radius: 10px; padding: 8px 12px; font: inherit; }
.avatar { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--mint); color: var(--bg); font-weight: 800; }

.content { grid-area: content; display: grid; gap: 16px; }
.card {
  background: var(--glass);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
  backdrop-filter: blur(14px);
}
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.kpi { display: grid; gap: 6px; }
.label { color: var(--muted); font-size: 13px; }
.value { font-size: 30px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.delta.up { color: var(--mint); }
.delta.down { color: var(--coral); }

.bars { display: flex; align-items: flex-end; gap: 10px; height: 120px; margin-top: 12px; }
.b { flex: 1; height: var(--h); border-radius: 8px 8px 2px 2px; background: linear-gradient(var(--mint), rgba(62, 230, 168, 0.25)); }

.tx td, .tx th { padding: 10px 8px; border-bottom: 1px solid var(--line); }
.num { text-align: right; font-variant-numeric: tabular-nums; }`,
    hints:["Layout: <code>grid-template-columns: 220px 1fr</code> a <code>grid-template-areas: \"side bar\" \"side content\"</code>. Sklo: <code>background: rgba(255,255,255,.06); backdrop-filter: blur(14px);</code>","Graf: sloupce <code>.bars</code> jako flex s pevnou výškou a <code>.b { height: var(--h); }</code>. Čísla: <code>font-variant-numeric: tabular-nums</code>."],
    checks:[
      {group:"Layout", label:"Menu vlevo, 200–260px široké, přes celou výšku", test:c=>c.width(1000,()=>{const s=c.rect(".side"),b=c.rect(".bar"),m=c.rect(".content");return s.width>=200&&s.width<=260&&s.right<=b.left&&c.near(s.top,b.top,2)&&s.bottom>=m.bottom-2})},
      {group:"Layout", label:"Lišta nahoře, obsah pod ní", test:c=>c.width(1000,()=>c.rect(".content").top>=c.rect(".bar").bottom-1&&c.near(c.rect(".content").left,c.rect(".bar").left,2))},
      {group:"Tmavý motiv", label:"Tmavé pozadí #0b1020", test:c=>c.cs(".dash").backgroundColor==="rgb(11, 16, 32)"},
      {group:"Tmavý motiv", label:"Písmo Manrope, čísla s kontrastem ≥ 7 : 1", test:c=>c.font(".value","manrope")&&c.contrast(".value")>=7},
      {group:"Sklo", label:"Karty mají průsvitné pozadí", test:c=>{const a=c.rgba(c.cs(".kpi").backgroundColor)[3];return a>0&&a<0.5}},
      {group:"Sklo", label:"backdrop-filter: blur()", test:c=>/blur\(/.test(c.cs(".kpi").backdropFilter)},
      {group:"Sklo", label:"Jemný rámeček 1px a zaoblení aspoň 12px", test:c=>{const s=c.cs(".kpi");return s.borderTopWidth==="1px"&&parseFloat(s.borderTopLeftRadius)>=12}},
      {group:"KPI", label:"3 karty v řadě (při šířce 1000px)", test:c=>c.width(1000,()=>c.cols(".kpi")===3)},
      {group:"KPI", label:"Velká čísla (28px+) s tabular-nums", test:c=>parseFloat(c.cs(".value").fontSize)>=28&&/tabular-nums/.test(c.cs(".value").fontVariantNumeric)},
      {group:"KPI", label:"Růst mint #3ee6a8, pokles korál #ff6b6b", test:c=>c.cs(".delta.up").color==="rgb(62, 230, 168)"&&c.cs(".delta.down").color==="rgb(255, 107, 107)"},
      {group:"Graf", label:"Výška sloupců odpovídá --h", test:c=>{const b=c.qa(".b"),box=c.q(".bars").getBoundingClientRect().height;return box>40&&b.every(e=>c.near(e.getBoundingClientRect().height/box,parseFloat(e.style.getPropertyValue("--h"))/100,.03))}},
      {group:"Tabulka", label:"Částky zarovnané doprava s tabular-nums", test:c=>c.cs("td.num").textAlign==="right"&&/tabular-nums/.test(c.cs("td.num").fontVariantNumeric)} ] }
]);
