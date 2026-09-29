/* ----------------------------- HTML ----------------------------- */
registerCourse({ id:"html", name:"HTML", tagline:"Struktura stránky, odkazy, seznamy", color:"var(--c-html)", engine:"html", status:"beta", code:"<h1>…</h1>",
  modules:[
    { id:"base", name:"Základy HTML", sub:"Prvky, atributy a struktura", color:"var(--c-html)", glyph:"<>" },
    { id:"form", name:"Formuláře", sub:"Připravujeme", color:"var(--c-html)", glyph:"[_]", soon:true },
  ],
  levels:[
  { id:"h-1", module:"base", xp:100, title:"Nadpis a odstavec",
    theory:`<p>HTML popisuje, <b>co</b> je na stránce. Prvek má otevírací a zavírací značku: <code>&lt;p&gt;Text&lt;/p&gt;</code>.</p><p><code>&lt;h1&gt;</code> je hlavní nadpis stránky, <code>&lt;p&gt;</code> odstavec.</p>`,
    task:`Vytvoř nadpis <code>h1</code> s textem <b>Vítej v Kaskádě</b> a pod ním libovolný odstavec.`,
    fixed:`h1{color:#14203a}`, starter:`<!-- napiš sem svůj HTML -->\n`,
    solution:`<h1>Vítej v Kaskádě</h1>\n<p>Tady se učím psát HTML.</p>`,
    hints:["Nadpis: <code>&lt;h1&gt;…&lt;/h1&gt;</code>.","Odstavec: <code>&lt;p&gt;…&lt;/p&gt;</code> hned pod nadpisem."],
    checks:[
      {label:"Na stránce je h1 s textem Vítej v Kaskádě", test:c=>c.text("h1")==="Vítej v Kaskádě"},
      {label:"Pod nadpisem je neprázdný odstavec", test:c=>{const p=c.q("h1 ~ p");return !!p&&p.textContent.trim().length>0}} ] },
  { id:"h-2", module:"base", xp:120, title:"Odkaz ven",
    theory:`<p>Atributy doplňují prvkům informace. Odkaz potřebuje atribut <code>href</code> s adresou: <code>&lt;a href="https://…"&gt;text&lt;/a&gt;</code>.</p><p><code>target="_blank"</code> otevře odkaz v novém panelu.</p>`,
    task:`Vytvoř odkaz s textem <b>Dokumentace</b> na <code>https://developer.mozilla.org</code>, který se otevře v novém panelu.`,
    starter:`<p>Víc informací najdeš v </p>`,
    solution:`<p>Víc informací najdeš v <a href="https://developer.mozilla.org" target="_blank">Dokumentace</a></p>`,
    hints:["Odkaz je prvek <code>&lt;a&gt;</code> s atributem <code>href</code>.","Nový panel: přidej <code>target=\"_blank\"</code>."],
    checks:[
      {label:"Odkaz vede na https://developer.mozilla.org", test:c=>/^https:\/\/developer\.mozilla\.org\/?$/.test(c.q("a")?.getAttribute("href")||"")},
      {label:"Text odkazu je Dokumentace", test:c=>c.text("a")==="Dokumentace"},
      {label:"Otevře se v novém panelu", test:c=>c.q("a")?.getAttribute("target")==="_blank"} ] },
  { id:"h-3", module:"base", xp:140, title:"Nákupní seznam",
    theory:`<p>Odrážkový seznam je <code>&lt;ul&gt;</code>, každá položka <code>&lt;li&gt;</code>. Číslovaný seznam je <code>&lt;ol&gt;</code>.</p><p>Prvky se do sebe vnořují — <code>li</code> patří dovnitř <code>ul</code>.</p>`,
    task:`Vytvoř odrážkový seznam se třemi položkami: <b>mléko</b>, <b>chléb</b>, <b>káva</b>.`,
    starter:`<h2>Nakoupit</h2>\n`, solution:`<h2>Nakoupit</h2>\n<ul>\n  <li>mléko</li>\n  <li>chléb</li>\n  <li>káva</li>\n</ul>`,
    hints:["Obal položky do <code>&lt;ul&gt;…&lt;/ul&gt;</code>.","Každá položka je <code>&lt;li&gt;mléko&lt;/li&gt;</code>."],
    checks:[
      {label:"Je tu odrážkový seznam ul", test:c=>!!c.q("ul")},
      {label:"Má přesně 3 položky", test:c=>c.qa("ul > li").length===3},
      {label:"Položky: mléko, chléb, káva", test:c=>c.qa("ul > li").map(e=>e.textContent.trim().toLowerCase()).join(",")==="mléko,chléb,káva"} ] },
  ],
  achievements:[
    {id:"html-base", name:"Stavitel stránek", desc:"Dokonči modul Základy HTML.", glyph:"<>", color:"var(--c-html)", test:(s,cs)=>moduleDone(cs,"html","base")},
  ]
});

