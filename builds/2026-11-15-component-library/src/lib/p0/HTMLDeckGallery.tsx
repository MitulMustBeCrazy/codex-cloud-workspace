const decks = [
  { id: "editorial", title: "Editorial Narrative", category: "Strategy / brand", description: "An original, magazine-like storytelling direction with chapter reveals, split narratives and quiet pacing.", surface: "#f5f3ed", text: "#202422", accent: "#986249", headline: "Beyond the obvious.", source: "Editorial" },
  { id: "board-report", title: "Board Report", category: "MD / leadership", description: "Executive storytelling with staged KPI disclosure, animated comparison bars and a concluding decision.", surface: "#15242d", text: "#e9eef0", accent: "#dfb779", headline: "From progress to possibility.", source: "Board Report" },
  { id: "kpi-report", title: "KPI Evidence", category: "Performance reporting", description: "Clear metrics, evidence panels and progressive chart explanations without losing analytical readability.", surface: "#f6f8f8", text: "#22353d", accent: "#3b7382", headline: "Measure what moves us.", source: "KPI Report" },
];
export function HTMLDeckGallery() {
  const base = "./";
  return <section aria-label="Original HTML deck templates">
    <div className="eyebrow">05 / HTML PRESENTATION TEMPLATES</div>
    <h1 style={{marginTop:18}}>Storytelling,<br/><em>ready to adapt.</em></h1>
    <p className="page-intro">Three runnable five-slide HTML examples, informed by Pitch gallery narrative structures and built with original code. Each has step-by-step reveals and adjustable auto pacing.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:18,marginTop:28}}>
      {decks.map(deck => <article key={deck.id} style={{background:"#fff",border:"1px solid #e0e6e8",borderRadius:15,padding:9,minWidth:0}}>
        <div style={{background:deck.surface,color:deck.text,aspectRatio:"16/9",padding:"8%",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <span style={{fontSize:10,letterSpacing:".15em",color:deck.accent}}>ORIGINAL HTML / 2026</span>
          <strong style={{fontFamily:deck.id==="board-report"?"Georgia,serif":"inherit",fontSize:"clamp(18px,2.3vw,39px)",letterSpacing:"-.06em",lineHeight:1.05,maxWidth:"90%"}}>{deck.headline}</strong>
          <span style={{width:50,height:3,background:deck.accent}} />
        </div>
        <div style={{padding:"15px 12px"}}>
          <div className="eyebrow">{deck.category}</div><h3 style={{margin:"8px 0",fontSize:17}}>{deck.title}</h3>
          <p style={{fontSize:12,color:"#667880",lineHeight:1.65,margin:"0 0 13px"}}>{deck.description}</p>
          <a href={base+"decks/pitch-inspired/"+deck.id+".html"} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"11px 13px",borderRadius:8,background:"#223740",color:"#fff",textDecoration:"none",fontSize:12}}>Open HTML deck</a>
          <p style={{fontSize:10,color:"#8b959b",marginTop:13}}>Structure reference: Pitch {deck.source}. Visual treatment is original.</p>
        </div>
      </article>)}
    </div>
    <p style={{marginTop:24,color:"#71818a",fontSize:12}}>Controls inside each deck: Space or Right to reveal; Left to go back; Home/End to jump; Auto pace starts/stops timed playback. Source values are illustrative.</p>
  </section>;
}
