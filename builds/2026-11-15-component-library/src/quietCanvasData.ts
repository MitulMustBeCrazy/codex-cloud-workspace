import registry from "../registry.json";
import motionManifest from "./lib/motionbrew/manifest.json";
import { deckTemplates } from "./lib/p0/HTMLDeckGallery";
import { visualStyles, blueprints, items as prototypeItems } from "./catalog";

export type Accent = "signature-red" | "oxblood" | "terracotta" | "cobalt";
export type Surface = "soft-focus" | "open-canvas";
export type Theme = "light" | "dark";
export type Appearance = { accent: Accent; surface: Surface; theme: Theme };
export const appearanceDefaults: Appearance = { accent: "signature-red", surface: "soft-focus", theme: "light" };
export const accentOptions: {id:Accent; label:string; hex:string}[] = [
 { id:"signature-red",label:"Signature Red",hex:"#CB3341" },
 { id:"oxblood",label:"Oxblood",hex:"#8F2C43" },
 { id:"terracotta",label:"Terracotta",hex:"#C27358" },
 { id:"cobalt",label:"Cobalt",hex:"#315FAB" },
];

export type SectionId = "overview"|"components"|"motionbrew"|"decks"|"styles"|"blueprints"|"references"|"p0"|"brandaily"|"presentation"|"lab";
export type Section = {id:SectionId;name:string;group:"Discover"|"Collections"|"Studio";description:string};
export const sections:Section[]=[
 {id:"overview",name:"Overview",group:"Discover",description:"Your workspace at a glance"},
 {id:"components",name:"Components",group:"Collections",description:"Browse the source registry"},
 {id:"motionbrew",name:"MotionBrew 100",group:"Collections",description:"Motion and interactive elements"},
 {id:"decks",name:"HTML deck gallery",group:"Collections",description:"Ten editable presentation structures"},
 {id:"references",name:"Reference shelf",group:"Collections",description:"Curated React Bits concepts"},
 {id:"styles",name:"Visual styles",group:"Collections",description:"Six slide design directions"},
 {id:"blueprints",name:"Deck blueprints",group:"Collections",description:"Five narrative frameworks"},
 {id:"p0",name:"P0 showcase",group:"Studio",description:"UI primitive demonstrations"},
 {id:"brandaily",name:"Brandaily P0",group:"Studio",description:"Working marketing workflow UI"},
 {id:"presentation",name:"Presentation P0",group:"Studio",description:"Motion and storytelling stages"},
 {id:"lab",name:"P1 + P2 Lab",group:"Studio",description:"Advanced charts and interactions"},
];
export const sectionForQuery=(query:string|null):SectionId=>sections.find(s=>s.id===query)?.id??"overview";

export const sourceRegistry = registry.items;
export const motionComponents = motionManifest.components;
export const htmlDeckTemplates=deckTemplates;
export const slideStyles=visualStyles;
export const narrativeBlueprints=blueprints;
export const prototypeComponents=prototypeItems;

export type ReactBitsReference={name:string;category:"Text & Reveals"|"Backgrounds & Motion"|"Cards & Layouts"|"Navigation & Inputs"|"Immersive & Spatial";tier:"Open reference"|"Pro reference"};
const ref=(name:string,category:ReactBitsReference["category"],tier:ReactBitsReference["tier"]="Open reference"):ReactBitsReference=>({name,category,tier});
export const reactBitsReferences:ReactBitsReference[]=[
 ref("Count Up","Text & Reveals"),ref("True Focus","Text & Reveals"),ref("Counter","Text & Reveals"),
 ref("Threads","Backgrounds & Motion"),ref("Animated List","Cards & Layouts"),ref("Folder","Cards & Layouts"),
 ref("Beams","Backgrounds & Motion"),ref("Magic Bento","Cards & Layouts"),ref("Scroll Stack","Cards & Layouts"),
 ref("Glass Surface","Cards & Layouts"),ref("Card Nav","Navigation & Inputs"),ref("Logo Loop","Backgrounds & Motion"),
 ref("Gradient Blinds","Backgrounds & Motion"),ref("Shuffle","Text & Reveals"),ref("Laser Flow","Backgrounds & Motion"),
 ref("Reflective Card","Cards & Layouts"),ref("Border Glow","Cards & Layouts"),ref("Side Rays","Backgrounds & Motion"),
 ref("Line Sidebar","Navigation & Inputs"),ref("Option Wheel","Navigation & Inputs"),ref("Web Threads","Backgrounds & Motion"),
 ref("Warp Text","Text & Reveals"),ref("Split Flap Text","Text & Reveals"),ref("Sliced Waves","Backgrounds & Motion"),
 ref("Light Tunnel","Immersive & Spatial"),ref("Gradient Waves","Backgrounds & Motion"),ref("Fold Text","Text & Reveals"),
 ref("Drift Wall","Immersive & Spatial"),ref("Elastic Reel","Cards & Layouts","Pro reference"),
 ref("Depth Carousel","Immersive & Spatial"),ref("Accordion Gallery","Cards & Layouts"),
 ref("Shape Waves","Backgrounds & Motion"),ref("Voice Pill","Navigation & Inputs"),ref("Swipe Row","Navigation & Inputs"),
 ref("Rubber Segment","Navigation & Inputs"),ref("Pulse Heart","Navigation & Inputs"),ref("Jelly Radio","Navigation & Inputs"),
 ref("Flip Card","Cards & Layouts"),ref("Folder Float","Cards & Layouts"),
];

export const materialCounts={
 registry:sourceRegistry.length, motion:motionComponents.length, native:sourceRegistry.filter(x=>!x.name.startsWith("motionbrew-")).length,
 decks:htmlDeckTemplates.length,styles:slideStyles.length,blueprints:narrativeBlueprints.length,
 references:reactBitsReferences.length,prototype:prototypeComponents.length
};
export const sourceRoot="https://github.com/MitulMustBeCrazy/codex-cloud-workspace/tree/feature/pcl-p0-p2-2026-11-15/builds/2026-11-15-component-library";
export const notionTracker="https://app.notion.com/p/419a73a0b5f9810b9170fa023fc6f23b";
export const registryUrl=(id:string)=>"/r/"+encodeURIComponent(id)+".json";
export const deckUrl=(id:string)=>"/decks/pitch-inspired/"+encodeURIComponent(id)+".html";
export const validAppearance=(x:unknown):Appearance=>{
 if(!x||typeof x!=="object")return {...appearanceDefaults};
 const o=x as Partial<Appearance>;
 return {
  accent:accentOptions.some(a=>a.id===o.accent)?o.accent!:"signature-red",
  theme:o.theme==="dark"?"dark":"light",
  surface:o.surface==="open-canvas"?"open-canvas":"soft-focus"
 };
};
