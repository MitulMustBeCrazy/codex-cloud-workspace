import{c as Oe,r as o,j as s,C as $e}from"./index-CKnOrWSY.js";import{t as qe,c as Ye}from"./bundle-mjs-DYhUdvxb.js";import{m as O}from"./react-BO7p234f.js";import{u as Ve}from"./use-reduced-motion-BYv_QYnj.js";import{u as Ee}from"./use-in-view-BumOiNT2.js";import{A as ye}from"./index-CvL255tX.js";import"./single-value-D9gIQyQ9.js";import"./is-svg-element-CbmmBUOb.js";import"./frame-B8r6sQRK.js";import"./index-CXHAiFMv.js";import"./MotionConfigContext-CO7zWqzP.js";import"./use-constant-CCrssuVT.js";import"./index-DEKaqWjb.js";import"./resolve-elements-BlN7eZ-A.js";const Ke=Oe("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);function Je(...f){return qe(Ye(f))}const $=f=>`https://images.unsplash.com/photo-${f}?w=1400&h=780&fit=crop&q=80`,Qe=[{src:$("1490750967868-88aa4486c946"),alt:"Orange poppies against a blue sky",label:"Poppies"},{src:$("1454496522488-7a8e488e8606"),alt:"Snowy mountain peaks under clouds",label:"Snow peaks"},{src:$("1441974231531-c6227db76b6e"),alt:"Sun through a forest",label:"Forest light"},{src:$("1486406146926-c627a92ad1ab"),alt:"Glass towers seen from below",label:"City glass"}],q=.32,Y=28,Ze="attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }",et=`
precision highp float;
uniform vec2 uRes;
uniform vec4 uCard;      // left, top, width, height (canvas px, top down)
uniform float uRadius;
uniform sampler2D uA;    // outgoing picture
uniform sampler2D uB;    // incoming picture
uniform vec2 uAspA;
uniform vec2 uAspB;
uniform float uFold;     // fold line, card px from the left
uniform float uDir;      // 1: the fold travels left to right, the incoming page on its left
uniform float uAmpA;     // lift of the outgoing page
uniform float uAmpB;     // lift of the incoming page
uniform float uFlare;    // full lift, to normalise
uniform float uGlass;
uniform float uFall;     // how far from the fold the lift reaches, px
uniform float uDpr;
uniform float uSideA;    // frost on the outgoing picture, px
uniform float uSideB;    // frost on the incoming picture, px
uniform float uTime;
uniform float uNear;     // share of the frost beside the fold
uniform float uFar;      // share of the frost at the far edge
uniform float uNoise;    // grain in the frost
uniform float uThick;    // how thick the card looks

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// One page at this pixel: its colour and coverage, swollen and blurred by its lift.
vec4 page(sampler2D t, vec2 asp, vec2 local, float amp, float d, float side, float frost) {
  float W = uCard.z;
  float H = uCard.w;
  float k = exp(-d / uFall);
  float s = 1.0 + amp * k;
  vec2 src = vec2(local.x, (local.y - H * 0.5) / s + H * 0.5);
  float sd = sdRound(src - vec2(W, H) * 0.5, vec2(W, H) * 0.5, uRadius);
  // Round the two corners where a lifted page meets the fold: the page as a
  // box running from the fold away from it, cornered by its lift.
  float nl = uFlare > 0.0 ? amp / uFlare : 0.0;
  float rf = 12.0 * uDpr * nl;
  if (rf > 0.5) {
    vec2 c = vec2(uFold + side * W, H * 0.5);
    sd = max(sd, sdRound(src - c, vec2(W, H * 0.5), rf));
  }
  float alpha = clamp(0.5 - sd, 0.0, 1.0);
  vec2 uv = (src / vec2(W, H) - 0.5) * asp + 0.5;
  float n = uFlare > 0.0 ? amp / uFlare : 0.0;
  float lift = uGlass * n * k * 22.0 * uDpr;
  // The frost is a gradient: strongest beside the fold, fading across the card.
  frost *= mix(uNear, uFar, smoothstep(0.0, 1.0, d / W));
  float br = max(lift, frost);
  vec3 col;
  if (br < 0.5) {
    col = texture2D(t, uv).rgb;
  } else {
    // A soft round blur: the centre and two rings of taps, red and blue
    // pulled apart toward and away from the fold for the glass fringe. The
    // rings turn by a random angle per pixel and frame, so a wide frost reads
    // as fine moving grain instead of ghost copies.
    vec2 px = asp / vec2(W, H);
    vec2 ca = vec2(side * lift * 0.55, 0.0) * px;
    float spin = hash(gl_FragCoord.xy + uTime) * 6.2832 * uNoise;
    float jit = 1.0 + (hash(gl_FragCoord.yx * 1.7 + uTime) - 0.5) * 0.5 * uNoise;
    vec3 acc = vec3(texture2D(t, uv + ca).r, texture2D(t, uv).g, texture2D(t, uv - ca).b);
    float wsum = 1.0;
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 0.5236 + (i < 6 ? 0.0 : 0.2618) + spin;
      float rr = (i < 6 ? 0.5 : 1.0) * jit;
      vec2 o = vec2(cos(a), sin(a)) * br * rr * px;
      float w = i < 6 ? 1.0 : 0.7;
      acc.r += texture2D(t, uv + o + ca).r * w;
      acc.g += texture2D(t, uv + o).g * w;
      acc.b += texture2D(t, uv + o - ca).b * w;
      wsum += w;
    }
    col = acc / wsum;
  }
  // Grain over the frost, more as it deepens.
  float g = clamp(frost / (30.0 * uDpr), 0.0, 1.0);
  col += (hash(gl_FragCoord.xy * 0.73 + uTime * 1.3) - 0.5) * 0.06 * g * uNoise;
  // Thickness all round: a slightly dark outer rim and a soft highlight just inside it.
  float inner = -sd;
  col *= 1.0 - 0.16 * uThick * (1.0 - smoothstep(0.0, 1.8 * uDpr, inner));
  float bevel = (inner - 3.0 * uDpr) / (1.2 * uDpr);
  col += 0.06 * uThick * exp(-bevel * bevel);
  // Where the page lifts, its edge shows: a darker band with a bright line inside it.
  float th = 11.0 * uDpr * uThick * n;
  if (th > 0.5) {
    float e = 1.0 - smoothstep(0.0, th, d);
    col = mix(col, col * 0.58, e * 0.85);
    float hl = (d - th * 0.78) / (th * 0.16);
    col += 0.16 * n * uThick * exp(-hl * hl);
  }
  return vec4(col, alpha);
}

void main() {
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 local = fc - uCard.xy;
  float W = uCard.z;
  float H = uCard.w;
  float s = uDir * (local.x - uFold);
  bool outgoing = s > 0.0;
  float d = abs(s);
  float amp = outgoing ? uAmpA : uAmpB;
  float other = outgoing ? uAmpB : uAmpA;
  vec4 c = outgoing
    ? page(uA, uAspA, local, amp, d, uDir, uSideA)
    : page(uB, uAspB, local, amp, d, -uDir, uSideB);
  float n = uFlare > 0.0 ? amp / uFlare : 0.0;
  float no = uFlare > 0.0 ? other / uFlare : 0.0;
  float k = exp(-d / uFall);
  vec3 col = c.rgb;
  // The lifted page: a darker rim right at the fold, and a cool to warm glass sheen.
  col *= 1.0 - 0.3 * n * exp(-d / (uFall * 0.1));
  float y = clamp(local.y / H, -0.4, 1.4);
  vec3 sheen = mix(vec3(0.42, 0.58, 1.0), vec3(1.0, 0.5, 0.86), smoothstep(0.0, 1.0, y));
  col = mix(col, col + sheen * 0.35, 0.32 * n * k * uGlass);
  // The page beside a lifted one lies in its shadow.
  col *= 1.0 - 0.3 * no * exp(-d / (uFall * 0.55));
  // A soft shadow under the resting card.
  float sdb = sdRound(local - vec2(W, H) * 0.5 - vec2(0.0, 16.0 * uDpr), vec2(W, H) * 0.5, uRadius);
  float shadow = 0.2 * (1.0 - smoothstep(-10.0 * uDpr, 34.0 * uDpr, sdb));
  float a = c.a + shadow * (1.0 - c.a);
  vec3 outc = col * c.a;
  gl_FragColor = vec4(outc, a);
}
`,k=(f,l,y)=>{const v=Math.min(1,Math.max(0,(y-f)/(l-f)));return v*v*(3-2*v)},tt=f=>f<.5?4*f*f*f:1-Math.pow(-2*f+2,3)/2,xt=o.forwardRef(function({images:l=Qe,aspect:y=1.5,radius:v=24,flare:V=.34,glass:K=1,blur:J=24,blurNear:Q=.65,blurFar:Z=.12,noise:ee=.3,thickness:te=1,duration:P=1.3,autoplay:se=!0,interval:le=3.4,onChange:ce,className:De},Fe){const m=!!Ve(),C=o.useRef(null);o.useImperativeHandle(Fe,()=>C.current);const re=o.useRef(null),ue=o.useRef(null),fe=Ee(C,{amount:.25}),_e=Ee(C,{once:!0,amount:.3}),c=l.length,[x,ke]=o.useState(0),[M,de]=o.useState(!1),[N,me]=o.useState(!1),[pe,B]=o.useState(!1),p=o.useRef(null),b=o.useRef(0),oe=t=>Math.min(1,Math.max(0,t)),U=o.useRef({flare:V,glass:K,blur:J,blurNear:Q,blurFar:Z,noise:ee,thickness:te,radius:v,duration:P});U.current={flare:Math.min(.5,Math.max(0,V)),glass:K,blur:Math.max(0,J),blurNear:oe(Q),blurFar:oe(Z),noise:oe(ee),thickness:Math.min(2,Math.max(0,te)),radius:v,duration:P};const R=o.useRef(null),I=o.useRef(0),j=o.useCallback(t=>{b.current=t,p.current=null,ke(t),ce?.(t),R.current?.draw()},[ce]),L=o.useCallback(t=>{const a=p.current;if(!a)return;cancelAnimationFrame(I.current);const e=Math.max(.2,U.current.duration)*1e3,w=performance.now(),u=a.t,A=Math.abs(t-u)*e,r=F=>{const _=A<=0?1:Math.min(1,(F-w)/A);a.t=u+(t-u)*_,R.current?.draw(),_<1?I.current=requestAnimationFrame(r):t===1?j(a.to):(p.current=null,R.current?.draw())};I.current=requestAnimationFrame(r)},[j]),X=o.useCallback((t,a)=>{if(p.current||c<2)return;const e=b.current;if(t!==e){if(m||N||!M)return j(t);p.current={from:e,to:t,dir:a,t:0},L(1)}},[c,m,N,M,j,L]),S=o.useCallback(()=>X((b.current+1)%c,1),[X,c]),he=o.useCallback(()=>X((b.current-1+c)%c,-1),[X,c]);o.useEffect(()=>{const t=ue.current,a=re.current;if(!t||!a)return;const e=t.getContext("webgl",{antialias:!1,premultipliedAlpha:!0,alpha:!0});if(!e){me(!0);return}const w=(n,g)=>{const i=e.createShader(n);return e.shaderSource(i,g),e.compileShader(i),i},u=e.createProgram();if(e.attachShader(u,w(e.VERTEX_SHADER,Ze)),e.attachShader(u,w(e.FRAGMENT_SHADER,et)),e.linkProgram(u),!e.getProgramParameter(u,e.LINK_STATUS)){me(!0);return}e.useProgram(u),e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const A=e.getAttribLocation(u,"p");e.enableVertexAttribArray(A),e.vertexAttribPointer(A,2,e.FLOAT,!1,0,0);const r=Object.fromEntries(["uRes","uCard","uRadius","uA","uB","uAspA","uAspB","uFold","uDir","uAmpA","uAmpB","uFlare","uGlass","uFall","uDpr","uSideA","uSideB","uTime","uNear","uFar","uNoise","uThick"].map(n=>[n,e.getUniformLocation(u,n)]));e.uniform1i(r.uA,0),e.uniform1i(r.uB,1);const F=l.map(()=>{const n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([228,228,225,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),n}),_=l.map(()=>({w:1,h:1}));let xe=!0,G=0;l.forEach((n,g)=>{const i=new Image;i.crossOrigin="anonymous",i.decoding="async",i.onload=()=>{if(xe){e.bindTexture(e.TEXTURE_2D,F[g]),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1);try{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,i),_[g]={w:i.naturalWidth,h:i.naturalHeight}}catch{}G++,(g===b.current||G===l.length)&&de(!0),H()}},i.onerror=()=>{G++,G===l.length&&de(!0)},i.src=n.src});const H=()=>{const n=Math.min(2,window.devicePixelRatio||1),g=a.clientWidth,i=g/y,W=Math.max(1,Math.round((g+Y*2)*n)),z=Math.max(1,Math.round(i*(1+q*2)*n));(t.width!==W||t.height!==z)&&(t.width=W,t.height=z);const T={x:Y*n,y:i*q*n,w:g*n,h:i*n},h=U.current,d=p.current,ve=d?d.from:b.current,be=d?d.to:b.current,E=d?d.t:0,Be=tt(E),ae=d?d.dir:1,we=-.18+1.36*Be,Ue=(ae===1?we:1-we)*T.w,Ae=k(.42,.6,E),Ie=d?h.flare*k(0,.14,E)*(1-Ae):0,je=d?h.flare*Ae*(1-k(.84,1,E)):0,Le=d?h.blur*n*k(.04,.5,E):0,Xe=d?h.blur*n*k(0,.08,E)*(1-k(.18,.7,E)):0,Te=Re=>{const ne=T.w/T.h,ie=_[Re].w/_[Re].h;return ie>ne?[ne/ie,1]:[1,ie/ne]};e.viewport(0,0,W,z),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.uniform2f(r.uRes,W,z),e.uniform4f(r.uCard,T.x,T.y,T.w,T.h),e.uniform1f(r.uRadius,h.radius*n),e.uniform1f(r.uFold,d?Ue:-1e5*ae),e.uniform1f(r.uDir,ae),e.uniform1f(r.uAmpA,Ie),e.uniform1f(r.uAmpB,je),e.uniform1f(r.uFlare,Math.max(1e-4,h.flare)),e.uniform1f(r.uGlass,h.glass),e.uniform1f(r.uFall,T.w*.11),e.uniform1f(r.uDpr,n),e.uniform1f(r.uSideA,Le),e.uniform1f(r.uSideB,Xe),e.uniform1f(r.uNear,h.blurNear),e.uniform1f(r.uFar,h.blurFar),e.uniform1f(r.uNoise,h.noise),e.uniform1f(r.uThick,h.thickness),e.uniform1f(r.uTime,performance.now()/1e3%100);const[Ge,He]=Te(ve),[We,ze]=Te(be);e.uniform2f(r.uAspA,Ge,He),e.uniform2f(r.uAspB,We,ze),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,F[ve]),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,F[be]),e.drawArrays(e.TRIANGLE_STRIP,0,4)};R.current={draw:H},H();const ge=new ResizeObserver(H);return ge.observe(a),()=>{xe=!1,cancelAnimationFrame(I.current),ge.disconnect(),R.current=null,F.forEach(n=>e.deleteTexture(n)),e.deleteProgram(u)}},[l,y]),o.useEffect(()=>{R.current?.draw()},[V,K,J,Q,Z,ee,te,v]),o.useEffect(()=>{if(!se||m||pe||!fe||c<2)return;const t=window.setInterval(()=>{document.hidden||S()},Math.max(1,le)*1e3+Math.max(.2,P)*1e3);return()=>window.clearInterval(t)},[se,m,pe,fe,c,le,P,S]);const D=o.useRef(null),Me=t=>{t.button!==0||p.current||c<2||(D.current={x:t.clientX,started:!1},t.currentTarget.setPointerCapture(t.pointerId))},Ne=t=>{const a=D.current;if(!a)return;const e=t.clientX-a.x;if(!a.started){if(Math.abs(e)<6||m||N||!M)return;a.started=!0;const A=e>0?1:-1,r=b.current;p.current={from:r,to:(r+A+c)%c,dir:A,t:0}}const w=p.current;if(!w)return;const u=re.current?.clientWidth??1;w.t=Math.min(1,Math.max(0,e*w.dir/(u*.9))),R.current?.draw()},Se=t=>{const a=D.current;if(D.current=null,!a)return;if(!a.started){Math.abs(t.clientX-a.x)<6&&S();return}const e=p.current;e&&L(e.t>.35?1:0)},Pe=()=>{const t=D.current;D.current=null,t?.started&&p.current&&L(0)},Ce=l[x]?.label;return s.jsxs(O.div,{ref:C,role:"region","aria-roledescription":"carousel","aria-label":"Pictures",tabIndex:0,onKeyDown:t=>{t.key==="ArrowRight"?(t.preventDefault(),S()):t.key==="ArrowLeft"&&(t.preventDefault(),he())},onPointerEnter:t=>t.pointerType==="mouse"&&B(!0),onPointerLeave:t=>t.pointerType==="mouse"&&B(!1),onFocus:()=>B(!0),onBlur:t=>{t.currentTarget.contains(t.relatedTarget)||B(!1)},initial:m?!1:{opacity:0,y:18,filter:"blur(6px)"},animate:_e||m?{opacity:1,y:0,filter:"blur(0px)"}:void 0,transition:{duration:.7,ease:[.22,1,.36,1]},className:Je("relative w-[600px] max-w-full select-none rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-8",De),children:[s.jsxs("div",{ref:re,className:"relative w-full cursor-pointer touch-pan-y",style:{aspectRatio:String(y)},onPointerDown:Me,onPointerMove:Ne,onPointerUp:Se,onPointerCancel:Pe,children:[s.jsx(ye,{initial:!1,children:(!M||N)&&s.jsx(O.img,{src:l[x]?.src,alt:"",draggable:!1,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.4},className:"absolute inset-0 size-full rounded-[inherit] object-cover shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)]",style:{borderRadius:v}},x)}),s.jsx("canvas",{ref:ue,"aria-hidden":!0,className:"pointer-events-none absolute",style:{left:-Y,width:`calc(100% + ${Y*2}px)`,top:`${-q*100}%`,height:`${(1+q*2)*100}%`,opacity:M&&!N?1:0}}),s.jsx("span",{role:"img","aria-label":l[x]?.alt,className:"sr-only"})]}),s.jsxs("div",{className:"flex items-center justify-between gap-3 px-1",style:{marginTop:`calc(${U.current.flare*50/y}% + 12px)`},children:[s.jsxs("div",{className:"flex min-w-0 items-baseline gap-2.5",children:[s.jsxs("span",{className:"shrink-0 text-xs font-medium tabular-nums text-zinc-400",children:[String(x+1).padStart(2,"0")," / ",String(c).padStart(2,"0")]}),s.jsx("span",{className:"relative min-w-0 overflow-hidden",children:s.jsx(ye,{mode:"popLayout",initial:!1,children:s.jsx(O.span,{initial:m?{opacity:0}:{opacity:0,y:12,filter:"blur(4px)"},animate:{opacity:1,y:0,filter:"blur(0px)"},exit:m?{opacity:0}:{opacity:0,y:-12,filter:"blur(4px)"},transition:{duration:.35,ease:[.22,1,.36,1]},className:"block truncate text-sm font-medium text-[#242423] dark:text-zinc-100",children:Ce??l[x]?.alt},x)})})]}),s.jsx("div",{className:"flex shrink-0 gap-1.5",children:[{on:he,label:"Previous picture",Icon:Ke},{on:S,label:"Next picture",Icon:$e}].map(({on:t,label:a,Icon:e})=>s.jsx(O.button,{type:"button","aria-label":a,onClick:t,whileHover:m?void 0:{scale:1.06},whileTap:m?void 0:{scale:.9},transition:{type:"spring",stiffness:500,damping:28},className:"grid size-9 cursor-pointer place-items-center rounded-full bg-[#242423]/[0.06] text-[#242423] outline-none transition-colors hover:bg-[#242423]/[0.1] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:text-zinc-100",children:s.jsx(e,{className:"size-4",strokeWidth:2.25})},a))})]}),s.jsx("span",{role:"status","aria-live":"polite",className:"sr-only",children:`${l[x]?.alt??""}, ${x+1} of ${c}`})]})});export{xt as DuoFlip};
