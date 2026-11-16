import {test} from "node:test";import assert from "node:assert/strict";
import { recipes } from "./deck-recipes.mjs";
import {renderDeck} from "./template-renderer.mjs";
test("generated original deck provides staged reveals and sanitized content",()=>{
 const recipe=recipes["marketing-campaign"];
 const html=renderDeck({...recipe,slides:[{type:"statement",title:"<script>alert(1)</script>",body:"Safe & sound"}]});
 assert.match(html,/&lt;script&gt;/);
 assert.doesNotMatch(html,/<script>alert/);
 assert.match(html,/data-reveal/);
 assert.match(html,/data-slide/);
 assert.match(html,/deck-core.js/);
});
test("every source recipe creates correct number of accessible slides",()=>{
 for(const recipe of Object.values(recipes)){
  const html=renderDeck(recipe);
  assert.equal((html.match(/<section data-slide/g)||[]).length,recipe.slides.length);
  assert.match(html,/aria-label="Slide controls"/);
  assert.match(html,/auto pace/i);
 }
});
