import {test} from "node:test";import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";import {resolve,dirname} from "node:path";import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const registry=JSON.parse(readFileSync(resolve(root,"registry.json"),"utf8"));
test("registry defines uniquely named source-owned installable items",()=>{
 assert.equal(registry.$schema,"https://ui.shadcn.com/schema/registry.json");
 const names=registry.items.map(i=>i.name);
 assert.equal(new Set(names).size,names.length);
 assert.ok(names.length>=8);
 for(const item of registry.items){
  assert.ok(item.title&&item.description);
  assert.ok(item.files.length>=1);
  for(const f of item.files){
   assert.ok(!f.path.includes(".."));
   assert.equal(existsSync(resolve(root,f.path)),true,"missing registry source "+f.path);
  }
  for(const dep of item.registryDependencies||[])assert.ok(names.includes(dep),"unknown dependency "+dep);
 }
});
