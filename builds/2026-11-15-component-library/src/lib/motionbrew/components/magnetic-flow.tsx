"use client";

/**
 * MagneticFlow, from https://motion-brew.com/components/magnetic-flow
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// MagneticFlow

/**
 * MagneticFlow
 *
 * Trigger: hover, then press. A stack of cards travels as a chain: the front
 * card follows the pointer and every card behind it chases the one ahead, so
 * the stack slithers like a snake and tilts with its speed. With no pointer the
 * stack floats gently at the center. Click (or Enter / Space) and the cards burst
 * open around the center like rays of a sun; click again, or wait, and they
 * fold back into the stack and flow on. Reduced motion keeps a still stack and
 * a plain burst.
 *
 * Engine: gsap + @gsap/react (a gsap.ticker loop with quickSetter for the chase,
 * staggered elastic tweens for the burst, all scoped with useGSAP).
 */

gsap.registerPlugin(useGSAP);

export interface MagneticFlowProps {
  /** Card faces, back to front. The last one leads. Default eight graphic cards. */
  cards?: React.ReactNode[];
  /** Card edge length in px. Default `140`. */
  cardSize?: number;
  /** How tightly each card chases the one ahead, 0 to 1. Higher is snappier. Default `0.16`. */
  follow?: number;
  /** Stack offset between cards at rest, in px. Default `7`. */
  spacing?: number;
  /** Distance of the burst rays from the center, in px. Shrinks to fit. Default `150`. */
  burstRadius?: number;
  /** Fold back this many ms after a burst. `null` waits for a click. Default `2400`. */
  burstHold?: number | null;
  /** Float gently around the center when no pointer is over it. Default `true`. */
  autoplay?: boolean;
  /** Called when the cards burst open. */
  onBurst?: () => void;
  className?: string;
}

const face = "relative h-full w-full overflow-hidden";
const BARS = [55, 30, 70, 42, 85, 38, 64, 48, 76];
const PIXELS = Array.from({ length: 42 }, (_, i) => ((i * 37 + 11) % 10) / 10);

/** Built-in card art: CSS only, sized with container units so it scales with `cardSize`. */
const DEFAULT_CARDS: React.ReactNode[] = [
  <div key="flow" className={cn(face, "bg-[#d4392e] p-[9cqw] text-white")}>
    <p className="text-[11cqw] font-medium uppercase tracking-[0.2em] opacity-80">magnetic</p>
    <p className="absolute bottom-[6cqw] left-[7cqw] text-[38cqw] font-black leading-[0.8] tracking-tighter">FLOW</p>
  </div>,
  <div key="rings" className={cn(face, "grid place-items-center bg-[#ec9a74]")}>
    <div className="size-[72cqw] rounded-full bg-[repeating-radial-gradient(circle,#1b1b1b_0_2.6cqw,transparent_2.6cqw_6.4cqw)]" />
  </div>,
  <div key="bars" className={cn(face, "flex items-end justify-center gap-[3.2cqw] bg-[#f2c94c] pb-[14cqw]")}>
    {BARS.map((h, i) => (
      <span key={i} className="w-[5.5cqw] rounded-full bg-[#141414]" style={{ height: `${h * 0.62}cqw` }} />
    ))}
  </div>,
  <div key="pixels" className={cn(face, "grid place-items-center bg-[#3563e9]")}>
    <div className="grid grid-cols-7 gap-[2.4cqw]">
      {PIXELS.map((o, i) => (
        <span key={i} className="size-[6.5cqw] rounded-[1cqw] bg-white" style={{ opacity: 0.18 + o * 0.6 }} />
      ))}
    </div>
  </div>,
  <div key="loading" className={cn(face, "flex flex-col justify-between bg-[#8fd6c7] p-[9cqw] text-[#141414]")}>
    <p className="text-[10cqw] font-bold tracking-[0.3em]">× ○ △</p>
    <div>
      <p className="text-[13cqw] font-extrabold tracking-tight">Loading</p>
      <div className="mt-[4cqw] h-[3cqw] rounded-full bg-black/15">
        <div className="h-full w-[36%] rounded-full bg-[#141414]" />
      </div>
    </div>
  </div>,
  <div key="ring" className={cn(face, "grid place-items-center bg-[#1e1f23]")}>
    <div className="size-[62cqw] rounded-full bg-[conic-gradient(from_200deg,#f4f4f5,#71717a,#e4e4e7,#52525b,#f4f4f5)] p-[11cqw]">
      <div className="size-full rounded-full bg-[#1e1f23]" />
    </div>
  </div>,
  <div
    key="sun"
    className={cn(face, "bg-[#e8643b] bg-[radial-gradient(circle_at_50%_78%,#ffe2b3_0%,#ffad6b_22%,transparent_58%)]")}
  >
    <div className="absolute inset-x-0 bottom-[20cqw] h-px bg-white/40" />
  </div>,
  <div key="words" className={cn(face, "bg-[#e4e7ec] p-[8cqw] text-[#111]")}>
    <p className="text-[18cqw] font-black uppercase leading-[0.88] tracking-tight">
      Move
      <br />
      with
      <br />
      the
      <br />
      flow
    </p>
  </div>,
];

export const MagneticFlow = React.forwardRef<HTMLDivElement, MagneticFlowProps>(function MagneticFlow(
  {
    cards = DEFAULT_CARDS,
    cardSize = 140,
    follow = 0.16,
    spacing = 7,
    burstRadius = 150,
    burstHold = 2400,
    autoplay = true,
    onBurst,
    className,
  },
  forwardedRef,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  // Mutable motion state lives in refs so the ticker never triggers renders.
  const mode = React.useRef<"flow" | "burst" | "busy">("flow");
  const pointer = React.useRef<{ x: number; y: number } | null>(null);
  const pos = React.useRef<{ x: number; y: number; r: number }[]>([]);
  const holdTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [burst, setBurst] = React.useState(false);

  /** Cards front to back, so index 0 leads. */
  const chain = () => gsap.utils.toArray<HTMLElement>("[data-card]", root.current).reverse();
  const center = () => {
    const el = root.current!;
    return { x: el.clientWidth / 2, y: el.clientHeight / 2 };
  };

  const { contextSafe } = useGSAP(
    () => {
      const els = chain();
      const c = center();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      pos.current = els.map((_, i) => ({ x: c.x - i * spacing, y: c.y - i * spacing, r: 0 }));
      gsap.set(els, { xPercent: -50, yPercent: -50, x: (i) => pos.current[i]!.x, y: (i) => pos.current[i]!.y });
      if (reduce) return;

      const setX = els.map((el) => gsap.quickSetter(el, "x", "px"));
      const setY = els.map((el) => gsap.quickSetter(el, "y", "px"));
      const setR = els.map((el) => gsap.quickSetter(el, "rotation", "deg"));

      const tick = (time: number, delta: number) => {
        if (mode.current !== "flow") return;
        const el = root.current;
        if (!el) return;
        const w = el.clientWidth;
        const h = el.clientHeight;
        // Leader target: the pointer, or a small float around the center. The chase
        // still runs, so the trail ripples behind the leader and shows the pull.
        const target =
          pointer.current ??
          (autoplay
            ? { x: w / 2 + 14 * Math.sin(time * 0.9), y: h / 2 + 10 * Math.sin(time * 1.4 + 1) }
            : { x: w / 2, y: h / 2 });
        // Frame-rate independent easing.
        const k = 1 - Math.pow(1 - follow, delta / 16.67);
        pos.current.forEach((p, i) => {
          const ahead = i === 0 ? target : { x: pos.current[i - 1]!.x - spacing, y: pos.current[i - 1]!.y - spacing };
          const ease = i === 0 ? Math.min(1, k * 1.5) : k;
          const vx = (ahead.x - p.x) * ease;
          p.x += vx;
          p.y += (ahead.y - p.y) * ease;
          // Lean into the direction of travel, settling when still.
          p.r += (gsap.utils.clamp(-16, 16, vx * 1.6) - p.r) * 0.12;
          setX[i]!(p.x);
          setY[i]!(p.y);
          setR[i]!(p.r);
        });
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root, dependencies: [cards.length, follow, spacing, autoplay] },
  );

  React.useEffect(() => () => void (holdTimer.current && clearTimeout(holdTimer.current)), []);

  const fold = contextSafe(() => {
    if (mode.current !== "burst") return;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    mode.current = "busy";
    setBurst(false);
    const els = chain();
    const c = center();
    gsap.to(els, {
      x: (i) => c.x - i * spacing,
      y: (i) => c.y - i * spacing,
      rotation: 0,
      scale: 1,
      duration: 0.7,
      ease: "power3.inOut",
      stagger: { each: 0.03, from: "end" },
      onComplete: () => {
        // Hand the settled positions back to the chase loop.
        pos.current = els.map((el) => ({
          x: gsap.getProperty(el, "x") as number,
          y: gsap.getProperty(el, "y") as number,
          r: 0,
        }));
        mode.current = "flow";
      },
    });
  });

  const open = contextSafe(() => {
    if (mode.current !== "flow") return;
    mode.current = "busy";
    setBurst(true);
    onBurst?.();
    const els = chain();
    const el = root.current!;
    const c = center();
    const scale = 0.82;
    const fit = (Math.min(el.clientWidth, el.clientHeight) - cardSize * scale * 1.2) / 2;
    const radius = Math.max(cardSize * 0.4, Math.min(burstRadius, fit));
    const step = 360 / els.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap
      .timeline({
        onComplete: () => {
          mode.current = "burst";
          if (burstHold !== null) holdTimer.current = setTimeout(fold, burstHold);
        },
      })
      // Gather at the center first, a quick inhale before the burst.
      .to(els, {
        x: c.x,
        y: c.y,
        rotation: 0,
        scale: 0.9,
        duration: reduce ? 0 : 0.35,
        ease: "power2.in",
        stagger: { each: 0.015, from: "end" },
      })
      // Rays: each card points away from the center at its own angle.
      .to(els, {
        x: (i) => c.x + Math.cos(((i * step - 90) * Math.PI) / 180) * radius,
        y: (i) => c.y + Math.sin(((i * step - 90) * Math.PI) / 180) * radius,
        rotation: (i) => i * step,
        scale,
        duration: reduce ? 0 : 1.1,
        ease: "elastic.out(1, 0.65)",
        stagger: 0.035,
      });
  });

  const toggle = () => (mode.current === "burst" ? fold() : open());

  return (
    <div
      ref={root}
      role="button"
      tabIndex={0}
      aria-pressed={burst}
      aria-label={burst ? "Fold the cards back" : "Burst the cards open"}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onPointerLeave={() => (pointer.current = null)}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className={cn(
        "relative h-[440px] w-[400px] max-w-full cursor-pointer touch-none select-none overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
        className,
      )}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          data-card
          aria-hidden
          className="@container absolute left-0 top-0 overflow-hidden rounded-[11%] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] will-change-transform"
          style={{ width: cardSize, height: cardSize }}
        >
          {card}
        </div>
      ))}
    </div>
  );
});