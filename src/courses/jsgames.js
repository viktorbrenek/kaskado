/* ----------------------------- HERNÍ DÍLNA -----------------------------
   Hry v JavaScriptu: minihry v DOMu, canvas a herní smyčka, nakonec farma od A do Z.
   Všechny úrovně běží v engine "dom" (izolovaný iframe). V testech čas neběží sám:
   setInterval se posouvá přes __sekunda(n), requestAnimationFrame se nespouští a testy
   volají update(dt) / draw() přímo — hry jsou díky tomu deterministické.
   L.continues = id předchozího kroku → hráč může navázat na svůj vlastní kód.
   L.game      = {name, emoji} → hotová hra se objeví v Arkádě na mapě kurzu. */

const GAME_CSS=`html{background:#1b1740;color:#f5f3ff;font:15px/1.45 ui-rounded,system-ui,sans-serif}body{margin:14px}
button{font:inherit;font-weight:800;padding:8px 14px;border-radius:10px;border:0;background:#facc15;color:#1b1740;cursor:pointer;box-shadow:0 3px 0 #a16207;transition:transform .08s}
button:active{transform:translateY(2px);box-shadow:0 1px 0 #a16207}button:disabled{background:#4c4675;color:#a5a0c8;box-shadow:none;cursor:not-allowed}
input{font:inherit;padding:7px 10px;border-radius:8px;border:2px solid #6d64b8;background:#2a2560;color:#fff;width:90px}
.skore{font-size:22px;font-weight:800;margin:0 0 10px}.velke{font-size:20px;padding:14px 22px}.obchod{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
[hidden]{display:none!important}`;
const CANVAS_CSS=GAME_CSS+`canvas{display:block;max-width:100%;background:#0b0a24;border-radius:10px;border:2px solid #4c4675}.tip{font-size:12px;color:#a5a0c8;margin:6px 0 0}`;
const CANVAS_HTML=`<canvas id="hra" width="320" height="200" tabindex="0"></canvas><p class="tip">Klikni do hry a ovládej šipkami.</p>`;

const P_SMYCKA=`// herní smyčka: ~60× za sekundu zavolá update(dt) a draw()
// dt = kolik sekund uběhlo od minulého snímku (třeba 0.016)
let __posledni = performance.now();
function __smycka(cas) {
  const dt = Math.min(0.05, (cas - __posledni) / 1000);
  __posledni = cas;
  if (typeof update === "function") update(dt);
  if (typeof draw === "function") draw();
  requestAnimationFrame(__smycka);
}
requestAnimationFrame(__smycka);`;
const P_KLAVESY=`// které klávesy jsou právě zmáčknuté, třeba klavesy.has("ArrowLeft")
const klavesy = new Set();
addEventListener("keydown", e => {
  klavesy.add(e.key);
  if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
});
addEventListener("keyup", e => klavesy.delete(e.key));`;
const P_KOLIZE=`// překrývají se dva obdélníky { x, y, w, h }?
const kolize = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;`;
const px=(x,y)=>`[...document.querySelector("#hra").getContext("2d").getImageData(${x},${y},1,1).data]`;

/* ---------- Klikačka ---------- */
const CLICK_HTML=`<p class="skore">🪙 <b id="mince">0</b></p><button id="klik" class="velke">⛏️ Kopat</button><div class="obchod"><button id="krumpac">Lepší krumpáč (10)</button><button id="havir">Najmout havíře (25)</button></div><p id="info"></p>`;
const CLICK_1=`let mince = 0;
const minceEl = document.querySelector("#mince");

document.querySelector("#klik").addEventListener("click", () => {
  mince += 1;
  minceEl.textContent = mince;
});`;
const CLICK_2=`let mince = 0;
let zaKlik = 1;
let cenaKrumpace = 10;
const minceEl = document.querySelector("#mince");
const krumpacBtn = document.querySelector("#krumpac");

function render() {
  minceEl.textContent = mince;
  krumpacBtn.textContent = \`Lepší krumpáč (\${cenaKrumpace})\`;
  krumpacBtn.disabled = mince < cenaKrumpace;
}

document.querySelector("#klik").addEventListener("click", () => {
  mince += zaKlik;
  render();
});

krumpacBtn.addEventListener("click", () => {
  if (mince < cenaKrumpace) return;
  mince -= cenaKrumpace;
  zaKlik++;
  cenaKrumpace *= 2;
  render();
});

render();`;
const CLICK_3=`let mince = 0;
let zaKlik = 1;
let auto = 0;
let cenaKrumpace = 10;
let cenaHavire = 25;
const minceEl = document.querySelector("#mince");
const krumpacBtn = document.querySelector("#krumpac");
const havirBtn = document.querySelector("#havir");

function render() {
  minceEl.textContent = mince;
  krumpacBtn.textContent = \`Lepší krumpáč (\${cenaKrumpace})\`;
  krumpacBtn.disabled = mince < cenaKrumpace;
  havirBtn.textContent = \`Najmout havíře (\${cenaHavire})\`;
  havirBtn.disabled = mince < cenaHavire;
  document.querySelector("#info").textContent = \`Havíři vykopou \${auto} 🪙 za sekundu\`;
}

document.querySelector("#klik").addEventListener("click", () => {
  mince += zaKlik;
  render();
});

krumpacBtn.addEventListener("click", () => {
  if (mince < cenaKrumpace) return;
  mince -= cenaKrumpace;
  zaKlik++;
  cenaKrumpace *= 2;
  render();
});

havirBtn.addEventListener("click", () => {
  if (mince < cenaHavire) return;
  mince -= cenaHavire;
  auto++;
  cenaHavire = Math.round(cenaHavire * 1.5);
  render();
});

setInterval(() => {
  mince += auto;
  render();
}, 1000);

render();`;

/* ---------- Hádej číslo ---------- */
const GUESS_HTML=`<form id="tip"><label for="cislo">Tvůj tip (1–100)</label> <input id="cislo" type="number" min="1" max="100"> <button>Hádat</button></form><p id="zprava" class="skore">Myslím si číslo od 1 do 100.</p><p>Pokusy: <b id="pokusy">0</b> / 7</p><button id="znovu" hidden>Hrát znovu</button>`;
const GUESS_1=`const tajne = 42;
let pokusy = 0;
const input = document.querySelector("#cislo");
const zprava = document.querySelector("#zprava");

document.querySelector("#tip").addEventListener("submit", e => {
  e.preventDefault();
  const tip = Number(input.value);
  pokusy++;
  if (tip < tajne) zprava.textContent = "Moje číslo je větší.";
  else if (tip > tajne) zprava.textContent = "Moje číslo je menší.";
  else zprava.textContent = "Trefa!";
  document.querySelector("#pokusy").textContent = pokusy;
  input.value = "";
});`;
const GUESS_2=`const MAX_POKUSU = 7;
let tajne;
let pokusy;
const input = document.querySelector("#cislo");
const zprava = document.querySelector("#zprava");
const znovu = document.querySelector("#znovu");

function novaHra() {
  tajne = Math.floor(Math.random() * 100) + 1;
  pokusy = 0;
  zprava.textContent = "Myslím si číslo od 1 do 100.";
  document.querySelector("#pokusy").textContent = pokusy;
  input.disabled = false;
  znovu.hidden = true;
}

function konec(text) {
  zprava.textContent = text;
  input.disabled = true;
  znovu.hidden = false;
}

document.querySelector("#tip").addEventListener("submit", e => {
  e.preventDefault();
  if (input.disabled) return;
  const tip = Number(input.value);
  pokusy++;
  document.querySelector("#pokusy").textContent = pokusy;
  input.value = "";
  if (tip === tajne) return konec("Trefa!");
  if (pokusy >= MAX_POKUSU) return konec(\`Prohra! Bylo to \${tajne}.\`);
  zprava.textContent = tip < tajne ? "Moje číslo je větší." : "Moje číslo je menší.";
});

znovu.addEventListener("click", novaHra);

novaHra();`;
const tipAct=n=>`document.querySelector("#cislo").value=${n};document.querySelector("#tip").requestSubmit()`;

/* ---------- Kámen, nůžky, papír ---------- */
const P_VITEZ=`const TAHY = ["kamen", "nuzky", "papir"];
const EMOJI = { kamen: "🪨", nuzky: "✂️", papir: "📄" };
// tvoje funkce z minulé úrovně: "hráč", "počítač" nebo "remíza"
function vitez(hrac, pocitac) {
  const PORAZI = { kamen: "nuzky", nuzky: "papir", papir: "kamen" };
  if (hrac === pocitac) return "remíza";
  return PORAZI[hrac] === pocitac ? "hráč" : "počítač";
}`;
const RPS_HTML=`<p class="skore">Ty <b id="skore">0 : 0</b> Počítač</p><div class="obchod" id="tahy"><button data-tah="kamen">🪨 Kámen</button><button data-tah="nuzky">✂️ Nůžky</button><button data-tah="papir">📄 Papír</button></div><p id="vysledek" class="skore">Vyber tah.</p>`;

/* ---------- Canvas ---------- */
const CV2=`const platno = document.querySelector("#hra");
const ctx = platno.getContext("2d");
const hrac = { x: 20, y: 80, w: 40, h: 40, vx: 120 };

function update(dt) {
  hrac.x += hrac.vx * dt;
  if (hrac.x < 0) {
    hrac.x = 0;
    hrac.vx = Math.abs(hrac.vx);
  }
  if (hrac.x + hrac.w > platno.width) {
    hrac.x = platno.width - hrac.w;
    hrac.vx = -Math.abs(hrac.vx);
  }
}

function draw() {
  ctx.clearRect(0, 0, platno.width, platno.height);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(hrac.x, hrac.y, hrac.w, hrac.h);
}`;
const CV3=`const platno = document.querySelector("#hra");
const ctx = platno.getContext("2d");
const hrac = { x: 140, y: 80, w: 40, h: 40 };
const RYCHLOST = 160; // pixelů za sekundu

function update(dt) {
  if (klavesy.has("ArrowLeft")) hrac.x -= RYCHLOST * dt;
  if (klavesy.has("ArrowRight")) hrac.x += RYCHLOST * dt;
  if (klavesy.has("ArrowUp")) hrac.y -= RYCHLOST * dt;
  if (klavesy.has("ArrowDown")) hrac.y += RYCHLOST * dt;
  hrac.x = Math.max(0, Math.min(platno.width - hrac.w, hrac.x));
  hrac.y = Math.max(0, Math.min(platno.height - hrac.h, hrac.y));
}

function draw() {
  ctx.clearRect(0, 0, platno.width, platno.height);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(hrac.x, hrac.y, hrac.w, hrac.h);
}`;
const APPLE_HEAD=`const platno = document.querySelector("#hra");
const ctx = platno.getContext("2d");
const kosik = { x: 130, y: 176, w: 60, h: 14 };
const jablko = { x: 150, y: -16, w: 16, h: 16, vy: 120 };
let skore = 0;`;
const APPLE_MOVE=`  if (klavesy.has("ArrowLeft")) kosik.x -= 220 * dt;
  if (klavesy.has("ArrowRight")) kosik.x += 220 * dt;
  kosik.x = Math.max(0, Math.min(platno.width - kosik.w, kosik.x));`;
const APPLE_DRAW=`  ctx.clearRect(0, 0, platno.width, platno.height);
  ctx.fillStyle = "#b45309";
  ctx.fillRect(kosik.x, kosik.y, kosik.w, kosik.h);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(jablko.x, jablko.y, jablko.w, jablko.h);
  ctx.fillStyle = "#f5f3ff";
  ctx.font = "bold 16px system-ui";
  ctx.fillText(\`Skóre: \${skore}\`, 10, 22);`;
const APPLE_2=`${APPLE_HEAD}

function noveJablko() {
  jablko.x = Math.random() * (platno.width - jablko.w);
  jablko.y = -jablko.h;
}

function update(dt) {
${APPLE_MOVE}
  jablko.y += jablko.vy * dt;
  if (kolize(kosik, jablko)) {
    skore++;
    noveJablko();
  } else if (jablko.y > platno.height) {
    noveJablko();
  }
}

function draw() {
${APPLE_DRAW}
}`;
const APPLE_3=`${APPLE_HEAD}
let zivoty = 3;
let konec = false;

function noveJablko() {
  jablko.x = Math.random() * (platno.width - jablko.w);
  jablko.y = -jablko.h;
  jablko.vy = 120 + skore * 8; // čím víc bodů, tím rychleji padá
}

function restart() {
  skore = 0;
  zivoty = 3;
  konec = false;
  noveJablko();
}

function update(dt) {
  if (konec) {
    if (klavesy.has("Enter")) restart();
    return;
  }
${APPLE_MOVE}
  jablko.y += jablko.vy * dt;
  if (kolize(kosik, jablko)) {
    skore++;
    noveJablko();
  } else if (jablko.y > platno.height) {
    zivoty--;
    if (zivoty <= 0) konec = true;
    noveJablko();
  }
}

function draw() {
${APPLE_DRAW}
  ctx.fillText("❤️".repeat(zivoty), platno.width - 80, 22);
  if (konec) {
    ctx.fillStyle = "#0b0a24cc";
    ctx.fillRect(0, 0, platno.width, platno.height);
    ctx.fillStyle = "#facc15";
    ctx.textAlign = "center";
    ctx.fillText("Konec hry · Enter = znovu", platno.width / 2, platno.height / 2);
    ctx.textAlign = "left";
  }
}`;

/* ---------- FARMA: jeden kód, který roste krok za krokem ----------
   Každý řádek má [od kroku, do kroku]. farm(n) = řešení kroku n, farm(n-1, n) = výchozí kód kroku n
   (s komentářem TODO, kam patří nová část). */
const FARM=[
  [1,9,`// ===== stav hry =====`],
  [1,9,`let mince = 10;`],
  [4,9,`let sklizeno = 0;`],
  [5,9,`let vybrane = "mrkev";`],
  [7,9,`let hotove = new Set();`],
  [1,9,`const pole = Array.from({ length: 9 }, () => ({ stav: "prazdne" }));`],
  [1,9,`const poleEl = document.querySelector("#pole");`],
  [1,9,`const minceEl = document.querySelector("#mince");`],
  [4,9,`const sklizenoEl = document.querySelector("#sklizeno");`],
  [7,9,`const ukolyEl = document.querySelector("#ukoly");`],
  [1,9,``],
  [1,9,`function emoji(p) {`],
  [2,9,`  if (p.stav === "roste") return "🌱";`],
  [3,4,`  if (p.stav === "zrale") return "🥕";`],
  [5,9,`  if (p.stav === "zrale") return PLODINY[p.plodina].emoji;`],
  [1,9,`  return "🟫";`],
  [1,9,`}`],
  [1,9,``],
  [8,9,`function cenaRozsireni() {\n  return 50 * 2 ** ((pole.length - 9) / 3);\n}\n`],
  [7,9,`function zkontrolujUkoly() {\n  UKOLY.forEach((u, i) => {\n    if (!hotove.has(i) && u.splneno({ mince, sklizeno, pole })) {\n      hotove.add(i);\n      mince += u.odmena;\n    }\n  });\n}\n`],
  [1,9,`function render() {`],
  [7,9,`  zkontrolujUkoly();`],
  [1,9,`  poleEl.replaceChildren(...pole.map((p, i) => {\n    const btn = document.createElement("button");\n    btn.className = "policko " + p.stav;\n    btn.dataset.i = i;\n    btn.textContent = emoji(p);\n    return btn;\n  }));`],
  [1,9,`  minceEl.textContent = mince;`],
  [4,9,`  sklizenoEl.textContent = sklizeno;`],
  [5,9,`  for (const b of document.querySelectorAll("[data-semeno]")) {\n    b.setAttribute("aria-pressed", b.dataset.semeno === vybrane);\n  }`],
  [7,9,`  ukolyEl.replaceChildren(...UKOLY.map((u, i) => {\n    const li = document.createElement("li");\n    li.textContent = \`\${u.text} (+\${u.odmena} 🪙)\`;\n    li.classList.toggle("hotovo", hotove.has(i));\n    return li;\n  }));`],
  [8,9,`  document.querySelector("#rozsirit").textContent = \`Přikoupit pole (\${cenaRozsireni()} 🪙)\`;`],
  [6,9,`  ulozit();`],
  [1,9,`}`],
  [2,9,``],
  [2,9,`poleEl.addEventListener("click", e => {\n  const btn = e.target.closest(".policko");\n  if (!btn) return;\n  const p = pole[btn.dataset.i];`],
  [2,4,`  if (p.stav === "prazdne" && mince >= 5) {\n    p.stav = "roste";\n    p.rust = 0;\n    mince -= 5;\n  }`],
  [5,9,`  if (p.stav === "prazdne" && mince >= PLODINY[vybrane].cena) {\n    p.stav = "roste";\n    p.plodina = vybrane;\n    p.rust = 0;\n    mince -= PLODINY[vybrane].cena;\n  }`],
  [4,4,`  if (p.stav === "zrale") {\n    mince += 12;\n    sklizeno++;\n    p.stav = "prazdne";\n  }`],
  [5,9,`  if (p.stav === "zrale") {\n    mince += PLODINY[p.plodina].zisk;\n    sklizeno++;\n    p.stav = "prazdne";\n  }`],
  [2,9,`  render();\n});`],
  [3,9,``],
  [3,9,`function tick() {\n  for (const p of pole) {\n    if (p.stav !== "roste") continue;\n    p.rust++;`],
  [3,4,`    if (p.rust >= 3) p.stav = "zrale";`],
  [5,9,`    if (p.rust >= PLODINY[p.plodina].rust) p.stav = "zrale";`],
  [3,9,`  }\n  render();\n}\nsetInterval(tick, 1000);`],
  [5,9,``],
  [5,9,`document.querySelector("#obchod").addEventListener("click", e => {\n  const btn = e.target.closest("[data-semeno]");\n  if (!btn) return;\n  vybrane = btn.dataset.semeno;\n  render();\n});`],
  [8,9,``],
  [8,9,`document.querySelector("#rozsirit").addEventListener("click", () => {\n  const cena = cenaRozsireni();\n  if (mince < cena) return;\n  mince -= cena;\n  pole.push({ stav: "prazdne" }, { stav: "prazdne" }, { stav: "prazdne" });\n  render();\n});`],
  [6,9,``],
  [6,9,`function ulozit() {`],
  [6,6,`  localStorage.setItem("farma", JSON.stringify({ mince, sklizeno, pole }));`],
  [7,9,`  localStorage.setItem("farma", JSON.stringify({ mince, sklizeno, pole, ukoly: [...hotove] }));`],
  [6,9,`}\n\nfunction nacist() {\n  const data = JSON.parse(localStorage.getItem("farma"));\n  if (!data) return;\n  mince = data.mince;\n  sklizeno = data.sklizeno;\n  pole.splice(0, pole.length, ...data.pole);`],
  [7,9,`  hotove = new Set(data.ukoly ?? []);`],
  [6,9,`}`],
  [1,9,``],
  [6,9,`nacist();`],
  [1,9,`render();`],
];
const FARM_TODO={
  2:[`poleEl.addEventListener`,`// TODO krok 2: kliknutí na prázdné políčko zasadí semínko za 5 🪙 (posluchač na poleEl)\n`],
  3:[`function tick`,`// TODO krok 3: funkce tick() — každé rostoucí políčko povyroste, po 3 tickách dozraje\n// a spusť ji každou sekundu přes setInterval\n`],
  4:[null,`// TODO krok 4: v posluchači na poli skliď zralé políčko (+12 🪙, sklizeno++)\n`],
  5:[`document.querySelector("#obchod")`,`// TODO krok 5: posluchač na #obchod nastaví vybrane; setí, růst i sklizeň podle PLODINY\n`],
  6:[`function ulozit`,`// TODO krok 6: ulozit() a nacist() přes localStorage; render() vždy uloží, při startu načti\n`],
  7:[`function zkontrolujUkoly`,`// TODO krok 7: zkontrolujUkoly() — splněný úkol přidá odměnu jen jednou; vypiš úkoly do #ukoly\n`],
  8:[`document.querySelector("#rozsirit")`,`// TODO krok 8: tlačítko #rozsirit přikoupí 3 políčka; cena 50, pak 100, 200…\n`],
};
function farm(n,todoFor){
  const out=[]; let todoDone=false; const td=FARM_TODO[todoFor];
  for(const [a,b,line] of FARM){
    // komentář TODO vložíme před první blok, který v příštím kroku přibude
    if(td&&!todoDone&&td[0]&&a===todoFor&&line.startsWith(td[0])){ out.push(td[1].trimEnd()); todoDone=true; }
    if(n>=a&&n<=b) out.push(line);
  }
  if(td&&!todoDone){ const k=out.lastIndexOf("render();"); out.splice(k,0,td[1]); }
  return out.join("\n").replace(/\n{3,}/g,"\n\n");
}
const P_PLODINY=`// semínka v obchodě: cena, kolik ticků roste, kolik vynese
const PLODINY = {
  mrkev:  { cena: 5,  rust: 3, zisk: 12, emoji: "🥕" },
  jahoda: { cena: 10, rust: 4, zisk: 26, emoji: "🍓" },
  dyne:   { cena: 20, rust: 6, zisk: 60, emoji: "🎃" },
};`;
const P_STORAGE=`// náhled běží v izolovaném okně bez skutečného localStorage —
// tohle se chová stejně (jen se maže při obnovení náhledu)
const localStorage = (() => {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
})();`;
const P_UKOLY=`// úkoly: splneno dostane { mince, sklizeno, pole }
const UKOLY = [
  { text: "Skliď 3 plodiny", splneno: s => s.sklizeno >= 3, odmena: 20 },
  { text: "Měj 100 mincí", splneno: s => s.mince >= 100, odmena: 50 },
  { text: "Zasaď dýni", splneno: s => s.pole.some(p => p.plodina === "dyne"), odmena: 10 },
];`;
const farmPrelude=n=>[n>=5&&P_PLODINY,n>=6&&P_STORAGE,n>=7&&P_UKOLY].filter(Boolean).join("\n\n")||undefined;
const farmHtml=n=>`<div class="farma"><div class="hud"><span>🪙 <b id="mince">10</b></span>${n>=4?`<span>🧺 sklizeno <b id="sklizeno">0</b></span>`:""}</div>
${n>=5?`<div class="obchod" id="obchod"><button data-semeno="mrkev">🥕 Mrkev · 5</button><button data-semeno="jahoda">🍓 Jahoda · 10</button><button data-semeno="dyne">🎃 Dýně · 20</button></div>`:""}
<div id="pole"></div>${n>=8?`<button id="rozsirit" class="rozsirit">Přikoupit pole</button>`:""}${n>=7?`<h4>Úkoly</h4><ul id="ukoly"></ul>`:""}</div>`;
const FARM_CSS=GAME_CSS+`.farma{max-width:420px}.hud{display:flex;gap:18px;font-size:18px;font-weight:800;margin-bottom:10px}
#pole{display:grid;grid-template-columns:repeat(3,64px);gap:8px;margin:12px 0}
.policko{width:64px;height:64px;font-size:30px;padding:0;background:#7c4a1e;box-shadow:0 4px 0 #4a2a0f}.policko.roste{background:#5f7d2a;box-shadow:0 4px 0 #3b5214}.policko.zrale{background:#9bbf3a;box-shadow:0 4px 0 #5f7d2a}
[data-semeno][aria-pressed="true"]{outline:3px solid #fff;outline-offset:2px}.rozsirit{background:#38bdf8;box-shadow:0 3px 0 #0369a1}
h4{margin:14px 0 4px}#ukoly{margin:0;padding-left:18px}#ukoly li.hotovo{color:#86efac;text-decoration:line-through}`;
const click=i=>`document.querySelectorAll("#pole .policko")[${i}].click()`;
const farmLevel=(n,o)=>({ id:`gf-${n}`, module:"farma", engine:"dom", frame:n>=8?540:n>=7?480:n>=5?360:300, continues:n>1?`gf-${n-1}`:undefined,
  html:farmHtml(n), fixed:FARM_CSS, prelude:farmPrelude(n), starter:n>1?farm(n-1,n):o.starter, solution:farm(n), ...o });

registerCourse({ id:"hry", name:"Herní dílna", tagline:"Postav si vlastní hry v JavaScriptu: klikačka, arkáda, farma", color:"var(--c-game)", engine:"dom", status:"live", code:"requestAnimationFrame(hra)", arcade:true,
  tiers:[
    { id:"mini",   name:"Minihry", desc:"Malé hry v prohlížeči: klikačka, hádání čísla, kámen-nůžky-papír. Stačí JS Junior a Práce se stránkou.", glyph:"1UP" },
    { id:"arkada", name:"Arkáda", desc:"Canvas, herní smyčka, ovládání klávesnicí, kolize, skóre a životy.", glyph:"▶" },
    { id:"farma",  name:"Farma od A do Z", desc:"Jedna velká hra krok za krokem: pole, setí, růst, sklizeň, obchod, ukládání, úkoly a rozšiřování.", glyph:"🥕" },
  ],
  modules:[
    { id:"clicker", tier:"mini",   name:"Klikačka", sub:"Stav hry, vylepšení a pasivní příjem", color:"var(--c-game)", glyph:"⛏️" },
    { id:"guess",   tier:"mini",   name:"Hádej číslo", sub:"Náhoda, formulář, výhra a prohra", color:"var(--m-content)", glyph:"🔢" },
    { id:"rps",     tier:"mini",   name:"Kámen, nůžky, papír", sub:"Pravidla jako data, skóre", color:"var(--m-padding)", glyph:"✂️" },
    { id:"canvas",  tier:"arkada", name:"Plátno a pohyb", sub:"canvas, update/draw, klávesnice", color:"var(--m-border)", glyph:"🕹️" },
    { id:"apple",   tier:"arkada", name:"Chyť jablko", sub:"Kolize, skóre, životy, restart", color:"var(--m-margin)", glyph:"🍎" },
    { id:"farma",   tier:"farma",  name:"Farma", sub:"Osm kroků k hotové hře, kterou si uložíš", color:"var(--accent)", glyph:"🌱" },
  ],
  levels:[
  /* ======================= KLIKAČKA ======================= */
  { id:"gc-1", module:"clicker", xp:150, frame:240, title:"Klik = mince",
    slides:[
      { title:"Herní dílna", html:`<p>Tady si postavíš <b>skutečné hry</b>. Každá úroveň přidá jednu mechaniku a hotové hry se ti sbírají v <b>Arkádě</b> na mapě kurzu — můžeš si je kdykoli zahrát nebo poslat kamarádům.</p><p>Hodí se umět základy JavaScriptu (proměnné, funkce, podmínky) a <code>addEventListener</code> z kurzu JavaScript. Nevadí, když ne úplně — všechno ti připomeneme.</p>` },
      { title:"Každá hra je stav + reakce", html:`<p>Každá hra má <b>stav</b> (kolik máš mincí, kde stojí hráč) a <b>reakce</b> na hráče (kliknutí, klávesy). Reakce změní stav a pak stránku překreslíš podle stavu.</p><pre class="mini">let mince = 0;                // stav\ntlacitko.addEventListener("click", () =&gt; {\n  mince += 1;                 // změna stavu\n  minceEl.textContent = mince; // překreslení\n});</pre>` } ],
    task:`Každé kliknutí na <b>⛏️ Kopat</b> přidá 1 minci a ukáže nový počet v <code>#mince</code>.`,
    html:CLICK_HTML, fixed:GAME_CSS,
    starter:`let mince = 0;\nconst minceEl = document.querySelector("#mince");\n\n// sem posluchač na #klik\n`,
    solution:CLICK_1,
    hints:["<code>document.querySelector(\"#klik\").addEventListener(\"click\", () =&gt; { … });</code>","Uvnitř: <code>mince += 1; minceEl.textContent = mince;</code>"],
    tests:[{label:"Po 3 kliknutích jsou 3 mince",act:`for(let i=0;i<3;i++)document.querySelector("#klik").click()`,expr:`document.querySelector("#mince").textContent`,expect:"3"},{label:"Stav hry sedí s obrazovkou",expr:"mince",expect:3}] },
  { id:"gc-2", module:"clicker", xp:200, frame:240, continues:"gc-1", title:"Vylepšení",
    theory:`<p>Hráče baví, když roste. <b>Krumpáč</b> stojí 10 mincí a přidá +1 za každé kliknutí. Pak <b>zdraží na dvojnásobek</b> — klasická herní ekonomika.</p><p>Jakmile se stav mění na víc místech, vyplatí se jedna funkce <code>render()</code>, která překreslí <i>všechno</i> podle stavu. Volej ji po každé změně.</p><p>Tlačítko, na které nemáš, vypni: <code>btn.disabled = mince &lt; cena</code>.</p>`,
    task:`Přidej proměnné <code>zaKlik = 1</code> a <code>cenaKrumpace = 10</code>. Kopání přidá <code>zaKlik</code> mincí. Tlačítko <code>#krumpac</code>: když máš dost, odečte cenu, zvýší <code>zaKlik</code> a cenu zdvojnásobí. V <code>render()</code> ukaž cenu v textu tlačítka a vypni ho, když na něj nemáš.`,
    html:CLICK_HTML, fixed:GAME_CSS, starter:CLICK_1, solution:CLICK_2,
    hints:["Vytvoř <code>function render()</code>: mince, <code>krumpacBtn.textContent = \`Lepší krumpáč (\${cenaKrumpace})\`</code> a <code>krumpacBtn.disabled = mince &lt; cenaKrumpace</code>.","Nákup: <code>if (mince &lt; cenaKrumpace) return; mince -= cenaKrumpace; zaKlik++; cenaKrumpace *= 2; render();</code>"],
    tests:[
      {label:"Na začátku je krumpáč vypnutý",expr:`document.querySelector("#krumpac").disabled`,expect:true},
      {label:"Po 10 kliknutích jde koupit",act:`for(let i=0;i<10;i++)document.querySelector("#klik").click()`,expr:`document.querySelector("#krumpac").disabled`,expect:false},
      {label:"Nákup: −10 mincí, +1 za klik, cena 20",act:`document.querySelector("#krumpac").click()`,expr:`[mince,zaKlik,document.querySelector("#krumpac").textContent]`,expect:[0,2,"Lepší krumpáč (20)"]},
      {label:"Kopání teď dává 2 mince",act:`document.querySelector("#klik").click()`,expr:`document.querySelector("#mince").textContent`,expect:"2"} ] },
  { id:"gc-3", module:"clicker", xp:240, frame:260, continues:"gc-2", game:{name:"Kopej!",emoji:"⛏️"}, title:"Havíři pracují za tebe",
    theory:`<p><b>Pasivní příjem</b> je srdce každé klikačky. <code>setInterval(funkce, 1000)</code> zavolá funkci každou sekundu:</p><pre class="mini">setInterval(() =&gt; {\n  mince += auto;\n  render();\n}, 1000);</pre><p>Havíř stojí 25 a po každém nákupu zdraží 1,5× (zaokrouhli přes <code>Math.round</code>). Do <code>#info</code> vypiš, kolik havíři vykopou za sekundu.</p>`,
    task:`Přidej <code>auto = 0</code> a <code>cenaHavire = 25</code>. Tlačítko <code>#havir</code> koupí havíře (+1 za sekundu, cena ×1,5). Každou sekundu přičti <code>auto</code> mincí. V render ukaž cenu, vypni tlačítko, když na něj nemáš, a do <code>#info</code> napiš <code>Havíři vykopou 1 🪙 za sekundu</code>.`,
    html:CLICK_HTML, fixed:GAME_CSS, starter:CLICK_2, solution:CLICK_3,
    hints:["Nákup havíře je stejný jako krumpáč, jen mění <code>auto</code> a cenu násobí <code>1.5</code>.","<code>setInterval(() =&gt; { mince += auto; render(); }, 1000);</code>"],
    tests:[
      {label:"Havíř je na začátku vypnutý",expr:`document.querySelector("#havir").disabled`,expect:true},
      {label:"Nákup havíře: −25, auto 1, cena 38",act:`mince=25;render();document.querySelector("#havir").click()`,expr:`[mince,auto,document.querySelector("#havir").textContent]`,expect:[0,1,"Najmout havíře (38)"]},
      {label:"Za 3 sekundy vykope 3 mince",act:`__sekunda(3)`,expr:`document.querySelector("#mince").textContent`,expect:"3"},
      {label:"Info o příjmu",expr:`document.querySelector("#info").textContent`,expect:"Havíři vykopou 1 🪙 za sekundu"} ] },

  /* ======================= HÁDEJ ČÍSLO ======================= */
  { id:"gg-1", module:"guess", xp:180, frame:250, title:"Větší, nebo menší?",
    theory:`<p>Hra na hádání: počítač si myslí číslo, ty hádáš a on odpovídá „větší / menší“. Tip přijde z formuláře jako <b>text</b> — převeď ho přes <code>Number(input.value)</code>.</p><p>Poslouchej <code>submit</code> na formuláři (funguje i Enter) a nezapomeň <code>e.preventDefault()</code>.</p>`,
    task:`Zatím je tajné číslo pevně <code>42</code>. Po odeslání tipu zvyš <code>pokusy</code>, ukaž je v <code>#pokusy</code> a do <code>#zprava</code> napiš <code>Moje číslo je větší.</code>, <code>Moje číslo je menší.</code> nebo <code>Trefa!</code>. Pole pak vyprázdni.`,
    html:GUESS_HTML, fixed:GAME_CSS,
    starter:`const tajne = 42;\nlet pokusy = 0;\nconst input = document.querySelector("#cislo");\nconst zprava = document.querySelector("#zprava");\n\ndocument.querySelector("#tip").addEventListener("submit", e => {\n  e.preventDefault();\n  // sem tvůj kód\n});`,
    solution:GUESS_1,
    hints:["<code>const tip = Number(input.value); pokusy++;</code>","<code>if (tip &lt; tajne) … else if (tip &gt; tajne) … else zprava.textContent = \"Trefa!\";</code>"],
    tests:[
      {label:"Tip 10 → Moje číslo je větší.",act:tipAct(10),expr:`document.querySelector("#zprava").textContent`,expect:"Moje číslo je větší."},
      {label:"Tip 80 → Moje číslo je menší.",act:tipAct(80),expr:`document.querySelector("#zprava").textContent`,expect:"Moje číslo je menší."},
      {label:"Tip 42 → Trefa!",act:tipAct(42),expr:`document.querySelector("#zprava").textContent`,expect:"Trefa!"},
      {label:"Počítá pokusy a vyprázdní pole",expr:`[document.querySelector("#pokusy").textContent,document.querySelector("#cislo").value]`,expect:["3",""]} ] },
  { id:"gg-2", module:"guess", xp:240, frame:260, continues:"gg-1", game:{name:"Hádej číslo",emoji:"🔢"}, title:"Náhoda, prohra a nová hra",
    theory:`<p>Náhodné celé číslo 1–100: <code>Math.floor(Math.random() * 100) + 1</code>. <code>Math.random()</code> vrací 0 až 0,999…, krát 100 a useknout desetinná místa dá 0–99, plus 1.</p><p>Hra potřebuje <b>konec</b> a <b>restart</b>. Všechno, co se na začátku hry nastavuje, dej do funkce <code>novaHra()</code> — zavoláš ji při startu i z tlačítka „Hrát znovu“.</p>`,
    task:`1) <code>novaHra()</code> vylosuje <code>tajne</code>, vynuluje pokusy, vrátí úvodní text, zapne pole a schová <code>#znovu</code><br>2) při trefě: zpráva <code>Trefa!</code>, pole vypni (<code>disabled</code>), ukaž <code>#znovu</code><br>3) po 7. neúspěšném pokusu: <code>Prohra! Bylo to 51.</code> a stejně tak konec<br>4) <code>#znovu</code> spustí novou hru`,
    html:GUESS_HTML, fixed:GAME_CSS, starter:GUESS_1, solution:GUESS_2,
    hints:["Udělej <code>let tajne; let pokusy;</code> a funkci <code>novaHra()</code>, která je nastaví. Na konci kódu ji zavolej.","Konec hry: <code>input.disabled = true; znovu.hidden = false;</code>. Prohra: <code>if (pokusy &gt;= 7) …</code>"],
    tests:[
      {label:"novaHra() losuje přes Math.random",act:`Math.random=()=>0.5;novaHra()`,expr:"tajne",expect:51},
      {label:"Trefa ukončí hru a ukáže Hrát znovu",act:tipAct(51),expr:`[document.querySelector("#zprava").textContent,document.querySelector("#znovu").hidden,document.querySelector("#cislo").disabled]`,expect:["Trefa!",false,true]},
      {label:"Hrát znovu vrátí hru na začátek",act:`document.querySelector("#znovu").click()`,expr:`[pokusy,document.querySelector("#znovu").hidden,document.querySelector("#cislo").disabled]`,expect:[0,true,false]},
      {label:"7 špatných tipů = prohra",act:`for(let i=0;i<7;i++){${tipAct(1)}}`,expr:`document.querySelector("#zprava").textContent`,expect:"Prohra! Bylo to 51."},
      {label:"Po prohře nejde dál hádat",expr:`document.querySelector("#cislo").disabled`,expect:true} ] },

  /* ======================= KÁMEN, NŮŽKY, PAPÍR ======================= */
  { id:"gr-1", module:"rps", engine:"js", xp:180, title:"Pravidla jako data",
    theory:`<p>Pravidla her se dají napsat sérií <code>if</code>ů — nebo jako <b>data</b>. Objekt „co poráží co“ je kratší a nespleteš se v něm:</p><pre class="mini">const PORAZI = { kamen: "nuzky", nuzky: "papir", papir: "kamen" };\nPORAZI.kamen   // "nuzky" — kámen poráží nůžky</pre><p>Až budeš chtít přidat třeba „ještěrku“, přidáš jen data, ne další podmínky.</p>`,
    task:`Napiš <code>vitez(hrac, pocitac)</code> s tahy <code>"kamen"</code>, <code>"nuzky"</code>, <code>"papir"</code>. Vrať <code>"hráč"</code>, <code>"počítač"</code> nebo <code>"remíza"</code>.`,
    starter:`function vitez(hrac, pocitac) {\n  \n}`,
    solution:`function vitez(hrac, pocitac) {\n  const PORAZI = { kamen: "nuzky", nuzky: "papir", papir: "kamen" };\n  if (hrac === pocitac) return "remíza";\n  return PORAZI[hrac] === pocitac ? "hráč" : "počítač";\n}`,
    hints:["Nejdřív remíza: <code>if (hrac === pocitac) return \"remíza\";</code>","<code>return PORAZI[hrac] === pocitac ? \"hráč\" : \"počítač\";</code>"],
    tests:[{label:"kámen × nůžky → hráč",expr:`vitez("kamen","nuzky")`,expect:"hráč"},{label:"papír × kámen → hráč",expr:`vitez("papir","kamen")`,expect:"hráč"},{label:"nůžky × kámen → počítač",expr:`vitez("nuzky","kamen")`,expect:"počítač"},{label:"papír × nůžky → počítač",expr:`vitez("papir","nuzky")`,expect:"počítač"},{label:"papír × papír → remíza",expr:`vitez("papir","papir")`,expect:"remíza"}] },
  { id:"gr-2", module:"rps", xp:240, frame:240, game:{name:"Kámen, nůžky, papír",emoji:"✂️"}, title:"Hra proti počítači",
    theory:`<p>Počítač vybere náhodný tah z pole: <code>TAHY[Math.floor(Math.random() * TAHY.length)]</code>. Tvoje funkce <code>vitez</code> už je v připraveném kódu.</p><p>Tři tlačítka obslouží <b>jeden posluchač</b> na <code>#tahy</code> — tah přečteš z <code>btn.dataset.tah</code>.</p>`,
    task:`Po kliknutí na tah: počítač vybere náhodný tah, přičti bod vítězi a ukaž skóre v <code>#skore</code> jako <code>1 : 0</code>. Do <code>#vysledek</code> napiš třeba <code>📄 vs 🪨 — výhra!</code> (jinak <code>prohra.</code> nebo <code>remíza.</code>).`,
    html:RPS_HTML, fixed:GAME_CSS, prelude:P_VITEZ,
    starter:`let body = { hrac: 0, pocitac: 0 };\nconst vysledek = document.querySelector("#vysledek");\n\ndocument.querySelector("#tahy").addEventListener("click", e => {\n  const btn = e.target.closest("[data-tah]");\n  if (!btn) return;\n  const hrac = btn.dataset.tah;\n  // sem: tah počítače, vyhodnocení, skóre\n});`,
    solution:`let body = { hrac: 0, pocitac: 0 };\nconst vysledek = document.querySelector("#vysledek");\nconst HLASKY = { "hráč": "výhra!", "počítač": "prohra.", "remíza": "remíza." };\n\ndocument.querySelector("#tahy").addEventListener("click", e => {\n  const btn = e.target.closest("[data-tah]");\n  if (!btn) return;\n  const hrac = btn.dataset.tah;\n  const pocitac = TAHY[Math.floor(Math.random() * TAHY.length)];\n  const kdo = vitez(hrac, pocitac);\n  if (kdo === "hráč") body.hrac++;\n  if (kdo === "počítač") body.pocitac++;\n  document.querySelector("#skore").textContent = \`\${body.hrac} : \${body.pocitac}\`;\n  vysledek.textContent = \`\${EMOJI[hrac]} vs \${EMOJI[pocitac]} — \${HLASKY[kdo]}\`;\n});`,
    hints:["<code>const pocitac = TAHY[Math.floor(Math.random() * TAHY.length)];</code> a <code>const kdo = vitez(hrac, pocitac);</code>","Text: <code>\`\${EMOJI[hrac]} vs \${EMOJI[pocitac]} — \${…}\`</code>; hlášky si dej do objektu podle <code>kdo</code>."],
    tests:[
      {label:"Papír proti kameni = výhra",act:`Math.random=()=>0;document.querySelector('[data-tah="papir"]').click()`,expr:`document.querySelector("#vysledek").textContent`,expect:"📄 vs 🪨 — výhra!"},
      {label:"Skóre 1 : 0",expr:`document.querySelector("#skore").textContent`,expect:"1 : 0"},
      {label:"Nůžky proti kameni = prohra, skóre 1 : 1",act:`document.querySelector('[data-tah="nuzky"]').click()`,expr:`[document.querySelector("#vysledek").textContent,document.querySelector("#skore").textContent]`,expect:["✂️ vs 🪨 — prohra.","1 : 1"]},
      {label:"Remíza nic nepřičte",act:`document.querySelector('[data-tah="kamen"]').click()`,expr:`[document.querySelector("#vysledek").textContent,document.querySelector("#skore").textContent]`,expect:["🪨 vs 🪨 — remíza.","1 : 1"]} ] },

  /* ======================= PLÁTNO A POHYB ======================= */
  { id:"gv-1", module:"canvas", xp:200, frame:260, title:"Plátno",
    slides:[{ title:"Canvas = kreslicí plocha", html:`<p>Akční hry se nekreslí z HTML prvků, ale na <code>&lt;canvas&gt;</code> — plátno z pixelů. Kreslíš přes „kontext“:</p><pre class="mini">const ctx = platno.getContext("2d");\nctx.fillStyle = "#facc15";        // barva\nctx.fillRect(x, y, sirka, vyska);  // obdélník</pre><p>Souřadnice začínají <b>vlevo nahoře</b> v bodě 0, 0. <code>x</code> roste doprava, <code>y</code> roste <b>dolů</b> (ne nahoru jako v matice).</p>` }],
    task:`Nakresli hráče: žlutý (<code>#facc15</code>) čtverec 40 × 40 px na pozici <code>x: 140, y: 80</code> — doprostřed plátna 320 × 200.`,
    html:CANVAS_HTML, fixed:CANVAS_CSS,
    starter:`const platno = document.querySelector("#hra");\nconst ctx = platno.getContext("2d");\n\n`,
    solution:`const platno = document.querySelector("#hra");\nconst ctx = platno.getContext("2d");\n\nctx.fillStyle = "#facc15";\nctx.fillRect(140, 80, 40, 40);`,
    hints:["Nejdřív barva: <code>ctx.fillStyle = \"#facc15\";</code>","Pak <code>ctx.fillRect(140, 80, 40, 40);</code>"],
    tests:[{label:"Uprostřed je žlutý hráč",expr:px(160,100),expect:[250,204,21,255]},{label:"Okraj plátna zůstal prázdný",expr:px(10,10),expect:[0,0,0,0]},{label:"Čtverec končí na x = 180",expr:px(181,100),expect:[0,0,0,0]}] },
  { id:"gv-2", module:"canvas", xp:240, frame:260, title:"Herní smyčka",
    slides:[{ title:"update a draw", html:`<p>Hra běží ve <b>smyčce</b> zhruba 60× za sekundu. V každém snímku se zavolají dvě funkce (smyčku máš v připraveném kódu):</p><ul><li><code>update(dt)</code> — posune svět. <code>dt</code> je čas od minulého snímku v sekundách.</li><li><code>draw()</code> — smaže plátno a nakreslí všechno znovu.</li></ul><p>Rychlost se proto píše v <b>pixelech za sekundu</b>: <code>x += rychlost * dt</code>. Hra pak běží stejně rychle na 60 i na 144 Hz monitoru.</p>` }],
    task:`Hráč se má pohybovat vodorovně rychlostí <code>hrac.vx</code> a <b>odrazit</b> od levého i pravého okraje (otočit směr a zůstat uvnitř plátna). V <code>draw()</code> navíc chybí smazání plátna — hráč za sebou nechává stopu.`,
    html:CANVAS_HTML, fixed:CANVAS_CSS, prelude:P_SMYCKA,
    starter:`const platno = document.querySelector("#hra");\nconst ctx = platno.getContext("2d");\nconst hrac = { x: 20, y: 80, w: 40, h: 40, vx: 120 };\n\nfunction update(dt) {\n  \n}\n\nfunction draw() {\n  ctx.fillStyle = "#facc15";\n  ctx.fillRect(hrac.x, hrac.y, hrac.w, hrac.h);\n}`,
    solution:CV2,
    hints:["Pohyb: <code>hrac.x += hrac.vx * dt;</code>. Pravý okraj: <code>if (hrac.x + hrac.w &gt; platno.width) { hrac.x = platno.width - hrac.w; hrac.vx = -Math.abs(hrac.vx); }</code>","Levý okraj obdobně s <code>Math.abs</code>. Na začátek draw: <code>ctx.clearRect(0, 0, platno.width, platno.height);</code>"],
    tests:[
      {label:"Za půl sekundy ujede 60 px",act:`hrac.x=20;hrac.vx=120;update(0.5)`,expr:"hrac.x",expect:80},
      {label:"Odraz od pravého okraje",act:`hrac.x=270;hrac.vx=120;update(0.5)`,expr:"[hrac.x,hrac.vx]",expect:[280,-120]},
      {label:"Odraz od levého okraje",act:`hrac.x=10;hrac.vx=-120;update(0.5)`,expr:"[hrac.x,hrac.vx]",expect:[0,120]},
      {label:"draw() nejdřív smaže plátno",act:`hrac.x=0;hrac.y=0;draw();hrac.x=200;draw()`,expr:`[${px(20,20)}[3],${px(220,20)}[3]]`,expect:[0,255]} ] },
  { id:"gv-3", module:"canvas", xp:260, frame:260, title:"Ovládání šipkami",
    theory:`<p>V připraveném kódu je množina <code>klavesy</code> — obsahuje klávesy, které hráč právě drží: <code>klavesy.has("ArrowLeft")</code>. Proč ne rovnou <code>keydown</code>? Ten přijde jednou a pak až po pauze. Kontrola v <code>update</code> dá plynulý pohyb a jde držet víc kláves (diagonála).</p><p>Hráče udrž na plátně: <code>Math.max(0, Math.min(maximum, x))</code> „zacvakne“ číslo do rozsahu.</p>`,
    task:`Šipky hýbou hráčem rychlostí <code>RYCHLOST</code> (160 px/s) všemi čtyřmi směry. Hráč nesmí vyjet z plátna.`,
    html:CANVAS_HTML, fixed:CANVAS_CSS, prelude:P_SMYCKA+"\n\n"+P_KLAVESY,
    starter:`const platno = document.querySelector("#hra");\nconst ctx = platno.getContext("2d");\nconst hrac = { x: 140, y: 80, w: 40, h: 40 };\nconst RYCHLOST = 160; // pixelů za sekundu\n\nfunction update(dt) {\n  \n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, platno.width, platno.height);\n  ctx.fillStyle = "#facc15";\n  ctx.fillRect(hrac.x, hrac.y, hrac.w, hrac.h);\n}`,
    solution:CV3,
    hints:["<code>if (klavesy.has(\"ArrowLeft\")) hrac.x -= RYCHLOST * dt;</code> a obdobně další tři.","Na konec: <code>hrac.x = Math.max(0, Math.min(platno.width - hrac.w, hrac.x));</code> a totéž pro y s výškou."],
    tests:[
      {label:"Šipka doprava: +80 px za půl sekundy",act:`klavesy.clear();klavesy.add("ArrowRight");update(0.5);klavesy.clear()`,expr:"hrac.x",expect:220},
      {label:"Šipka dolů",act:`klavesy.add("ArrowDown");update(0.25);klavesy.clear()`,expr:"hrac.y",expect:120},
      {label:"Nevyjede vlevo ani nahoru",act:`klavesy.add("ArrowLeft");klavesy.add("ArrowUp");update(10);klavesy.clear()`,expr:"[hrac.x,hrac.y]",expect:[0,0]},
      {label:"Nevyjede vpravo ani dolů",act:`klavesy.add("ArrowRight");klavesy.add("ArrowDown");update(10);klavesy.clear()`,expr:"[hrac.x,hrac.y]",expect:[280,160]} ] },

  /* ======================= CHYŤ JABLKO ======================= */
  { id:"gk-1", module:"apple", engine:"js", xp:220, title:"Kolize",
    theory:`<p>Skoro každá 2D hra se ptá: <b>dotýkají se dva obdélníky?</b> (AABB kolize). Nedotýkají se, když je jeden celý vlevo, vpravo, nad nebo pod druhým. Jinak se překrývají:</p><pre class="mini">a.x &lt; b.x + b.w   // levý okraj a je před pravým okrajem b\na.x + a.w &gt; b.x   // pravý okraj a je za levým okrajem b\n// … a totéž pro y</pre>`,
    task:`Napiš <code>kolize(a, b)</code> pro obdélníky <code>{ x, y, w, h }</code>. Vrať <code>true</code>, když se překrývají. Pouhý dotek hranou se nepočítá.`,
    starter:`function kolize(a, b) {\n  \n}`,
    solution:`function kolize(a, b) {\n  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;\n}`,
    hints:["Čtyři podmínky spojené <code>&amp;&amp;</code>.","<code>return a.x &lt; b.x + b.w &amp;&amp; a.x + a.w &gt; b.x &amp;&amp; a.y &lt; b.y + b.h &amp;&amp; a.y + a.h &gt; b.y;</code>"],
    tests:[
      {label:"Překryv → true",expr:"kolize({x:0,y:0,w:10,h:10},{x:5,y:5,w:10,h:10})",expect:true},
      {label:"Daleko od sebe → false",expr:"kolize({x:0,y:0,w:10,h:10},{x:50,y:0,w:10,h:10})",expect:false},
      {label:"Jeden nad druhým → false",expr:"kolize({x:0,y:0,w:10,h:10},{x:0,y:30,w:10,h:10})",expect:false},
      {label:"Dotek hranou → false",expr:"kolize({x:0,y:0,w:10,h:10},{x:10,y:0,w:10,h:10})",expect:false},
      {label:"Jeden uvnitř druhého → true",expr:"kolize({x:0,y:0,w:100,h:100},{x:40,y:40,w:5,h:5})",expect:true} ] },
  { id:"gk-2", module:"apple", xp:280, frame:260, title:"Padající jablko",
    theory:`<p>Teď z toho bude hra. Košík ovládáš šipkami (to už je hotové), shora padá jablko rychlostí <code>jablko.vy</code>. Funkce <code>kolize</code> je v připraveném kódu.</p><ul><li>Chytíš jablko → <code>skore++</code> a nové jablko</li><li>Jablko propadne pod plátno → nové jablko</li></ul><p>Nové jablko začne nad plátnem (<code>y = -výška</code>) na náhodném <code>x</code>, ale celé uvnitř šířky.</p>`,
    task:`Dopiš <code>noveJablko()</code> (náhodné x od 0 do <code>platno.width - jablko.w</code>, y nad plátnem) a v <code>update</code> pád jablka, chycení a propadnutí.`,
    html:CANVAS_HTML, fixed:CANVAS_CSS, prelude:[P_SMYCKA,P_KLAVESY,P_KOLIZE].join("\n\n"),
    starter:`${APPLE_HEAD}\n\nfunction noveJablko() {\n  \n}\n\nfunction update(dt) {\n${APPLE_MOVE}\n  // sem: pád jablka, chycení, propadnutí\n}\n\nfunction draw() {\n${APPLE_DRAW}\n}`,
    solution:APPLE_2,
    hints:["<code>noveJablko</code>: <code>jablko.x = Math.random() * (platno.width - jablko.w); jablko.y = -jablko.h;</code>","V update: <code>jablko.y += jablko.vy * dt;</code>, pak <code>if (kolize(kosik, jablko)) { skore++; noveJablko(); } else if (jablko.y &gt; platno.height) noveJablko();</code>"],
    tests:[
      {label:"Jablko padá 120 px/s",act:`jablko.x=0;jablko.y=0;kosik.x=200;update(0.5)`,expr:"jablko.y",expect:60},
      {label:"Chycení: +1 bod a nové jablko nahoře",act:`Math.random=()=>0.5;jablko.x=kosik.x+10;jablko.y=kosik.y-8;update(0)`,expr:"[skore,jablko.x,jablko.y]",expect:[1,152,-16]},
      {label:"Propadnutí: nové jablko, body beze změny",act:`jablko.x=0;kosik.x=200;jablko.y=platno.height+1;update(0)`,expr:"[skore,jablko.y]",expect:[1,-16]} ] },
  { id:"gk-3", module:"apple", xp:320, frame:260, continues:"gk-2", game:{name:"Chyť jablko",emoji:"🍎"}, title:"Životy a konec hry",
    theory:`<p>Hra bez prohry nudí. Přidej <b>životy</b>: propadlé jablko jeden sebere, při nule je <code>konec = true</code>. Když hra skončí, <code>update</code> už nic nehýbe — jen čeká na <b>Enter</b>, který spustí <code>restart()</code>.</p><p>Bonus pro hratelnost: s každým bodem ať jablko padá o kousek rychleji (<code>jablko.vy = 120 + skore * 8</code>). Testy to nehlídají, ale zkus si to zahrát.</p>`,
    task:`Přidej <code>zivoty = 3</code> a <code>konec = false</code>. Propadnutí ubere život, při 0 nastav <code>konec</code>. Když je konec, <code>update</code> nic nehýbe; Enter zavolá <code>restart()</code> (skóre 0, 3 životy, nové jablko). V <code>draw</code> ukaž srdíčka a nápis o konci.`,
    html:CANVAS_HTML, fixed:CANVAS_CSS, prelude:[P_SMYCKA,P_KLAVESY,P_KOLIZE].join("\n\n"),
    starter:APPLE_2, solution:APPLE_3,
    hints:["Na začátek <code>update</code>: <code>if (konec) { if (klavesy.has(\"Enter\")) restart(); return; }</code>","Při propadnutí: <code>zivoty--; if (zivoty &lt;= 0) konec = true; noveJablko();</code>"],
    tests:[
      {label:"3× propadnutí = konec hry",act:`kosik.x=200;for(let i=0;i<3;i++){jablko.x=0;jablko.y=platno.height+1;update(0)}`,expr:"[zivoty,konec]",expect:[0,true]},
      {label:"Po konci se nic nehýbe",act:`klavesy.clear();klavesy.add("ArrowLeft");window.__x=kosik.x;window.__y=jablko.y;update(0.5);klavesy.clear()`,expr:"[kosik.x===__x,jablko.y===__y]",expect:[true,true]},
      {label:"Enter spustí novou hru",act:`klavesy.add("Enter");update(0);klavesy.clear()`,expr:"[skore,zivoty,konec]",expect:[0,3,false]} ] },

  /* ======================= FARMA OD A DO Z ======================= */
  farmLevel(1,{ xp:260, title:"Pole",
    slides:[
      { title:"Farma od A do Z", html:`<p>Teď postavíš jednu větší hru krok za krokem: <b>farmu</b>. Osm úrovní, každá přidá jednu mechaniku: setí, růst, sklizeň, obchod se semínky, ukládání, úkoly a rozšiřování.</p><p>Každá úroveň začíná vzorovým kódem z minulého kroku. Když chceš pokračovat ve <b>vlastním</b> kódu, klikni na „Navázat na můj kód“.</p>` },
      { title:"Stav → obrazovka", html:`<p>Celá hra je pole objektů. Každé políčko má <code>stav</code>: <code>"prazdne"</code>, <code>"roste"</code>, <code>"zrale"</code>.</p><pre class="mini">const pole = Array.from({ length: 9 }, () =&gt; ({ stav: "prazdne" }));</pre><p>Funkce <code>render()</code> z pole vždy postaví tlačítka znovu. Nikdy neměníš tlačítka přímo — měníš stav a zavoláš <code>render()</code>.</p>` } ],
    task:`Vytvoř <code>pole</code> s 9 prázdnými políčky. V <code>render()</code> pro každé políčko vytvoř <code>button</code> s třídou <code>policko</code> a stavem (<code>"policko prazdne"</code>), uloženým indexem v <code>data-i</code> a emoji z <code>emoji(p)</code>, a vlož je do <code>#pole</code>. Ukaž i mince.`,
    starter:`// ===== stav hry =====\nlet mince = 10;\n// TODO: pole s 9 políčky { stav: "prazdne" }\nconst poleEl = document.querySelector("#pole");\nconst minceEl = document.querySelector("#mince");\n\nfunction emoji(p) {\n  return "🟫";\n}\n\nfunction render() {\n  // TODO: pro každé políčko tlačítko .policko do #pole\n  minceEl.textContent = mince;\n}\n\nrender();`,
    hints:["<code>const pole = Array.from({ length: 9 }, () =&gt; ({ stav: \"prazdne\" }));</code>","<code>poleEl.replaceChildren(...pole.map((p, i) =&gt; { const btn = document.createElement(\"button\"); btn.className = \"policko \" + p.stav; btn.dataset.i = i; btn.textContent = emoji(p); return btn; }));</code>"],
    tests:[
      {label:"Stav: 9 prázdných políček",expr:`pole.length===9&&pole.every(p=>p.stav==="prazdne")`,expect:true},
      {label:"Na obrazovce 9 tlačítek .policko",expr:`document.querySelectorAll("#pole button.policko").length`,expect:9},
      {label:"Tlačítka mají emoji a data-i",expr:`[...document.querySelectorAll("#pole .policko")].map(b=>b.textContent+b.dataset.i).slice(0,3)`,expect:["🟫0","🟫1","🟫2"]},
      {label:"Mince: 10",expr:`document.querySelector("#mince").textContent`,expect:"10"} ] }),
  farmLevel(2,{ xp:260, title:"Setí",
    theory:`<p>Kliknutí na políčko obslouží <b>jeden posluchač na celém poli</b> (delegace). Tlačítka se při každém <code>render()</code> vytvoří znovu, takže posluchač na jednotlivých tlačítkách by se ztratil.</p><pre class="mini">const btn = e.target.closest(".policko");\nconst p = pole[btn.dataset.i];</pre>`,
    task:`Klik na <b>prázdné</b> políčko, když máš aspoň 5 🪙: políčko dostane <code>stav: "roste"</code> a <code>rust: 0</code>, mince −5, pak <code>render()</code>. Rostoucí políčko ukazuje 🌱.`,
    hints:["<code>poleEl.addEventListener(\"click\", e =&gt; { const btn = e.target.closest(\".policko\"); if (!btn) return; const p = pole[btn.dataset.i]; … render(); });</code>","<code>if (p.stav === \"prazdne\" &amp;&amp; mince &gt;= 5) { p.stav = \"roste\"; p.rust = 0; mince -= 5; }</code> a do <code>emoji</code>: <code>if (p.stav === \"roste\") return \"🌱\";</code>"],
    tests:[
      {label:"Zasazení: roste, −5 🪙",act:click(0),expr:`[pole[0].stav,mince,document.querySelector("#mince").textContent]`,expect:["roste",5,"5"]},
      {label:"Rostoucí políčko ukazuje 🌱",expr:`document.querySelectorAll("#pole .policko")[0].textContent`,expect:"🌱"},
      {label:"Bez peněz se nezasadí",act:`${click(1)};${click(2)}`,expr:`[pole[1].stav,pole[2].stav,mince]`,expect:["roste","prazdne",0]} ] }),
  farmLevel(3,{ xp:280, title:"Čas a růst",
    theory:`<p>Farma žije, i když neklikáš. Funkce <code>tick()</code> posune čas o jeden krok: každé rostoucí políčko povyroste (<code>rust++</code>), a když dosáhne 3, dozraje.</p><p><code>setInterval(tick, 1000)</code> ji spustí každou sekundu. Testy si čas „přetočí“ samy, takže nemusíš čekat.</p>`,
    task:`Napiš <code>tick()</code>: rostoucím políčkům zvyš <code>rust</code>, při <code>rust &gt;= 3</code> nastav <code>stav: "zrale"</code>, na konci <code>render()</code>. Spouštěj ji každou sekundu. Zralé políčko ukazuje 🥕.`,
    hints:["<code>function tick() { for (const p of pole) { if (p.stav !== \"roste\") continue; p.rust++; if (p.rust &gt;= 3) p.stav = \"zrale\"; } render(); }</code>","<code>setInterval(tick, 1000);</code> a do emoji <code>if (p.stav === \"zrale\") return \"🥕\";</code>"],
    tests:[
      {label:"Po 2 sekundách ještě roste",act:`${click(0)};__sekunda(2)`,expr:"[pole[0].stav,pole[0].rust]",expect:["roste",2]},
      {label:"Po 3. sekundě dozraje 🥕",act:`__sekunda(1)`,expr:`[pole[0].stav,document.querySelectorAll("#pole .policko")[0].textContent]`,expect:["zrale","🥕"]},
      {label:"Prázdná políčka nerostou",expr:"pole[1].stav",expect:"prazdne"} ] }),
  farmLevel(4,{ xp:280, title:"Sklizeň",
    theory:`<p>Teď smyčka hry: zasaď → počkej → skliď → zasaď víc. Mrkev stojí 5 a vynese 12 — každá sklizeň je zisk 7. Počet sklizní si drž v <code>sklizeno</code>, budou se hodit pro úkoly.</p><p>Pozor na pořadí v posluchači: když nejdřív sklidíš a hned potom testuješ „je prázdné → zasaď“, políčko se ti hned znovu osází.</p>`,
    task:`Klik na <b>zralé</b> políčko: +12 🪙, <code>sklizeno++</code>, políčko zase <code>"prazdne"</code>. Ukaž <code>sklizeno</code> v <code>#sklizeno</code>.`,
    hints:["Za blok se setím přidej: <code>if (p.stav === \"zrale\") { mince += 12; sklizeno++; p.stav = \"prazdne\"; }</code>","Proměnné: <code>let sklizeno = 0;</code>, <code>const sklizenoEl = document.querySelector(\"#sklizeno\");</code> a v render <code>sklizenoEl.textContent = sklizeno;</code>"],
    tests:[
      {label:"Sklizeň: +12 🪙 a prázdné políčko",act:`${click(0)};__sekunda(3);${click(0)}`,expr:"[mince,pole[0].stav]",expect:[17,"prazdne"]},
      {label:"Počítá sklizně",expr:`[sklizeno,document.querySelector("#sklizeno").textContent]`,expect:[1,"1"]},
      {label:"Rostoucí políčko sklidit nejde",act:`${click(1)};${click(1)}`,expr:"[pole[1].stav,mince]",expect:["roste",12]} ] }),
  farmLevel(5,{ xp:300, title:"Obchod se semínky",
    theory:`<p>Jedna plodina je nuda. V připraveném kódu jsou <code>PLODINY</code> — každá má cenu, dobu růstu a zisk. Tak se dělá většina her: <b>čísla v datech</b>, ne natvrdo v kódu. Designér pak ladí ekonomiku bez programátora.</p><p>Políčko si zapamatuje, co na něm roste (<code>p.plodina</code>), a všude místo pevných čísel čteš z <code>PLODINY[p.plodina]</code>.</p>`,
    task:`1) Posluchač na <code>#obchod</code> nastaví <code>vybrane</code> podle <code>data-semeno</code> (výchozí <code>"mrkev"</code>) a v render vybranému tlačítku dej <code>aria-pressed="true"</code><br>2) setí použije cenu vybrané plodiny a uloží <code>p.plodina</code><br>3) růst, emoji i zisk čti z <code>PLODINY[p.plodina]</code>`,
    hints:["Setí: <code>if (p.stav === \"prazdne\" &amp;&amp; mince &gt;= PLODINY[vybrane].cena) { …; p.plodina = vybrane; mince -= PLODINY[vybrane].cena; }</code>","V tick: <code>if (p.rust &gt;= PLODINY[p.plodina].rust)</code>, v emoji: <code>return PLODINY[p.plodina].emoji;</code>, při sklizni <code>mince += PLODINY[p.plodina].zisk;</code>"],
    tests:[
      {label:"Výběr semínka v obchodě",act:`document.querySelector('[data-semeno="dyne"]').click()`,expr:`[vybrane,document.querySelector('[data-semeno="dyne"]').getAttribute("aria-pressed"),document.querySelector('[data-semeno="mrkev"]').getAttribute("aria-pressed")]`,expect:["dyne","true","false"]},
      {label:"Na dýni (20) nemáš → nezasadí se",act:click(0),expr:"[pole[0].stav,mince]",expect:["prazdne",10]},
      {label:"Dýně: −20, roste 6 ticků",act:`mince=30;${click(0)};__sekunda(5)`,expr:"[pole[0].plodina,pole[0].stav,mince]",expect:["dyne","roste",10]},
      {label:"Dozraje 🎃 a vynese 60",act:`__sekunda(1);window.__e=document.querySelectorAll("#pole .policko")[0].textContent;${click(0)}`,expr:"[__e,mince]",expect:["🎃",70]} ] }),
  farmLevel(6,{ xp:320, title:"Uložení hry",
    theory:`<p>Hráč zavře prohlížeč a farma zmizí? To nejde. <code>localStorage</code> si pamatuje texty i po zavření stránky:</p><pre class="mini">localStorage.setItem("farma", JSON.stringify(stav));\nconst data = JSON.parse(localStorage.getItem("farma"));</pre><p>Nejjednodušší je volat <code>ulozit()</code> na konci <code>render()</code> — co se ukáže, to se uloží. Při startu hry nejdřív <code>nacist()</code>, pak <code>render()</code>. Když nic uloženého není, <code>getItem</code> vrátí <code>null</code> a <code>JSON.parse(null)</code> je <code>null</code>.</p>`,
    task:`Napiš <code>ulozit()</code> (uloží <code>{ mince, sklizeno, pole }</code> pod klíčem <code>"farma"</code>) a <code>nacist()</code> (když něco je, obnoví mince, sklizeno a obsah pole). <code>render()</code> vždy uloží, při startu načti.`,
    hints:["<code>function ulozit() { localStorage.setItem(\"farma\", JSON.stringify({ mince, sklizeno, pole })); }</code>","<code>pole</code> je <code>const</code>, tak ho nepřepisuj, ale vyměň obsah: <code>pole.splice(0, pole.length, ...data.pole);</code>"],
    tests:[
      {label:"Po zasazení je hra uložená",act:click(0),expr:`(()=>{const d=JSON.parse(localStorage.getItem("farma"));return [d.mince,d.pole[0].stav,d.pole.length]})()`,expect:[5,"roste",9]},
      {label:"nacist() obnoví uloženou hru",act:`localStorage.setItem("farma",JSON.stringify({mince:99,sklizeno:7,pole:Array.from({length:9},()=>({stav:"prazdne"}))}));nacist();render()`,expr:`[document.querySelector("#mince").textContent,document.querySelector("#sklizeno").textContent,pole[0].stav]`,expect:["99","7","prazdne"]},
      {label:"Prázdné úložiště nic nerozbije",act:`localStorage.removeItem("farma");nacist()`,expr:"mince",expect:99} ] }),
  farmLevel(7,{ xp:340, title:"Úkoly a odměny",
    theory:`<p>Úkoly dávají hráči cíl. V připraveném kódu je pole <code>UKOLY</code> — každý má text, odměnu a funkci <code>splneno(stav)</code>.</p><p>Odměna se smí dát <b>jen jednou</b>. Hotové úkoly si pamatuj v <code>Set</code> podle indexu a <b>ulož je</b> — jinak by se po načtení hry odměny vyplatily znovu (klasický bug, který hráči rádi zneužijí).</p>`,
    task:`1) <code>let hotove = new Set()</code> a <code>zkontrolujUkoly()</code>: nesplněný úkol, který už platí, přidá do <code>hotove</code> a připíše odměnu<br>2) volej ji na začátku <code>render()</code><br>3) vypiš úkoly do <code>#ukoly</code> jako <code>li</code> s textem <code>Skliď 3 plodiny (+20 🪙)</code>, hotové s třídou <code>hotovo</code><br>4) ukládej a načítej i <code>ukoly: [...hotove]</code>`,
    hints:["<code>UKOLY.forEach((u, i) =&gt; { if (!hotove.has(i) &amp;&amp; u.splneno({ mince, sklizeno, pole })) { hotove.add(i); mince += u.odmena; } });</code>","Uložení: přidej <code>ukoly: [...hotove]</code>, v nacist <code>hotove = new Set(data.ukoly ?? []);</code>"],
    tests:[
      {label:"Úkoly jsou vypsané",expr:`[...document.querySelectorAll("#ukoly li")].map(l=>l.textContent)`,expect:["Skliď 3 plodiny (+20 🪙)","Měj 100 mincí (+50 🪙)","Zasaď dýni (+10 🪙)"]},
      {label:"Splněný úkol: odměna a hotovo",act:`mince=200;render()`,expr:`[mince,document.querySelectorAll("#ukoly li")[1].classList.contains("hotovo")]`,expect:[250,true]},
      {label:"Odměna jen jednou",act:"render();render()",expr:"mince",expect:250},
      {label:"3 sklizně → +20",act:`${click(0)};${click(1)};${click(2)};__sekunda(3);${click(0)};${click(1)};${click(2)}`,expr:"mince",expect:291},
      {label:"Po načtení se odměny nevyplatí znovu",act:"nacist();render()",expr:"mince",expect:291} ] }),
  farmLevel(8,{ xp:700, boss:true, wide:true, game:{name:"Moje farma",emoji:"🥕"}, title:"Velká farma",
    theory:`<p>Finále: hráč s dost penězi chce <b>růst</b>. Tlačítko přikoupí 3 políčka. Cena roste: 50, 100, 200… Nemusíš ji ukládat — vypočítáš ji z velikosti pole:</p><pre class="mini">50 * 2 ** ((pole.length - 9) / 3)</pre><p>Protože render, ukládání i úkoly pracují s celým polem, nová políčka fungují „sama“. To je odměna za čistou architekturu: stav → render.</p><p>Hotovou farmu najdeš v <b>Arkádě</b> na mapě kurzu.</p>`,
    task:`1) <code>cenaRozsireni()</code> vrátí 50, 100, 200… podle velikosti pole<br>2) <code>#rozsirit</code> ukazuje <code>Přikoupit pole (50 🪙)</code><br>3) když máš dost, odečte cenu a přidá 3 prázdná políčka<br>4) nová políčka jde osít a ukládají se`,
    hints:["<code>function cenaRozsireni() { return 50 * 2 ** ((pole.length - 9) / 3); }</code> a v render text tlačítka.","<code>pole.push({ stav: \"prazdne\" }, { stav: \"prazdne\" }, { stav: \"prazdne\" });</code> — pak <code>render()</code>."],
    tests:[
      {group:"Rozšíření", label:"Tlačítko ukazuje cenu 50",expr:`document.querySelector("#rozsirit").textContent`,expect:"Přikoupit pole (50 🪙)"},
      {group:"Rozšíření", label:"Bez peněz nic nekoupíš",act:`document.querySelector("#rozsirit").click()`,expr:"pole.length",expect:9},
      {group:"Rozšíření", label:"Nákup: 12 políček, cena 100",act:`mince=200;render();document.querySelector("#rozsirit").click()`,expr:`[pole.length,mince,document.querySelectorAll("#pole .policko").length,document.querySelector("#rozsirit").textContent]`,expect:[12,200,12,"Přikoupit pole (100 🪙)"]},
      {group:"Rozšíření", label:"Druhý nákup: 15 políček, cena 200",act:`document.querySelector("#rozsirit").click()`,expr:`[pole.length,mince,document.querySelector("#rozsirit").textContent]`,expect:[15,100,"Přikoupit pole (200 🪙)"]},
      {group:"Celá hra", label:"Nové políčko jde osít",act:click(14),expr:"[pole[14].stav,mince]",expect:["roste",95]},
      {group:"Celá hra", label:"Uložená hra má 15 políček",expr:`JSON.parse(localStorage.getItem("farma")).pole.length`,expect:15},
      {group:"Celá hra", label:"Sklizeň na novém políčku",act:`__sekunda(3);${click(14)}`,expr:"[pole[14].stav,mince,sklizeno]",expect:["prazdne",107,1]} ] }),
  ],
  achievements:[
    {id:"hry-click", name:"Zlatokop", desc:"Postav klikačku s havíři.", glyph:"⛏️", color:"var(--c-game)", test:(s,cs)=>moduleDone(cs,"hry","clicker")},
    {id:"hry-guess", name:"Jasnovidec", desc:"Dokonči Hádej číslo.", glyph:"🔢", color:"var(--m-content)", test:(s,cs)=>moduleDone(cs,"hry","guess")},
    {id:"hry-rps",   name:"Taktik", desc:"Dokonči Kámen, nůžky, papír.", glyph:"✂️", color:"var(--m-padding)", test:(s,cs)=>moduleDone(cs,"hry","rps")},
    {id:"hry-canvas",name:"Malíř pixelů", desc:"Dokonči Plátno a pohyb.", glyph:"🕹️", color:"var(--m-border)", test:(s,cs)=>moduleDone(cs,"hry","canvas")},
    {id:"hry-apple", name:"Newton", desc:"Dokonči Chyť jablko.", glyph:"🍎", color:"var(--m-margin)", test:(s,cs)=>moduleDone(cs,"hry","apple")},
    {id:"hry-farm",  name:"Farmář", desc:"Postav celou farmu od A do Z.", glyph:"🥕", color:"var(--accent)", test:(s,cs)=>!!cs.done["gf-8"]},
    {id:"hry-arcade",name:"Majitel arkády", desc:"Měj v Arkádě všech 5 her.", glyph:"👾", color:"var(--c-game)", test:(s,cs)=>["gc-3","gg-2","gr-2","gk-3","gf-8"].every(id=>cs.done[id])},
  ]
});
