/* =====================================================================
   EDITOR — zvýraznění kódu, našeptávání, párové závorky, lišta symbolů
   Bez knihoven: <textarea> (psaní, výběr, undo) + <pre> pod ní (barvy).
   Barvy odpovídají anatomii pravidla: selektor modře, vlastnost zeleně,
   hodnota oranžově, závorky a interpunkce žlutě.
   ===================================================================== */
const ED={ta:null,hl:null,lang:"css",L:null,pop:null,items:[],sel:0,ctx:null,onChange:null};

/* ---------- zvýraznění ---------- */
function hlCss(src){
  let out="", i=0, depth=0, afterColon=false, parenDepth=0; const n=src.length;
  const push=(cls,t)=>{ out+=cls?`<span class="t-${cls}">${esc(t)}</span>`:esc(t); };
  const blockStack=[]; // "rule" | "at" | "kf"
  const inDecl=()=>blockStack.length&&blockStack[blockStack.length-1]!=="at"&&blockStack[blockStack.length-1]!=="kf";
  while(i<n){
    const ch=src[i];
    if(ch==="/"&&src[i+1]==="*"){ const e=src.indexOf("*/",i+2); const j=e<0?n:e+2; push("com",src.slice(i,j)); i=j; continue; }
    if(ch==='"'||ch==="'"){ let j=i+1; while(j<n&&src[j]!==ch&&src[j]!=="\n") j++; j=Math.min(n,j+1); push("str",src.slice(i,j)); i=j; continue; }
    if(ch==="{"){ push("pun",ch); i++; afterColon=false; continue; }
    if(ch==="}"){ push("pun",ch); blockStack.pop(); i++; afterColon=false; continue; }
    if(ch===";"){ push("pun",ch); i++; afterColon=false; continue; }
    if(/\s/.test(ch)){ let j=i; while(j<n&&/\s/.test(src[j])) j++; push("",src.slice(i,j)); i=j; continue; }
    if(afterColon){ // hodnota
      if(ch==="#"&&/[0-9a-f]/i.test(src[i+1]||"")){ const m=/^#[0-9a-f]{3,8}\b/i.exec(src.slice(i)); if(m){ out+=`<span class="t-val t-hex" style="--sw:${m[0]}">${m[0]}</span>`; i+=m[0].length; continue; } }
      const num=/^-?(\d+\.?\d*|\.\d+)([a-z%]+)?/i.exec(src.slice(i)); if(num&&!/[a-z-]/i.test(src[i-1]||"")){ push("num",num[0]); i+=num[0].length; continue; }
      const fn=/^[a-z-]+(?=\()/i.exec(src.slice(i)); if(fn){ push("fn",fn[0]); i+=fn[0].length; continue; }
      if(ch==="!"){ const m=/^!important/i.exec(src.slice(i)); if(m){ push("imp",m[0]); i+=m[0].length; continue; } }
      if(/[(),/]/.test(ch)){ push("pun2",ch); i++; continue; }
      const w=/^[^\s;{}(),/"']+/.exec(src.slice(i)); push("val",w[0]); i+=w[0].length; continue;
    }
    // začátek příkazu: at-rule, selektor nebo vlastnost
    let j=i, par=0; while(j<n){ const c=src[j]; if(c==="("){par++} else if(c===")"){par--} else if(par<=0&&(c==="{"||c===";"||c==="}")) break; else if(c==="/"&&src[j+1]==="*") break; j++; }
    const stmt=src.slice(i,j), end=src[j];
    if(stmt.startsWith("@")){ const m=/^@[\w-]+/.exec(stmt); push("at",m[0]); push("sel",stmt.slice(m[0].length)); i=j; if(end==="{") blockStack.push(/^@(-webkit-)?keyframes/.test(m[0])?"kf":"at"); continue; }
    if(end==="{"){ push("sel",stmt); i=j; blockStack.push(blockStack[blockStack.length-1]==="kf"?"kff":"rule"); continue; }
    const ci=stmt.indexOf(":");
    if(inDecl()&&ci>0&&!/[{]/.test(stmt)){ push(stmt.slice(0,ci).trim().startsWith("--")?"var":"prop",stmt.slice(0,ci)); push("pun",":"); i+=ci+1; afterColon=true; continue; }
    push(blockStack.length?"prop":"sel",stmt); i=j;
  }
  return out;
}
function hlHtml(src){
  return esc(src).replace(/(&lt;\/?)([a-zA-Z0-9-]+)([\s\S]*?)(\/?&gt;)/g,(m,a,tag,attrs,b)=>
    `<span class="t-pun">${a}</span><span class="t-sel">${tag}</span>${attrs.replace(/([a-zA-Z-]+)(=)(&quot;[^&]*?&quot;|"[^"]*")/g,'<span class="t-prop">$1</span><span class="t-pun">$2</span><span class="t-val">$3</span>')}<span class="t-pun">${b}</span>`)
    .replace(/&lt;!--[\s\S]*?--&gt;/g,m=>`<span class="t-com">${m}</span>`);
}
const JS_KW=/\b(const|let|var|function|return|if|else|for|of|in|while|new|class|true|false|null|undefined|this|break|continue|switch|case|default|typeof|async|await)\b/g;
function hlJs(src){
  let out=""; const re=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([^]+?)/g; let m;
  while((m=re.exec(src))){ if(m[1]) out+=`<span class="t-com">${esc(m[1])}</span>`; else if(m[2]) out+=`<span class="t-str">${esc(m[2])}</span>`; else if(m[3]) out+=`<span class="t-num">${m[3]}</span>`;
    else if(m[4]) out+=JS_KW.test(m[4])?(JS_KW.lastIndex=0,`<span class="t-at">${m[4]}</span>`):`<span class="t-fn">${m[4]}</span>`; else out+=esc(m[5]).replace(JS_KW,'<span class="t-at">$1</span>'); JS_KW.lastIndex=0; }
  return out;
}
function edRefresh(){
  if(!ED.ta||!ED.hl||!ED.ta.isConnected) return;
  const v=ED.ta.value, f=ED.lang==="css"?hlCss:ED.lang==="html"?hlHtml:ED.lang==="javascript"?hlJs:esc;
  ED.hl.innerHTML=f(v)+"\n ";
  edSync();
}
function edSync(){ if(!ED.hl) return; ED.hl.scrollTop=ED.ta.scrollTop; ED.hl.scrollLeft=ED.ta.scrollLeft; const g=ED.ta.closest(".ed-body")?.querySelector(".gutter"); if(g) g.scrollTop=ED.ta.scrollTop; }

/* ---------- našeptávač: slovník ---------- */
const PROP_CZ={color:"barva textu","background-color":"barva pozadí",background:"pozadí (barva, obrázek, přechod)","font-size":"velikost písma","font-weight":"tloušťka písma","font-family":"písmo","font-style":"kurzíva","line-height":"výška řádku","letter-spacing":"mezery mezi písmeny","text-align":"zarovnání textu","text-decoration":"podtržení","text-transform":"velká / malá písmena",margin:"vnější odsazení",padding:"vnitřní odsazení",border:"rámeček","border-radius":"zaoblení rohů",width:"šířka",height:"výška","max-width":"maximální šířka","min-height":"minimální výška",display:"způsob rozložení (flex, grid…)",gap:"mezera mezi položkami",position:"pozicování","top":"odsazení shora (u pozicovaných)","right":"odsazení zprava","bottom":"odsazení zdola","left":"odsazení zleva",inset:"top/right/bottom/left najednou","z-index":"pořadí vrstev",opacity:"průhlednost",transform:"posun, otočení, zvětšení",transition:"plynulý přechod",animation:"animace","box-shadow":"stín",overflow:"co s přetékajícím obsahem","justify-content":"rozložení na hlavní ose","align-items":"zarovnání na příčné ose","flex-direction":"směr flexu (řada/sloupec)","flex-wrap":"zalamování položek",flex:"jak položka roste a zmenšuje se","grid-template-columns":"sloupce mřížky","grid-template-rows":"řádky mřížky","grid-template-areas":"pojmenované oblasti","grid-column":"sloupce, které položka zabere","grid-row":"řádky, které položka zabere","grid-area":"oblast mřížky","grid-auto-rows":"výška automatických řádků","box-sizing":"jak se počítá šířka","object-fit":"ořez obrázku","aspect-ratio":"poměr stran",outline:"obrys (fokus)",cursor:"kurzor myši",content:"obsah ::before/::after","white-space":"zalamování textu","max-height":"maximální výška","min-width":"minimální šířka","align-self":"zarovnání jedné položky","justify-self":"zarovnání v buňce","place-items":"zarovnání v obou osách","flex-grow":"jak moc položka roste","flex-shrink":"jak moc se zmenšuje","flex-basis":"výchozí velikost položky","row-gap":"mezera mezi řádky","column-gap":"mezera mezi sloupci","text-wrap":"způsob zalamování","container-type":"kontejner pro @container","backdrop-filter":"efekt na pozadí za prvkem",filter:"filtr (rozmazání, jas…)","font-variant-numeric":"styl číslic","vertical-align":"svislé zarovnání v řádku",visibility:"viditelnost","list-style":"odrážky seznamu","text-shadow":"stín textu","transition-duration":"délka přechodu","animation-delay":"zpoždění animace","scroll-snap-type":"zarážky rolování","scroll-snap-align":"kam se položka zarovná","accent-color":"barva formulářových prvků","color-scheme":"světlé / tmavé schéma"};
const COMMON_ORDER=Object.keys(PROP_CZ);
const COLORS=["transparent","white","black","red","tomato","orange","gold","yellow","green","teal","navy","blue","purple","pink","gray","currentColor"];
const VALS={display:["flex","grid","block","inline-block","inline","none","inline-flex","contents"],position:["relative","absolute","fixed","sticky","static"],"text-align":["left","center","right","justify","start","end"],"justify-content":["flex-start","center","flex-end","space-between","space-around","space-evenly","start","end"],"align-items":["stretch","center","flex-start","flex-end","baseline","start","end"],"align-self":["auto","stretch","center","flex-start","flex-end"],"justify-self":["stretch","center","start","end"],"place-items":["center","start","end","stretch"],"flex-direction":["row","column","row-reverse","column-reverse"],"flex-wrap":["wrap","nowrap","wrap-reverse"],"font-weight":["400","500","600","700","800","normal","bold"],"font-style":["normal","italic"],"text-decoration":["none","underline","line-through"],"text-transform":["uppercase","lowercase","capitalize","none"],"box-sizing":["border-box","content-box"],overflow:["hidden","auto","scroll","visible","clip"],"overflow-x":["auto","hidden","scroll"],"object-fit":["cover","contain","fill","none"],cursor:["pointer","default","text","not-allowed","grab"],"white-space":["nowrap","normal","pre","pre-wrap"],visibility:["visible","hidden"],"list-style":["none","disc","decimal"],"text-wrap":["balance","pretty","wrap","nowrap"],"container-type":["inline-size","size","normal"],"scroll-snap-type":["x mandatory","y mandatory","x proximity"],"scroll-snap-align":["start","center","end"],"vertical-align":["middle","top","bottom","baseline"],"font-variant-numeric":["tabular-nums","normal"],"color-scheme":["light dark","light","dark"],"font-family":["system-ui, sans-serif","Georgia, serif","ui-monospace, monospace","\"Inter\", sans-serif"],"grid-template-columns":["repeat(3, 1fr)","1fr 1fr","200px 1fr","repeat(auto-fit, minmax(160px, 1fr))"],"grid-column":["span 2","1 / 3","1 / -1"],"grid-row":["span 2","1 / 3"],"aspect-ratio":["16 / 9","4 / 3","1"],transition:["all 200ms ease","opacity 200ms ease","transform 200ms ease"],border:["1px solid #cbd5e1","2px solid currentColor","none"],"box-shadow":["0 4px 12px rgba(0, 0, 0, 0.15)","none"],"border-radius":["8px","12px","50%","999px"],margin:["0","0 auto","16px"],padding:["16px","8px 16px","24px"],width:["100%","auto","fit-content","200px"],height:["100%","auto","200px"],"max-width":["100%","60ch","1200px"],gap:["8px","16px","24px"],inset:["0"],opacity:["0.5","1","0"],"z-index":["1","10","100"],transform:["translateY(-4px)","scale(1.05)","rotate(-3deg)"],animation:["pulse 1.5s infinite"],flex:["1","0 0 auto","1 1 0"],"font-size":["16px","24px","2rem","clamp(1.5rem, 4vw, 3rem)"],"line-height":["1.5","1.2","1.6"],"letter-spacing":["0.02em","-0.02em"],content:['""','"→"']};
const COLOR_PROP=/(^|-)color$|^background$|^border(-top|-right|-bottom|-left)?$|^outline$|^fill$|^stroke$/;

function edContext(){
  const ta=ED.ta, pos=ta.selectionStart, before=ta.value.slice(0,pos);
  let depth=0,paren=0,stmtStart=0,inStr=null,stack=[];
  for(let i=0;i<before.length;i++){ const c=before[i];
    if(inStr){ if(c===inStr) inStr=null; continue; }
    if(c==="/"&&before[i+1]==="*"){ const e=before.indexOf("*/",i+2); if(e<0) return null; i=e+1; stmtStart=i+1; continue; }
    if(c==='"'||c==="'"){ inStr=c; continue; }
    if(c==="("){paren++;continue} if(c===")"){paren--;continue} if(paren>0) continue;
    if(c==="{"){ stack.push(before.slice(stmtStart,i).trim()); stmtStart=i+1; } else if(c==="}"){ stack.pop(); stmtStart=i+1; } else if(c===";"){ stmtStart=i+1; } }
  if(inStr||paren>0&&!/:/.test(before.slice(stmtStart))) return null;
  const stmt=before.slice(stmtStart), parent=stack[stack.length-1]||"";
  const declCtx=stack.length&&!parent.startsWith("@media")&&!parent.startsWith("@container")&&!parent.startsWith("@supports")&&!parent.startsWith("@layer")&&!parent.startsWith("@scope")&&!/^@(-webkit-)?keyframes/.test(parent);
  const ci=stmt.indexOf(":");
  if(declCtx&&ci>=0&&!/^\s*&/.test(stmt)){ const prop=stmt.slice(0,ci).trim().toLowerCase(); const m=/[\w#.-]*$/.exec(stmt.slice(ci+1)); return {kind:"val",prop,token:m[0],start:pos-m[0].length}; }
  if(declCtx&&!/[.#&:\[>~+*\s]/.test(stmt.trim())){ const m=/[\w-]*$/.exec(stmt); return {kind:"prop",token:m[0],start:pos-m[0].length}; }
  if(!declCtx||/^\s*[.&#]/.test(stmt)){ const m=/[\w.#-]*$/.exec(stmt); if(stmt.trim().startsWith("@")) return null; return {kind:"sel",token:m[0],start:pos-m[0].length}; }
  return null;
}
function levelSelectors(L){
  const out=new Map(); if(!L?.html) return [];
  const t=document.createElement("template"); t.innerHTML=L.html;
  for(const el of t.content.querySelectorAll("*")){ for(const c of el.classList) if(!out.has("."+c)) out.set("."+c,`třída na &lt;${el.localName}&gt;`); if(el.id) out.set("#"+el.id,`id na &lt;${el.localName}&gt;`); if(!out.has(el.localName)) out.set(el.localName,"všechny &lt;"+el.localName+"&gt;"); }
  return [...out].map(([v,d])=>({v,d}));
}
function edSuggest(ctx,force){
  const tk=ctx.token.toLowerCase(); let list=[];
  if(ctx.kind==="prop"){ if(!tk&&!force) return [];
    const all=[...new Set([...COMMON_ORDER,...allProps()])].filter(p=>!p.startsWith("-webkit")&&CSS.supports(p,"inherit"));
    list=all.filter(p=>p.startsWith(tk)).map(p=>({v:p,d:PROP_CZ[p]||""}));
    if(list.length<6) list=list.concat(all.filter(p=>!p.startsWith(tk)&&p.includes(tk)&&tk.length>2).map(p=>({v:p,d:PROP_CZ[p]||""})));
  } else if(ctx.kind==="val"){
    let vals=VALS[ctx.prop]||[]; if(COLOR_PROP.test(ctx.prop)) vals=vals.concat(COLORS);
    if(!vals.length&&!force) return [];
    vals=vals.filter(v=>{ try{ return CSS.supports(ctx.prop,v); }catch(e){ return true; } });
    list=vals.filter(v=>v.toLowerCase().startsWith(tk)&&v.toLowerCase()!==tk).map(v=>({v,d:"",col:COLOR_PROP.test(ctx.prop)&&!/ /.test(v)?v:""}));
  } else if(ctx.kind==="sel"){ if(!tk&&!force) return [];
    list=levelSelectors(ED.L).filter(s=>s.v.toLowerCase().startsWith(tk)&&s.v.toLowerCase()!==tk);
  }
  return list.slice(0,8);
}

/* ---------- našeptávač: okno ---------- */
function caretXY(){
  const ta=ED.ta, pos=ta.selectionStart, lines=ta.value.slice(0,pos).split("\n"), cs=getComputedStyle(ta);
  if(!ED.cw){ const s=document.createElement("span"); s.textContent="0000000000"; s.style.cssText=`font:${cs.fontSize} ${cs.fontFamily};position:absolute;visibility:hidden;white-space:pre`; document.body.append(s); ED.cw=s.getBoundingClientRect().width/10; s.remove(); }
  const lh=parseFloat(cs.lineHeight), x=parseFloat(cs.paddingLeft)+lines[lines.length-1].length*ED.cw-ta.scrollLeft, y=parseFloat(cs.paddingTop)+lines.length*lh-ta.scrollTop;
  return {x,y};
}
function edOpen(force){
  if(ED.lang!=="css") return edClose();
  const ctx=edContext(); if(!ctx) return edClose();
  const items=edSuggest(ctx,force); if(!items.length) return edClose();
  ED.ctx=ctx; ED.items=items; ED.sel=0;
  if(!ED.pop){ ED.pop=document.createElement("ul"); ED.pop.className="ac"; ED.pop.setAttribute("role","listbox"); ED.ta.parentElement.append(ED.pop);
    ED.pop.addEventListener("pointerdown",e=>{ const li=e.target.closest("li"); if(!li) return; e.preventDefault(); ED.sel=+li.dataset.i; edAccept(); }); }
  ED.pop.innerHTML=items.map((it,k)=>`<li role="option" data-i="${k}" class="${k===0?"on":""}">${it.col?`<i style="background:${it.col}"></i>`:""}<b>${esc(it.v)}</b>${it.d?`<span>${it.d}</span>`:""}</li>`).join("")+`<li class="ac-hint">Tab / Enter vloží · Esc zavře</li>`;
  const {x,y}=caretXY(), w=ED.ta.parentElement.clientWidth; ED.pop.style.left=Math.max(4,Math.min(x,w-260))+"px"; ED.pop.style.top=(y+2)+"px"; ED.pop.hidden=false;
}
function edClose(){ if(ED.pop) ED.pop.hidden=true; ED.items=[]; }
function edMove(d){ ED.sel=(ED.sel+d+ED.items.length)%ED.items.length; ED.pop.querySelectorAll("li[data-i]").forEach((li,k)=>li.classList.toggle("on",k===ED.sel)); }
function edInsert(text,selectFrom,selectTo){ // nahradí výběr / rozsah a pošle změnu
  const ta=ED.ta; const s=selectFrom??ta.selectionStart, e=selectTo??ta.selectionEnd;
  ta.setRangeText(text,s,e,"end"); ED.onChange&&ED.onChange(); edRefresh();
}
function edAccept(){
  const it=ED.items[ED.sel], ctx=ED.ctx, ta=ED.ta; if(!it) return;
  const end=ta.selectionStart, rest=ta.value.slice(end).split("\n")[0];
  if(ctx.kind==="prop"){ const after=rest.trimStart().startsWith(":")?"":": "; edInsert(it.v+after,ctx.start,end); edClose(); setTimeout(()=>edOpen(true),0); return; }
  if(ctx.kind==="val"){ const semi=/^\s*$/.test(rest)?";":""; edInsert(it.v+semi,ctx.start,end); edClose(); return; }
  if(ctx.kind==="sel"){
    if(/^\s*$/.test(rest)){ const ind=(/^[ \t]*/.exec(ta.value.slice(0,ctx.start).split("\n").pop())||[""])[0]; edInsert(it.v+" {\n"+ind+"  \n"+ind+"}",ctx.start,end); ta.selectionStart=ta.selectionEnd=ctx.start+it.v.length+3+ind.length+2; }
    else edInsert(it.v,ctx.start,end);
    edClose(); return; }
}

/* ---------- klávesy: párování, odsazení ---------- */
const PAIRS={"{":"}","(":")",'"':'"',"'":"'","[":"]"};
function edKey(e,opts){
  const ta=ED.ta, s=ta.selectionStart, en=ta.selectionEnd, v=ta.value, prev=v[s-1], next=v[s];
  if(ED.items.length&&!ED.pop.hidden){
    if(e.key==="ArrowDown"){e.preventDefault();return edMove(1)} if(e.key==="ArrowUp"){e.preventDefault();return edMove(-1)}
    if(e.key==="Enter"||e.key==="Tab"){e.preventDefault();return edAccept()} if(e.key==="Escape"){e.preventDefault();return edClose()}
  }
  if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){ e.preventDefault(); return opts.onSubmit&&opts.onSubmit(); }
  if(e.key===" "&&e.ctrlKey){ e.preventDefault(); return edOpen(true); }
  if(e.key==="Tab"){ e.preventDefault();
    if(e.shiftKey){ const ls=v.lastIndexOf("\n",s-1)+1; if(v.slice(ls,ls+2)==="  "){ ta.setRangeText("",ls,ls+2,"preserve"); ta.selectionStart=ta.selectionEnd=Math.max(ls,s-2); ED.onChange(); edRefresh(); } return; }
    return edInsert("  "); }
  if(e.key==="Enter"&&!e.shiftKey&&!e.altKey){ e.preventDefault();
    const line=v.slice(0,s).split("\n").pop(), ind=/^[ \t]*/.exec(line)[0];
    if(prev==="{"&&next==="}"){ edInsert("\n"+ind+"  \n"+ind); ta.selectionStart=ta.selectionEnd=s+1+ind.length+2; return; }
    return edInsert("\n"+ind+(prev==="{"?"  ":"")); }
  if(e.key==="Backspace"&&s===en&&prev&&PAIRS[prev]===next){ e.preventDefault(); return edInsert("",s-1,s+1); }
  if(e.key==="Backspace"&&s===en&&s>=2&&/\n[ \t]*$/.test(v.slice(0,s))&&v.slice(s-2,s)==="  "){ e.preventDefault(); return edInsert("",s-2,s); }
  if(e.key.length===1&&!e.metaKey&&!e.ctrlKey){
    const k=e.key;
    if((k==="}"||k===")"||k==="]"||k==='"'||k==="'")&&next===k&&s===en){ e.preventDefault(); ta.selectionStart=ta.selectionEnd=s+1; return; }
    if(k==="}"){ const ls=v.lastIndexOf("\n",s-1)+1; if(/^\s+$/.test(v.slice(ls,s))&&v.slice(ls,s).length>=2){ e.preventDefault(); return edInsert("}",s-2,s); } }
    if(PAIRS[k]&&s===en&&(!next||/[\s;),}\]]/.test(next))){ if((k==='"'||k==="'")&&/\w/.test(prev||"")) return;
      e.preventDefault(); edInsert(k+PAIRS[k]); ta.selectionStart=ta.selectionEnd=s+1; return; }
    if(PAIRS[k]&&s!==en){ e.preventDefault(); const sel=v.slice(s,en); edInsert(k+sel+PAIRS[k]); ta.selectionStart=s+1; ta.selectionEnd=s+1+sel.length; return; }
  }
}

/* ---------- lišta symbolů (dotyková zařízení) ---------- */
const SYMS=["{ }",":",";",".","#","(",")","px","%","\"","-","Tab"];
function symbarHtml(lang){ if(lang!=="css") return ""; return `<div class="symbar" role="toolbar" aria-label="Vložit znak">${SYMS.map(s=>`<button type="button" data-sym="${esc(s)}">${esc(s)}</button>`).join("")}<button type="button" data-sym="ac" class="ac-btn">Doplnit</button></div>`; }
function edSym(s){ const ta=ED.ta; ta.focus();
  if(s==="ac") return edOpen(true); if(s==="Tab") return edInsert("  ");
  if(s==="{ }"){ const st=ta.selectionStart; const line=ta.value.slice(0,st).split("\n").pop(), ind=/^[ \t]*/.exec(line)[0]; edInsert(" {\n"+ind+"  \n"+ind+"}"); ta.selectionStart=ta.selectionEnd=st+4+ind.length; return; }
  if(s==="(") { const st=ta.selectionStart; edInsert("()"); ta.selectionStart=ta.selectionEnd=st+1; return; }
  if(s==="\""){ const st=ta.selectionStart; edInsert('""'); ta.selectionStart=ta.selectionEnd=st+1; return; }
  if(s===":"){ edInsert(": "); return edOpen(true); }
  edInsert(s); if(s===";"||s==="px"||s==="%") edClose(); else edOpen(false);
}

/* ---------- zapojení ---------- */
function setupEditor(ta,lang,L,opts){
  ED.ta=ta; ED.hl=ta.parentElement.querySelector(".hl"); ED.lang=lang; ED.L=L; ED.pop=null; ED.items=[]; ED.onChange=opts.onChange;
  ta.addEventListener("input",e=>{ opts.onChange(); edRefresh();
    if(lang==="css"&&(e.inputType==="insertText"||e.inputType==="deleteContentBackward")) edOpen(false); else edClose(); });
  ta.addEventListener("keydown",e=>edKey(e,opts));
  ta.addEventListener("scroll",edSync);
  ta.addEventListener("blur",()=>setTimeout(()=>{ if(document.activeElement!==ta) edClose(); },120));
  ta.addEventListener("click",()=>edClose());
  new ResizeObserver(edSync).observe(ta);
  const bar=ta.closest(".editor").querySelector(".symbar");
  if(bar) bar.addEventListener("pointerdown",e=>{ const b=e.target.closest("[data-sym]"); if(!b) return; e.preventDefault(); edSym(b.dataset.sym); });
  edRefresh();
}
