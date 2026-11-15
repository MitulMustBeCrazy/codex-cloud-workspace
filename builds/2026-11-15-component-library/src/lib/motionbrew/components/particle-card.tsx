"use client";

/**
 * ParticleCard, from https://motion-brew.com/components/particle-card
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { useAnimate, useAnimationFrame, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ParticleCard

/**
 * ParticleCard
 *
 * Trigger: hover (and in view). A product feature card whose hero visual is
 * made of particles: any SVG is sampled into a grid, and each cell is drawn as
 * a mono glyph, a solid block or a thin scan dash. Rings spread out from the
 * centre like a droplet on water and morph every region between those three
 * looks while the shape turns. On first view the particles fly in and assemble.
 * Move the cursor through it and the particles part like water, opening a clear
 * pool with a dense, softly rippling rim that flows after you; click to drop a
 * ripple that spreads outward. Reach sets the size of the pool and force how
 * strongly it parts, and a film grain can be dialed over the card. Pass your
 * own SVG (any filled or stroked shape) to make the pattern. The artwork is
 * decorative; the title, line and button stay real content. Reduced
 * motion draws a still, assembled frame.
 *
 * Engine: motion/react (useAnimationFrame runs the particle springs and wave;
 * everything is drawn to one canvas, so thousands of cells stay smooth).
 */

export type ParticleLook = "mixed" | "glyph" | "block" | "scan";

export interface ParticleCardProps {
  /** SVG markup for the artwork. Its filled and stroked areas become particles. Default a radiating starburst mark. */
  svg?: string;
  /** How cells are drawn: all three looks morphing (`"mixed"`), or one look only. Default `"mixed"`. */
  look?: ParticleLook;
  /** Card color. Default white. */
  background?: string;
  /** Particle color. Only the artwork uses it. Default ink. */
  color?: string;
  /** Title, line and button color. Default ink. */
  textColor?: string;
  /** Grid cell size, px. Smaller is finer. Default `6`. */
  cell?: number;
  /** How fast the shape turns, turns per minute. `0` holds it still. Default `1`. */
  spin?: number;
  /** How strongly the cursor parts the particles, 0 to 3. Above 1 the pool opens wider and the rim is pushed out harder. Default `0.75`. */
  force?: number;
  /** Radius of the pool the cursor opens, px. Default `130`. */
  reach?: number;
  /** Film grain over the card, 0 (none) to 1 (heavy). Default `0`. */
  grain?: number;
  /** Characters for the glyph look, densest first. Default `"01/>."`. */
  chars?: string;
  /** Feature title. */
  title?: string;
  /** One short line about the feature. */
  description?: string;
  /** Button label. Default `"Learn more"`. */
  cta?: string;
  /** Where the button goes. Without it the button calls `onOpen`. */
  href?: string;
  /** Called by the button when there is no `href`. */
  onOpen?: () => void;
  className?: string;
}

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#242423"><path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z"/></svg>`;

const MASK = 200;

/** Tileable noise for the film grain. */
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0 0.9 0"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

/** Make sure the SVG has an intrinsic size, so it rasterises the same in every browser. */
function sized(svg: string) {
  if (/<svg[^>]*\swidth=/i.test(svg)) return svg;
  const vb = svg.match(
    /viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i,
  );
  const w = vb ? parseFloat(vb[1]!) : 100;
  const h = vb ? parseFloat(vb[2]!) : 100;
  const k = 512 / Math.max(w, h);
  return svg.replace(
    /<svg/i,
    `<svg width="${Math.round(w * k)}" height="${Math.round(h * k)}"`,
  );
}

/** Rasterise the SVG (as an image, so scripts in it never run) into a coverage mask and a soft halo. */
function loadMask(
  svg: string,
): Promise<{ cover: Float32Array; halo: Float32Array }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(
      new Blob([sized(svg)], { type: "image/svg+xml" }),
    );
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = MASK;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      const w = img.naturalWidth || 512;
      const h = img.naturalHeight || 512;
      const k = (MASK * 0.92) / Math.max(w, h);
      ctx.drawImage(img, (MASK - w * k) / 2, (MASK - h * k) / 2, w * k, h * k);
      URL.revokeObjectURL(url);
      const data = ctx.getImageData(0, 0, MASK, MASK).data;
      const cover = new Float32Array(MASK * MASK);
      for (let i = 0; i < cover.length; i++) cover[i] = data[i * 4 + 3]! / 255;
      // Halo: a wide box blur of the coverage, used for trails and soft edges just outside the shape.
      let halo = cover.slice();
      const tmp = new Float32Array(cover.length);
      const R = 7;
      for (let pass = 0; pass < 2; pass++) {
        for (let y = 0; y < MASK; y++)
          for (let x = 0; x < MASK; x++) {
            let sum = 0;
            for (let d = -R; d <= R; d++)
              sum += halo[y * MASK + Math.min(MASK - 1, Math.max(0, x + d))]!;
            tmp[y * MASK + x] = sum / (2 * R + 1);
          }
        for (let y = 0; y < MASK; y++)
          for (let x = 0; x < MASK; x++) {
            let sum = 0;
            for (let d = -R; d <= R; d++)
              sum += tmp[Math.min(MASK - 1, Math.max(0, y + d)) * MASK + x]!;
            halo[y * MASK + x] = sum / (2 * R + 1);
          }
      }
      resolve({ cover, halo });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that SVG"));
    };
    img.src = url;
  });
}

export const ParticleCard = React.forwardRef<HTMLDivElement, ParticleCardProps>(
  function ParticleCard(
    {
      svg,
      look = "mixed",
      background = "#ffffff",
      color = "#242423",
      textColor = "#242423",
      cell = 6,
      spin = 1,
      force = 0.75,
      reach = 130,
      grain = 0,
      chars = "01/>.",
      title = "Shapes that move like water",
      description = "Drop in any SVG and watch it flow.",
      cta = "Learn more",
      href,
      onOpen,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const field = React.useRef<HTMLDivElement>(null);
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const mask = React.useRef<{
      cover: Float32Array;
      halo: Float32Array;
    } | null>(null);
    const [size, setSize] = React.useState({ w: 0, h: 0 });
    const sim = React.useRef({
      cols: 0,
      rows: 0,
      dx: new Float32Array(0),
      dy: new Float32Array(0),
      vx: new Float32Array(0),
      vy: new Float32Array(0),
      seed: new Float32Array(0),
      cov: new Float32Array(0),
      halo: new Float32Array(0),
      time: 0,
      introAt: -1,
      visible: true,
      pointer: { x: 0, y: 0, sx: 0, sy: 0, amount: 0, active: false },
      ripples: [] as { x: number; y: number; t: number }[],
      drawn: false,
    });
    const [arrow, animateArrow] = useAnimate<HTMLSpanElement>();
    const settings = React.useRef({
      look,
      color,
      cell,
      spin,
      force,
      reach,
      chars,
      still,
    });
    settings.current = { look, color, cell, spin, force, reach, chars, still };

    // Load the artwork; fall back to the default if the SVG cannot be read.
    React.useEffect(() => {
      let alive = true;
      loadMask(svg || DEFAULT_SVG)
        .catch(() => loadMask(DEFAULT_SVG))
        .then((m) => {
          if (!alive) return;
          mask.current = m;
          sim.current.drawn = false;
        });
      return () => {
        alive = false;
      };
    }, [svg]);

    React.useLayoutEffect(() => {
      const el = field.current;
      if (!el) return;
      const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      const io = new IntersectionObserver(([e]) => {
        sim.current.visible = !!e?.isIntersecting;
        if (e?.isIntersecting && sim.current.introAt < 0)
          sim.current.introAt = sim.current.time;
      });
      io.observe(el);
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }, []);

    // (Re)build the particle grid when the size or cell changes; particles start scattered for the intro.
    React.useEffect(() => {
      const c = canvas.current;
      if (!c || !size.w) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(size.w * dpr);
      c.height = Math.round(size.h * dpr);
      const s = sim.current;
      s.cols = Math.floor(size.w / cell);
      s.rows = Math.floor(size.h / cell);
      const n = s.cols * s.rows;
      s.dx = new Float32Array(n);
      s.dy = new Float32Array(n);
      s.vx = new Float32Array(n);
      s.vy = new Float32Array(n);
      s.cov = new Float32Array(n);
      s.halo = new Float32Array(n);
      s.seed = new Float32Array(n).map(() => Math.random());
      if (!still) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = (0.4 + Math.random() * 0.8) * Math.max(size.w, size.h);
          s.dx[i] = Math.cos(a) * r;
          s.dy[i] = Math.sin(a) * r;
        }
      }
      s.drawn = false;
    }, [size, cell, still]);

    useAnimationFrame((_, delta) => {
      const s = sim.current;
      const m = mask.current;
      const c = canvas.current;
      const set = settings.current;
      if (!c || !m || !s.cols || !s.visible) return;
      if (set.still && s.drawn) return;
      const dt = Math.min(delta, 50) / 1000;
      s.time += dt;
      if (s.introAt < 0) return;

      const { cols, rows, cov } = s;
      const W = size.w;
      const H = size.h;
      const cs = W / cols;
      const rs = H / rows;
      const cx = W / 2;
      const cy = H / 2;
      const S = Math.min(W, H) * 0.92;
      const theta = set.still ? 0 : (s.time * set.spin * Math.PI * 2) / 60;
      const cos = Math.cos(-theta);
      const sin = Math.sin(-theta);

      // Coverage and halo per cell, sampled from the turning mask.
      const halo = s.halo;
      for (let r = 0; r < rows; r++)
        for (let q = 0; q < cols; q++) {
          const x = (q + 0.5) * cs - cx;
          const y = (r + 0.5) * rs - cy;
          const u = ((x * cos - y * sin) / S + 0.5) * MASK;
          const v = ((x * sin + y * cos) / S + 0.5) * MASK;
          const i = r * cols + q;
          if (u < 0 || v < 0 || u >= MASK || v >= MASK) {
            cov[i] = 0;
            halo[i] = 0;
            continue;
          }
          const k = (v | 0) * MASK + (u | 0);
          cov[i] = m.cover[k]!;
          halo[i] = m.halo[k]!;
        }

      // Fluid field: every particle springs toward a target offset. The cursor parts the particles into a
      // clear pool with a dense, softly lobed rim, and clicks send droplet ripples outward.
      const p = s.pointer;
      // Fields added after a hot reload may be missing from the kept state; fill them in.
      s.ripples ??= [];
      if (p.amount === undefined)
        Object.assign(p, { sx: p.x, sy: p.y, amount: 0 });
      const reach = Math.max(10, set.reach);
      const intro = s.time - s.introAt;
      // The cursor glides rather than snaps, and its influence fades in and out, so the pool flows like water.
      const follow = 1 - Math.exp(-dt * 14);
      p.sx += (p.x - p.sx) * follow;
      p.sy += (p.y - p.sy) * follow;
      p.amount +=
        ((p.active && !set.still ? 1 : 0) - p.amount) * (1 - Math.exp(-dt * 6));
      s.ripples = s.ripples.filter((w) => s.time - w.t < 2.6);
      for (let r = 0; r < rows; r++)
        for (let q = 0; q < cols; q++) {
          const i = r * cols + q;
          if (
            halo[i]! < 0.02 &&
            Math.abs(s.dx[i]!) < 0.5 &&
            Math.abs(s.dy[i]!) < 0.5
          )
            continue;
          const hx = (q + 0.5) * cs;
          const hy = (r + 0.5) * rs;
          // Intro: particles near the centre start first, so the shape assembles outward.
          const wait =
            (Math.hypot(hx - cx, hy - cy) / Math.hypot(cx, cy)) * 0.7;
          if (intro < wait) continue;
          let tx = 0;
          let ty = 0;
          if (p.amount > 0.001) {
            const ex = hx - p.sx;
            const ey = hy - p.sy;
            const d = Math.hypot(ex, ey);
            if (d < reach && d > 0.01) {
              // Lobes that slowly flow around the rim, like a disturbed surface.
              const a = Math.atan2(ey, ex);
              const lobe =
                1 +
                0.16 * Math.sin(a * 6 + s.time * 1.8) +
                0.08 * Math.sin(a * 11 - s.time * 2.6);
              const push =
                (1 - d / reach) ** 1.5 *
                reach *
                0.9 *
                set.force *
                lobe *
                p.amount;
              tx += (ex / d) * push;
              ty += (ey / d) * push;
            }
          }
          for (const w of s.ripples) {
            // A ring travelling outward, fading as it goes.
            const ex = hx - w.x;
            const ey = hy - w.y;
            const d = Math.hypot(ex, ey) || 1;
            const age = s.time - w.t;
            const front = age * reach * 3.2;
            const band = (d - front) / (reach * 0.28);
            const lift =
              Math.exp(-band * band) *
              reach *
              0.32 *
              set.force *
              Math.exp(-age * 1.6);
            tx += (ex / d) * lift;
            ty += (ey / d) * lift;
          }
          // Slightly underdamped, so particles overshoot a touch and settle like liquid.
          const ax = 130 * (tx - s.dx[i]!) - 15 * s.vx[i]!;
          const ay = 130 * (ty - s.dy[i]!) - 15 * s.vy[i]!;
          s.vx[i] = s.vx[i]! + ax * dt;
          s.vy[i] = s.vy[i]! + ay * dt;
          s.dx[i] = s.dx[i]! + s.vx[i]! * dt;
          s.dy[i] = s.dy[i]! + s.vy[i]! * dt;
        }

      // Draw.
      const ctx = c.getContext("2d")!;
      const dpr = c.width / W;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = set.color;
      ctx.font = `500 ${Math.round((cs * 1.15) / 2) * 2}px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const glyphs = set.chars || "01/>.";
      const dense = glyphs.slice(0, Math.max(1, glyphs.length - 3));
      const edge = glyphs.slice(-3, -1) || glyphs;
      const faint = glyphs.slice(-1);
      // The wave that morphs looks: rings that spread out from the centre, like a droplet on water.
      const lambda = Math.min(W, H) * 0.075;
      const flick = Math.floor(s.time * 7);

      for (let r = 0; r < rows; r++)
        for (let q = 0; q < cols; q++) {
          const i = r * cols + q;
          const cv = cov[i]!;
          const hl = halo[i]!;
          if (cv < 0.12 && hl < 0.12) continue;
          const x = (q + 0.5) * cs + s.dx[i]!;
          const y = (r + 0.5) * rs + s.dy[i]!;
          let mode: "glyph" | "block" | "scan";
          if (set.look !== "mixed") mode = set.look;
          else {
            const w = Math.sin(
              Math.hypot((q + 0.5) * cs - cx, (r + 0.5) * rs - cy) / lambda -
                s.time * 1.6,
            );
            mode = w > 0.3 ? "block" : w < -0.3 ? "glyph" : "scan";
          }
          // Speed of a scattered particle fades it a little, so bursts read as motion.
          const sp = Math.hypot(s.vx[i]!, s.vy[i]!);
          ctx.globalAlpha = Math.max(0.35, 1 - sp / 2400);

          if (mode === "block") {
            if (cv >= 0.5)
              ctx.fillRect(
                x - cs / 2 + 0.75,
                y - rs / 2 + 0.75,
                cs - 1.5,
                rs - 1.5,
              );
            else if (cv >= 0.25)
              ctx.fillRect(
                x - cs / 2 + 0.75,
                y + rs * 0.1,
                cs - 1.5,
                rs * 0.28,
              );
          } else if (mode === "scan") {
            if (cv >= 0.25) {
              const len = cs * (0.55 + 0.45 * cv);
              ctx.fillRect(
                x - len / 2,
                y + rs * 0.22,
                len,
                Math.max(1.2, rs * 0.16),
              );
            } else if (hl >= 0.2 && s.seed[i]! > 0.45) {
              // Trails just outside the shape.
              ctx.globalAlpha *= 0.65;
              ctx.fillRect(
                x - cs * 0.45,
                y + rs * 0.22,
                cs * 0.9,
                Math.max(1, rs * 0.12),
              );
            }
          } else {
            let ch = "";
            // A few glyphs flicker to a neighbour character now and then.
            const pick = (pool: string) =>
              pool[
                Math.floor(
                  (s.seed[i]! * 97 + (s.seed[i]! > 0.93 ? flick : 0)) %
                    pool.length,
                )
              ]!;
            if (cv >= 0.85) ch = pick(dense);
            else if (cv >= 0.4) {
              // Edges lean with the outline: compare coverage left and right, above and below.
              const gx = (cov[i + 1] ?? 0) - (cov[i - 1] ?? 0);
              const gy = (cov[i + cols] ?? 0) - (cov[i - cols] ?? 0);
              ch =
                Math.abs(gx) > Math.abs(gy) ? edge[edge.length - 1]! : edge[0]!;
            } else if (cv >= 0.12) ch = faint;
            if (ch) ctx.fillText(ch, x, y);
          }
        }
      ctx.globalAlpha = 1;
      s.drawn = true;
    });

    const local = (e: React.PointerEvent) => {
      const r = field.current!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const Cta = href ? "a" : "button";
    // Click: the arrow shoots off to the right with a little motion blur and swoops back in from the left.
    const launch = () => {
      if (still || !arrow.current) return;
      animateArrow(
        arrow.current,
        {
          x: ["0%", "160%", "-160%", "0%"],
          filter: ["blur(0px)", "blur(2px)", "blur(2px)", "blur(0px)"],
        },
        {
          duration: 0.55,
          times: [0, 0.38, 0.39, 1],
          ease: ["easeIn", "linear", [0.22, 1, 0.36, 1]],
        },
      );
    };
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-[380px] max-w-full overflow-hidden rounded-3xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]",
          className,
        )}
        style={{ background, color: textColor }}
      >
        {/* Hero visual: the particle field sits straight on the card, one color throughout. */}
        <div
          ref={field}
          aria-hidden
          className="relative -mx-2 -mt-1 h-[324px] cursor-crosshair touch-none"
          onPointerEnter={(e) => {
            const { x, y } = local(e);
            Object.assign(sim.current.pointer, { x, y, sx: x, sy: y });
          }}
          onPointerMove={(e) =>
            Object.assign(sim.current.pointer, local(e), { active: true })
          }
          onPointerLeave={() => (sim.current.pointer.active = false)}
          onPointerDown={(e) => {
            // A droplet: a ripple ring spreads out from the press.
            if (still) return;
            const s = sim.current;
            s.ripples.push({ ...local(e), t: s.time });
          }}
        >
          <canvas ref={canvas} className="absolute inset-0 size-full" />
        </div>

        <h3 className="mt-3 px-1 text-center text-lg font-semibold leading-snug tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-1 px-1 text-center text-sm opacity-60">
            {description}
          </p>
        )}
        <Cta
          {...(href
            ? { href, onClick: launch }
            : {
                type: "button" as const,
                onClick: () => (launch(), onOpen?.()),
              })}
          className="group mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-medium outline-none transition-[background-color,transform] duration-200 bg-[var(--ghost)] hover:bg-[var(--ghost-hover)] focus-visible:ring-2 focus-visible:ring-zinc-400 active:scale-[0.98] active:bg-[var(--ghost-press)]"
          style={
            {
              color: textColor,
              "--ghost": `color-mix(in srgb, ${textColor} 6%, transparent)`,
              "--ghost-hover": `color-mix(in srgb, ${textColor} 9%, transparent)`,
              "--ghost-press": `color-mix(in srgb, ${textColor} 13%, transparent)`,
            } as React.CSSProperties
          }
        >
          <span className="transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-0.5">
            {cta}
          </span>
          {/* Hover: the arrow slides out to the right while a fresh one slides in from the left. */}
          <span aria-hidden className="relative size-4 overflow-hidden">
            <span ref={arrow} className="absolute inset-0">
              <ArrowRight
                className="absolute inset-0 size-4 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[140%]"
                strokeWidth={2.25}
              />
              <ArrowRight
                className="absolute inset-0 size-4 -translate-x-[140%] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:delay-75"
                strokeWidth={2.25}
              />
            </span>
          </span>
        </Cta>

        {/* Film grain over the whole card, particles included. */}
        {grain > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: GRAIN,
              backgroundSize: "180px 180px",
              opacity: Math.min(1, grain) * 0.55,
            }}
          />
        )}
      </div>
    );
  },
);