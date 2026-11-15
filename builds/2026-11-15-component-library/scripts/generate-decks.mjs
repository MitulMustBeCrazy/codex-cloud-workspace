import {writeFile} from "node:fs/promises";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {recipes} from "../templates/pitch-inspired/deck-recipes.mjs";
import {renderDeck} from "../templates/pitch-inspired/template-renderer.mjs";
const root=join(dirname(fileURLToPath(import.meta.url)),"..","templates","pitch-inspired");
for(const recipe of Object.values(recipes)){
 await writeFile(join(root,recipe.id+".html"),renderDeck(recipe),"utf8");
}
console.log("Generated "+Object.keys(recipes).length+" original animated HTML decks.");
