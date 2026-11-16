import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import manifest from "./manifest.json";
import previewCatalog from "./preview-catalog.json";
import "./motionbrew-gallery.css";

type MotionEntry = (typeof manifest.components)[number];
const modules = import.meta.glob("./components/*.tsx");
const featured = new Set(["blur-text", "flip-words", "magnetic-button", "depth-carousel", "liquid-tabs", "gradient-text", "activity-grid", "calendar-agenda", "prism-carousel", "sidebar-nav", "voice-prompt", "goal-gauge"]);

function demoProps(item: MotionEntry): Record<string, unknown> {
  const sample = "Better experiences, built with intent.";
  const props: Record<string, Record<string, unknown>> = {
    "blur-text": { text: sample, trigger: "mount", className: "text-3xl font-semibold" },
    "gradient-text": { text: "A new perspective" },
    "shimmer-text": { text: "A new perspective" },
    "highlight-text": { text: "A new perspective" },
    "annotation-text": { text: "A new perspective" },
    "binary-text": { text: "A new perspective" },
    "backspace-text": { words: ["Think", "Make", "Improve"] },
    "flip-words": { words: ["Explore", "Create", "Beyond"] },
    "rotating-text": { texts: ["Explore", "Create", "Beyond"] },
    "wave-text": { text: "The next chapter" },
    "magnetic-button": { children: "Explore possibility" },

  };
  return props[item.slug] || {};
}

class PreviewBoundary extends React.Component<{ children: ReactNode; keyId: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(oldProps: { keyId: string }) { if (oldProps.keyId !== this.props.keyId && this.state.failed) this.setState({ failed: false }); }
  render() {
    if (this.state.failed) return <div className="mb-preview-unavailable"><strong>Custom setup required</strong><p>This component needs specific props or assets. Its complete source is imported. Use the provider documentation and source file to configure it.</p></div>;
    return this.props.children;
  }
}

function LivePreview({ item }: { item: MotionEntry }) {
  const LazyComponent = useMemo(() => lazy(async () => {
    const load = modules[`./components/${item.slug}.tsx`];
    if (!load) throw new Error("Missing MotionBrew component: " + item.slug);
    const raw = await load() as Record<string, unknown>;
    const Component = raw[item.name] || raw.default;
    if (typeof Component !== "function" && typeof Component !== "object") throw new Error("Missing export: " + item.name);
    return { default: Component as ComponentType<Record<string, unknown>> };
  }), [item.name, item.slug]);

  return <PreviewBoundary keyId={item.slug} key={item.slug}>
    <Suspense fallback={<div className="mb-preview-loading" role="status">Loading animated preview…</div>}>
      <LazyComponent {...demoProps(item)} />
    </Suspense>
  </PreviewBoundary>;
}

const categories = ["All", ...new Set(manifest.components.map(c => c.category))];
const engines = ["All", ...new Set(manifest.components.map(c => c.engine))];
const readinessLabels:Record<string,string>={ "source-only":"Source imported","fixture-ready":"Preview configured","demo-verified":"Preview tested","consumer-verified":"Consumer verified" };
const readinessStates=["All","source-only","fixture-ready","demo-verified","consumer-verified"];
const bySlug=new Map(previewCatalog.components.map(item=>[item.slug,item]));

export function MotionBrewGallery({initialQuery=""}:{initialQuery?:string}) {
  const [query, setQuery] = useState(initialQuery);
  useEffect(()=>{if(initialQuery)setQuery(initialQuery)},[initialQuery]);
  const [category, setCategory] = useState("All");
  const [engine, setEngine] = useState("All");
  const [readiness,setReadiness]=useState("All");
  const [selected, setSelected] = useState<string|null>(null);
  const [enabled, setEnabled] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [copied, setCopied] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const inspectorRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const openInspector = (slug: string, trigger: HTMLButtonElement) => { returnFocusRef.current = trigger; setSelected(slug); };

  const matches = useMemo(() => manifest.components.filter(item => {
    const haystack = [item.name,item.slug,item.description,item.trigger,item.engine,item.category].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase().trim())
      && (category === "All" || item.category === category)
      && (engine === "All" || item.engine === engine)
      && (readiness === "All" || bySlug.get(item.slug)?.status === readiness)
      && (!featuredOnly || featured.has(item.slug));
  }), [query,category,engine,featuredOnly,readiness]);

  const chosen = manifest.components.find(item => item.slug === selected);
  const chosenReadiness=selected?bySlug.get(selected):null;
  useEffect(() => {
    if (!selected) return;
    const dialog = inspectorRef.current;
    dialog?.focus({preventScroll:true});
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelected(null);
        setEnabled(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const controls = [...dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter(element => element.getClientRects().length > 0);
      if (!controls.length) { event.preventDefault(); dialog.focus(); return; }
      const first = controls[0];
      const last = controls[controls.length-1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || current === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || current === dialog)) {
        event.preventDefault();
        first.focus();
      } else if (current && !dialog.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      returnFocusRef.current?.focus({preventScroll:true});
    };
  }, [selected]);
  useEffect(() => {setEnabled(false);},[selected]);

  const copy = async (value:string, label:string) => {
    try { await navigator.clipboard.writeText(value);setCopied(label+" copied"); }
    catch { setCopied("Copy manually: "+value); }
  };
  return <section className="mb-library" aria-label="MotionBrew component library">
    <div className="mb-hero">
      <div><span className="mb-kicker">MOTIONBREW / COMPLETE COLLECTION</span>
        <h1>Movement with<br/><em>intention.</em></h1>
        <p>All 100 source components from MotionBrew, imported into an independent library collection. Discover microinteractions, data visualizations, gestures and presentation effects.</p>
      </div>
      <div className="mb-hero-count"><strong>100</strong><span>source components</span><small>React · Motion · GSAP · Three.js</small></div>
    </div>
    <div className="mb-toolbar">
      <label className="mb-search">Search components<input type="search" value={query} placeholder="Try blur text, navigation, 3D, calendar…" onChange={e=>setQuery(e.target.value)}/></label>
      <label>Animation engine<select value={engine} onChange={e=>setEngine(e.target.value)}>{engines.map(value=><option key={value}>{value}</option>)}</select></label>
      <label>Preview readiness<select aria-label="Preview readiness" value={readiness} onChange={e=>setReadiness(e.target.value)}>{readinessStates.map(value=><option value={value} key={value}>{value==="All"?"All readiness levels":readinessLabels[value]}</option>)}</select></label>
      <button type="button" aria-pressed={featuredOnly} onClick={()=>setFeaturedOnly(v=>!v)}>{featuredOnly?"Featured only":"Show featured"}</button>
    </div>
    <div className="mb-category-tabs" aria-label="Motion categories">{categories.map(cat=><button type="button" key={cat} aria-pressed={category===cat} onClick={()=>setCategory(cat)}>{cat}</button>)}</div>
    <div className="mb-results"><span>{matches.length} components</span><span>Full source imported · activate previews individually to conserve performance</span></div>
    <div className="mb-card-grid">
      {matches.map(item=><article className="mb-component-card" key={item.slug}>
        <button className="mb-component-card__main" type="button" onClick={event=>openInspector(item.slug,event.currentTarget)}>
          <div className="mb-card-art"><span>{item.category}</span><strong>{item.name.replace(/([a-z])([A-Z])/g,"$1 $2")}</strong><i>{item.engine}</i></div>
          <div className="mb-card-info"><span className="mb-component-card__status" data-readiness={bySlug.get(item.slug)?.status||"source-only"}>{readinessLabels[bySlug.get(item.slug)?.status||"source-only"]}</span><span className="mb-trigger">{item.trigger}</span><h3>{item.name}</h3><p>{item.description}</p></div>
        </button>
        <div className="mb-card-bottom"><code>{item.slug}</code><button type="button" onClick={event=>openInspector(item.slug,event.currentTarget)}>Inspect</button></div>
      </article>)}
    </div>
    {matches.length===0&&<p className="mb-empty">No components match the current filters.</p>}
    {chosen&&<div className="mb-inspector-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget){setSelected(null);setEnabled(false)}}}>
      <section ref={inspectorRef} tabIndex={-1} className="mb-inspector" role="dialog" aria-modal="true" aria-label={"Inspect "+chosen.name}>
        <header><div><span className="mb-kicker">{chosen.category} / {chosen.engine}</span><h2>{chosen.name}</h2><p>{chosen.description}</p></div><button type="button" onClick={()=>setSelected(null)} aria-label="Close MotionBrew inspector">Close</button></header>
        <div className="mb-inspector-tags"><span>{chosen.trigger}</span><span>{chosen.engine}</span><span>{chosen.slug}</span><span>{readinessLabels[chosenReadiness?.status||"source-only"]}</span></div>
        <div className="mb-live-stage">
          {enabled?<LivePreview item={chosen}/>:<div className="mb-preview-placeholder"><strong>Interactive stage</strong><p>{chosenReadiness?.status==="source-only"?"Provider source imported; this demo is not independently tested. You may try its default props, but it may need configuration or assets.":"Load a configured preview on demand. Some components require assets or browser support."}</p><button type="button" onClick={()=>setEnabled(true)}>Load live component</button></div>}
        </div>
        <div className="mb-inspector-actions">
          <a href={chosen.documentationUrl} target="_blank" rel="noopener noreferrer">MotionBrew documentation</a>
          <a href={"https://github.com/MitulMustBeCrazy/codex-cloud-workspace/blob/feature/pcl-p0-p2-2026-11-15/builds/2026-11-15-component-library/"+chosen.sourcePath} target="_blank" rel="noopener noreferrer">View imported source</a>
          <button type="button" onClick={()=>copy(chosen.slug,"Component ID")}>Copy ID</button>
          <button type="button" onClick={()=>copy("Use the imported MotionBrew component "+chosen.slug+" ("+chosen.name+") with reduced-motion and responsive support.","Chat prompt")}>Copy chat prompt</button>
          <button type="button" aria-pressed={favorites.has(chosen.slug)} onClick={()=>setFavorites(prev=>{const next=new Set(prev);next.has(chosen.slug)?next.delete(chosen.slug):next.add(chosen.slug);return next})}>{favorites.has(chosen.slug)?"★ Saved":"☆ Save"}</button>
        </div>
        <p className="mb-review-status" role="status">{copied||"Default preview mounted in Chromium. Individual interactions and consumer installation still require their own verification."}</p>
      </section>
    </div>}
  </section>;
}
