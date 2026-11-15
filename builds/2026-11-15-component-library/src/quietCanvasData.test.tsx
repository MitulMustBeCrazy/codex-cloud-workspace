import {test} from "node:test";
import assert from "node:assert/strict";
import {materialCounts,sourceRegistry,motionComponents,htmlDeckTemplates,narrativeBlueprints,slideStyles,reactBitsReferences,validAppearance,appearanceDefaults,sections} from "./quietCanvasData";

test("all source-backed materials are present and accurately counted",()=>{
 assert.equal(materialCounts.registry,110);
 assert.equal(materialCounts.motion,100);
 assert.equal(materialCounts.native,10);
 assert.equal(materialCounts.decks,10);
 assert.equal(materialCounts.styles,6);
 assert.equal(materialCounts.blueprints,5);
 assert.equal(materialCounts.references,39);
 assert.equal(sourceRegistry.length,110);
 assert.equal(motionComponents.length,100);
 assert.equal(htmlDeckTemplates.length,10);
 assert.equal(narrativeBlueprints.length,5);
 assert.equal(slideStyles.length,6);
 assert.equal(reactBitsReferences.length,39);
});
test("appearance defaults and dimensions are independently validated",()=>{
 assert.deepEqual(appearanceDefaults,{accent:"signature-red",surface:"soft-focus",theme:"light"});
 assert.deepEqual(validAppearance({accent:"cobalt",surface:"open-canvas",theme:"dark"}),{accent:"cobalt",surface:"open-canvas",theme:"dark"});
 assert.deepEqual(validAppearance({accent:"invalid",surface:"invalid",theme:"invalid"}),appearanceDefaults);
});
test("React Bits references are uniquely labeled, not misrepresented as imported",()=>{
 const names=reactBitsReferences.map(r=>r.name);
 assert.equal(new Set(names).size,names.length);
 assert.equal(reactBitsReferences.find(r=>r.name==="Elastic Reel")?.tier,"Pro reference");
 assert.equal(sections.length,new Set(sections.map(s=>s.id)).size);
});
