/* =====================================================================
   TRÉNINK — výzva dne, rychlokvíz „předpověz výsledek“, hřiště
   ===================================================================== */

/* ---------- kvíz: přečti CSS a vyber, jak bude vypadat ----------
   Každá otázka: html (stejné pro všechny možnosti), fixed (základní styl),
   css (správně) a wrong (3 věrohodné chyby). Náhledy se vykreslují živě. */
const QUIZ_BASE=`.row{display:flex;gap:6px;background:#eef2f7;padding:6px;border-radius:8px;height:64px;box-sizing:border-box}.i{width:34px;background:#8cb6c0;border-radius:5px;display:grid;place-items:center;font:700 12px system-ui;color:#14203a}`;
const QR=n=>`<div class="row">${Array.from({length:n},(_,k)=>`<div class="i">${k+1}</div>`).join("")}</div>`;
const QUIZ=[
  { id:"q-jc", topic:"Flexbox", html:QR(3), fixed:QUIZ_BASE, css:`.row {\n  justify-content: space-between;\n}`,
    wrong:[`.row{justify-content:center}`,`.row{justify-content:flex-end}`,`.row{justify-content:space-evenly}`], why:"space-between dá krajní položky ke krajům a volné místo rozdělí jen mezi ně." },
  { id:"q-ai", topic:"Flexbox", html:`<div class="row"><div class="i" style="height:20px">1</div><div class="i" style="height:44px">2</div><div class="i" style="height:30px">3</div></div>`, fixed:QUIZ_BASE, css:`.row {\n  align-items: flex-end;\n}`,
    wrong:[`.row{align-items:flex-start}`,`.row{align-items:center}`,`.row{align-items:stretch}.i{height:auto!important}`], why:"align-items pracuje na příčné ose (u řady svisle). flex-end srovná položky ke spodnímu okraji." },
  { id:"q-dir", topic:"Flexbox", html:QR(3), fixed:QUIZ_BASE+`.row{height:auto}.i{height:16px}`, css:`.row {\n  flex-direction: column-reverse;\n}`,
    wrong:[`.row{flex-direction:column}`,`.row{flex-direction:row-reverse}`,`.row{flex-direction:row}`], why:"column skládá pod sebe, -reverse otočí pořadí: 3 je nahoře." },
  { id:"q-wrap", topic:"Flexbox", html:QR(7), fixed:QUIZ_BASE+`.row{height:auto;width:170px}.i{flex:none;height:22px}`, css:`.row {\n  flex-wrap: wrap;\n}`,
    wrong:[`.row{flex-wrap:nowrap;overflow:hidden}`,`.row{flex-direction:column}`,`.row{flex-wrap:wrap-reverse}`], why:"wrap pošle položky, které se nevejdou, na další řádek ve výchozím pořadí." },
  { id:"q-fr", topic:"Grid", html:`<div class="g"><div class="i">A</div><div class="i">B</div></div>`, fixed:`.g{display:grid;gap:6px;background:#eef2f7;padding:6px;border-radius:8px}.i{height:40px;background:#f3b184;border-radius:5px;display:grid;place-items:center;font:700 12px system-ui}`, css:`.g {\n  grid-template-columns: 1fr 3fr;\n}`,
    wrong:[`.g{grid-template-columns:3fr 1fr}`,`.g{grid-template-columns:1fr 1fr}`,`.g{grid-template-columns:1fr}`], why:"1fr 3fr = volné místo se rozdělí na 4 díly, první sloupec dostane 1, druhý 3." },
  { id:"q-span", topic:"Grid", html:`<div class="g">${["A","B","C","D","E"].map(t=>`<div class="i">${t}</div>`).join("")}</div>`, fixed:`.g{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;background:#eef2f7;padding:6px;border-radius:8px}.i{height:26px;background:#f3b184;border-radius:5px;display:grid;place-items:center;font:700 11px system-ui}.i:first-child{background:#14203a;color:#fff}`, css:`.i:first-child {\n  grid-column: 2 / 4;\n}`,
    wrong:[`.i:first-child{grid-column:span 2}`,`.i:first-child{grid-column:1 / -1}`,`.i:first-child{grid-row:span 2}`], why:"2 / 4 = od čáry 2 do čáry 4, tedy sloupce 2 a 3. První sloupec v prvním řádku zůstane prázdný." },
  { id:"q-box", topic:"Box model", html:`<div class="wrap"><div class="c">Karta</div></div>`, fixed:`.wrap{background:#eef2f7;padding:4px;border-radius:8px}.c{background:#b9c77a;font:700 12px system-ui;border-radius:6px}`, css:`.c {\n  margin: 16px;\n}`,
    wrong:[`.c{padding:16px}`,`.c{border:16px solid #14203a}`,`.c{margin:16px;padding:16px}`], why:"margin je vnější odsazení — zelená karta zůstane malá a odsune se od okrajů šedého rodiče." },
  { id:"q-pos", topic:"Pozicování", html:`<div class="card"><span class="b">NEW</span>Karta</div>`, fixed:`.card{position:relative;height:56px;background:#eef2f7;border-radius:8px;padding:8px;font:700 12px system-ui;box-sizing:border-box}.b{background:#e11d48;color:#fff;font-size:10px;padding:2px 5px;border-radius:99px}`, css:`.b {\n  position: absolute;\n  bottom: 6px;\n  right: 6px;\n}`,
    wrong:[`.b{position:absolute;top:6px;right:6px}`,`.b{position:absolute;bottom:6px;left:6px}`,`.b{position:relative;bottom:6px;right:6px}`], why:"absolute + bottom/right = pravý dolní roh nejbližšího pozicovaného předka." },
  { id:"q-spec", topic:"Specificita", html:`<p id="a"><span class="x">Ahoj</span></p>`, fixed:`p{margin:0;font:800 22px system-ui;padding:8px}`, css:`#a .x { color: crimson; }\n.x { color: royalblue; }`,
    wrong:[`.x{color:royalblue}`,`.x{color:#14203a}`,`.x{color:seagreen}`], why:"#a .x má vyšší specificitu (1,1,0) než .x (0,1,0), takže vyhraje, i když je v kódu dřív." },
  { id:"q-casc", topic:"Kaskáda", html:`<p class="t">Ahoj</p>`, fixed:`p{margin:0;font:800 22px system-ui;padding:8px}`, css:`.t { color: royalblue; }\n.t { color: crimson; }`,
    wrong:[`.t{color:royalblue}`,`.t{color:#14203a}`,`.t{color:seagreen}`], why:"Stejná specificita = vyhraje pravidlo, které je v kódu později." },
  { id:"q-nth", topic:"Selektory", html:`<ul class="l">${[1,2,3,4,5,6].map(n=>`<li>${n}</li>`).join("")}</ul>`, fixed:`.l{list-style:none;margin:0;padding:0;display:flex;gap:4px}.l li{width:26px;height:26px;display:grid;place-items:center;background:#eef2f7;border-radius:5px;font:700 11px system-ui}`, css:`li:nth-child(3n) {\n  background: #14203a;\n  color: #fff;\n}`,
    wrong:[`li:nth-child(odd){background:#14203a;color:#fff}`,`li:nth-child(even){background:#14203a;color:#fff}`,`li:nth-child(3){background:#14203a;color:#fff}`], why:"3n = každý třetí: 3 a 6." },
  { id:"q-radius", topic:"Box model", html:`<div class="s"></div>`, fixed:`.s{width:56px;height:56px;background:#f3b184;margin:4px}`, css:`.s {\n  border-radius: 50%;\n}`,
    wrong:[`.s{border-radius:12px}`,`.s{border-radius:50% 0}`,`.s{border-radius:0}`], why:"50 % u čtverce = kruh." },
  { id:"q-tf", topic:"Animace", html:`<div class="s">CSS</div>`, fixed:`.s{width:60px;height:34px;margin:16px;background:#e11d48;color:#fff;display:grid;place-items:center;font:800 12px system-ui;border-radius:6px}`, css:`.s {\n  transform: rotate(-15deg) scale(1.2);\n}`,
    wrong:[`.s{transform:rotate(15deg)}`,`.s{transform:scale(1.2)}`,`.s{transform:rotate(-15deg) scale(.7)}`], why:"rotate(-15deg) otáčí proti směru hodinových ručiček, scale(1.2) zvětší o pětinu." },
  { id:"q-z", topic:"Pozicování", html:`<div class="w"><div class="a">A</div><div class="b">B</div></div>`, fixed:`.w{position:relative;height:60px}.a,.b{position:absolute;width:70px;height:40px;border-radius:6px;display:grid;place-items:center;font:800 13px system-ui}.a{left:6px;top:4px;background:#8cb6c0}.b{left:40px;top:16px;background:#f3b184}`, css:`.a { z-index: 2; }\n.b { z-index: 1; }`,
    wrong:[`.a{z-index:1}.b{z-index:2}`,`.a{left:40px!important}.b{left:6px!important}`,`.b{display:none}`], why:"Vyšší z-index je nahoře, takže A překryje B, i když je B v HTML později." },
  { id:"q-before", topic:"Selektory", html:`<p class="t">Hotovo</p>`, fixed:`p{margin:0;font:700 18px system-ui;padding:8px}`, css:`.t::before {\n  content: "✓ ";\n  color: seagreen;\n}`,
    wrong:[`.t::after{content:" ✓";color:seagreen}`,`.t{color:seagreen}`,`.t::before{content:"✗ ";color:crimson}`], why:"::before vkládá obsah před text prvku." },
  { id:"q-gap", topic:"Grid", html:`<div class="g">${[1,2,3,4].map(n=>`<div class="i">${n}</div>`).join("")}</div>`, fixed:`.g{display:grid;grid-template-columns:1fr 1fr;background:#eef2f7;padding:6px;border-radius:8px}.i{height:22px;background:#f3b184;border-radius:4px;display:grid;place-items:center;font:700 11px system-ui}`, css:`.g {\n  gap: 2px 20px;\n}`,
    wrong:[`.g{gap:20px 2px}`,`.g{gap:20px}`,`.g{gap:0}`], why:"gap: řádky sloupce — první hodnota je mezera mezi řádky (2px), druhá mezi sloupci (20px)." },
];
const QUIZ_DAILY_CAP=150;
function seededShuffle(arr,seed){ const a=[...arr]; let x=0; for(const c of String(seed)) x=(x*31+c.charCodeAt(0))>>>0; for(let i=a.length-1;i>0;i--){ x=(x*1103515245+12345)>>>0; const j=x%(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; }

/* ---------- výzva dne ---------- */
function dailyLevel(){
  const C=course("css"), d=cstate("css").done;
  const pool=C.levels.filter(l=>d[l.id]&&!l.project&&!/^s-/.test(l.id));
  const list=pool.length?pool:C.levels.filter((l,i)=>!l.project&&isUnlocked(C,i));
  return list.length?seededShuffle(list,today())[0]:null;
}
const dailyDone=()=>S.challenge===today();

/* ---------- obrazovka Trénink ---------- */
let QZ=null; // běžící kvíz
function renderTraining(){
  const el=$("#v-training"); const L=dailyLevel(); const C=course("css"); const m=L&&C.modules.find(x=>x.id===L.module);
  el.innerHTML=`<div class="view-head"><div><h2>Trénink</h2><p>Opakování je matka moudrosti. Každý den jedna výzva, rychlokvíz na čtení kódu a hřiště, kde si můžeš cokoli vyzkoušet bez kontrol.</p></div></div>
  <div class="train-grid">
    <section class="panel train-card daily">
      <span class="k">Výzva dne · ${new Date().toLocaleDateString("cs-CZ")}</span>
      ${L?`<h3>${esc(L.title)}</h3><p class="note">${esc(m?.name||"")} · vyřeš znovu od nuly, bez nápovědy</p>
      <p class="reward">${dailyDone()?`<span class="pill live">Splněno — vrať se zítra</span>`:`<b>+${RULES.challenge(S.streak||0)} XP</b> za čistý průchod`}</p>
      <button class="btn primary" id="dailyGo" ${dailyDone()?"disabled":""}>${dailyDone()?"Hotovo":"Přijmout výzvu"}</button>`:`<p class="note">Výzva se odemkne po první dokončené úrovni.</p>`}
      <p class="note">Splněných výzev: ${S.challenges||0}</p>
    </section>
    <section class="panel train-card">
      <span class="k">Rychlokvíz</span><h3>Předpověz výsledek</h3>
      <p class="note">8 otázek. Přečti CSS a vyber, jak bude stránka vypadat. Trénuje čtení cizího kódu — v praxi ho čteš častěji, než píšeš.</p>
      <p class="reward"><b>+10 XP</b> za správnou odpověď · rekord ${S.quizBest||0}/8</p>
      <button class="btn primary" id="quizGo">Spustit kvíz</button>
    </section>
    <section class="panel train-card">
      <span class="k">Hřiště</span><h3>Zkoušej bez kontrol</h3>
      <p class="note">Přepínače pro flexbox a grid, které rovnou píšou CSS. Nebo prázdné plátno pro vlastní HTML a CSS.</p>
      <div class="helpbar"><button class="btn" data-pg="flex">Flexbox</button><button class="btn" data-pg="grid">Grid</button><button class="btn" data-pg="free">Volné hřiště</button></div>
    </section>
  </div><div id="trainArea"></div>`;
  if($("#dailyGo")) $("#dailyGo").onclick=()=>{ UI.course="css"; saveUI(); startLevel(L.id,false,{daily:true}); };
  $("#quizGo").onclick=startQuiz;
  el.querySelectorAll("[data-pg]").forEach(b=>b.onclick=()=>openPlayground(b.dataset.pg));
}

/* ---------- kvíz ---------- */
function startQuiz(){ QZ={qs:seededShuffle(QUIZ,Date.now()).slice(0,8),k:0,score:0,answered:false}; renderQuiz(); $("#trainArea").scrollIntoView({behavior:"smooth",block:"start"}); }
function renderQuiz(){
  const area=$("#trainArea"), q=QZ.qs[QZ.k];
  if(!q){ const perfect=QZ.score===QZ.qs.length; if(S.quizDay!==today()){S.quizDay=today();S.quizXpToday=0}
    const raw=QZ.score*10+(perfect?30:0), gain=Math.max(0,Math.min(raw,QUIZ_DAILY_CAP-(S.quizXpToday||0))); S.quizXpToday=(S.quizXpToday||0)+gain;
    S.xp+=gain; S.quizBest=Math.max(S.quizBest||0,QZ.score); S.quizCorrect=(S.quizCorrect||0)+QZ.score; if(perfect) S.quizPerfect=(S.quizPerfect||0)+1;
    retroAch(); save(); renderHud();
    area.innerHTML=`<section class="panel quiz-end"><h3>${perfect?"Bez chyby!":QZ.score>=5?"Dobrá práce":"Příště líp"}</h3><p class="big">${QZ.score} / ${QZ.qs.length}</p><p>+${gain} XP${perfect&&gain?" (včetně bonusu 30 XP za bezchybný kvíz)":""}${gain<raw?` · denní strop ${QUIZ_DAILY_CAP} XP z kvízů je ${gain?"tím":""} vyčerpaný, další body zítra`:""}</p><div class="helpbar"><button class="btn primary" id="quizAgain">Další kvíz</button></div></section>`;
    $("#quizAgain").onclick=startQuiz; QZ=null; return; }
  const opts=seededShuffle([{css:q.css,ok:true},...q.wrong.map(c=>({css:c,ok:false}))],q.id+Date.now());
  QZ.opts=opts; QZ.answered=false;
  area.innerHTML=`<section class="panel quiz">
    <div class="quiz-top"><span class="k">Otázka ${QZ.k+1} z ${QZ.qs.length} · ${q.topic}</span><span class="mono">${QZ.score} bodů</span></div>
    <div class="quiz-q"><div><b>Jak bude vypadat výsledek tohohle CSS?</b><pre class="quiz-code">${hlCss(q.css)}</pre><details><summary>HTML</summary><pre class="quiz-code">${fmtHtml(q.html)}</pre></details></div>
    <div class="quiz-opts">${opts.map((o,k)=>`<button class="qopt" data-k="${k}"><span class="ql">${"ABCD"[k]}</span><span class="host qhost"></span></button>`).join("")}</div></div>
    <div class="quiz-fb" id="quizFb" hidden></div></section>`;
  area.querySelectorAll(".qhost").forEach((h,k)=>paintShadow(h,{fixed:q.fixed,css:opts[k].css,html:q.html}));
  area.querySelectorAll(".qopt").forEach(b=>b.onclick=()=>answerQuiz(+b.dataset.k));
}
function answerQuiz(k){
  if(QZ.answered) return; QZ.answered=true; const q=QZ.qs[QZ.k], ok=QZ.opts[k].ok; if(ok) QZ.score++;
  document.querySelectorAll(".qopt").forEach((b,i)=>{ b.disabled=true; if(QZ.opts[i].ok) b.classList.add("right"); else if(i===k) b.classList.add("wrong"); });
  const fb=$("#quizFb"); fb.hidden=false;
  fb.innerHTML=`<p class="${ok?"ok-line":"bad-line"}">${ok?"Správně.":"Tohle ne — správně je zvýrazněná možnost."}</p><p>${esc(q.why)}</p><button class="btn primary" id="quizNext">${QZ.k+1<QZ.qs.length?"Další otázka":"Vyhodnotit"}</button>`;
  $("#quizNext").onclick=()=>{ QZ.k++; renderQuiz(); }; $("#quizNext").focus();
}

/* ---------- hřiště ---------- */
const PG_ITEMS=n=>Array.from({length:n},(_,k)=>`<div class="item">${k+1}</div>`).join("");
const PG={
  flex:{ title:"Flexbox", fixed:`.box{background:#eef2f7;border-radius:10px;padding:10px;min-height:220px;box-sizing:border-box}.item{background:#8cb6c0;border-radius:8px;min-width:48px;min-height:40px;display:grid;place-items:center;font:700 14px system-ui;color:#14203a}.tall .item:nth-child(2){min-height:90px}.tall .item:nth-child(4){min-height:64px}`,
    controls:[["flex-direction",["row","column","row-reverse","column-reverse"]],["justify-content",["flex-start","center","flex-end","space-between","space-around","space-evenly"]],["align-items",["stretch","flex-start","center","flex-end","baseline"]],["flex-wrap",["nowrap","wrap","wrap-reverse"]]],
    defaults:{"flex-direction":"row","justify-content":"flex-start","align-items":"stretch","flex-wrap":"nowrap",gap:8,n:4,tall:true},
    css:v=>`.box {\n  display: flex;\n  flex-direction: ${v["flex-direction"]};\n  justify-content: ${v["justify-content"]};\n  align-items: ${v["align-items"]};\n  flex-wrap: ${v["flex-wrap"]};\n  gap: ${v.gap}px;\n}`,
    html:v=>`<div class="box${v.tall?" tall":""}">${PG_ITEMS(v.n)}</div>` },
  grid:{ title:"Grid", fixed:`.box{background:#eef2f7;border-radius:10px;padding:10px;min-height:220px;box-sizing:border-box}.item{background:#f3b184;border-radius:8px;min-height:44px;display:grid;place-items:center;font:700 14px system-ui;color:#14203a}.span .item:first-child{background:#14203a;color:#fff}`,
    controls:[["grid-template-columns",["repeat(3, 1fr)","1fr 2fr","200px 1fr","repeat(4, 1fr)","repeat(auto-fit, minmax(100px, 1fr))","1fr 1fr 2fr"]],["justify-items",["stretch","start","center","end"]],["align-items",["stretch","start","center","end"]],["grid-auto-flow",["row","column","dense"]]],
    defaults:{"grid-template-columns":"repeat(3, 1fr)","justify-items":"stretch","align-items":"stretch","grid-auto-flow":"row",gap:8,n:7,span:true},
    css:v=>`.box {\n  display: grid;\n  grid-template-columns: ${v["grid-template-columns"]};\n  justify-items: ${v["justify-items"]};\n  align-items: ${v["align-items"]};\n  grid-auto-flow: ${v["grid-auto-flow"]};\n  gap: ${v.gap}px;\n}${v.span?`\n\n.item:first-child {\n  grid-column: span 2;\n}`:""}`,
    html:v=>`<div class="box${v.span?" span":""}">${PG_ITEMS(v.n)}</div>` },
  free:{ title:"Volné hřiště", fixed:"", controls:[], defaults:{},
    html0:`<div class="card">\n  <h2>Ahoj, hřiště</h2>\n  <p>Tady si můžeš zkusit cokoli. Uprav HTML i CSS.</p>\n  <button class="btn">Tlačítko</button>\n</div>`,
    css:()=>`.card {\n  max-width: 320px;\n  padding: 20px;\n  border-radius: 14px;\n  background: #fff;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);\n  font-family: system-ui, sans-serif;\n}\n\n.btn {\n  background: #2f5bd3;\n  color: #fff;\n  border: 0;\n  padding: 10px 16px;\n  border-radius: 8px;\n}` },
};
let PGS=null;
function openPlayground(kind){
  const def=PG[kind]; const v={...def.defaults}; PGS={kind,v,html:kind==="free"?(()=>{try{return localStorage.getItem("kaskada.pg.html")||def.html0}catch(e){return def.html0}})():def.html(v),css:kind==="free"?(()=>{try{return localStorage.getItem("kaskada.pg.css")||def.css()}catch(e){return def.css()}})():def.css(v)};
  const area=$("#trainArea");
  const ctl=def.controls.map(([p,vals])=>`<label class="pg-c"><span>${p}</span><select data-p="${p}">${vals.map(x=>`<option${x===v[p]?" selected":""}>${x}</option>`).join("")}</select></label>`).join("")
    +(kind!=="free"?`<label class="pg-c"><span>gap: <b id="pgGapV">${v.gap}px</b></span><input type="range" min="0" max="40" value="${v.gap}" data-p="gap"></label><label class="pg-c"><span>položek: <b id="pgNV">${v.n}</b></span><input type="range" min="1" max="12" value="${v.n}" data-p="n"></label>`
    +(kind==="flex"?`<label class="pg-c chk"><input type="checkbox" data-p="tall" ${v.tall?"checked":""}> různé výšky</label>`:`<label class="pg-c chk"><input type="checkbox" data-p="span" ${v.span?"checked":""}> první přes 2 sloupce</label>`):"");
  area.innerHTML=`<section class="panel pg"><div class="pg-head"><h3>Hřiště: ${def.title}</h3><div class="helpbar"><button class="btn" id="pgCopy">Zkopírovat CSS</button>${kind!=="free"?`<button class="btn ghost" id="pgReset">Výchozí</button>`:`<button class="btn ghost" id="pgReset">Vrátit ukázku</button>`}</div></div>
    ${ctl?`<div class="pg-ctl">${ctl}</div><p class="note">Přepínače přepíšou CSS v editoru. Kód můžeš i ručně upravit — náhled se mění hned.</p>`:""}
    <div class="pg-body"><div class="editor"><div class="ed-head"><span class="dots"><i></i><i></i><i></i></span>${kind==="free"?`<span class="ed-tabs"><button type="button" class="ed-tab" id="pgTabCss" aria-selected="true">styles.css</button><button type="button" class="ed-tab" id="pgTabHtml" aria-selected="false">index.html</button></span>`:`<span>styles.css</span>`}</div>
      <div class="ed-body"><div class="gutter"></div><div class="ed-wrap"><pre class="hl" aria-hidden="true"></pre><textarea id="pgCode" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="CSS na hřišti"></textarea></div></div>${symbarHtml("css")}</div>
      <div id="pgBox"><div class="stages wide"><div class="stage"><div class="lab"><span>Náhled</span><span>živě</span></div><div class="host" data-host="mine"></div></div></div></div></div></section>`;
  const ta=$("#pgCode"); let tab="css"; ta.value=PGS.css;
  const paint=()=>{ paintShadow($("#pgBox [data-host=mine]"),{fixed:def.fixed,css:PGS.css,html:PGS.html}); drawGrids($("#pgBox")); area.querySelector(".gutter").textContent=Array.from({length:ta.value.split("\n").length},(_,k)=>k+1).join("\n"); };
  const persist=()=>{ if(kind==="free") try{localStorage.setItem("kaskada.pg.html",PGS.html);localStorage.setItem("kaskada.pg.css",PGS.css)}catch(e){} };
  setupEditor(ta,"css",{html:PGS.html},{onChange(){ if(tab==="css") PGS.css=ta.value; else PGS.html=ta.value; persist(); paint(); }});
  const prevP=P; P=null; setupStageTools($("#pgBox")); P=prevP;
  area.querySelectorAll("[data-p]").forEach(c=>c.addEventListener("input",()=>{ const p=c.dataset.p; v[p]=c.type==="checkbox"?c.checked:c.type==="range"?+c.value:c.value;
    if(p==="gap") $("#pgGapV").textContent=v.gap+"px"; if(p==="n") $("#pgNV").textContent=v.n;
    PGS.css=def.css(v); PGS.html=def.html(v); ta.value=PGS.css; ED.L={html:PGS.html}; edRefresh(); paint(); }));
  $("#pgCopy").onclick=async()=>{ if(await copyText(PGS.css)) toast(`<div><b>CSS zkopírováno</b></div>`); };
  $("#pgReset").onclick=()=>{ if(kind==="free"){ PGS.html=def.html0; PGS.css=def.css(); persist(); } openPlayground(kind); };
  if(kind==="free"){ const sw=t=>{ tab=t; $("#pgTabCss").setAttribute("aria-selected",t==="css"); $("#pgTabHtml").setAttribute("aria-selected",t==="html"); ED.lang=t==="css"?"css":"html"; ta.value=t==="css"?PGS.css:PGS.html; edRefresh(); paint(); ta.focus(); };
    $("#pgTabCss").onclick=()=>sw("css"); $("#pgTabHtml").onclick=()=>sw("html"); }
  paint(); area.scrollIntoView({behavior:"smooth",block:"start"});
  if(!S.ach.playground){ S.ach.playground=Date.now(); save(); }
}
{ const d=document.getElementById("daily"); if(d){ d.style.cursor="pointer"; d.setAttribute("role","button"); d.tabIndex=0; d.title="Otevřít Trénink"; d.addEventListener("click",()=>show("training")); d.addEventListener("keydown",e=>{ if(e.key==="Enter") show("training"); }); } }
