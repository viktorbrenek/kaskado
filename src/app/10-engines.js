/* Kaskáda — https://github.com/viktorbrenek/kaskado · MIT (kód), CC BY 4.0 (obsah kurzu)
   MODE "claude" = artifact na claude.ai (sdílený žebříček, galerie, AI posudek přes window.claude)
   MODE "static" = GitHub Pages (postup jen v prohlížeči, galerie přes giscus / GitHub Discussions) */
const CFG = window.KASKADA || {};
const MODE = CFG.mode || (window.claude && window.claude.use ? "claude" : "static");
/* =====================================================================
   KASKÁDA — architektura
   1) ENGINES   … jak se úloha spouští a kontroluje (css, html, js, …)
   2) COURSES   … registrace kurzů přes registerCourse({...})
   3) CORE      … stav hráče, XP, série, úspěchy, UI, sdílená data
   Nový kurz = registerCourse() s engine, který už existuje.
   Nový jazyk = nový ENGINES[id] se stejným rozhraním:
     mount(L, box)            vykreslí náhled/konzoli pod editor
     run(L, code, box) → Promise<[{label, ok}]>
     file, lang, delay        název souboru v editoru, jazyk, debounce (ms)
   ===================================================================== */

const ENGINES = {};
/* ---------- diagramy mřížky do výkladu: gd({cols, items, nums, gap, areas, cap}) ---------- */
function gd({cols,items=[],nums=false,gap=6,areas="",cap=""}){
  const n=cols.trim().split(/\s+(?![^(]*\))/).length;
  const numRow=nums?`<div class="gd-nums" style="grid-template-columns:${cols};column-gap:${gap}px">${Array.from({length:n},(_,k)=>`<span style="grid-row:1;grid-column:${k+1}">${k+1}</span>`).join("")}<span class="last" style="grid-row:1;grid-column:${n}">${n+1}</span></div>`:"";
  const cells=items.map(it=>{ const o=typeof it==="string"?{t:it}:it;
    return `<div class="gd-cell${o.hl?" hl":""}" style="${o.col?`grid-column:${o.col};`:""}${o.a?`grid-area:${o.a};`:""}${o.c?`background:${o.c};`:""}${o.f?`color:${o.f};`:""}">${o.t}</div>`; }).join("");
  return `<figure class="gd">${numRow}<div class="gd-grid" style="grid-template-columns:${cols};gap:${gap}px;${areas?`grid-template-areas:${areas.replace(/"/g,"'")};`:""}">${cells}</div>${cap?`<figcaption>${cap}</figcaption>`:""}</figure>`;
}

/* ---------- diagramy flexboxu: fx({jc, ai, dir, n, hs, cap}) — vykresluje skutečný flexbox ---------- */
function fx({jc="flex-start",ai="stretch",dir="row",n=3,hs=[],h=64,gap=6,cap,code,wrap=false,labels}={}){
  const items=Array.from({length:n},(_,k)=>`<div class="fx-i" style="${hs[k]?`height:${hs[k]}px;`:""}${dir.startsWith("column")?"width:auto;":""}">${labels?labels[k]:k+1}</div>`).join("");
  return `<figure class="fx"><div class="fx-box" style="display:flex;flex-direction:${dir};justify-content:${jc};align-items:${ai};gap:${gap}px;${wrap?"flex-wrap:wrap;":""}height:${h}px">${items}</div><figcaption>${code?`<code>${code}</code>`:""}${cap?` ${cap}`:""}</figcaption></figure>`;
}
const fxGal=(arr)=>`<div class="fx-gal">${arr.join("")}</div>`;
function axesDiagram(){
  return `<div class="axes"><figure class="fx"><div class="fx-box axes-box" style="display:flex;gap:6px;height:90px;align-items:flex-start"><div class="fx-i">1</div><div class="fx-i">2</div><div class="fx-i">3</div><span class="ax ax-main">hlavní osa →</span><span class="ax ax-cross">příčná osa ↓</span></div><figcaption><code>flex-direction: row</code> (výchozí)</figcaption></figure>
  <figure class="fx"><div class="fx-box axes-box col" style="display:flex;flex-direction:column;gap:6px;height:150px;align-items:flex-start"><div class="fx-i">1</div><div class="fx-i">2</div><div class="fx-i">3</div><span class="ax ax-main v">hlavní osa ↓</span><span class="ax ax-cross v">příčná osa →</span></div><figcaption><code>flex-direction: column</code> osy otočí</figcaption></figure></div>`;
}
/* ---------- diagramy pozicování ---------- */
function posDiagram(kind){
  if(kind==="flow") return `<figure class="pd"><div class="pd-box"><div class="pd-i">1</div><div class="pd-i">2</div><div class="pd-i">3</div></div><figcaption><b>static</b> (výchozí): prvky jdou v normálním toku pod sebe.</figcaption></figure>`;
  if(kind==="relative") return `<figure class="pd"><div class="pd-box"><div class="pd-i">1</div><div class="pd-i ghost">místo zůstává</div><div class="pd-i hl" style="position:absolute;left:46px;top:58px">2 · relative, top: 10px; left: 30px</div><div class="pd-i">3</div></div><figcaption><b>relative</b>: posune se od svého místa, ale jeho místo v toku zůstane prázdné. Ostatní se nehnou.</figcaption></figure>`;
  if(kind==="absolute") return `<figure class="pd"><div class="pd-box rel"><span class="pd-tag">rodič · position: relative</span><div class="pd-i">1</div><div class="pd-i">3 — zabral místo dvojky</div><div class="pd-i hl" style="position:absolute;top:8px;right:8px">2 · absolute, top: 8px; right: 8px</div></div><figcaption><b>absolute</b>: vypadne z toku (ostatní se k sobě přisunou) a měří se od nejbližšího <i>pozicovaného</i> předka — proto rodiči dáváme <code>relative</code>.</figcaption></figure>`;
  if(kind==="z") return `<figure class="pd"><div class="pd-box zz"><div class="pd-c" style="left:20px;top:16px;z-index:1;background:#8cb6c0">z-index: 1</div><div class="pd-c" style="left:70px;top:40px;z-index:3;background:#f3b184">z-index: 3</div><div class="pd-c" style="left:120px;top:64px;z-index:2;background:#b9c77a">z-index: 2</div></div><figcaption>Vyšší <code>z-index</code> je blíž k tobě — ale jen u prvků s <code>position</code> jiným než <code>static</code> (a u dětí flexu či gridu).</figcaption></figure>`;
  if(kind==="sticky") return `<figure class="pd"><div class="pd-scroll"><div class="pd-sticky">Přilepená hlavička · sticky; top: 0</div>${Array.from({length:8},(_,i)=>`<p>Řádek ${i+1}</p>`).join("")}</div><figcaption>Zkus v rámečku rolovat. Dokud hlavička nedojede k hornímu okraji, chová se normálně, pak se přilepí.</figcaption></figure>`;
  if(kind==="inset") return `<div class="fx-gal"><figure class="pd"><div class="pd-box rel tall"><div class="pd-i hl" style="position:absolute;inset:0;display:grid;place-items:center">inset: 0</div></div><figcaption>Vyplní celého rodiče.</figcaption></figure><figure class="pd"><div class="pd-box rel tall"><div class="pd-i hl" style="position:absolute;inset:12px;display:grid;place-items:center">inset: 12px</div></div><figcaption>Nechá okraj 12px ze všech stran.</figcaption></figure></div>`;
  return "";
}

/* ---------- HTML úrovně jako čitelný kód (jen pro čtení) ---------- */
const INLINE=new Set(["a","span","b","strong","i","em","code","small","cite","label","button","input","img","br","abbr"]);
function fmtHtml(html){
  const t=document.createElement("template"); t.innerHTML=html; const out=[];
  const attrs=el=>[...el.attributes].map(a=>{ let v=a.value; if(a.name==="src"&&v.startsWith("data:")) v="obrázek…";
    return ` <span class="h-at">${a.name}</span>=<span class="${a.name==="class"?"h-cls":"h-val"}">"${esc(v)}"</span>`; }).join("");
  const open=el=>`<span class="h-tag">&lt;${el.localName}</span>${attrs(el)}<span class="h-tag">&gt;</span>`;
  const close=el=>`<span class="h-tag">&lt;/${el.localName}&gt;</span>`;
  const inline=el=>{ if(el.nodeType===3) return esc(el.textContent.replace(/\s+/g," ")); if(el.nodeType!==1) return "";
    if(/^(img|br|input)$/.test(el.localName)) return open(el); return open(el)+[...el.childNodes].map(inline).join("")+close(el); };
  const onlyInline=el=>[...el.childNodes].every(c=>c.nodeType===3||(c.nodeType===1&&INLINE.has(c.localName)&&onlyInline(c)));
  const walk=(node,d)=>{ for(const c of node.childNodes){
    const pad="  ".repeat(d);
    if(c.nodeType===3){ const tx=c.textContent.trim(); if(tx) out.push(pad+esc(tx)); continue; }
    if(c.nodeType!==1) continue;
    if(onlyInline(c)&&c.textContent.length<90){ out.push(pad+inline(c)); continue; }
    out.push(pad+open(c)); walk(c,d+1); out.push(pad+close(c)); } };
  walk(t.content,0); return out.join("\n");
}

/* ---------- Porovnání s cílem: prolnutí posuvníkem a seznam rozdílů ---------- */
let CMP=false, DIFFV=false;
const DIFF_PROPS=[["color","barva textu"],["backgroundColor","pozadí"],["fontSize","velikost písma"],["fontWeight","tloušťka písma"],["borderTopWidth","tloušťka rámečku"],["borderTopColor","barva rámečku"],["borderTopLeftRadius","zaoblení"],["textAlign","zarovnání textu"],["opacity","průhlednost"]];
function diffRenders(mineRoot,goalRoot){
  const A=[...mineRoot.querySelectorAll(".scene *")], B=[...goalRoot.querySelectorAll(".scene *")];
  if(A.length!==B.length||!A.length) return null;
  const sa=mineRoot.querySelector(".scene").getBoundingClientRect(), sb=goalRoot.querySelector(".scene").getBoundingClientRect();
  const out=[], moved=new Map();
  A.forEach((a,k)=>{ const b=B[k]; if(a.closest(".kx-layer")) return;
    const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect(), ca=getComputedStyle(a), cb=getComputedStyle(b), why=[];
    const dx=Math.round((ra.left-sa.left)-(rb.left-sb.left)), dy=Math.round((ra.top-sa.top)-(rb.top-sb.top));
    const pm=moved.get(a.parentElement);
    if((Math.abs(dx)>2||Math.abs(dy)>2)&&!(pm&&Math.abs(pm[0]-dx)<=2&&Math.abs(pm[1]-dy)<=2)) why.push(`poloha (posun ${dx>0?"+":""}${dx}px, ${dy>0?"+":""}${dy}px)`);
    moved.set(a,[dx,dy]);
    if(Math.abs(ra.width-rb.width)>2) why.push(`šířka ${Math.round(ra.width)} → ${Math.round(rb.width)}px`);
    if(Math.abs(ra.height-rb.height)>2) why.push(`výška ${Math.round(ra.height)} → ${Math.round(rb.height)}px`);
    const hx=v=>{ const m=/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(v); if(!m) return v; if(m[4]==="0") return "průhledné"; return "#"+[m[1],m[2],m[3]].map(x=>(+x).toString(16).padStart(2,"0")).join("")+(m[4]?` (${Math.round(m[4]*100)} %)`:""); };
    for(const [p,n] of DIFF_PROPS) if(ca[p]!==cb[p]) why.push(`${n}: ${hx(ca[p])} → ${hx(cb[p])}`);
    if(why.length) out.push({el:a,goal:b,why});
  });
  return out;
}
function renderDiff(box){
  const panel=box.querySelector(".diffpanel"); const mineH=box.querySelector('[data-host="mine"]'), goalH=box.querySelector('[data-host="goal"]');
  if(!mineH?.shadowRoot||!goalH?.shadowRoot) return;
  const root=mineH.shadowRoot; root.querySelectorAll(".kx-diff").forEach(x=>x.remove());
  if(!DIFFV){ if(panel) panel.hidden=true; return; }
  const d=diffRenders(root,goalH.shadowRoot); if(!panel) return; panel.hidden=false;
  if(!d){ panel.innerHTML=`<b>Rozdíly oproti cíli</b><p class="note">Tady se HTML výsledku a cíle liší, rozdíly porovnat nejde.</p>`; return; }
  if(!d.length){ panel.innerHTML=`<b>Rozdíly oproti cíli</b><p class="ok-line">Vypadá to stejně jako cíl.</p>`; return; }
  const hr=mineH.getBoundingClientRect(), ox=-hr.left+mineH.scrollLeft, oy=-hr.top+mineH.scrollTop; let html="";
  d.slice(0,6).forEach((x,k)=>{ const r=x.el.getBoundingClientRect(); html+=`<div class="kx-diff" style="all:initial;position:absolute;left:${r.left+ox}px;top:${r.top+oy}px;width:${r.width}px;height:${r.height}px;outline:2px dashed #e11d48;outline-offset:-1px;pointer-events:none;z-index:2147483001"></div><span class="kx-diff" style="all:initial;position:absolute;left:${r.left+ox-6}px;top:${r.top+oy-8}px;font:700 10px/1 system-ui;color:#fff;background:#e11d48;border-radius:99px;padding:2px 5px;z-index:2147483002">${k+1}</span>`; });
  const l=document.createElement("div"); l.className="kx-diff"; l.setAttribute("style","all:initial;position:absolute;left:0;top:0;pointer-events:none"); l.innerHTML=html; root.append(l);
  panel.innerHTML=`<b>Rozdíly oproti cíli</b><ol>${d.slice(0,6).map(x=>`<li><code>${esc(selOf(x.el))}</code> — ${esc(x.why.slice(0,3).join(", "))}</li>`).join("")}</ol>${d.length>6?`<p class="note">…a další ${d.length-6}.</p>`:""}`;
}
function renderCompare(box){
  const st=box.querySelector('.stage:has([data-host="mine"])'), goalH=box.querySelector('[data-host="goal"]'); if(!st||!goalH) return;
  let layer=st.querySelector(".cmp-layer");
  if(!CMP){ if(layer) layer.remove(); st.querySelector(".cmp-range")?.remove(); return; }
  const host=st.querySelector('[data-host="mine"]');
  if(!layer){ layer=document.createElement("div"); layer.className="cmp-layer"; layer.innerHTML=`<div class="host cmp-host"></div><i class="cmp-line"></i><span class="cmp-l">ty</span><span class="cmp-r">cíl</span>`; st.append(layer);
    const rg=document.createElement("input"); rg.type="range"; rg.min=0; rg.max=100; rg.value=50; rg.className="cmp-range"; rg.setAttribute("aria-label","Posuvník porovnání s cílem"); st.append(rg);
    rg.addEventListener("input",()=>layer.style.setProperty("--x",rg.value+"%")); layer.style.setProperty("--x","50%");
    host.addEventListener("scroll",()=>{ const c=st.querySelector(".cmp-host"); if(c){ c.scrollTop=host.scrollTop; c.scrollLeft=host.scrollLeft; } }); }
  layer.style.top=host.offsetTop+"px"; layer.style.height=host.offsetHeight+"px";
  const L=P.L; paintShadow(layer.querySelector(".cmp-host"),{fixed:L.fixed,css:L.solution,html:L.html,w:L.canvas});
  const ch=layer.querySelector(".cmp-host"); ch.scrollTop=host.scrollTop; ch.scrollLeft=host.scrollLeft;
}

/* ---------- Prozkoumat prvky + Ukázat mřížku v náhledu ---------- */
let INSPECT=false, GRIDVIEW=false;
try{ const u=JSON.parse(localStorage.getItem("kaskada.tools")||"{}"); GRIDVIEW=!!u.grid; }catch(e){}
function selOf(el){ let s=el.localName; if(el.id) s+="#"+el.id; if(el.classList.length) s+="."+[...el.classList].join("."); return s; }
function hostsIn(box){ return [...box.querySelectorAll(".host")].filter(h=>h.shadowRoot); }
function clearOverlay(root){ root.querySelectorAll(".kx-layer").forEach(x=>x.remove()); }
function layerFor(host){ const root=host.shadowRoot; let l=root.querySelector(".kx-layer"); if(!l){ l=document.createElement("div"); l.className="kx-layer";
  l.setAttribute("style","all:initial;position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483000"); root.append(l);} return l; }
function drawGrids(box){
  for(const host of hostsIn(box)){ const root=host.shadowRoot; clearOverlay(root); if(!GRIDVIEW) continue;
    const hr=host.getBoundingClientRect(), ox=-hr.left+host.scrollLeft, oy=-hr.top+host.scrollTop, layer=layerFor(host); let html="";
    for(const el of root.querySelectorAll(".scene *")){ const cs=getComputedStyle(el); if(!/grid/.test(cs.display)) continue;
      const r=el.getBoundingClientRect(), bl=parseFloat(cs.borderLeftWidth), bt=parseFloat(cs.borderTopWidth);
      const x0=r.left+bl+parseFloat(cs.paddingLeft)+ox, y0=r.top+bt+parseFloat(cs.paddingTop)+oy;
      const colW=cs.gridTemplateColumns.split(" ").map(parseFloat).filter(v=>!isNaN(v)), rowH=cs.gridTemplateRows.split(" ").map(parseFloat).filter(v=>!isNaN(v));
      if(colW.length<2&&rowH.length<2) continue;
      const cg=parseFloat(cs.columnGap)||0, rg=parseFloat(cs.rowGap)||0;
      const W=colW.reduce((a,b)=>a+b,0)+cg*Math.max(0,colW.length-1), H=rowH.reduce((a,b)=>a+b,0)+rg*Math.max(0,rowH.length-1);
      let x=x0; colW.forEach((w,k)=>{ html+=`<div style="position:absolute;left:${x}px;top:${y0}px;width:${w}px;height:${H}px;outline:1.5px dashed #7c3aed;background:rgba(124,58,237,.07)"></div>`;
        html+=`<span style="position:absolute;left:${x-6}px;top:${y0-15}px;font:700 10px/1 system-ui;color:#fff;background:#7c3aed;border-radius:3px;padding:2px 3px">${k+1}</span>`;
        html+=`<span style="position:absolute;left:${x+w/2-20}px;top:${y0+H+3}px;width:40px;text-align:center;font:600 9px/1 system-ui;color:#7c3aed">${Math.round(w)}px</span>`; x+=w+cg; });
      if(colW.length) html+=`<span style="position:absolute;left:${x-cg-6}px;top:${y0-15}px;font:700 10px/1 system-ui;color:#fff;background:#7c3aed;border-radius:3px;padding:2px 3px">${colW.length+1}</span>`;
      let y=y0; rowH.forEach((h,k)=>{ html+=`<span style="position:absolute;left:${x0-16}px;top:${y-5}px;font:700 10px/1 system-ui;color:#fff;background:#db2777;border-radius:3px;padding:2px 3px">${k+1}</span>`;
        if(k) html+=`<div style="position:absolute;left:${x0}px;top:${y-rg}px;width:${W}px;height:${rg}px;background:repeating-linear-gradient(45deg,rgba(219,39,119,.25) 0 3px,transparent 3px 6px)"></div>`; y+=h+rg; });
      x=x0; colW.forEach((w,k)=>{ if(k) html+=`<div style="position:absolute;left:${x-cg}px;top:${y0}px;width:${cg}px;height:${H}px;background:repeating-linear-gradient(45deg,rgba(124,58,237,.25) 0 3px,transparent 3px 6px)"></div>`; x+=w+cg; });
      const areas=cs.gridTemplateAreas; if(areas&&areas!=="none"){ const grid=areas.match(/"[^"]*"/g).map(r=>r.slice(1,-1).trim().split(/\s+/)); const seen=new Set();
        grid.forEach((row,ri)=>row.forEach((nm,ci)=>{ if(nm==="."||seen.has(nm)) return; seen.add(nm); let lx=x0; for(let q=0;q<ci;q++) lx+=colW[q]+cg; let ly=y0; for(let q=0;q<ri;q++) ly+=rowH[q]+rg;
          let aw=0; for(let q=ci;q<row.length&&row[q]===nm;q++) aw+=colW[q]+(q>ci?cg:0);
          html+=`<span style="position:absolute;left:${lx+aw-4}px;top:${ly+4}px;transform:translateX(-100%);font:700 10px/1 ui-monospace,monospace;color:#7c3aed;background:#fff;border:1px solid #7c3aed;border-radius:3px;padding:2px 4px">${esc(nm)}</span>`; })); }
    }
    layer.innerHTML=html;
  }
}
function setupStageTools(box){
  const st=box.querySelector(".stages"); if(!st) return;
  const bar=document.createElement("div"); bar.className="stage-tools";
  bar.innerHTML=`<button type="button" class="tool" id="toolInspect" aria-pressed="${INSPECT}">Prozkoumat prvky</button><button type="button" class="tool" id="toolGrid" aria-pressed="${GRIDVIEW}">Ukázat mřížku</button>${P&&!P.L.project?`<button type="button" class="tool" id="toolCmp" aria-pressed="${CMP}">Prolnout s cílem</button><button type="button" class="tool" id="toolDiff" aria-pressed="${DIFFV}">Co se liší?</button>`:""}<span class="tool-hint" id="toolHint">${INSPECT?"Najeď myší na prvek v náhledu. Kliknutím zkopíruješ selektor.":""}</span>`;
  st.before(bar);
  const dp=document.createElement("div"); dp.className="diffpanel"; dp.hidden=true; st.after(dp);
  const tc=bar.querySelector("#toolCmp"), td=bar.querySelector("#toolDiff");
  if(tc) tc.onclick=e=>{ CMP=!CMP; e.currentTarget.setAttribute("aria-pressed",CMP); renderCompare(box); };
  if(td) td.onclick=e=>{ DIFFV=!DIFFV; e.currentTarget.setAttribute("aria-pressed",DIFFV); renderDiff(box); };
  bar.querySelector("#toolGrid").onclick=e=>{ GRIDVIEW=!GRIDVIEW; e.currentTarget.setAttribute("aria-pressed",GRIDVIEW); try{localStorage.setItem("kaskada.tools",JSON.stringify({grid:GRIDVIEW}))}catch(x){} drawGrids(box); };
  bar.querySelector("#toolInspect").onclick=e=>{ INSPECT=!INSPECT; e.currentTarget.setAttribute("aria-pressed",INSPECT); $("#toolHint").textContent=INSPECT?"Najeď myší na prvek v náhledu. Kliknutím zkopíruješ selektor.":""; if(!INSPECT) hideTip(); };
  for(const host of box.querySelectorAll(".host")){
    host.addEventListener("mousemove",ev=>{ if(!INSPECT) return; const el=ev.composedPath().find(n=>n.nodeType===1&&n.getRootNode()===host.shadowRoot&&!n.classList?.contains("scene")&&!n.closest?.(".kx-layer")); if(!el||el===host){hideTip();return} showTip(el,ev); });
    host.addEventListener("mouseleave",hideTip);
    host.addEventListener("click",ev=>{ if(!INSPECT) return; const el=ev.composedPath().find(n=>n.nodeType===1&&n.getRootNode()===host.shadowRoot&&!n.classList?.contains("scene")); if(!el) return;
      const s=el.classList.length?"."+el.classList[0]:el.localName; ev.preventDefault();
      navigator.clipboard?.writeText(s).then(()=>toast(`<div><b>Zkopírováno</b><br><code>${esc(s)}</code> — vlož do editoru</div>`),()=>toast(`<div><b>Selektor</b><br><code>${esc(s)}</code></div>`)); });
  }
}
let tipEl=null, boxEl=null;
function showTip(el,ev){
  if(!tipEl){ tipEl=document.createElement("div"); tipEl.className="insp-tip"; boxEl=document.createElement("div"); boxEl.className="insp-box"; document.body.append(boxEl,tipEl); }
  const r=el.getBoundingClientRect(), cs=getComputedStyle(el);
  Object.assign(boxEl.style,{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px",display:"block"});
  tipEl.innerHTML=`<b>${esc(selOf(el))}</b><span>${Math.round(r.width)} × ${Math.round(r.height)}</span><small>display: ${cs.display}</small>`;
  tipEl.style.display="block"; const tx=Math.min(innerWidth-tipEl.offsetWidth-8,Math.max(8,r.left)); const ty=r.top>40?r.top-tipEl.offsetHeight-6:r.bottom+6; tipEl.style.left=tx+"px"; tipEl.style.top=ty+"px";
}
function hideTip(){ if(tipEl){tipEl.style.display="none";boxEl.style.display="none"} }


/* ---------- sdílené: vykreslení do shadow DOM ---------- */
const STAGE_BASE=`:host{all:initial;display:block;font-family:system-ui,sans-serif;color:#14203a;font-size:15px;line-height:1.45}
.scene{padding:18px}h1{font-size:26px;margin:0 0 8px}p{margin:0 0 6px}a{color:#2f5bd3}ul,ol{margin:0;padding-left:22px}`;
function paintShadow(host,{fixed="",css="",html="",w=0}){
  let root=host.shadowRoot;
  if(!root){ root=host.attachShadow({mode:"open"});
    // náhled je jen ukázka: formuláře se neodesílají a odkazy nikam nevedou
    root.addEventListener("submit",e=>{ if(e.target.getAttribute("method")!=="dialog") e.preventDefault(); },true);
    root.addEventListener("click",e=>{ const a=e.target.closest&&e.target.closest("a[href]"); if(a) e.preventDefault(); },true); }
  root.innerHTML=`<style>${STAGE_BASE}</style><style data-fixed>${fixed}</style><style data-user>${css}</style><div class="scene"${w?` style="width:${w}px"`:""}>${html}</div>`;
  return root;
}
/* CSSOM hráčova stylu: rozbalí @media / @container / @layer / @supports / vnořená pravidla */
function flatRules(sheet){
  const out=[];
  const walk=(list,ctx)=>{ for(const r of list){
    const t=r.constructor.name;
    if(t==="CSSStyleRule"){ out.push({kind:"style",sel:r.selectorText,style:r.style,rule:r,...ctx}); if(r.cssRules&&r.cssRules.length) walk(r.cssRules,{...ctx,parent:r.selectorText}); }
    else if(t==="CSSNestedDeclarations"){ out.push({kind:"style",sel:ctx.parent||"",style:r.style,rule:r,...ctx}); }
    else if(t==="CSSMediaRule"){ walk(r.cssRules,{...ctx,media:r.conditionText||r.media.mediaText}); }
    else if(t==="CSSContainerRule"){ walk(r.cssRules,{...ctx,container:r.conditionText||r.containerQuery}); }
    else if(t==="CSSSupportsRule"){ walk(r.cssRules,{...ctx,supports:r.conditionText}); }
    else if(t==="CSSLayerBlockRule"){ out.push({kind:"layer",name:r.name,rule:r,...ctx}); walk(r.cssRules,{...ctx,layer:r.name}); }
    else if(t==="CSSStartingStyleRule"){ walk(r.cssRules,{...ctx,starting:true}); }
    else if(t==="CSSScopeRule"){ walk(r.cssRules,{...ctx,scope:r.start||true}); }
    else if(t==="CSSKeyframesRule"){ out.push({kind:"keyframes",name:r.name,rule:r,...ctx}); }
    else out.push({kind:t,rule:r,...ctx});
  }};
  try{ walk(sheet?.cssRules||[],{}); }catch(e){}
  return out;
}
function domCtx(root){
  const q=s=>root.querySelector(s), style=(e,p)=>getComputedStyle(e,p);
  const userSheet=()=>root.querySelector("style[data-user]")?.sheet;
  const rules=()=>flatRules(userSheet());
  const match=(sel,re)=>re instanceof RegExp?re.test(sel):sel.split(",").map(s=>s.trim()).includes(re);
  return { root, q, qa:s=>[...root.querySelectorAll(s)], style,
    cs:s=>{const e=q(s);return e?style(e):{}},
    pseudo:(s,p)=>{const e=q(s);return e?style(e,p):{}},
    rect:s=>{const e=q(s);return e?e.getBoundingClientRect():{left:0,top:0,width:0,height:0,right:0,bottom:0}},
    text:s=>(q(s)?.textContent||"").trim(),
    css:()=>root.querySelector("style[data-user]")?.textContent||"",
    rules,
    /* hodnota vlastnosti z hráčova kódu (ne computed): decl(/\.btn:hover/, "background-color", r=>r.media) */
    decl:(sel,prop,where)=>{ for(const r of rules()) if(r.kind==="style"&&match(r.sel||"",sel)&&(!where||where(r))){ const v=r.style.getPropertyValue(prop); if(v) return v.trim(); } return ""; },
    important:()=>rules().some(r=>r.kind==="style"&&[...r.style].some(p=>r.style.getPropertyPriority(p)==="important")),
    /* změní šířku scény (pro container queries), vrací funkci zpět */
    width:(px,fn)=>{ const el=root.querySelector(".scene"); const old=el.style.width; el.style.width=px+"px"; try{ return fn(); } finally{ el.style.width=old; } },
    cols:s=>{ const t=[...root.querySelectorAll(s)].map(e=>Math.round(e.getBoundingClientRect().top)); return t.filter(v=>v===t[0]).length; },
    near:(a,b,tol=1.5)=>Math.abs(a-b)<=tol,
    rgba:str=>rgba(str),
    contrast:s=>{const e=typeof s==="string"?q(s):s;return e?contrastOf(e):0},
    font:(s,name)=>{const e=q(s);return !!e&&getComputedStyle(e).fontFamily.toLowerCase().includes(name.toLowerCase())},
    vars:(s,prefix="--")=>{ const set=new Set(); for(const r of rules()) if(r.kind==="style"&&(!s||r.sel===s)) for(const p of r.style) if(p.startsWith(prefix)) set.add(p); return [...set]; },
    uses:(re)=>re.test(root.querySelector("style[data-user]")?.textContent||"") };
}
const stagesHtml=`<div class="stages">
  <div class="stage"><div class="lab"><span>Tvůj výsledek</span><span>živě</span></div><div class="host" data-host="mine"></div></div>
  <div class="stage"><div class="lab"><span>Cíl</span><span>takhle to má vypadat</span></div><div class="host" data-host="goal"></div></div></div>`;
/* Podpora nových funkcí: L.support = {status, test: "(prop: value)" | "selector(...)" | () => bool}.
   Když prohlížeč funkci nezná, CSSOM deklaraci zahodí — kontroly pak běží jen nad zápisem (L.fallback). */
function supported(L){ const t=L.support?.test; if(!t) return true; try{ return typeof t==="function"?!!t():CSS.supports(t); }catch(e){ return false; } }
const checksFor=L=>supported(L)?L.checks:(L.fallback||[]).map(f=>({label:f.label+" · ověřeno zápisem",group:f.group,test:c=>f.re.test(c.css())}));
const runChecks=(L,ctx)=>checksFor(L).map(ch=>{let ok=false;try{ok=!!ch.test(ctx)}catch(e){}return {label:ch.label,group:ch.group,ok}});
/* převod libovolné CSS barvy (i oklch, color-mix) na [r,g,b,a] přes canvas */
const _cv=document.createElement("canvas"); _cv.width=_cv.height=1; const _cx=_cv.getContext("2d",{willReadFrequently:true});
function rgba(str){ if(!str) return [0,0,0,0]; _cx.clearRect(0,0,1,1); _cx.fillStyle="#000"; _cx.fillStyle=str; _cx.fillRect(0,0,1,1); const d=_cx.getImageData(0,0,1,1).data; return [d[0],d[1],d[2],d[3]/255]; }
const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
function effectiveBg(el){ let stack=[]; for(let e=el;e&&e.nodeType===1;e=e.parentElement||e.getRootNode()?.host){ const c=rgba(getComputedStyle(e).backgroundColor); if(c[3]>0){ stack.push(c); if(c[3]>=.99) break; } }
  let out=[255,255,255]; for(const c of stack.reverse()) out=out.map((v,k)=>v*(1-c[3])+c[k]*c[3]); return out; }
function contrastOf(el){ const fg=rgba(getComputedStyle(el).color), bg=effectiveBg(el); const f=fg.slice(0,3).map((v,k)=>v*fg[3]+bg[k]*(1-fg[3])); const a=lum(f),b=lum(bg); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05); }

/* ---------- ENGINE: CSS — hráč píše CSS nad pevným HTML ---------- */
ENGINES.css = { file:"styles.css", lang:"css", delay:0,
  mount(L,box){ box.innerHTML=stagesHtml.replace('class="stages"',`class="stages${L.boss||L.wide||L.project?" wide":""}"`); paintShadow(box.querySelector('[data-host="goal"]'),{fixed:L.fixed,css:L.solution,html:L.html,w:L.canvas}); if(L.project) box.querySelector('.stage .lab span:last-child').innerHTML=`<button class="zoom" type="button">Zvětšit náhled</button>`; },
  async run(L,code,box){ const root=paintShadow(box.querySelector('[data-host="mine"]'),{fixed:L.fixed,css:code,html:L.html,w:L.canvas}); return runChecks(L,domCtx(root)); }
};

/* ---------- ENGINE: HTML — hráč píše HTML, CSS je pevné ---------- */
ENGINES.html = { file:"index.html", lang:"html", delay:150,
  mount(L,box){ box.innerHTML=stagesHtml; paintShadow(box.querySelector('[data-host="goal"]'),{fixed:L.fixed,html:L.solution}); },
  async run(L,code,box){ const root=paintShadow(box.querySelector('[data-host="mine"]'),{fixed:L.fixed,html:code}); return runChecks(L,domCtx(root)); }
};

/* ---------- ENGINE: JavaScript — kód běží ve Web Workeru, testy = výrazy (smí být i Promise) ---------- */
const jsFn=t=>`async()=>{try{${t.act?`await (async()=>{${t.act}})();`:""}const v=await (${t.expr});return {v:v===undefined?"undefined":JSON.stringify(v)}}catch(e){return {e:String(e&&e.message||e)}}}`;
const jsSeq=tests=>`(async()=>{const r=[];for(const f of [${tests.map(jsFn).join(",\n")}]) r.push(await f());return r})()`;
const jsSafe=s=>String(s).replace(/<\/(script)/gi,"<\\/$1");
function jsReport(L,box,logs,res,err){
  const out=L.tests.map((t,k)=>{const r=res?.[k]; const exp=JSON.stringify(t.expect); const ok=!!r&&!r.e&&r.v===exp;
    return {label:t.label,group:t.group,ok,got:r?(r.e?"chyba: "+r.e:r.v):(err||"—"),exp}});
  box.querySelector("[data-tests]").innerHTML=out.map(o=>`<tr class="${o.ok?"ok":"ko"}"><td class="st">${o.ok?"✓":"×"}</td><td>${esc(o.label)}</td><td class="got">${o.ok?"":"dostali jsme "+esc(o.got)}</td></tr>`).join("");
  box.querySelector("[data-t]").textContent=`${out.filter(o=>o.ok).length}/${out.length}`;
  const o=box.querySelector("[data-out]");
  o.innerHTML=(logs||[]).map(esc).join("\n")+(err?`<span class="err">${logs&&logs.length?"\n":""}${esc(err)}</span>`:"")||`<span style="color:var(--code-dim)">Zatím nic nevypsáno.</span>`;
  return out.map(({label,ok,group})=>({label,ok,group}));
}
const consoleHtml=`<div class="console"><div class="lab"><span>Testy</span><span data-t></span></div><table class="tests"><tbody data-tests></tbody></table></div>
    <div class="console"><div class="lab"><span>Konzole</span><span>console.log</span></div><div class="out" data-out></div></div>`;
const LOG_SHIM=`const __l=[];const __f=a=>typeof a==="string"?a:(()=>{try{return JSON.stringify(a)}catch(e){return String(a)}})();console.log=(...a)=>__l.push(a.map(__f).join(" "));`;
ENGINES.js = { file:"main.js", lang:"javascript", delay:500,
  mount(L,box){ box.innerHTML=consoleHtml; },
  run(L,code,box){
    return new Promise(resolve=>{
      const pre=L.prelude?L.prelude+"\n":"", off=1+(pre?pre.split("\n").length-1:0);
      const src=`${LOG_SHIM}
${pre}${code}
;${jsSeq(L.tests)}.then(res=>postMessage({logs:__l,res}));`;
      let w, done=false;
      const finish=(logs,res,err)=>{ if(done)return; done=true; try{w&&w.terminate()}catch(e){} resolve(jsReport(L,box,logs,res,err)); };
      try{
        w=new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));
        w.onmessage=e=>finish(e.data.logs,e.data.res,null);
        w.onerror=e=>{e.preventDefault();finish([],null,(e.message||"Chyba v kódu").replace(/^Uncaught /,"")+(e.lineno?` (řádek ${Math.max(1,e.lineno-off)})`:""))};
        setTimeout(()=>finish([],null,"Kód běžel déle než 2 s — nemáš nekonečnou smyčku?"),2000);
      }catch(e){ finish([],null,"Spouštění JavaScriptu tu není dostupné."); }
    });
  }
};

/* ---------- ENGINE: DOM — JavaScript nad stránkou v izolovaném iframu (sandbox bez přístupu k Kaskádě).
   Viditelný náhled = jen tvůj kód (můžeš klikat); testy běží ve skrytém iframu, aby ho neovlivnily. */
/* V testech čas neběží sám: setInterval se jen zapíše a test ho „posune“ přes __sekunda(n),
   requestAnimationFrame se nespouští (testy volají update/draw přímo). Díky tomu jsou hry deterministické. */
const TEST_TIME=`window.__TEST=true;window.__intervals=[];window.setInterval=(f,ms=0)=>{__intervals.push({f,ms});return __intervals.length};window.clearInterval=id=>{const i=__intervals[id-1];if(i)i.f=()=>{}};window.requestAnimationFrame=()=>0;window.__sekunda=(n=1)=>{for(let k=0;k<n;k++)for(const i of [...__intervals])for(let r=0;r<Math.max(1,Math.round(1000/Math.max(i.ms,1)));r++)i.f()};`;
function domDoc(L,code,{tests=null,nonce="",css=""}={}){
  const pre=`<!doctype html><html lang="cs"><head><meta charset="utf-8"><style>html{font:15px/1.45 system-ui,sans-serif;color:#14203a}body{margin:12px}${L.fixed||""}${css}</style></head><body>${L.html||""}
<script>${LOG_SHIM}window.__l=__l;const __send=m=>parent.postMessage({...m,nonce:${JSON.stringify(nonce)}},"*");
window.addEventListener("error",e=>__send({k:"err",msg:String(e.message).replace(/^Uncaught /,""),line:e.lineno}));
document.addEventListener("submit",e=>e.preventDefault(),true);document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("a[href]");if(a)e.preventDefault()},true);${tests?TEST_TIME:""}<\/script>${L.prelude?`\n<script>${jsSafe(L.prelude)}<\/script>`:""}
<script>`;
  const userLine=pre.split("\n").length;
  const post=`\n<\/script>`+(tests?`<script>setTimeout(()=>${jsSafe(jsSeq(tests))}.then(res=>__send({k:"res",logs:__l,res})),20);<\/script>`:"");
  return {html:pre+jsSafe(code)+post, userLine};
}
ENGINES.dom = { file:"main.js", lang:"javascript", delay:500,
  mount(L,box){ box.innerHTML=`<div class="stages${L.wide||L.boss?" wide":""}">
    <div class="stage"><div class="lab"><span>Tvůj výsledek</span><span>klikej, zkoušej</span></div><iframe class="dom-frame"${L.frame?` style="height:${L.frame}px"`:""} data-frame="mine" sandbox="allow-scripts allow-forms" title="Tvůj výsledek"></iframe></div>
    <div class="stage"><div class="lab"><span>Cíl</span><span>vzorové řešení</span></div><iframe class="dom-frame"${L.frame?` style="height:${L.frame}px"`:""} data-frame="goal" sandbox="allow-scripts allow-forms" title="Cíl"></iframe></div></div>
    <iframe data-frame="test" sandbox="allow-scripts allow-forms" hidden title="Testy"></iframe>${consoleHtml}`;
    box.querySelector('[data-frame="goal"]').srcdoc=domDoc(L,L.solution).html; },
  run(L,code,box){
    // pozor: testy volají funkce z kódu → spouštíme je jako sekvenci (act + expr), stav se mezi testy nemaže
    box.querySelector('[data-frame="mine"]').srcdoc=domDoc(L,code).html;
    return new Promise(resolve=>{
      const nonce=Math.random().toString(36).slice(2), fr=box.querySelector('[data-frame="test"]');
      const {html,userLine}=domDoc(L,code,{tests:L.tests,nonce}); let done=false, err=null;
      const finish=(logs,res,e)=>{ if(done)return; done=true; window.removeEventListener("message",on); resolve(jsReport(L,box,logs,res,e)); };
      const on=e=>{ const d=e.data; if(!d||d.nonce!==nonce||e.source!==fr.contentWindow) return;
        if(d.k==="err"&&!err) err=d.msg+(d.line>=userLine?` (řádek ${d.line-userLine+1})`:"");
        if(d.k==="res") finish(d.logs,d.res,err); };
      window.addEventListener("message",on);
      fr.srcdoc=html;
      setTimeout(()=>finish([],null,err||"Kód běžel déle než 2 s — nemáš nekonečnou smyčku?"),2500);
    });
  }
};

/* =====================================================================
   KURZY
   ===================================================================== */
const COURSES=[];
function registerCourse(c){ c.levels=c.levels||[]; c.modules=c.modules||[]; c.achievements=c.achievements||[]; COURSES.push(c); return c; }
const course=id=>COURSES.find(c=>c.id===id);
/* Přidá úrovně do už registrovaného kurzu (soubory src/courses/<kurz>/NN-modul.js) */
function addLevels(cid,arr){ course(cid).levels.push(...arr); }

