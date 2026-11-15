export type UseArea = "Core" | "Brandaily" | "Data" | "Presentation" | "Motion" | "Media";
export type LibraryStatus = "demo" | "planned";

export type LibraryItem = {
  id: string;
  name: string;
  area: UseArea;
  status: LibraryStatus;
  description: string;
  usage: string;
  controls: string[];
};

export const items: LibraryItem[] = [
  { id: "surface", name: "Surface Card", area: "Core", status: "demo", description: "A neutral container with consistent radius, border and density.", usage: "Both", controls: ["density", "radius", "tone"] },
  { id: "status", name: "Status Pill", area: "Core", status: "demo", description: "Readable status states without relying on color alone.", usage: "Brandaily", controls: ["tone", "label"] },
  { id: "metric", name: "KPI / Metric Card", area: "Data", status: "demo", description: "A metric, time context and trend in one focused card.", usage: "Both", controls: ["value", "trend", "period"] },
  { id: "progress", name: "Progress Meter", area: "Data", status: "demo", description: "Compact target tracking with an accessible numeric label.", usage: "Both", controls: ["value", "max", "label"] },
  { id: "tasks", name: "Today Task Queue", area: "Brandaily", status: "demo", description: "A prominent, checkable task list for the Today page.", usage: "Brandaily", controls: ["items", "onToggle", "priority"] },
  { id: "period", name: "Calendar Period Switcher", area: "Brandaily", status: "demo", description: "Year, quarter, month, week and day selection control.", usage: "Brandaily", controls: ["value", "onChange"] },
  { id: "activity", name: "Activity Timeline", area: "Brandaily", status: "demo", description: "Compact collaboration and campaign event feed.", usage: "Brandaily", controls: ["events", "grouping"] },
  { id: "chapter", name: "Chapter Opener", area: "Presentation", status: "demo", description: "An oversized statement, restrained hierarchy and chapter marker.", usage: "Decks", controls: ["title", "eyebrow", "theme"] },
  { id: "reveal", name: "Headline Reveal", area: "Motion", status: "demo", description: "Low-distraction entry animation with reduced-motion support.", usage: "Decks", controls: ["text", "duration"] },
  { id: "lightbox", name: "Media Lightbox", area: "Media", status: "demo", description: "Click-to-expand media frame with Escape and backdrop close.", usage: "Both", controls: ["label", "content", "onClose"] },
  { id: "filters", name: "Advanced Filter Bar", area: "Brandaily", status: "planned", description: "Saved views, multiselect filtering, date range and reset.", usage: "Brandaily", controls: ["filters", "presets"] },
  { id: "mentions", name: "Inline Mentions Composer", area: "Brandaily", status: "planned", description: "Native inline @ people, # tasks and $ campaigns references.", usage: "Brandaily", controls: ["suggestions", "entities"] },
  { id: "kanban", name: "Campaign Pipeline", area: "Brandaily", status: "planned", description: "Campaign cards, stages, assignees and visible blockers.", usage: "Brandaily", controls: ["stages", "cards"] },
  { id: "channels", name: "Communication Channel Panel", area: "Brandaily", status: "planned", description: "Channel hub for conversations, updates and notifications.", usage: "Brandaily", controls: ["channels", "threads"] },
  { id: "table", name: "Data Table", area: "Data", status: "planned", description: "Accessible, responsive tabular data with sorting and filters.", usage: "Brandaily", controls: ["columns", "sort", "filters"] },
  { id: "chart", name: "Interactive Chart", area: "Data", status: "planned", description: "Trend and composition visuals with presentation and app variants.", usage: "Both", controls: ["series", "view", "animation"] },
  { id: "bento", name: "Bento Story Grid", area: "Presentation", status: "planned", description: "A flexible editorial narrative grid with media and text slots.", usage: "Decks", controls: ["layout", "items"] },
  { id: "split", name: "Story Split Screen", area: "Presentation", status: "planned", description: "Half text, half visual with synchronized entrance.", usage: "Decks", controls: ["orientation", "asset"] },
  { id: "counter", name: "Count-Up Reveal", area: "Motion", status: "planned", description: "Animated numeric reveal with reduced-motion fallback.", usage: "Both", controls: ["value", "duration"] },
  { id: "player", name: "Unified Media Player", area: "Media", status: "planned", description: "Accessible video and audio playback with seeking and fullscreen.", usage: "Decks", controls: ["src", "poster", "controls"] },
];

export type VisualStyle = {
  id: string; name: string; description: string; background: string; foreground: string;
  accent: string; secondary: string; treatment: string; bestFor: string;
};
export const visualStyles: VisualStyle[] = [
  { id: "editorial", name: "Editorial Minimal", description: "White space, precise grids and mature typography.", background: "#f6f5f1", foreground: "#151718", accent: "#a26045", secondary: "#dedbd4", treatment: "Large serif headlines, understated rules", bestFor: "Board narratives and strategic positioning" },
  { id: "cinematic", name: "Cinematic Dark", description: "Atmospheric, high-contrast storytelling and expressive media.", background: "#101216", foreground: "#f3f1ec", accent: "#e6bd78", secondary: "#333840", treatment: "Full-bleed imagery, low light and impact motion", bestFor: "Sonic identities and brand film launches" },
  { id: "premium", name: "Institutional Premium", description: "Confident and enduring without heavy decoration.", background: "#182734", foreground: "#f5f5ef", accent: "#d5b56e", secondary: "#334858", treatment: "Disciplined typography, considered gold accents", bestFor: "Leadership, banking and high-value proposals" },
  { id: "mono", name: "Bold Monotype", description: "Strong statements, condensed typography and deliberate pace.", background: "#edece6", foreground: "#191919", accent: "#e0523c", secondary: "#c5c3bb", treatment: "Black rules, large headings and punchy contrasts", bestFor: "Campaign concepts and launch pitches" },
  { id: "data", name: "Data First", description: "Presentation of evidence with maximum readability.", background: "#f8fafc", foreground: "#1e293b", accent: "#426aa4", secondary: "#e2e8f0", treatment: "Clean charts, careful numbers and restrained motion", bestFor: "Marketing reviews and business intelligence" },
  { id: "human", name: "Human Narrative", description: "Photography-led, warm and grounded in human stories.", background: "#efe8dc", foreground: "#29251f", accent: "#956a4a", secondary: "#d9c8b5", treatment: "Documentary photography, quotes and warm texture", bestFor: "Brand truths, culture and customer stories" }
];

export type Blueprint = { id: string; title: string; purpose: string; slides: string[]; styles: string[] };
export const blueprints: Blueprint[] = [
  { id: "board", title: "Board & MD Strategy", purpose: "Evidence-led direction, logic and business decisions.", slides: ["Strategic opening", "Where we stand", "What changed", "Human / market truth", "Strategic opportunity", "Central recommendation", "Proof and implications", "Activation roadmap", "Decision / ask", "Appendix"], styles: ["editorial", "premium", "data"] },
  { id: "brand", title: "Brand Campaign Pitch", purpose: "Take an audience from tension to creative conviction.", slides: ["Provocation", "Cultural context", "Consumer truth", "Brand truth", "Creative territory", "Big idea reveal", "Hero film", "Channel system", "Launch rhythm", "Next steps"], styles: ["cinematic", "mono", "human"] },
  { id: "sonic", title: "Sonic & AV Reveal", purpose: "Build anticipation around an audiovisual identity.", slides: ["Opening beat", "Why sound", "Creative principle", "Artist / contributor profiles", "Sonic first listen", "Audiovisual reveal", "Applications", "Campaign integration", "Launch experience"], styles: ["cinematic", "premium"] },
  { id: "product", title: "Product Relaunch", purpose: "Make product benefits and customer journeys memorable.", slides: ["Product promise", "Customer friction", "What changed", "Experience walkthrough", "Feature proof", "Demo video", "Differentiation", "Go-to-market", "Next move"], styles: ["editorial", "data", "mono"] },
  { id: "performance", title: "Marketing Performance", purpose: "Make outcomes, drivers and actions easy to understand.", slides: ["Executive summary", "KPI scorecard", "Target vs actual", "Channel comparison", "Customer response", "Creative learning", "Risks", "Recommendations", "Decision points"], styles: ["data", "editorial"] }
];
