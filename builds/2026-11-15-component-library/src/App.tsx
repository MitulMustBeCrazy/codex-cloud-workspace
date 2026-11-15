import { useMemo, useState } from "react";
import { P0Showcase } from "./lib/p0/P0Showcase";
import { HTMLDeckGallery } from "./lib/p0/HTMLDeckGallery";
import { BrandailyWorkbench } from "./lib/workflows/BrandailyWorkbench";
import { PresentationWorkbench } from "./lib/presentation/PresentationWorkbench";
import { AdvancedWorkbench } from "./lib/advanced/AdvancedWorkbench";
import "./lib/workflows/brandaily.css";
import "./lib/presentation/presentation.css";
import "./lib/advanced/advanced.css";
import "./lib/p0/gallery.css";
import "./lib/quality/contrast.css";
import { items, visualStyles, blueprints } from "./catalog";
import type { LibraryItem, VisualStyle, Blueprint } from "./catalog";
import { ActivityTimeline, ChapterOpener, HeadlineReveal, MediaLightbox, MetricCard, PeriodSwitcher, ProgressMeter, StatusPill, SurfaceCard, TaskQueue } from "./components";

type Tab = "Components" | "Visual styles" | "Deck blueprints" | "P0 showcase" | "HTML deck gallery" | "Brandaily P0" | "Presentation P0" | "P1 + P2 Lab";
const tabs: Tab[] = ["Components", "Visual styles", "Deck blueprints", "P0 showcase", "HTML deck gallery", "Brandaily P0", "Presentation P0", "P1 + P2 Lab"];
const areas = ["All", "Core", "Brandaily", "Data", "Presentation", "Motion", "Media"];

function Preview({ item }: { item: LibraryItem }) {
  switch (item.id) {
    case "surface": return <SurfaceCard className="card-example"><b>Campaign summary</b><p>Reusable, density-aware content container.</p><span className="muted micro">12px radius · subtle border</span></SurfaceCard>;
    case "status": return <div className="preview-inline"><StatusPill label="On track" tone="success"/><StatusPill label="In review" tone="warning"/><StatusPill label="Draft"/></div>;
    case "metric": return <MetricCard title="Campaign reach" value="2.48M" change="+18.6%" context="vs previous period"/>;
    case "progress": return <div className="preview-progress"><ProgressMeter label="Campaign completion" value={72}/><ProgressMeter label="Asset approvals" value={43}/></div>;
    case "tasks": return <TaskQueue/>;
    case "period": return <PeriodSwitcher/>;
    case "activity": return <ActivityTimeline/>;
    case "chapter": return <ChapterOpener/>;
    case "reveal": return <HeadlineReveal/>;
    case "lightbox": return <MediaLightbox/>;
    default: return <div className="planned-preview"><span>Specified, not implemented</span><small>Available in the upcoming component backlog.</small></div>;
  }
}

function ItemCard({ item }: { item: LibraryItem }) {
  return <article className="component-card">
    <div className="component-top"><span className="eyebrow">{item.area}</span><span className={"state-label " + (item.status === "demo" ? "ready" : "")}>{item.status === "demo" ? "Demo" : "Planned"}</span></div>
    <div className="component-demo"><Preview item={item}/></div>
    <div className="component-details"><h3>{item.name}</h3><p>{item.description}</p><div className="micro muted">For {item.usage} · {item.controls.join(" / ")}</div></div>
  </article>;
}

function StyleCard({ style, active, onSelect }: { style: VisualStyle; active: boolean; onSelect: () => void }) {
  return <button type="button" className={"style-card " + (active ? "selected" : "")} onClick={onSelect} aria-pressed={active}>
    <div className="style-art" style={{ background: style.background, color: style.foreground }}>
      <div className="style-small" style={{ color: style.accent }}>01 / THE IDEA</div>
      <div className="style-title">Beyond<br/><em>what's next.</em></div>
      <div className="style-rule" style={{ backgroundColor: style.accent }}/>
      <div className="style-bottom">A NEW PERSPECTIVE <span>2027</span></div>
    </div>
    <div className="style-info"><h3>{style.name}</h3><p>{style.description}</p><small>{style.bestFor}</small></div>
  </button>;
}

function BlueprintCard({ blueprint }: { blueprint: Blueprint }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="blueprint-card">
    <div className="blueprint-summary"><div><div className="eyebrow">{blueprint.slides.length} narrative beats</div><h3>{blueprint.title}</h3><p>{blueprint.purpose}</p></div><button type="button" onClick={() => setExpanded(x => !x)} aria-expanded={expanded} className="outline-button">{expanded ? "Hide structure" : "View structure"}</button></div>
    <div className="slide-strip" aria-hidden="true">{blueprint.slides.slice(0,6).map((s,i) => <div className="slide-thumb" key={s}><span>{String(i+1).padStart(2,"0")}</span><strong>{s}</strong></div>)}</div>
    {expanded && <ol className="slide-list">{blueprint.slides.map(s => <li key={s}>{s}</li>)}</ol>}
    <div className="blueprint-tags">{blueprint.styles.map(s => <span key={s}>{visualStyles.find(v => v.id === s)?.name ?? s}</span>)}</div>
  </article>;
}

function App() {
  const [tab, setTab] = useState<Tab>("Components");
  const [area, setArea] = useState("All");
  const [query, setQuery] = useState("");
  const [styleId, setStyleId] = useState("editorial");
  const visible = useMemo(() => items.filter(item =>
    (area === "All" || item.area === area) &&
    (item.name.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase()))
  ), [area, query]);
  const chosen = visualStyles.find(s => s.id === styleId) ?? visualStyles[0];

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">CL</span><div><strong>Component Library</strong><small>Personal design system</small></div></div>
      <div className="sidebar-label">LIBRARY</div>
      <nav aria-label="Library sections">{tabs.map((x,i) => <button key={x} type="button" className={"nav-item " + (tab === x ? "active" : "")} onClick={() => setTab(x)}><span className="nav-icon">{["▦","◫","▤","◉","▣","▥","▤","✧"][i]}</span>{x}</button>)}</nav>
      <div className="sidebar-bottom"><span className="side-indicator"/><span>Unpublished source prototype<br/><small>Version 0.1 · Not deployed</small></span></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">Library <span>/</span> {tab}</div><div className="topbar-meta">BUILD 01 <span>·</span> 2026</div></header>
      <div className="page-content">
        {tab === "Components" && <>
          <div className="hero-row"><div><div className="eyebrow">01 / THE FOUNDATION</div><h1>Purpose-built<br/><em>components.</em></h1><p>One reusable language for Brandaily dashboards and presentation storytelling. Build only what earns its place.</p></div><div className="hero-stat"><strong>{items.length}</strong><span>tracked component families</span><small>{items.filter(i => i.status === "demo").length} with interactive demos</small></div></div>
          <div className="toolbar"><input aria-label="Search components" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search components and use cases..." /><div className="category-scroll">{areas.map(x => <button className={area === x ? "active" : ""} key={x} type="button" onClick={() => setArea(x)}>{x}</button>)}</div></div>
          <div className="result-line">{visible.length} matching components <span>Demo components are prototypes, not production certified</span></div>
          <div className="component-grid">{visible.map(item => <ItemCard key={item.id} item={item}/>)}</div>
        </>}
        {tab === "Visual styles" && <>
          <div className="eyebrow">02 / THE EXPRESSION</div><h1>Choose a visual<br/><em>direction.</em></h1><p className="page-intro">Visual styles define type, palette, spacing and motion. They do not dictate slide content or component behavior.</p>
          <div className="styles-grid">{visualStyles.map(s => <StyleCard key={s.id} style={s} active={s.id === styleId} onSelect={() => setStyleId(s.id)}/>)}</div>
          <div className="selection-note"><b>Selected: {chosen.name}</b><span>{chosen.treatment}. Best suited to {chosen.bestFor.toLowerCase()}.</span></div>
        </>}
        {tab === "Deck blueprints" && <>
          <div className="eyebrow">03 / THE NARRATIVE</div><h1>Structure before<br/><em>decoration.</em></h1><p className="page-intro">Narrative blueprints are adaptable, slide-by-slide structures. Apply any compatible visual style and assemble the slides from your component library.</p>
          <div className="blueprints">{blueprints.map(b => <BlueprintCard key={b.id} blueprint={b}/>)}</div>
        </>}
        {tab === "P0 showcase" && <P0Showcase/>}
        {tab === "HTML deck gallery" && <HTMLDeckGallery/>}
        {tab === "Brandaily P0" && <BrandailyWorkbench/>}
        {tab === "Presentation P0" && <PresentationWorkbench/>}
        {tab === "P1 + P2 Lab" && <AdvancedWorkbench/>}
        <footer className="footer"><span>Built for reuse, not volume.</span><span>Component Library / v0.1</span></footer>
      </div>
    </main>
  </div>;
}

export default App;
