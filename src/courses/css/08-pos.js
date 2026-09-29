/* Modul „pos“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"pos-1", module:"pos", xp:280, title:"Štítek v rohu",
    theory:`<p><code>position: absolute</code> vytrhne prvek z toku a umístí ho vůči nejbližšímu <b>pozicovanému</b> předkovi (tomu, kdo má <code>position</code> jiné než <code>static</code>). Proto rodiči dáváme <code>position: relative</code>.</p><p>Umístění pak určí <code>top</code>, <code>right</code>, <code>bottom</code>, <code>left</code>.</p>`,
    task:`Umísti štítek <code>.badge</code> do pravého horního rohu karty <code>.card</code>, <code>8px</code> od horního i pravého okraje.`,
    html:`<div class="card"><span class="badge">Nové</span><b>Kurz CSS</b><br>Pozicování prvků.</div>`,
    fixed:`.card{background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:20px;width:260px}.badge{background:#e11d48;color:#fff;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px}`,
    starter:`.card {\n  \n}\n\n.badge {\n  \n}`, solution:`.card {\n  position: relative;\n}\n\n.badge {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}`,
    hints:["Rodič <code>.card</code> potřebuje <code>position: relative</code>, jinak se štítek chytí stránky.","<code>.badge { position: absolute; top: 8px; right: 8px; }</code>"],
    checks:[
      {label:"Štítek je absolutně pozicovaný", test:c=>c.cs(".badge").position==="absolute"},
      {label:"8px od horního okraje karty", test:c=>c.near(c.rect(".badge").top-c.rect(".card").top,9)},
      {label:"8px od pravého okraje karty", test:c=>c.near(c.rect(".card").right-c.rect(".badge").right,9)} ] },

  { id:"pos-2", module:"pos", xp:300, kind:"debug", title:"Kdo je nahoře?",
    theory:`<p><code>z-index</code> určuje pořadí vrstev, ale funguje jen u pozicovaných prvků (a u dětí flexu/gridu). Na <code>position: static</code> ho prohlížeč ignoruje — klasická past.</p>`,
    task:`Karta <code>.front</code> má překrývat <code>.back</code>. Kolega jí dal <code>z-index: 5</code> a nic se nestalo. Oprav to.`,
    html:`<div class="back">Pozadí (z-index 2)</div><div class="front">Popředí — mám být nahoře</div>`,
    fixed:`.back,.front{width:220px;padding:20px;border-radius:10px;font-weight:700}.back{background:#94a3b8;position:relative;z-index:2}.front{background:#fde68a;margin:-30px 0 0 40px}`,
    starter:`.front {\n  z-index: 5;\n}`, solution:`.front {\n  position: relative;\n  z-index: 5;\n}`,
    hints:["Podívej se, jakou má <code>.front</code> hodnotu <code>position</code>.","Přidej <code>position: relative;</code> — až pak začne <code>z-index</code> platit."],
    checks:[
      {label:".front je pozicovaná", test:c=>c.cs(".front").position!=="static"},
      {label:".front má vyšší z-index než .back", test:c=>(parseInt(c.cs(".front").zIndex)||0)>2} ] },

  { id:"pos-3", wide:true, module:"pos", xp:300, title:"Přilepená hlavička",
    theory:`<p><code>position: sticky</code> se chová jako normální prvek, dokud nedojede k okraji posuvné oblasti — pak se „přilepí“. Potřebuje hodnotu <code>top</code> (nebo jinou stranu).</p>`,
    task:`Hlavička seznamu <code>.head</code> se má při rolování přilepit k hornímu okraji boxu <code>.list</code>. Vyzkoušej rolovat.`,
    html:`<div class="list"><div class="head">Zprávy</div>${Array.from({length:10},(_,i)=>`<p>Zpráva č. ${i+1}</p>`).join("")}</div>`,
    fixed:`.list{height:150px;overflow:auto;border:1px solid #cbd5e1;border-radius:10px}.list p{padding:6px 12px;margin:0;border-bottom:1px solid #eef2f7}.head{background:#14203a;color:#fff;padding:8px 12px;font-weight:700}`,
    starter:`.head {\n  \n}`, solution:`.head {\n  position: sticky;\n  top: 0;\n}`,
    hints:["Hodnota pozice, která kombinuje relative a fixed: <code>sticky</code>.","Bez <code>top: 0;</code> se nic nepřilepí."],
    checks:[
      {label:"position: sticky", test:c=>c.cs(".head").position==="sticky"},
      {label:"top: 0", test:c=>c.cs(".head").top==="0px"},
      {label:"Při rolování zůstává nahoře", test:c=>{const l=c.q(".list"),o=l.scrollTop;l.scrollTop=120;const ok=c.near(c.rect(".head").top,l.getBoundingClientRect().top+1,2);l.scrollTop=o;return ok}} ] },

  { id:"pos-4", module:"pos", xp:320, title:"Překryv přes celou plochu",
    theory:`<p>Zkratka <code>inset: 0</code> = <code>top: 0; right: 0; bottom: 0; left: 0</code>. Absolutní prvek s ní vyplní celého pozicovaného rodiče — typicky ztmavení pod modálním oknem nebo popisek přes obrázek.</p>`,
    task:`Poloprůhledný <code>.shade</code> má pokrýt celý <code>.photo</code> (přesně jeho rozměry).`,
    html:`<div class="photo"><div class="shade">Náhled</div></div>`,
    fixed:`.photo{position:relative;height:160px;border-radius:12px;background:linear-gradient(135deg,#8cb6c0,#b9c77a);overflow:hidden}.shade{background:rgba(15,23,42,.55);color:#fff;display:grid;place-items:center;font-weight:700}`,
    starter:`.shade {\n  \n}`, solution:`.shade {\n  position: absolute;\n  inset: 0;\n}`,
    hints:["Potřebuješ <code>position: absolute</code> a roztáhnout na všechny strany.","<code>inset: 0;</code>"],
    checks:[
      {label:"Stejná šířka jako .photo", test:c=>c.near(c.rect(".shade").width,c.rect(".photo").width)},
      {label:"Stejná výška jako .photo", test:c=>c.near(c.rect(".shade").height,c.rect(".photo").height)},
      {label:"Levý horní roh sedí", test:c=>c.near(c.rect(".shade").top,c.rect(".photo").top)&&c.near(c.rect(".shade").left,c.rect(".photo").left)} ] }
]);
