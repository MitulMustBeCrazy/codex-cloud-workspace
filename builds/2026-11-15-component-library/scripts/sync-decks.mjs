import { copyFile, mkdir } from "node:fs/promises";
import { recipes } from "../templates/pitch-inspired/deck-recipes.mjs";
await import("./generate-decks.mjs");
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "templates", "pitch-inspired");
const target = join(root, "public", "decks", "pitch-inspired");
const files = ["deck-core.css", "deck-core.js", "editorial.html", "board-report.html", "kpi-report.html", ...Object.keys(recipes).map(name => name + ".html")];
await mkdir(target, { recursive: true });
await Promise.all(files.map(name => copyFile(join(source, name), join(target, name))));
console.log("Synced " + files.length + " offline HTML deck assets for Vite gallery.");
