import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const manifest=JSON.parse(await readFile(join(root,"registry.json"),"utf8"));
if(!Array.isArray(manifest.items))throw new Error("registry items required");
const names=new Set(manifest.items.map(i=>i.name));
if(names.size!==manifest.items.length)throw new Error("duplicate registry item");
const byName=new Map(manifest.items.map(i=>[i.name,i]));
const destination=join(root,"public","r");
await mkdir(destination,{recursive:true});
const sourcePaths=new Set();
function collect(itemName,seen=new Set()){
  if(seen.has(itemName))return [];
  seen.add(itemName);
  const item=byName.get(itemName);
  if(!item)throw new Error("Unknown registry dependency "+itemName);
  const files=(item.registryDependencies||[]).flatMap(dep=>collect(dep,seen));
  return files.concat(item.files||[]);
}
for(const item of manifest.items){
  const files=[];
  const seen=new Set();
  for(const file of collect(item.name)){
    if(typeof file.path!=="string"||file.path.includes("..")||file.path.startsWith("/"))throw new Error("Unsafe registry path");
    if(seen.has(file.path))continue;
    seen.add(file.path);
    const full=resolve(root,file.path);
    if(!full.startsWith(root+"/"))throw new Error("Registry path escapes project root");
    await access(full);
    files.push({...file,content:await readFile(full,"utf8")});
    sourcePaths.add(file.path);
  }
  const built={
    $schema:"https://ui.shadcn.com/schema/registry-item.json",
    name:item.name,type:item.type,title:item.title,description:item.description,
    dependencies:item.dependencies||[],
    registryDependencies:[], // Transitive source files are included for isolated installation.
    files
  };
  await writeFile(join(destination,item.name+".json"),JSON.stringify(built,null,2)+"\n");
}
await writeFile(join(destination,"index.json"),JSON.stringify(manifest,null,2)+"\n");
console.log("Built "+manifest.items.length+" registry items from "+sourcePaths.size+" source files.");
