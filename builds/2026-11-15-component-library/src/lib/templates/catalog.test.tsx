import {test} from "node:test";import assert from "node:assert/strict";
import {createElement} from "react";import {renderToStaticMarkup} from "react-dom/server";
import {HTMLDeckGallery,deckTemplates} from "../p0/HTMLDeckGallery";
test("deck gallery has ten original reusable HTML examples",()=>{
 assert.equal(deckTemplates.length,10);
 assert.equal(new Set(deckTemplates.map(d=>d.id)).size,10);
 assert.ok(deckTemplates.every(d=>d.id&&d.category&&d.inspiration&&d.headline));
 const html=renderToStaticMarkup(createElement(HTMLDeckGallery));
 assert.match(html,/Editorial Narrative/);
 assert.match(html,/Sonic Launch/);
 assert.match(html,/KPI Evidence/);
 assert.match(html,/Open HTML deck/);
});
