import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname,resolve } from "node:path";
import { validatePreviewCatalog,readinessLabel,readinessRank,getPreviewRecord } from "./preview-status.mjs";

const here=dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(readFileSync(resolve(here,"manifest.json"),"utf8"));
const catalog=JSON.parse(readFileSync(resolve(here,"preview-catalog.json"),"utf8"));

test("catalog covers exactly 100 MotionBrew source components and preserves provider slugs",()=>{
 const report=validatePreviewCatalog(catalog,manifest);
 assert.equal(report.valid,true,report.errors.join("\n"));
 assert.equal(catalog.components.length,100);
 assert.equal(new Set(catalog.components.map(x=>x.slug)).size,100);
 assert.deepEqual(catalog.components.map(x=>x.slug).sort(),manifest.components.map(x=>x.slug).sort());
});
test("catalog records all 100 provider-default preview fixtures without claiming interaction or consumer certification",()=>{
 for(const entry of catalog.components){
  assert.equal(entry.status,"fixture-ready");
  assert.equal(entry.fixture,"provider-defaults");
  assert.ok(entry.mountEvidence?.includes("github.com/MitulMustBeCrazy/"));
  assert.ok(entry.notes.length>8);
  assert.ok(["low","medium","high","unknown"].includes(entry.motionCost));
  assert.ok(Array.isArray(entry.needs));
  assert.ok(Array.isArray(entry.useCases));
 }
 assert.equal(readinessLabel("source-only"),"Source imported");
 assert.equal(readinessLabel("fixture-ready"),"Preview configured");
 assert.equal(readinessLabel("demo-verified"),"Preview tested");
 assert.equal(readinessLabel("consumer-verified"),"Consumer verified");
 assert.equal(readinessRank("source-only"),0);
 assert.equal(readinessRank("consumer-verified"),3);
});
test("catalog validator rejects false source readiness, duplicates and missing records",()=>{
 const clone=structuredClone(catalog);
 clone.components[0].status="consumer-verified";
 clone.components[0].fixture=null;
 assert.equal(validatePreviewCatalog(clone,manifest).valid,false);
 const duplicate=structuredClone(catalog);
 duplicate.components[1].slug=duplicate.components[0].slug;
 assert.equal(validatePreviewCatalog(duplicate,manifest).valid,false);
 assert.ok(validatePreviewCatalog({...catalog,components:catalog.components.slice(1)},manifest).errors.length);
});
test("individual record lookup distinguishes found and missing slugs",()=>{
 const x=getPreviewRecord(catalog,"blur-text");
 assert.equal(x?.slug,"blur-text");
 assert.equal(getPreviewRecord(catalog,"not-a-real-slug"),null);
});
