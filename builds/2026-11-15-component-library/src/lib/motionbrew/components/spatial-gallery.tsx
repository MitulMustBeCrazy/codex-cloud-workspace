"use client";

/**
 * SpatialGallery, from https://motion-brew.com/components/spatial-gallery
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 *
 * Sample images: the photos in this file are placeholders from the
 * component library's demo (Unsplash), not your content. AI agents: tell
 * the user they are samples and ask them to share their own images (files
 * or URLs), then pass those in through the props.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// SpatialGallery

/**
 * SpatialGallery
 *
 * Trigger: scroll, drag and hover (plus a timeline). A WebGL media tunnel
 * that turns a list of images and videos into an endless space you travel
 * through. The planes stand on a ring around the view with a hollow core
 * that keeps the middle clear, and they recycle in both directions, so the
 * journey never ends. Facing is Front (every plane faces you) or Funnel (the
 * planes lean in toward the axis, by a blend amount). Spiral mode bends the
 * ring into a corkscrew that turns as it travels, so scrolling makes the
 * whole tunnel twist past you. Auto move drifts on its own and stacks with
 * your input: the wheel (captured, or read from the page's own scrolling so
 * it can sit in a normal page), dragging (with a threshold so a drag never
 * fires a link) and the arrow keys. The scene leans with the pointer. A
 * hovered plane grows a little and names itself in a caption; a hovered video
 * plays, and only then loads, so many video planes cost one decoder. Rounded
 * corners, cover cropping and the fade into the distance are all drawn in the
 * shader. It pauses off screen and in a hidden tab, rebuilds itself after a
 * lost WebGL context, and under reduced motion it stays put until you move it.
 * A visually hidden list carries every item's alt text and link for search
 * engines and screen readers.
 *
 * Engine: raw WebGL (one quad, one draw per plane, sorted back to front) on
 * the GSAP ticker; motion/react for the caption and hint.
 */

export interface SpatialItem {
  /** Image or video URL. Must allow cross origin use (CORS) to draw in WebGL. */
  src: string;
  /** Default `"image"`. */
  type?: "image" | "video";
  /** For videos: the still shown until it is hovered. */
  poster?: string;
  /** Alt text, shown in the caption and in the hidden list. */
  alt: string;
  /** Opens on click (a click, not a drag). */
  href?: string;
}

export type SpatialFacing = "front" | "funnel";

export interface SpatialGalleryProps {
  items?: SpatialItem[];
  /** Planes in the tunnel, 8 to 160. Default `124`. */
  count?: number;
  /** Tunnel radius, in scene units. Default `4.1`. */
  radius?: number;
  /** Hollow core: how much of the radius stays clear, 0 to 0.95. Default `0.8`. */
  core?: number;
  /** Depth between planes. Default `0.2`. */
  spacing?: number;
  /** Plane size. Default `0.95`. */
  size?: number;
  /** Planes face you, or lean in toward the axis. Default `"funnel"`. */
  facing?: SpatialFacing;
  /** How far Funnel leans into the tunnel wall, 0 to 1. Default `0.78`. */
  funnel?: number;
  /** Bend the ring into a turning corkscrew. Default `true`. */
  spiral?: boolean;
  /** Corkscrew strength, 0 to 1. Default `0.3`. */
  twist?: number;
  /** Drift on its own. Default `true`. */
  autoMove?: boolean;
  /** Auto move speed; negative goes backward. Default `0.8`. */
  speed?: number;
  /** How far the wheel or page scroll carries you. Default `2.1`. */
  scrollSpeed?: number;
  /** Scrolling over the gallery travels through it instead of scrolling the page. Default `true`. */
  captureScroll?: boolean;
  /** Read the page's own scrolling, so scrolling past it travels too. Default `true`. */
  followPageScroll?: boolean;
  /** Drag to travel. Default `true`. */
  drag?: boolean;
  /** How much the scene leans with the pointer, 0 to 1. Default `0.5`. */
  parallax?: number;
  /** Corner radius as a share of the plane's height, 0 to 0.5. Default `0.22`. */
  corner?: number;
  /** Fade out with distance, 0 to 1. The canvas is transparent, so it sits on any page. Default `0.8`. */
  fog?: number;
  /** Each plane's own tilt, so the images sit at varied angles, 0 to 1. Default `0`. */
  roll?: number;
  /** Name the hovered item in a caption. Default `true`. */
  caption?: boolean;
  /** How links open. Default `"_self"`. */
  linkTarget?: "_self" | "_blank";
  /** Anything on top, like a heading. */
  children?: React.ReactNode;
  className?: string;
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?w=720&q=70&auto=format&fit=crop`;

const DEFAULT_ITEMS: SpatialItem[] = [
  {
    src: u("photo-1501785888041-af3ef285b470"),
    alt: "A lake under mountains at dawn",
  },
  { src: u("photo-1487014679447-9f8336841d58"), alt: "A white curved facade" },
  {
    src: u("photo-1506905925346-21bda4d32df4"),
    alt: "Peaks above a sea of cloud",
  },
  {
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    type: "video",
    poster: u("photo-1490750967868-88aa4486c946"),
    alt: "A flower opening, video",
  },
  {
    src: u("photo-1517694712202-14dd9538aa97"),
    alt: "A laptop on a wooden desk",
  },
  {
    src: u("photo-1518837695005-2083093ee35b"),
    alt: "A wave breaking from below",
  },
  {
    src: u("photo-1486406146926-c627a92ad1ab"),
    alt: "Glass towers from the street",
  },
  { src: u("photo-1441974231531-c6227db76b6e"), alt: "Sun through a forest" },
  {
    src: u("photo-1460925895917-afdab827c52f"),
    alt: "Charts on a laptop screen",
  },
  {
    src: u("photo-1519681393784-d120267933ba"),
    alt: "Stars over snowy mountains",
  },
  { src: u("photo-1507525428034-b723cf961d3e"), alt: "A quiet beach at noon" },
  {
    src: u("photo-1534528741775-53994a69daeb"),
    alt: "A portrait in soft light",
  },
  {
    src: u("photo-1469474968028-56623f02e42e"),
    alt: "A valley in morning sun",
  },
  { src: u("photo-1505761671935-60b3a7427bad"), alt: "A bridge in the fog" },
];

const GLIDE = [0.22, 1, 0.36, 1] as const;
const FOV = (55 * Math.PI) / 180;
/** Planes start this far in front of the camera. */
const NEAR = 0.4;
/** How far a press may move before it counts as a drag, in px. */
const THRESHOLD = 6;

const VERTEX = `attribute vec2 a;
uniform mat4 uPV;uniform vec3 uPos;uniform vec3 uRight;uniform vec3 uUp;uniform vec2 uSize;
varying vec2 vUv;
void main(){vUv=a+.5;vec3 w=uPos+uRight*(a.x*uSize.x)+uUp*(a.y*uSize.y);gl_Position=uPV*vec4(w,1.);}`;

// Rounded corners from a signed distance, cover cropping, and a fade out with distance.
const FRAGMENT = `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;uniform float uReady;uniform vec2 uCrop;uniform float uAspect;uniform float uRadius;
uniform float uAA;uniform float uAlpha;uniform float uFog;uniform vec3 uBlank;
void main(){
vec2 p=(vUv-.5)*vec2(uAspect,1.);vec2 b=vec2(uAspect,1.)*.5;float r=min(uRadius,.5*min(uAspect,1.));
vec2 q=abs(p)-b+r;float sd=length(max(q,0.))+min(max(q.x,q.y),0.)-r;
float m=1.-smoothstep(-uAA,uAA,sd);
vec2 uv=(vUv-.5)*uCrop+.5;uv.y=1.-uv.y;
vec3 c=mix(uBlank,texture2D(uTex,uv).rgb,uReady);
float al=m*uAlpha*(1.-uFog);gl_FragColor=vec4(c*al,al);}`;

// Column major 4x4 matrices: just what the camera needs.
type M4 = Float32Array;
const mul = (a: M4, b: M4) => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r]! * b[c * 4 + k]!;
      o[c * 4 + r] = s;
    }
  return o;
};
const perspective = (aspect: number, near: number, far: number) => {
  const f = 1 / Math.tan(FOV / 2);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ]);
};
const rotX = (a: number) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
};
const rotY = (a: number) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
};
const translate = (x: number, y: number, z: number) =>
  new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);

/** A steady pseudo random number for plane `i`. */
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const norm = (v: number[]) => {
  const l = Math.hypot(v[0]!, v[1]!, v[2]!) || 1;
  return [v[0]! / l, v[1]! / l, v[2]! / l];
};
const cross = (a: number[], b: number[]) => [
  a[1]! * b[2]! - a[2]! * b[1]!,
  a[2]! * b[0]! - a[0]! * b[2]!,
  a[0]! * b[1]! - a[1]! * b[0]!,
];
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

interface Tex {
  tex: WebGLTexture;
  ready: boolean;
  aspect: number;
  /** How far the image has faded in over the blank plane, 0 to 1. */
  shown: number;
}

export const SpatialGallery = React.forwardRef<
  HTMLDivElement,
  SpatialGalleryProps
>(function SpatialGallery(
  {
    items = DEFAULT_ITEMS,
    count = 124,
    radius = 4.1,
    core = 0.8,
    spacing = 0.2,
    size = 0.95,
    facing = "funnel",
    funnel = 0.78,
    spiral = true,
    twist = 0.3,
    autoMove = true,
    speed = 0.8,
    scrollSpeed = 2.1,
    captureScroll = true,
    followPageScroll = true,
    drag = true,
    parallax = 0.5,
    corner = 0.22,
    fog = 0.8,
    roll = 0,
    caption = true,
    linkTarget = "_self",
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
  const [epoch, setEpoch] = React.useState(0);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [moved, setMoved] = React.useState(false);

  const params = React.useRef({
    count,
    radius,
    core,
    spacing,
    size,
    facing,
    funnel,
    spiral,
    twist,
    autoMove,
    speed,
    scrollSpeed,
    captureScroll,
    followPageScroll,
    drag,
    parallax,
    corner,
    fog,
    roll,
    linkTarget,
    still,
  });
  params.current = {
    count,
    radius,
    core,
    spacing,
    size,
    facing,
    funnel,
    spiral,
    twist,
    autoMove,
    speed,
    scrollSpeed,
    captureScroll,
    followPageScroll,
    drag,
    parallax,
    corner,
    fog,
    roll,
    linkTarget,
    still,
  };
  // Travel: where we are, and the velocity from the wheel, scroll and drags.
  const motionState = React.useRef({ T: 0, V: 0 });
  const pointer = React.useRef({
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    inside: false,
    down: false,
    sx: 0,
    sy: 0,
    dragging: false,
    lastY: 0,
    lastAt: 0,
    dragV: 0,
  });
  const pick = React.useRef<number | null>(null);
  const itemsRef = React.useRef(items);
  itemsRef.current = items;
  const frameRef = React.useRef<
    ((time: number, deltaMs: number) => void) | null
  >(null);
  const itemsKey = items
    .map((i) => `${i.type ?? "image"}:${i.src}:${i.poster ?? ""}`)
    .join("|");

  /** Add travel from an input, as velocity (or straight away under reduced motion). */
  const push = React.useCallback((units: number) => {
    const m = motionState.current;
    if (params.current.still) m.T += units * 0.25;
    else m.V += units;
    setMoved(true);
  }, []);

  // The wheel: captured over the gallery, or (when the page does not scroll) used anyway.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    let pending = 0;
    let wheelAt = 0;
    let scrolledAt = 0;
    let timer = 0;
    const onWheel = (e: WheelEvent) => {
      const k = 0.006 * params.current.scrollSpeed;
      const d =
        (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) *
        (e.deltaMode === 1 ? 16 : 1);
      if (params.current.captureScroll) {
        e.preventDefault();
        push(d * k);
        return;
      }
      // Let the page scroll; if it did not move, the wheel travels instead.
      pending += d * k;
      wheelAt = performance.now();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (scrolledAt < wheelAt) push(pending);
        pending = 0;
      }, 60);
    };
    // Any scrolling on the page (window or a scrolling box) carries you along.
    const last = new WeakMap<object, number>();
    const onScroll = (e: Event) => {
      const t = e.target as Element | Document;
      const top =
        t === document || t === document.documentElement
          ? window.scrollY
          : ((t as Element).scrollTop ?? 0);
      const key = t === document.documentElement ? document : t;
      const prev = last.get(key);
      last.set(key, top);
      scrolledAt = performance.now();
      if (prev === undefined || !params.current.followPageScroll) return;
      if (key !== document && !(t as Element).contains?.(el)) return;
      push((top - prev) * 0.006 * params.current.scrollSpeed);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.clearTimeout(timer);
    };
  }, [push]);

  // The renderer. Rebuilt when the items change or a lost context comes back.
  React.useEffect(() => {
    const el = canvas.current;
    const host = root.current;
    if (!el || !host) return;
    const gl = el.getContext("webgl", {
      antialias: true,
      premultipliedAlpha: true,
      alpha: true,
    });
    if (!gl) return;
    let lost = false;
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
    };
    const onRestored = () => setEpoch((n) => n + 1);
    el.addEventListener("webglcontextlost", onLost);
    el.addEventListener("webglcontextrestored", onRestored);

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
      new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(
      [
        "uPV",
        "uPos",
        "uRight",
        "uUp",
        "uSize",
        "uTex",
        "uReady",
        "uCrop",
        "uAspect",
        "uRadius",
        "uAA",
        "uAlpha",
        "uFog",
        "uBlank",
      ].map((n) => [n, gl.getUniformLocation(prog, n)]),
    ) as Record<string, WebGLUniformLocation | null>;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(U.uTex!, 0);

    const makeTex = () => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([236, 236, 234, 255]),
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    };
    const upload = (t: Tex, src: TexImageSource, w: number, h: number) => {
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      t.ready = true;
      t.aspect = w / h;
    };

    // One texture per item (an image, or a video's poster), loaded as it arrives.
    const list = itemsRef.current;
    const texes: Tex[] = list.map((it) => {
      const t: Tex = { tex: makeTex(), ready: false, aspect: 1.4, shown: 0 };
      const first = it.type === "video" ? it.poster : it.src;
      if (first) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () =>
          !lost && upload(t, img, img.naturalWidth, img.naturalHeight);
        img.src = first;
      }
      return t;
    });

    // One video element for the whole gallery: it loads only for the hovered video.
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "none";
    const live: Tex = { tex: makeTex(), ready: false, aspect: 1.4, shown: 0 };
    // Upload the video only when it has a new frame, not on every display frame:
    // re-uploading the same frame at 60 or 120 Hz stalls the main thread.
    let fresh = false;
    let lastTime = -1;
    // Older browsers lack requestVideoFrameCallback; they compare the time instead.
    const hasRvfc = typeof video.requestVideoFrameCallback === "function";
    const onVideoFrame = () => {
      fresh = true;
      video.requestVideoFrameCallback(onVideoFrame);
    };
    if (hasRvfc) video.requestVideoFrameCallback(onVideoFrame);
    let playing: number | null = null;
    let release = 0;
    const playVideo = (i: number | null) => {
      const it = i === null ? null : list[i];
      if (it?.type === "video") {
        window.clearTimeout(release);
        if (playing !== i) {
          playing = i;
          live.ready = false;
          fresh = false;
          lastTime = -1;
          video.src = it.src;
          void video.play().catch(() => {});
        }
      } else if (playing !== null) {
        window.clearTimeout(release);
        release = window.setTimeout(() => {
          video.pause();
          video.removeAttribute("src");
          video.load();
          playing = null;
          live.ready = false;
        }, 400);
      }
    };

    const hover = new Float32Array(160);
    let picked: number | null = null;
    // The playing video fades in over its poster on the one hovered plane, and
    // back out after; videoPlane keeps that plane while it fades.
    let videoMix = 0;
    let videoPlane: number | null = null;

    const frame = (time: number, deltaMs: number) => {
      if (lost) return;
      const p = params.current;
      const dt = Math.min(0.05, deltaMs / 1000);
      const m = motionState.current;
      const ptr = pointer.current;

      // Travel: auto move plus whatever the inputs added, easing out.
      if (!p.still) {
        m.T += ((p.autoMove ? p.speed * 1.6 : 0) + m.V) * dt;
        m.V *= Math.exp(-dt * 2.4);
      }
      // Parallax: the camera leans toward the pointer.
      const lean = p.still ? 0 : p.parallax;
      const k = 1 - Math.exp(-dt * 4);
      ptr.px += ((ptr.inside ? ptr.x : 0) * lean - ptr.px) * k;
      ptr.py += ((ptr.inside ? ptr.y : 0) * lean - ptr.py) * k;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(el.clientWidth * dpr));
      const h = Math.max(1, Math.round(el.clientHeight * dpr));
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
      }
      const aspect = w / h;
      const n = Math.max(8, Math.min(160, Math.round(p.count)));
      const span = n * p.spacing;
      const proj = perspective(aspect, 0.05, span + 10);
      const view = mul(
        mul(rotX(ptr.py * 0.07), rotY(ptr.px * 0.1)),
        translate(-ptr.px * 0.8, ptr.py * 0.55, 0),
      );
      const pv = mul(proj, view);

      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(U.uPV!, false, pv);
      gl.uniform3f(U.uBlank!, 0.925, 0.925, 0.918);

      // Lay out every plane: ring position, depth (wrapping both ways), facing.
      // A true circle, a little larger on wide views so the wall still frames them.
      const rx = p.radius * Math.max(1, Math.min(1.6, aspect * 0.75));
      const ry = rx;
      const planes: {
        i: number;
        d: number;
        pos: number[];
        right: number[];
        up: number[];
        sw: number;
        sh: number;
        tex: Tex;
        item: number;
        alpha: number;
        fogv: number;
      }[] = [];
      for (let i = 0; i < n; i++) {
        let d = (i * p.spacing - m.T) % span;
        if (d < 0) d += span;
        const item = i % list.length;
        const theta =
          i * 2.39996 + (p.spiral ? p.twist * (d * 0.75 + m.T * 0.18) : 0);
        const r = p.core + (1 - p.core) * hash(i);
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const pos = [c * rx * r, s * ry * r, -(NEAR + d)];
        let right = [1, 0, 0];
        let up = [0, 1, 0];
        if (p.facing === "funnel" && p.funnel > 0) {
          const b = p.funnel * 0.85;
          const inward = norm([-c * ry, -s * rx, 0]);
          // The plane's right edge follows the ring, so it turns smoothly
          // with the tunnel as it circles.
          const tangent = norm([-s * rx, c * ry, 0]);
          const nrm = norm([inward[0]! * b, inward[1]! * b, 1 - b]);
          const rt = norm([1 - b + tangent[0]! * b, tangent[1]! * b, 0]);
          up = norm(cross(nrm, rt));
          right = norm(cross(up, nrm));
        }
        // Each plane gets its own tilt in its plane, so the images sit at varied angles.
        if (p.roll > 0) {
          const phi = (hash(i + 17) - 0.5) * 1.8 * p.roll;
          const cr = Math.cos(phi);
          const sr = Math.sin(phi);
          const r2 = [
            right[0]! * cr + up[0]! * sr,
            right[1]! * cr + up[1]! * sr,
            right[2]! * cr + up[2]! * sr,
          ];
          up = [
            up[0]! * cr - right[0]! * sr,
            up[1]! * cr - right[1]! * sr,
            up[2]! * cr - right[2]! * sr,
          ];
          right = r2;
        }
        // Size always follows the image (or poster), so a video starting on
        // hover never resizes the plane; the shader crops the video to fit.
        const tex = texes[item]!;
        const a = Math.max(0.7, Math.min(1.6, tex.aspect));
        const grow = 1 + 0.07 * hover[i]!;
        const sw = p.size * Math.sqrt(a) * grow;
        const sh = (p.size / Math.sqrt(a)) * grow;
        const alpha = smooth(span, span * 0.82, d) * smooth(0, 1, d);
        if (alpha < 0.005) continue;
        planes.push({
          i,
          d,
          pos,
          right,
          up,
          sw,
          sh,
          tex,
          item,
          alpha,
          fogv: p.fog * smooth(span * 0.2, span, d),
        });
      }
      planes.sort((a, b) => b.d - a.d);

      // Hover: the nearest plane whose projected quad holds the pointer.
      const project = (v: number[]) => {
        const x = pv[0]! * v[0]! + pv[4]! * v[1]! + pv[8]! * v[2]! + pv[12]!;
        const y = pv[1]! * v[0]! + pv[5]! * v[1]! + pv[9]! * v[2]! + pv[13]!;
        const wv = pv[3]! * v[0]! + pv[7]! * v[1]! + pv[11]! * v[2]! + pv[15]!;
        return [
          ((x / wv) * 0.5 + 0.5) * el.clientWidth,
          (1 - ((y / wv) * 0.5 + 0.5)) * el.clientHeight,
          wv,
        ];
      };
      const corner = (pl: (typeof planes)[number], sx: number, sy: number) =>
        project([
          pl.pos[0]! + pl.right[0]! * sx * pl.sw + pl.up[0]! * sy * pl.sh,
          pl.pos[1]! + pl.right[1]! * sx * pl.sw + pl.up[1]! * sy * pl.sh,
          pl.pos[2]! + pl.right[2]! * sx * pl.sw + pl.up[2]! * sy * pl.sh,
        ]);
      let hit: number | null = null;
      const mx = ((ptr.x + 1) / 2) * el.clientWidth;
      const my = ((1 - ptr.y) / 2) * el.clientHeight;
      for (const pl of planes) {
        const q = [
          corner(pl, -0.5, -0.5),
          corner(pl, 0.5, -0.5),
          corner(pl, 0.5, 0.5),
          corner(pl, -0.5, 0.5),
        ];
        (pl as { px?: number }).px = Math.abs(q[3]![1]! - q[0]![1]!);
        if (
          !ptr.inside ||
          ptr.dragging ||
          q.some((c) => c[2]! <= 0) ||
          pl.alpha < 0.5
        )
          continue;
        let sign = 0;
        let inside = true;
        for (let e = 0; e < 4; e++) {
          const a = q[e]!;
          const b = q[(e + 1) % 4]!;
          const cr =
            (b[0]! - a[0]!) * (my - a[1]!) - (b[1]! - a[1]!) * (mx - a[0]!);
          const sgn = Math.sign(cr);
          if (sgn === 0) continue;
          if (sign === 0) sign = sgn;
          else if (sgn !== sign) {
            inside = false;
            break;
          }
        }
        if (inside) hit = pl.i;
      }
      for (let i = 0; i < n; i++)
        hover[i]! +=
          ((i === hit ? 1 : 0) - hover[i]!) *
          (p.still ? 1 : 1 - Math.exp(-dt * 10));
      if (hit !== picked) {
        picked = hit;
        const item = hit === null ? null : hit % list.length;
        pick.current = item;
        setHovered(item);
        playVideo(item);
        host.style.cursor =
          item !== null && list[item]?.href ? "pointer" : p.drag ? "grab" : "";
      }

      // Keep the playing video's frame current, once per new video frame.
      if (playing !== null && video.readyState >= 2 && video.videoWidth) {
        const changed = hasRvfc ? fresh : video.currentTime !== lastTime;
        if (changed || !live.ready) {
          upload(live, video, video.videoWidth, video.videoHeight);
          fresh = false;
          lastTime = video.currentTime;
        }
      }
      const wantVideo =
        picked !== null && playing === picked % list.length && live.ready;
      if (wantVideo) videoPlane = picked;
      videoMix +=
        ((wantVideo ? 1 : 0) - videoMix) *
        (p.still ? 1 : 1 - Math.exp(-dt * 9));
      if (videoMix < 0.01 && !wantVideo) videoPlane = null;
      // Images fade in over the blank plane as they arrive, instead of popping.
      for (const t of texes)
        if (t.ready && t.shown < 1)
          t.shown = p.still ? 1 : Math.min(1, t.shown + dt * 4);

      for (const pl of planes) {
        const a = pl.sw / pl.sh;
        const ta = pl.tex.aspect;
        gl.bindTexture(gl.TEXTURE_2D, pl.tex.tex);
        gl.uniform3fv(U.uPos!, pl.pos);
        gl.uniform3fv(U.uRight!, pl.right);
        gl.uniform3fv(U.uUp!, pl.up);
        gl.uniform2f(U.uSize!, pl.sw, pl.sh);
        gl.uniform1f(
          U.uReady!,
          pl.tex.shown * pl.tex.shown * (3 - 2 * pl.tex.shown),
        );
        gl.uniform2f(U.uCrop!, ta > a ? a / ta : 1, ta > a ? 1 : ta / a);
        gl.uniform1f(U.uAspect!, a);
        gl.uniform1f(U.uRadius!, p.corner);
        gl.uniform1f(
          U.uAA!,
          1.5 / Math.max(4, ((pl as { px?: number }).px ?? 100) * dpr),
        );
        gl.uniform1f(U.uAlpha!, pl.alpha);
        gl.uniform1f(U.uFog!, pl.fogv);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        // The video, cross faded over its poster on the hovered plane only.
        if (pl.i === videoPlane && videoMix > 0.01 && live.ready) {
          const va = live.aspect;
          gl.bindTexture(gl.TEXTURE_2D, live.tex);
          gl.uniform1f(U.uReady!, 1);
          gl.uniform2f(U.uCrop!, va > a ? a / va : 1, va > a ? 1 : va / a);
          gl.uniform1f(U.uAlpha!, pl.alpha * videoMix);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      }
      void time;
    };

    // Draw once now; the ticker below keeps it moving while it is on screen.
    frame(0, 16);
    frameRef.current = frame;
    return () => {
      frameRef.current = null;
      el.removeEventListener("webglcontextlost", onLost);
      el.removeEventListener("webglcontextrestored", onRestored);
      window.clearTimeout(release);
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (!lost) {
        texes.forEach((t) => gl.deleteTexture(t.tex));
        gl.deleteTexture(live.tex);
        gl.deleteProgram(prog);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, epoch]);

  // Run on the GSAP ticker only while on screen and while the tab is open.
  React.useEffect(() => {
    if (!visible) return;
    const tick = (t: number, d: number) => {
      if (!document.hidden) frameRef.current?.(t, d);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [visible]);

  const toLocal = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: -(((e.clientY - r.top) / r.height) * 2 - 1),
    };
  };

  const item = hovered === null ? null : items[hovered];

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="gallery"
      aria-label="Media gallery. Scroll, drag or use the arrow keys to travel."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") push(1.2);
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") push(-1.2);
        else return;
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        const p = toLocal(e);
        const ptr = pointer.current;
        ptr.x = p.x;
        ptr.y = p.y;
        ptr.inside = true;
        if (!ptr.down || !params.current.drag) return;
        if (
          !ptr.dragging &&
          Math.hypot(e.clientX - ptr.sx, e.clientY - ptr.sy) > THRESHOLD
        ) {
          ptr.dragging = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.style.cursor = "grabbing";
        }
        if (ptr.dragging) {
          const now = performance.now();
          const dy = ptr.lastY - e.clientY;
          const units = dy * 0.02;
          motionState.current.T += units;
          ptr.dragV =
            (units / Math.max(0.008, (now - ptr.lastAt) / 1000)) * 0.6;
          ptr.lastY = e.clientY;
          ptr.lastAt = now;
          setMoved(true);
        }
      }}
      onPointerEnter={() => {
        pointer.current.inside = true;
      }}
      onPointerLeave={() => {
        const ptr = pointer.current;
        ptr.inside = false;
        if (!ptr.dragging) ptr.down = false;
      }}
      onPointerDown={(e) => {
        const ptr = pointer.current;
        ptr.down = true;
        ptr.dragging = false;
        ptr.sx = e.clientX;
        ptr.sy = e.clientY;
        ptr.lastY = e.clientY;
        ptr.lastAt = performance.now();
        ptr.dragV = 0;
      }}
      onPointerUp={(e) => {
        const ptr = pointer.current;
        const wasDrag = ptr.dragging;
        ptr.down = false;
        ptr.dragging = false;
        e.currentTarget.style.cursor = "";
        if (wasDrag) {
          if (!params.current.still)
            motionState.current.V += Math.max(-12, Math.min(12, ptr.dragV));
          return;
        }
        // A click, not a drag: open the hovered item's link.
        const i = pick.current;
        const href = i === null ? undefined : items[i]?.href;
        if (href)
          window.open(
            href,
            params.current.linkTarget,
            params.current.linkTarget === "_blank" ? "noopener" : undefined,
          );
      }}
      className={cn(
        "relative isolate h-[560px] w-full touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#242423]/30",
        className,
      )}
    >
      <canvas
        ref={canvas}
        aria-hidden
        className="absolute inset-0 -z-10 size-full"
      />

      {children}

      {/* The hovered item's name, or a hint until you have moved. */}
      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {item ? (
              <motion.span
                key={`item-${hovered}`}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: GLIDE }}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-white/85 px-4 text-[14px] font-medium text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_24px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/5 backdrop-blur-md"
              >
                {item.type === "video" && (
                  <span className="size-1.5 animate-pulse rounded-full bg-[#d64545]" />
                )}
                {item.alt}
                {item.href && (
                  <span aria-hidden className="text-[#242423]/45">
                    ↗
                  </span>
                )}
              </motion.span>
            ) : !moved ? (
              <motion.span
                key="hint"
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: GLIDE }}
                className="inline-flex h-9 items-center rounded-full bg-white/85 px-4 text-[14px] font-medium text-[#242423]/70 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/5 backdrop-blur-md"
              >
                Scroll or drag to travel
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      {/* Every item's alt text and link, for search engines and screen readers. */}
      <ul className="sr-only">
        {items.map((it, i) => (
          <li key={`${it.src}-${i}`}>
            {it.href ? <a href={it.href}>{it.alt}</a> : <span>{it.alt}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
});