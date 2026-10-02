/* =====================================================================
   SDÍLENÍ A ZPĚTNÁ VAZBA
   - odkaz přímo na úroveň: #css.flex-2 (v artifactu na claude.ai smí hash
     obsahovat jen písmena, číslice a . _ ~ -, proto tečka místo lomítka)
   - Nahlásit problém → předvyplněný issue na GitHubu (žádná data k nám)
   - certifikát jako obrázek + přidání na LinkedIn
   ===================================================================== */
const REPO_URL=(CFG.repoUrl||"https://github.com/viktorbrenek/kaskado").replace(/\/$/,"");
const SITE_URL=CFG.siteUrl||"https://brenek.art/kaskado/";
const VIEW_HASH={map:null,training:"trenink",gallery:"galerie",profile:"profil",courses:"kurzy",board:"zebricek"};

function setHash(h){ try{ const nh=h?"#"+h:location.pathname+location.search; if(("#"+h)!==location.hash) history.replaceState(null,"",h?"#"+h:nh); }catch(e){} }
function hashForView(v){ if(v==="play"&&P) return `${P.C.id}.${P.L.id}`; if(v==="map") return CUR().id; return VIEW_HASH[v]||""; }
function routeFromHash(){
  const h=decodeURIComponent((location.hash||"").slice(1)); if(!h) return false;
  const m=/^([a-z]+)\.([\w-]+)$/.exec(h);
  if(m&&course(m[1])){ const C=course(m[1]), i=C.levels.findIndex(l=>l.id===m[2]); UI.course=C.id; saveUI();
    if(i>=0&&isUnlocked(C,i)){ startLevel(m[2]); return true; }
    show("map"); if(i>=0) setTimeout(()=>toast(`<div><b>Úroveň je zatím zamčená</b><br>${esc(C.levels[i].title)} — nejdřív projdi předchozí úrovně.</div>`),400); return true; }
  const v=Object.entries(VIEW_HASH).find(([k,x])=>x===h)?.[0]; if(v){ show(v); return true; }
  if(course(h)&&course(h).status!=="soon"){ UI.course=h; saveUI(); show("map"); return true; }
  return false;
}
window.addEventListener("hashchange",()=>{ const cur=hashForView(VIEW); if(decodeURIComponent(location.hash.slice(1))!==cur) routeFromHash(); });

function levelLink(L,C){ const base=MODE==="static"?location.origin+location.pathname:SITE_URL; return `${base}#${C.id}.${L.id}`; }
function reportUrl(L,C,css){
  const lint=(P&&P.lint||[]).map(x=>`ř. ${x.line}: ${x.msg}`).join("\n")||"—";
  const failing=[...document.querySelectorAll("#checks li:not(.ok):not(.grp)")].map(e=>"- "+e.textContent).join("\n")||"—";
  const body=`### Co se stalo\n<!-- Popiš, co nefunguje nebo čemu nerozumíš. Co jsi čekal(a) a co se stalo místo toho? -->\n\n\n### Úroveň\n${C.name} · ${L.title} (\`${C.id}.${L.id}\`)\n${levelLink(L,C)}\n\n### Můj kód\n\`\`\`${P?.E?.lang||"css"}\n${(css||"").slice(0,3000)}\n\`\`\`\n\n### Nesplněné kontroly\n${failing}\n\n### Kontrola zápisu\n${lint}\n\n### Prostředí\n${navigator.userAgent}\nverze: ${MODE}`;
  return `${REPO_URL}/issues/new?labels=${encodeURIComponent("úroveň")}&title=${encodeURIComponent(`[${L.id}] `)}&body=${encodeURIComponent(body)}`;
}

/* ---------- certifikát jako obrázek ---------- */
function certNameDefault(){ try{ return localStorage.getItem("kaskada.certname")||me?.name||""; }catch(e){ return me?.name||""; } }
async function certImage({title,sub,name,date,levels,color,glyph}){
  try{ await Promise.all(["800 64px 'Bricolage Grotesque'","700 20px 'Atkinson Hyperlegible'","600 18px 'JetBrains Mono'"].map(f=>document.fonts.load(f))); }catch(e){}
  const W=1200,H=630,cv=document.createElement("canvas"); cv.width=W; cv.height=H; const x=cv.getContext("2d");
  const ink="#14203a", paper="#fbfaf6", bands=["#8cb6c0","#b9c77a","#f2c96b","#f3b184"];
  x.fillStyle=paper; x.fillRect(0,0,W,H);
  // box model rámeček: margin → border → padding → content, jako v DevTools
  bands.slice().reverse().forEach((c,k)=>{ x.fillStyle=c; const p=k*14; x.fillRect(p,p,W-2*p,H-2*p); });
  x.fillStyle=paper; x.fillRect(56,56,W-112,H-112);
  x.strokeStyle=ink; x.lineWidth=1.5; x.setLineDash([6,6]); x.strokeRect(72,72,W-144,H-144); x.setLineDash([]);
  x.fillStyle=ink; x.font="600 18px 'JetBrains Mono', monospace"; x.fillText("{ kaskáda: certifikát; }",104,130);
  x.font="800 76px 'Bricolage Grotesque', system-ui, sans-serif"; x.fillText(title,104,230);
  x.font="700 24px 'Atkinson Hyperlegible', system-ui, sans-serif"; x.fillStyle="#4a5775"; x.fillText(sub,104,276);
  x.fillStyle=ink; x.font="700 20px 'Atkinson Hyperlegible', system-ui, sans-serif"; x.fillText("Uděleno",104,370);
  let fs=54; x.font=`800 ${fs}px 'Bricolage Grotesque', system-ui, sans-serif`; while(x.measureText(name||"—").width>760&&fs>28){ fs-=2; x.font=`800 ${fs}px 'Bricolage Grotesque', system-ui, sans-serif`; } x.fillText(name||"—",104,430);
  x.font="600 18px 'JetBrains Mono', monospace"; x.fillStyle="#4a5775"; x.fillText(`${date}  ·  ${levels} úrovní  ·  ${SITE_URL.replace(/^https?:\/\//,"")}`,104,500);
  // pečeť
  x.beginPath(); x.arc(W-210,H-210,92,0,Math.PI*2); x.fillStyle=color||"#8cb6c0"; x.fill(); x.lineWidth=3; x.strokeStyle=ink; x.stroke();
  x.fillStyle=ink; x.textAlign="center"; x.font="800 44px 'Bricolage Grotesque', system-ui, sans-serif"; x.fillText(glyph||"",W-210,H-196);
  x.font="600 14px 'JetBrains Mono', monospace"; x.fillText("CSS",W-210,H-168); x.textAlign="left";
  return cv.toDataURL("image/png");
}
async function openCertificate(achId){
  const a=allAch().find(x=>x.id===achId); if(!a||!S.ach[achId]) return; const C=course(a.cid), t=a.tier, got=new Date(S.ach[achId]);
  const ov=document.createElement("div"); ov.className="overlay";
  ov.innerHTML=`<div class="modal cert-modal" role="dialog" aria-modal="true" aria-labelledby="ctt"><h3 id="ctt">Certifikát ${esc(a.name)}</h3>
    <label class="pg-c"><span>Jméno na certifikátu</span><input id="certName" type="text" maxlength="60" autocomplete="name"></label>
    <img id="certImg" alt="Náhled certifikátu" class="cert-img">
    <div class="helpbar">${MODE==="static"?`<button class="btn primary" id="certDl">Stáhnout obrázek</button>`:`<span class="note">Obrázek uložíš pravým tlačítkem → Uložit obrázek.</span>`}
      <a class="btn" id="certLi" target="_blank" rel="noopener">Přidat na LinkedIn</a><button class="btn ghost" data-close>Zavřít</button></div>
    <p class="note">„Přidat na LinkedIn“ otevře formulář pro novou certifikaci v tvém profilu s vyplněným názvem. Nic se nikam neodesílá, dokud to v LinkedIn sám/sama neuložíš.</p></div>`;
  document.body.append(ov);
  const inp=ov.querySelector("#certName"); inp.value=certNameDefault();
  const draw=async()=>{ const url=await certImage({title:`${t.name} ${C.name}`,sub:`Stupeň ${t.name} · kurz ${C.name}`,name:inp.value.trim(),date:got.toLocaleDateString("cs-CZ"),levels:tierLevels(C,t.id).length,glyph:t.glyph,color:C.color.startsWith("var")?getComputedStyle(document.documentElement).getPropertyValue(C.color.slice(4,-1)).trim():C.color});
    ov.querySelector("#certImg").src=url; ov.dataset.url=url;
    const li=new URL("https://www.linkedin.com/profile/add"); li.searchParams.set("startTask","CERTIFICATION_NAME"); li.searchParams.set("name",`Kaskáda: ${t.name} ${C.name}`); li.searchParams.set("organizationName","Kaskáda"); li.searchParams.set("issueYear",got.getFullYear()); li.searchParams.set("issueMonth",got.getMonth()+1); li.searchParams.set("certUrl",SITE_URL);
    ov.querySelector("#certLi").href=li.toString(); };
  let tmr; inp.addEventListener("input",()=>{ try{localStorage.setItem("kaskada.certname",inp.value)}catch(e){} clearTimeout(tmr); tmr=setTimeout(draw,200); });
  ov.querySelector("#certDl")?.addEventListener("click",()=>{ const l=document.createElement("a"); l.href=ov.dataset.url; l.download=`kaskada-${C.id}-${t.id}.png`; document.body.append(l); l.click(); l.remove(); });
  ov.addEventListener("click",e=>{ if(e.target===ov||e.target.closest("[data-close]")) ov.remove(); });
  draw(); inp.focus();
}
