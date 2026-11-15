/** Deterministic layout and motion recipes for responsive HTML decks. */
export const motionPresets=Object.freeze({
 quiet:{duration:220,stagger:60,easing:"ease-out",distance:8},
 living:{duration:540,stagger:130,easing:"cubic-bezier(.22,1,.36,1)",distance:22},
 impact:{duration:820,stagger:250,easing:"cubic-bezier(.16,1,.3,1)",distance:40},
 media:{duration:420,stagger:180,easing:"ease-in-out",distance:14}
});
export function motionSequence(count,preset="living",reducedMotion=false){
 const opts=motionPresets[preset]||motionPresets.living;
 return Array.from({length:Math.max(0,count)},(_,i)=>({
    delay:reducedMotion?0:i*opts.stagger,
    duration:reducedMotion?0:opts.duration,
    easing:opts.easing,distance:reducedMotion?0:opts.distance
 }));
}
export function rectsOverlap(a,b,gap=0){
 return a.x < b.x+b.width+gap && a.x+a.width+gap > b.x &&
   a.y < b.y+b.height+gap && a.y+a.height+gap > b.y;
}
export function layoutWords(words,width,height){
 const W=Math.max(0,width),H=Math.max(0,height);
 const ordered=[...words].filter(w=>w&&String(w.text||"").trim())
   .map((w,index)=>({...w,weight:Math.max(1,Number(w.weight)||1),index}))
   .sort((a,b)=>b.weight-a.weight||a.index-b.index);
 const placed=[];
 const maxWeight=Math.max(1,...ordered.map(w=>w.weight));
 for(const [i,item] of ordered.entries()){
    const fontSize=Math.max(12,Math.min(W*.105, H*.18, 17+item.weight/maxWeight*Math.min(W*.064,58)));
    const approxWidth=String(item.text).length*fontSize*.61;
    const approxHeight=fontSize*1.25;
    if(approxWidth>W||approxHeight>H)continue;
    const cx=W/2, cy=H/2;
    let best=null;
    for(let step=0;step<3000;step++){
       const angle=step*2.399963229728653+i*.35;
       const radius=Math.sqrt(step)*Math.min(W,H)*.016;
       const x=Math.round(cx+Math.cos(angle)*radius-approxWidth/2);
       const y=Math.round(cy+Math.sin(angle)*radius-approxHeight/2);
       const rect={text:item.text,weight:item.weight,fontSize,x,y,width:approxWidth,height:approxHeight};
       if(x<0||y<0||x+approxWidth>W||y+approxHeight>H)continue;
       if(!placed.some(other=>rectsOverlap(rect,other,6))){best=rect;break;}
    }
    if(best)placed.push(best);
 }
 return placed;
}
