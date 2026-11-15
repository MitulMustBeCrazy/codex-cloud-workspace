import {useEffect,useMemo,useRef,useState} from "react";
import type {ReactNode} from "react";
import {ArrowRight,ArrowUpRight,BookOpen,Check,ChevronDown,ChevronRight,Command,Copy,ExternalLink,FileText,FolderOpen,Grid2X2,Layers3,Menu,Moon,Palette,Search,Settings2,Shapes,SlidersHorizontal,Sun,Waveform,X} from "lucide-react";
import {P0Showcase} from "./lib/p0/P0Showcase";
import {HTMLDeckGallery} from "./lib/p0/HTMLDeckGallery";
import {BrandailyWorkbench} from "./lib/workflows/BrandailyWorkbench";
import {PresentationWorkbench} from "./lib/presentation/PresentationWorkbench";
import {AdvancedWorkbench} from "./lib/advanced/AdvancedWorkbench";
import {MotionBrewGallery} from "./lib/motionbrew/MotionBrewGallery";
import {
 accentOptions,appearanceDefaults,deckUrl,htmlDeckTemplates,materialCounts,motionComponents,narrativeBlueprints,
 notionTracker,reactBitsReferences,registryUrl,sectionForQuery,sections,slideStyles,sourceRegistry,sourceRoot,validAppearance
} from "./quietCanvasData";
import type {Appearance,SectionId} from "./quietCanvasData";

const prefKey="pcl.quiet-canvas.appearance.v1";
const savedKey="pcl.quiet-canvas.saved.v1";
const navGroups=["Discover","Collections","Studio"] as const;
type OpenItem={id:string;name:string;description:string;kind:"Native"|"MotionBrew";files:string[];dependencies:string[];source?:string};
const nativeRegistry=new Set(sourceRegistry.filter(item=>!item.name.startsWith("motionbrew-")).map(item=>item.name));
const index=sourceRegistry.map(item=>{
 const slug=item.name.replace(/^motionbrew-/,"");
 const m=motionComponents.find(c=>c.slug===slug);
 return {
  id:item.name,name:item.title.replace(/^MotionBrew /,""),description:item.description,
  kind:(m?"MotionBrew":"Native") as "MotionBrew"|"Native",
  files:item.files.map(f=>f.path),dependencies:"dependencies" in item?(item.dependencies as string[]):[],
  source:m?.documentationUrl
 };
});
const initialAppearance=():Appearance=>{
 try{return validAppearance(JSON.parse(localStorage.getItem(prefKey)||"null"))}catch{return {...appearanceDefaults}}
};
const initialSaved=():string[]=>{
 try{const data=JSON.parse(localStorage.getItem(savedKey)||"[]");return Array.isArray(data)?data.filter(x=>typeof x==="string"):[]}catch{return []}
};
const readSection=():SectionId=>typeof window==="undefined"?"overview":sectionForQuery(new URLSearchParams(window.location.search).get("view"));
function useAppearance(){
 const [appearance,setAppearance]=useState<Appearance>(initialAppearance);
 useEffect(()=>{try{localStorage.setItem(prefKey,JSON.stringify(appearance))}catch{/* storage optional */}},[appearance]);
 return [appearance,(patch:Partial<Appearance>)=>setAppearance(prev=>({...prev,...patch}))] as const;
}
function EyeLabel({children}: {children:ReactNode}){return <span className="qc-eyebrow">{children}</span>}
function SectionHeader({eyebrow,title,description,action}: {eyebrow:string;title:ReactNode;description:string;action?:ReactNode}){
 return <div className="qc-section-intro">
  <div><EyeLabel>{eyebrow}</EyeLabel><h1>{title}</h1><p>{description}</p></div>{action&&<div className="qc-section-action">{action}</div>}
 </div>;
}
function TextAction({children,onClick}: {children:ReactNode;onClick:()=>void}){
 return <button type="button" className="qc-text-link" onClick={onClick}>{children}<ArrowUpRight size={15} aria-hidden="true"/></button>;
}
function Overview({navigate}: {navigate:(page:SectionId)=>void}){
 return <div className="qc-overview">
  <section className="qc-overview-hero">
    <div className="qc-hero-copy"><EyeLabel>PERSONAL DESIGN & DEVELOPMENT LIBRARY <span className="qc-eyebrow-dot">•</span> EST. 2026</EyeLabel>
      <h1>A quieter place<br/>for <span className="qc-serif">better</span> building<span className="qc-red-dot">.</span></h1>
      <p>One considered home for the components, motion, visual systems and presentation stories you return to. Less searching. More making.</p>
      <div className="qc-hero-actions">
        <button className="qc-primary-action" onClick={()=>navigate("components")}>Explore the library <ArrowRight size={17}/></button>
        <TextAction onClick={()=>navigate("decks")}>Browse deck templates</TextAction>
      </div>
    </div>
    <div className="qc-hero-panel">
      <div className="qc-panel-top"><EyeLabel>THE COLLECTION AT A GLANCE</EyeLabel><span className="qc-panel-symbol" aria-hidden="true">✳</span></div>
      <div className="qc-count-major"><span>{materialCounts.registry}</span><small>registry entries</small></div>
      <div className="qc-quiet-rule"/>
      <div className="qc-stat-row">
       <div><strong>{materialCounts.motion}</strong><span>MotionBrew</span></div>
       <div><strong>{materialCounts.decks}</strong><span>HTML decks</span></div>
       <div><strong>{materialCounts.styles}</strong><span>Visual styles</span></div>
      </div>
      <span className="qc-panel-folio">SOURCE-OWNED / ITERATIVE / REUSABLE</span>
    </div>
  </section>
  <section className="qc-collection-feature" aria-labelledby="qc-pickup-title">
    <div className="qc-section-line"><div><EyeLabel>YOUR WORKSPACE</EyeLabel><h2 id="qc-pickup-title">Pick up where you left off.</h2></div><TextAction onClick={()=>navigate("motionbrew")}>See all motion</TextAction></div>
    <div className="qc-feature-grid">
      <button className="qc-feature-tile qc-feature-motion" onClick={()=>navigate("motionbrew")} aria-label="Browse 100 MotionBrew components">
        <div className="qc-tile-head"><span>01 / INTERACTION</span><ArrowUpRight size={18}/></div>
        <div className="qc-feature-motion-art" aria-hidden="true"><i/><i/><i/><i/></div>
        <div className="qc-tile-bottom"><h3>MotionBrew <span>100</span></h3><p>Microinteractions, advanced motion, spatial UI.</p></div>
      </button>
      <button className="qc-feature-tile qc-feature-decks" onClick={()=>navigate("decks")} aria-label="Browse ten HTML presentation decks">
        <div className="qc-tile-head"><span>02 / STORYTELLING</span><ArrowUpRight size={18}/></div>
        <div className="qc-feature-deck-art" aria-hidden="true"><span>01 / THE IDEA</span><strong>Go beyond<br/><em>the expected.</em></strong><i/></div>
        <div className="qc-tile-bottom"><h3>Web deck library <span>10</span></h3><p>Editable HTML stories, reveal pacing and media.</p></div>
      </button>
      <button className="qc-feature-tile qc-feature-workflows" onClick={()=>navigate("brandaily")} aria-label="Explore Brandaily workflow components">
        <div className="qc-tile-head"><span>03 / WORKFLOWS</span><ArrowUpRight size={18}/></div>
        <div className="qc-feature-work-art" aria-hidden="true"><div><span>Today’s focus</span><b>4 priorities</b></div><div><span className="qc-faux-check">✓</span> Review campaign rollout</div><div><span className="qc-faux-ring"/> Approve creative direction</div><div><span className="qc-faux-ring"/> Align launch calendar</div></div>
        <div className="qc-tile-bottom"><h3>Brandaily UI <span>P0–P2</span></h3><p>Tasks, approvals, communications and analytics.</p></div>
      </button>
    </div>
  </section>
  <section className="qc-overview-bottom">
   <div className="qc-pathways"><div className="qc-section-line"><div><EyeLabel>DISCOVER</EyeLabel><h2>Explore by collection.</h2></div></div>
    {[
      {id:"components",name:"Component registry",detail:"Original and imported source files",count:String(materialCounts.registry),icon:<Layers3 size={20}/>},
      {id:"motionbrew",name:"Motion & interaction",detail:"All MotionBrew components",count:String(materialCounts.motion),icon:<Waveform size={20}/>},
      {id:"styles",name:"Visual systems",detail:"Distinctive design directions",count:String(materialCounts.styles),icon:<Palette size={20}/>},
      {id:"blueprints",name:"Narrative blueprints",detail:"Strategic storytelling structures",count:String(materialCounts.blueprints),icon:<FileText size={20}/>},
      {id:"references",name:"Reference shelf",detail:"React Bits inspiration, labeled as references",count:String(materialCounts.references),icon:<BookOpen size={20}/>}
    ].map(x=><button className="qc-path-row" key={x.id} onClick={()=>navigate(x.id as SectionId)}>
      <span className="qc-path-icon">{x.icon}</span><span className="qc-path-name"><strong>{x.name}</strong><small>{x.detail}</small></span>
      <span className="qc-path-count">{x.count}</span><ChevronRight size={17} aria-hidden="true"/>
    </button>)}
   </div>
   <aside className="qc-notes-column"><div className="qc-section-line"><div><EyeLabel>PRINCIPLES</EyeLabel><h2>Made to stay useful.</h2></div></div>
     <p>Quiet Canvas is not a decorative skin. It is a way to make a growing library feel considered: soft surfaces where they help, open space everywhere else.</p>
     <div className="qc-note-quote"><span>“</span><strong>Soft surfaces for emphasis.<br/><em>Space for everything else.</em></strong></div>
     <div className="qc-library-links"><a href={notionTracker} target="_blank" rel="noreferrer">Development knowledge hub <ArrowUpRight size={15}/></a><a href={sourceRoot} target="_blank" rel="noreferrer">GitHub source collection <ArrowUpRight size={15}/></a></div>
   </aside>
  </section>
 </div>;
}
function RegistryBrowser({openId,search,setSearch, saved, toggleSaved}:{
 openId:string|null;search:string;setSearch:(s:string)=>void;saved:string[];toggleSaved:(id:string)=>void;
}){
 const [group,setGroup]=useState<"All"|"Native"|"MotionBrew"|"Saved">("All");
 const [limit,setLimit]=useState(24);
 const [selected,setSelected]=useState<OpenItem|null>(null);
 const filtered=useMemo(()=>index.filter(i=>(group==="All"||group==="Saved"&&saved.includes(i.id)||i.kind===group)
  &&(i.name+" "+i.description+" "+i.id).toLowerCase().includes(search.toLowerCase().trim())),[group,search,saved]);
 useEffect(()=>{setLimit(24)},[group,search]);
 useEffect(()=>{if(openId){const found=index.find(i=>i.id===openId);if(found)setSelected(found)}},[openId]);
 const [status,setStatus]=useState("");
 const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);setStatus("Copied to clipboard")}catch{setStatus("Copy unavailable: "+text)}};
 return <div>
 <SectionHeader eyebrow="01 / THE SOURCE REGISTRY" title={<>Everything, <em>in one place.</em></>}
   description="110 source-backed entries in one searchable registry. Browse selectively, inspect dependencies and open the actual install manifest without guessing what is available."
   action={<a className="qc-quiet-button" href="/r/index.json" target="_blank" rel="noreferrer">Open full registry <ArrowUpRight size={15}/></a>}/>
 <div className="qc-browser-toolbar"><label className="qc-input-wrap"><Search size={17} aria-hidden="true"/><input aria-label="Search registry" type="search" placeholder="Find components, interactions, use cases…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
  <span className="qc-browser-total">{filtered.length} entries</span></div>
 <div className="qc-filter-row" aria-label="Registry groups">{(["All","Native","MotionBrew","Saved"] as const).map(x=><button key={x} type="button" aria-pressed={group===x} onClick={()=>setGroup(x)}>{x}{x==="Native"?" · 10":x==="MotionBrew"?" · 100":x==="Saved"?" · "+saved.length:""}</button>)}</div>
 <div className="qc-registry-list">{filtered.slice(0,limit).map((item,i)=><article key={item.id} className="qc-registry-row">
  <button type="button" className="qc-registry-main" onClick={()=>setSelected(item)}>
    <span className="qc-row-index">{String(i+1).padStart(2,"0")}</span>
    <span className="qc-row-title"><strong>{item.name}</strong><small>{item.description}</small></span>
    <span className="qc-row-kind">{item.kind}</span><ChevronRight size={18} aria-hidden="true"/>
  </button>
  <button className="qc-save-button" aria-label={(saved.includes(item.id)?"Unsave ":"Save ")+item.name} title={saved.includes(item.id)?"Remove from saved":"Save for later"} onClick={()=>toggleSaved(item.id)} aria-pressed={saved.includes(item.id)}>{saved.includes(item.id)?"★":"☆"}</button>
 </article>)}</div>
 {filtered.length===0&&<div className="qc-empty">No matching components. Try a broader name or reset the filters.</div>}
 {limit<filtered.length&&<button className="qc-load-more" onClick={()=>setLimit(v=>v+24)}>Show more <span>{Math.min(24,filtered.length-limit)} additional entries</span><ArrowRight size={15}/></button>}
 <p className="qc-browser-caption">Source availability does not imply production readiness. Some imported components need configuration and browser-specific testing.</p>
 {selected&&<div className="qc-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}>
  <section className="qc-detail-dialog" role="dialog" aria-modal="true" aria-label={"Component details: "+selected.name}>
   <header><div><EyeLabel>COMPONENT / {selected.kind.toUpperCase()}</EyeLabel><h2>{selected.name}</h2><p>{selected.description}</p></div><button aria-label="Close component details" onClick={()=>setSelected(null)}><X size={18}/></button></header>
   <div className="qc-detail-status"><span className="qc-status-dot"/>{selected.kind==="MotionBrew"?"Source imported · integration review required":"Source available · see registry manifest"}</div>
   <div className="qc-detail-section"><h3>Source files</h3>{selected.files.map(f=><code key={f}>{f}</code>)}</div>
   <div className="qc-detail-section"><h3>Dependencies</h3><p>{selected.dependencies.length?selected.dependencies.join(" · "):"See the manifest for local and transitive dependencies."}</p></div>
   <div className="qc-detail-actions">
    <a href={registryUrl(selected.id)} target="_blank" rel="noreferrer">View registry JSON <ArrowUpRight size={15}/></a>
    {selected.source&&<a href={selected.source} target="_blank" rel="noreferrer">Provider documentation <ArrowUpRight size={15}/></a>}
    <button onClick={()=>copy(window.location.origin+registryUrl(selected.id))}><Copy size={14}/> Copy registry URL</button>
    <button onClick={()=>toggleSaved(selected.id)}>{saved.includes(selected.id)?"Remove saved":"Save component"}</button>
   </div>
   <p role="status" className="qc-dialog-status">{status}</p>
  </section>
 </div>}
 </div>;
}
function StylesBrowser(){
 const [selected,setSelected]=useState(slideStyles[0].id);
 const chosen=slideStyles.find(i=>i.id===selected)||slideStyles[0];
 return <div><SectionHeader eyebrow="04 / VISUAL DIRECTIONS" title={<>A language for <em>every story.</em></>}
 description="Six considered presentation design systems. These are independent narrative treatments, not substitutes for your portal's Quiet Canvas appearance."/>
 <div className="qc-style-grid">{slideStyles.map((style,i)=><button key={style.id} className="qc-style-item" aria-pressed={style.id===selected} onClick={()=>setSelected(style.id)}>
  <div className="qc-style-preview" style={{background:style.background,color:style.foreground}}>
    <span style={{color:style.foreground}}>0{i+1} / THE NEXT CHAPTER</span><strong>Power to<br/><em>go beyond.</em></strong><i style={{background:style.accent}}/>
  </div><div className="qc-style-meta"><div><strong>{style.name}</strong><span>{style.description}</span></div>{selected===style.id?<Check size={18} aria-label="Selected"/>:<ArrowUpRight size={16} aria-hidden="true"/>}</div>
 </button>)}</div>
 <div className="qc-style-selection"><EyeLabel>SELECTED DIRECTION</EyeLabel><div><h3>{chosen.name}</h3><span>{chosen.treatment}</span></div><p>{chosen.bestFor}</p></div>
 </div>;
}
function BlueprintBrowser(){
 const [expanded,setExpanded]=useState<string[]>(["board"]);
 const toggle=(id:string)=>setExpanded(e=>e.includes(id)?e.filter(x=>x!==id):[...e,id]);
 return <div><SectionHeader eyebrow="05 / NARRATIVE FRAMEWORKS" title={<>A better story <em>begins with structure.</em></>}
 description="Five reusable frameworks for management, brand, sonic, product and performance storytelling. Each shows the narrative beats before visual treatment."/>
 <div className="qc-blueprint-list">{narrativeBlueprints.map((b,i)=><article key={b.id} className="qc-blueprint-item">
  <button aria-expanded={expanded.includes(b.id)} onClick={()=>toggle(b.id)}>
   <span className="qc-row-index">0{i+1}</span><span className="qc-blueprint-text"><strong>{b.title}</strong><small>{b.purpose}</small></span><span className="qc-beat-count">{b.slides.length} beats</span><ChevronDown size={18} className={expanded.includes(b.id)?"rotated":""}/>
  </button>
  {expanded.includes(b.id)&&<div className="qc-blueprint-content">
   <ol>{b.slides.map((beat,n)=><li key={beat}><span>{String(n+1).padStart(2,"0")}</span>{beat}</li>)}</ol>
   <p>Compatible styles: {b.styles.map(s=>slideStyles.find(v=>v.id===s)?.name||s).join(" · ")}</p>
  </div>}
 </article>)}</div></div>;
}
function ReferencesBrowser(){
 const [query,setQuery]=useState("");
 const [category,setCategory]=useState("All");
 const groups=["All",...new Set(reactBitsReferences.map(x=>x.category))];
 const results=reactBitsReferences.filter(x=>(category==="All"||x.category===category)&&x.name.toLowerCase().includes(query.trim().toLowerCase()));
 return <div><SectionHeader eyebrow="06 / REFERENCE SHELF" title={<>A little inspiration, <em>kept close.</em></>}
 description="39 curated React Bits references from the earlier design-library shortlist. These are inspiration links only, not imported or licensed source files."
 action={<a className="qc-quiet-button" href="https://reactbits.dev/" target="_blank" rel="noreferrer">Visit React Bits <ArrowUpRight size={15}/></a>}/>
 <div className="qc-browser-toolbar"><label className="qc-input-wrap"><Search size={17}/><input type="search" aria-label="Search React Bits references" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a reference…" /></label><span className="qc-browser-total">{results.length} references</span></div>
 <div className="qc-filter-row">{groups.map(g=><button key={g} aria-pressed={category===g} onClick={()=>setCategory(g)}>{g}</button>)}</div>
 <div className="qc-references-grid">{results.map((r,i)=><a key={r.name} className="qc-reference-row" href="https://reactbits.dev/" target="_blank" rel="noreferrer">
   <span className="qc-row-index">{String(i+1).padStart(2,"0")}</span><span><strong>{r.name}</strong><small>{r.category}</small></span><em>{r.tier==="Pro reference"?"Pro reference":"Reference"}</em><ArrowUpRight size={16}/></a>)}</div>
 <div className="qc-reference-note"><BookOpen size={19}/><span>These names are retained as design references. Select an item for evaluation before copying or installing any third-party source.</span></div>
 </div>;
}
function AppearanceDialog({appearance,update,onClose}:{appearance:Appearance;update:(p:Partial<Appearance>)=>void;onClose:()=>void}){
 const first=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>{first.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)},[onClose]);
 return <div className="qc-dialog-backdrop qc-appearance-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="qc-appearance-dialog" role="dialog" aria-modal="true" aria-label="Appearance settings">
   <header><div><EyeLabel>YOUR WORKSPACE</EyeLabel><h2>Make it yours.</h2><p>Three independent decisions. No unnecessary complexity.</p></div><button ref={first} onClick={onClose} aria-label="Close appearance settings"><X size={19}/></button></header>
   <div className="qc-setting-group"><h3>Color accent</h3><p>One character, used sparingly.</p>
    <div className="qc-accent-options">{accentOptions.map(a=><button key={a.id} aria-pressed={appearance.accent===a.id} onClick={()=>update({accent:a.id})}><span className="qc-swatch" style={{background:a.hex}}/>{a.label}{appearance.accent===a.id&&<Check size={16}/>}</button>)}</div>
   </div>
   <div className="qc-setting-group"><h3>Surface treatment</h3><p>Let content decide where structure belongs.</p>
    <div className="qc-setting-duo"><button aria-pressed={appearance.surface==="soft-focus"} onClick={()=>update({surface:"soft-focus"})}><span className="qc-mini-soft" aria-hidden="true"><i/><i/></span><strong>Soft Focus</strong><small>Quiet emphasis</small></button><button aria-pressed={appearance.surface==="open-canvas"} onClick={()=>update({surface:"open-canvas"})}><span className="qc-mini-open" aria-hidden="true"><i/><i/></span><strong>Open Canvas</strong><small>Maximum openness</small></button></div>
   </div>
   <div className="qc-setting-group"><h3>Appearance</h3><p>A comfortable canvas, day or night.</p>
     <div className="qc-setting-buttons"><button aria-pressed={appearance.theme==="light"} onClick={()=>update({theme:"light"})}><Sun size={16}/> Light</button><button aria-pressed={appearance.theme==="dark"} onClick={()=>update({theme:"dark"})}><Moon size={16}/> Dark</button></div>
   </div>
   <div className="qc-setting-footer"><span>Changes save to this browser automatically.</span><button onClick={()=>update({...appearanceDefaults})}>Restore defaults</button></div>
  </section>
 </div>;
}
type SearchEntry={kind:string;name:string;description:string;route:SectionId;query?:string;href?:string};
function GlobalSearch({onClose,onPick}:{onClose:()=>void;onPick:(entry:SearchEntry)=>void}){
 const [query,setQuery]=useState("");const input=useRef<HTMLInputElement|null>(null);
 useEffect(()=>{input.current?.focus();const fn=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};document.addEventListener("keydown",fn);return()=>document.removeEventListener("keydown",fn)},[onClose]);
 const options:SearchEntry[]=[
  ...sections.map(s=>({kind:"Section",name:s.name,description:s.description,route:s.id})),
  ...index.map(c=>({kind:c.kind,name:c.name,description:c.description,route:c.kind==="MotionBrew"?"motionbrew" as SectionId:"components" as SectionId,query:c.id})),
  ...htmlDeckTemplates.map(c=>({kind:"Deck",name:c.title,description:c.description,route:"decks" as SectionId,href:deckUrl(c.id)})),
  ...reactBitsReferences.map(c=>({kind:"Reference",name:c.name,description:c.category,route:"references" as SectionId,query:c.name}))
 ];
 const matches=options.filter(x=>(x.name+" "+x.description+" "+x.kind).toLowerCase().includes(query.toLowerCase().trim())).slice(0,12);
 return <div className="qc-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="qc-search-dialog" role="dialog" aria-modal="true" aria-label="Search the library">
   <label className="qc-search-dialog-input"><Search size={19}/><input ref={input} autoComplete="off" type="search" aria-label="Search all library materials" placeholder="Search components, decks, systems, references…" value={query} onChange={e=>setQuery(e.target.value)}/><button aria-label="Close library search" onClick={onClose}><X size={16}/></button></label>
   <div className="qc-search-results"><span className="qc-search-caption">{query?"MATCHING MATERIALS":"QUICK ACCESS"}</span>
    {matches.map((m,i)=><button key={m.kind+"-"+m.name+"-"+i} onClick={()=>onPick(m)}><span className="qc-search-entry-icon">{m.kind==="Deck"?<FileText size={18}/>:m.kind==="Reference"?<BookOpen size={18}/>:<Layers3 size={18}/>}</span>
      <span><strong>{m.name}</strong><small>{m.kind} · {m.description}</small></span><ArrowUpRight size={16}/></button>)}
    {!matches.length&&<p>No matching material found. Try another term.</p>}
   </div><footer>Search across {materialCounts.registry} registry entries, {materialCounts.decks} decks and {materialCounts.references} curated references <kbd>ESC</kbd></footer>
  </section>
 </div>;
}
function LegacySpecimen({children,title,description}:{children:ReactNode;title:string;description:string}){
 return <div className="qc-legacy-page"><div className="qc-specimen-header"><EyeLabel>STUDIO / INTERACTIVE WORKBENCH</EyeLabel><h1>{title}</h1><p>{description}</p></div><div className="qc-legacy-specimen">{children}</div></div>;
}
function QuietCanvasPortal(){
 const [appearance,updateAppearance]=useAppearance();
 const [section,setSection]=useState<SectionId>(readSection);
 const [mobileNav,setMobileNav]=useState(false);
 const [appearanceOpen,setAppearanceOpen]=useState(false);
 const [searchOpen,setSearchOpen]=useState(false);
 const [registrySearch,setRegistrySearch]=useState("");
 const [openedRegistry,setOpenedRegistry]=useState<string|null>(null);
 const [motionSearch,setMotionSearch]=useState("");
 const [saved,setSaved]=useState<string[]>(initialSaved);
 useEffect(()=>{try{localStorage.setItem(savedKey,JSON.stringify(saved))}catch{/* optional */}},[saved]);
 const navigate=(id:SectionId)=>{
  setSection(id);setMobileNav(false);setSearchOpen(false);
  const url=new URL(window.location.href);url.searchParams.set("view",id);window.history.pushState({}, "",url.pathname+url.search+url.hash);
  window.scrollTo({top:0,behavior:"instant"});
 };
 useEffect(()=>{const pop=()=>setSection(readSection());window.addEventListener("popstate",pop);return()=>window.removeEventListener("popstate",pop)},[]);
 useEffect(()=>{const shortcut=(e:KeyboardEvent)=>{
   if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setSearchOpen(v=>!v)}
   else if(e.key==="/"&&!/INPUT|TEXTAREA/.test((e.target as HTMLElement)?.tagName||"")&&!appearanceOpen&&!searchOpen){e.preventDefault();setSearchOpen(true)}
  };document.addEventListener("keydown",shortcut);return()=>document.removeEventListener("keydown",shortcut)},[appearanceOpen,searchOpen]);
 const toggleSaved=(id:string)=>setSaved(list=>list.includes(id)?list.filter(v=>v!==id):[...list,id]);
 const pickSearch=(entry:SearchEntry)=>{
  if(entry.kind==="MotionBrew"){setMotionSearch(entry.name.replace(/^MotionBrew /,"").trim());navigate("motionbrew")}
  else if(entry.kind==="Native"){setRegistrySearch(entry.query||entry.name);setOpenedRegistry(entry.query||null);navigate("components")}
  else if(entry.kind==="Deck"&&entry.href){navigate("decks");window.open(entry.href,"_blank","noopener,noreferrer")}
  else navigate(entry.route);
  setSearchOpen(false);
 };
 const current=sections.find(s=>s.id===section)||sections[0];
 const nav=<><div className="qc-brand"><span className="qc-brand-symbol" aria-hidden="true"><span>◈</span></span><span><strong>quiet canvas<span className="qc-brand-period">.</span></strong><small>YOUR DESIGN LIBRARY</small></span></div>
   <div className="qc-nav-scroll">{navGroups.map(group=><div className="qc-nav-group" key={group}>
     <span className="qc-nav-heading">{group}</span><nav aria-label={group+" sections"}>{sections.filter(s=>s.group===group).map(s=><button key={s.id} aria-current={section===s.id?"page":undefined} onClick={()=>navigate(s.id)}>
       <span className="qc-nav-icon" aria-hidden="true">{s.id==="overview"?<Grid2X2 size={17}/>:s.id==="components"?<Layers3 size={17}/>:s.id==="motionbrew"?<Waveform size={17}/>:s.id==="decks"?<FileText size={17}/>:s.id==="references"?<BookOpen size={17}/>:s.id==="styles"?<Palette size={17}/>:s.id==="blueprints"?<Shapes size={17}/>:<SlidersHorizontal size={17}/>}</span><span>{s.name}</span>
       {s.id==="components"&&<em>{materialCounts.registry}</em>}{s.id==="motionbrew"&&<em>{materialCounts.motion}</em>}
     </button>)}</nav></div>)}</div>
   <div className="qc-sidebar-footer"><div className="qc-sidebar-mini"><span className="qc-live-pulse"/><span>Library preview<br/><small>Source-backed, always evolving</small></span></div><a href={notionTracker} target="_blank" rel="noreferrer">Development notes <ArrowUpRight size={14}/></a></div></>;
 return <div className="qc-shell" data-theme={appearance.theme} data-accent={appearance.accent} data-surface={appearance.surface}>
   {mobileNav&&<button aria-label="Close navigation" className="qc-mobile-shade" onClick={()=>setMobileNav(false)}/>}
   <aside className={"qc-sidebar"+(mobileNav?" qc-sidebar-open":"")}>{nav}</aside>
   <div className="qc-app-body">
    <header className="qc-topbar"><div className="qc-topbar-left">
      <button className="qc-mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button>
      <span className="qc-breadcrumb-parent">Library</span><ChevronRight size={14} className="qc-breadcrumb-chevron"/><strong>{current.name}</strong>
    </div>
    <div className="qc-topbar-right"><button className="qc-search-trigger" onClick={()=>setSearchOpen(true)}><Search size={17}/><span>Search library</span><kbd>⌘ K</kbd></button>
      <a className="qc-top-icon" aria-label="GitHub repository" href={sourceRoot} target="_blank" rel="noreferrer"><FolderOpen size={19}/></a>
      <button className="qc-appearance-trigger" onClick={()=>setAppearanceOpen(true)} aria-label="Appearance"><Settings2 size={18}/><span>Appearance</span></button>
    </div></header>
    <main className="qc-main" id="main-content">
     {section==="overview"&&<Overview navigate={navigate}/>}
     {section==="components"&&<RegistryBrowser search={registrySearch} setSearch={setRegistrySearch} openId={openedRegistry} saved={saved} toggleSaved={toggleSaved}/>}
     {section==="motionbrew"&&<div className="qc-module-wrap"><MotionBrewGallery initialQuery={motionSearch}/></div>}
     {section==="decks"&&<div className="qc-module-wrap"><HTMLDeckGallery/></div>}
     {section==="styles"&&<StylesBrowser/>}
     {section==="blueprints"&&<BlueprintBrowser/>}
     {section==="references"&&<ReferencesBrowser/>}
     {section==="p0"&&<LegacySpecimen title="The essentials, refined." description="Original primitives for clear task, metric and presentation interfaces. Every demo is local to this library."><P0Showcase/></LegacySpecimen>}
     {section==="brandaily"&&<div className="qc-module-wrap qc-workbench-area"><BrandailyWorkbench/></div>}
     {section==="presentation"&&<div className="qc-module-wrap qc-workbench-area"><PresentationWorkbench/></div>}
     {section==="lab"&&<div className="qc-module-wrap qc-workbench-area"><AdvancedWorkbench/></div>}
     <footer className="qc-footer"><span>Quiet Canvas / A home for better building</span><span>{materialCounts.registry} source entries · {materialCounts.decks} decks · {materialCounts.references} references</span></footer>
    </main>
   </div>
   {appearanceOpen&&<AppearanceDialog appearance={appearance} update={updateAppearance} onClose={()=>setAppearanceOpen(false)}/>}
   {searchOpen&&<GlobalSearch onClose={()=>setSearchOpen(false)} onPick={pickSearch}/>}
 </div>;
}
export default QuietCanvasPortal;
