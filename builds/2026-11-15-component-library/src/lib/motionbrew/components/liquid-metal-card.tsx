"use client";

/**
 * LiquidMetalCard, from https://motion-brew.com/components/liquid-metal-card
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
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// LiquidMetalCard

/**
 * LiquidMetalCard
 *
 * Trigger: hover (or press). A white image card that melts into a second
 * picture under a flood of black liquid metal. The moment the pointer comes
 * onto it, the metal pours in from the corner nearest the pointer: rivulets
 * run ahead toward the middle, each led by a heavy bead riding its tip, then
 * the pool surges after them and slows as it thickens, its front bulging
 * unevenly. It is lit like polished black chrome, shaded round its edges
 * with a hot highlight on top and a cool rim light below, and while it moves
 * its surface ripples and the reflections slide across it. A beat behind the
 * metal front the second picture surfaces from inside it, settling in from a
 * slight zoom, so the change always arrives through the metal. Leaving drains
 * it back into the same corner: the picture sinks, the rivulets pull in, then
 * the pool. A press or tap pours from the nearest corner too, and Enter and
 * Space from the bottom right. The title under the image rolls to the second
 * picture's name while it shows. `speed` runs the pour and the drain faster
 * or slower. Reduced motion swaps the metal for a crossfade.
 *
 * Engine: gsap + @gsap/react. SVG circles and stroked limb paths filled with
 * a reflection gradient run through a filter chain (gentle turbulence for a
 * living edge, blur and an alpha threshold to melt them together, then
 * diffuse and specular lighting on the alpha for the chrome); a second,
 * lagging shape masks the revealed picture. Timelines and the turning
 * reflections are scoped with useGSAP, and motion/react rolls the title.
 */

gsap.registerPlugin(useGSAP);

export interface LiquidMetalCardProps {
  /** The picture on show. */
  src?: string;
  /** The picture the liquid reveals. */
  revealSrc?: string;
  /** Title for the first picture. Default `"Daylight"`. */
  title?: string;
  /** Title while the second picture shows. Default `"Golden hour"`. */
  revealTitle?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Limbs that race out ahead of the metal. Default `9`. */
  tendrils?: number;
  /** Speed of the pour and the drain. `1` is the slow, heavy pour; higher is faster. Default `2`. */
  speed?: number;
  className?: string;
}

const W = 320;
const H = 380;
const BODY = 96;
const GLIDE = [0.22, 1, 0.36, 1] as const;

/** Reflection bands across the black metal, laid diagonally like a studio environment. */
const BANDS = [
  "#2e3136",
  "#040405",
  "#1b1d21",
  "#000000",
  "#16181b",
  "#020203",
  "#26292d",
  "#000000",
  "#1d1f23",
];

// Sample photos from Unsplash (unsplash.com/license).
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=640&h=760&fit=crop&q=80`;

/** A wandering vein from the origin outward, as a path. */
function vein(length: number, seed: number) {
  const steps = 5;
  let x = 0;
  let y = 0;
  let a = 0;
  let d = "M0 0";
  const rand = (n: number) => {
    const v = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  for (let i = 1; i <= steps; i++) {
    const seg = length / steps;
    a += (rand(i) - 0.5) * 1.1;
    const cx = x + Math.cos(a + (rand(i + 9) - 0.5)) * seg * 0.6;
    const cy = y + Math.sin(a + (rand(i + 9) - 0.5)) * seg * 0.6;
    x += Math.cos(a) * seg;
    y += Math.sin(a) * seg;
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

function Rolling({ text, still }: { text: string; still: boolean }) {
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="whitespace-nowrap"
          initial={
            still
              ? { opacity: 0 }
              : { opacity: 0, y: "70%", filter: "blur(4px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            still
              ? { opacity: 0 }
              : { opacity: 0, y: "-70%", filter: "blur(4px)" }
          }
          transition={{ duration: 0.32, ease: GLIDE }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export const LiquidMetalCard = React.forwardRef<
  HTMLDivElement,
  LiquidMetalCardProps
>(function LiquidMetalCard(
  {
    src = photo("1504893524553-b855bce32c67"),
    revealSrc = photo("1500534314209-a25ddb2bd429"),
    title = "Daylight",
    revealTitle = "Golden hour",
    subtitle = "Hover the picture and watch it melt over.",
    tendrils = 9,
    speed = 2,
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const uid = React.useId().replace(/:/g, "");
  const frame = React.useRef<HTMLDivElement>(null);
  const svg = React.useRef<SVGSVGElement>(null);
  const [shown, setShown] = React.useState(false);
  const count = Math.max(0, Math.min(16, tendrils));

  // Veins are drawn once; each spread just turns them to fresh angles.
  const veins = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) =>
        vein(170 + ((i * 37) % 80), i + 1),
      ),
    [count],
  );

  const state = React.useRef({
    active: false,
    full: false,
    living: [] as gsap.core.Animation[],
    timeline: null as gsap.core.Timeline | null,
  });

  const { contextSafe } = useGSAP(
    () => {
      gsap.set("[data-mover]", { x: W + 6, y: H + 6 });
      gsap.set("[data-body], [data-core], [data-lump], [data-bead]", {
        attr: { r: 0 },
      });
      gsap.set("[data-vein]", {
        strokeDasharray: 1,
        strokeDashoffset: 1,
        attr: { "stroke-width": 0 },
      });
    },
    { scope: frame, dependencies: [count, still] },
  );

  const stopLiving = () => {
    const s = state.current;
    s.living.forEach((a) => a.kill());
    s.living = [];
  };

  /** Liquid takes time to get going and settles slowly: a surge, then a long viscous ease. */
  const POUR = "power2.inOut";

  // Hover, a press or a key floods the card from the bottom right corner.
  /** The corner nearest to a point on the card, in card units, nudged just outside the frame. */
  const cornerNear = (e?: { clientX: number; clientY: number }) => {
    if (!e || !frame.current) return { x: W + 6, y: H + 6 };
    const r = frame.current.getBoundingClientRect();
    const right = e.clientX - r.left > r.width / 2;
    const bottom = e.clientY - r.top > r.height / 2;
    return { x: right ? W + 6 : -6, y: bottom ? H + 6 : -6 };
  };

  const melt = contextSafe(
    (from: { x: number; y: number } = { x: W + 6, y: H + 6 }) => {
      const s = state.current;
      if (s.active) return;
      s.active = true;
      s.full = true;
      setShown(true);
      if (still) {
        gsap.to("[data-reveal]", { opacity: 1, duration: 0.4 });
        return;
      }
      stopLiving();
      s.timeline?.kill();
      const root = svg.current!;
      const groups = gsap.utils.toArray<SVGGElement>("[data-vein-group]", root);
      const paths = gsap.utils.toArray<SVGPathElement>("[data-vein]", root);
      const beads = gsap.utils.toArray<SVGCircleElement>("[data-bead]", root);
      const lumps = gsap.utils.toArray<SVGCircleElement>("[data-lump]", root);
      const big = Math.hypot(W, H) * 1.18;
      const cx = from.x;
      const cy = from.y;
      // Everything flows from that corner toward the middle of the card.
      const inward = (Math.atan2(H / 2 - cy, W / 2 - cx) * 180) / Math.PI;
      gsap.set("[data-mover]", { x: cx, y: cy });
      gsap.set("[data-reveal]", { opacity: 1 });

      const tl = gsap.timeline();
      s.timeline = tl;
      tl.timeScale(Math.max(0.2, speed));

      // Rivulets run ahead of the pool, each led by a heavy bead riding its tip.
      groups.forEach((g, i) => {
        const angle =
          inward -
          41 +
          (i / Math.max(1, groups.length - 1)) * 82 +
          gsap.utils.random(-7, 7);
        gsap.set(g, {
          rotation: angle,
          scale: gsap.utils.random(1.35, 1.85),
          transformOrigin: "0 0",
        });
        const path = paths[i]!;
        const bead = beads[i]!;
        const len = path.getTotalLength();
        const run = { p: 0 };
        const width = gsap.utils.random(12, 17);
        tl.to(
          run,
          {
            p: 1,
            duration: gsap.utils.random(1, 1.35),
            ease: "power2.out",
            onUpdate: () => {
              const pt = path.getPointAtLength(run.p * len);
              path.style.strokeDashoffset = String(1 - run.p);
              path.setAttribute(
                "stroke-width",
                String(width * Math.min(1, run.p * 3)),
              );
              bead.setAttribute("cx", pt.x.toFixed(1));
              bead.setAttribute("cy", pt.y.toFixed(1));
              bead.setAttribute(
                "r",
                String(width * 0.75 * Math.min(1, run.p * 2.5)),
              );
            },
          },
          0.02 + i * 0.04,
        );
      });

      // The pool surges out of the corner and slows as it thickens, its front bulging unevenly.
      tl.to("[data-body]", { attr: { r: big }, duration: 2, ease: POUR }, 0.3);
      lumps.forEach((l, i) => {
        const a = ((inward - 32 + i * 16) * Math.PI) / 180;
        const d = gsap.utils.random(60, 110);
        tl.fromTo(
          l,
          { attr: { cx: 0, cy: 0, r: 0 } },
          {
            attr: {
              cx: Math.cos(a) * d,
              cy: Math.sin(a) * d,
              r: gsap.utils.random(46, 70),
            },
            duration: 0.9,
            ease: "elastic.out(1, 0.5)",
          },
          0.35 + i * 0.07,
        );
      });

      // The picture surfaces inside the metal a beat behind the front, settling in from a slight zoom.
      tl.to(
        "[data-core]",
        { attr: { r: big }, duration: 1.9, ease: POUR },
        0.85,
      );
      tl.fromTo(
        "[data-reveal-image]",
        {
          scale: 1.12,
          transformOrigin: `${cx > W / 2 ? 100 : 0}% ${cy > H / 2 ? 100 : 0}%`,
        },
        { scale: 1, duration: 1.8, ease: "power3.out" },
        0.85,
      );

      // The surface keeps flowing: the edge ripples and the reflections slide across.
      s.living.push(
        gsap.fromTo(
          "[data-noise]",
          { attr: { baseFrequency: 0.01 } },
          {
            attr: { baseFrequency: 0.02 },
            duration: 1.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
        ),
        gsap.fromTo(
          "[data-warp]",
          { attr: { scale: 10 } },
          {
            attr: { scale: 24 },
            duration: 0.9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
        ),
        gsap.fromTo(
          "[data-metal]",
          { attr: { gradientTransform: `rotate(-18 ${W / 2} ${H / 2})` } },
          {
            attr: { gradientTransform: `rotate(22 ${W / 2} ${H / 2})` },
            duration: 1.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
        ),
      );
    },
  );

  // Leaving drains it back into the corner: the picture sinks, the rivulets pull in, then the pool.
  const retract = contextSafe(() => {
    const s = state.current;
    if (!s.active) return;
    s.active = false;
    s.full = false;
    setShown(false);
    if (still) {
      gsap.to("[data-reveal]", { opacity: 0, duration: 0.3 });
      return;
    }
    s.timeline?.kill();
    const root = svg.current!;
    const paths = gsap.utils.toArray<SVGPathElement>("[data-vein]", root);
    const beads = gsap.utils.toArray<SVGCircleElement>("[data-bead]", root);
    const tl = gsap.timeline({ onComplete: stopLiving });
    s.timeline = tl;
    tl.timeScale(Math.max(0.2, speed));
    tl.to(
      "[data-core]",
      { attr: { r: 0 }, duration: 0.9, ease: "power2.inOut" },
      0,
    );
    tl.to(
      "[data-reveal-image]",
      { scale: 1.08, duration: 0.9, ease: "power2.inOut" },
      0,
    );
    tl.to(
      "[data-body]",
      { attr: { r: 0 }, duration: 1.1, ease: "power2.inOut" },
      0.25,
    );
    tl.to(
      "[data-lump]",
      { attr: { r: 0, cx: 0, cy: 0 }, duration: 0.6, ease: "power3.in" },
      0.1,
    );
    paths.forEach((path, i) => {
      const bead = beads[i]!;
      const len = path.getTotalLength();
      const run = { p: 1 - Number(path.style.strokeDashoffset || 1) };
      const width = Number(path.getAttribute("stroke-width")) || 14;
      tl.to(
        run,
        {
          p: 0,
          duration: 0.5,
          ease: "power3.in",
          onUpdate: () => {
            const pt = path.getPointAtLength(run.p * len);
            path.style.strokeDashoffset = String(1 - run.p);
            path.setAttribute(
              "stroke-width",
              String(width * Math.min(1, run.p * 3)),
            );
            bead.setAttribute("cx", pt.x.toFixed(1));
            bead.setAttribute("cy", pt.y.toFixed(1));
            bead.setAttribute(
              "r",
              String(width * 0.75 * Math.min(1, run.p * 2.5)),
            );
          },
        },
        0.05 + i * 0.02,
      );
    });
  });

  const goo = `${uid}-goo`;
  const wet = `${uid}-wet`;

  return (
    <div
      ref={ref}
      className={cn(
        "w-[344px] max-w-full rounded-3xl bg-white p-3 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <div
        ref={frame}
        role="button"
        tabIndex={0}
        aria-pressed={shown}
        aria-label={`${title}. Reveal ${revealTitle}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && melt(cornerNear(e))}
        onPointerLeave={(e) => e.pointerType === "mouse" && retract()}
        onClick={(e) =>
          state.current.active ? retract() : melt(cornerNear(e))
        }
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          if (state.current.active) retract();
          else melt();
        }}
        className="relative aspect-[320/380] w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-zinc-800"
      >
        <img
          src={src}
          alt={title}
          draggable={false}
          className="absolute inset-0 size-full select-none object-cover"
        />
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden
        >
          <defs>
            {/* Torn edge: turbulence pushes the shape around, then blur and an alpha threshold melt it into goo. */}
            <filter id={goo} x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence
                data-noise
                type="fractalNoise"
                baseFrequency="0.011"
                numOctaves="1"
                seed="7"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                data-warp
                scale="14"
                xChannelSelector="R"
                yChannelSelector="G"
                result="torn"
              />
              <feGaussianBlur in="torn" stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12"
              />
            </filter>
            {/* Liquid metal: the shape's alpha becomes a rounded height map; diffuse light shades it like a
                bevel, and two speculars put a hot highlight on top and a cool rim light along the lower edge. */}
            <filter id={wet} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="4"
                result="height"
              />
              <feDiffuseLighting
                in="height"
                surfaceScale="5"
                diffuseConstant="1.05"
                lightingColor="#ffffff"
                result="shade"
              >
                <feDistantLight azimuth="235" elevation="48" />
              </feDiffuseLighting>
              <feComposite
                in="SourceGraphic"
                in2="shade"
                operator="arithmetic"
                k1="1.15"
                k2="0"
                k3="0"
                k4="0"
                result="shaded"
              />
              <feSpecularLighting
                in="height"
                surfaceScale="6"
                specularConstant="1.5"
                specularExponent="42"
                lightingColor="#ffffff"
                result="hot"
              >
                <fePointLight x="-40" y="-160" z="300" />
              </feSpecularLighting>
              <feSpecularLighting
                in="height"
                surfaceScale="6"
                specularConstant="0.7"
                specularExponent="18"
                lightingColor="#cfe3ff"
                result="rim"
              >
                <fePointLight x="420" y="520" z="160" />
              </feSpecularLighting>
              <feComposite
                in="hot"
                in2="rim"
                operator="arithmetic"
                k2="1"
                k3="1"
                result="lights"
              />
              <feComposite
                in="lights"
                in2="SourceAlpha"
                operator="in"
                result="shine"
              />
              <feComposite
                in="shaded"
                in2="shine"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
            </filter>
            {/* Reflections: bands of light and dark that slowly turn while the metal moves. */}
            <linearGradient
              id={`${uid}-metal`}
              data-metal
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2={W}
              y2={H}
            >
              {BANDS.map((c, i, all) => (
                <stop key={i} offset={i / (all.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
            <mask
              id={`${uid}-mask`}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={W}
              height={H}
            >
              <g filter={`url(#${goo})`}>
                <g data-mover data-core-mover>
                  <circle data-core cx="0" cy="0" r="0" fill="#fff" />
                </g>
              </g>
            </mask>
          </defs>

          {/* The metal: one mass plus the veins, melted together and lit like polished black chrome. */}
          {!still && (
            <g filter={`url(#${wet})`}>
              <g
                filter={`url(#${goo})`}
                fill={`url(#${uid}-metal)`}
                stroke={`url(#${uid}-metal)`}
                strokeLinecap="round"
              >
                <g data-mover>
                  <circle data-body cx="0" cy="0" r="0" />
                  {Array.from({ length: 5 }, (_, i) => (
                    <circle key={i} data-lump cx="0" cy="0" r="0" />
                  ))}
                </g>
                {veins.map((d, i) => (
                  <g key={i} data-mover data-vein-group>
                    <path data-vein d={d} fill="none" pathLength={1} />
                    <circle data-bead cx="0" cy="0" r="0" stroke="none" />
                  </g>
                ))}
              </g>
            </g>
          )}

          {/* The second picture surfaces inside the black, behind its front. */}
          <g
            data-reveal
            mask={still ? undefined : `url(#${uid}-mask)`}
            style={{ opacity: still ? 0 : 1 }}
          >
            <image
              data-reveal-image
              href={revealSrc}
              x="0"
              y="0"
              width={W}
              height={H}
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </svg>
      </div>

      <div className="px-2 pb-1 pt-4">
        <p className="text-base font-semibold tracking-tight">
          <Rolling text={shown ? revealTitle : title} still={still} />
        </p>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
});