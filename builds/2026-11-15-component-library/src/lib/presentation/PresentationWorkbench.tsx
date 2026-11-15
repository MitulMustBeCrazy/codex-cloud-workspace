import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { layoutWords, motionSequence } from "../system/visual-logic.js";
import { mediaCoordinator } from "../system/media-coordinator.js";
import "./presentation.css";

export type MotionProfile="quiet"|"living"|"impact"|"media";
export function SlideFrame({label,children,theme="editorial",className=""}:{
 label:string;children:ReactNode;theme?:"editorial"|"cinematic"|"institutional"|"data"|"human"|"bold";className?:string;
}){
 return <section className={"pcl-slide-frame pcl-slide-frame--"+theme+" "+className} aria-label={label}>
   <div className="pcl-slide-frame__safe">{children}</div>
 </section>;
}
export function RevealGroup({children,preset="living",active=true,reduced=false}:{
 children:ReactNode[];preset?:MotionProfile;active?:boolean;reduced?:boolean;
}){
 const sequence=motionSequence(children.length,preset,reduced);
 return <>{children.map((node,i)=><div key={i} className={"pcl-reveal"+(active?" is-visible":"")} style={{
   transitionDelay:sequence[i].delay+"ms",transitionDuration:sequence[i].duration+"ms",
   ["--pcl-reveal-y" as string]:sequence[i].distance+"px"
 }}>{node}</div>)}</>;
}
export type MediaKind="image"|"video"|"audio";
export function MediaStage({kind,src,poster,overlaySrc,alt="",label="Media preview",allowFullscreen=true}:{
 kind:MediaKind;src:string;poster?:string;overlaySrc?:string;alt?:string;label?:string;allowFullscreen?:boolean;
}){
 const [expanded,setExpanded]=useState(false),[playing,setPlaying]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(0);
 const mediaRef=useRef<HTMLMediaElement|null>(null),triggerRef=useRef<HTMLButtonElement|null>(null);
 const id=useRef("media-"+Math.random().toString(36).slice(2));
 const video=kind==="video",audio=kind==="audio";
 useEffect(()=>{
   const unregister=mediaCoordinator.register(id.current,()=>{mediaRef.current?.pause();setPlaying(false)});
   return ()=>{unregister();mediaRef.current?.pause()};
 },[]);
 useEffect(()=>{if(!expanded)return;
   const key=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();close()}};
   document.addEventListener("keydown",key);
   const old=document.body.style.overflow;document.body.style.overflow="hidden";
   return ()=>{document.removeEventListener("keydown",key);document.body.style.overflow=old};
 },[expanded]);
 const pause=()=>{mediaRef.current?.pause();mediaCoordinator.deactivate(id.current);setPlaying(false)};
 const close=()=>{pause();setExpanded(false);window.requestAnimationFrame(()=>triggerRef.current?.focus())};
 const play=async()=>{
   if(kind==="image"){setExpanded(true);return}
   if(!mediaRef.current)return;
   mediaCoordinator.activate(id.current);
   try{
     await mediaRef.current.play();
     setPlaying(true);
     if(video&&allowFullscreen)setExpanded(true);
   }catch{setPlaying(false);mediaCoordinator.deactivate(id.current)}
 };
 const toggle=()=>playing?close():play();
 const seek=(value:number)=>{if(mediaRef.current&&Number.isFinite(duration)&&duration>0){
   mediaRef.current.currentTime=Math.max(0,Math.min(duration,value));setTime(mediaRef.current.currentTime);
 }};
 const timeline=(kind==="audio"||expanded&&kind==="video")&&<div className="pcl-media__timeline" onClick={event=>event.stopPropagation()}>
    <label htmlFor={"pcl-media-seek-"+id.current}>Seek {label}</label>
    <input id={"pcl-media-seek-"+id.current} type="range" min={0} max={Number.isFinite(duration)&&duration>0?duration:1} step=".1"
      value={Math.min(time,Number.isFinite(duration)&&duration>0?duration:1)} onChange={event=>seek(Number(event.target.value))} aria-label={"Seek "+label}/>
    <small>{Math.floor(time/60)}:{String(Math.floor(time%60)).padStart(2,"0")} / {Number.isFinite(duration)?Math.floor(duration/60):0}:{String(Number.isFinite(duration)?Math.floor(duration%60):0).padStart(2,"0")}</small>
   </div>;
 const controls=(audio||video)&&<div className="pcl-media__controls">
   <button type="button" aria-label={playing?"Pause "+label:"Play "+label} onClick={event=>{event.stopPropagation();toggle()}}>{playing?"Pause":"Play"}</button>
   {timeline}
 </div>;
 const media=(video?<video ref={element=>{mediaRef.current=element}} src={src} poster={poster} preload="metadata"
   playsInline controls={expanded} onPlay={()=>{mediaCoordinator.activate(id.current);setPlaying(true)}} onPause={()=>{setPlaying(false);mediaCoordinator.deactivate(id.current)}}
   onEnded={()=>{setPlaying(false);mediaCoordinator.deactivate(id.current);setExpanded(false)}}
   onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onLoadedMetadata={e=>setDuration(e.currentTarget.duration)}/>
   :audio?<audio ref={element=>{mediaRef.current=element}} src={src} preload="metadata" onTimeUpdate={e=>setTime(e.currentTarget.currentTime)}
     onLoadedMetadata={e=>setDuration(e.currentTarget.duration)} onPlay={()=>{mediaCoordinator.activate(id.current);setPlaying(true)}}
     onPause={()=>{setPlaying(false);mediaCoordinator.deactivate(id.current)}} onEnded={()=>{setPlaying(false);mediaCoordinator.deactivate(id.current)}}/>
   :<img src={src} alt={alt}/>);
 const artwork=(audio&&overlaySrc)?<img src={overlaySrc} alt={alt||"Audio cover artwork"} className="pcl-media__artwork"/>:null;
 return <div className={"pcl-media"+(expanded?" is-expanded":"")} data-kind={kind}>
   {kind==="image"?<button ref={triggerRef} className="pcl-media__image" onClick={()=>setExpanded(true)} aria-label={"Expand "+label}>
     <img src={src} alt={alt}/><span>Expand image</span></button>:<div className="pcl-media__surface">{artwork}{media}{controls}</div>}
   {expanded&&<div className="pcl-media__backdrop" role="presentation" onClick={close}>
     <div className="pcl-media__dialog" role="dialog" aria-modal="true" aria-label={label} onClick={event=>event.stopPropagation()}>
       <button className="pcl-media__close" type="button" onClick={close} aria-label="Close media">Close</button>
       {kind==="image"?<img src={src} alt={alt}/>:<div className="pcl-media__expanded-media" onClick={close} role="presentation">
         <video ref={element=>{if(expanded)mediaRef.current=element}} src={src} poster={poster} autoPlay playsInline
          onPlay={()=>{mediaCoordinator.activate(id.current);setPlaying(true)}} onPause={()=>{setPlaying(false);mediaCoordinator.deactivate(id.current)}}
          onEnded={close} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onLoadedMetadata={e=>setDuration(e.currentTarget.duration)}
         />
         <span>Tap to pause and return</span>
       </div>}
       {video&&timeline}
     </div>
   </div>}
 </div>;
}

export function WordCloud({words,width=1000,height=560}:{
 words:{text:string;weight:number}[];width?:number;height?:number;
}){
 const layout=useMemo(()=>layoutWords(words,width,height),[words,width,height]);
 return <svg className="pcl-word-cloud" role="img" aria-label={"Word cloud: "+words.map(w=>w.text).join(", ")}
   viewBox={"0 0 "+width+" "+height} xmlns="http://www.w3.org/2000/svg">
   {layout.map((word:any,index:number)=><text key={index} x={word.x+word.width/2} y={word.y+word.height*.76}
     textAnchor="middle" fontSize={word.fontSize} fontWeight={index<3?720:530}
     fill={["#253945","#a57854","#4e7885","#64787c"][index%4]}>{word.text}</text>)}
 </svg>;
}
export type ComparisonSide={title:string;text:string;value?:string};
export function ComparisonStory({left,right,label="Strategic comparison"}:{
 left:ComparisonSide;right:ComparisonSide;label?:string;
}){
 return <section className="pcl-comparison" aria-label={label}>
   {[left,right].map((side,i)=><article key={i} className={i===1?"is-highlight":""}><span>{i===0?"01 / CURRENT STATE":"02 / FUTURE STATE"}</span>
     <h3>{side.title}</h3>{side.value&&<strong>{side.value}</strong>}<p>{side.text}</p>
   </article>)}
 </section>;
}
export type RoadmapItem={id:string;phase:string;title:string;detail:string;status?:"planned"|"ongoing"|"done"};
export function RoadmapTimeline({items=[]}:{items?:RoadmapItem[]}){
 return <ol className="pcl-roadmap" aria-label="Strategy roadmap">{items.map((item,i)=><li key={item.id}>
   <span>{item.phase}</span><div className="pcl-roadmap__dot" aria-hidden="true"/>
   <h3>{item.title}</h3><p>{item.detail}</p><small>{item.status||"planned"}</small>
 </li>)}</ol>;
}
export function KineticHeadline({lines,preset="impact",active=true}:{
 lines:string[];preset?:MotionProfile;active?:boolean;
}){
 return <div className={"pcl-kinetic pcl-kinetic--"+preset} aria-label={lines.join(" ")}>
   {lines.map((line,i)=><span key={i} className={active?"is-active":""} style={{transitionDelay:(motionSequence(lines.length,preset)[i].delay)+"ms"}}>{line}</span>)}
 </div>;
}
const DEMO_WORDS=[{text:"MODERN",weight:9},{text:"POWER",weight:8},{text:"TRUST",weight:7},{text:"INNOVATIVE",weight:6},{text:"DIGITAL",weight:5},{text:"PREMIUM",weight:4},{text:"POSSIBILITY",weight:3}];
export function PresentationWorkbench(){
 const [motion,setMotion]=useState<MotionProfile>("living"),[shown,setShown]=useState(true);
 return <div className="pcl-presentation-workbench">
   <div className="pcl-eyebrow">PRESENTATION / REUSABLE BUILDING BLOCKS</div><h1>Built for<br/><em>the moment.</em></h1>
   <p>Slide-safe story layouts, motion profiles, evidence visuals, media choreography and collision-aware word clouds.</p>
   <div className="pcl-presentation-grid">
    <div><h2>Motion system</h2><div className="pcl-presentation-controls">
      {(["quiet","living","impact","media"] as MotionProfile[]).map(profile=><button key={profile} aria-pressed={motion===profile} onClick={()=>{setMotion(profile);setShown(false);window.setTimeout(()=>setShown(true),30)}}>{profile}</button>)}
     </div>
     <SlideFrame label="Animated chapter opener" theme="cinematic">
       <span className="pcl-slide-eyebrow">01 / NEXT CHAPTER</span><KineticHeadline lines={["Power the", "next move."]} preset={motion} active={shown}/>
       <span className="pcl-slide-caption">Original preview / interchangeable type and motion profiles</span>
     </SlideFrame>
    </div>
    <div><h2>Word cloud</h2><SlideFrame label="Collision-aware word cloud" theme="editorial"><span className="pcl-slide-eyebrow">AUDIENCE PERCEPTION</span>
      <WordCloud words={DEMO_WORDS}/></SlideFrame></div>
    <div><h2>Comparison</h2><ComparisonStory left={{title:"Fragmented",text:"Disconnected actions and decisions."}}
      right={{title:"Connected",text:"One coordinated experience, purposefully designed."}}/></div>
    <div><h2>Roadmap</h2><RoadmapTimeline items={[
      {id:"a",phase:"Q1",title:"Build",detail:"Establish a reusable design foundation.",status:"done"},
      {id:"b",phase:"Q2",title:"Integrate",detail:"Validate in one product and one HTML deck.",status:"ongoing"},
      {id:"c",phase:"Q3",title:"Scale",detail:"Expand to more workflows and styles.",status:"planned"}
     ]}/></div>
    <div><h2>Media stage</h2><p className="pcl-caption">Image lightbox with keyboard closing. Native video/audio playback requires a media source; the component can coordinate one active item at a time.</p>
     <MediaStage kind="image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='800' height='450' fill='%23253945'/%3E%3Ccircle cx='560' cy='200' r='155' fill='%239e7959'/%3E%3Cpath d='M0 350L800 250' stroke='%23d1c7b9' stroke-width='6'/%3E%3C/svg%3E" alt="Abstract geometry in navy and bronze" label="Abstract campaign artwork"/></div>
   </div>
 </div>;
}
