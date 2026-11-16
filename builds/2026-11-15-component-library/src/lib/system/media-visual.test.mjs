import { test } from "node:test";
import assert from "node:assert/strict";
import { createMediaCoordinator } from "./media-coordinator.js";
import { layoutWords, rectsOverlap, motionSequence } from "./visual-logic.js";

test("activating second media item pauses first",()=>{
 const events=[];
 const media=createMediaCoordinator();
 const a=media.register("a",()=>events.push("pause a"));
 const b=media.register("b",()=>events.push("pause b"));
 media.activate("a"); media.activate("b");
 assert.deepEqual(events,["pause a"]);
 assert.equal(media.activeId(),"b");
 a(); b(); assert.equal(media.activeId(),null);
});
test("unregister handles strict mode double cleanup without breaking new registration",()=>{
 const media=createMediaCoordinator();
 const cleanup=media.register("a",()=>{});
 cleanup();cleanup();
 media.register("a",()=>{});
 media.activate("a");assert.equal(media.activeId(),"a");
});
test("word cloud keeps all placed labels inside bounds and prevents collisions",()=>{
 const words=["MODERN","TRUST","PREMIUM","DIGITAL","POWER","INNOVATION","HUMAN","BEYOND"].map((text,i)=>({text,weight:8-i}));
 const placed=layoutWords(words,1000,560);
 assert.ok(placed.length>=6);
 for(const r of placed) {
   assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=1000&&r.y+r.height<=560);
   for(const s of placed) if(s!==r)assert.equal(rectsOverlap(r,s,6),false);
 }
 assert.deepEqual(layoutWords(words,1000,560),placed);
});
test("motion sequence honors quiet, living, impact and media presets",()=>{
 const quiet=motionSequence(3,"quiet");
 const living=motionSequence(3,"living");
 assert.equal(quiet.length,3);
 assert.ok(quiet[2].delay<living[2].delay);
 assert.equal(motionSequence(2,"media")[1].duration>0,true);
});
