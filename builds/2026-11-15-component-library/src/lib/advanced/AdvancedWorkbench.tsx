import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export type CommandItem={id:string;label:string;group?:string;shortcut?:string;onSelect:()=>void};
export function CommandPalette({open,commands,onClose,title="Command palette"}:{
 open:boolean;commands:CommandItem[];onClose:()=>void;title?:string;
}){
 const [query,setQuery]=useState(""),[selected,setSelected]=useState(0);
 const searchRef=useRef<HTMLInputElement|null>(null);
 const items=useMemo(()=>commands.filter(c=>(c.label+" "+(c.group||"")).toLowerCase().includes(query.toLowerCase())),[commands,query]);
 useEffect(()=>{if(open){searchRef.current?.focus();setQuery("");setSelected(0)}},[open]);
 useEffect(()=>{if(!open)return;const esc=(e:KeyboardEvent)=>{if(e.key==="Escape"){e.preventDefault();onClose()}};document.addEventListener("keydown",esc);return()=>document.removeEventListener("keydown",esc)},[open,onClose]);
 if(!open)return null;
 const choose=(item:CommandItem)=>{item.onSelect();onClose()};
 const key=(e:ReactKeyboardEvent<HTMLInputElement>)=>{
   if(e.key==="ArrowDown"){e.preventDefault();setSelected(s=>(s+1)%Math.max(items.length,1))}
   else if(e.key==="ArrowUp"){e.preventDefault();setSelected(s=>(s+Math.max(items.length,1)-1)%Math.max(items.length,1))}
   else if(e.key==="Enter"&&items[selected]){e.preventDefault();choose(items[selected])}
 };
 return <div className="pcl-command-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
   <section className="pcl-command" role="dialog" aria-modal="true" aria-label={title}>
     <div className="pcl-command__search"><span aria-hidden="true">⌕</span><input ref={searchRef} type="search" aria-label="Search commands" placeholder="Search pages, actions, components…" value={query} onChange={e=>{setQuery(e.target.value);setSelected(0)}} onKeyDown={key}/><button onClick={onClose} aria-label="Close command palette">Close</button></div>
     <ul aria-label="Matching commands">{items.map((c,i)=><li key={c.id} data-selected={i===selected}><button onMouseEnter={()=>setSelected(i)} onClick={()=>choose(c)}>
       <span><small>{c.group||"Action"}</small>{c.label}</span><kbd>{c.shortcut||"↵"}</kbd>
     </button></li>)}</ul>
     {!items.length&&<p className="pcl-empty">No matching commands</p>}
   </section>
 </div>;
}
export type SavedView={id:string;name:string;description?:string};
export function SavedViews({views=[],activeId,onSelect,onSave,onRemove}:{
 views?:SavedView[];activeId?:string;onSelect?:(id:string)=>void;onSave?:(name:string)=>void;onRemove?:(id:string)=>void;
}){
 const [name,setName]=useState("");
 return <section className="pcl-panel" aria-label="Saved views"><div className="pcl-panel__head"><h2>Saved views</h2><span>{views.length} views</span></div>
  <div className="pcl-view-list">{views.length?views.map(v=><div key={v.id} className="pcl-view-list__row">
    <button className={v.id===activeId?"is-active":""} onClick={()=>onSelect?.(v.id)} aria-current={v.id===activeId?"true":undefined}>
      <strong>{v.name}</strong>{v.description&&<small>{v.description}</small>}</button>
    {onRemove&&<button className="pcl-quiet" onClick={()=>onRemove(v.id)} aria-label={"Remove saved view "+v.name}>×</button>}
  </div>):<p className="pcl-empty">No saved views yet.</p>}</div>
  {onSave&&<form className="pcl-view-form" onSubmit={e=>{e.preventDefault();if(name.trim()){onSave(name.trim());setName("")}}}>
   <label htmlFor="pcl-view-name">New saved filter</label><div><input id="pcl-view-name" value={name} onChange={e=>setName(e.target.value)} placeholder="View name" required/><button type="submit">Save</button></div>
  </form>}
 </section>;
}
export type Notice={id:string;text:string;read:boolean;time?:string;category?:string};
export function NotificationCenter({notifications=[],onMarkRead,onOpen}:{
 notifications?:Notice[];onMarkRead?:(id:string)=>void;onOpen?:(id:string)=>void;
}){
 const unread=notifications.filter(n=>!n.read).length;
 return <section className="pcl-panel" aria-label="Notifications"><div className="pcl-panel__head"><h2>Notifications</h2><span>{unread} unread</span></div>
   <ul className="pcl-notifications">{notifications.map(n=><li key={n.id} className={n.read?"is-read":""}>
      <div className="pcl-notifications__dot" aria-hidden="true"/><div><button onClick={()=>onOpen?.(n.id)}>{n.text}</button><small>{n.category||"Activity"}{n.time?" · "+n.time:""}</small></div>
      {!n.read&&onMarkRead&&<button className="pcl-quiet" onClick={()=>onMarkRead(n.id)}>Mark read</button>}
   </li>)}{!notifications.length&&<li className="pcl-empty">All caught up.</li>}</ul>
 </section>;
}
export type BackdropKind="threads"|"particles"|"waves";
export function AnimatedBackground({kind="threads",count=16,active=true}:{
 kind?:BackdropKind;count?:number;active?:boolean;
}){
 const dots=Array.from({length:Math.max(0,Math.min(42,count))},(_,i)=>({
   left:(i*47.31%100)+"%",top:(i*29.67%100)+"%",delay:(i%12*.3)+"s",size:2+i%5
 }));
 return <div className={"pcl-backdrop pcl-backdrop--"+kind+(active?" is-active":"")} aria-hidden="true">
   {kind==="threads"?<svg viewBox="0 0 800 400" preserveAspectRatio="none"><path d="M-50,340 C170,40 290,440 470,110 S720,160 900,-40" /><path d="M-50,200 C180,-90 320,360 540,60 S750,220 920,20"/><path d="M-90,280 C110,80 350,440 560,150 S780,300 940,30"/></svg>:
     kind==="waves"?Array.from({length:7},(_,i)=><div key={i} className="pcl-backdrop__wave" style={{top:(18+i*11)+"%",animationDelay:i*.18+"s"}}/>):
     dots.map((dot,i)=><i key={i} style={{left:dot.left,top:dot.top,width:dot.size,height:dot.size,animationDelay:dot.delay}}/>)}
 </div>;
}
export function PerspectiveCards({items=[]}:{items?:{id:string;title:string;description:string}[]}){
 const [tilt,setTilt]=useState({x:0,y:0});
 return <div className="pcl-perspective" onPointerMove={e=>{
  const bounds=e.currentTarget.getBoundingClientRect();
  setTilt({x:((e.clientY-bounds.top)/bounds.height-.5)*-10,y:((e.clientX-bounds.left)/bounds.width-.5)*12});
 }} onPointerLeave={()=>setTilt({x:0,y:0})} aria-label="Perspective card stack">
   {items.map((card,i)=><div key={card.id} className="pcl-perspective__card"
     style={{transform:`perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${i*8}px)`,zIndex:items.length-i}}>
       <small>{String(i+1).padStart(2,"0")} / FUTURE</small><strong>{card.title}</strong><p>{card.description}</p>
    </div>)}
 </div>;
}
export type CohortRow={name:string;values:(number|null)[]};
export function CohortHeatmap({rows=[]}:{rows?:CohortRow[]}){
 const max=Math.max(1,...rows.flatMap(r=>r.values.filter((v):v is number=>typeof v==="number"&&Number.isFinite(v))));
 return <section className="pcl-panel pcl-cohort" aria-label="Cohort heatmap">
  <div className="pcl-panel__head"><h2>Cohort heatmap</h2><span>Retention %</span></div>
  <div className="pcl-cohort__scroll"><table><thead><tr><th scope="col">Cohort</th>{Array.from({length:Math.max(0,...rows.map(r=>r.values.length))},(_,i)=><th key={i} scope="col">W{i}</th>)}</tr></thead>
  <tbody>{rows.map(row=><tr key={row.name}><th scope="row">{row.name}</th>{row.values.map((v,i)=><td key={i} style={{background:v==null?"#f2f4f4":`rgba(52,120,133,${.08+Math.max(0,Math.min(1,v/max))*.68})`}}>{v==null?"–":v+"%"}</td>)}</tr>)}</tbody></table></div>
 </section>;
}
export type FunnelStep={name:string;value:number};
export function FunnelChart({steps=[]}:{steps?:FunnelStep[]}){
 const top=Math.max(1,...steps.map(s=>Number(s.value)||0));
 return <section className="pcl-panel" aria-label="Conversion funnel"><div className="pcl-panel__head"><h2>Funnel analysis</h2><span>{steps.length} stages</span></div>
  <div className="pcl-funnel">{steps.map((step,i)=><div key={step.name+i} className="pcl-funnel__row">
   <div><strong>{step.name}</strong><span>{new Intl.NumberFormat("en-BD").format(step.value)}</span></div>
   <div className="pcl-funnel__track"><i style={{width:(Math.max(0,step.value)/top*100)+"%"}}/></div>
  </div>)}</div>
 </section>;
}
export type WaterfallItem={label:string;value:number};
export function BudgetWaterfall({items=[]}:{items?:WaterfallItem[]}){
 const ranges=items.map((item,i)=>{const prev=items.slice(0,i).reduce((sum,x)=>sum+x.value,0);return {item,start:prev,end:prev+item.value}});
 const lower=Math.min(0,...ranges.flatMap(r=>[r.start,r.end]));
 const upper=Math.max(1,...ranges.flatMap(r=>[r.start,r.end]));
 const span=upper-lower||1;
 return <section className="pcl-panel" aria-label="Budget waterfall"><div className="pcl-panel__head"><h2>Budget waterfall</h2><span>Illustrative changes</span></div>
   <div className="pcl-waterfall">{ranges.map(({item,start,end},i)=>{const bottom=(Math.min(start,end)-lower)/span*100,height=Math.abs(end-start)/span*100;
     return <div className="pcl-waterfall__col" key={item.label+i}>
       <div className="pcl-waterfall__chart"><i className={item.value<0?"is-negative":""} style={{bottom:bottom+"%",height:Math.max(2,height)+"%"}} /></div>
       <strong>{item.value>0?"+":""}{item.value}</strong><small>{item.label}</small>
     </div>})}</div>
 </section>;
}
const EXAMPLE_COMMANDS=[{id:"today",label:"Today",group:"Navigate",shortcut:"⌘1"},{id:"campaigns",label:"Campaigns",group:"Navigate",shortcut:"⌘2"},{id:"calendar",label:"Calendar",group:"Navigate",shortcut:"⌘3"},{id:"deck",label:"Insert section reveal",group:"Presentation",shortcut:"↵"}];
export function AdvancedWorkbench(){
 const [commandOpen,setCommandOpen]=useState(false),[message,setMessage]=useState("P1/P2 demos use local state. No external actions are executed.");
 const [views,setViews]=useState<SavedView[]>([{id:"today",name:"My priorities",description:"Assigned to me"},{id:"due",name:"Needs approval",description:"Review pipeline"}]);
 const [active,setActive]=useState("today"),[notices,setNotices]=useState<Notice[]>([
   {id:"a",text:"Approval requested on new creative route",read:false,category:"Campaign",time:"10:45"},
   {id:"b",text:"Project milestone updated",read:false,category:"Task",time:"Yesterday"},
   {id:"c",text:"Performance report generated",read:true,category:"Analytics",time:"Friday"}
 ]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setCommandOpen(x=>!x)}};document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)},[]);
 return <div className="pcl-advanced-workbench">
  <div className="pcl-eyebrow">P1 + P2 / PRODUCTIVITY AND EXPRESSION</div><h1>Precision,<br/><em>without the noise.</em></h1><p>Command search, saved views, notifications and advanced visuals. Expensive effects remain optional.</p>
  <button className="pcl-command-launch" onClick={()=>setCommandOpen(true)}>⌘ K &nbsp; Open command palette</button>
  <CommandPalette open={commandOpen} commands={EXAMPLE_COMMANDS.map(c=>({...c,onSelect:()=>setMessage("Selected "+c.label)}))} onClose={()=>setCommandOpen(false)}/>
  <div className="pcl-advanced-grid">
   <div><h2>Command palette & saved filters</h2><SavedViews views={views} activeId={active} onSelect={setActive}
       onSave={name=>setViews(prev=>[...prev,{id:"view-"+prev.length,name}])} onRemove={id=>setViews(prev=>prev.filter(v=>v.id!==id))}/></div>
   <div><h2>Notification center</h2><NotificationCenter notifications={notices} onMarkRead={id=>setNotices(prev=>prev.map(n=>n.id===id?{...n,read:true}:n))}
       onOpen={id=>setMessage("Open notification "+id)}/></div>
   <div><h2>Animated backgrounds</h2><div className="pcl-advanced-visual"><AnimatedBackground kind="threads"/><span>Threads / lightweight SVG</span></div></div>
   <div><h2>Perspective stack</h2><PerspectiveCards items={[{id:"a",title:"Go Beyond",description:"A direction worth building."},{id:"b",title:"Next Chapter",description:"Made to be adaptable."}]}/></div>
   <div><h2>Cohort heatmap</h2><CohortHeatmap rows={[{name:"Jan",values:[100,74,58,47,40]},{name:"Feb",values:[100,78,61,49,null]},{name:"Mar",values:[100,81,69,null,null]}]}/></div>
   <div><h2>Conversion funnel</h2><FunnelChart steps={[{name:"Reach",value:240000},{name:"Click",value:28000},{name:"Sign up",value:9000},{name:"Convert",value:4300}]}/></div>
   <div><h2>Budget waterfall</h2><BudgetWaterfall items={[{label:"Base",value:100},{label:"Media",value:30},{label:"Savings",value:-12},{label:"Events",value:18}]}/></div>
   <div><h2>Particle backdrop</h2><div className="pcl-advanced-visual pcl-advanced-visual--dark"><AnimatedBackground kind="particles" count={28}/><span>Particles / CSS-only</span></div></div>
  </div><p role="status" className="pcl-advanced-status">{message}</p>
 </div>;
}
