import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ChangeEvent } from "react";
import { calendarDay, calendarWeek, calendarMonth, calendarQuarter, calendarYear, shiftCalendar, findMentionQuery, insertMention, reconcileMentionReferences, filterAndSort, summarizeCampaigns } from "../system/workflow-logic.js";
import { TodayTaskCard } from "../p0/TodayTaskCard";
import type { TodayTask, PromotionTarget } from "../p0/TodayTaskCard";
import { P0MetricCard } from "../p0/MetricCard";

export type MentionEntity = { id: string; label: string; type: "person"|"task"|"campaign" };
export type MentionReference = MentionEntity & {start:number;end:number;display:string};
export type MentionDocument = { text: string; references: MentionReference[] };
const kindForPrefix: Record<string, MentionEntity["type"]> = { "@":"person", "#":"task", "$":"campaign" };
const prefixForKind: Record<MentionEntity["type"],string> = {person:"@",task:"#",campaign:"$"};

/** Controlled text composer. Suggestions stay next to the typing surface; IDs remain in structured output. */
export function InlineMentionsComposer({value,onChange,entities,placeholder="Write an update. Use @ people, # tasks or $ campaigns."}:{
  value:MentionDocument;onChange:(next:MentionDocument)=>void;entities:MentionEntity[];placeholder?:string;
}){
  const input=useRef<HTMLTextAreaElement|null>(null);
  const [caret,setCaret]=useState(0),[activeIndex,setActiveIndex]=useState(0);
  const [dismissed,setDismissed]=useState(false);
  const range=useMemo(()=>findMentionQuery(value.text,caret),[value.text,caret]);
  const suggestions=useMemo(()=>range&&!dismissed?entities.filter(e=>
    e.type===kindForPrefix[range.prefix] && e.label.toLocaleLowerCase().includes(range.query.toLocaleLowerCase())).slice(0,6):[],[entities,range,dismissed]);
  const update=(ev:ChangeEvent<HTMLTextAreaElement>)=>{
    const text=ev.currentTarget.value;
    // Retain only exact spans. A consumer may persist references and reconcile server-side.
    const references=reconcileMentionReferences(value.text,text,value.references);
    onChange({text,references});
    setCaret(ev.currentTarget.selectionStart);setActiveIndex(0);setDismissed(false);
  };
  const select=(entity:MentionEntity)=>{
    if(!range)return;
    const selection=insertMention(value.text,range,entity);
    const references=reconcileMentionReferences(value.text,selection.text,value.references)
      .concat(selection.reference).sort((a,b)=>a.start-b.start);
    onChange({text:selection.text,references});
    setCaret(selection.cursor);setDismissed(true);
    window.requestAnimationFrame(()=>{input.current?.focus();input.current?.setSelectionRange(selection.cursor,selection.cursor)});
  };
  const key=(event:ReactKeyboardEvent<HTMLTextAreaElement>)=>{
    if(!suggestions.length)return;
    if(event.key==="ArrowDown"){event.preventDefault();setActiveIndex(x=>(x+1)%suggestions.length)}
    if(event.key==="ArrowUp"){event.preventDefault();setActiveIndex(x=>(x+suggestions.length-1)%suggestions.length)}
    if(event.key==="Enter"||event.key==="Tab"){event.preventDefault();select(suggestions[activeIndex]||suggestions[0])}
    if(event.key==="Escape"){event.preventDefault();setDismissed(true)}
  };
  return <div className="pcl-composer">
    <label className="pcl-field-label" htmlFor="pcl-mention-editor">Team update</label>
    <textarea id="pcl-mention-editor" ref={input} value={value.text} onChange={update}
      onKeyDown={key} onClick={ev=>{setCaret(ev.currentTarget.selectionStart);setDismissed(false)}}
      onKeyUp={ev=>{setCaret(ev.currentTarget.selectionStart)}} placeholder={placeholder} rows={3}
      aria-autocomplete="list" aria-expanded={suggestions.length>0} aria-controls="pcl-mention-suggestions" />
    {suggestions.length>0&&<div className="pcl-mention-suggestions" id="pcl-mention-suggestions" role="listbox" aria-label="Inline mentions">
      {suggestions.map((entity,index)=><button type="button" role="option" aria-selected={activeIndex===index} key={entity.type+entity.id}
        onMouseDown={ev=>ev.preventDefault()} onClick={()=>select(entity)}>
        <span className="pcl-mention-sigil">{prefixForKind[entity.type]}</span><span>{entity.label}</span><small>{entity.type}</small>
      </button>)}
    </div>}
    <div className="pcl-composer__footer"><span>@ People&nbsp;&nbsp; # Tasks&nbsp;&nbsp; $ Campaigns</span><span>{value.references.length} linked</span></div>
  </div>;
}

export type CalendarPeriod="Year"|"Quarter"|"Month"|"Week"|"Day";
export type CalendarEvent={id:string;title:string;date:string;endDate?:string;category?:string;time?:string};
const PERIODS:CalendarPeriod[]=["Year","Quarter","Month","Week","Day"];
const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const fmt=(date:string,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat("en-GB",{timeZone:"UTC",...options}).format(new Date(date+"T12:00:00Z"));
export function CalendarPanel({view="Month",date="2026-11-15",events=[],onViewChange,onDateChange,onEventClick}:{
  view?:CalendarPeriod;date?:string;events?:CalendarEvent[];onViewChange?:(v:CalendarPeriod)=>void;
  onDateChange?:(d:string)=>void;onEventClick?:(id:string)=>void;
}){
  const lookup=(day:string)=>events.filter(e=>e.date<=day&&(!e.endDate||e.endDate>=day));
  const cells=view==="Year"?calendarYear(date):view==="Quarter"?calendarQuarter(date):view==="Month"?calendarMonth(date):view==="Week"?calendarWeek(date):calendarDay(date);
  const title=view==="Year"?date.slice(0,4):view==="Quarter"?"Q"+(Math.floor((Number(date.slice(5,7))-1)/3)+1)+" "+date.slice(0,4):fmt(date,{month:"long",year:"numeric"});
  return <section className="pcl-calendar" aria-label={"Calendar - "+view+" view"}>
    <header className="pcl-panel-header">
      <div><span className="pcl-eyebrow">TEAM PLANNING</span><h2>Calendar</h2></div>
      <div className="pcl-calendar__nav"><button aria-label="Previous period" onClick={()=>onDateChange?.(shiftCalendar(date,view,-1))}>‹</button><strong>{title}</strong><button aria-label="Next period" onClick={()=>onDateChange?.(shiftCalendar(date,view,1))}>›</button></div>
    </header>
    <div className="pcl-segments" aria-label="Calendar period">
      {PERIODS.map(period=><button type="button" key={period} aria-pressed={period===view} className={period===view?"is-active":""} onClick={()=>onViewChange?.(period)}>{period}</button>)}
    </div>
    {view==="Year"||view==="Quarter" ? <div className="pcl-calendar__months">
      {cells.map((month:any)=>{const prefix=month.date.slice(0,7);const monthly=events.filter(e=>e.date.slice(0,7)===prefix);
        return <button key={prefix} type="button" onClick={()=>onDateChange?.(month.date)} className="pcl-calendar__month">
          <span>{fmt(month.date,{month:"short"})}</span><b>{monthly.length} event{monthly.length===1?"":"s"}</b><span>{monthly.slice(0,2).map(e=>e.title).join(" · ")||"No events"}</span>
        </button>})}
    </div> : <div className={"pcl-calendar__days pcl-calendar__days--"+view.toLowerCase()}>
      {view!=="Day"&&days.map(day=><div key={day} className="pcl-calendar__weekday">{day}</div>)}
      {cells.map((cell:any)=>{const items=lookup(cell.date);return <div key={cell.date} className={"pcl-calendar__cell"+(!cell.withinPeriod?" is-outside":"")}>
        <button type="button" className="pcl-calendar__day" onClick={()=>onDateChange?.(cell.date)} aria-label={"View "+cell.date}>{cell.day}</button>
        {items.slice(0,view==="Month"?2:8).map(e=><button type="button" key={e.id} className="pcl-calendar__event" title={e.title}
          onClick={()=>onEventClick?.(e.id)}>{e.time&&<span>{e.time} </span>}{e.title}</button>)}
        {items.length>(view==="Month"?2:8)&&<small>+{items.length-(view==="Month"?2:8)} more</small>}
      </div>})}
    </div>}
    <div className="pcl-calendar__foot">{events.length} event{events.length===1?"":"s"} in the current dataset · Times supplied by the parent application</div>
  </section>;
}

export type Campaign={id:string;title:string;stage:string;blocked:boolean;owner?:string;due?:string};
export function CampaignApprovalPanel({campaigns=[],onApprove,onBlock,onOpen}:{
 campaigns?:Campaign[];onApprove?:(id:string)=>void;onBlock?:(id:string)=>void;onOpen?:(id:string)=>void;
}){
  const summary=summarizeCampaigns(campaigns);
  return <section className="pcl-workflow" aria-label="Campaign status and approvals">
    <header className="pcl-panel-header"><div><span className="pcl-eyebrow">CAMPAIGNS</span><h2>Approval queue</h2></div><span className="pcl-count">{summary.pendingApprovals} need review</span></header>
    <div className="pcl-workflow__summary"><span>{summary.total} total</span><span>{summary.blocked} blocked</span><span>{summary.published} live/complete</span></div>
    {campaigns.length===0?<p className="pcl-muted">No campaigns to review.</p>:
      <ul className="pcl-workflow__list">{campaigns.map(c=><li key={c.id}>
        <div><button className="pcl-linklike" onClick={()=>onOpen?.(c.id)}>{c.title}</button><div className="pcl-workflow__meta">{c.owner&&<span>{c.owner}</span>}{c.due&&<span>{c.due}</span>}<span>{c.stage}</span></div></div>
        <div className="pcl-workflow__actions">{c.blocked&&<span className="pcl-label pcl-label--danger">Blocked</span>}
        {c.stage==="Review"&&!c.blocked&&onApprove&&<button onClick={()=>onApprove(c.id)}>Approve</button>}
        {!c.blocked&&onBlock&&<button className="pcl-button-quiet" onClick={()=>onBlock(c.id)}>Flag</button>}
        </div></li>)}</ul>}
  </section>;
}
export type CommunicationThread={id:string;name:string;preview:string;unread?:number;time?:string;category?:string};
export function CommunicationPanel({threads=[],selectedId,onSelect,onCompose}:{
 threads?:CommunicationThread[];selectedId?:string;onSelect?:(id:string)=>void;onCompose?:()=>void;
}){
 return <section className="pcl-comms" aria-label="Communication channels">
  <header className="pcl-panel-header"><div><span className="pcl-eyebrow">CONVERSATIONS</span><h2>Channels</h2></div>{onCompose&&<button onClick={onCompose}>New message</button>}</header>
  {threads.length===0?<p className="pcl-muted">No conversations.</p>:<ul>
    {threads.map(t=><li key={t.id}><button className={selectedId===t.id?"is-selected":""} onClick={()=>onSelect?.(t.id)} aria-current={selectedId===t.id?"true":undefined}>
      <span className="pcl-comms__avatar">{t.name.charAt(0).toUpperCase()}</span>
      <span className="pcl-comms__body"><strong>{t.name}</strong><small>{t.preview}</small></span>
      <span className="pcl-comms__meta">{t.time&&<small>{t.time}</small>}{!!t.unread&&<em aria-label={t.unread+" unread"}>{t.unread} unread</em>}</span>
    </button></li>)}</ul>}
 </section>;
}

export type DataColumn={key:string;label:string;numeric?:boolean};
export function DataExplorer({rows=[],columns=[],searchable=true}:{
 rows?:Record<string,string|number|null>[];columns?:DataColumn[];searchable?:boolean;
}){
 const [query,setQuery]=useState(""),[sort,setSort]=useState<{key:string;direction:"asc"|"desc"}|undefined>(undefined);
 const visible=filterAndSort(rows,{query,filters:{},sort}) as Record<string,string|number|null>[];
 return <section className="pcl-explorer" aria-label="Performance data explorer">
  <header className="pcl-panel-header"><div><span className="pcl-eyebrow">MEASUREMENT</span><h2>Data explorer</h2></div><span className="pcl-count">{visible.length} rows</span></header>
  {searchable&&<label className="pcl-search-label">Filter performance data<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search rows…" /></label>}
  <div className="pcl-explorer__scroll"><table><thead><tr>{columns.map(col=><th key={col.key} scope="col" aria-sort={sort?.key===col.key?(sort.direction==="asc"?"ascending":"descending"):"none"}>
    <button onClick={()=>setSort(s=>({key:col.key,direction:s?.key===col.key&&s.direction==="asc"?"desc":"asc"}))}>{col.label}{sort?.key===col.key?(sort.direction==="asc"?" ↑":" ↓"):""}</button>
   </th>)}</tr></thead><tbody>{visible.map((row,i)=><tr key={i}>{columns.map(col=><td key={col.key} className={col.numeric?"is-number":""}>{row[col.key]??"–"}</td>)}</tr>)}
   {!visible.length&&<tr><td colSpan={Math.max(1,columns.length)}>No matching data</td></tr>}</tbody></table></div>
 </section>;
}
const DEMO_TASKS:TodayTask[]=[
 {id:"review",title:"Review campaign launch creative",priority:"high",category:"Campaign",completed:false,dueLabel:"Today"},
 {id:"brief",title:"Prepare the management performance update",priority:"medium",completed:false,category:"Reporting"},
 {id:"plan",title:"Approve the digital channel roadmap",priority:"low",completed:true,category:"Digital"}
];
const DEMO_EVENTS:CalendarEvent[]=[
 {id:"launch",title:"Launch review",date:"2026-11-15",time:"10:30",category:"Campaign"},
 {id:"team",title:"Creative sprint",date:"2026-11-17",time:"11:00",category:"Team"},
 {id:"budget",title:"Planning meeting",date:"2026-11-23",time:"14:00",category:"Strategy"}
];
const DEMO_CAMPAIGNS:Campaign[]=[
 {id:"campaign-a",title:"App relaunch campaign",stage:"Review",blocked:false,owner:"Creative Team",due:"Today"},
 {id:"campaign-b",title:"Partnership activation",stage:"Draft",blocked:true,owner:"Brand Team"},
 {id:"campaign-c",title:"Always-on digital",stage:"Published",blocked:false,owner:"Digital"}
];
const DEMO_THREADS:CommunicationThread[]=[
 {id:"brand",name:"Brand & Content",preview:"Creative routes are ready to review",unread:3,time:"11:20"},
 {id:"digital",name:"Digital Media",preview:"Latest media performance is available",unread:1,time:"09:45"},
 {id:"events",name:"Events & Activation",preview:"Venue confirmations are pending",time:"Yesterday"}
];
const DEMO_ENTITIES:MentionEntity[]=[
 {id:"person-1",label:"Mariam",type:"person"},{id:"person-2",label:"Digital Team",type:"person"},
 {id:"task-1",label:"Approve creative",type:"task"},{id:"campaign-1",label:"App relaunch",type:"campaign"}
];
export function BrandailyWorkbench(){
 const [view,setView]=useState<CalendarPeriod>("Month"),[date,setDate]=useState("2026-11-15");
 const [tasks,setTasks]=useState(DEMO_TASKS),[campaigns,setCampaigns]=useState(DEMO_CAMPAIGNS);
 const [thread,setThread]=useState("brand"),[doc,setDoc]=useState<MentionDocument>({text:"",references:[]});
 const [action,setAction]=useState("All data here is illustrative and local to this demo.");
 const promote=(id:string,target:PromotionTarget)=>setAction("Promotion event: "+id+" → "+target+". Backend integration is intentionally separate.");
 return <div className="pcl-workbench">
   <div className="pcl-workbench__intro"><span className="pcl-eyebrow">BRANDAILY / REUSABLE P0 BLOCKS</span><h1>Less noise.<br/><em>More clarity.</em></h1><p>Calendar, task delegation, communication, approvals, analytics and inline mentions, all demonstrated with local fixture data.</p></div>
   <div className="pcl-workbench__metrics">
     <P0MetricCard label="Campaign reach" value={2480000} period="Last 30 days" trend={{value:18.6,direction:"up",positiveWhen:"up"}}/>
     <P0MetricCard label="Cost per qualified action" value={415.5} prefix="৳" trend={{value:8.2,direction:"down",positiveWhen:"down"}}/>
     <P0MetricCard label="Approved assets" value={87} suffix="%" trend={{value:2,direction:"up",positiveWhen:"up"}}/>
   </div>
   <div className="pcl-workbench__grid">
     <TodayTaskCard tasks={tasks} onToggle={(id,completed)=>setTasks(prev=>prev.map(t=>t.id===id?{...t,completed}:t))}
       onAssign={id=>setAction("Open assignee picker for "+id)} onPromote={promote}
       onAdd={()=>setTasks(prev=>[...prev,{id:"task-"+prev.length,title:"New priority item",priority:"low" as const,completed:false}])}/>
     <CampaignApprovalPanel campaigns={campaigns} onApprove={id=>setCampaigns(prev=>prev.map(c=>c.id===id?{...c,stage:"Approved"}:c))}
       onBlock={id=>setCampaigns(prev=>prev.map(c=>c.id===id?{...c,blocked:true}:c))} onOpen={id=>setAction("Open campaign "+id)}/>
   </div>
   <CalendarPanel view={view} date={date} events={DEMO_EVENTS} onViewChange={setView} onDateChange={setDate} onEventClick={id=>setAction("Open event "+id)}/>
   <div className="pcl-workbench__grid">
     <CommunicationPanel threads={DEMO_THREADS} selectedId={thread} onSelect={setThread} onCompose={()=>setAction("Open new message composer")}/>
     <div className="pcl-workbench__composer"><h2>Inline references</h2><p>Type @, # or $ inside the field and select an entity. A structured ID is retained for backend integration.</p>
       <InlineMentionsComposer value={doc} onChange={setDoc} entities={DEMO_ENTITIES}/>
       {!!doc.references.length&&<p className="pcl-workbench__refs">Linked: {doc.references.map(r=>r.type+": "+r.label).join(", ")}</p>}
     </div>
   </div>
   <DataExplorer rows={[{channel:"Search",reach:145000,conversions:5200},{channel:"Social",reach:890000,conversions:8600},{channel:"Owned",reach:213000,conversions:4400},{channel:"Partner",reach:74000,conversions:1900}]}
     columns={[{key:"channel",label:"Channel"},{key:"reach",label:"Reach",numeric:true},{key:"conversions",label:"Conversions",numeric:true}]}/>
   <p className="pcl-workbench__status" role="status" aria-live="polite">{action}</p>
 </div>;
}
