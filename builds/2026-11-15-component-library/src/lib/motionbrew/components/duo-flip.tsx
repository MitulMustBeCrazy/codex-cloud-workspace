"use client";

/**
 * DuoFlip, from https://motion-brew.com/components/duo-flip
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// DuoFlip

/**
 * DuoFlip
 *
 * Trigger: press or drag (plus keys and a timer). A gallery that turns its
 * pictures over with a liquid fold. A fold line sweeps across the card: the
 * incoming picture opens on one side, the outgoing one on the other. Right at
 * the fold the page being turned lifts like liquid glass: it swells above and
 * below the card in soft curves, blurs, splits its colours into a blue and
 * pink fringe and casts a shadow on the page beside it. While it moves, a
 * grainy frost runs as a gradient from the fold, strongest beside it and
 * fading toward the far edge; the outgoing picture frosts as it leaves and
 * the incoming one comes into focus as it settles. The card has thickness: a
 * bevel round its edge, and a rim where the page lifts, like a sheet of glass. Half way across, the
 * lift hands over from the outgoing page to the incoming one, and once the
 * fold leaves the card its last edge wobbles and settles flat. Tap or click
 * for the next picture, or drag sideways to move the fold by hand and let go
 * to finish or undo it. Left and Right do the same, and it turns on its own
 * until hovered, focused or off screen. Reduced motion swaps pictures without
 * movement, and without WebGL the pictures crossfade.
 *
 * Engine: a WebGL fragment shader (every pixel finds its page, flare, blur,
 * colour fringe, shading and rounded edge) driven by requestAnimationFrame,
 * with motion/react for the caption and buttons.
 */

export interface DuoFlipImage {
  src: string;
  alt: string;
  /** A short caption under the card. */
  label?: string;
}

export interface DuoFlipProps {
  /** The pictures, two or more. Default four sample photos. */
  images?: DuoFlipImage[];
  /** Card width over height. Default `1.5` (600 by 400 at full width). */
  aspect?: number;
  /** Card corner radius in px. Default `24`. */
  radius?: number;
  /** How far the turning page swells past the card, 0.1 to 0.5 of its height. Default `0.34`. */
  flare?: number;
  /** Strength of the glass at the fold (blur and colour fringe), 0 to 2. Default `1`. */
  glass?: number;
  /** Frost on the pictures while they turn, in px: the outgoing one blurs as it leaves, the incoming one sharpens as it lands. 0 turns it off. Default `24`. */
  blur?: number;
  /** How much of `blur` the frost has right beside the fold, 0 to 1. Default `0.65`. */
  blurNear?: number;
  /** How much of `blur` the frost has at the edge farthest from the fold, 0 to 1. Default `0.12`. */
  blurFar?: number;
  /** Grain in the frost, 0 (smooth) to 1. Default `0.3`. */
  noise?: number;
  /** How thick the card looks: its bevel and the rim where the page lifts, 0 to 2. Default `1`. */
  thickness?: number;
  /** Seconds one turn takes. Default `1.3`. */
  duration?: number;
  /** Turn on its own. Default `true`. */
  autoplay?: boolean;
  /** Seconds between turns on its own. Default `3.4`. */
  interval?: number;
  /** Called with the new picture's index after each turn. */
  onChange?: (index: number) => void;
  className?: string;
}

const SAMPLE = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1400&h=780&fit=crop&q=80`;
const DEFAULT_IMAGES: DuoFlipImage[] = [
  { src: SAMPLE("1490750967868-88aa4486c946"), alt: "Orange poppies against a blue sky", label: "Poppies" },
  { src: SAMPLE("1454496522488-7a8e488e8606"), alt: "Snowy mountain peaks under clouds", label: "Snow peaks" },
  { src: SAMPLE("1441974231531-c6227db76b6e"), alt: "Sun through a forest", label: "Forest light" },
  { src: SAMPLE("1486406146926-c627a92ad1ab"), alt: "Glass towers seen from below", label: "City glass" },
];

/** Room around the card on the canvas: above and below for the flare (of the card height), and at the sides for the shadow (px). */
const PAD_Y = 0.32;
const PAD_X = 28;

const VERTEX = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAGMENT = `
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
`;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
// Quick through the middle, slow into the settle.
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Turn {
  from: number;
  to: number;
  dir: 1 | -1;
  t: number;
}

export const DuoFlip = React.forwardRef<HTMLDivElement, DuoFlipProps>(
  function DuoFlip(
    {
      images = DEFAULT_IMAGES,
      aspect = 1.5,
      radius = 24,
      flare = 0.34,
      glass = 1,
      blur = 24,
      blurNear = 0.65,
      blurFar = 0.12,
      noise = 0.3,
      thickness = 1,
      duration = 1.3,
      autoplay = true,
      interval = 3.4,
      onChange,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current as HTMLDivElement);
    const stage = React.useRef<HTMLDivElement>(null);
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const inView = useInView(root, { amount: 0.25 });
    const seen = useInView(root, { once: true, amount: 0.3 });
    const n = images.length;
    const [index, setIndex] = React.useState(0);
    const [ready, setReady] = React.useState(false);
    const [failed, setFailed] = React.useState(false);
    const [hold, setHold] = React.useState(false);

    // What the shader needs each frame, kept in refs so a turn never re-renders.
    const turn = React.useRef<Turn | null>(null);
    const current = React.useRef(0);
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const params = React.useRef({ flare, glass, blur, blurNear, blurFar, noise, thickness, radius, duration });
    params.current = {
      flare: Math.min(0.5, Math.max(0, flare)),
      glass,
      blur: Math.max(0, blur),
      blurNear: clamp01(blurNear),
      blurFar: clamp01(blurFar),
      noise: clamp01(noise),
      thickness: Math.min(2, Math.max(0, thickness)),
      radius,
      duration,
    };
    const api = React.useRef<{ draw: () => void } | null>(null);
    const raf = React.useRef(0);

    const finish = React.useCallback(
      (to: number) => {
        current.current = to;
        turn.current = null;
        setIndex(to);
        onChange?.(to);
        api.current?.draw();
      },
      [onChange],
    );

    /** Run the current turn from its t to 1 (or back to 0), then settle. */
    const play = React.useCallback(
      (target: 0 | 1) => {
        const tr = turn.current;
        if (!tr) return;
        cancelAnimationFrame(raf.current);
        const total = Math.max(0.2, params.current.duration) * 1000;
        const start = performance.now();
        const t0 = tr.t;
        const span = Math.abs(target - t0) * total;
        const step = (now: number) => {
          const k = span <= 0 ? 1 : Math.min(1, (now - start) / span);
          tr.t = t0 + (target - t0) * k;
          api.current?.draw();
          if (k < 1) raf.current = requestAnimationFrame(step);
          else if (target === 1) finish(tr.to);
          else {
            turn.current = null;
            api.current?.draw();
          }
        };
        raf.current = requestAnimationFrame(step);
      },
      [finish],
    );

    /** Turn to a picture, the fold travelling in `dir`. */
    const go = React.useCallback(
      (to: number, dir: 1 | -1) => {
        if (turn.current || n < 2) return;
        const from = current.current;
        if (to === from) return;
        if (still || failed || !ready) return finish(to);
        turn.current = { from, to, dir, t: 0 };
        play(1);
      },
      [n, still, failed, ready, finish, play],
    );
    const next = React.useCallback(
      () => go((current.current + 1) % n, 1),
      [go, n],
    );
    const prev = React.useCallback(
      () => go((current.current - 1 + n) % n, -1),
      [go, n],
    );

    // WebGL: one full screen quad, a texture per picture.
    React.useEffect(() => {
      const el = canvas.current;
      const box = stage.current;
      if (!el || !box) return;
      const gl = el.getContext("webgl", {
        antialias: false,
        premultipliedAlpha: true,
        alpha: true,
      });
      if (!gl) {
        setFailed(true);
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
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        setFailed(true);
        return;
      }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = Object.fromEntries(
        ["uRes", "uCard", "uRadius", "uA", "uB", "uAspA", "uAspB", "uFold", "uDir", "uAmpA", "uAmpB", "uFlare", "uGlass", "uFall", "uDpr", "uSideA", "uSideB", "uTime", "uNear", "uFar", "uNoise", "uThick"].map(
          (k) => [k, gl.getUniformLocation(prog, k)],
        ),
      ) as Record<string, WebGLUniformLocation | null>;
      gl.uniform1i(U.uA!, 0);
      gl.uniform1i(U.uB!, 1);

      // A neutral grey until each picture arrives.
      const textures = images.map(() => {
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([228, 228, 225, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
      });
      const sizes = images.map(() => ({ w: 1, h: 1 }));
      let alive = true;
      let loaded = 0;
      images.forEach((im, i) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () => {
          if (!alive) return;
          gl.bindTexture(gl.TEXTURE_2D, textures[i]!);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
          try {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            sizes[i] = { w: img.naturalWidth, h: img.naturalHeight };
          } catch {
            // A picture without CORS cannot go on the canvas: it stays grey there.
          }
          loaded++;
          if (i === current.current || loaded === images.length) setReady(true);
          draw();
        };
        img.onerror = () => {
          loaded++;
          if (loaded === images.length) setReady(true);
        };
        img.src = im.src;
      });

      const draw = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const cw = box.clientWidth;
        const ch = cw / aspect;
        const W = Math.max(1, Math.round((cw + PAD_X * 2) * dpr));
        const H = Math.max(1, Math.round(ch * (1 + PAD_Y * 2) * dpr));
        if (el.width !== W || el.height !== H) {
          el.width = W;
          el.height = H;
        }
        const card = { x: PAD_X * dpr, y: ch * PAD_Y * dpr, w: cw * dpr, h: ch * dpr };
        const p = params.current;
        const tr = turn.current;
        const from = tr ? tr.from : current.current;
        const to = tr ? tr.to : current.current;
        const t = tr ? tr.t : 0;
        const e = ease(t);
        const dir = tr ? tr.dir : 1;
        // Where the fold is: from beyond one edge to beyond the other.
        const along = -0.18 + 1.36 * e;
        const fold = (dir === 1 ? along : 1 - along) * card.w;
        // The outgoing page lifts first; half way the lift hands over to the incoming page,
        // which settles as the fold leaves.
        const handover = smooth(0.42, 0.6, t);
        const ampA = tr ? p.flare * smooth(0, 0.14, t) * (1 - handover) : 0;
        const ampB = tr ? p.flare * handover * (1 - smooth(0.84, 1, t)) : 0;
        // The outgoing picture frosts as the fold crosses it; the incoming one
        // starts frosted and comes into focus as the turn settles.
        const sideA = tr ? p.blur * dpr * smooth(0.04, 0.5, t) : 0;
        const sideB = tr ? p.blur * dpr * smooth(0, 0.08, t) * (1 - smooth(0.18, 0.7, t)) : 0;
        const asp = (i: number) => {
          const ca = card.w / card.h;
          const ia = sizes[i]!.w / sizes[i]!.h;
          return ia > ca ? [ca / ia, 1] : [1, ia / ca];
        };
        gl.viewport(0, 0, W, H);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(U.uRes!, W, H);
        gl.uniform4f(U.uCard!, card.x, card.y, card.w, card.h);
        gl.uniform1f(U.uRadius!, p.radius * dpr);
        gl.uniform1f(U.uFold!, tr ? fold : -1e5 * dir);
        gl.uniform1f(U.uDir!, dir);
        gl.uniform1f(U.uAmpA!, ampA);
        gl.uniform1f(U.uAmpB!, ampB);
        gl.uniform1f(U.uFlare!, Math.max(0.0001, p.flare));
        gl.uniform1f(U.uGlass!, p.glass);
        gl.uniform1f(U.uFall!, card.w * 0.11);
        gl.uniform1f(U.uDpr!, dpr);
        gl.uniform1f(U.uSideA!, sideA);
        gl.uniform1f(U.uSideB!, sideB);
        gl.uniform1f(U.uNear!, p.blurNear);
        gl.uniform1f(U.uFar!, p.blurFar);
        gl.uniform1f(U.uNoise!, p.noise);
        gl.uniform1f(U.uThick!, p.thickness);
        gl.uniform1f(U.uTime!, (performance.now() / 1000) % 100);
        const [ax, ay] = asp(from);
        const [bx, by] = asp(to);
        gl.uniform2f(U.uAspA!, ax!, ay!);
        gl.uniform2f(U.uAspB!, bx!, by!);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[from]!);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures[to]!);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      api.current = { draw };
      draw();
      const ro = new ResizeObserver(draw);
      ro.observe(box);
      return () => {
        alive = false;
        cancelAnimationFrame(raf.current);
        ro.disconnect();
        api.current = null;
        textures.forEach((t) => gl.deleteTexture(t));
        gl.deleteProgram(prog);
      };
    }, [images, aspect]);

    // Redraw when the look changes between turns.
    React.useEffect(() => {
      api.current?.draw();
    }, [flare, glass, blur, blurNear, blurFar, noise, thickness, radius]);

    // On its own: a turn every few seconds, unless held, hidden or off screen.
    React.useEffect(() => {
      if (!autoplay || still || hold || !inView || n < 2) return;
      const id = window.setInterval(() => {
        if (!document.hidden) next();
      }, Math.max(1, interval) * 1000 + Math.max(0.2, duration) * 1000);
      return () => window.clearInterval(id);
    }, [autoplay, still, hold, inView, n, interval, duration, next]);

    // Drag the fold by hand; a short press turns to the next picture.
    const drag = React.useRef<{ x: number; started: boolean } | null>(null);
    const onDown = (e: React.PointerEvent) => {
      if (e.button !== 0 || turn.current || n < 2) return;
      drag.current = { x: e.clientX, started: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onMove = (e: React.PointerEvent) => {
      const g = drag.current;
      if (!g) return;
      const dx = e.clientX - g.x;
      if (!g.started) {
        if (Math.abs(dx) < 6 || still || failed || !ready) return;
        g.started = true;
        const dir: 1 | -1 = dx > 0 ? 1 : -1;
        const from = current.current;
        turn.current = { from, to: (from + dir + n) % n, dir, t: 0 };
      }
      const tr = turn.current;
      if (!tr) return;
      const w = stage.current?.clientWidth ?? 1;
      tr.t = Math.min(1, Math.max(0, (dx * tr.dir) / (w * 0.9)));
      api.current?.draw();
    };
    const onUp = (e: React.PointerEvent) => {
      const g = drag.current;
      drag.current = null;
      if (!g) return;
      if (!g.started) {
        if (Math.abs(e.clientX - g.x) < 6) next();
        return;
      }
      const tr = turn.current;
      if (!tr) return;
      play(tr.t > 0.35 ? 1 : 0);
    };
    const onCancel = () => {
      const g = drag.current;
      drag.current = null;
      if (g?.started && turn.current) play(0);
    };

    const label = images[index]?.label;

    return (
      <motion.div
        ref={root}
        role="region"
        aria-roledescription="carousel"
        aria-label="Pictures"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            next();
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            prev();
          }
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHold(false)}
        onFocus={() => setHold(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setHold(false);
        }}
        initial={still ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={seen || still ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative w-[600px] max-w-full select-none rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-8",
          className,
        )}
      >
        <div
          ref={stage}
          className="relative w-full cursor-pointer touch-pan-y"
          style={{ aspectRatio: String(aspect) }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onCancel}
        >
          {/* Shown until the canvas is ready, and the whole show without WebGL. */}
          <AnimatePresence initial={false}>
            {(!ready || failed) && (
              <motion.img
                key={index}
                src={images[index]?.src}
                alt=""
                draggable={false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 size-full rounded-[inherit] object-cover shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)]"
                style={{ borderRadius: radius }}
              />
            )}
          </AnimatePresence>
          <canvas
            ref={canvas}
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              left: -PAD_X,
              width: `calc(100% + ${PAD_X * 2}px)`,
              top: `${-PAD_Y * 100}%`,
              height: `${(1 + PAD_Y * 2) * 100}%`,
              opacity: ready && !failed ? 1 : 0,
            }}
          />
          <span role="img" aria-label={images[index]?.alt} className="sr-only" />
        </div>

        {/* Caption and steppers. */}
        <div
          className="flex items-center justify-between gap-3 px-1"
          // Below the flare's reach (half the lift of the card height), plus a little air.
          style={{ marginTop: `calc(${(params.current.flare * 50) / aspect}% + 12px)` }}
        >
          <div className="flex min-w-0 items-baseline gap-2.5">
            <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-400">
              {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <span className="relative min-w-0 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={index}
                  initial={still ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={still ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="block truncate text-sm font-medium text-[#242423] dark:text-zinc-100"
                >
                  {label ?? images[index]?.alt}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {[
              { on: prev, label: "Previous picture", Icon: ChevronLeft },
              { on: next, label: "Next picture", Icon: ChevronRight },
            ].map(({ on, label: aria, Icon }) => (
              <motion.button
                key={aria}
                type="button"
                aria-label={aria}
                onClick={on}
                whileHover={still ? undefined : { scale: 1.06 }}
                whileTap={still ? undefined : { scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="grid size-9 cursor-pointer place-items-center rounded-full bg-[#242423]/[0.06] text-[#242423] outline-none transition-colors hover:bg-[#242423]/[0.1] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:text-zinc-100"
              >
                <Icon className="size-4" strokeWidth={2.25} />
              </motion.button>
            ))}
          </div>
        </div>
        <span role="status" aria-live="polite" className="sr-only">
          {`${images[index]?.alt ?? ""}, ${index + 1} of ${n}`}
        </span>
      </motion.div>
    );
  },
);