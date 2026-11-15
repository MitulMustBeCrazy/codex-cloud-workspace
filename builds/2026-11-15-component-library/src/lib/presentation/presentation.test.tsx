import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SlideFrame, WordCloud, ComparisonStory, RoadmapTimeline, MediaStage, PresentationWorkbench } from "./PresentationWorkbench";

test("slide frame uses 16:9 stage and semantic slide label",()=>{
 const html=renderToStaticMarkup(createElement(SlideFrame,{label:"Strategic context"},createElement("span",null,"Hello")));
 assert.match(html,/Strategic context/);assert.match(html,/Hello/);assert.match(html,/pcl-slide-frame/);
});
test("word cloud renders readable terms and a named graphic",()=>{
 const html=renderToStaticMarkup(createElement(WordCloud,{words:[{text:"Power",weight:5},{text:"Trust",weight:4}]}));
 assert.match(html,/<svg/);assert.match(html,/Power/);assert.match(html,/Trust/);assert.match(html,/role="img"/);
});
test("media stage supports image and audio overlay without mandatory autoplay",()=>{
 const img=renderToStaticMarkup(createElement(MediaStage,{kind:"image",src:"/cover.jpg",alt:"Cover"}));
 assert.match(img,/alt="Cover"/);assert.doesNotMatch(img,/autoPlay/);
 const audio=renderToStaticMarkup(createElement(MediaStage,{kind:"audio",src:"/track.mp3",overlaySrc:"/cover.jpg",alt:"Cover"}));
 assert.match(audio,/type="range"/);assert.match(audio,/audio/);
});
test("comparison and roadmap render supplied evidence without hardcoded claims",()=>{
 const comparison=renderToStaticMarkup(createElement(ComparisonStory,{left:{title:"Before",text:"Legacy"},right:{title:"After",text:"Current"}}));
 assert.match(comparison,/Legacy/);assert.match(comparison,/Current/);
 const roadmap=renderToStaticMarkup(createElement(RoadmapTimeline,{items:[{id:"a",phase:"Q1",title:"Launch",detail:"Publish new channels"}]}));
 assert.match(roadmap,/Publish new channels/);
});
test("workbench provides visible motion and media catalog",()=>{
 const html=renderToStaticMarkup(createElement(PresentationWorkbench));
 assert.match(html,/Media/);assert.match(html,/Word cloud/);
});
