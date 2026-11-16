import { useState } from "react";
import { TodayTaskCard } from "./TodayTaskCard";
import type { TodayTask, PromotionTarget } from "./TodayTaskCard";
import { P0MetricCard, P0ProgressMeter } from "./MetricCard";
import "./p0.css";

const starter: TodayTask[] = [
  { id: "creative", title: "Review three campaign creative territories", completed: false, priority: "high", dueLabel: "Today", category: "Campaign" },
  { id: "calendar", title: "Confirm calendar and communication changes", completed: false, priority: "medium", assignee: { id: "colleague", label: "Design team" }, category: "Portal" },
  { id: "brief", title: "Finalize the weekly brand performance brief", completed: true, category: "Reporting" },
];
export function P0Showcase() {
  const [tasks, setTasks] = useState(starter);
  const [action, setAction] = useState("Try the task controls. They emit callbacks instead of saving to any backend.");
  const update = (id: string, completed: boolean) =>
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed } : task));
  const assign = (id: string) => setAction("Assign requested for: " + id + ". Consumer app owns the people picker.");
  const promote = (id: string, target: PromotionTarget) =>
    setAction("Promote requested: " + id + " → " + target + ". Consumer app owns persistence.");
  return <section aria-label="P0 components showcase" style={{display:"grid",gap:26}}>
    <div className="eyebrow">04 / P0 SOURCE IMPLEMENTATION</div>
    <h1>Working foundations.</h1>
    <p className="page-intro">Reusable, externally controlled components for Brandaily and performance decks. Interactions below use local demonstration data only.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:18,alignItems:"start"}}>
      <TodayTaskCard tasks={tasks} onToggle={update} onAssign={assign} onPromote={promote}
        onAdd={() => setTasks((current) => [...current,{id:"new-"+current.length,title:"New priority task",completed:false,priority:"low" as const}])}/>
      <div style={{display:"grid",gap:18}}>
        <P0MetricCard label="Campaign reach" value={2480000} trend={{value:18.6,direction:"up",positiveWhen:"up",comparison:"vs previous period"}} period="Last 30 days" note="Demo values" />
        <P0MetricCard label="Cost per acquisition" value={415.5} prefix="BDT " trend={{value:8.2,direction:"down",positiveWhen:"down",comparison:"vs previous period"}} />
        <div style={{padding:22,borderRadius:16,background:"#fff",border:"1px solid #e4e9e9"}}>
          <P0ProgressMeter label="Creative approvals" value={7} max={10}/>
          <P0ProgressMeter label="Campaign readiness" value={92} max={100}/>
        </div>
      </div>
    </div>
    <p role="status" aria-live="polite" style={{fontSize:12,color:"#6b7a82"}}>{action}</p>
    <div className="selection-note"><b>Implementation status: source draft</b>
      <span>These modules are ready for build/interaction testing, not yet production certified. No Brandaily data is accessed.</span></div>
  </section>;
}
