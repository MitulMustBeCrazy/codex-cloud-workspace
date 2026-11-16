import{r as i,j as $}from"./index-CKnOrWSY.js";import{t as D,c as N}from"./bundle-mjs-DYhUdvxb.js";import{u as O}from"./use-reduced-motion-BYv_QYnj.js";import{u as U}from"./use-in-view-BumOiNT2.js";import"./index-CXHAiFMv.js";import"./resolve-elements-BlN7eZ-A.js";function z(...h){return D(N(h))}const H=["#ff2d55","#ff9f0a","#ffe08a","#7a5cff"],V="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}",G=`precision highp float;
uniform vec2 r;uniform float t;uniform float now;uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform vec3 bg;
uniform float uw;uniform float us;uniform float uwarp;uniform float ui;uniform float ug;uniform float uecho;uniform vec3 m;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+1.),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vn(p);p*=2.02;a*=.5;}return v;}
// Four colours across the band, edge to edge.
vec3 pal(float k){k=clamp(k,0.,1.)*3.;return k<1.?mix(c0,c1,k):k<2.?mix(c1,c2,k-1.):mix(c2,c3,k-2.);}
// The centre line of a band, and the light around it.
vec3 band(vec2 p,float seed,float amp,float tilt,float lift){
  // A slow, smooth warp: low frequency sines, so the band sweeps rather than wobbles.
  vec2 q=p;
  q+=uwarp*.35*vec2(sin(p.y*1.1+t*.23+seed),sin(p.x*.9-t*.19+seed*1.7));
  q+=uwarp*.08*vec2(sin(p.y*2.1-t*.31+seed*2.),sin(p.x*1.7+t*.27));
  float ph=q.x*.95+t*.32+seed;
  float y=lift+tilt*q.x+amp*sin(ph)+amp*.28*sin(q.x*1.7-t*.21+seed*3.);
  float slope=tilt+amp*.95*cos(ph)+amp*.28*1.7*cos(q.x*1.7-t*.21+seed*3.);
  // The pointer pulls the line toward it.
  float pull=m.z*exp(-pow((q.x-m.x)/.6,2.));
  y=mix(y,m.y,pull*.5);
  float d=(q.y-y)/sqrt(1.+slope*slope);
  float w=.052*uw;
  vec3 col=vec3(0.);
  // A spectral fan: each colour is its own soft band, offset across the line.
  for(int i=0;i<7;i++){
    float k=float(i)/6.;
    float o=(k-.5)*.2*us*(.6+.4*uw);
    float g=exp(-pow((d-o)/(w*(1.+abs(k-.5)*1.4)),2.));
    col+=pal(k)*g*.5;
  }
  col+=vec3(1.,.98,.95)*exp(-pow(d/(w*.6),2.))*.85;
  col+=pal(.5+.35*sign(d))*exp(-pow(d/(w*5.),2.))*.1;
  return col;
}
void main(){
  vec2 uv=gl_FragCoord.xy/r;float a=r.x/r.y;
  vec2 p=vec2((uv.x-.5)*a,uv.y-.5)*2.;
  vec3 col=band(p,0.,.55,-.32,-.05);
  // A fainter echo, off toward a corner.
  if(uecho>.5)col+=band(p,2.6,.35,.4,-1.15)*.38;
  col*=ui;
  col=1.-exp(-col*1.25);
  vec3 o=bg+col*(1.-bg*.6);
  o+=(hash(gl_FragCoord.xy+fract(now*7.3)*vec2(91.,37.))-.5)*.06*ug;
  float v=smoothstep(1.6,.35,length(vec2((uv.x-.5)*a,uv.y-.5)));
  o=mix(bg,o,.55+.45*v);
  gl_FragColor=vec4(o,1.);
}`,m=h=>{const s=h.replace("#",""),f=parseInt(s.length===3?s.replace(/./g,"$&$&"):s,16);return[(f>>16&255)/255,(f>>8&255)/255,(f&255)/255]},Z=i.forwardRef(function({colors:s=H,background:f="#050507",speed:y=2.7,width:R=2.75,spread:A=1.45,warp:F=1,intensity:k=2.25,grain:E=1.75,echo:q=!0,interactive:M=!0,children:I,className:j},B){const T=!!O(),g=i.useRef(null);i.useImperativeHandle(B,()=>g.current);const P=i.useRef(null),_=U(g,{amount:.05}),u=i.useRef({colors:s,background:f,speed:y,width:R,spread:A,warp:F,intensity:k,grain:E,echo:q,interactive:M});u.current={colors:s,background:f,speed:y,width:R,spread:A,warp:F,intensity:k,grain:E,echo:q,interactive:M};const l=i.useRef({x:0,y:0,tx:0,ty:0,on:0,target:0}),d=i.useRef({t:4,now:0});return i.useEffect(()=>{const n=P.current;if(!n)return;const t=n.getContext("webgl",{antialias:!1,premultipliedAlpha:!1});if(!t){const e=u.current.colors;n.style.background=`radial-gradient(60% 30% at 40% 55%, #fff8, transparent 60%), linear-gradient(160deg, transparent 30%, ${e[0]} 42%, ${e[1]} 48%, ${e[2]} 54%, ${e[3]} 60%, transparent 72%), ${u.current.background}`;return}const v=(e,c)=>{const o=t.createShader(e);return t.shaderSource(o,c),t.compileShader(o),o},p=t.createProgram();t.attachShader(p,v(t.VERTEX_SHADER,V)),t.attachShader(p,v(t.FRAGMENT_SHADER,G)),t.linkProgram(p),t.useProgram(p),t.bindBuffer(t.ARRAY_BUFFER,t.createBuffer()),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW);const S=t.getAttribLocation(p,"p");t.enableVertexAttribArray(S),t.vertexAttribPointer(S,2,t.FLOAT,!1,0,0);const r=Object.fromEntries(["r","t","now","c0","c1","c2","c3","bg","uw","us","uwarp","ui","ug","uecho","m"].map(e=>[e,t.getUniformLocation(p,e)])),w=()=>{const e=Math.min(1.25,window.devicePixelRatio||1),c=Math.max(1,Math.round(n.clientWidth*e)),o=Math.max(1,Math.round(n.clientHeight*e));(n.width!==c||n.height!==o)&&(n.width=c,n.height=o);const a=u.current,b=l.current;t.viewport(0,0,c,o),t.uniform2f(r.r,c,o),t.uniform1f(r.t,d.current.t),t.uniform1f(r.now,d.current.now),t.uniform3fv(r.c0,m(a.colors[0])),t.uniform3fv(r.c1,m(a.colors[1])),t.uniform3fv(r.c2,m(a.colors[2])),t.uniform3fv(r.c3,m(a.colors[3])),t.uniform3fv(r.bg,m(a.background)),t.uniform1f(r.uw,a.width),t.uniform1f(r.us,a.spread),t.uniform1f(r.uwarp,a.warp),t.uniform1f(r.ui,a.intensity),t.uniform1f(r.ug,a.grain),t.uniform1f(r.uecho,a.echo?1:0),t.uniform3f(r.m,b.x,b.y,b.on),t.drawArrays(t.TRIANGLE_STRIP,0,4)};if(T||!_){w();const e=new ResizeObserver(w);return e.observe(n),()=>e.disconnect()}let x=0,C=performance.now();const L=e=>{if(x=requestAnimationFrame(L),document.hidden)return;const c=Math.min(.05,(e-C)/1e3);C=e,d.current.now+=c,d.current.t+=c*u.current.speed;const o=l.current,a=1-Math.exp(-c*3);o.x+=(o.tx-o.x)*a,o.y+=(o.ty-o.y)*a,o.on+=((u.current.interactive?o.target:0)-o.on)*(1-Math.exp(-c*2.5)),w()};return x=requestAnimationFrame(L),()=>cancelAnimationFrame(x)},[T,_]),$.jsxs("div",{ref:g,onPointerMove:n=>{const t=n.currentTarget.getBoundingClientRect(),v=t.width/t.height;l.current.tx=((n.clientX-t.left)/t.width-.5)*v*2,l.current.ty=(.5-(n.clientY-t.top)/t.height)*2,l.current.target=1},onPointerLeave:()=>{l.current.target=0},className:z("relative isolate min-h-[320px] w-full overflow-hidden",j),style:{backgroundColor:f},children:[$.jsx("canvas",{ref:P,"aria-hidden":!0,className:"absolute inset-0 -z-10 size-full"}),I]})});export{Z as PrismFlow};
