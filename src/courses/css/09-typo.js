/* Modul „typo“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"typo-1", module:"typo", xp:280, title:"rem místo px",
    theory:`<p><code>rem</code> je násobek velikosti písma kořene stránky (výchozí 16px). Když si uživatel v prohlížeči zvětší písmo, <code>rem</code> se přizpůsobí — <code>px</code> ne. <code>em</code> je násobek písma <i>rodiče</i>, takže se při vnoření sčítá.</p>`,
    task:`Nastav <code>.title</code> velikost <code>2rem</code> a <code>.box</code> padding <code>1.5rem</code>. Použij opravdu jednotku <code>rem</code>.`,
    html:`<div class="box"><h2 class="title">Přístupné písmo</h2><p>Velikosti v rem respektují nastavení uživatele.</p></div>`,
    fixed:`.box{background:#eef2f7;border-radius:10px}.title{margin:0 0 6px}`,
    starter:`.title {\n  \n}\n\n.box {\n  \n}`, solution:`.title {\n  font-size: 2rem;\n}\n\n.box {\n  padding: 1.5rem;\n}`,
    hints:["2rem = 32px, 1.5rem = 24px při výchozím nastavení.","<code>font-size: 2rem;</code> a <code>padding: 1.5rem;</code>"],
    checks:[
      {label:".title má 2rem (32px)", test:c=>c.cs(".title").fontSize==="32px"&&/rem/.test(c.decl(".title","font-size"))},
      {label:".box má padding 1.5rem (24px)", test:c=>c.cs(".box").paddingTop==="24px"&&/rem/.test(c.decl(".box","padding")||c.decl(".box","padding-top"))} ] },

  { id:"typo-2", module:"typo", xp:280, title:"Čitelný řádek",
    theory:`<p>Pro pohodlné čtení má řádek 45–75 znaků. Jednotka <code>ch</code> = šířka znaku „0“, takže <code>max-width: 65ch</code> hlídá délku řádku nezávisle na velikosti písma.</p><p><code>line-height</code> bez jednotky (např. <code>1.6</code>) je násobek velikosti písma a dědí se správně.</p>`,
    task:`Odstavec <code>.article p</code>: maximální šířka <code>60ch</code>, výška řádku <code>1.6</code> (bez jednotky).`,
    html:`<div class="article"><p>Typografie je rozhraní mezi textem a čtenářem. Příliš dlouhé řádky unavují oko, protože je těžké najít začátek dalšího řádku. Příliš krátké zase trhají rytmus čtení. Ideální délka se pohybuje kolem šedesáti znaků.</p></div>`,
    starter:`.article p {\n  \n}`, solution:`.article p {\n  max-width: 60ch;\n  line-height: 1.6;\n}`,
    hints:["<code>max-width: 60ch;</code>","<code>line-height: 1.6;</code> — bez px."],
    checks:[
      {label:"max-width: 60ch", test:c=>c.decl(".article p","max-width")==="60ch"},
      {label:"line-height 1.6 bez jednotky", test:c=>c.decl(".article p","line-height")==="1.6"} ] },

  { id:"typo-3", module:"typo", xp:300, title:"Plynulá velikost clamp()",
    theory:`<p><code>clamp(min, ideál, max)</code> vrátí ideální hodnotu, ale nikdy menší než min a větší než max. <code>font-size: clamp(1.5rem, 4vw, 3rem)</code> dá nadpis, který roste s oknem, bez jediné media query.</p>`,
    task:`Nadpis <code>.hero</code> nastav přes <code>clamp()</code> tak, aby byl nejméně <code>1.5rem</code> a nejvýše <code>3rem</code>.`,
    html:`<h1 class="hero">Responzivní nadpis</h1>`,
    starter:`.hero {\n  font-size: ;\n}`, solution:`.hero {\n  font-size: clamp(1.5rem, 4vw, 3rem);\n}`,
    hints:["Tvar: <code>clamp(MIN, PREFEROVANÁ, MAX)</code>.","<code>font-size: clamp(1.5rem, 4vw, 3rem);</code>"],
    checks:[
      {label:"Používá clamp()", test:c=>/^clamp\(/.test(c.decl(".hero","font-size"))},
      {label:"Minimum 1.5rem, maximum 3rem", test:c=>{const v=c.decl(".hero","font-size").replace(/\s/g,"");return /^clamp\(1\.5rem,.+,3rem\)$/.test(v)}},
      {label:"Výsledná velikost 24–48px", test:c=>{const f=parseFloat(c.cs(".hero").fontSize);return f>=24&&f<=48}} ] }
]);
