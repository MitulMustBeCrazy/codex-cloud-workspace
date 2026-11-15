import { test } from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../../..");
const manifest=JSON.parse(readFileSync(resolve(root,"src/lib/motionbrew/manifest.json"),"utf8"));
const registry=JSON.parse(readFileSync(resolve(root,"registry.json"),"utf8"));
test("MotionBrew provider inventory contains 100 unique source components",()=>{
 assert.equal(manifest.count,100);
 assert.equal(manifest.components.length,100);
 assert.equal(new Set(manifest.components.map(c=>c.slug)).size,100);
 for(const c of manifest.components){
   assert.ok(c.name&&c.trigger&&c.engine&&c.category&&c.documentationUrl);
   assert.ok(c.sourcePath.endsWith(c.slug+".tsx"));
   assert.equal(existsSync(resolve(root,c.sourcePath)),true,"missing "+c.slug);
 }
});
test("all 100 MotionBrew source components have one registry entry",()=>{
 const items=registry.items.filter(i=>i.name.startsWith("motionbrew-"));
 assert.equal(items.length,100);
 for(const c of manifest.components){
  const item=items.find(i=>i.name==="motionbrew-"+c.slug);
  assert.ok(item,"unregistered component: "+c.slug);
  assert.equal(item.files[0].path,c.sourcePath);
  assert.ok(item.dependencies.length>=2);
 }
});
test("every source preserves provider attribution and supports independent copying",()=>{
 for(const c of manifest.components){
  const src=readFileSync(resolve(root,c.sourcePath),"utf8");
  assert.ok(src.length>100,"empty component "+c.slug);
  assert.ok(src.includes("motion-brew.com"),"provider URL missing "+c.slug);
  assert.ok(src.startsWith('"use client"')||src.startsWith("'use client'"),"client directive missing "+c.slug);
 }
});
