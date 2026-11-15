import {test,expect} from "@playwright/test";

const slugs=[
 "blur-text","gradient-text","flip-words","magnetic-button",
 "pill-tabs","morph-search","search-modal","activity-grid",
 "goal-gauge","metric-split","month-calendar","message-composer",
 "toast-stack","depth-carousel","prism-carousel","wave-text"
];

for(const context of ["dashboard","deck"]){
 test("independent "+context+" consumer includes all 16 registry entries and mounts each",async({page})=>{
  test.setTimeout(100000);
  const pageErrors:string[]=[];
  page.on("pageerror",error=>pageErrors.push(error.message));
  await page.goto("/consumers/"+context+"/");
  await expect(page.getByRole("heading",{name:context==="deck"?"Presentation consumer":"Dashboard consumer"})).toBeVisible();
  await expect(page.locator('nav[aria-label="Components to test"] button')).toHaveCount(16);
  for(const slug of slugs){
   await page.locator('nav[aria-label="Components to test"] button[data-component="'+slug+'"]').click();
   await expect(page.locator('section[data-active="'+slug+'"]')).toBeVisible();
   await expect.poll(()=>page.locator('section[data-active="'+slug+'"]').evaluate(el=>el.childElementCount)).toBeGreaterThan(0);
   await page.waitForTimeout(50);
  }
  expect(pageErrors).toEqual([]);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(3);
  await page.screenshot({path:"test-results/consumer-"+context+".png",fullPage:true});
 });
}
test("isolated deck component consumer remains usable with reduced motion and narrow viewport",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto("/consumers/deck/");
 await expect(page.locator('nav[aria-label="Components to test"] button')).toHaveCount(16);
 await page.locator('button[data-component="wave-text"]').click();
 await expect(page.locator('section[data-active="wave-text"]')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(3);
});
