import test from "node:test";
import assert from "node:assert/strict";
import { auditRegistryItem, flagshipSlugs, normalizeImportPackage } from "./verify-consumer-install.mjs";

test("flagship consumer list is 16 distinct MotionBrew registry IDs",()=>{
 assert.equal(flagshipSlugs.length,16);
 assert.equal(new Set(flagshipSlugs).size,16);
 assert.ok(flagshipSlugs.every(slug=>/^[a-z][a-z0-9-]+$/.test(slug)));
});
test("dependency auditor detects undeclared npm imports rather than relying on gallery node_modules",()=>{
 const r=auditRegistryItem({name:"example",dependencies:["motion"],files:[
  {path:"components/demo.tsx",content:'import * as React from "react"; import {motion} from "motion/react"; import {clsx} from "clsx"; export const Demo=()=>null;'}
 ]});
 assert.deepEqual(r.undeclaredPackages,["clsx"]);
 assert.deepEqual(r.missingLocalImports,[]);
});
test("auditor detects broken local file imports when registry dependency closure is incomplete",()=>{
 const r=auditRegistryItem({name:"example",dependencies:[],files:[
  {path:"components/demo.tsx",content:'import {helper} from "./helper"; export const Demo=()=>null;'}
 ]});
 assert.deepEqual(r.missingLocalImports,["components/demo.tsx: ./helper"]);
});
test("auditor treats react as a peer and resolves nested scoped/npm import paths",()=>{
 assert.equal(normalizeImportPackage("motion/react"),"motion");
 assert.equal(normalizeImportPackage("@gsap/react"),"@gsap/react");
 assert.equal(normalizeImportPackage("lucide-react"),"lucide-react");
 assert.equal(normalizeImportPackage("node:path"),null);
 const r=auditRegistryItem({name:"example",dependencies:["motion","@gsap/react"],files:[
  {path:"components/demo.tsx",content:'import React from "react"; import {motion} from "motion/react"; import {useGSAP} from "@gsap/react"; export const Demo=()=>null;'}
 ]});
 assert.deepEqual(r.undeclaredPackages,[]);
});
