import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export function SurfaceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"surface-card " + className}>{children}</div>;
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" }) {
  return <span className={"status-pill status-" + tone}><span className="status-dot" />{label}</span>;
}

export function MetricCard({ title, value, change, context }: { title: string; value: string; change: string; context: string }) {
  return (
    <SurfaceCard className="metric-card">
      <div className="muted micro">{title}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-foot"><span className="trend">{change}</span><span className="muted">{context}</span></div>
    </SurfaceCard>
  );
}

export function ProgressMeter({ label, value }: { label: string; value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="progress-wrap">
      <div className="progress-head"><strong>{label}</strong><span>{clamped}%</span></div>
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped}>
        <div className="progress-fill" style={{ width: clamped + "%" }} />
      </div>
    </div>
  );
}

const initialTasks = [
  { id: 1, text: "Review campaign creative routes", done: false, tag: "Campaign" },
  { id: 2, text: "Finalize weekly priorities", done: false, tag: "Team" },
  { id: 3, text: "Share management update", done: true, tag: "Reporting" },
];

export function TaskQueue() {
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <SurfaceCard className="task-queue">
      <div className="panel-head"><div><strong>Today</strong><div className="muted micro">Your immediate priorities</div></div><span className="count-chip">{tasks.filter(t => !t.done).length} open</span></div>
      <div className="task-rows">
        {tasks.map(t => (
          <label className={"task-row" + (t.done ? " done" : "")} key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => setTasks(current => current.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} />
            <span className="task-text">{t.text}</span><span className="task-tag">{t.tag}</span>
          </label>
        ))}
      </div>
    </SurfaceCard>
  );
}

const periods = ["Year", "Quarter", "Month", "Week", "Day"] as const;
export function PeriodSwitcher() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("Month");
  return (
    <SurfaceCard className="period-panel">
      <div className="panel-head"><strong>Calendar view</strong><span className="muted micro">November 2026</span></div>
      <div className="segmented" role="group" aria-label="Calendar period">
        {periods.map(p => <button type="button" key={p} onClick={() => setPeriod(p)} aria-pressed={period === p} className={period === p ? "active" : ""}>{p}</button>)}
      </div>
      <div className="period-result"><span>Current view</span><strong>{period}</strong></div>
    </SurfaceCard>
  );
}

export function ActivityTimeline() {
  return (
    <SurfaceCard className="activity-panel">
      <div className="panel-head"><strong>Recent activity</strong><span className="muted micro">Team updates</span></div>
      <div className="activity-item"><span className="activity-node"/><div><b>Creative review</b><p>Feedback added to a campaign route</p><small>Today, 10:35</small></div></div>
      <div className="activity-item"><span className="activity-node"/><div><b>Project updated</b><p>Milestone moved to final review</p><small>Yesterday</small></div></div>
      <div className="activity-item"><span className="activity-node"/><div><b>New task</b><p>Approval requested from team</p><small>Friday</small></div></div>
    </SurfaceCard>
  );
}

export function HeadlineReveal() {
  return <div className="motion-sample"><span className="micro uppercase">A CLEARER WAY FORWARD</span><div className="reveal-heading">Make the next<br/>move count.</div><p>Subtle, purposeful entrance motion.</p></div>;
}

export function ChapterOpener({ background = "#17242c", color = "#f6f5ef", accent = "#e2bf84" }: { background?: string; color?: string; accent?: string }) {
  return <div className="chapter-preview" style={{ backgroundColor: background, color }}>
    <span style={{ color: accent }} className="micro uppercase">CHAPTER 02 / THE OPPORTUNITY</span>
    <div className="chapter-headline">The next move<br/><em>starts here.</em></div>
    <div className="chapter-line" style={{ backgroundColor: accent }} />
    <small>Storytelling component · 16:9 adaptive layout</small>
  </div>;
}

export function MediaLightbox() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="media-preview" aria-label="Expand media sample">
      <span className="media-icon">↗</span><strong>Media canvas</strong><small>Click to expand</small>
    </button>
    {open && <div className="lightbox-backdrop" role="presentation" onClick={() => setOpen(false)}>
      <div className="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded media sample" onClick={e => e.stopPropagation()}>
        <button type="button" className="lightbox-close" onClick={() => setOpen(false)} aria-label="Close media">×</button>
        <div className="lightbox-content"><span className="micro uppercase">MEDIA PREVIEW</span><strong>Fullscreen visual experience</strong><span>Demo content. Replace with project media.</span></div>
      </div>
    </div>}
  </>;
}
