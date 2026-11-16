import { readFile, mkdir, writeFile, mkdtemp, rm, cp } from "node:fs/promises";
import { resolve, dirname, join, posix, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export const flagshipSlugs = Object.freeze([
 "blur-text","gradient-text","flip-words","magnetic-button",
 "pill-tabs","morph-search","search-modal","activity-grid",
 "goal-gauge","metric-split","month-calendar","message-composer",
 "toast-stack","depth-carousel","prism-carousel","wave-text"
]);
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");

export function normalizeImportPackage(specifier){
 if(typeof specifier!=="string"||specifier.startsWith(".")||specifier.startsWith("/")||specifier.startsWith("node:"))return null;
 if(specifier.startsWith("@"))return specifier.split("/").slice(0,2).join("/");
 return specifier.split("/")[0];
}
export function auditRegistryItem(item){
 const undeclaredPackages=new Set(),missingLocalImports=new Set();
 const declared=new Set(["react","react-dom",...(item.dependencies||[])]);
 const files=Array.isArray(item.files)?item.files:[];
 const filePaths=new Set(files.map(file=>file.path));
 for(const file of files){
  for(const match of String(file.content||"").matchAll(/\b(?:import|export)\s+(?:[^"'\n;]*?\s+from\s*)?["']([^"']+)["']/g)){
   const specifier=match[1];
   const pkg=normalizeImportPackage(specifier);
   if(pkg){
    if(!declared.has(pkg))undeclaredPackages.add(pkg);
   }else if(specifier.startsWith(".")){
    const expected=posix.normalize(posix.join(posix.dirname(file.path),specifier));
    if(![expected,expected+".tsx",expected+".ts",expected+".jsx",expected+".js",expected+".mjs",expected+".css",expected+"/index.tsx",expected+"/index.ts"].some(path=>filePaths.has(path))){
     missingLocalImports.add(file.path+": "+specifier);
    }
   }
  }
 }
 return {name:item.name,undeclaredPackages:[...undeclaredPackages].sort(),missingLocalImports:[...missingLocalImports].sort()};
}

async function loadItems(){
 const items=[];
 for(const slug of flagshipSlugs){
  const file=join(root,"public","r","motionbrew-"+slug+".json");
  let item;
  try{item=JSON.parse(await readFile(file,"utf8"))}catch(e){throw new Error("Generated registry missing for "+slug+": "+String(e))}
  const a=auditRegistryItem(item);
  if(a.undeclaredPackages.length||a.missingLocalImports.length)throw new Error("Consumer registry dependency audit failed: "+JSON.stringify(a));
  items.push({slug,item,exportName:slug.split("-").map(part=>part[0].toUpperCase()+part.slice(1)).join("")});
 }
 return items;
}

const quote=(s)=>JSON.stringify(s);
function makeEntry(items,context){
 const imports=items.map(({slug,exportName},i)=>'import { '+exportName+' as Comp'+i+' } from "./vendor/'+slug+'.tsx";').join("\n");
 const rows=items.map(({slug},i)=>'{slug:'+quote(slug)+',Component:Comp'+i+'}').join(",\n");
 // Use a different shell for marketing dashboards and presentation applications.
 const mode=context==="deck"?"Presentation consumer":"Dashboard consumer";
 return [
  'import React from "react";',
  'import {createRoot} from "react-dom/client";',
  'import "./styles.css";',
  imports,
  'const entries=['+rows+'];',
  'function App(){',
  ' const [active,setActive]=React.useState(0);',
  ' const chosen=entries[active];',
  ' return <main className='+quote(context==='deck'?'consumer-deck':'consumer-dashboard')+'>',
  ' <header><span>INDEPENDENT REGISTRY CONSUMER</span><h1>'+mode+'</h1><p>Components are copied from generated registry items, not imported from the main gallery.</p></header>',
  ' <nav aria-label="Components to test">{entries.map((item,i)=><button type="button" data-component={item.slug} aria-pressed={i===active} key={item.slug} onClick={()=>setActive(i)}>{item.slug}</button>)}</nav>',
  ' <section aria-label="Active component preview" data-active={chosen.slug}><chosen.Component/></section>',
  ' </main>',
  '}',
  'createRoot(document.getElementById("app")!).render(<App/>);'
 ].join("\n");
}

async function buildConsumer(items,context,publish=false){
 if(!["dashboard","deck"].includes(context))throw new Error("Unknown consumer context "+context);
 const temp=await mkdtemp(join(root,".consumer-"+context+"-"));
 try{
  await mkdir(join(temp,"vendor"),{recursive:true});
  for(const {slug,item}of items){
   if(item.files.length!==1)throw new Error("Flagship "+slug+" has "+item.files.length+" source files; requires explicit multi-file test handling");
   const src=item.files[0].content;
   if(!src||!src.includes("export const"))throw new Error("Flagship registry source missing named export: "+slug);
   await writeFile(join(temp,"vendor",slug+".tsx"),src);
  }
  await writeFile(join(temp,"index.html"),'<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="./main.tsx"></script></body></html>');
  await writeFile(join(temp,"main.tsx"),makeEntry(items,context));
  await writeFile(join(temp,"styles.css"),'@import "tailwindcss";\n@source "./vendor";\nbody{margin:0;font-family:Inter,system-ui,sans-serif;background:#f8fafb;color:#1f2937}\nmain{padding:24px;min-height:100vh;min-width:0;max-width:100%;overflow:clip}nav{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0;max-width:100%;min-width:0}button{border:1px solid #9ca3af;background:white;color:#111827;padding:9px;border-radius:7px;cursor:pointer}button[aria-pressed=true]{border-color:#111827;background:#e5e7eb}section{min-height:280px;min-width:0;max-width:100%;overflow:hidden;contain:layout paint} .consumer-deck section{aspect-ratio:16/9;background:#252932;padding:35px;color:#fff}header span{font-size:10px;letter-spacing:.12em}\n');
  await build({root:temp,configFile:false,plugins:[react(),tailwindcss()],base:"./",logLevel:"error",build:{outDir:join(temp,"dist"),emptyOutDir:true}});
  if(publish){
   const target=join(root,"public","consumers",context);
   await rm(target,{recursive:true,force:true});
   await mkdir(dirname(target),{recursive:true});
   await cp(join(temp,"dist"),target,{recursive:true});
  }
  return {context,components:items.length,built:true,published:publish};
 }finally{await rm(temp,{recursive:true,force:true})}
}

export async function verifyConsumerInstall(contexts=["dashboard","deck"],publish=false){
 const items=await loadItems();
 const results=[];
 for(const context of contexts)results.push(await buildConsumer(items,context,publish));
 return results;
}
const invoked=process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url;
if(invoked){
 const args=process.argv.slice(2);
 const publish=args.includes("--publish");
 const contexts=args.filter(arg=>arg!=="--publish");
 try{
  const results=await verifyConsumerInstall(contexts.length?contexts:["dashboard","deck"],publish);
  console.log("Independent consumer builds verified: "+JSON.stringify(results));
 }catch(e){console.error(e);process.exitCode=1}
}
