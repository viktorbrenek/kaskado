/* Automatický test všech úrovní: výchozí kód nesmí projít, vzorové řešení musí projít,
   Kontrola zápisu nesmí hlásit chyby ve vzorových řešeních. Spuštění: npm test */
import { chromium } from "playwright";
import path from "node:path";
const file="file://"+path.resolve("dist/index.html");
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
let failed=0;
for(const width of [1280,390]){
  const page=await (await browser.newContext({viewport:{width,height:900}})).newPage();
  const errors=[]; page.on("pageerror",e=>errors.push(e.message));
  await page.goto(file); await page.evaluate(()=>{localStorage.clear();localStorage.setItem("kaskada.ui",JSON.stringify({welcomed:1}))}); await page.reload();
  const res=await page.evaluate(async()=>{
    const out=[]; document.querySelector(".overlay")?.remove();
    for(const C of COURSES.filter(c=>c.status!=="soon")){ UI.course=C.id;
      for(const [i,L] of C.levels.entries()){
        if(!isUnlocked(C,i)){ out.push(`${C.id}/${L.id}: zamčeno v pořadí`); continue; }
        startLevel(L.id); await new Promise(r=>setTimeout(r,C.engine==="js"?700:30)); await evaluate();
        if(P.passed) out.push(`${C.id}/${L.id}: výchozí kód prošel`);
        P.css=L.solution; document.querySelector("#code").value=L.solution; await evaluate();
        if(!P.passed) out.push(`${C.id}/${L.id}: řešení neprošlo — `+[...document.querySelectorAll("#checks li:not(.ok):not(.grp)")].map(e=>e.textContent).join(" | "));
        if(C.engine==="css"){ const w=lintCss(L.solution,L); if(w.length) out.push(`${C.id}/${L.id}: kontrola zápisu hlásí ${JSON.stringify(w)}`); }
        if(P.passed){ submit(); document.querySelector(".overlay")?.remove(); }
      } }
    return {out,levels:COURSES.reduce((a,c)=>a+c.levels.length,0)};
  });
  console.log(`šířka ${width}px: ${res.levels} úrovní, ${res.out.length} problémů`);
  res.out.forEach(x=>console.log("  ✗ "+x)); errors.forEach(x=>console.log("  ✗ chyba stránky: "+x));
  failed+=res.out.length+errors.length;
}
await browser.close();
if(failed){ console.log(`\n${failed} problémů`); process.exit(1); } else console.log("\nVšechno prošlo ✓");
