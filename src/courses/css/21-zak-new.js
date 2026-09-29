/* Modul „zak-new“ — úrovně se zobrazí v tomto pořadí. Šablona nové úrovně: viz CONTRIBUTING.md */
addLevels("css", [
  { id:"z-5", module:"zak-new", project:true, xp:1800, requires:["nov-color","nov-scroll"], title:"Mobilní appka Běžec — onboarding",
    brief:{ client:"Běžec, aplikace pro začínající běžce",
      story:"Tým potřebuje webový prototyp onboardingu pro testování s uživateli. Tři obrazovky, přejíždění prstem, dvě akce dole. Ať to působí nativně — a hlídá si světlý i tmavý režim sám.",
      style:"Soft UI / nativní mobil", keywords:["oklch paleta","light-dark()","velká zaoblení","dotykové cíle 44px+","scroll-snap"],
      palette:[["Primární","oklch(62% 0.21 30)"],["Pozadí světlé","#ffffff"],["Pozadí tmavé","#0c0c0f"],["Text","#16161a"]],
      fonts:[["Vše","system-ui (SF / Roboto)"]],
      steps:["Tokeny v oklch() a barvy přes light-dark()","Slidy: vodorovný scroll-snap, každý slide přes celou šířku","Layout appky: sloupec, akce přilepené dole","Tlačítka: celá šířka, výška aspoň 44px, zaoblení 12px+, čitelný kontrast","Nadpisy slidů vyvážené (text-wrap: balance)"] },
    html:`<div class="phone"><div class="app">
<div class="status"><span>9:41</span><span>●●●</span></div>
<div class="slides">${[["Běhej bez stresu","Plán na 8 týdnů od nuly do 5 kilometrů. Tempo si určuješ ty.","1"],["Hlas v uších","Trenérka ti řekne, kdy běžet a kdy jít. Na displej koukat nemusíš.","2"],["Oslav každý krok","Odznaky za první kilometr, první týden i první deštivý běh.","3"]].map(([h,p,n])=>`<section class="slide"><div class="art">${n}</div><h2>${h}</h2><p>${p}</p></section>`).join("")}</div>
<div class="dots"><i></i><i></i><i></i></div>
<div class="actions"><button class="primary">Začít zdarma</button><button class="ghost">Už mám účet</button></div>
</div></div>`,
    fixed:`.phone{width:340px;height:640px;margin:0 auto;border:10px solid #16161a;border-radius:44px;overflow:hidden}h2,p{margin:0}button{font:inherit;cursor:pointer}.dots{display:flex;gap:6px;justify-content:center}.dots i{width:8px;height:8px;border-radius:50%;background:currentColor;opacity:.3}.dots i:first-child{opacity:1}`,
    starter:`/* Běžec — onboarding\n   Primární oklch(62% 0.21 30) · světlé #ffffff · tmavé #0c0c0f · text #16161a */\n\n.app {\n  \n}\n`,
    solution:`.app {
  --primary: oklch(52% 0.2 30);
  --bg: light-dark(#ffffff, #0c0c0f);
  --text: light-dark(#16161a, #f2f2f5);
  --soft: light-dark(oklch(96% 0.02 30), oklch(22% 0.03 30));
  color-scheme: light dark;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 20px 24px;
  box-sizing: border-box;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
}
.status { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }

.slides {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  margin: 0 -20px;
  scrollbar-width: none;
}
.slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
  box-sizing: border-box;
  padding: 0 20px;
  display: grid;
  gap: 12px;
  align-content: start;
}
.art {
  aspect-ratio: 1;
  border-radius: 32px;
  background: var(--soft);
  display: grid;
  place-items: center;
  font-size: 96px;
  font-weight: 800;
  color: var(--primary);
}
.slide h2 { font-size: 28px; line-height: 1.1; text-wrap: balance; }
.slide p { opacity: .75; text-wrap: pretty; }

.actions { margin-top: auto; display: grid; gap: 10px; }
.actions button { min-height: 52px; border-radius: 16px; font-weight: 700; font-size: 17px; width: 100%; }
.primary { background: var(--primary); color: #fff; border: 0; }
.ghost { background: transparent; color: var(--text); border: 1px solid color-mix(in oklch, var(--text) 25%, transparent); }`,
    hints:["Tokeny: <code>--primary: oklch(…)</code>, <code>--bg: light-dark(#ffffff, #0c0c0f)</code> a na <code>.app</code> <code>color-scheme: light dark</code>. Slidy: <code>.slides { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }</code>, <code>.slide { flex: 0 0 100%; scroll-snap-align: center; }</code>","Akce dolů: <code>.app</code> jako flex sloupec s <code>height: 100%</code> a <code>.actions { margin-top: auto; }</code>. Pozor na kontrast bílé na primární barvě — ztmav <code>L</code> v oklch."],
    checks:[
      {group:"Tokeny", label:"Barvy v oklch() a light-dark()", test:c=>c.uses(/oklch\(/)&&c.uses(/light-dark\(/)},
      {group:"Tokeny", label:"Pozadí appky podle schématu (světlé = #ffffff)", test:c=>c.cs(".app").backgroundColor==="rgb(255, 255, 255)"&&/light-dark\(/.test(c.css())},
      {group:"Slidy", label:"Vodorovný scroll-snap na .slides", test:c=>{const s=c.cs(".slides");return /auto|scroll/.test(s.overflowX)&&/^x mandatory|^x proximity|^inline/.test(s.scrollSnapType)}},
      {group:"Slidy", label:"Slide má šířku celé oblasti a snap-align", test:c=>c.near(c.rect(".slide").width,c.q(".slides").clientWidth,1)&&c.cs(".slide").scrollSnapAlign!=="none"},
      {group:"Layout", label:"Appka jako sloupec přes celou výšku telefonu", test:c=>{const s=c.cs(".app");return s.display==="flex"&&s.flexDirection==="column"&&c.near(c.rect(".app").height,c.q(".phone").clientHeight,2)}},
      {group:"Layout", label:"Akce přilepené dole", test:c=>{const a=c.rect(".app"),x=c.rect(".actions");return a.bottom-x.bottom<=40&&x.top>c.rect(".dots").bottom}},
      {group:"Tlačítka", label:"Celá šířka a výška aspoň 44px", test:c=>c.qa(".actions button").every(b=>{const r=b.getBoundingClientRect();return r.height>=44&&c.near(r.width,c.rect(".actions").width,1)})},
      {group:"Tlačítka", label:"Zaoblení aspoň 12px", test:c=>parseFloat(c.cs(".primary").borderTopLeftRadius)>=12},
      {group:"Tlačítka", label:"Primární tlačítko: kontrast ≥ 4.5 : 1", test:c=>c.contrast(".primary")>=4.5},
      {group:"Detaily", label:"Nadpisy slidů s text-wrap: balance", test:c=>c.cs(".slide h2").getPropertyValue("text-wrap-style")==="balance"} ] }
]);
