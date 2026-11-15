/** Original HTML layout generator. No Pitch slide markup, CSS or third-party media is copied. */
const esc=(value)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const text=(v)=>esc(v);
const kicker=(slide)=>`<span class="eyebrow" data-reveal>${text(slide.kicker||"PERSPECTIVE")}</span>`;
const title=(slide,large=false)=>large?`<h1 data-reveal>${text(slide.title)}</h1>`:`<h2 data-reveal>${text(slide.title)}</h2>`;
const foot=(recipe,index)=>`<div class="footer"><span>${text(recipe.title)} / ORIGINAL HTML</span><span>${String(index+1).padStart(2,"0")} / ${String(recipe.slides.length).padStart(2,"0")}</span></div>`;
function sectionContent(slide){
 const items=slide.items||[];
 switch(slide.type){
  case "cover":return `${kicker(slide)}<div class="pcl-template-center">${title(slide,true)}<p data-reveal>${text(slide.subtitle)}</p><div class="accent-rule" data-reveal></div></div>`;
  case "chapter":return `${kicker(slide)}<div class="pcl-template-center"><div class="number" data-reveal>${text(slide.chapter||"01")}.</div>${title(slide)}</div>`;
  case "statement":return `${kicker(slide)}<div class="pcl-template-center">${title(slide,true)}<p data-reveal>${text(slide.body)}</p></div>`;
  case "quote":return `${kicker(slide)}<div class="pcl-template-center"><p class="pcl-template-quote" data-reveal>“${text(slide.quote)}”</p><p data-reveal>${text(slide.title)}</p></div>`;
  case "cards":return `${kicker(slide)}<div class="pcl-template-top">${title(slide)}</div><div class="tiles">${items.map((item,i)=>`<div class="tile" data-reveal><span class="eyebrow">${String(i+1).padStart(2,"0")} / PILLAR</span><strong>${text(item.title)}</strong><p>${text(item.detail)}</p></div>`).join("")}</div>`;
  case "comparison":return `${kicker(slide)}<div class="pcl-template-top">${title(slide)}</div><div class="pcl-template-comparison">${items.map((item,i)=>`<div data-reveal><span class="eyebrow">${i===0?"CURRENT":"FUTURE"}</span><h3>${text(item.title)}</h3><p>${text(item.detail)}</p></div>`).join("")}</div>`;
  case "metrics":return `${kicker(slide)}<div class="pcl-template-top">${title(slide)}</div><div class="card-row">${items.map(item=>`<div class="metric" data-reveal><span class="eyebrow">${text(item.title)}</span><div class="num">${text(item.value)}</div><p>Illustrative measurement / replace with real data</p></div>`).join("")}</div>`;
  case "timeline":return `${kicker(slide)}<div class="pcl-template-top">${title(slide)}</div><div class="tiles">${items.map((item,i)=>`<div class="tile" data-reveal><span class="eyebrow">PHASE ${i+1}</span><strong>${text(item.title)}</strong><p>${text(item.detail)}</p></div>`).join("")}</div>`;
  case "media":return `${kicker(slide)}<div class="pcl-template-top">${title(slide)}</div><div class="pcl-template-media" data-reveal><div class="pcl-template-media-art" aria-hidden="true"><div class="pcl-template-orbit"></div></div><p>${text(slide.body)}</p><span>MEDIA SLOT / USER-SUPPLIED ASSET</span></div>`;
  case "closing":return `${kicker(slide)}<div class="pcl-template-center">${title(slide,true)}<p data-reveal>${text(slide.body)}</p><div class="accent-rule" data-reveal></div></div>`;
  default:throw new Error("Unknown slide type "+slide.type);
 }
}
export function renderDeck(recipe){
 if(!recipe||!Array.isArray(recipe.slides)||!recipe.slides.length)throw new Error("Valid recipe with slides required");
 const sections=recipe.slides.map((slide,index)=>`<section data-slide data-title="${text(slide.title)}" aria-label="Slide ${index+1}: ${text(slide.title)}">${sectionContent(slide)}${foot(recipe,index)}</section>`).join("\n");
 return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${text(recipe.title)} · Personal Component Library</title><meta name="description" content="Original, editable HTML presentation.">
<link rel="stylesheet" href="./deck-core.css"></head>
<body><main class="deck-viewport"><div class="deck ${text(recipe.theme||"theme-editorial")}" data-deck data-pace="1750" aria-label="${text(recipe.title)} HTML presentation">
${sections}
</div></main>
<nav class="deck-controls" aria-label="Slide controls"><button data-prev type="button" aria-label="Previous reveal">←</button>
<span data-count class="count" aria-live="polite">01 / ${recipe.slides.length}</span>
<button data-next type="button" aria-label="Next reveal">→</button>
<button data-auto type="button" aria-pressed="false">Auto pace</button></nav>
<div class="deck-progress" aria-hidden="true"><span data-progress></span></div>
<script src="./deck-core.js"></script></body></html>`;
}
