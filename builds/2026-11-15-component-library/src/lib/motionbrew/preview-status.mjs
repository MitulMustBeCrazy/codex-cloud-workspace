export const READINESS = Object.freeze(["source-only","fixture-ready","demo-verified","consumer-verified"]);
const LABELS = Object.freeze({
 "source-only":"Source imported",
 "fixture-ready":"Preview configured",
 "demo-verified":"Preview tested",
 "consumer-verified":"Consumer verified"
});
export const readinessLabel = (status) => LABELS[status] || "Unknown status";
export const readinessRank = (status) => READINESS.indexOf(status);
export const getPreviewRecord = (catalog,slug) => catalog?.components?.find(entry=>entry.slug===slug)??null;

/** Verify assertions against vendor provenance without equating source import to demo readiness. */
export function validatePreviewCatalog(catalog,manifest){
 const errors=[];
 if(!catalog||!Array.isArray(catalog.components))return {valid:false,errors:["Catalog components array required"]};
 const origins=Array.isArray(manifest?.components)?manifest.components:[];
 const expected=new Set(origins.map(x=>x.slug));
 if(catalog.components.length!==origins.length)errors.push(`Expected ${origins.length} components, received ${catalog.components.length}`);
 const seen=new Set();
 for(const entry of catalog.components){
  if(!entry||typeof entry.slug!=="string"){errors.push("Item slug must be string");continue;}
  if(seen.has(entry.slug))errors.push("Duplicate slug: "+entry.slug);
  seen.add(entry.slug);
  if(!expected.has(entry.slug))errors.push("Unknown provider slug: "+entry.slug);
  if(!READINESS.includes(entry.status))errors.push("Unknown readiness status for "+entry.slug);
  if(entry.status==="source-only"&&entry.fixture!==null)errors.push("Source-only cannot claim configured fixture for "+entry.slug);
  if(entry.status!=="source-only"&&(typeof entry.fixture!=="string"||!entry.fixture.trim()))errors.push("Ready status requires named fixture: "+entry.slug);
  if(["demo-verified","consumer-verified"].includes(entry.status)&&!(typeof entry.evidence==="string"&&/^https:\/\//.test(entry.evidence)))errors.push("Verified status requires evidence URL: "+entry.slug);
  if(!Array.isArray(entry.needs)||entry.needs.some(x=>typeof x!=="string"))errors.push("Invalid needs for "+entry.slug);
  if(!Array.isArray(entry.useCases)||entry.useCases.some(x=>typeof x!=="string"))errors.push("Invalid useCases for "+entry.slug);
  if(!["low","medium","high","unknown"].includes(entry.motionCost))errors.push("Invalid motion cost for "+entry.slug);
  if(typeof entry.notes!=="string"||!entry.notes.trim())errors.push("Missing setup note for "+entry.slug);
 }
 for(const slug of expected)if(!seen.has(slug))errors.push("Missing provider slug: "+slug);
 return {valid:errors.length===0,errors};
}
