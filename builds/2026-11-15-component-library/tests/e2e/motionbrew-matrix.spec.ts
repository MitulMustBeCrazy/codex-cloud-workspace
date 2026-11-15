import {test,expect} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
const manifest=JSON.parse(readFileSync(new URL("../../src/lib/motionbrew/manifest.json",import.meta.url),"utf8"));
const previewCatalog=JSON.parse(readFileSync(new URL("../../src/lib/motionbrew/preview-catalog.json",import.meta.url),"utf8"));

test("diagnose all 100 MotionBrew on-demand default previews without falsely certifying source-only items",async({page})=>{
 test.setTimeout(240000);
 await page.goto("/?view=motionbrew");
 const results:{slug:string;rendered:boolean;failure:string|null;readiness:string}[]=[];
 for(const entry of manifest.components){
  const current=previewCatalog.components.find(x=>x.slug===entry.slug);
  let failure:string|null=null;
  try{
   await page.getByRole("searchbox",{name:"Search components"}).fill(entry.slug);
   await page.locator(".mb-component-card__main").first().click({timeout:4000});
   await page.getByRole("button",{name:"Load live component"}).click({timeout:4000});
   await expect(page.locator(".mb-preview-loading")).toHaveCount(0,{timeout:4500});
   if(await page.locator(".mb-preview-unavailable").count()){
    failure=(await page.locator(".mb-preview-unavailable").innerText()).slice(0,140);
   }
  }catch(error){failure=String(error).slice(0,200)}
  results.push({slug:entry.slug,rendered:!failure,failure,readiness:current?.status||"unknown"});
  await page.keyboard.press("Escape").catch(()=>{});
  if(await page.getByRole("dialog",{name:"Inspect "+entry.name}).count()){
   await page.getByRole("button",{name:"Close MotionBrew inspector"}).click({force:true}).catch(()=>{});
  }
 }
 await mkdir("test-results",{recursive:true});
 await writeFile("test-results/motionbrew-preview-matrix.json",JSON.stringify(results,null,2));
 const failures=results.filter(x=>!x.rendered);
 console.log("MOTIONBREW_PREVIEW_MATRIX "+JSON.stringify({total:results.length,rendered:results.length-failures.length,failed:failures.length,failedSlugs:failures.map(x=>x.slug)}));
 expect(results).toHaveLength(100);
 const overstated=failures.filter(x=>["demo-verified","consumer-verified"].includes(x.readiness));
 expect(overstated).toEqual([]);
});
