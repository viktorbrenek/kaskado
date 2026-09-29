/* ----------------------------- JavaScript ----------------------------- */
registerCourse({ id:"js", name:"JavaScript", tagline:"Proměnné, podmínky, funkce, pole", color:"var(--c-js)", engine:"js", status:"beta", code:"const x = 1;",
  modules:[
    { id:"fn", name:"Funkce a logika", sub:"První funkce, podmínky a pole", color:"var(--c-js)", glyph:"f()" },
    { id:"dom", name:"Práce s DOM", sub:"Připravujeme", color:"var(--c-js)", glyph:"$", soon:true },
  ],
  levels:[
  { id:"j-1", module:"fn", xp:120, title:"První funkce",
    theory:`<p>Funkce je pojmenovaný kus kódu, který bere vstupy a vrací výsledek:</p><p><code>function dvojnasobek(x) { return x * 2; }</code></p><p>Hodnoty si můžeš vypsat přes <code>console.log()</code> — uvidíš je v konzoli.</p>`,
    task:`Napiš funkci <code>soucet(a, b)</code>, která vrátí součet obou čísel.`,
    starter:`function soucet(a, b) {\n  \n}\n\nconsole.log(soucet(2, 3));`,
    solution:`function soucet(a, b) {\n  return a + b;\n}\n\nconsole.log(soucet(2, 3));`,
    hints:["Výsledek z funkce dostaneš přes <code>return</code>.","<code>return a + b;</code>"],
    tests:[{label:"soucet(2, 3) → 5",expr:"soucet(2, 3)",expect:5},{label:"soucet(-4, 10) → 6",expr:"soucet(-4, 10)",expect:6},{label:"soucet(0, 0) → 0",expr:"soucet(0, 0)",expect:0}] },
  { id:"j-2", module:"fn", xp:140, title:"Podmínka",
    theory:`<p><code>if</code> rozhoduje podle podmínky. Porovnání <code>&gt;=</code> vrací <code>true</code> nebo <code>false</code>.</p><p><code>if (teplota &gt; 25) { return "horko"; } else { return "ok"; }</code></p>`,
    task:`Napiš funkci <code>vstupne(vek)</code>: do 15 let (včetně) vrátí <code>"dětské"</code>, od 65 let <code>"senior"</code>, jinak <code>"plné"</code>.`,
    starter:`function vstupne(vek) {\n  \n}`,
    solution:`function vstupne(vek) {\n  if (vek <= 15) return "dětské";\n  if (vek >= 65) return "senior";\n  return "plné";\n}`,
    hints:["Dvě podmínky za sebou, na konci výchozí <code>return</code>.","<code>if (vek &lt;= 15) return \"dětské\";</code>"],
    tests:[{label:"vstupne(8) → \"dětské\"",expr:"vstupne(8)",expect:"dětské"},{label:"vstupne(15) → \"dětské\"",expr:"vstupne(15)",expect:"dětské"},{label:"vstupne(30) → \"plné\"",expr:"vstupne(30)",expect:"plné"},{label:"vstupne(65) → \"senior\"",expr:"vstupne(65)",expect:"senior"}] },
  { id:"j-3", module:"fn", xp:160, title:"Největší číslo",
    theory:`<p>Pole je seznam hodnot: <code>[3, 9, 1]</code>. Projdeš ho cyklem <code>for (const x of pole) { … }</code>.</p><p>Existuje i zkratka <code>Math.max(...pole)</code> — uznáme obojí.</p>`,
    task:`Napiš funkci <code>nejvetsi(pole)</code>, která vrátí největší číslo v poli.`,
    starter:`function nejvetsi(pole) {\n  \n}`,
    solution:`function nejvetsi(pole) {\n  let max = pole[0];\n  for (const x of pole) {\n    if (x > max) max = x;\n  }\n  return max;\n}`,
    hints:["Začni s <code>let max = pole[0];</code> a projdi pole cyklem.","Uvnitř cyklu: <code>if (x &gt; max) max = x;</code>"],
    tests:[{label:"nejvetsi([3, 9, 1]) → 9",expr:"nejvetsi([3, 9, 1])",expect:9},{label:"nejvetsi([-5, -2, -9]) → -2",expr:"nejvetsi([-5, -2, -9])",expect:-2},{label:"nejvetsi([7]) → 7",expr:"nejvetsi([7])",expect:7}] },
  ],
  achievements:[
    {id:"js-fn", name:"Funkcionář", desc:"Dokonči modul Funkce a logika.", glyph:"f()", color:"var(--c-js)", test:(s,cs)=>moduleDone(cs,"js","fn")},
  ]
});

