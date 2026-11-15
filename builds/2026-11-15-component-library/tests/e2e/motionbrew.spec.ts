import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("MotionBrew catalog lists all 100 components and supports filtered live preview", async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"MotionBrew 100"}).click();
  await expect(page.locator(".mb-component-card")).toHaveCount(100);
  await page.getByRole("searchbox",{name:"Search components"}).fill("blur-text");
  await expect(page.locator(".mb-component-card")).toHaveCount(1);
  await page.getByRole("button",{name:/Inspect Blur Text/}).click();
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
