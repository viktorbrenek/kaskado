/* =====================================================================
   KOMUNITNÍ VERZE (GitHub Pages): galerie přes giscus, AI posudek přes schránku,
   záloha postupu do souboru. Nic se neposílá na žádný server.
   ===================================================================== */
function reviewPrompt(L,css){ const b=L.brief; return `Jsi zkušený art director a senior frontend vývojář. Posuzuješ CSS návrh junior kolegy pro zakázku.
KLIENT: ${b.client}
PŘÍBĚH: ${b.story.replace(/<[^>]+>/g,"")}
STYL: ${b.style} (${b.keywords.join(", ")})
PALETA: ${b.palette.map(p=>p.join(" ")).join(", ")}
PÍSMO: ${b.fonts.map(f=>f.join(": ")).join(", ")}
HTML (pevné):
${L.html.slice(0,6000)}
CSS KOLEGY:
${css.slice(0,12000)}
Zhodnoť česky, věcně a konkrétně (odkazuj na selektory). Odpověz POUZE JSONem:
{"score": 1-10, "verdict": "jedna věta", "strengths": ["...","..."], "improvements": ["konkrétní rada se selektorem", "..."], "styleFit": "jak dobře sedí stylu, jedna věta"}`; }

async function copyText(t){ try{ await navigator.clipboard.writeText(t); return true; }catch(e){ return false; } }
function copyFallback(t,title){ const ov=document.createElement("div"); ov.className="overlay";
  ov.innerHTML=`<div class="cheat"><div class="cheat-head"><b>${title}</b><button class="btn ghost" data-close>Zavřít</button></div><div class="cheat-body"><p>Schránka není dostupná. Označ text (Ctrl/⌘ + A) a zkopíruj ho ručně.</p><textarea class="copybox" readonly></textarea></div></div>`;
  document.body.append(ov); const ta=ov.querySelector("textarea"); ta.value=t; ta.focus(); ta.select();
  ov.addEventListener("click",e=>{if(e.target===ov||e.target.closest("[data-close]"))ov.remove()}); }

function setupReviewStatic(){
  const box=$("#review"); if(!box) return; box.hidden=false;
  box.querySelector(".review-head small").textContent="Zkopíruje zadání klienta i tvůj kód jako prompt. Vlož ho do svého AI asistenta (Claude, ChatGPT…) a dostaneš posudek. Nic neplatíš a nic se nikam neposílá.";
  const btn=$("#reviewBtn"); btn.textContent="Zkopírovat zadání pro AI";
  btn.onclick=async()=>{ const t=reviewPrompt(P.L,P.css).replace(/Zhodnoť česky[\s\S]*$/,"Zhodnoť česky, věcně a konkrétně. Struktura odpovědi: 1) Známka 1–10 a verdikt v jedné větě. 2) Co funguje. 3) Co zlepšit — ke každému bodu konkrétní selektor a upravený kód. 4) Jak návrh sedí zadanému stylu."); if(await copyText(t)){ toast(`<div><b>Zkopírováno</b><br>Vlož do svého AI asistenta.</div>`); if(!S.ach.reviewed){S.ach.reviewed=Date.now();save();} } else copyFallback(t,"Zadání pro AI"); };
}

function shareMarkdown(L,css){ return `**${L.title}** · styl ${L.brief?.style||""}\n\n\`\`\`css\n${css.trim()}\n\`\`\`\n`; }
async function shareStatic(L,css,btn){
  const t=shareMarkdown(L,css); const ok=await copyText(t);
  GAL_F=L.id; document.querySelector(".overlay")?.remove(); show("gallery");
  if(ok) toast(`<div><b>Kód zkopírován</b><br>Přihlas se GitHubem dole v diskusi a vlož ho jako komentář.</div>`); else copyFallback(t,"Tvůj návrh pro galerii");
  if(!S.ach.exhibit){ S.ach.exhibit=Date.now(); save(); }
}

function renderGalleryStatic(){
  const el=$("#v-gallery"); const projs=COURSES.flatMap(c=>c.levels.filter(l=>l.project).map(l=>({c,l})));
  if(!GAL_F||!projs.some(p=>p.l.id===GAL_F)) GAL_F=projs[0]?.l.id; const cur=projs.find(p=>p.l.id===GAL_F); const g=CFG.giscus||{};
  const ready=g.repo&&g.repoId&&g.categoryId;
  el.innerHTML=`<div class="view-head"><div><h2>Galerie zakázek</h2><p>Stejné HTML, stejné zadání — a pokaždé jiný design. Svůj návrh sdílíš po dokončení zakázky tlačítkem „Vystavit v galerii“. Komentáře běží přes GitHub Discussions, přihlásíš se svým GitHub účtem.</p></div></div>
  <div class="filters">${projs.map(p=>`<button data-gf="${p.l.id}" aria-pressed="${p.l.id===GAL_F}">${esc(p.l.title)}</button>`).join("")}</div>
  ${cur?`<p class="note" style="margin:-4px 0 14px">${cur.l.brief.client} · styl ${cur.l.brief.style}</p>`:""}
  <div class="try panel"><b>Vyzkoušej cizí návrh</b><p class="note">Zkopíruj CSS z komentáře a vlož ho sem — vykreslí se na HTML téhle zakázky.</p>
    <textarea id="tryCss" spellcheck="false" placeholder="/* sem vlož CSS z galerie */"></textarea><div class="stage"><div class="lab"><span>Náhled</span><span></span></div><div class="host" id="tryHost"></div></div></div>
  <div class="giscus-wrap">${ready?`<div class="giscus"></div>`:`<div class="soon">Diskuse ke galerii se připravuje. (Správce: doplň <code>repoId</code> a <code>categoryId</code> z giscus.app do <code>kaskada.config.json</code>.)</div>`}</div>`;
  const paintTry=()=>paintShadow($("#tryHost"),{fixed:cur.l.fixed,css:$("#tryCss").value,html:cur.l.html,w:cur.l.canvas});
  $("#tryCss").addEventListener("input",paintTry); paintTry();
  if(ready){ const sc=document.createElement("script"); sc.src="https://giscus.app/client.js"; sc.async=true; sc.crossOrigin="anonymous";
    const a={repo:g.repo,"repo-id":g.repoId,category:g.category||"Galerie","category-id":g.categoryId,mapping:"specific",term:"Zakázka: "+cur.l.title,strict:"1","reactions-enabled":"1","emit-metadata":"0","input-position":"top",theme:"preferred_color_scheme",lang:"cs",loading:"lazy"};
    for(const [k,v] of Object.entries(a)) sc.setAttribute("data-"+k,v); el.querySelector(".giscus-wrap").append(sc); }
}

function backupHtml(){ return `<h3 class="sec">Záloha postupu</h3><div class="panel backup"><p class="note">Postup se ukládá jen v tomhle prohlížeči. Na jiný počítač ho přeneseš souborem.</p>
  <div class="helpbar"><button class="btn" id="bkExport">Stáhnout zálohu</button><label class="btn" for="bkFile">Nahrát zálohu</label><input type="file" id="bkFile" accept="application/json,.json" hidden><button class="btn ghost" id="bkReset">Smazat postup</button></div><p class="note" id="bkMsg"></p></div>`; }
function setupBackup(){
  $("#bkExport").onclick=()=>{ const data=JSON.stringify({app:"kaskada",v:2,exportedAt:new Date().toISOString(),state:S,drafts:DRAFTS},null,1);
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([data],{type:"application/json"})); a.download=`kaskada-postup-${today()}.json`; document.body.append(a); a.click(); a.remove(); };
  $("#bkFile").onchange=async e=>{ const f=e.target.files[0]; if(!f) return; try{ const d=JSON.parse(await f.text()); if(d.app!=="kaskada"||!d.state) throw 0;
      S=migrate(d.state); DRAFTS=d.drafts||{}; save(); try{localStorage.setItem("kaskada.drafts",JSON.stringify(DRAFTS))}catch(x){} retroAch(); show("profile"); toast(`<div><b>Záloha nahraná</b><br>${S.xp} XP, ${totalDone(S)} úrovní</div>`);
    }catch(x){ $("#bkMsg").textContent="Tenhle soubor nevypadá jako záloha Kaskády."; } };
  let armed=false; $("#bkReset").onclick=e=>{ if(!armed){ armed=true; e.target.textContent="Opravdu smazat? Klikni znovu"; setTimeout(()=>{armed=false; if(e.target.isConnected) e.target.textContent="Smazat postup"},4000); return; }
    S=blank(); DRAFTS={}; try{localStorage.removeItem("kaskada.drafts")}catch(x){} save(); show("profile"); };
}
if(MODE==="static"){ const b=document.querySelector('[data-view="board"]'); if(b) b.hidden=true;
  if("serviceWorker" in navigator&&location.protocol==="https:") window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{})); }
