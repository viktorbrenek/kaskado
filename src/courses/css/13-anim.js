/* Modul „anim“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"anim-1", module:"anim", xp:340, title:"Plynulý přechod",
    theory:`<p><code>transition</code> animuje změnu hodnoty mezi stavy: <code>transition: background-color 200ms ease;</code>. Animuj jen konkrétní vlastnosti, <code>all</code> je pohodlné, ale může animovat i to, co nechceš.</p><p>Pro UI se hodí 150–250 ms.</p>`,
    task:`Tlačítko <code>.btn</code> ať mění <code>background-color</code> plynule za <code>200ms</code> s křivkou <code>ease</code>.`,
    html:`<button class="btn">Najeď na mě</button>`,
    fixed:`.btn{background:#2f5bd3;color:#fff;border:0;padding:10px 16px;border-radius:8px;font:inherit;font-weight:700}.btn:hover{background:#1e40af}`,
    starter:`.btn {\n  \n}`, solution:`.btn {\n  transition: background-color 200ms ease;\n}`,
    hints:["Pořadí ve zkratce: vlastnost, délka, křivka.","<code>transition: background-color 200ms ease;</code>"],
    checks:[
      {label:"Animuje background-color", test:c=>/background-color|^all$/.test(c.cs(".btn").transitionProperty)&&c.cs(".btn").transitionProperty!=="all"},
      {label:"Délka 200ms", test:c=>c.cs(".btn").transitionDuration==="0.2s"},
      {label:"Křivka ease", test:c=>c.cs(".btn").transitionTimingFunction==="ease"} ] },

  { id:"anim-2", module:"anim", xp:340, title:"Transformace",
    theory:`<p><code>transform</code> posouvá, otáčí a zvětšuje prvek <b>bez vlivu na okolní layout</b> a je výkonný (běží na GPU). Funkce se řetězí: <code>transform: rotate(-3deg) scale(1.05);</code></p>`,
    task:`Nálepku <code>.sticker</code> otoč o <code>-6deg</code> a zvětši na <code>1.1</code>.`,
    html:`<div class="sticker">SALE −30 %</div>`,
    fixed:`.sticker{display:inline-block;background:#e11d48;color:#fff;font-weight:800;padding:12px 18px;border-radius:10px;margin:20px}`,
    starter:`.sticker {\n  \n}`, solution:`.sticker {\n  transform: rotate(-6deg) scale(1.1);\n}`,
    hints:["Obě funkce do jedné vlastnosti <code>transform</code>, oddělené mezerou.","<code>transform: rotate(-6deg) scale(1.1);</code>"],
    checks:[
      {label:"Otočení −6°", test:c=>{const m=new DOMMatrix(c.cs(".sticker").transform);return c.near(Math.atan2(m.b,m.a)*180/Math.PI,-6,.2)}},
      {label:"Zvětšení 1.1", test:c=>{const m=new DOMMatrix(c.cs(".sticker").transform);return c.near(Math.hypot(m.a,m.b),1.1,.01)}} ] },

  { id:"anim-3", module:"anim", xp:360, title:"Keyframes",
    theory:`<p>Vlastní animaci popíšeš přes <code>@keyframes název { from {…} to {…} }</code> (nebo procenta) a spustíš vlastností <code>animation: název 1.5s ease-in-out infinite;</code></p>`,
    task:`Vytvoř animaci <code>pulse</code>, která mění <code>opacity</code> z 1 na 0.4, a spusť ji na <code>.dot</code> s délkou <code>1.5s</code>, nekonečně.`,
    html:`<p><span class="dot"></span> Nahrávání probíhá…</p>`,
    fixed:`.dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:#e11d48;vertical-align:middle}`,
    starter:`@keyframes pulse {\n  \n}\n\n.dot {\n  \n}`, solution:`@keyframes pulse {\n  from { opacity: 1; }\n  to { opacity: 0.4; }\n}\n\n.dot {\n  animation: pulse 1.5s ease-in-out infinite alternate;\n}`,
    hints:["V keyframes: <code>from { opacity: 1; } to { opacity: 0.4; }</code>","<code>animation: pulse 1.5s infinite;</code> (můžeš přidat <code>alternate</code>)"],
    checks:[
      {label:"Existuje @keyframes pulse s opacity", test:c=>{const k=c.rules().find(r=>r.kind==="keyframes"&&r.name==="pulse");return !!k&&[...k.rule.cssRules].some(f=>f.style.getPropertyValue("opacity"))}},
      {label:".dot používá animaci pulse", test:c=>c.cs(".dot").animationName==="pulse"},
      {label:"Délka 1.5s, nekonečně", test:c=>c.cs(".dot").animationDuration==="1.5s"&&c.cs(".dot").animationIterationCount==="infinite"} ] },

  { id:"anim-4", module:"anim", xp:360, title:"Ohleduplný pohyb",
    theory:`<p>Někomu pohyb na obrazovce způsobuje nevolnost. Systémové nastavení „omezit pohyb“ čte media query <code>prefers-reduced-motion: reduce</code>. Seniorní CSS s ní počítá vždy (WCAG 2.3.3).</p>`,
    task:`Spinner se točí. Pro uživatele s <code>prefers-reduced-motion: reduce</code> animaci <code>.spinner</code> vypni (<code>animation: none</code>).`,
    html:`<div class="spinner"></div>`,
    fixed:`@keyframes spin{to{transform:rotate(1turn)}}.spinner{width:36px;height:36px;border:4px solid #cbd5e1;border-top-color:#2f5bd3;border-radius:50%;animation:spin 1s linear infinite}`,
    starter:`@media () {\n  \n}`, solution:`@media (prefers-reduced-motion: reduce) {\n  .spinner {\n    animation: none;\n  }\n}`,
    hints:["Podmínka: <code>(prefers-reduced-motion: reduce)</code>.","Uvnitř: <code>.spinner { animation: none; }</code>"],
    checks:[
      {label:"@media (prefers-reduced-motion: reduce)", test:c=>c.rules().some(r=>r.media&&/prefers-reduced-motion:\s*reduce/.test(r.media))},
      {label:"Uvnitř vypíná animaci .spinner", test:c=>/^none/.test(c.decl(".spinner","animation-name",r=>r.media&&/reduce/.test(r.media))||c.decl(".spinner","animation",r=>r.media&&/reduce/.test(r.media)))} ] }
]);
