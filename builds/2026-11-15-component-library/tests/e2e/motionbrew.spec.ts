import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("MotionBrew catalog lists all 100 components and supports filtered live preview", async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"MotionBrew 100"}).click();
  await expect(page.locator(".mb-component-card")).toHaveCount(100);
  await page.getByRole("searchbox",{name:"Search components"}).fill("blur-text");
  await expect(page.locator(".mb-component-card")).toHaveCount(1);
  await page.locator(".mb-component-card__main").click();
  await expect(page.getByRole("dialog",{name:"Inspect BlurText"})).toBeVisible();
  await page.getByRole("button",{name:"Load live component"}).click();
  await expect(page.getByText("Better experiences, built with intent.")).toBeVisible();
  await page.screenshot({path:"test-results/motionbrew-preview.png",fullPage:true});
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog",{name:"Inspect BlurText"})).toHaveCount(0);
});
test("MotionBrew gallery supports engine/category filters and reduced viewport",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
 await page.getByRole("button",{name:"Open navigation"}).click();
  await page.getByRole("button",{name:"MotionBrew 100"}).click();
  await page.getByLabel("Animation engine").selectOption("Motion + GSAP");
  await expect(page.locator(".mb-component-card").first()).toBeVisible();
  expect(await page.locator(".mb-component-card").count()).toBeGreaterThan(0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(3);
  await page.screenshot({path:"test-results/motionbrew-mobile.png",fullPage:true});
});
test("MotionBrew catalog passes severe automated accessibility audit",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"MotionBrew 100"}).click();
  const results=await new AxeBuilder({page}).analyze();
  const severe=results.violations.filter(v=>v.impact==="critical"||v.impact==="serious");
  expect(severe.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);
});

test("all 100 MotionBrew cards distinguish configured default previews from behavior certification",async({page})=>{
  await page.goto("/?view=motionbrew");
  await expect(page.locator(".mb-component-card")).toHaveCount(100);
  await expect(page.locator(".mb-component-card__status")).toHaveCount(100);
  await expect(page.locator(".mb-component-card__status").first()).toHaveText("Preview configured");
  await page.getByLabel("Preview readiness").selectOption("fixture-ready");
  await expect(page.locator(".mb-component-card")).toHaveCount(100);
  await page.getByLabel("Preview readiness").selectOption("source-only");
  await expect(page.locator(".mb-component-card")).toHaveCount(0);
  await page.getByLabel("Preview readiness").selectOption("demo-verified");
  await expect(page.locator(".mb-component-card")).toHaveCount(0);
  await page.getByLabel("Preview readiness").selectOption("All");
  await expect(page.locator(".mb-component-card")).toHaveCount(100);
});
test("provider-default inspector offers source but does not claim behavior certification",async({page})=>{
  await page.goto("/?view=motionbrew");
  await page.getByRole("searchbox",{name:"Search components"}).fill("pill-tabs");
  await page.locator(".mb-component-card__main").click();
  await expect(page.getByRole("dialog",{name:"Inspect PillTabs"})).toContainText("Preview configured");
  await expect(page.getByRole("link",{name:"View imported source"})).toHaveAttribute("href",/pill-tabs\.tsx$/);
  await expect(page.getByRole("button",{name:"Load live component"})).toBeVisible();
});


test("P4 inspector captures keyboard focus, cycles with Tab, then restores trigger on Escape",async({page})=>{
 await page.goto("/?view=motionbrew");
 await page.getByRole("searchbox",{name:"Search components"}).fill("blur-text");
 const trigger=page.locator(".mb-component-card__main").first();
 await trigger.focus();
 await trigger.press("Enter");
 const dialog=page.getByRole("dialog",{name:"Inspect BlurText"});
 await expect(dialog).toBeVisible();
 await expect(dialog).toBeFocused();
 await page.keyboard.press("Shift+Tab");
 await expect(dialog.getByRole("button",{name:/Save/})).toBeFocused();
 await page.keyboard.press("Tab");
 await expect(dialog.getByRole("button",{name:"Close MotionBrew inspector"})).toBeFocused();
 await page.keyboard.press("Escape");
 await expect(dialog).toHaveCount(0);
 await expect(trigger).toBeFocused();
});

test("P4 inspector restores focus on close and removes running preview",async({page})=>{
 await page.goto("/?view=motionbrew");
 await page.getByRole("searchbox",{name:"Search components"}).fill("blur-text");
 const trigger=page.locator(".mb-component-card__main").first();
 await trigger.click();
 await page.getByRole("button",{name:"Load live component"}).click();
 await expect(page.getByText("Better experiences, built with intent.")).toBeVisible();
 await page.getByRole("button",{name:"Close MotionBrew inspector"}).click();
 await expect(page.getByRole("dialog",{name:"Inspect BlurText"})).toHaveCount(0);
 await expect(trigger).toBeFocused();
 await expect(page.locator(".mb-live-stage")).toHaveCount(0);
});
