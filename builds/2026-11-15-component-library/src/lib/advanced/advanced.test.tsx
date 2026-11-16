import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CommandPalette,SavedViews,NotificationCenter,AnimatedBackground,PerspectiveCards,CohortHeatmap,FunnelChart,BudgetWaterfall,AdvancedWorkbench } from "./AdvancedWorkbench";

test("command palette exposes accessible search semantics",()=>{
 const html=renderToStaticMarkup(createElement(CommandPalette,{open:true,commands:[{id:"a",label:"Go to today",group:"Navigate",onSelect:()=>{}}],onClose:()=>{}}));
 assert.match(html,/role="dialog"/);assert.match(html,/Go to today/);assert.match(html,/type="search"/);
});
test("saved views and notification center expose controlled actions",()=>{
 const a=renderToStaticMarkup(createElement(SavedViews,{views:[{id:"today",name:"My priorities"}],activeId:"today",onSelect:()=>{}}));
 const b=renderToStaticMarkup(createElement(NotificationCenter,{notifications:[{id:"n",text:"Approval requested",read:false}],onMarkRead:()=>{}}));
 assert.match(a,/My priorities/);assert.match(b,/Approval requested/);assert.match(b,/Mark read/);
});
test("data explorer visualizations use data to label charts",()=>{
 const cohort=renderToStaticMarkup(createElement(CohortHeatmap,{rows:[{name:"Jan",values:[100,74,58]}]}));
 assert.match(cohort,/Jan/);assert.match(cohort,/74%/);
 const funnel=renderToStaticMarkup(createElement(FunnelChart,{steps:[{name:"Reach",value:1000},{name:"Convert",value:300}]}));
 assert.match(funnel,/Reach/);assert.match(funnel,/Convert/);
 const waterfall=renderToStaticMarkup(createElement(BudgetWaterfall,{items:[{label:"Base",value:100},{label:"Added",value:20},{label:"Saved",value:-10}]}));
 assert.match(waterfall,/Saved/);
});
test("advanced visuals render without external media or WebGL",()=>{
 const html=renderToStaticMarkup(createElement(AnimatedBackground,{kind:"particles",count:8}));
 const cards=renderToStaticMarkup(createElement(PerspectiveCards,{items:[{id:"a",title:"Future",description:"Story"}]}));
 assert.match(html,/pcl-backdrop/);assert.match(cards,/Future/);
 const workbench=renderToStaticMarkup(createElement(AdvancedWorkbench));
 assert.match(workbench,/Command palette/);
});
