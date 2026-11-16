import {useState} from "react";
import {ArrowUpRight,Check,ChevronDown,Copy,ExternalLink,ShieldCheck,Sparkles} from "lucide-react";
import "./DesignIntegrationWorkbench.css";

type SourceId="astryx"|"impeccable"|"designer-skills"|"design-md";
type AuditKey="hierarchy"|"clarity"|"accessibility"|"responsive"|"motion";
const sources:{id:SourceId;name:string;url:string;role:string;mode:string}[]=[
 {id:"astryx",name:"Meta Astryx",url:"https://github.com/meta/astryx",role:"Component reference",mode:"Adapt and validate for React projects"},
 {id:"impeccable",name:"Impeccable",url:"https://github.com/pbakaus/impeccable",role:"Critique methods",mode:"Design review and polish"},
 {id:"designer-skills",name:"Designer Skills",url:"https://github.com/Owl-Listener/designer-skills",role:"Design operations",mode:"Research through delivery"},
 {id:"design-md",name:"Awesome DESIGN.md",url:"https://github.com/VoltAgent/awesome-design-md",role:"Style references",mode:"Turn visual rules into tokens"}
];
const auditItems:{id:AuditKey;label:string;detail:string}[]=[
 {id:"hierarchy",label:"Visual hierarchy",detail:"One primary action per surface; title and supporting copy are distinct."},
 {id:"clarity",label:"Interaction clarity",detail:"Control names describe their result; status changes are visible."},
 {id:"accessibility",label:"Accessible interaction",detail:"Keyboard focus, labels, target sizes and contrast are considered."},
 {id:"responsive",label:"Responsive composition",detail:"Content rearranges cleanly at narrow and wide widths."},
 {id:"motion",label:"Motion restraint",detail:"Motion supports meaning and respects reduced-motion preferences."}
];
const recipes=[
 {name:"Quiet Canvas",background:"#F7F6F3",surface:"#FFFFFF",ink:"#25292C",accent:"#C53B49",radius:"14px",description:"Calm, editorial surfaces for daily work."},
 {name:"Boardroom",background:"#F2F0EA",surface:"#FFFEFC",ink:"#17212A",accent:"#315FAB",radius:"8px",description:"High-contrast, structured presentations."},
 {name:"Night Studio",background:"#151A22",surface:"#222B35",ink:"#F4F1EA",accent:"#D8A968",radius:"16px",description:"Focused, dark workbench for media-rich layouts."}
] as const;
export function DesignIntegrationWorkbench(){
 const [tab,setTab]=useState<"components"|"audit"|"styles"|"sources">("components");
 const [segment,setSegment]=useState("In progress");
 const [enabled,setEnabled]=useState(true);
 const [expanded,setExpanded]=useState(false);
 const [notice,setNotice]=useState("");
 const [checks,setChecks]=useState<AuditKey[]>(["hierarchy","clarity"]);
 const [recipe,setRecipe]=useState(0);
 const active=recipes[recipe];
 const themeCss=`:root { --canvas: ${active.background}; --surface: ${active.surface}; --ink: ${active.ink}; --accent: ${active.accent}; --radius: ${active.radius}; }`;
 const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);setNotice("Copied to clipboard");}catch{setNotice("Clipboard unavailable. Select the visible tokens to copy.");}};
 return <section className="di-root" aria-label="Design integration workbench">
  <header className="di-heading"><div><span className="di-eyebrow">DESIGN SYSTEMS / LIVE WORKBENCH</span><h1>Design intelligence, <em>in motion.</em></h1><p>Original executable React patterns, interactive evaluation and reusable design tokens. Source repositories remain clearly attributed, not represented as wholesale imports.</p></div><span className="di-version">INTEGRATION V1</span></header>
  <nav className="di-tabs" aria-label="Design integration views">
   {(["components","audit","styles","sources"] as const).map(id=><button key={id} type="button" aria-current={tab===id?"page":undefined} onClick={()=>{setTab(id);setNotice("");}}>{({components:"Live components",audit:"Design QA",styles:"Style lab",sources:"Sources"} as const)[id]}</button>)}
  </nav>
  {tab==="components"&&<div className="di-workarea">
   <div className="di-panel di-panel-large"><div className="di-panel-meta"><span>01 / FUNCTIONAL COMPONENTS</span><strong>Stateful · Keyboard accessible</strong></div><h2>Project controls</h2><p>Source-owned components ready to adapt for Brandaily, ThoughtOS and presentation tooling.</p>
    <div className="di-component-demo">
     <div className="di-field"><span className="di-field-label">Campaign status</span><div className="di-segment" role="group" aria-label="Campaign status">{["Planned","In progress","Complete"].map(v=><button key={v} type="button" aria-pressed={segment===v} onClick={()=>setSegment(v)}>{v}</button>)}</div><small role="status">Current selection: {segment}</small></div>
     <div className="di-field di-toggle-line"><span><strong>Enable notifications</strong><small>Receive relevant approval updates.</small></span><button type="button" className="di-switch" role="switch" aria-label="Enable notifications" aria-checked={enabled} onClick={()=>setEnabled(x=>!x)}><span/></button></div>
     <div className="di-field"><button className="di-accordion" aria-expanded={expanded} aria-controls="di-guidance" onClick={()=>setExpanded(x=>!x)}>Review guidance <ChevronDown aria-hidden="true" size={17}/></button>{expanded&&<p id="di-guidance" className="di-accordion-content">Assign an owner, keep the primary next action visible and show approvals without requiring a separate navigation step.</p>}</div>
     <button type="button" className="di-action" onClick={()=>setNotice("Demo action completed. No project data was changed.")}>Run demo action <ArrowUpRight size={16}/></button>
     <div className="di-notice" aria-live="polite">{notice||"Try the controls. All state is local to this preview."}</div>
    </div>
   </div>
   <aside className="di-panel"><div className="di-panel-meta"><span>IMPLEMENTATION</span><ShieldCheck size={16}/></div><h3>Built for reuse</h3><ul><li>Controlled interaction state</li><li>Semantic buttons and ARIA states</li><li>Reduced-motion styles</li><li>No external service or credentials</li><li>Distinct from third-party source code</li></ul><p className="di-small">These original specimens are executable here. Astryx integration into a consuming app still requires framework and license review.</p></aside>
  </div>}
  {tab==="components"&&<section className="di-panel di-upstream"><div className="di-panel-meta"><span>UPSTREAM COMPONENT EXECUTION / META ASTRYX</span><a href="/astryx-live.html" target="_blank" rel="noreferrer">Open standalone <ExternalLink size={15}/></a></div><h2>Astryx, running in isolation.</h2><p>The specimen below runs the published Astryx React component bundle independently of Quiet Canvas. Source: MIT-licensed <a href="https://github.com/meta/astryx" target="_blank" rel="noreferrer">Meta Astryx</a>. CDN connectivity is required.</p><iframe title="Live Astryx component specimen" loading="lazy" src="/astryx-live.html" sandbox="allow-scripts allow-same-origin"/></section>}
  {tab==="audit"&&<div className="di-workarea"><div className="di-panel di-panel-large"><div className="di-panel-meta"><span>02 / PRODUCT DESIGN QA</span><strong>Interactive checklist</strong></div><h2>Five checks before release.</h2><p>Derived from critique and design-operations workflows. Use this as an initial self-review, not an automated accessibility certification.</p><div className="di-checklist">{auditItems.map(item=><label key={item.id} className="di-check"><input type="checkbox" checked={checks.includes(item.id)} onChange={e=>setChecks(prev=>e.target.checked?[...prev,item.id]:prev.filter(k=>k!==item.id))}/><span><strong>{item.label}</strong><small>{item.detail}</small></span></label>)}</div></div><aside className="di-panel di-score"><span>REVIEW COVERAGE</span><strong>{checks.length}<small> / 5</small></strong><div className="di-meter"><i style={{width:(checks.length/5*100)+"%"}}/></div><p>{checks.length===5?"All checks marked for review.":"Review remaining checks before declaring the experience ready."}</p><button className="di-secondary" onClick={()=>setChecks([])}>Reset review</button></aside></div>}
  {tab==="styles"&&<div className="di-workarea"><div className="di-panel di-panel-large"><div className="di-panel-meta"><span>03 / DESIGN.MD ADAPTATION</span><span>Original style recipes</span></div><h2>Change the system, not just the color.</h2><p>Choose a recipe to preview real surface and typography contrast, then copy token definitions.</p><div className="di-recipe-selector">{recipes.map((r,i)=><button key={r.name} aria-pressed={recipe===i} onClick={()=>{setRecipe(i);setNotice("");}}>{r.name}</button>)}</div><div className="di-style-preview" style={{background:active.background,color:active.ink}}><div className="di-style-card" style={{background:active.surface,borderRadius:active.radius}}><span style={{color:active.accent}}>SYSTEM PREVIEW / {String(recipe+1).padStart(2,"0")}</span><h3>Considered by design.</h3><p>{active.description}</p><button style={{background:active.accent,color:"#fff",borderRadius:active.radius}} onClick={()=>setNotice("Preview interaction works.")}>Explore the system</button></div></div><div className="di-tokenline"><code>{themeCss}</code><button type="button" onClick={()=>copy(themeCss)} aria-label="Copy CSS design tokens"><Copy size={16}/></button></div><p className="di-notice" role="status">{notice}</p></div><aside className="di-panel"><div className="di-panel-meta"><span>TOKEN MAP</span><Sparkles size={17}/></div><h3>Portable foundation</h3>{(["background","surface","ink","accent"] as const).map(key=><div className="di-color-row" key={key}><span className="di-dot" style={{background:active[key]}}/><span>{key}</span><code>{active[key]}</code></div>)}<p className="di-small">Reference systems are not automatically licensed for redistribution. These are newly authored palettes.</p></aside></div>}
  {tab==="sources"&&<div className="di-source-grid">{sources.map((s,i)=><article className="di-panel" key={s.id}><div className="di-panel-meta"><span>0{i+1} / {s.role.toUpperCase()}</span><ExternalLink size={16}/></div><h2>{s.name}</h2><p>{s.mode}</p><a href={s.url} target="_blank" rel="noreferrer">Open repository <ArrowUpRight size={16}/></a></article>)}</div>}
  <footer className="di-provenance"><Check size={16}/> Original live specimens. Upstream repositories are referenced as inspirations and require individual dependency, license and API checks before code import.</footer>
 </section>;
}
