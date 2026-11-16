import {test,expect} from "@playwright/test";
test.describe("Design integration live controls",()=>{
 test.beforeEach(async({page})=>{await page.goto("/?view=design-integration");});
 test("renders source-owned workbench and functional state",async({page})=>{
  await expect(page.getByRole("heading",{name:/Design intelligence/i})).toBeVisible();
  await page.getByRole("button",{name:"Complete",exact:true}).click();
  await expect(page.getByText("Current selection: Complete")).toBeVisible();
  const control=page.getByRole("switch",{name:"Enable notifications"});
  await expect(control).toHaveAttribute("aria-checked","true");
  await control.click();
  await expect(control).toHaveAttribute("aria-checked","false");
  await page.getByRole("button",{name:"Review guidance"}).click();
  await expect(page.getByText(/Assign an owner/)).toBeVisible();
  await page.getByRole("button",{name:/Run demo action/}).click();
  await expect(page.getByText(/Demo action completed/)).toBeVisible();
 });
 test("runs QA checklist and changes style tokens",async({page})=>{
  await page.getByRole("button",{name:"Design QA"}).click();
  await expect(page.getByText("2 / 5")).toBeVisible();
  await page.getByLabel(/Accessible interaction/).check();
  await expect(page.getByText("3 / 5")).toBeVisible();
  await page.getByRole("button",{name:"Style lab"}).click();
  await page.getByRole("button",{name:"Night Studio"}).click();
  await expect(page.getByText(/Focused, dark workbench/)).toBeVisible();
  await expect(page.locator(".di-tokenline")).toContainText("#151A22");
 });
 test("includes attributable source URLs and stays within mobile viewport",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.getByRole("button",{name:"Sources"}).click();
  for(const source of ["meta/astryx","pbakaus/impeccable","Owl-Listener/designer-skills","VoltAgent/awesome-design-md"]){
   await expect(page.locator('a[href*="'+source+'"]')).toBeVisible();
  }
  const width=await page.evaluate(()=>document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(395);
 });
});