"use client";

/**
 * PrismFlow, from https://motion-brew.com/components/prism-flow
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// PrismFlow

/**
 * PrismFlow
 *
 * Trigger: hover (plus a timeline). A dark background crossed by a soft band
 * of light that bends and drifts like a ribbon caught in slow air. Its edges
 * split into colour the way light does through a prism: a bright near white
 * core fades out through your four colours on either side, under a wide glow.
 * A fainter echo band trails behind it. The ribbon leans toward the pointer
 * and settles back when it leaves. Fine film grain keeps the gradients smooth.
 * Anything you place inside sits on top. It pauses off screen and in a hidden
 * tab, and reduced motion holds one still frame.
 *
 * Engine: a WebGL fragment shader (a domain warped curve, a spectral spread of
 * gaussian bands and a filmic tone curve) on requestAnimationFrame.
 */

export interface PrismFlowProps {
  /** Four colours from one edge of the band to the other; the core between them is near white. Default an ember ramp. */
  colors?: [string, string, string, string];
  /** The background the light sits on. Default `"#050507"`. */
  background?: string;
  /** Drift speed, 0 (still) to 5. Default `2.7`. */
  speed?: number;
  /** Width of the band, 0.2 to 5. Default `2.75`. */
  width?: number;
  /** How far the colours fan out from the core, 0 to 4. Default `1.45`. */
  spread?: number;
  /** How much the band curls and folds, 0 to 2.5. Default `1`. */
  warp?: number;
  /** Overall brightness, 0.2 to 4. Default `2.25`. */
  intensity?: number;
  /** Film grain, 0 to 2.5. Default `1.75`. */
  grain?: number;
  /** Show the fainter echo band. Default `true`. */
  echo?: boolean;
  /** The light leans toward the pointer. Default `true`. */
  interactive?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const DEFAULT_COLORS: [string, string, string, string] = [
  "#ff2d55",
  "#ff9f0a",
  "#ffe08a",
  "#7a5cff",
];

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAGMENT = `precision highp float;
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
}`;

const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const PrismFlow = React.forwardRef<HTMLDivElement, PrismFlowProps>(
  function PrismFlow(
    {
      colors = DEFAULT_COLORS,
      background = "#050507",
      speed = 2.7,
      width = 2.75,
      spread = 1.45,
      warp = 1,
      intensity = 2.25,
      grain = 1.75,
      echo = true,
      interactive = true,
      children,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const visible = useInView(root, { amount: 0.05 });
    const params = React.useRef({
      colors,
      background,
      speed,
      width,
      spread,
      warp,
      intensity,
      grain,
      echo,
      interactive,
    });
    params.current = {
      colors,
      background,
      speed,
      width,
      spread,
      warp,
      intensity,
      grain,
      echo,
      interactive,
    };
    // Pointer in shader space; `on` eases the pull in and out.
    const pointer = React.useRef({
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      on: 0,
      target: 0,
    });
    const clock = React.useRef({ t: 4, now: 0 });

    React.useEffect(() => {
      const el = canvas.current;
      if (!el) return;
      const gl = el.getContext("webgl", {
        antialias: false,
        premultipliedAlpha: false,
      });
      if (!gl) {
        const c = params.current.colors;
        el.style.background = `radial-gradient(60% 30% at 40% 55%, #fff8, transparent 60%), linear-gradient(160deg, transparent 30%, ${c[0]} 42%, ${c[1]} 48%, ${c[2]} 54%, ${c[3]} 60%, transparent 72%), ${params.current.background}`;
        return;
      }
      const compile = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = Object.fromEntries(
        [
          "r",
          "t",
          "now",
          "c0",
          "c1",
          "c2",
          "c3",
          "bg",
          "uw",
          "us",
          "uwarp",
          "ui",
          "ug",
          "uecho",
          "m",
        ].map((n) => [n, gl.getUniformLocation(prog, n)]),
      ) as Record<string, WebGLUniformLocation | null>;

      const draw = () => {
        // Draw at a reduced resolution: the light is soft, so it costs little to look sharp.
        const dpr = Math.min(1.25, window.devicePixelRatio || 1);
        const w = Math.max(1, Math.round(el.clientWidth * dpr));
        const h = Math.max(1, Math.round(el.clientHeight * dpr));
        if (el.width !== w || el.height !== h) {
          el.width = w;
          el.height = h;
        }
        const p = params.current;
        const ptr = pointer.current;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(U.r!, w, h);
        gl.uniform1f(U.t!, clock.current.t);
        gl.uniform1f(U.now!, clock.current.now);
        gl.uniform3fv(U.c0!, rgb(p.colors[0]));
        gl.uniform3fv(U.c1!, rgb(p.colors[1]));
        gl.uniform3fv(U.c2!, rgb(p.colors[2]));
        gl.uniform3fv(U.c3!, rgb(p.colors[3]));
        gl.uniform3fv(U.bg!, rgb(p.background));
        gl.uniform1f(U.uw!, p.width);
        gl.uniform1f(U.us!, p.spread);
        gl.uniform1f(U.uwarp!, p.warp);
        gl.uniform1f(U.ui!, p.intensity);
        gl.uniform1f(U.ug!, p.grain);
        gl.uniform1f(U.uecho!, p.echo ? 1 : 0);
        gl.uniform3f(U.m!, ptr.x, ptr.y, ptr.on);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      if (still || !visible) {
        draw();
        const ro = new ResizeObserver(draw);
        ro.observe(el);
        return () => ro.disconnect();
      }
      let raf = 0;
      let last = performance.now();
      const frame = (ms: number) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;
        const dt = Math.min(0.05, (ms - last) / 1000);
        last = ms;
        clock.current.now += dt;
        clock.current.t += dt * params.current.speed;
        const ptr = pointer.current;
        const k = 1 - Math.exp(-dt * 3);
        ptr.x += (ptr.tx - ptr.x) * k;
        ptr.y += (ptr.ty - ptr.y) * k;
        ptr.on +=
          ((params.current.interactive ? ptr.target : 0) - ptr.on) *
          (1 - Math.exp(-dt * 2.5));
        draw();
      };
      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    }, [still, visible]);

    return (
      <div
        ref={root}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const a = r.width / r.height;
          pointer.current.tx = ((e.clientX - r.left) / r.width - 0.5) * a * 2;
          pointer.current.ty = (0.5 - (e.clientY - r.top) / r.height) * 2;
          pointer.current.target = 1;
        }}
        onPointerLeave={() => {
          pointer.current.target = 0;
        }}
        className={cn(
          "relative isolate min-h-[320px] w-full overflow-hidden",
          className,
        )}
        style={{ backgroundColor: background }}
      >
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 -z-10 size-full"
        />
        {children}
      </div>
    );
  },
);