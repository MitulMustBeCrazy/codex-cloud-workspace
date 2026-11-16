"use client";

/**
 * ContourLines, from https://motion-brew.com/components/contour-lines
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

// ContourLines

/**
 * ContourLines
 *
 * Trigger: hover and press (plus in view). A background of live topographic
 * contour lines. Drifting noise is traced into contour lines with marching
 * squares, every fourth line a little heavier like the index lines on a real
 * map. The pointer raises a soft hill, so the lines bend and crowd around it
 * and light up near it; a press sends a ring of a wave out through the
 * terrain, and while the pointer is away one rises on its own now and then.
 * On the way in the lines spread out from the centre. Put anything on top as
 * children. Reduced motion draws a single still frame.
 *
 * Engine: canvas 2D on one requestAnimationFrame loop that pauses off screen,
 * with motion/react's useInView for the entrance.
 */

export interface ContourLinesProps {
  /** Line colour. Default `"#242423"`. */
  color?: string;
  /** How many contour levels to trace; more means tighter lines. Default `14`. */
  lines?: number;
  /** Size of the hills and valleys; higher zooms out. Default `1`. */
  scale?: number;
  /** Drift speed; `2` is twice as fast. Default `1`. */
  speed?: number;
  /** How high the pointer's hill rises. Default `1`. */
  lift?: number;
  /** Raise a hill under the pointer and send waves on press. Default `true`. */
  interactive?: boolean;
  /** Content laid over the lines. */
  children?: React.ReactNode;
  className?: string;
}

const REVEAL = 1.5; // seconds for the lines to spread across the card
const CELL = 10; // px per marching squares cell

const hash = (x: number, y: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const noise = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};

interface Wave {
  x: number;
  y: number;
  t: number;
}

function ContourField({
  color,
  lines,
  scale,
  speed,
  lift,
  still,
  pointer,
  waves,
  reveal,
}: {
  color: string;
  lines: number;
  scale: number;
  speed: number;
  lift: number;
  still: boolean;
  pointer: React.MutableRefObject<{ x: number; y: number; on: boolean }>;
  waves: React.MutableRefObject<Wave[]>;
  /** When the entrance began on the field's clock: -1 not yet, -2 on the next frame. */
  reveal: React.MutableRefObject<number>;
}) {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let time = 0;
    let idle = 0;
    const glow = { x: 0, y: 0, a: 0 };

    const size = () => {
      // Layout size, not the on-screen box: the card scales in on entry.
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      field = new Float32Array(cols * rows);
    };

    // Height of the terrain at a point: drifting noise, the pointer's hill and any waves.
    const sample = () => {
      const t = time * speed;
      const z = 0.0045 / scale;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * CELL;
          const y = j * CELL;
          let v =
            noise(x * z + t * 0.04, y * z - t * 0.025) * 0.65 +
            noise(x * z * 2.2 - t * 0.03, y * z * 2.2 + 3.1) * 0.35;
          if (glow.a > 0.01) {
            const dx = x - glow.x;
            const dy = y - glow.y;
            v +=
              glow.a *
              0.28 *
              lift *
              Math.exp(-(dx * dx + dy * dy) / (2 * 70 * 70));
          }
          for (const wv of waves.current) {
            const age = time - wv.t;
            const d = Math.hypot(x - wv.x, y - wv.y) - age * 220;
            v +=
              0.12 *
              Math.max(0, 1 - age / 1.8) *
              Math.exp(-(d * d) / (2 * 22 * 22));
          }
          field[j * cols + i] = v;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const start = reveal.current;
      const pr = still
        ? 1
        : start === -1 || start === -2
          ? 0
          : Math.min(1, (time - start) / REVEAL);
      if (pr === 0) return;
      sample();

      const step = 1 / (lines + 1);
      const path = new Path2D();
      const major = new Path2D();
      const at = (i: number, j: number) => field[j * cols + i]!;
      for (let l = 1; l <= lines; l++) {
        // Levels spread over the band the terrain actually spans, so every line shows.
        const lv = 0.14 + l * step * 0.78;
        const p = l % 4 === 0 ? major : path;
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = at(i, j);
            const b = at(i + 1, j);
            const c = at(i + 1, j + 1);
            const d = at(i, j + 1);
            const k =
              (a > lv ? 8 : 0) |
              (b > lv ? 4 : 0) |
              (c > lv ? 2 : 0) |
              (d > lv ? 1 : 0);
            if (k === 0 || k === 15) continue;
            const x = i * CELL;
            const y = j * CELL;
            // Edge crossings, interpolated.
            const top = () => [x + ((lv - a) / (b - a)) * CELL, y] as const;
            const right = () =>
              [x + CELL, y + ((lv - b) / (c - b)) * CELL] as const;
            const bottom = () =>
              [x + ((lv - d) / (c - d)) * CELL, y + CELL] as const;
            const left = () => [x, y + ((lv - a) / (d - a)) * CELL] as const;
            const seg = (
              p1: readonly [number, number],
              p2: readonly [number, number],
            ) => {
              p.moveTo(p1[0], p1[1]);
              p.lineTo(p2[0], p2[1]);
            };
            switch (k) {
              case 1:
              case 14:
                seg(left(), bottom());
                break;
              case 2:
              case 13:
                seg(bottom(), right());
                break;
              case 3:
              case 12:
                seg(left(), right());
                break;
              case 4:
              case 11:
                seg(top(), right());
                break;
              case 5:
                seg(left(), top());
                seg(bottom(), right());
                break;
              case 6:
              case 9:
                seg(top(), bottom());
                break;
              case 7:
              case 8:
                seg(left(), top());
                break;
              case 10:
                seg(left(), bottom());
                seg(top(), right());
                break;
            }
          }
        }
      }

      // The entrance: lines spread out from the centre.
      ctx.save();
      if (pr < 1) {
        const e = 1 - Math.pow(1 - pr, 3);
        const reach = (Math.hypot(w, h) / 2 + 40) * e;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, Math.max(0.1, reach), 0, Math.PI * 2);
        ctx.clip();
      }
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 1;
      ctx.stroke(path);
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1.4;
      ctx.stroke(major);
      // Lines near the pointer light up.
      if (glow.a > 0.01) {
        const g = ctx.createRadialGradient(
          glow.x,
          glow.y,
          0,
          glow.x,
          glow.y,
          150,
        );
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.strokeStyle = g;
        ctx.globalAlpha = 0.6 * glow.a;
        ctx.lineWidth = 1.2;
        ctx.stroke(path);
        ctx.stroke(major);
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // The first frame's timestamp can predate `last`; never let the clock run backwards.
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!visible) return;
      time += dt;
      if (reveal.current === -2) reveal.current = time;
      const p = pointer.current;
      const k = 1 - Math.pow(0.002, dt);
      glow.x += (p.x - glow.x) * k;
      glow.y += (p.y - glow.y) * k;
      glow.a += ((p.on ? 1 : 0) - glow.a) * (1 - Math.pow(0.03, dt));
      idle = p.on ? 0 : idle + dt;
      if (idle > 3.6) {
        idle = 0;
        waves.current.push({
          x: w * (0.15 + Math.random() * 0.7),
          y: h * (0.15 + Math.random() * 0.5),
          t: time,
        });
      }
      waves.current = waves.current
        .map((wv) => (wv.t < 0 ? { ...wv, t: time } : wv))
        .filter((wv) => time - wv.t < 1.8);
      draw();
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      if (still) draw();
    });
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => void (visible = !!e?.isIntersecting),
    );
    io.observe(el);
    if (still) {
      time = 4;
      draw();
    } else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [color, lines, scale, speed, lift, still, pointer, waves, reveal]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}

export const ContourLines = React.forwardRef<HTMLDivElement, ContourLinesProps>(
  function ContourLines(
    {
      color = "#242423",
      lines = 14,
      scale = 1,
      speed = 1,
      lift = 1,
      interactive = true,
      children,
      className,
    },
    ref,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => root.current!);
    const still = !!useReducedMotion();
    const inView = useInView(root, { once: true, amount: 0.2 });
    const pointer = React.useRef({ x: -999, y: -999, on: false });
    const waves = React.useRef<Wave[]>([]);
    const reveal = React.useRef(-1);
    React.useEffect(() => {
      if (inView || still) reveal.current = -2;
    }, [inView, still]);

    const local = (e: React.PointerEvent) => {
      const r = root.current!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    return (
      <div
        ref={root}
        onPointerMove={
          interactive
            ? (e) => void (pointer.current = { ...local(e), on: true })
            : undefined
        }
        onPointerLeave={
          interactive
            ? () => void (pointer.current = { ...pointer.current, on: false })
            : undefined
        }
        onPointerDown={
          // t < 0 marks it new; the field stamps it with its own clock.
          interactive
            ? (e) => void waves.current.push({ ...local(e), t: -1 })
            : undefined
        }
        className={cn(
          "relative isolate min-h-[320px] w-full overflow-hidden",
          className,
        )}
      >
        <ContourField
          color={color}
          lines={Math.max(4, Math.round(lines))}
          scale={Math.max(0.3, scale)}
          speed={speed}
          lift={lift}
          still={still}
          pointer={pointer}
          waves={waves}
          reveal={reveal}
        />
        {children}
      </div>
    );
  },
);