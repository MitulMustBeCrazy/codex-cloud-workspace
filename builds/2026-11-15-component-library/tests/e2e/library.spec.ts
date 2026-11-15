import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Brandaily P0 calendar, approvals and mentions work",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:"Brandaily P0"}).click();
 await expect(page.getByRole("heading",{name:"Calendar"})).toBeVisible();
 for(const view of ["Year","Quarter","Month","Week","Day"]){
   await page.getByRole("button",{name:view,exact:true}).click();
   await expect(page.locator(".pcl-segments button[aria-pressed=true]")).toHaveText(view);
 }
 await page.getByRole("button",{name:"Month",exact:true}).click();
 await page.locator("#pcl-mention-editor").fill("Hello @mar");
 await expect(page.getByRole("listbox",{name:"Inline mentions"})).toBeVisible();
 await page.getByRole("option",{name:/Mariam/}).click();
 await expect(page.locator("#pcl-mention-editor")).toHaveValue("Hello @Mariam");
 await expect(page.getByText("Linked: person: Mariam")).toBeVisible();
 await page.getByRole("button",{name:"Approve",exact:true}).click();
 await expect(page.getByText("0 need review")).toBeVisible();
 await page.screenshot({path:"test-results/brandaily-p0.png",fullPage:true});
});

test("P1/P2 command palette, advanced analytics and motion options render",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:"P1 + P2 Lab"}).click();
 await expect(page.getByText("Command palette & saved filters")).toBeVisible();
 await page.keyboard.press("Control+k");
 await expect(page.getByRole("dialog",{name:"Command palette"})).toBeVisible();
 await page.getByRole("searchbox",{name:"Search commands"}).fill("campaigns");
 await expect(page.getByRole("option",{name:/Campaigns/})).toBeVisible();
 await page.keyboard.press("Escape");
 await expect(page.getByRole("dialog",{name:"Command palette"})).toHaveCount(0);
 await expect(page.getByRole("region",{name:"Cohort heatmap"})).toBeVisible();
 await page.screenshot({path:"test-results/p1-p2.png",fullPage:true});
});

test("ten gallery templates open self-contained HTML presentations",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:"HTML deck gallery"}).click();
 await expect(page.locator(".pcl-deck-gallery__card")).toHaveCount(10);
 await page.screenshot({path:"test-results/deck-gallery.png",fullPage:true});
 await page.goto("/decks/pitch-inspired/sonic-launch.html");
 await expect(page.locator(".deck [data-slide].is-current")).toHaveCount(1);
 await page.getByRole("button",{name:"Next reveal"}).click();
 await expect(page.locator(".deck [data-slide].is-current [data-reveal].is-visible")).toHaveCount(2);
 await expect(page.locator(".deck [data-slide].is-current [data-reveal].is-visible").last()).toHaveCSS("opacity","1");
 await page.screenshot({path:"test-results/sonic-deck.png",fullPage:true});
});

test("small viewport avoids horizontal page overflow and preserves slide navigation",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/");
 await page.getByRole("button",{name:"Brandaily P0"}).click();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(3);
 await page.goto("/decks/pitch-inspired/board-report.html");
 await expect(page.locator(".deck")).toBeVisible();
 await page.keyboard.press("ArrowRight");
 await expect(page.locator(".deck [data-slide].is-current [data-reveal].is-visible")).toHaveCount(2);
 await expect(page.locator(".deck [data-slide].is-current [data-reveal].is-visible").last()).toHaveCSS("opacity","1");
 await page.screenshot({path:"test-results/board-mobile.png",fullPage:true});
});

test("critical and serious automated accessibility issues are absent on Brandaily workbench",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:"Brandaily P0"}).click();
 const results=await new AxeBuilder({page}).analyze();
 const material=results.violations.filter(v=>v.impact==="critical"||v.impact==="serious");
 expect(material.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});
