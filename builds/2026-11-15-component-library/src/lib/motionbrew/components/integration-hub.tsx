"use client";

/**
 * IntegrationHub, from https://motion-brew.com/components/integration-hub
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { BarChart3, Bell, Calendar, Cloud, CreditCard, Database, FileText, Folder, Globe, type LucideIcon, Mail, MessageSquare, Phone, ShoppingBag, Users } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// IntegrationHub

/**
 * IntegrationHub
 *
 * Trigger: hover (plus in view). A ring of app tiles wired into one hub in the
 * middle. When it scrolls into view the hub springs in out of a blur and
 * gives off a pulse, two faint rings open around it, then the curved wires
 * grow out from it one by one, clockwise, and each tile springs in from the
 * hub's side just as its wire reaches it. Then dots (one by default, or
 * packets with a fading trail) flow along every wire into the hub, which
 * pulses softly as they land. Hovering a tile or its wire (or focusing a
 * tile) lifts the tile, turns its wire solid ink, speeds up and enlarges its
 * dots, dims the rest and names the app in a pill under the hub. Reduced
 * motion skips the entrance and keeps the dots still.
 *
 * Engine: motion/react (springs for the hub and tiles, pathLength for the
 * wires) with one requestAnimationFrame loop that moves the packets along the
 * SVG paths and pauses off screen.
 */

export interface HubApp {
  /** App name, shown on hover and read to screen readers. */
  label: string;
  /** Icon inside the tile: a lucide icon or any node, like an `<img>` logo. */
  icon: LucideIcon | React.ReactNode;
}

export interface IntegrationHubProps {
  /** Apps around the ring, clockwise from the top. Default fourteen. */
  apps?: HubApp[];
  /** What sits in the hub. Default a small orbit mark. */
  hub?: React.ReactNode;
  /** Name of the hub, read to screen readers. Default `"Your workspace"`. */
  label?: string;
  /** Packet speed; `2` is twice as fast. Default `1`. */
  speed?: number;
  /** Dots in each packet, head included; `1` is a single dot. Default `1`. */
  trail?: number;
  className?: string;
}

const DEFAULT_APPS: HubApp[] = [
  { label: "Mail", icon: Mail },
  { label: "Calendar", icon: Calendar },
  { label: "Chat", icon: MessageSquare },
  { label: "Docs", icon: FileText },
  { label: "Database", icon: Database },
  { label: "Storage", icon: Cloud },
  { label: "Payments", icon: CreditCard },
  { label: "Store", icon: ShoppingBag },
  { label: "CRM", icon: Users },
  { label: "Analytics", icon: BarChart3 },
  { label: "Alerts", icon: Bell },
  { label: "Files", icon: Folder },
  { label: "Calls", icon: Phone },
  { label: "Web", icon: Globe },
];

// The stage is drawn at this size and scaled down to fit narrower containers.
const W = 640;
const H = 440;
const CX = W / 2;
const CY = H / 2;
const RX = 268;
const RY = 178;
const TILE = 56;
const HUB = 104;
const INK = "#242423";
const GLIDE = [0.22, 1, 0.36, 1] as const;
// The entrance, in seconds: the hub lands, then wires grow out one by one,
// clockwise, and each tile pops in as its wire reaches it.
const WIRE_AT = 0.4;
const WIRE_STEP = 0.05;
const WIRE_FOR = 0.5;
const tileAt = (i: number) => WIRE_AT + i * WIRE_STEP + WIRE_FOR * 0.8;

interface Wire {
  x: number;
  y: number;
  d: string;
}

/**
 * Each wire runs from the hub's nearest side out to its tile, so it draws
 * outward on the way in; packets travel it the other way, into the hub.
 */
function wires(count: number): Wire[] {
  return Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + ((i + 0.5) / count) * Math.PI * 2;
    const x = CX + RX * Math.cos(a);
    const y = CY + RY * Math.sin(a);
    const dx = x - CX;
    const dy = y - CY;
    const half = HUB / 2 - 6;
    let d: string;
    if (Math.abs(dx) / RX > (Math.abs(dy) / RY) * 0.8) {
      // Side tiles come in from the left or right.
      const s = Math.sign(dx);
      const ex = CX + s * half;
      const ey = CY + dy * 0.16;
      d = `M ${ex} ${ey} C ${CX + dx * 0.4} ${ey}, ${CX + dx * 0.45} ${y}, ${x} ${y}`;
    } else {
      // Top and bottom tiles come in from above or below.
      const s = Math.sign(dy);
      const ex = CX + dx * 0.2;
      const ey = CY + s * half;
      d = `M ${ex} ${ey} C ${ex} ${CY + dy * 0.5}, ${x} ${CY + dy * 0.45}, ${x} ${y}`;
    }
    return { x, y, d };
  });
}

function AppIcon({ icon }: { icon: HubApp["icon"] }) {
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon && "render" in icon)
  ) {
    const I = icon as LucideIcon;
    return <I aria-hidden className="size-6" strokeWidth={1.75} />;
  }
  return <>{icon}</>;
}

/** The default hub mark: a dot with a ring and a small satellite going round it. */
function OrbitMark({ still }: { still: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="size-10" aria-hidden>
      <circle cx="20" cy="20" r="5" fill={INK} />
      <circle
        cx="20"
        cy="20"
        r="13"
        fill="none"
        stroke={INK}
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <motion.g
        style={{ originX: "20px", originY: "20px" }}
        animate={still ? undefined : { rotate: 360 }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      >
        <circle cx="33" cy="20" r="3" fill={INK} />
      </motion.g>
    </svg>
  );
}

export const IntegrationHub = React.forwardRef<
  HTMLDivElement,
  IntegrationHubProps
>(function IntegrationHub(
  {
    apps = DEFAULT_APPS,
    hub,
    label = "Your workspace",
    speed = 1,
    trail = 1,
    className,
  },
  ref,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => root.current!);
  const still = !!useReducedMotion();
  const inView = useInView(root, { once: true, amount: 0.3 });
  const shown = inView || still;

  const lines = React.useMemo(() => wires(apps.length), [apps.length]);
  const paths = React.useRef<(SVGPathElement | null)[]>([]);
  const dots = React.useRef<SVGGElement>(null);
  const pulse = React.useRef<HTMLSpanElement>(null);
  const [hover, setHover] = React.useState<number | null>(null);
  const hoverRef = React.useRef<number | null>(null);
  hoverRef.current = hover;

  // Fit the fixed stage into whatever width the card is given.
  const [scale, setScale] = React.useState(1);
  React.useLayoutEffect(() => {
    const el = root.current!;
    const ro = new ResizeObserver(() =>
      setScale(Math.min(1, el.clientWidth / W)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Packets: one loop moves every dot along its wire into the hub.
  React.useEffect(() => {
    const g = dots.current;
    if (!g || !shown) return;
    const n = lines.length;
    const per = Math.max(1, trail);
    const circles = Array.from(g.querySelectorAll("circle"));
    // Measured lazily: a wire mounted inside a hidden or not yet laid out
    // container reports a length of 0 at first.
    const lengths: number[] = [];
    // Each wire runs at its own pace and phase, so the packets never march in step.
    const pace = lines.map((_, i) => 2.6 + ((i * 7) % 5) * 0.35);
    const phase = lines.map((_, i) => (i * 0.37) % 1);
    const progress = phase.slice();
    let raf = 0;
    let last = performance.now();
    let lastPulse = 0;
    let visible = true;
    // Hold the packets until the wires have drawn in.
    const start =
      performance.now() + (still ? 0 : (tileAt(n - 1) + 0.3) * 1000);

    const place = () => {
      for (let i = 0; i < n; i++) {
        const path = paths.current[i];
        if (!lengths[i]) lengths[i] = path?.getTotalLength() ?? 0;
        const len = lengths[i]!;
        if (!path || !len) continue;
        const lit = hoverRef.current === i;
        const dim = hoverRef.current !== null && !lit;
        for (let k = 0; k < per; k++) {
          const c = circles[i * per + k];
          if (!c) continue;
          const u = progress[i]! - k * 0.022;
          if (u < 0 || u > 1) {
            c.setAttribute("opacity", "0");
            continue;
          }
          const pt = path.getPointAtLength((1 - u) * len);
          c.setAttribute("cx", pt.x.toFixed(1));
          c.setAttribute("cy", pt.y.toFixed(1));
          const head = 1 - k / per;
          c.setAttribute(
            "r",
            ((lit ? 3 : 2.2) * (0.45 + 0.55 * head)).toFixed(2),
          );
          // Fade in as they leave the tile and out as they reach the hub.
          const edge = Math.min(1, u / 0.08, (1 - u) / 0.06);
          c.setAttribute(
            "opacity",
            ((dim ? 0.2 : 0.85) * head * edge).toFixed(2),
          );
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || now < start) return;
      for (let i = 0; i < n; i++) {
        const boost = hoverRef.current === i ? 2.2 : 1;
        progress[i]! += (dt * speed * boost) / pace[i]!;
        if (progress[i]! >= 1 + per * 0.022) {
          progress[i] = 0;
          // A packet landed: the hub gives off a soft pulse, no more than a few a second.
          if (now - lastPulse > 280 && pulse.current) {
            lastPulse = now;
            pulse.current.animate(
              [
                { transform: "scale(1)", opacity: 0.5 },
                { transform: "scale(1.45)", opacity: 0 },
              ],
              { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            );
          }
        }
      }
      place();
    };

    // Reduced motion: packets sit still part way along each wire. Otherwise
    // they stay hidden until the wires and tiles are in.
    if (still) return void place();
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(
      ([e]) => void (visible = !!e?.isIntersecting),
    );
    // Watch the card, not the dot group: the group has no size until its dots are placed.
    io.observe(root.current ?? g);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [shown, still, speed, trail, lines]);

  const app = hover === null ? null : apps[hover];
  // Tiles stagger in once; after that, hover changes answer at once.
  const [entered, setEntered] = React.useState(still);
  React.useEffect(() => {
    if (!shown || entered) return;
    const t = window.setTimeout(
      () => setEntered(true),
      (tileAt(apps.length - 1) + 0.6) * 1000,
    );
    return () => window.clearTimeout(t);
  }, [shown, entered, apps.length]);

  return (
    <div
      ref={root}
      role="group"
      aria-label={`${label}, connected to ${apps.map((a) => a.label).join(", ")}`}
      className={cn(
        "relative w-[640px] max-w-full overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900",
        className,
      )}
      style={{ height: H * scale }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        {/* A soft gray glow behind the hub, and two faint rings around it. */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(closest-side at ${CX}px ${CY}px, rgba(36,36,35,0.07), transparent 70%)`,
          }}
          initial={still ? false : { opacity: 0, scale: 0.5 }}
          animate={shown ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 1, delay: 0.1, ease: GLIDE }}
        />
        {[1.55, 2.2].map((k, i) => (
          <motion.span
            key={k}
            aria-hidden
            className="absolute rounded-[36px] border border-[#242423]/[0.06] dark:border-white/[0.06]"
            style={{
              left: CX - (HUB * k) / 2,
              top: CY - (HUB * k * 0.72) / 2,
              width: HUB * k,
              height: HUB * k * 0.72,
            }}
            initial={still ? false : { opacity: 0, scale: 0.6 }}
            animate={shown ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: GLIDE }}
          />
        ))}

        {/* Wires and packets. */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 size-full"
          aria-hidden
        >
          {lines.map((l, i) => {
            const lit = hover === i;
            const dim = hover !== null && !lit;
            return (
              <motion.path
                key={i}
                ref={(el) => void (paths.current[i] = el)}
                d={l.d}
                fill="none"
                stroke={INK}
                strokeWidth={lit ? 1.5 : 1}
                className="pointer-events-none"
                strokeLinecap="round"
                initial={still ? false : { pathLength: 0, opacity: 0 }}
                animate={
                  shown
                    ? { pathLength: 1, opacity: lit ? 1 : dim ? 0.06 : 0.16 }
                    : undefined
                }
                transition={{
                  pathLength: {
                    duration: WIRE_FOR,
                    delay: WIRE_AT + i * WIRE_STEP,
                    ease: [0.4, 0, 0.2, 1],
                  },
                  opacity: entered
                    ? { duration: 0.25 }
                    : { duration: 0.2, delay: WIRE_AT + i * WIRE_STEP },
                }}
              />
            );
          })}
          {/* Wide invisible strokes, so each wire can be hovered on its own. */}
          {entered &&
            lines.map((l, i) => (
              <path
                key={`hit-${i}`}
                d={l.d}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                style={{ pointerEvents: "stroke", cursor: "pointer" }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              />
            ))}
          <g ref={dots} fill={INK} className="pointer-events-none">
            {lines.flatMap((_, i) =>
              Array.from({ length: Math.max(1, trail) }, (_, k) => (
                <circle key={`${i}-${k}`} r={0} opacity={0} />
              )),
            )}
          </g>
        </svg>

        {/* The hub. */}
        <motion.div
          className="absolute"
          style={{
            left: CX - HUB / 2,
            top: CY - HUB / 2,
            width: HUB,
            height: HUB,
          }}
          initial={
            still ? false : { scale: 0.6, opacity: 0, filter: "blur(6px)" }
          }
          animate={
            shown ? { scale: 1, opacity: 1, filter: "blur(0px)" } : undefined
          }
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 15,
            mass: 0.8,
          }}
          onAnimationComplete={() => {
            if (still) return;
            pulse.current?.animate(
              [
                { transform: "scale(1)", opacity: 0.6 },
                { transform: "scale(1.7)", opacity: 0 },
              ],
              { duration: 1000, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            );
          }}
        >
          <span
            ref={pulse}
            aria-hidden
            className="absolute inset-0 rounded-[30px] bg-[#242423]/10 opacity-0 dark:bg-white/10"
          />
          <div className="relative grid size-full place-items-center rounded-[30px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_40px_-16px_rgba(0,0,0,0.28)] ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10">
            <div className="grid size-[76px] place-items-center rounded-[22px] bg-[#242423]/[0.05] ring-1 ring-[#242423]/[0.06] dark:bg-white/[0.06]">
              {hub ?? <OrbitMark still={still} />}
            </div>
          </div>
          {/* The hovered app's name, under the hub. */}
          <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2">
            <AnimatePresence mode="popLayout">
              {app && (
                <motion.span
                  key={app.label}
                  initial={{ opacity: 0, y: -4, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className="inline-flex h-7 items-center whitespace-nowrap rounded-full bg-[#242423] px-3 text-xs font-medium text-white dark:bg-zinc-100 dark:text-[#242423]"
                >
                  {app.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* The tiles. */}
        {apps.map((a, i) => {
          const l = lines[i]!;
          const lit = hover === i;
          return (
            <motion.button
              key={a.label + i}
              type="button"
              aria-label={a.label}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              onFocus={() => setHover(i)}
              onBlur={() => setHover((h) => (h === i ? null : h))}
              className="absolute grid cursor-pointer place-items-center rounded-2xl bg-white text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_24px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/5 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-white/10"
              style={{
                left: l.x - TILE / 2,
                top: l.y - TILE / 2,
                width: TILE,
                height: TILE,
              }}
              initial={
                still
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.4,
                      x: (CX - l.x) * 0.18,
                      y: (CY - l.y) * 0.18,
                    }
              }
              animate={
                shown
                  ? {
                      opacity: hover !== null && !lit ? 0.6 : 1,
                      scale: lit ? 1.08 : 1,
                      x: 0,
                      y: lit ? -3 : 0,
                    }
                  : undefined
              }
              whileTap={still ? undefined : { scale: 0.94 }}
              transition={{
                type: "spring",
                stiffness: entered ? 380 : 300,
                damping: entered ? 22 : 15,
                delay: entered ? 0 : tileAt(i),
                opacity: { duration: 0.25, delay: entered ? 0 : tileAt(i) },
              }}
            >
              <AppIcon icon={a.icon} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});