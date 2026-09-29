/* Modul „nov-scroll“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"n-snap", module:"nov-scroll", xp:380, wide:true, support:{status:"baseline",test:"(scroll-snap-type: x mandatory)"}, title:"Karusel se scroll-snap",
    theory:`<p>Scroll snap zarovná posuvný obsah na „zarážky“. Kontejner: <code>scroll-snap-type: x mandatory</code>, položky: <code>scroll-snap-align: start</code>. Karusel bez knihovny, který na mobilu funguje přirozeně prstem. (Zlepšení kompatibility je v Interop 2026.)</p>`,
    task:`<code>.track</code> ať roluje vodorovně (<code>overflow-x: auto</code>) se zarážkami <code>x mandatory</code>, karty <code>.slide</code> se zarovnávají na <code>start</code>.`,
    html:`<div class="track">${["Den 1","Den 2","Den 3","Den 4","Den 5"].map(t=>`<div class="slide">${t}</div>`).join("")}</div>`,
    fixed:`.track{display:flex;gap:10px;width:300px;padding-bottom:6px}.slide{flex:0 0 220px;height:110px;border-radius:12px;background:#8cb6c0;display:grid;place-items:center;font-weight:800;font-size:20px}`,
    starter:`.track {\n  \n}\n\n.slide {\n  \n}`, solution:`.track {\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n}\n\n.slide {\n  scroll-snap-align: start;\n}`,
    hints:["Kontejner: <code>overflow-x: auto; scroll-snap-type: x mandatory;</code>","Položky: <code>scroll-snap-align: start;</code>"],
    checks:[
      {label:"Vodorovné rolování", test:c=>c.cs(".track").overflowX==="auto"||c.cs(".track").overflowX==="scroll"},
      {label:"scroll-snap-type: x mandatory", test:c=>c.cs(".track").scrollSnapType==="x mandatory"},
      {label:"Karty: scroll-snap-align start", test:c=>c.cs(".slide").scrollSnapAlign==="start"} ],
    fallback:[{label:"scroll-snap-type: x mandatory",re:/scroll-snap-type\s*:\s*x mandatory/},{label:"scroll-snap-align: start",re:/scroll-snap-align\s*:\s*start/}] },

  { id:"n-progress", module:"nov-scroll", xp:440, wide:true, support:{status:"interop",test:"(animation-timeline: scroll())"}, title:"Ukazatel čtení bez JS",
    theory:`<p>Scroll-driven animace nepoběží podle času, ale podle rolování. <code>animation-timeline: scroll()</code> napojí animaci na nejbližší posuvný kontejner.</p><p>Past: zkratka <code>animation</code> resetuje i <code>animation-timeline</code>, takže timeline piš <b>až za</b> ni.</p>`,
    task:`Pruh <code>.bar</code> má animaci <code>grow</code> (je hotová) řízenou rolováním článku: <code>animation: grow linear both</code> a <code>animation-timeline: scroll()</code>. Zkus rolovat.`,
    html:`<div class="article"><div class="bar"></div>${Array.from({length:8},(_,i)=>`<p>Odstavec ${i+1}. CSS dnes zvládne věci, na které jsme dřív potřebovali JavaScript a posluchače událostí.</p>`).join("")}</div>`,
    fixed:`@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}.article{height:170px;overflow:auto;border:1px solid #cbd5e1;border-radius:10px;padding:0 12px}.bar{position:sticky;top:0;height:6px;margin:0 -12px;background:#e11d48;transform-origin:left;transform:scaleX(0)}`,
    starter:`.bar {\n  \n}`, solution:`.bar {\n  animation: grow linear both;\n  animation-timeline: scroll();\n}`,
    hints:["Nejdřív <code>animation: grow linear both;</code>","Pod to <code>animation-timeline: scroll();</code> — pořadí je důležité."],
    checks:[
      {label:"Animace grow", test:c=>c.cs(".bar").animationName==="grow"},
      {label:"Řízená rolováním: scroll()", test:c=>/scroll\(/.test(c.cs(".bar").animationTimeline)},
      {label:"fill-mode both", test:c=>c.cs(".bar").animationFillMode==="both"} ],
    fallback:[{label:"animation: grow …",re:/animation\s*:\s*grow/},{label:"animation-timeline: scroll()",re:/animation-timeline\s*:\s*scroll\(/}] },

  { id:"n-view", module:"nov-scroll", xp:440, wide:true, support:{status:"interop",test:"(animation-timeline: view())"}, title:"Odhalení při rolování",
    theory:`<p><code>animation-timeline: view()</code> sleduje, jak prvek vjíždí do viditelné oblasti. <code>animation-range: entry 0% cover 40%</code> omezí animaci na začátek vjezdu. Efekt „fade-in při scrollu“ bez IntersectionObserveru.</p>`,
    task:`Karty <code>.card</code> ať se odhalí animací <code>reveal</code> (hotová) řízenou <code>view()</code> v rozsahu <code>entry 0%</code> až <code>cover 40%</code>.`,
    html:`<div class="feed">${Array.from({length:6},(_,i)=>`<div class="card">Příspěvek ${i+1}</div>`).join("")}</div>`,
    fixed:`@keyframes reveal{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}.feed{height:190px;overflow:auto;border:1px solid #cbd5e1;border-radius:10px;padding:10px;display:grid;gap:10px}.card{height:70px;border-radius:10px;background:#f3b184;display:grid;place-items:center;font-weight:700}`,
    starter:`.card {\n  \n}`, solution:`.card {\n  animation: reveal linear both;\n  animation-timeline: view();\n  animation-range: entry 0% cover 40%;\n}`,
    hints:["Stejně jako u ukazatele čtení: nejdřív <code>animation</code>, pak <code>animation-timeline: view();</code>","<code>animation-range: entry 0% cover 40%;</code>"],
    checks:[
      {label:"Animace reveal", test:c=>c.cs(".card").animationName==="reveal"},
      {label:"Timeline view()", test:c=>/view\(/.test(c.cs(".card").animationTimeline)},
      {label:"Rozsah entry 0% – cover 40%", test:c=>/^entry( 0%)?$/.test(c.cs(".card").animationRangeStart)&&/cover 40%/.test(c.cs(".card").animationRangeEnd)} ],
    fallback:[{label:"animation-timeline: view()",re:/animation-timeline\s*:\s*view\(/},{label:"animation-range: entry 0% cover 40%",re:/animation-range\s*:\s*entry 0%\s+cover 40%/}] }
]);
