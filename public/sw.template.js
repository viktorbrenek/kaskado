/* Kaskáda — offline režim. Verzi a seznam souborů doplní build.mjs. */
const CACHE="kaskada-__VERSION__";
const PRECACHE=__FILES__;
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("kaskada-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return; const u=new URL(r.url); if(u.origin!==location.origin) return;
  if(r.mode==="navigate"){ e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put("./",cp)); return res; }).catch(()=>caches.match("./").then(m=>m||caches.match("./index.html")))); return; }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));
});
