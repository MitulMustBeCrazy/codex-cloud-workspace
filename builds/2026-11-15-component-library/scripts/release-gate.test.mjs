import test from "node:test";
import assert from "node:assert/strict";
import {createReleaseRoutes,checkReleaseInventory,buildReleaseManifest} from "./release-gate.mjs";

function fixture(){
 const registry={items:[{name:"motionbrew-blur-text"},{name:"pcl-workflow-logic"}]};
 const manifest={components:[{slug:"blur-text"}]};
 const previewCatalog={components:[{slug:"blur-text",status:"fixture-ready",fixture:"provider-defaults",needs:[],notes:"Test fixture",useCases:[],motionCost:"low"}]};
 const recipeIds=["marketing-campaign"];
 const routes=createReleaseRoutes(registry,recipeIds);
 const files=new Map(routes.map(path=>[path,path.endsWith(".json")?JSON.stringify(path==="/r/index.json"?registry:{name:path.split("/").at(-1).replace(/\.json$/,""),files:[{content:"source"}]}):"<!doctype html><html lang=\"en\"><body>Fixture</body></html>"]));
 return {registry,manifest,previewCatalog,recipeIds,files};
}
test("release routes are deterministic and include source JSON, decks and independent consumers",()=>{
 const f=fixture(),routes=createReleaseRoutes(f.registry,f.recipeIds);
 assert.deepEqual(routes,[
  "/index.html","/r/index.json",
  "/r/motionbrew-blur-text.json","/r/pcl-workflow-logic.json",
  "/decks/pitch-inspired/editorial.html","/decks/pitch-inspired/board-report.html",
  "/decks/pitch-inspired/kpi-report.html","/decks/pitch-inspired/marketing-campaign.html",
  "/consumers/dashboard/index.html","/consumers/deck/index.html"
 ]);
});
test("release gate rejects missing registry JSON, malformed HTML and wrong JSON item",()=>{
 const f=fixture();f.files.delete("/r/motionbrew-blur-text.json");
 f.files.set("/decks/pitch-inspired/marketing-campaign.html","<html></html>");
 f.files.set("/r/pcl-workflow-logic.json",JSON.stringify({name:"wrong",files:[{content:"x"}]}));
 const result=checkReleaseInventory(f);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(x=>x.includes("motionbrew-blur-text.json")));
 assert.ok(result.errors.some(x=>x.includes("pcl-workflow-logic.json")));
 assert.ok(result.errors.some(x=>x.includes("marketing-campaign.html")));
});
test("release report accurately distinguishes configured previews from verified components",()=>{
 const f=fixture();const result=checkReleaseInventory(f);
 assert.equal(result.valid,true,result.errors.join("\n"));
 const report=buildReleaseManifest({...f,commit:"0123456789abcdef"});
 assert.equal(report.sourceCommit,"0123456789abcdef");
 assert.equal(report.inventory.registryEntries,2);
 assert.equal(report.inventory.motionbrewEntries,1);
 assert.equal(report.readiness["fixture-ready"],1);
 assert.equal(report.readiness["demo-verified"],0);
 assert.equal(report.readiness["consumer-verified"],0);
 assert.equal(report.checks.requiredRoutes,10);
 assert.equal(report.checks.errors.length,0);
 assert.equal(report.certification,"Source and preview integrity only; per-component interaction certification is separate.");
});
test("release gate rejects unsupported readiness and false verified claims",()=>{
 const f=fixture();
 f.previewCatalog.components[0].status="consumer-verified";
 f.previewCatalog.components[0].fixture=null;
 const result=checkReleaseInventory(f);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(x=>/preview catalog/i.test(x)));
});
