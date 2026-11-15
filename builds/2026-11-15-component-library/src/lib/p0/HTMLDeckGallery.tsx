import { useMemo, useState } from "react";

export type DeckTemplate = {
  id: string; title: string; category: "Strategy"|"Brand"|"Performance"|"Product"|"Film / Sonic"|"Research";
  description: string; headline: string; inspiration: string;
  colors: {background:string;foreground:string;accent:string};
};
export const deckTemplates:DeckTemplate[]=[
 {id:"editorial",title:"Editorial Narrative",category:"Strategy",headline:"Beyond the obvious.",description:"Magazine-like strategy stories, section openers and unhurried reveals.",inspiration:"Pitch Editorial",colors:{background:"#f5f3ed",foreground:"#202422",accent:"#986249"}},
 {id:"board-report",title:"Board Report",category:"Strategy",headline:"From progress to possibility.",description:"MD-ready strategy, KPI disclosure and decisions.",inspiration:"Pitch Board Report",colors:{background:"#15242d",foreground:"#e9eef0",accent:"#dfb779"}},
 {id:"kpi-report",title:"KPI Evidence",category:"Performance",headline:"Measure what moves us.",description:"Analytical scorecards, charts and actionable learnings.",inspiration:"Pitch KPI Report",colors:{background:"#f6f8f8",foreground:"#22353d",accent:"#3b7382"}},
 {id:"marketing-campaign",title:"Marketing Campaign",category:"Brand",headline:"Make it impossible to ignore.",description:"Cultural tension, creative territories, reveal and amplification.",inspiration:"Pitch Marketing Campaign",colors:{background:"#f5f1e9",foreground:"#161717",accent:"#c05b40"}},
 {id:"film-pitch",title:"Film Pitch",category:"Film / Sonic",headline:"A story you can feel.",description:"Atmosphere, narrative acts and a cinematic media-stage placeholder.",inspiration:"Pitch Film Pitch Deck",colors:{background:"#101d26",foreground:"#f2ede4",accent:"#c7a371"}},
 {id:"strategic-plan",title:"Strategic Plan",category:"Strategy",headline:"The direction is ours to define.",description:"Business truths, comparisons, measurable ambition and action.",inspiration:"Pitch Strategic Plan",colors:{background:"#f5f3ed",foreground:"#202422",accent:"#986249"}},
 {id:"product-launch",title:"Product Launch",category:"Product",headline:"Meet the next way forward.",description:"Customer friction, feature showcase and a product media walkthrough.",inspiration:"Pitch Product Launch",colors:{background:"#f6f8f8",foreground:"#22353d",accent:"#3b7382"}},
 {id:"go-to-market",title:"Go-to-Market Strategy",category:"Strategy",headline:"A bigger launch needs a sharper plan.",description:"Audience, channel roles, launch rhythm and management decision.",inspiration:"Pitch Go-to-Market Strategy",colors:{background:"#15242d",foreground:"#e9eef0",accent:"#dfb779"}},
 {id:"research-brief",title:"Research & Insight",category:"Research",headline:"What people really see.",description:"Human-centered research findings and evidence-to-action structure.",inspiration:"Pitch Research Presentation",colors:{background:"#f3e9d8",foreground:"#302820",accent:"#a1714e"}},
 {id:"sonic-launch",title:"Sonic Identity Launch",category:"Film / Sonic",headline:"Some possibilities are heard first.",description:"Emotion, distinctive sound, identity principles and sonic premiere.",inspiration:"Pitch Launch",colors:{background:"#101d26",foreground:"#f2ede4",accent:"#c7a371"}}
];

const categories=["All","Strategy","Brand","Performance","Product","Film / Sonic","Research"] as const;
export function HTMLDeckGallery(){
 const [category,setCategory]=useState<string>("All");
 const [query,setQuery]=useState("");
 const [favorites,setFavorites]=useState<string[]>([]);
 const [onlyFavorites,setOnlyFavorites]=useState(false);
 const [copyStatus,setCopyStatus]=useState("");
 const results=useMemo(()=>deckTemplates.filter(d=>
   (category==="All"||category===d.category)&&(!onlyFavorites||favorites.includes(d.id))&&
   (d.title+" "+d.category+" "+d.description+" "+d.inspiration).toLowerCase().includes(query.toLowerCase())
 ),[category,query,favorites,onlyFavorites]);
 const copy=async(item:DeckTemplate)=>{
   const prompt="Use deck template "+item.id+" ("+item.title+") with the component library visual style. Build an original editable HTML presentation using staged reveals, responsive 16:9 layouts and reusable media components.";
   try{await navigator.clipboard.writeText(prompt);setCopyStatus(item.title+" prompt copied")}catch{setCopyStatus("Clipboard access unavailable; copy the template ID: "+item.id)}
 };
 return <section className="pcl-deck-gallery" aria-label="HTML deck template library">
  <div className="eyebrow">05 / TEMPLATE & DESIGN LIBRARY</div><h1 style={{margin:"16px 0 10px"}}>A library of<br/><em>narrative possibilities.</em></h1>
  <p className="page-intro">Ten original HTML mini-decks based on narrative patterns found in the connected Pitch gallery. Each uses reusable layouts, timed reveals, keyboard controls and accessible alternatives. These are adaptations, not exact design clones.</p>
  <div className="pcl-deck-gallery__toolbar">
   <input aria-label="Search deck templates" type="search" placeholder="Search visual approaches…" value={query} onChange={e=>setQuery(e.target.value)} />
   <button aria-pressed={onlyFavorites} onClick={()=>setOnlyFavorites(!onlyFavorites)}>{onlyFavorites?"★ Favorites only":"☆ Favorites"}</button>
  </div>
  <div className="pcl-deck-gallery__filters" aria-label="Filter deck templates">
   {categories.map(c=><button key={c} aria-pressed={category===c} className={category===c?"is-active":""} onClick={()=>setCategory(c)}>{c}</button>)}
  </div>
  <p className="pcl-deck-gallery__count">{results.length} templates shown · {favorites.length} favorites</p>
  <div className="pcl-deck-gallery__grid">
   {results.map(d=><article key={d.id} className="pcl-deck-gallery__card">
    <div className="pcl-deck-gallery__preview" style={{background:d.colors.background,color:d.colors.foreground}}>
      <span style={{color:d.colors.foreground}}>ORIGINAL HTML / NARRATIVE STUDY</span>
      <strong>{d.headline}</strong><i style={{background:d.colors.accent}}/>
    </div>
    <div className="pcl-deck-gallery__info">
     <div className="pcl-deck-gallery__eyebrow"><span>{d.category}</span><button onClick={()=>setFavorites(f=>f.includes(d.id)?f.filter(x=>x!==d.id):[...f,d.id])} aria-pressed={favorites.includes(d.id)} aria-label={(favorites.includes(d.id)?"Remove ":"Add ")+d.title+" favorite"}>{favorites.includes(d.id)?"★":"☆"}</button></div>
     <h3>{d.title}</h3><p>{d.description}</p><small>Structure study: {d.inspiration}. Original visual treatment.</small>
     <div className="pcl-deck-gallery__actions">
       <a href={"./decks/pitch-inspired/"+d.id+".html"} target="_blank" rel="noopener noreferrer">Open HTML deck</a>
       <button onClick={()=>copy(d)}>Copy prompt</button>
     </div>
     <code>{d.id}</code>
    </div>
   </article>)}
  </div>
  {!results.length&&<p className="pcl-deck-gallery__empty">No templates match those filters.</p>}
  <p className="pcl-deck-gallery__status" role="status" aria-live="polite">{copyStatus||"Favorite selections are saved for this gallery session only."}</p>
 </section>;
}
