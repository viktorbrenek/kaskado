/* =====================================================================
   CORE
   ===================================================================== */
const GLOBAL_ACH = [
  {id:"first",   name:"První krok",     desc:"Dokonči svou první úroveň.",        glyph:"1st", color:"var(--m-content)", test:s=>totalDone(s)>=1},
  {id:"clean3",  name:"Bez berliček",   desc:"3 úrovně bez jediné nápovědy.",     glyph:"3×",  color:"var(--m-padding)", test:s=>totalClean(s)>=3},
  {id:"clean10", name:"Čistý kód",      desc:"10 úrovní bez nápovědy.",           glyph:"10×", color:"var(--m-padding)", test:s=>totalClean(s)>=10},
  {id:"speed",   name:"Rychlé prsty",   desc:"Vyřeš úroveň do 60 sekund.",        glyph:"60s", color:"var(--m-border)",  test:s=>allDone(s).some(d=>d.fastest<=60)},
  {id:"streak3", name:"Tři dny v řadě", desc:"Plň kurz 3 dny po sobě.",           glyph:"3d",  color:"var(--m-margin)",  test:s=>s.bestStreak>=3},
  {id:"streak7", name:"Týden v kaskádě",desc:"Plň kurz 7 dní po sobě.",           glyph:"7d",  color:"var(--m-margin)",  test:s=>s.bestStreak>=7},
  {id:"xp1000",  name:"Tisícovka",      desc:"Nasbírej 1 000 XP.",                glyph:"1k",  color:"var(--m-border)",  test:s=>s.xp>=1000},
  {id:"poly2",   name:"Dvojjazyčný",    desc:"Vyřeš úroveň ve 2 různých kurzech.",glyph:"2×", color:"var(--c-html)",    test:s=>coursesTouched(s)>=2},
  {id:"reviewed",name:"Na koberečku", desc:"Nech si posoudit zakázku od AI art directora.", glyph:"AD", color:"var(--m-border)", test:s=>!!s.ach.reviewed},
  {id:"exhibit", name:"Vernisáž",      desc:"Vystav hotovou zakázku v galerii.", glyph:"art", color:"var(--m-margin)", test:s=>!!s.ach.exhibit},
  {id:"poly3",   name:"Polyglot",       desc:"Vyřeš úroveň ve 3 různých kurzech.",glyph:"3×", color:"var(--c-js)",      test:s=>coursesTouched(s)>=3},
];
const certAch=c=>(c.tiers||[]).filter(t=>!t.optional).map(t=>({id:`cert-${c.id}-${t.id}`, cert:true, tier:t, name:`${t.name} ${c.name}`, desc:`Certifikát: všechny úrovně stupně ${t.name}.`, glyph:t.glyph, color:c.color, test:(s,cs)=>tierLevels(c,t.id).every(l=>cs.done[l.id])}));
const allAch=()=>[...GLOBAL_ACH.map(a=>({...a,group:"Obecné"})),...COURSES.flatMap(c=>[...certAch(c),...c.achievements].map(a=>({...a,group:c.name,cid:c.id})))];
const TITLES = ["Nováček","Učeň","Stylista","Kodér","Kaskádér","Layouter","Frontendista","Vývojář","Specialista","Architekt","Expert","Guru","Senior kodér","Mistr kaskády"];
const RULES = { hintPenalty:.25, solutionShare:.1, cleanBonus:50, speedBonus:25, speedLimit:60, daily:st=>20+10*Math.min(st,7) };
const levelInfo = xp => { const lvl=Math.floor(Math.sqrt(xp/100))+1; const from=100*(lvl-1)**2, to=100*lvl**2;
  return {lvl, title:TITLES[Math.min(lvl-1,TITLES.length-1)], from, to, pct:(xp-from)/(to-from)}; };
const maxXp=l=>l.xp+Math.round((RULES.cleanBonus+RULES.speedBonus)*Math.min(1,l.xp/100));

/* ---------- stav: S.courses[cid].done[levelId] ---------- */
const LS_KEY="kaskada.v2", LS_OLD="kaskada.v1", LS_UI="kaskada.ui";
const blank=()=>({v:2, xp:0, courses:{}, ach:{}, streak:0, bestStreak:0, lastDay:null, days:0, updatedAt:0});
function migrate(s){ // v1 měl jen CSS: {done:{…}}
  s=Object.assign(blank(),s||{});
  if(s.done&&typeof s.done==="object"){ s.courses=s.courses||{}; s.courses.css={done:Object.assign({},s.done,(s.courses.css||{}).done)}; delete s.done; }
  s.v=2; return s;
}
let S=blank();
try{ const raw=localStorage.getItem(LS_KEY)||localStorage.getItem(LS_OLD); if(raw) S=migrate(JSON.parse(raw)); }catch(e){}
const cstate=cid=>(S.courses[cid]=S.courses[cid]||{done:{}});
const allDone=s=>Object.values(s.courses).flatMap(c=>Object.values(c.done||{}));
const totalDone=s=>allDone(s).length;
const totalClean=s=>allDone(s).filter(d=>d.clean).length;
const coursesTouched=s=>Object.values(s.courses).filter(c=>Object.keys(c.done||{}).length).length;
const courseXp=cs=>Object.values(cs.done||{}).reduce((a,d)=>a+(d.best||0),0);
const moduleDone=(cs,cid,m)=>course(cid).levels.filter(l=>l.module===m).every(l=>cs.done?.[l.id]);
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>ymd(new Date()); const yesterday=()=>{const d=new Date();d.setDate(d.getDate()-1);return ymd(d)};
const liveStreak=()=>(S.lastDay===today()||S.lastDay===yesterday())?S.streak:0;

let db=null, user=null, uid=null, me=null, board=[], writeChain=Promise.resolve(), writeTimer=null;
function save(){
  S.updatedAt=Date.now();
  try{localStorage.setItem(LS_KEY,JSON.stringify(S))}catch(e){}
  if(!db||!uid) return;
  clearTimeout(writeTimer);
  writeTimer=setTimeout(()=>{ writeChain=writeChain.then(pushRemote).catch(()=>{}); },1000);
}
async function pushRemote(){
  const snap=JSON.parse(JSON.stringify(S));
  await db.doc("data/users/"+uid+"/profile").set(snap);
  const per={}; for(const [cid,cs] of Object.entries(snap.courses)) per[cid]={xp:courseXp(cs),done:Object.keys(cs.done||{}).length};
  await db.doc("leaderboard/"+uid).set({xp:snap.xp, done:totalDone(snap), clean:totalClean(snap), streak:liveStreak(), ach:Object.keys(snap.ach).length, per, updatedAt:snap.updatedAt});
}

/* ---------- UI stav ---------- */
let UI={course:"css"}; try{Object.assign(UI,JSON.parse(localStorage.getItem(LS_UI)||"{}"))}catch(e){}
const saveUI=()=>{try{localStorage.setItem(LS_UI,JSON.stringify(UI))}catch(e){}};
const CUR=()=>course(UI.course)&&course(UI.course).status!=="soon"?course(UI.course):COURSES[0];

/* ---------- util ---------- */
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const star=on=>`<svg viewBox="0 0 24 24" class="${on?"on":"off"}" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>`;
const stars=(n,cls="stars")=>`<span class="${cls}" aria-label="${n} ze 3 hvězd">${star(n>=1)}${star(n>=2)}${star(n>=3)}</span>`;
/* Odemykání: bez stupňů = postupně. Se stupni: stupeň se otevře po splnění TIER_GATE předchozího,
   moduly ve stupni jsou volné, úrovně v modulu jdou postupně. */
const TIER_GATE=.7;
const modOf=(C,L)=>C.modules.find(m=>m.id===L.module)||{};
const tierLevels=(C,t)=>C.levels.filter(l=>modOf(C,l).tier===t);
function prevTier(C,t){ const k=C.tiers.findIndex(x=>x.id===t.id); if(t.optional) return null; if(t.after) return C.tiers.find(x=>x.id===t.after)||null; for(let j=k-1;j>=0;j--) if(!C.tiers[j].optional) return C.tiers[j]; return null; }
function tierUnlocked(C,t){ if(!C.tiers) return true; const T=C.tiers.find(x=>x.id===t); if(!T) return true; const pv=prevTier(C,T); if(!pv) return true; const k=C.tiers.indexOf(pv)+1;
  const prev=tierLevels(C,C.tiers[k-1].id), d=cstate(C.id).done; return prev.filter(l=>d[l.id]).length>=Math.ceil(prev.length*TIER_GATE)&&tierUnlocked(C,C.tiers[k-1].id); }
function isUnlocked(C,i){
  const L=C.levels[i], d=cstate(C.id).done; if(d[L.id]) return true;
  if(!C.tiers) return i===0||!!d[C.levels[i-1].id];
  if(!tierUnlocked(C,modOf(C,L).tier)) return false;
  if(L.requires&&!L.requires.every(m=>moduleDone(cstate(C.id),C.id,m))) return false;
  const same=C.levels.filter(l=>l.module===L.module), k=same.indexOf(L);
  return k===0||!!d[same[k-1].id];
}
const pl=(n,a,b,c)=>n===1?a:n>=2&&n<=4?b:c;

/* ---------- HUD ---------- */
function renderHud(){
  const li=levelInfo(S.xp);
  $("#hudLvl").textContent=li.lvl; $("#hudTitle").textContent=li.title;
  $("#hudXp").textContent=S.xp.toLocaleString("cs-CZ")+" XP";
  $("#hudBar").style.width=(li.pct*100).toFixed(1)+"%";
  $("#hudAvatar").src=me?.avatarUrl||"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" fill="#8cb6c0"/><text x="18" y="23" font-size="14" text-anchor="middle" font-family="monospace" fill="#14203a">{ }</text></svg>');
  const doneToday=S.lastDay===today(), st=liveStreak();
  const d=$("#daily"); d.className="chip "+(doneToday?"done":"todo");
  d.textContent=doneToday?"Denní úkol splněn":`Denní úkol: 1 úroveň · +${RULES.daily(st+1)} XP`;
  $("#streak").innerHTML=`<span class="flame">${st}</span> ${pl(st,"den","dny","dní")} v řadě`;
  $("#tabMap").textContent="Mapa · "+CUR().name;
}

/* ---------- KURZY ---------- */
function renderCourses(){
  let h=`<div class="view-head"><div><h2>Vyber si kurz</h2><p>Každý kurz má vlastní mapu úrovní. XP, série a úspěchy se sčítají dohromady za všechny kurzy.</p></div></div><div class="courses">`;
  for(const c of COURSES){
    const soon=c.status==="soon", cs=cstate(c.id), n=Object.keys(cs.done).length, tot=c.levels.length;
    h+=`<button class="course${soon?" soon":""}" ${soon?"disabled":`data-course="${c.id}"`}>
      <span class="band" style="background:${c.color}"><b>${c.name}</b><code>${esc(c.code)}</code></span>
      <span class="body"><p>${c.tagline}</p>
      <span class="foot"><span class="pill ${c.status}">${soon?"Připravujeme":c.status==="beta"?"Beta":"Kurz"}</span><span>${soon?"":`${n} / ${tot} úrovní · ${courseXp(cs)} XP`}</span></span>
      ${soon?"":`<span class="bar"><i style="width:${tot?n/tot*100:0}%;background:${c.color}"></i></span>`}</span></button>`;
  }
  $("#v-courses").innerHTML=h+`</div>`;
}

/* ---------- MAPA ---------- */
function renderMap(){
  const C=CUR(), cs=cstate(C.id);
  const nextIdx=C.levels.findIndex((l,i)=>!cs.done[l.id]&&isUnlocked(C,i));
  const total=C.levels.length, dn=C.levels.filter(l=>cs.done[l.id]).length;
  let h=`<div class="view-head"><div><h2>${C.name}</h2><p>${C.tiers?`Úplné základy pro nováčky, pak Junior → Medior → Senior a Novinky. Další stupeň se otevře po splnění ${TIER_GATE*100} % předchozího, moduly uvnitř stupně si projdeš v libovolném pořadí.`:"Úrovně se odemykají postupně."} Bez nápovědy 3 hvězdy a bonus ${RULES.cleanBonus} XP.</p></div>
  ${nextIdx>=0?`<button class="btn primary" data-play="${C.levels[nextIdx].id}">Pokračovat: ${esc(C.levels[nextIdx].title)}</button>`:dn===total?`<span class="chip done">Kurz dokončen</span>`:""}</div>`;
  const groups=C.tiers?C.tiers.map(t=>({t,mods:C.modules.filter(m=>m.tier===t.id)})):[{t:null,mods:C.modules}];
  for(const {t,mods} of groups){
    if(t){ const tl=tierLevels(C,t.id), td=tl.filter(l=>cs.done[l.id]).length, open=tierUnlocked(C,t.id), k=C.tiers.indexOf(t), got=S.ach[`cert-${C.id}-${t.id}`];
      const prev=prevTier(C,t), need=prev?Math.ceil(tierLevels(C,prev.id).length*TIER_GATE):0;
      h+=`<div class="tier${open?"":" locked"}"><div class="tier-head"><span class="tier-badge" style="background:${C.color}">${t.glyph}</span>
        <div><h3>${t.name}${t.optional?` <span class="pill beta">Dobrovolné</span>`:""}</h3><small>${t.desc}</small></div>
        <div class="tier-prog">${got?`<span class="pill live">Certifikát získán</span>`:open?`<span class="mono">${td} / ${tl.length}</span>`:`<span class="pill">Odemkne se po ${need} úrovních stupně ${prev.name}</span>`}
        <span class="bar"><i style="width:${tl.length?td/tl.length*100:0}%"></i></span></div></div>`; }
    for(const m of mods){
      const lv=C.levels.map((l,i)=>({l,i})).filter(x=>x.l.module===m.id);
      const md=lv.filter(x=>cs.done[x.l.id]).length;
      h+=`<div class="module"><div class="mod-head"><span class="mod-sw" style="background:${m.color}">${m.glyph}</span><div><h3>${m.name}</h3><small>${m.sub}</small></div>${lv.length?`<span class="mod-prog">${md} / ${lv.length}</span>`:""}</div>`;
      if(!lv.length){h+=`<div class="soon">Tady přibudou další úrovně.</div></div>`;continue}
      h+=`<div class="nodes">`;
      for(const {l,i} of lv){
        const d=cs.done[l.id], un=isUnlocked(C,i);
        const tag=l.project?`<span class="ltag proj">Zakázka</span>`:l.boss?`<span class="ltag boss">Komponenta</span>`:l.kind==="debug"?`<span class="ltag debug">Oprav chybu</span>`:l.support?supBadge(l,true):"";
        h+=`<button class="node${i===nextIdx?" next":""}${l.boss?" bossnode":""}${l.project?" projnode":""}" data-play="${l.id}" ${un?"":"disabled"}>
          <span class="n">úroveň ${String(i+1).padStart(2,"0")} ${tag}</span><b>${esc(l.title)}</b>${l.project?`<span class="client">${l.brief.client} · ${l.brief.style}${!un&&l.requires?`<br>Otevře se po modulech: ${l.requires.map(r=>C.modules.find(m=>m.id===r)?.name).join(", ")}`:""}</span>`:""}
          <span class="meta">${d?stars(d.stars):un?"<span>Neodehráno</span>":"<span>Zamčeno</span>"}<span>${d?d.best+" / ":""}${maxXp(l)} XP</span></span></button>`;
      }
      h+=`</div></div>`;
    }
    if(t) h+=`</div>`;
  }
  $("#v-map").innerHTML=h;
}

/* ---------- HRA ---------- */
let P=null, runSeq=0, runTimer=null;
function startLevel(id,keepCode){
  const C=CUR(), i=C.levels.findIndex(l=>l.id===id); if(i<0||!isUnlocked(C,i)) return;
  const L=C.levels[i], E=ENGINES[C.engine];
  const dr=DRAFTS[C.id+"/"+id];
  P={C,E,L,i,hints:0,solution:false,start:Date.now(),css:keepCode&&P&&P.L.id===id?P.css:(L.project&&dr!=null?dr:L.starter),passed:false};
  show("play"); renderPlay();
}
const SUP={baseline:{t:"Baseline",c:"live",d:"Funguje ve všech hlavních prohlížečích."},interop:{t:"Interop 2026",c:"beta",d:"Prohlížeče ji v roce 2026 společně dotahují — v Chromu a Safari už jede."},chromium:{t:"Chromium",c:"warn",d:"Zatím hlavně Chrome a Edge. Ostatní prohlížeče na cestě."}};
function supBadge(L,short){ const s=SUP[L.support?.status]; return s?`<span class="ltag sup-${s.c}" title="${s.d}">${s.t}</span>`:""; }
let DRAFTS={}; try{DRAFTS=JSON.parse(localStorage.getItem("kaskada.drafts")||"{}")}catch(e){}
let draftT=null; const saveDraft=()=>{clearTimeout(draftT);draftT=setTimeout(()=>{try{DRAFTS[P.C.id+"/"+P.L.id]=P.css;localStorage.setItem("kaskada.drafts",JSON.stringify(DRAFTS))}catch(e){}},400)};
function briefHtml(L){
  const b=L.brief;
  return `<div class="brief">
    <div class="brief-top"><span class="k">Zakázka · klient</span><b>${b.client}</b><p>${b.story}</p></div>
    <div class="brief-grid">
      <div><span class="k">Styl</span><b class="style-name">${b.style}</b><div class="kw">${b.keywords.map(k=>`<span>${k}</span>`).join("")}</div></div>
      <div><span class="k">Paleta</span><div class="pal">${b.palette.map(([n,h])=>`<span class="sw"><i style="background:${h}"></i><code>${h}</code><small>${n}</small></span>`).join("")}</div></div>
      <div><span class="k">Písmo</span>${b.fonts.map(([role,fam])=>`<div class="fnt"><span style="font-family:'${fam}',system-ui">${fam}</span><small>${role}</small></div>`).join("")}</div>
    </div>
    <div class="steps"><span class="k">Postup</span><ol>${b.steps.map(s=>`<li>${s}</li>`).join("")}</ol></div>
    <p class="note">Kontroly hlídají zadání klienta, ne pixel-perfect shodu. Referenční návrh vpravo je jen jedna z možných cest.</p>
  </div>`;
}
function renderPlay(){
  const {C,E,L,i}=P, m=C.modules.find(x=>x.id===L.module), prev=cstate(C.id).done[L.id], sup=supported(L);
  $("#v-play").innerHTML=`
  <div class="play${L.project?" is-project":""}">
    <div class="panel lesson">
      <div class="crumbs"><button data-view="map">← Mapa</button><span>·</span><span class="crs-tag" style="background:${C.color}">${C.name}</span><span>${m.name} · úroveň ${i+1} z ${C.levels.length}</span>${L.support?supBadge(L):""}</div>
      <h2>${esc(L.title)}</h2>
      ${L.support&&!sup?`<div class="hint"><b>Tvůj prohlížeč tuhle funkci zatím nezná.</b> Výsledek se nevykreslí, proto zkontrolujeme jen zápis. Naplno si ji vyzkoušíš v aktuálním Chromu.</div>`:""}
      ${L.project?briefHtml(L):L.slides?slidesHtml(L):`<div class="theory">${L.theory}</div>${L.id==="sel-1"&&!cstate("css").done["s-5"]?`<p class="note">Nový v CSS? <button class="linkbtn" data-play="s-1">Projdi nejdřív Úplné základy</button> — deset minut, vysvětlí selektor, vlastnost i závorky.</p>`:""}<div class="task"><h4>Úkol</h4>${L.task}</div>`}
      <ul class="checks" id="checks"></ul>
      <div class="hints" id="hints"></div>
      <div class="helpbar">
        <button class="btn" id="hintBtn"></button>
        <button class="btn ghost" id="solBtn">${L.project?"Ukázat referenční návrh":"Ukázat řešení"} <small>(−90 % XP)</small></button>
        <button class="btn ghost" id="resetBtn">Vrátit kód</button>
      </div>
      <div id="sol"></div>
      ${L.project?`<div class="review" id="review" hidden><div class="review-head"><b>Posudek art directora</b><small>AI zhodnotí tvůj návrh vůči zadání. Volání jde z tvého účtu Claude.</small></div><button class="btn" id="reviewBtn">Požádat o posudek</button><div id="reviewOut"></div></div>`:""}
      ${prev?`<p class="note">Tvůj nejlepší výsledek: ${stars(prev.stars)} ${prev.best} XP. Lepší průchod ti doplní rozdíl.</p>`:""}
    </div>
    <div style="min-width:0">
      <div class="editor">
        <div class="ed-head"><span class="dots"><i></i><i></i><i></i></span>${E.lang==="css"&&L.html?`<span class="ed-tabs" role="tablist"><button type="button" role="tab" class="ed-tab" id="tabCss" aria-selected="true">${E.file}</button><button type="button" role="tab" class="ed-tab" id="tabHtml" aria-selected="false">index.html <small>jen čtení</small></button></span>`:`<span>${E.file}</span>`}${E.lang==="css"?`<button class="cheat-btn" type="button" id="cheatBtn">Tahák</button>`:""}<span class="timer" id="timer">0:00</span></div>
        <div class="ed-body"><div class="gutter" id="gutter">1</div>
        <div class="ed-wrap"><pre class="hl" aria-hidden="true"></pre><textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Editor kódu (${E.lang})"></textarea></div></div>
        ${symbarHtml(E.lang)}
        <pre class="htmlview" id="htmlView" hidden></pre>
        <div class="lint" id="lint" hidden></div>
      </div>
      <div id="engineBox"></div>
      <div class="submitbar">
        <button class="btn primary" id="submit" disabled>Odevzdat</button>
        <span class="status" id="status"></span>
        <span class="potential" id="pot"></span>
      </div>
    </div>
  </div>`;
  const ta=$("#code"); ta.value=P.css;
  E.mount(L,$("#engineBox"));
  if(L.project){ const g=$("#engineBox").querySelector('.stage:last-child .lab span'); if(g) g.textContent="Referenční návrh"; const g2=$("#engineBox").querySelector('.stage:last-child .lab span:last-child'); if(g2) g2.textContent="jedna z možných cest"; }
  setupEditor(ta,E.lang,L,{onChange(){P.css=ta.value;saveDraft();schedule()},onSubmit(){if(!$("#submit").disabled)submit()}});
  $("#hintBtn").onclick=()=>{if(P.hints<L.hints.length){P.hints++;renderHelp();updatePot()}};
  $("#solBtn").onclick=()=>{P.solution=true;renderHelp();updatePot()};
  $("#resetBtn").onclick=()=>{ta.value=P.css=L.starter;saveDraft();evaluate()};
  $("#submit").onclick=submit;
  if(L.project) setupReview();
  if($("#cheatBtn")) $("#cheatBtn").onclick=openCheat;
  if($("#tabHtml")){ $("#htmlView").innerHTML=fmtHtml(L.html); const sw=h=>{ $("#tabHtml").setAttribute("aria-selected",h); $("#tabCss").setAttribute("aria-selected",!h); $("#htmlView").hidden=!h; document.querySelector(".ed-body").hidden=h; if(!h) $("#code").focus(); };
    $("#tabHtml").onclick=()=>sw(true); $("#tabCss").onclick=()=>sw(false); }
  if(E.lang==="css") setupStageTools($("#engineBox"));
  if(L.slides) setupSlides(L);
  renderHelp(); evaluate(); ta.focus();
}
function slidesHtml(L){
  return `<div class="slides-box" id="slidesBox">
    <div class="sl-track">${L.slides.map((sl,k)=>`<section class="sl" data-k="${k}" ${k?"hidden":""}><span class="k">Krok ${k+1} z ${L.slides.length}</span><h3>${sl.title}</h3>${sl.html.replace("{{anatomy}}",anatomyHtml())}</section>`).join("")}</div>
    <div class="sl-nav"><button class="btn ghost" id="slPrev" disabled>← Zpět</button><span class="sl-dots">${L.slides.map((_,k)=>`<i class="${k?"":"on"}"></i>`).join("")}</span><button class="btn primary" id="slNext">Dál →</button></div>
  </div><div class="task" id="slTask" hidden><h4>Teď ty</h4>${L.task}</div>`;
}
function setupSlides(L){
  let k=0; const n=L.slides.length, seen=!!cstate("css").done[L.id];
  const go=j=>{ k=Math.max(0,Math.min(n-1,j)); document.querySelectorAll(".sl").forEach(x=>x.hidden=+x.dataset.k!==k); document.querySelectorAll(".sl-dots i").forEach((d,i)=>d.classList.toggle("on",i===k));
    $("#slPrev").disabled=k===0; $("#slNext").textContent=k===n-1?"Jdu to zkusit":"Dál →"; };
  $("#slPrev").onclick=()=>go(k-1);
  $("#slNext").onclick=()=>{ if(k<n-1) go(k+1); else { $("#slTask").hidden=false; $("#checks").hidden=false; $("#slTask").scrollIntoView({behavior:"smooth",block:"nearest"}); $("#code").focus(); } };
  if(!seen){ $("#checks").hidden=true; } else $("#slTask").hidden=false;
}
async function setupReview(){
  if(MODE==="static") return setupReviewStatic();
  const sample=window.claude?.use?await claude.use("sample"):null;
  if(!sample||!$("#review")) return;
  $("#review").hidden=false;
  $("#reviewBtn").onclick=async()=>{
    const L=P.L,b=L.brief,out=$("#reviewOut"),btn=$("#reviewBtn"); btn.disabled=true; out.innerHTML=`<p class="note">Art director si prohlíží návrh… (obvykle do minuty)</p>`;
    const prompt=reviewPrompt(L,P.css);
    try{
      const r=await sample.json(prompt,{modelTier:"default"});
      const li=a=>(Array.isArray(a)?a:[]).map(x=>`<li></li>`).join("");
      out.innerHTML=`<div class="rv"><div class="rv-score"><b></b><small>/ 10</small></div><p class="rv-verdict"></p>
        <p class="k">Co funguje</p><ul class="rv-s">${li(r.strengths)}</ul><p class="k">Co zlepšit</p><ul class="rv-i">${li(r.improvements)}</ul><p class="note rv-fit"></p></div>`;
      out.querySelector(".rv-score b").textContent=String(r.score??"–"); out.querySelector(".rv-verdict").textContent=r.verdict||"";
      out.querySelectorAll(".rv-s li").forEach((e,k)=>e.textContent=r.strengths[k]); out.querySelectorAll(".rv-i li").forEach((e,k)=>e.textContent=r.improvements[k]);
      out.querySelector(".rv-fit").textContent=r.styleFit||"";
      if(!S.ach["reviewed"]){S.ach["reviewed"]=Date.now();save();toast(`<span class="medal" style="background:var(--m-border)">AD</span><div><b>Nový úspěch</b><br>Na koberečku u art directora</div>`)}
    }catch(e){ out.innerHTML=`<p class="note">${e.code==="not_granted"?"Posudek není povolený. Můžeš ho povolit při dalším pokusu po znovunačtení stránky.":e.code==="rate_limited"?"Moc žádostí najednou, zkus to za chvíli.":"Posudek se nepovedl načíst. Zkus to znovu."}</p>`; }
    finally{ btn.disabled=false; }
  };
}
function renderHelp(){
  const L=P.L, left=L.hints.length-P.hints;
  $("#hints").innerHTML=L.hints.slice(0,P.hints).map((h,k)=>`<div class="hint"><b>Nápověda ${k+1}:</b> ${h}</div>`).join("");
  const hb=$("#hintBtn"); hb.disabled=!left||P.solution;
  hb.innerHTML=left?`Nápověda <small>(−${RULES.hintPenalty*100} % XP · zbývá ${left})</small>`:"Nápovědy vyčerpány";
  $("#solBtn").disabled=P.solution;
  $("#sol").innerHTML=P.solution?`<div class="solution"><b>Řešení</b><pre>${esc(L.solution)}</pre><button class="btn" id="useSol">Vložit do editoru</button></div>`:"";
  if(P.solution) $("#useSol").onclick=()=>{$("#code").value=P.css=L.solution;evaluate()};
}
function schedule(){ updateGutter(); clearTimeout(runTimer); const d=P.E.delay; if(!d) return evaluate(); $("#status").textContent="Spouštím…"; runTimer=setTimeout(evaluate,d); }
function updateGutter(bad){ const n=P.css.split("\n").length, set=new Set((bad||P.lint||[]).map(x=>x.line)); $("#gutter").innerHTML=Array.from({length:n},(_,k)=>set.has(k+1)?`<span class="gerr">${k+1}</span>`:k+1).join("\n"); }
let lintTimer=null;
function renderLint(){ const box=$("#lint"); if(!box) return; const l=P.E.lang==="css"?lintCss(P.css,P.L):[]; P.lint=l; updateGutter(l);
  box.hidden=!l.length; box.innerHTML=l.length?`<b>Kontrola zápisu</b><ul>${l.map(x=>`<li><span class="ln">ř. ${x.line}</span> ${esc(x.msg)}</li>`).join("")}</ul>`:""; }
async function evaluate(){
  updateGutter();
  const seq=++runSeq, p=P;
  const res=await p.E.run(p.L,p.css,$("#engineBox"));
  if(seq!==runSeq||p!==P||!$("#checks")) return;
  clearTimeout(lintTimer); lintTimer=setTimeout(renderLint,P.lint&&P.lint.length?250:900); drawGrids($("#engineBox")); edRefresh();
  let lastG=null;
  $("#checks").innerHTML=res.map(r=>{const g=r.group&&r.group!==lastG?`<li class="grp">${esc(r.group)}</li>`:"";lastG=r.group||lastG;return g+`<li class="${r.ok?"ok":""}"><span class="dot"></span>${esc(r.label)}</li>`}).join("");
  P.passed=res.length>0&&res.every(r=>r.ok);
  $("#submit").disabled=!P.passed;
  $("#status").textContent=P.passed?"Všechno sedí. Odevzdej (Ctrl/⌘ + Enter).":`Splněno ${res.filter(r=>r.ok).length} z ${res.length}`;
  updatePot();
}
function updatePot(){ if($("#pot")) $("#pot").innerHTML=`${calcXp(P,elapsed()).total} <small>XP ve hře</small>`; }
const elapsed=()=>Math.round((Date.now()-P.start)/1000);
function calcXp(p,secs){
  const L=p.L, lines=[];
  if(p.solution){ const v=Math.round(L.xp*RULES.solutionShare); lines.push(["Vyřešeno s řešením",v]); return {lines,total:v,stars:1,clean:false}; }
  const base=Math.round(L.xp*(1-RULES.hintPenalty*p.hints)); lines.push([p.hints?`Základ (−${p.hints} ${pl(p.hints,"nápověda","nápovědy","nápověd")})`:"Základ",base]);
  let t=base;
  const bk=Math.min(1,L.xp/100), cb=Math.round(RULES.cleanBonus*bk), sb=Math.round(RULES.speedBonus*bk);
  if(!p.hints){ lines.push(["Bez nápovědy",cb]); t+=cb;
    if(secs<=RULES.speedLimit){ lines.push([`Rychlost (do ${RULES.speedLimit} s)`,sb]); t+=sb; } }
  return {lines,total:t,stars:p.hints?2:3,clean:!p.hints};
}
setInterval(()=>{ if(P&&!$("#v-play").hidden&&$("#timer")){const s=elapsed();$("#timer").textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); if(s===RULES.speedLimit+1) updatePot();} },1000);

function submit(){
  if(!P.passed) return;
  const secs=elapsed(), r=calcXp(P,secs), {C,L}=P, cs=cstate(C.id);
  const prev=cs.done[L.id], prevBest=prev?.best||0, gain=Math.max(0,r.total-prevBest);
  const out=[...r.lines];
  if(prev) out.push(["Už dříve získáno",-Math.min(prevBest,r.total)]);
  cs.done[L.id]={best:Math.max(prevBest,r.total), stars:Math.max(prev?.stars||0,r.stars), clean:!!(prev?.clean||r.clean),
    fastest:Math.min(prev?.fastest??99999, P.solution?99999:secs), at:Date.now()};
  let total=gain;
  if(S.lastDay!==today()){
    S.streak=(S.lastDay===yesterday())?S.streak+1:1; S.bestStreak=Math.max(S.bestStreak,S.streak); S.lastDay=today(); S.days=(S.days||0)+1;
    const b=RULES.daily(S.streak); total+=b; out.push([`Denní bonus (série ${S.streak})`,b]);
  }
  S.xp+=total;
  const fresh=allAch().filter(a=>!S.ach[a.id]&&(()=>{try{return a.test(S,cstate(a.cid||C.id))}catch(e){return false}})());
  fresh.forEach(a=>S.ach[a.id]=Date.now());
  save(); renderHud();
  const next=C.levels.find((l,k)=>k>P.i&&!cstate(C.id).done[l.id]&&isUnlocked(C,k))||C.levels.find((l,k)=>!cstate(C.id).done[l.id]&&isUnlocked(C,k));
  const ov=document.createElement("div"); ov.className="overlay";
  ov.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
    ${stars(r.stars,"bigstars")}
    <h3 id="mt" style="text-align:center">${r.stars===3?"Čistá práce!":r.stars===2?"Hotovo!":"Zvládnuto"}</h3>
    <div class="lines">${out.map(([k,v])=>`<div><span>${k}</span><span>${v>0?"+":""}${v}</span></div>`).join("")}<div class="tot"><span>Celkem</span><span>+${total} XP</span></div></div>
    ${fresh.length?`<div class="newach"><b>Nový úspěch</b>${fresh.map(a=>`<div class="a"><span class="medal" style="background:${a.color}">${a.glyph}</span><div><b>${a.name}</b><br><small>${a.desc}</small></div></div>`).join("")}</div>`:""}
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
      ${r.stars<3?`<button class="btn" data-act="retry">Zkusit na 3 hvězdy</button>`:""}
      ${L.project?`<button class="btn" data-act="exhibit">Vystavit v galerii</button>`:""}
      <button class="btn" data-act="map">Mapa</button>
      ${next?`<button class="btn primary" data-act="next">Další úroveň →</button>`:`<button class="btn primary" data-act="courses">Další kurzy</button>`}
    </div></div>`;
  document.body.append(ov);
  const subCss=P.css;
  ov.addEventListener("click",e=>{const bt=e.target.closest("[data-act]"), a=bt?.dataset.act; if(!a) return; if(a==="exhibit"){exhibit(L,subCss,bt);return} ov.remove();
    if(a==="next"){startLevel(next.id)} else if(a==="retry"){startLevel(L.id)} else {P=null;show(a)}});
  (ov.querySelector(".btn.primary")||ov.querySelector(".btn"))?.focus();
  if(r.stars>=2) confetti();
}

/* =====================================================================
   PRO NOVÁČKY: kontrola zápisu (linter), anatomie pravidla, tahák, uvítání
   ===================================================================== */
const COMMON_PROPS=["color","background","background-color","font-size","font-weight","font-family","font-style","text-align","text-decoration","line-height","letter-spacing","margin","padding","border","border-radius","width","height","max-width","min-height","display","gap","flex","grid","position","top","right","bottom","left","inset","z-index","opacity","transform","transition","animation","box-shadow","overflow","justify-content","align-items","flex-direction","flex-wrap","grid-template-columns","grid-template-areas","grid-column","grid-area","box-sizing","object-fit","aspect-ratio","outline","cursor","content","text-transform","white-space"];
let _allProps=null;
function allProps(){ if(_allProps) return _allProps; const s=new Set(COMMON_PROPS); try{ for(const p of getComputedStyle(document.documentElement)) s.add(p); }catch(e){} return _allProps=[...s]; }
function lev(a,b){ const m=a.length,n=b.length; if(Math.abs(m-n)>3) return 9; const d=Array.from({length:m+1},(_,i)=>[i]); for(let j=1;j<=n;j++) d[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return d[m][n]; }
function nearestProp(p){ let best=null,bd=3; for(const q of allProps()){ const x=lev(p,q); if(x<bd){bd=x;best=q} } return best; }
const _probe=new CSSStyleSheet();
function validSelector(sel){ try{ _probe.replaceSync(sel+"{}"); return _probe.cssRules.length===1; }catch(e){ return false; } }
const SIZE_PROPS=/^(font-size|width|height|max-width|min-width|max-height|min-height|margin|padding|gap|top|right|bottom|left|border-radius|letter-spacing|border-width|inset)/;

/* Vrací [{line, msg}] — přátelské české hlášky k typickým chybám zápisu */
function lintCss(src,L){
  const out=[], push=(line,msg)=>{ if(!out.some(o=>o.line===line&&o.msg===msg)) out.push({line,msg}); };
  let code=src.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g," "));
  const lineAt=i=>code.slice(0,i).split("\n").length;
  const oc=code.indexOf("/*"); if(oc>=0){ push(lineAt(oc),"Neuzavřený komentář — chybí */ na konci."); code=code.slice(0,oc); }
  const skipVal=!!(L&&L.support&&!supported(L));
  const stack=[]; let buf="", start=0, paren=0;
  const firstIdx=(s,off)=>off+(s.length-s.trimStart().length);
  const decl=(text,at)=>{
    const t=text.trim(); if(!t) return; const line=lineAt(firstIdx(text,at));
    const r0=t.split("\n"); if(r0.length>1&&!r0[0].includes(":")&&r0.slice(1).some(r=>r.includes(":"))){ push(line,`Za „${r0[0].trim()}“ chybí otevírací závorka {`); return; }
    if(!stack.length){ push(line, t.includes(":")?`„${t.split("\n")[0].slice(0,30)}“ musí být uvnitř pravidla: selektor { vlastnost: hodnota; }`:`„${t.slice(0,30)}“ — za selektorem chybí složené závorky { … }`); return; }
    const parent=stack[stack.length-1].p;
    const rows=t.split("\n");
    if(!rows[0].includes(":")&&rows.slice(1).some(r=>r.includes(":"))){ push(line,`Za „${rows[0].trim()}“ chybí otevírací závorka {`); return; }
    const k=rows.findIndex((r,ix)=>ix>0&&/^\s*(--)?[a-zA-Z-]+\s*:/.test(r));
    if(k>0&&rows.slice(0,k).join("").includes(":")){ push(line+k-1,"Na konci řádku chybí středník ;"); return; }
    if(!t.includes(":")&&/=/.test(t)){ push(line,"Místo = se v CSS píše dvojtečka: color: red;"); return; }
    if(!t.includes(":")){ push(line,`„${t.slice(0,30)}“ — chybí dvojtečka mezi vlastností a hodnotou (např. color: red;)`); return; }
    if(/^@keyframes/.test(stack[0]?.p||"")&&!/[{]/.test(t)){ /* deklarace v keyframes */ }
    const ci=t.indexOf(":"), prop=t.slice(0,ci).trim(), val=t.slice(ci+1).replace(/!important\s*$/,"").trim();
    if(prop.startsWith("--")) return;
    if(!/^-?[a-zA-Z-]+$/.test(prop)){ push(line,`„${prop}“ není název vlastnosti. Tvar je vlastnost: hodnota;`); return; }
    if(/=/.test(t)&&!/[(]/.test(t)){ push(line,"Místo = se v CSS píše dvojtečka :"); return; }
    if(!val){ push(line,`Vlastnost „${prop}“ nemá hodnotu.`); return; }
    if(skipVal) return;
    const known=CSS.supports(prop,"inherit");
    if(!known){ const n=nearestProp(prop.toLowerCase()); push(line,`Vlastnost „${prop}“ neznám.${n?` Nemyslíš „${n}“?`:" Zkontroluj překlep."}`); return; }
    if(/var\(|env\(|attr\(|if\(|sibling-|anchor\(|\bfrom\b/.test(val)) return;
    if(!CSS.supports(prop,val)){
      let tip="";
      if(/color|background|border/.test(prop)&&/^[0-9a-f]{3,8}$/i.test(val)) tip=" Nezapomněl/a jsi # před kódem barvy?";
      else if(SIZE_PROPS.test(prop)&&/^\d+(\.\d+)?$/.test(val)&&val!=="0") tip=` Chybí jednotka, třeba ${val}px.`;
      else if(/;/.test(val)) tip="";
      push(line,`Hodnotu „${val.slice(0,30)}“ vlastnost „${prop}“ nezná.${tip}`);
    }
  };
  const prelude=(text,at)=>{
    const p=text.trim(), line=lineAt(firstIdx(text,at));
    if(!p){ push(line,"Před { chybí selektor — komu má pravidlo platit?"); return p; }
    if(p.startsWith("@")||p.includes("&")) return p;
    const par=stack[stack.length-1]?.p||"";
    if(/^@keyframes/.test(par)) return p;
    if(stack.length&&!par.startsWith("@")) return p; // vnořené pravidlo
    if(!validSelector(p)){ push(line,`Selektor „${p.slice(0,40)}“ nedává smysl — zkontroluj překlep.`); return p; }
    if(L&&L.html&&/^[a-z][a-z0-9-]*$/i.test(p)&&!new RegExp("<"+p+"[\\s>]","i").test(L.html)&&new RegExp(`class="[^"]*\\b${p}\\b`).test(L.html))
      push(line,`Chceš vybrat třídu? Před název patří tečka: .${p}`);
    return p;
  };
  for(let i=0;i<code.length;i++){
    const ch=code[i];
    if(ch==='"'||ch==="'"){ const j=code.indexOf(ch,i+1); const e=j<0?code.length-1:j; buf+=code.slice(i,e+1); i=e; continue; }
    if(ch==="("){paren++;buf+=ch;continue} if(ch===")"){paren=Math.max(0,paren-1);buf+=ch;continue}
    if(paren>0){buf+=ch;continue}
    if(ch==="{"){ const p=prelude(buf,start); stack.push({p,line:lineAt(i)}); buf=""; start=i+1; continue; }
    if(ch==="}"){ if(!stack.length){ if(!out.some(o=>/otevírací závorka \{/.test(o.msg))) push(lineAt(i),"Tahle } přebývá — nemá svou otevírací {."); } else { decl(buf,start); stack.pop(); } buf=""; start=i+1; continue; }
    if(ch===";"){ if(!stack.length&&/^\s*@(import|charset|layer|namespace)/.test(buf)){} else decl(buf,start); buf=""; start=i+1; continue; }
    buf+=ch;
  }
  if(buf.trim()){ if(!stack.length){ const t=buf.trim(); push(lineAt(firstIdx(buf,start)), t.includes(":")?`„${t.slice(0,30)}“ musí být uvnitř pravidla: selektor { vlastnost: hodnota; }`:`Za „${t.slice(0,30)}“ chybí složené závorky { … }`); } else decl(buf,start); }
  for(const s of stack) push(s.line,`Pravidlo „${s.p.slice(0,30)}“ nemá zavírací závorku }`);
  return out.sort((a,b)=>a.line-b.line).slice(0,5);
}

/* Anatomie pravidla — klikací rozbor */
const ANAT=[["sel","Selektor","Komu pravidlo platí. <code>h1</code> = všem nadpisům h1, <code>.tip</code> = prvkům s třídou tip."],
  ["brace","Složené závorky","Ohraničují, co pro vybrané prvky platí. Otevírací { za selektorem, zavírací } na konci."],
  ["prop","Vlastnost","Co měníš: barvu, velikost, odsazení… Píše se malými písmeny a anglicky."],
  ["colon","Dvojtečka","Odděluje vlastnost od hodnoty. Bez ní prohlížeč řádek přeskočí."],
  ["val","Hodnota","Na co to měníš: <code>red</code>, <code>#e11d48</code>, <code>24px</code>…"],
  ["semi","Středník","Konec jedné „věty“. Za každou deklarací, i za poslední."]];
function anatomyHtml(){
  return `<div class="anat"><div class="anat-code" aria-hidden="true"><span data-p="sel">h1</span> <span data-p="brace">{</span><br>&nbsp;&nbsp;<span data-p="prop">color</span><span data-p="colon">:</span> <span data-p="val">red</span><span data-p="semi">;</span><br><span data-p="brace">}</span></div>
    <div class="anat-legend">${ANAT.map(([k,n])=>`<button type="button" data-anat="${k}"><i class="a-${k}"></i>${n}</button>`).join("")}</div>
    <p class="anat-desc" id="anatDesc">Klikni na část pravidla. Česky se to čte: „Nadpisům h1 nastav barvu na červenou.“</p></div>`;
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-anat],.anat-code [data-p]"); if(!b) return;
  const k=b.dataset.anat||b.dataset.p, box=b.closest(".anat"), a=ANAT.find(x=>x[0]===k);
  box.querySelectorAll("[data-p],[data-anat]").forEach(x=>x.classList.toggle("on",(x.dataset.p||x.dataset.anat)===k));
  box.querySelector(".anat-desc").innerHTML=`<b>${a[1]}:</b> ${a[2]}`;
});

/* Tahák — dostupný v každé CSS úrovni */
function cheatHtml(){
  const rows=[["color","barva textu","color: #e11d48;"],["background-color","barva pozadí","background-color: #fde68a;"],["font-size","velikost písma","font-size: 24px;"],["font-weight","tloušťka písma (400 normální, 700 tučné)","font-weight: 700;"],["text-align","zarovnání textu","text-align: center;"],["padding","vnitřní odsazení","padding: 16px;"],["margin","vnější odsazení","margin: 0 auto;"],["border","rámeček","border: 1px solid #ccc;"],["border-radius","zaoblení rohů","border-radius: 8px;"],["display","způsob rozložení","display: flex;"]];
  return `<div class="cheat"><div class="cheat-head"><b>Tahák</b><button class="btn ghost" data-close>Zavřít</button></div>
  <div class="cheat-body">
    <h4>Jak vypadá pravidlo</h4><pre>selektor {\n  vlastnost: hodnota;\n  další-vlastnost: hodnota;\n}</pre>
    <h4>Selektory</h4><ul><li><code>p</code> — všechny prvky &lt;p&gt;</li><li><code>.tip</code> — prvky s <code>class="tip"</code> (tečka = třída)</li><li><code>#app</code> — prvek s <code>id="app"</code> (mřížka = id)</li><li><code>.card p</code> — odstavce <i>uvnitř</i> .card (mezera = uvnitř)</li></ul>
    <h4>Nejčastější vlastnosti</h4><table>${rows.map(r=>`<tr><td><code>${r[0]}</code></td><td>${r[1]}</td><td><code>${r[2]}</code></td></tr>`).join("")}</table>
    <h4>Barvy</h4><ul><li>název: <code>red</code>, <code>navy</code></li><li>hex kód z Figmy: <code>#e11d48</code> (vždy s #)</li><li>s průhledností: <code>rgba(0, 0, 0, 0.5)</code></li></ul>
    <h4>Jednotky</h4><ul><li><code>px</code> — pixely, <code>16px</code> je běžný text</li><li><code>%</code> — procento z rodiče</li><li><code>rem</code> — násobek velikosti písma stránky</li><li>u nuly jednotka není potřeba: <code>margin: 0;</code></li></ul>
    <h4>Nejčastější chyby</h4><ul><li>chybí středník <code>;</code> na konci řádku</li><li>chybí zavírací <code>}</code></li><li>tečka před třídou: <code>.tip</code>, ne <code>tip</code></li><li><code>#</code> před hex barvou</li><li>dvojtečka, ne rovnítko: <code>color: red</code></li></ul>
  </div></div>`;
}
function openCheat(){ const ov=document.createElement("div"); ov.className="overlay"; ov.innerHTML=cheatHtml(); document.body.append(ov);
  ov.addEventListener("click",e=>{if(e.target===ov||e.target.closest("[data-close]"))ov.remove()}); ov.querySelector("[data-close]").focus(); }

/* Uvítání při první návštěvě */
function maybeWelcome(){
  if(UI.welcomed||totalDone(S)>0) return;
  const ov=document.createElement("div"); ov.className="overlay";
  ov.innerHTML=`<div class="modal welcome" role="dialog" aria-modal="true" aria-labelledby="wt">
    <h3 id="wt">Vítej v Kaskádě</h3><p>Naučíš se tu CSS — jazyk, kterým se webům říká, jak mají vypadat. Kolik toho už znáš?</p>
    <div class="wopts">
      <button class="wopt" data-w="start"><b>Nic, jsem úplný nováček</b><span>Úplné základy: co je selektor, vlastnost a proč ty závorky. Asi 10 minut.</span></button>
      <button class="wopt" data-w="junior"><b>Něco jsem už viděl/a</b><span>Rovnou na stupeň Junior. Základy si můžeš kdykoli projít.</span></button>
      <button class="wopt" data-w="map"><b>CSS znám</b><span>Ukaž mi celou mapu kurzu.</span></button>
    </div></div>`;
  document.body.append(ov);
  ov.addEventListener("click",e=>{ const w=e.target.closest("[data-w]")?.dataset.w; if(!w) return; UI.welcomed=1; saveUI(); ov.remove(); UI.course="css"; saveUI();
    if(w==="start") startLevel("s-1"); else if(w==="junior") startLevel("sel-1"); else show("map"); });
  ov.querySelector(".wopt").focus();
}

/* ---------- GALERIE ---------- */
let GALLERY=[], GAL_F=null;
async function exhibit(L,css,btn){
  if(MODE==="static") return shareStatic(L,css,btn);
  if(!db||!uid){ btn.textContent="Galerie je dostupná jen v rámci organizace"; return; }
  btn.disabled=true; btn.textContent="Vystavuji…";
  try{
    const ref=db.doc("gallery/"+uid), snap=await ref.get(), cur=snap.exists?JSON.parse(JSON.stringify(snap.data())):{works:{}};
    cur.works=cur.works||{}; cur.works[L.id]={css:css.slice(0,60000),at:Date.now()}; cur.updatedAt=Date.now();
    await ref.set(cur);
    S.exhibited=S.exhibited||{}; S.exhibited[L.id]=Date.now();
    if(!S.ach.exhibit){S.ach.exhibit=Date.now();toast(`<span class="medal" style="background:var(--m-margin)">art</span><div><b>Nový úspěch</b><br>Vernisáž</div>`)}
    save(); btn.textContent="Vystaveno v galerii";
  }catch(e){ btn.disabled=false; btn.textContent=e.code==="invalid_argument"?"Nemáš oprávnění vystavovat":"Nepovedlo se, zkus znovu"; }
}
async function renderGallery(){
  if(MODE==="static") return renderGalleryStatic();
  const el=$("#v-gallery"); const projs=COURSES.flatMap(c=>c.levels.filter(l=>l.project).map(l=>({c,l})));
  if(!GAL_F||!projs.some(p=>p.l.id===GAL_F)) GAL_F=projs[0]?.l.id;
  const cur=projs.find(p=>p.l.id===GAL_F);
  const works=GALLERY.flatMap(g=>Object.entries(g.works||{}).filter(([k])=>k===GAL_F).map(([k,w])=>({uid:g.id,...w}))).sort((a,b)=>b.at-a.at);
  const ps=user&&works.length?await user.profiles(works.map(w=>w.uid)):{};
  el.innerHTML=`<div class="view-head"><div><h2>Galerie zakázek</h2><p>Hotové zakázky, které kolegové vystavili. Stejné HTML, stejné zadání — a pokaždé jiný design.</p></div></div>
  <div class="filters">${projs.map(p=>`<button data-gf="${p.l.id}" aria-pressed="${p.l.id===GAL_F}">${esc(p.l.title)}</button>`).join("")}</div>
  ${cur?`<p class="note" style="margin:-4px 0 14px">${cur.l.brief.client} · styl ${cur.l.brief.style}</p>`:""}
  <div class="gal-grid" id="galGrid">${works.length?works.map((w,k)=>`<figure class="gal"><div class="gal-view"><div class="gal-host" data-k="${k}"></div></div><figcaption><span class="gal-name"></span><small>${new Date(w.at).toLocaleDateString("cs-CZ")}</small></figcaption></figure>`).join(""):`<div class="soon">${db?"Zatím tu nic není. Dokonči zakázku a vystav ji jako první.":"Galerie je sdílená — funguje, když hru otevřeš přihlášený v rámci organizace."}</div>`}</div>`;
  el.querySelectorAll(".gal-host").forEach(h=>{const w=works[+h.dataset.k]; paintShadow(h,{fixed:cur.l.fixed,css:w.css,html:cur.l.html});});
  el.querySelectorAll(".gal-name").forEach((n,k)=>{const w=works[k]; n.textContent=w.uid===uid?(me?.name||"Ty")+" (ty)":(ps[w.uid]?.name||"Kolega")});
}

/* ---------- PROFIL ---------- */
function renderProfile(){
  const li=levelInfo(S.xp), name=me?.name||"Ty";
  let h=`<div class="prof-top"><img class="avatar" src="${$("#hudAvatar").src}" alt=""><div><h2></h2>
    <div class="title-line">Úroveň ${li.lvl} · ${li.title} · do další úrovně ${li.to-S.xp} XP</div>
    <div class="bar" style="margin-top:8px;max-width:420px"><i style="width:${(li.pct*100).toFixed(1)}%"></i></div></div></div>
  <div class="stats">
    <div class="stat"><b>${S.xp.toLocaleString("cs-CZ")}</b><span>XP celkem</span></div>
    <div class="stat"><b>${totalDone(S)}</b><span>dokončené úrovně</span></div>
    <div class="stat"><b>${totalClean(S)}</b><span>bez nápovědy</span></div>
    <div class="stat"><b>${liveStreak()}</b><span>série dní (rekord ${S.bestStreak})</span></div>
    <div class="stat"><b>${Object.keys(S.ach).length}/${allAch().length}</b><span>úspěchy</span></div>
  </div>
  <h3 class="sec">Kurzy</h3><div class="cprog">`;
  for(const c of COURSES.filter(c=>c.status!=="soon")){const cs=cstate(c.id),n=Object.keys(cs.done).length;
    h+=`<div class="r" style="--cc:${c.color}"><b>${c.name}</b><span class="bar"><i style="width:${c.levels.length?n/c.levels.length*100:0}%"></i></span><span class="mono">${n}/${c.levels.length} · ${courseXp(cs)} XP</span></div>`}
  h+=`</div>`;
  const certs=COURSES.filter(c=>c.tiers&&c.status!=="soon").flatMap(c=>certAch(c).map(a=>({...a,c})));
  if(certs.length){ h+=`<h3 class="sec">Certifikáty</h3><div class="certs">`;
    for(const a of certs){const got=S.ach[a.id];
      h+=`<div class="cert${got?"":" locked"}"><span class="seal" style="background:${a.c.color}">${a.glyph}</span><span class="k">Kaskáda · certifikát</span><b>${a.name}</b>
      <span class="who">${got?`Uděleno: <span class="cert-name"></span>`:"Zatím nezískáno"}</span>
      <small>${got?new Date(got).toLocaleDateString("cs-CZ")+" · "+tierLevels(a.c,a.tier.id).length+" úrovní":`Splň všech ${tierLevels(a.c,a.tier.id).length} úrovní stupně ${a.tier.name}.`}</small></div>`}
    h+=`</div>`; }
  const groups={}; allAch().filter(a=>!a.cert).forEach(a=>(groups[a.group]=groups[a.group]||[]).push(a));
  for(const [g,list] of Object.entries(groups)){
    h+=`<h3 class="sec">Úspěchy · ${g}</h3><div class="ach-grid">`;
    for(const a of list){const got=S.ach[a.id];
      h+=`<div class="ach${got?"":" locked"}"><span class="medal" style="background:${a.color}">${a.glyph}</span><div style="min-width:0"><b>${a.name}</b><small>${a.desc}${got?`<br>Získáno ${new Date(got).toLocaleDateString("cs-CZ")}`:""}</small></div></div>`}
    h+=`</div>`;
  }
  if(MODE==="static") h+=backupHtml();
  $("#v-profile").innerHTML=h;
  if(MODE==="static") setupBackup();
  $("#v-profile h2").textContent=name;
  document.querySelectorAll("#v-profile .cert-name").forEach(e=>e.textContent=name);
}

/* ---------- ŽEBŘÍČEK ---------- */
let BOARD_F="all";
async function renderBoard(){
  const el=$("#v-board");
  const live=COURSES.filter(c=>c.status!=="soon");
  const local={id:"__me",xp:S.xp,done:totalDone(S),clean:totalClean(S),streak:liveStreak(),ach:Object.keys(S.ach).length,
    per:Object.fromEntries(Object.entries(S.courses).map(([k,v])=>[k,{xp:courseXp(v),done:Object.keys(v.done||{}).length}]))};
  let rows=db?board.slice():[local];
  const key=r=>BOARD_F==="all"?(r.xp||0):(r.per?.[BOARD_F]?.xp||0);
  const dn=r=>BOARD_F==="all"?(r.done||0):(r.per?.[BOARD_F]?.done||0);
  rows=rows.filter(r=>key(r)>0||r.id===uid||r.id==="__me").sort((a,b)=>key(b)-key(a));
  const ids=rows.map(r=>r.id).filter(x=>x!=="__me");
  const ps=user&&ids.length?await user.profiles(ids):{};
  let h=`<div class="view-head"><div><h2>Žebříček</h2><p>Pořadí podle XP. Celkové XP zahrnuje denní bonusy, XP za kurz jen body z jeho úrovní.</p></div></div>
  <div class="filters">${[{id:"all",name:"Celkem"},...live].map(c=>`<button data-bf="${c.id}" aria-pressed="${BOARD_F===c.id}">${c.name}</button>`).join("")}</div>
  <div class="board"><table><thead><tr><th>Pořadí</th><th>Hráč</th><th class="num">XP</th><th class="num">Úrovně</th>${BOARD_F==="all"?`<th class="num">Bez nápovědy</th><th class="num">Série</th><th class="num">Úspěchy</th>`:""}</tr></thead><tbody>`;
  if(!rows.length) h+=`<tr><td colspan="7" style="color:var(--ink-2)">Zatím nikdo nebodoval. Dokonči první úroveň a budeš tu první.</td></tr>`;
  const names=[];
  rows.forEach((r,k)=>{const mine=r.id===uid||r.id==="__me", p=ps[r.id];
    names.push((mine?(me?.name||"Ty"):(p?.name||"Kolega"))+(mine?" (ty)":""));
    const av=mine?$("#hudAvatar").src:(p?.avatarUrl||"");
    h+=`<tr class="${mine?"me":""}"><td class="rank${k===0?" r1":""}">${k+1}.</td><td><span class="who">${av?`<img src="${esc(av)}" alt="">`:""}<span class="nm"></span></span></td>
    <td class="num"><b>${key(r).toLocaleString("cs-CZ")}</b></td><td class="num">${dn(r)}</td>${BOARD_F==="all"?`<td class="num">${r.clean||0}</td><td class="num">${r.streak||0}</td><td class="num">${r.ach||0}</td>`:""}</tr>`;
  });
  h+=`</tbody></table></div><p class="note">${db?"Žebříček se aktualizuje živě pro všechny kolegy, kteří hru otevřeli.":"Sdílený žebříček je dostupný, když hru otevřeš přihlášený v rámci organizace. Teď vidíš jen svůj výsledek."}</p>`;
  el.innerHTML=h;
  el.querySelectorAll(".nm").forEach((n,k)=>n.textContent=names[k]);
}

/* ---------- navigace ---------- */
let VIEW="courses";
function show(v){
  VIEW=v;
  for(const x of ["courses","map","play","profile","board","gallery"]) $("#v-"+x).hidden=x!==v;
  document.querySelector("main").classList.toggle("wide-play",v==="play"); hideTip();
  document.querySelectorAll("nav.tabs button").forEach(b=>b.dataset.view===v||(v==="play"&&b.dataset.view==="map")?b.setAttribute("aria-current","page"):b.removeAttribute("aria-current"));
  if(v==="courses")renderCourses(); if(v==="map")renderMap(); if(v==="profile")renderProfile(); if(v==="board")renderBoard(); if(v==="gallery")renderGallery();
  renderHud(); window.scrollTo({top:0});
}
function openCourse(id){ UI.course=id; saveUI(); try{history.replaceState(null,"","#"+id)}catch(e){} show("map"); }
document.addEventListener("click",e=>{
  const bf=e.target.closest("[data-bf]"); if(bf){BOARD_F=bf.dataset.bf;renderBoard();return}
  const zb=e.target.closest(".zoom"); if(zb&&P){ const ov=document.createElement("div"); ov.className="overlay"; ov.innerHTML=`<div class="bigview" role="dialog" aria-label="Náhled"><div class="bv-bar"><b>${esc(P.L.title)} · tvůj návrh</b><button class="btn" data-close>Zavřít</button></div><div class="bv-host"></div></div>`; document.body.append(ov); paintShadow(ov.querySelector(".bv-host"),{fixed:P.L.fixed,css:P.css,html:P.L.html}); ov.addEventListener("click",ev=>{if(ev.target===ov||ev.target.closest("[data-close]"))ov.remove()}); ov.querySelector("[data-close]").focus(); return }
  const gf=e.target.closest("[data-gf]"); if(gf){GAL_F=gf.dataset.gf;renderGallery();return}
  const co=e.target.closest("[data-course]"); if(co){openCourse(co.dataset.course);return}
  const pl=e.target.closest("[data-play]"); if(pl&&!pl.disabled){startLevel(pl.dataset.play);return}
  const vw=e.target.closest("[data-view]"); if(vw){show(vw.dataset.view)}
});

/* ---------- efekt ---------- */
function confetti(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv=$("#fx"); cv.hidden=false; const x=cv.getContext("2d"); cv.width=innerWidth; cv.height=innerHeight;
  const cols=["#8cb6c0","#b9c77a","#f2c96b","#f3b184","#2f5bd3"];
  const ps=Array.from({length:120},()=>({x:innerWidth/2,y:innerHeight/2.4,vx:(Math.random()-.5)*14,vy:-Math.random()*13-3,s:4+Math.random()*6,c:cols[Math.random()*5|0],r:Math.random()*6}));
  let f=0;(function tick(){x.clearRect(0,0,cv.width,cv.height);
    for(const p of ps){p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=.1;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()}
    if(++f<110)requestAnimationFrame(tick);else{x.clearRect(0,0,cv.width,cv.height);cv.hidden=true}})();
}

/* ---------- start + sdílená data ---------- */
function retroAch(){ let n=0; for(const a of allAch()){ if(S.ach[a.id]) continue; let ok=false; try{ok=a.test(S,cstate(a.cid||"css"))}catch(e){} if(ok){S.ach[a.id]=Date.now();n++} } if(n) save(); }
function boot(){
  retroAch(); setTimeout(maybeWelcome,300);
  const h=(location.hash||"").slice(1);
  if(course(h)&&course(h).status!=="soon"){UI.course=h;saveUI();show("map")}
  else show(totalDone(S)?"map":"courses");
  if(!window.claude?.use) return;
  (async()=>{
    user=await claude.use("user");
    if(user){ me=await user.me(); uid=me.id; renderHud(); if(VIEW==="profile")renderProfile(); }
    db=await claude.use("db");
    if(!db||!uid){ db=null; return; }
    try{
      const snap=await db.doc("data/users/"+uid+"/profile").get();
      if(snap.exists){ const r=migrate(JSON.parse(JSON.stringify(snap.data())));
        if(r.xp>S.xp){ S=r; try{localStorage.setItem(LS_KEY,JSON.stringify(S))}catch(e){} if(snap.data().done) save(); }
        else if(S.xp>r.xp||snap.data().done) save(); }
      else if(S.xp>0) save();
      retroAch(); if(VIEW!=="play") show(VIEW); else renderHud();
    }catch(e){}
    db.collection("gallery").limit(300).onSnapshot(q=>{ GALLERY=q.docs.map(d=>Object.assign({id:d.id},d.data())); if(VIEW==="gallery")renderGallery(); },()=>{});
    db.collection("leaderboard").orderBy("xp","desc").limit(200).onSnapshot(q=>{
      board=q.docs.map(d=>Object.assign({id:d.id},d.data()));
      if(VIEW==="board")renderBoard();
    },()=>{});
  })();
}

