import {test} from "node:test";
import assert from "node:assert/strict";
import {recipes} from "./deck-recipes.mjs";
test("template library has six original expanded deck recipes",()=>{
 assert.ok(Object.keys(recipes).length>=6);
 for(const [id,recipe] of Object.entries(recipes)){
   assert.equal(recipe.id,id);
   assert.ok(recipe.inspiration.templateId);
   assert.equal(recipe.provenance,"original adaptation");
   assert.ok(recipe.slides.length>=5);
   assert.ok(recipe.slides.every(s=>s.type&&s.title));
 }
});
test("no recipe uses a borrowed Pitch image",()=>{
 for(const recipe of Object.values(recipes)){
   assert.equal(recipe.externalAssets?.length||0,0);
 }
});
