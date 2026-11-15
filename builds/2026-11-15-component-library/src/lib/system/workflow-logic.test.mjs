import { test } from "node:test";
import assert from "node:assert/strict";
import { calendarMonth, calendarQuarter, calendarYear, calendarWeek, calendarDay, findMentionQuery, insertMention, filterAndSort, summarizeCampaigns, normalizeSeries, interpolateSeries } from "./workflow-logic.js";

test("calendar month renders 42 Monday-first days without off-by-one timezone shift", () => {
  const month = calendarMonth("2026-11-15");
  assert.equal(month.length, 42);
  assert.equal(month[0].date, "2026-10-26");
  assert.equal(month[6].date, "2026-11-01");
  assert.equal(month[41].date, "2026-12-06");
  assert.equal(month[0].withinPeriod, false);
  assert.equal(month[6].withinPeriod, true);
});
test("all five date periods exist and handle year boundaries", () => {
  assert.equal(calendarWeek("2027-01-01")[0].date, "2026-12-28");
  assert.equal(calendarDay("2027-01-01").length,1);
  assert.equal(calendarQuarter("2026-11-15").length,3);
  assert.equal(calendarYear("2026-11-15").length,12);
});
test("mention query detects @ people, # tasks and $ campaigns at caret", () => {
  assert.deepEqual(findMentionQuery("Discuss with @mar",17),{prefix:"@",query:"mar",start:13,end:17});
  assert.equal(findMentionQuery("Budget $launch",14).prefix,"$");
  assert.equal(findMentionQuery("see #brief",10).prefix,"#");
  assert.equal(findMentionQuery("valid @bad tag",14),null);
});
test("mention insert keeps an explicit structured reference and correct cursor", () => {
  const input="Talk to @mar tomorrow";
  const range=findMentionQuery(input,12);
  const result=insertMention(input,range,{id:"person-17",label:"Mariam",type:"person"});
  assert.equal(result.text,"Talk to @Mariam tomorrow");
  assert.equal(result.reference.id,"person-17");
  assert.equal(result.reference.start,8);
  assert.equal(result.cursor,15);
});
test("data explorer filters, sorts, treats null values as missing", () => {
  const rows=[{name:"A",reach:25,channel:"social"},{name:"B",reach:35,channel:"owned"},{name:"C",reach:null,channel:"social"}];
  assert.deepEqual(filterAndSort(rows,{query:"",filters:{channel:"social"},sort:{key:"reach",direction:"desc"}}).map(r=>r.name),["A","C"]);
});
test("campaign status summary includes blocked and pending approvals",()=>{
  const result=summarizeCampaigns([{stage:"Review",blocked:false},{stage:"Review",blocked:true},{stage:"Published",blocked:false}]);
  assert.equal(result.total,3);
  assert.equal(result.blocked,1);
  assert.equal(result.pendingApprovals,1);
});
test("series normalization ignores invalid numbers and never divides by zero",()=>{
  const s=normalizeSeries([10,20,30]); assert.deepEqual(s,[0,0.5,1]);
  assert.deepEqual(normalizeSeries([5,5]),[0.5,0.5]);
  assert.deepEqual(normalizeSeries([null,NaN]),[null,null]);
});
test("chart interpolation honors reduced motion / step zero",()=>{
  assert.deepEqual(interpolateSeries([10,20],0),[0,0]);
  assert.deepEqual(interpolateSeries([10,20],0.5),[5,10]);
  assert.deepEqual(interpolateSeries([10,20],1),[10,20]);
});
