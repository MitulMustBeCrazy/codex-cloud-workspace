import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Quiet Canvas overview is fully populated with real collection counts",async({page})=>{
 await page.goto("/");
 await expect(page.getByRole("heading",{name:/A quieter place/})).toBeVisible();
 await expect(page.getByText("110",{exact:true}).first()).toBeVisible();
 await expect(page.getByRole("button",{name:"MotionBrew 100"})).toBeVisible();
 await expect(page.getByRole("button",{name:"HTML deck gallery"})).toBeVisible();
 await page.screenshot({path:"test-results/quiet-canvas-desktop.png",fullPage:true});
});

test("appearance dimensions are independent, persistent and restore defaults",async({page})=>{
 await page.goto("/");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-theme","light");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-accent","signature-red");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-surface","soft-focus");
 await page.getByRole("button",{name:"Appearance",exact:true}).click();
 await expect(page.getByRole("dialog",{name:"Appearance settings"})).toBeVisible();
 await page.getByRole("button",{name:"Cobalt"}).click();
 await page.getByRole("button",{name:/Open Canvas/}).click();
 await page.getByRole("button",{name:"Dark"}).click();
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-accent","cobalt");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-surface","open-canvas");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-theme","dark");
 await page.reload();
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-accent","cobalt");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-theme","dark");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-surface","open-canvas");
 await page.getByRole("button",{name:"Appearance",exact:true}).click();
 await page.getByRole("button",{name:"Restore defaults"}).click();
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-accent","signature-red");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-theme","light");
 await expect(page.locator(".qc-shell")).toHaveAttribute("data-surface","soft-focus");
 await page.screenshot({path:"test-results/quiet-canvas-appearance.png",fullPage:true});
});

test("registry is populated from 110 source-backed entries, with searchable details and saved items",async({page})=>{
 await page.goto("/?view=components");
 await expect(page.getByRole("heading",{name:/Everything, in one place/})).toBeVisible();
 await expect(page.getByText("110 entries",{exact:true})).toBeVisible();
 await page.getByRole("searchbox",{name:"Search registry"}).fill("blur-text");
 await expect(page.getByText("1 entries",{exact:true})).toBeVisible();
 await page.locator(".qc-registry-main").first().click();
 await expect(page.getByRole("dialog",{name:/Component details/})).toBeVisible();
 const source=page.getByRole("link",{name:/View registry JSON/});
 await expect(source).toHaveAttribute("href","/r/motionbrew-blur-text.json");
 await page.getByRole("button",{name:"Save component"}).click();
 await page.getByRole("button",{name:"Close component details"}).click();
 await page.getByRole("button",{name:/Saved/}).click();
 await expect(page.locator(".qc-registry-row")).toHaveCount(1);
 await page.reload();
 await page.getByRole("button",{name:/Saved/}).click();
 await expect(page.locator(".qc-registry-row")).toHaveCount(1);
});

test("global search and route history open the correct source collection",async({page})=>{
 await page.goto("/");
 await page.keyboard.press("Control+k");
 await expect(page.getByRole("dialog",{name:"Search the library"})).toBeVisible();
 await page.getByRole("searchbox",{name:"Search all library materials"}).fill("BlurText");
 await page.getByRole("dialog",{name:"Search the library"}).getByRole("button",{name:/BlurText/}).first().click();
 await expect(page).toHaveURL(/view=motionbrew/);
 await expect(page.locator(".mb-component-card")).toHaveCount(1);
 await page.goBack();
 await expect(page.getByRole("heading",{name:/A quieter place/})).toBeVisible();
});

test("reference-only materials and deck blueprints remain accessible",async({page})=>{
 await page.goto("/?view=references");
 await expect(page.getByText("39 references",{exact:true})).toBeVisible();
 await expect(page.getByText("Elastic Reel")).toBeVisible();
 await page.getByRole("button",{name:"Deck blueprints"}).click();
 await expect(page.locator(".qc-blueprint-item")).toHaveCount(5);
 await page.locator(".qc-blueprint-item").first().getByRole("button").click();
 await expect(page.locator(".qc-blueprint-content").first()).toHaveCount(0);
});

test("mobile Quiet Canvas navigation opens, closes, and avoids horizontal overflow",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/");
 await page.getByRole("button",{name:"Open navigation"}).click();
 await expect(page.locator(".qc-sidebar")).toHaveClass(/qc-sidebar-open/);
 await page.getByRole("button",{name:"HTML deck gallery"}).click();
 await expect(page.locator(".qc-sidebar")).not.toHaveClass(/qc-sidebar-open/);
 await expect(page.locator(".pcl-deck-gallery__card")).toHaveCount(10);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(3);
 await page.screenshot({path:"test-results/quiet-canvas-mobile.png",fullPage:true});
});

test("Quiet Canvas overview and appearance dialog have no serious or critical axe issues",async({page})=>{
 await page.goto("/");
 for(const view of ["overview","appearance"]){
   if(view==="appearance")await page.getByRole("button",{name:"Appearance",exact:true}).click();
   const result=await new AxeBuilder({page}).analyze();
   const severe=result.violations.filter(v=>v.impact==="serious"||v.impact==="critical");
   expect(severe.map(v=>({id:v.id,targets:v.nodes.map(x=>x.target)}))).toEqual([]);
 }
});


test("P4 built release serves real versioned assets instead of SPA fallback",async({request})=>{
 const release=await request.get("/release-manifest.json");
 expect(release.status()).toBe(200);
 expect(release.headers()["content-type"]).toMatch(/json/);
 const status=await release.json();
 expect(status.schemaVersion).toBe(1);
 expect(status.inventory.registryEntries).toBe(110);
 expect(status.inventory.motionbrewEntries).toBe(100);
 expect(status.inventory.htmlDecks).toBe(10);
 expect(status.checks.valid).toBe(true);
 expect(status.checks.requiredRoutes).toBe(124);
 expect(status.readiness["consumer-verified"]).toBe(0);
 for(const name of ["motionbrew-blur-text","motionbrew-wave-text","pcl-brandaily-workflows"]){
   const r=await request.get("/r/"+name+".json");
   expect(r.status()).toBe(200);
   const obj=await r.json();
   expect(obj.name).toBe(name);
   expect(obj.files.length).toBeGreaterThan(0);
 }
 for(const id of ["editorial","board-report","sonic-launch"]){
   const r=await request.get("/decks/pitch-inspired/"+id+".html");
   expect(r.status()).toBe(200);
   expect(await r.text()).toContain("data-slide");
 }
 for(const id of ["dashboard","deck"]){
   const r=await request.get("/consumers/"+id+"/index.html");
   expect(r.status()).toBe(200);
   expect(await r.text()).toContain('id="app"');
 }
});

test("P4 page has no horizontal overflow at 320, 390, 768 and 1440 with reduced motion",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844});
  await page.goto("/?view=motionbrew");
  await expect(page.locator(".mb-component-card")).toHaveCount(100);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow, "overflow at "+width).toBeLessThanOrEqual(3);
 }
});
