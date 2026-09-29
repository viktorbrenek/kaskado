/* Modul „nov-ui“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"n-anchor", module:"nov-ui", xp:420, support:{status:"interop",test:"(anchor-name: --a)"}, title:"Tooltip přes anchor positioning",
    theory:`<p>Anchor positioning přiváže absolutně pozicovaný prvek k jinému prvku — bez JavaScriptu na počítání souřadnic.</p><p>1) kotva: <code>anchor-name: --tip;</code><br>2) prvek: <code>position: absolute; position-anchor: --tip; position-area: top;</code></p><p>Je to jedna z priorit Interop 2026 — prohlížeče ji letos dotahují společně.</p>`,
    task:`Bublina <code>.tip</code> se má zobrazit <b>nad</b> tlačítkem <code>.trigger</code> a být vodorovně vycentrovaná. Kotvu pojmenuj <code>--tip</code>.`,
    html:`<div class="stage"><p>Nevíš, co znamená Baseline?</p><button class="trigger">Nápověda</button><div class="tip">Funkce dostupná ve všech hlavních prohlížečích</div></div>`,
    fixed:`.stage{padding-top:70px}.trigger{border:1px solid #14203a;background:#fff;padding:6px 12px;border-radius:8px;font:inherit;margin-left:60px}.tip{background:#14203a;color:#fff;font-size:13px;padding:6px 10px;border-radius:8px;width:180px;margin:0 0 6px}`,
    starter:`.trigger {\n  \n}\n\n.tip {\n  \n}`, solution:`.trigger {\n  anchor-name: --tip;\n}\n\n.tip {\n  position: absolute;\n  position-anchor: --tip;\n  position-area: top;\n}`,
    hints:["Kotva dostane <code>anchor-name: --tip;</code>, bublina <code>position-anchor: --tip;</code>.","Bublina musí být <code>position: absolute</code> a mít <code>position-area: top;</code>"],
    checks:[
      {label:".trigger je kotva --tip", test:c=>c.cs(".trigger").anchorName==="--tip"},
      {label:"Bublina je nad tlačítkem", test:c=>c.rect(".tip").bottom<=c.rect(".trigger").top+1},
      {label:"Vodorovně vycentrovaná na tlačítko", test:c=>{const t=c.rect(".tip"),b=c.rect(".trigger");return c.near(t.left+t.width/2,b.left+b.width/2,2)}} ],
    fallback:[{label:"anchor-name: --tip",re:/anchor-name\s*:\s*--tip/},{label:"position-anchor: --tip",re:/position-anchor\s*:\s*--tip/},{label:"position-area: top",re:/position-area\s*:\s*top/}] },

  { id:"n-start", module:"nov-ui", xp:420, support:{status:"baseline",test:()=>"CSSStartingStyleRule" in window}, title:"Vstupní animace @starting-style",
    theory:`<p>Přechod (<code>transition</code>) potřebuje „odkud“. U prvku, který se právě objevil v DOM nebo přešel z <code>display: none</code>, žádné „odkud“ není. <code>@starting-style</code> ho doplní:</p><p><code>@starting-style { .toast { opacity: 0; } }</code></p><p>Ideální pro toasty, popovery a dialogy bez JS knihoven.</p>`,
    task:`Toast <code>.toast</code> má při zobrazení plynule vyjet: přechod <code>opacity</code> a <code>transform</code> za <code>300ms</code>, výchozí stav v <code>@starting-style</code>: <code>opacity: 0</code> a <code>translateY(12px)</code>.`,
    html:`<div class="toast">Uloženo ✓</div>`,
    fixed:`.toast{display:inline-block;background:#14203a;color:#fff;padding:10px 16px;border-radius:10px;font-weight:700}`,
    starter:`.toast {\n  \n}\n\n@starting-style {\n  \n}`, solution:`.toast {\n  transition: opacity 300ms, transform 300ms;\n}\n\n@starting-style {\n  .toast {\n    opacity: 0;\n    transform: translateY(12px);\n  }\n}`,
    hints:["Na <code>.toast</code>: <code>transition: opacity 300ms, transform 300ms;</code>","Uvnitř <code>@starting-style</code> je normální pravidlo <code>.toast { … }</code>."],
    checks:[
      {label:"Přechod opacity i transform 300ms", test:c=>{const s=c.cs(".toast");return /opacity/.test(s.transitionProperty)&&/transform/.test(s.transitionProperty)&&s.transitionDuration.split(",").every(d=>d.trim()==="0.3s")}},
      {label:"@starting-style s opacity: 0", test:c=>c.decl(".toast","opacity",r=>r.starting)==="0"},
      {label:"@starting-style s translateY(12px)", test:c=>/translateY\(12px\)/.test(c.decl(".toast","transform",r=>r.starting))} ],
    fallback:[{label:"@starting-style",re:/@starting-style/},{label:"opacity: 0",re:/opacity\s*:\s*0\b/}] },

  { id:"n-interp", module:"nov-ui", xp:420, support:{status:"chromium",test:"(interpolate-size: allow-keywords)"}, title:"Animace na height: auto",
    theory:`<p>Roky nešlo animovat <code>height: 0 → auto</code>. Teď stačí povolit interpolaci klíčových slov: <code>interpolate-size: allow-keywords;</code> (dědí se, dává se klidně na <code>:root</code>). Pak funguje <code>transition: height</code> i na <code>auto</code>.</p>`,
    task:`Na <code>.faq</code> povol <code>interpolate-size: allow-keywords</code> a panelům <code>.answer</code> dej přechod výšky <code>250ms</code>.`,
    html:`<div class="faq"><div class="q">Jak dlouho trvá doručení?</div><div class="answer">Obvykle 2–3 pracovní dny.</div></div>`,
    fixed:`.q{font-weight:700;padding:8px 0}.answer{overflow:hidden;background:#eef2f7;padding:0 10px;border-radius:8px}`,
    starter:`.faq {\n  \n}\n\n.answer {\n  \n}`, solution:`.faq {\n  interpolate-size: allow-keywords;\n}\n\n.answer {\n  transition: height 250ms ease;\n}`,
    hints:["<code>interpolate-size: allow-keywords;</code>","<code>.answer { transition: height 250ms ease; }</code>"],
    checks:[
      {label:"interpolate-size: allow-keywords (dědí se)", test:c=>c.cs(".answer").getPropertyValue("interpolate-size")==="allow-keywords"},
      {label:"Přechod height 250ms", test:c=>/height/.test(c.cs(".answer").transitionProperty)&&c.cs(".answer").transitionDuration==="0.25s"} ],
    fallback:[{label:"interpolate-size: allow-keywords",re:/interpolate-size\s*:\s*allow-keywords/},{label:"transition: height 250ms",re:/transition[^;]*height[^;]*250ms/}] },

  { id:"n-field", module:"nov-ui", xp:400, support:{status:"chromium",test:"(field-sizing: content)"}, title:"Pole, které roste s textem",
    theory:`<p><code>field-sizing: content</code> nechá <code>textarea</code> a <code>input</code> růst podle obsahu — bez JS, který měří <code>scrollHeight</code>. Jednotka <code>lh</code> (výška řádku) se hodí na minimum: <code>min-height: 3lh</code>.</p>`,
    task:`<code>textarea</code> ať roste s obsahem (<code>field-sizing: content</code>) a má minimální výšku <code>3lh</code>.`,
    html:`<label>Zpráva<textarea>Ahoj, rád bych se zeptal na termín.
Máte volno příští týden?
Díky!
Petr</textarea></label>`,
    fixed:`label{display:grid;gap:4px;font-weight:700;width:280px}textarea{font:inherit;font-weight:400;line-height:1.4;padding:8px;border:1px solid #94a3b8;border-radius:8px;resize:none}`,
    starter:`textarea {\n  \n}`, solution:`textarea {\n  field-sizing: content;\n  min-height: 3lh;\n}`,
    hints:["<code>field-sizing: content;</code>","<code>min-height: 3lh;</code>"],
    checks:[
      {label:"field-sizing: content", test:c=>c.cs("textarea").getPropertyValue("field-sizing")==="content"},
      {label:"min-height 3lh", test:c=>c.decl("textarea","min-height")==="3lh"},
      {label:"Všechny 4 řádky jsou vidět bez rolování", test:c=>{const t=c.q("textarea");return t.scrollHeight<=t.clientHeight+1}} ],
    fallback:[{label:"field-sizing: content",re:/field-sizing\s*:\s*content/},{label:"min-height: 3lh",re:/min-height\s*:\s*3lh/}] }
]);
