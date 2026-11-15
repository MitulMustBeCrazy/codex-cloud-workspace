import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CalendarPanel, CommunicationPanel, CampaignApprovalPanel, DataExplorer } from "./BrandailyWorkbench";

test("calendar renders five views and correct event summaries",()=>{
 for(const view of ["Year","Quarter","Month","Week","Day"] as const){
  const html=renderToStaticMarkup(createElement(CalendarPanel,{view,date:"2026-11-15",events:[{id:"a",title:"Launch planning",date:"2026-11-15"}]}));
  assert.match(html,/Launch planning|1 event/);
  assert.match(html,/aria-label="Calendar/);
 }
});
test("communications retains selected state and unread count",()=>{
 const html=renderToStaticMarkup(createElement(CommunicationPanel,{threads:[{id:"a",name:"Creative",unread:2,preview:"Review notes"}],selectedId:"a",onSelect:()=>{}}));
 assert.match(html,/Creative/);assert.match(html,/Review notes/);assert.match(html,/2 unread/);
});
test("approvals display blocked states and approval action",()=>{
 const html=renderToStaticMarkup(createElement(CampaignApprovalPanel,{campaigns:[{id:"a",title:"Launch",stage:"Review",blocked:false},{id:"b",title:"Risk",stage:"Draft",blocked:true}],onApprove:()=>{}}));
 assert.match(html,/Launch/);assert.match(html,/Blocked/);assert.match(html,/Approve/);
});
test("data explorer renders accessible sortable table headings",()=>{
 const html=renderToStaticMarkup(createElement(DataExplorer,{rows:[{channel:"Search",reach:100,conversions:4}],columns:[{key:"channel",label:"Channel"},{key:"reach",label:"Reach"}]}));
 assert.match(html,/<table/);assert.match(html,/<th/);assert.match(html,/Search/);
});

test("single-day events render once, while multi-day events span their explicit range",()=>{
 const html=renderToStaticMarkup(createElement(CalendarPanel,{view:"Month",date:"2026-11-15",events:[
   {id:"one",title:"One day",date:"2026-11-15"},
   {id:"span",title:"Three days",date:"2026-11-17",endDate:"2026-11-19"}
 ]}));
 assert.equal((html.match(/title="One day"/g)||[]).length,1,"single event must appear on one date");
 assert.equal((html.match(/title="Three days"/g)||[]).length,3,"three-day event should span exactly three days");
});
