import { readFile,writeFile,stat } from "node:fs/promises";
import { resolve,dirname,join } from "node:path";
import { fileURLToPath,pathToFileURL } from "node:url";
import { recipes } from "../templates/pitch-inspired/deck-recipes.mjs";
import {validatePreviewCatalog} from "../src/lib/motionbrew/preview-status.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const staticDeckIds=["editorial","board-report","kpi-report"];
const legalId=/^[a-z0-9-]+$/;

export function createReleaseRoutes(registry,recipeIds=[]){
 const ids=Array.isArray(registry?.items)?registry.items.map(item=>item.name):[];
 return [
  "/index.html","/r/index.json",
  ...ids.map(name=>"/r/"+name+".json"),
  ...[...staticDeckIds,...recipeIds].map(id=>"/decks/pitch-inspired/"+id+".html"),
  "/consumers/dashboard/index.html","/consumers/deck/index.html"
 ];
}

export function checkReleaseInventory({registry,manifest,previewCatalog,recipeIds=[],files}){
 const errors=[];
 if(!Array.isArray(registry?.items))errors.push("Registry items array missing");
 if(!Array.isArray(manifest?.components))errors.push("Provider manifest components array missing");
 const sourceNames=(registry?.items||[]).map(item=>item.name);
 const providerSlugs=(manifest?.components||[]).map(item=>item.slug);
 if(new Set(sourceNames).size!==sourceNames.length)errors.push("Duplicate registry entry");
 if(sourceNames.some(name=>!legalId.test(name)))errors.push("Unsafe registry identifier");
 if(recipeIds.some(id=>!legalId.test(id)))errors.push("Unsafe deck recipe identifier");
 if(providerSlugs.some(slug=>!sourceNames.includes("motionbrew-"+slug)))errors.push("Provider manifest item missing from source registry");
 const catalogAudit=validatePreviewCatalog(previewCatalog,manifest);
 if(!catalogAudit.valid)errors.push(...catalogAudit.errors.map(e=>"Invalid preview catalog: "+e));
 const routes=createReleaseRoutes(registry,recipeIds);
 if(new Set(routes).size!==routes.length)errors.push("Duplicate release asset route");
 for(const route of routes){
  const contents=files?.get(route);
  if(typeof contents!=="string"||!contents.trim()){errors.push("Missing or empty release asset: "+route);continue;}
  if(route.endsWith(".html")){
   if(!/^\s*<!doctype\s+html\s*>/i.test(contents)||!/<html\b/i.test(contents))errors.push("Malformed HTML release asset: "+route);
  }else if(route.endsWith(".json")){
   let data;
   try{data=JSON.parse(contents)}catch{errors.push("Malformed JSON release asset: "+route);continue}
   if(route==="/r/index.json"){
    if(!Array.isArray(data.items)||data.items.length!==sourceNames.length)errors.push("Invalid registry index: "+route);
   }else{
    const id=route.slice("/r/".length,-".json".length);
    if(data?.name!==id||!Array.isArray(data.files)||data.files.length<1)errors.push("Incorrect registry item payload: "+route);
   }
  }
 }
 return {valid:errors.length===0,errors,requiredRoutes:routes};
}

export function buildReleaseManifest({registry,manifest,previewCatalog,recipeIds=[],files,commit=null}){
 const check=checkReleaseInventory({registry,manifest,previewCatalog,recipeIds,files});
 const readiness={"source-only":0,"fixture-ready":0,"demo-verified":0,"consumer-verified":0};
 for(const entry of previewCatalog?.components||[]){
  if(Object.prototype.hasOwnProperty.call(readiness,entry.status))readiness[entry.status]++;
 }
 return {
  schemaVersion:1,
  project:"personal-component-library",
  releaseTrack:"isolated-review",
  sourceCommit:commit,
  inventory:{
   registryEntries:registry?.items?.length||0,
   motionbrewEntries:manifest?.components?.length||0,
   htmlDecks:staticDeckIds.length+recipeIds.length,
   independentConsumers:2
  },
  readiness,
  checks:{valid:check.valid,requiredRoutes:check.requiredRoutes.length,errors:check.errors},
  certification:"Source and preview integrity only; per-component interaction certification is separate."
 };
}

async function runCLI(){
 const config={
  registry:JSON.parse(await readFile(join(root,"registry.json"),"utf8")),
  manifest:JSON.parse(await readFile(join(root,"src/lib/motionbrew/manifest.json"),"utf8")),
  previewCatalog:JSON.parse(await readFile(join(root,"src/lib/motionbrew/preview-catalog.json"),"utf8")),
  recipeIds:Object.keys(recipes)
 };
 const routes=createReleaseRoutes(config.registry,config.recipeIds);
 const files=new Map();
 for(const route of routes){
  const path=resolve(root,"dist","."+route);
  try{
   const details=await stat(path);
   if(details.isFile()&&details.size>0)files.set(route,await readFile(path,"utf8"));
  }catch{/* missing assets reported below */}
 }
 const report=buildReleaseManifest({...config,files,commit:process.env.GITHUB_SHA||null});
 if(!report.checks.valid)throw new Error("P4 release gate failed:\n"+report.checks.errors.join("\n"));
 const output=join(root,"dist","release-manifest.json");
 if(process.argv.includes("--write")){
  await writeFile(output,JSON.stringify({...report,generatedAt:new Date().toISOString()},null,2)+"\n");
 }else if(process.argv.includes("--verify")){
  const prior=JSON.parse(await readFile(output,"utf8"));
  if(prior.inventory.registryEntries!==report.inventory.registryEntries||prior.checks.requiredRoutes!==report.checks.requiredRoutes||!prior.checks.valid)throw new Error("Stale release manifest: "+output);
 }else throw new Error("Expected --write or --verify");
 console.log("P4 release gate: "+JSON.stringify({valid:true,routes:report.checks.requiredRoutes,inventory:report.inventory,readiness:report.readiness}));
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 runCLI().catch(error=>{console.error(error);process.exitCode=1});
}
