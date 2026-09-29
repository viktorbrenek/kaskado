#!/usr/bin/env node
/* Kaskáda build — bez závislostí. Spuštění: node build.mjs [--target=static|claude]
   static (výchozí) → dist/index.html + dist/fonts/  (GitHub Pages)
   claude           → dist/claude-artifact.html     (obsah pro artifact na claude.ai)          */
import fs from "node:fs"; import path from "node:path";
const target=(process.argv.find(a=>a.startsWith("--target="))||"--target=static").split("=")[1];
const root=path.dirname(new URL(import.meta.url).pathname), src=p=>path.join(root,"src",p);
const list=(dir)=>fs.readdirSync(src(dir)).filter(f=>f.endsWith(".js")).sort().map(f=>path.join(dir,f));
const app=list("app"), courseDirs=fs.readdirSync(src("courses"),{withFileTypes:true});
const courses=[
  ...courseDirs.filter(d=>d.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(d=>list(path.join("courses",d.name))),
  ...courseDirs.filter(d=>d.isFile()&&d.name.endsWith(".js")).map(d=>d.name).sort().map(f=>path.join("courses",f)) ];
const order=[...app.filter(f=>path.basename(f)<"50"), ...courses, ...app.filter(f=>path.basename(f)>="50")];
const js=order.map(f=>`/* ==== ${f} ==== */\n`+fs.readFileSync(src(f),"utf8")).join("\n");
const config=JSON.parse(fs.readFileSync(path.join(root,"kaskada.config.json"),"utf8"));
let page=fs.readFileSync(src("page.html"),"utf8");
const GFONTS=`<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;600;800&family=Fraunces:opsz,wght@9..144,400;9..144,700&family=Manrope:wght@400;600;800&family=Archivo+Black&display=swap">`;
fs.mkdirSync(path.join(root,"dist"),{recursive:true});
if(target==="claude"){
  page=page.replace("<!--FONTS-->",GFONTS).replace("<!--SCRIPT-->",`<script>\n${js}\n</script>`);
  fs.writeFileSync(path.join(root,"dist/claude-artifact.html"),page);
  console.log("dist/claude-artifact.html",(page.length/1024).toFixed(0)+" KB");
} else {
  const cfg={mode:"static",...config};
  page=page.replace("<!--FONTS-->",`<link rel="stylesheet" href="fonts/fonts.css">`)
           .replace("<!--SCRIPT-->",`<script>window.KASKADA=${JSON.stringify(cfg)};</script>\n<script>\n${js}\n</script>`);
  const html=`<!doctype html>\n<html lang="cs">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="description" content="Kaskáda — hra, ve které se naučíš CSS od úplných základů po moderní layouty. Zdarma a open source.">\n<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%238cb6c0'/%3E%3Ctext x='16' y='21' font-size='13' text-anchor='middle' font-family='monospace' font-weight='700' fill='%2314203a'%3E%7B%7D%3C/text%3E%3C/svg%3E">\n<style>html{color-scheme:light}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif;background:#f3f5f9}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n${page}\n</body>\n</html>\n`;
  fs.writeFileSync(path.join(root,"dist/index.html"),html);
  fs.cpSync(path.join(root,"public"),path.join(root,"dist"),{recursive:true});
  console.log("dist/index.html",(html.length/1024).toFixed(0)+" KB");
}
