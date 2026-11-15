"use client";

/**
 * MetalCardStack, from https://motion-brew.com/components/metal-card-stack
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// MetalCardStack

/**
 * MetalCardStack
 *
 * Trigger: drag (plus hover and keys). A stack of metal payment cards that
 * feel like the real thing: brushed metal with a fine grain, bevelled edges
 * that catch the light, a visible card edge underneath, an embossed number
 * and a light sheen that slides across the surface as the front card tilts
 * toward the pointer. Grab the front card and it follows your hand, leaning
 * into the drag. Throw it any way, left, right, up or down, and it flies off
 * that way and tucks in at the back of the stack. Click the front card (or press Enter) and
 * it turns over in 3D to show its back: the magnetic stripe, the signature
 * panel with the security code and the small print; click again to turn it
 * back. A short drag springs back. The rest of the
 * stack slides up or down a step each time, smaller and dimmer the deeper it
 * sits. The arrow keys do the same. Reduced motion swaps the throws for quick
 * fades. On a narrow screen the whole stack scales down to fit (never up). On
 * touch, the page still scrolls up and down over the card; a sideways swipe
 * or flick throws it, and a gesture the browser takes for scrolling springs
 * the card back.
 *
 * Engine: gsap + @gsap/react (quickTo for the drag and tilt, timelines for the
 * throw, scoped with useGSAP).
 */

gsap.registerPlugin(useGSAP);

export interface MetalCard {
  /** Name on the card. */
  holder: string;
  /** The full card number, digits only. Grouped the way its network prints it. */
  number: string;
  /** The card network, shown as its mark in the corner. */
  network: "visa" | "mastercard" | "amex" | "discover";
  /** The issuer's name, top left. */
  bank?: string;
  /** Security code shown on the back. Default `"123"`. */
  cvv?: string;
  /** Expiry, MM/YY. */
  expiry: string;
  /** The metal. */
  finish: "graphite" | "gold" | "titanium" | "obsidian";
  /** Small label in the corner, like the plan name. */
  tier?: string;
}

export interface MetalCardStackProps {
  /** Cards in the stack, front first. Default four. */
  cards?: MetalCard[];
  /** Card width in px. Height follows the real card ratio. Default `320`. */
  width?: number;
  /** Called with the card now at the front. */
  onChange?: (card: MetalCard, index: number) => void;
  className?: string;
}

const DEFAULT_CARDS: MetalCard[] = [
  {
    holder: "Alex Morgan",
    number: "4821660422591937",
    network: "visa",
    bank: "Northwind",
    tier: "Reserve",
    expiry: "08/29",
    finish: "graphite",
  },
  {
    holder: "Alex Morgan",
    number: "5412751234561937",
    network: "mastercard",
    bank: "Harbor",
    tier: "Private",
    expiry: "11/28",
    finish: "gold",
  },
  {
    holder: "Alex Morgan",
    number: "378282246310005",
    network: "amex",
    bank: "Meridian",
    tier: "Platinum",
    expiry: "03/30",
    finish: "titanium",
  },
  {
    holder: "Alex Morgan",
    number: "6011000990139424",
    network: "discover",
    bank: "Summit",
    tier: "Infinite",
    expiry: "06/27",
    finish: "obsidian",
  },
];

/** The number grouped as printed: 4 6 5 for Amex, fours for everyone else. */
const groups = (number: string, network: MetalCard["network"]) => {
  const d = number.replace(/\D/g, "");
  if (network === "amex")
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].join(" ");
  return d.replace(/(.{4})(?=.)/g, "$1 ");
};

/** Card network marks, drawn inline for the metal. */
function Network({
  network,
  ink,
}: {
  network: MetalCard["network"];
  ink: string;
}) {
  const font =
    "ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif";
  if (network === "mastercard")
    return (
      <svg
        viewBox="0 0 52 32"
        className="h-8 w-[52px]"
        role="img"
        aria-label="Mastercard"
      >
        <circle cx="19" cy="16" r="13" fill="#eb001b" />
        <circle cx="33" cy="16" r="13" fill="#f79e1b" />
        <path
          d="M26 5.1a13 13 0 0 1 0 21.8 13 13 0 0 1 0-21.8Z"
          fill="#ff5f00"
        />
      </svg>
    );
  if (network === "amex")
    return (
      <svg
        viewBox="0 0 60 36"
        className="h-9 w-[60px]"
        role="img"
        aria-label="American Express"
      >
        <rect width="60" height="36" rx="4" fill="#016fd0" />
        <text
          x="30"
          y="16"
          textAnchor="middle"
          fill="#fff"
          fontFamily={font}
          fontSize="9.5"
          fontWeight="900"
          letterSpacing="0.4"
        >
          AMERICAN
        </text>
        <text
          x="30"
          y="27"
          textAnchor="middle"
          fill="#fff"
          fontFamily={font}
          fontSize="9.5"
          fontWeight="900"
          letterSpacing="0.4"
        >
          EXPRESS
        </text>
      </svg>
    );
  if (network === "discover")
    return (
      <svg
        viewBox="0 0 84 20"
        className="h-5 w-[84px]"
        role="img"
        aria-label="Discover"
      >
        <text
          x="0"
          y="15"
          fill={ink}
          fontFamily={font}
          fontSize="14"
          fontWeight="800"
          letterSpacing="0.2"
        >
          DISC
        </text>
        <circle cx="42.5" cy="10" r="6" fill="#f48120" />
        <text
          x="49"
          y="15"
          fill={ink}
          fontFamily={font}
          fontSize="14"
          fontWeight="800"
          letterSpacing="0.2"
        >
          VER
        </text>
      </svg>
    );
  return (
    <svg
      viewBox="0 0 64 22"
      className="h-[22px] w-16"
      role="img"
      aria-label="Visa"
    >
      <text
        x="32"
        y="19"
        textAnchor="middle"
        fill={ink}
        fontFamily={font}
        fontSize="22"
        fontStyle="italic"
        fontWeight="900"
        letterSpacing="-0.5"
      >
        VISA
      </text>
    </svg>
  );
}

/** Base metal, brushed highlight and ink colour for each finish. */
const METALS = {
  graphite: {
    base: "linear-gradient(135deg, #5b6068 0%, #2f3338 38%, #4a4f56 62%, #23262a 100%)",
    ink: "rgba(255,255,255,0.88)",
    edge: "#17191c",
  },
  gold: {
    base: "linear-gradient(135deg, #f3dca2 0%, #c9a35a 34%, #e9cf8c 58%, #a8823c 100%)",
    ink: "rgba(58,40,10,0.85)",
    edge: "#7a5a22",
  },
  titanium: {
    base: "linear-gradient(135deg, #eef0f2 0%, #b9bec4 36%, #dfe2e6 60%, #9aa0a7 100%)",
    ink: "rgba(30,34,40,0.82)",
    edge: "#6f757c",
  },
  obsidian: {
    base: "linear-gradient(135deg, #2a2b2f 0%, #0c0c0e 40%, #1d1e22 64%, #050506 100%)",
    ink: "rgba(255,255,255,0.82)",
    edge: "#000000",
  },
} as const;

const RATIO = 1.586;
const VISIBLE = 4;
const THROW = 80;

/** The metal plate both sides share: finish, bevel, brushed grain and the moving sheen. */
function Plate({
  card,
  width,
  children,
}: {
  card: MetalCard;
  width: number;
  children: React.ReactNode;
}) {
  const m = METALS[card.finish];
  return (
    <div
      className="relative overflow-hidden rounded-[18px]"
      style={{
        width,
        height: width / RATIO,
        background: m.base,
        color: m.ink,
        // Bevel: a bright top edge, a dark bottom edge and a hairline all round.
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {/* Brushed grain: fine horizontal strokes over the metal. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 3px)",
        }}
      />
      {/* The sheen: a soft light band whose position follows the card's tilt. */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.15) 52%, transparent 70%)",
          backgroundSize: "260% 260%",
          backgroundPosition: "var(--sheen-x, 50%) var(--sheen-y, 50%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at var(--sheen-x, 50%) 0%, rgba(255,255,255,0.18), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}

const embossFor = (card: MetalCard) =>
  card.finish === "gold" || card.finish === "titanium"
    ? "0 1px 0 rgba(255,255,255,0.55), 0 -1px 0 rgba(0,0,0,0.25)"
    : "0 1px 0 rgba(255,255,255,0.18), 0 -1px 0 rgba(0,0,0,0.6)";

/** Front: bank, chip and hologram, the big embossed number, expiry and the cardholder. */
function Front({ card, width }: { card: MetalCard; width: number }) {
  const m = METALS[card.finish];
  return (
    <Plate card={card} width={width}>
      <div
        className="relative flex h-full flex-col px-5 pb-4 pt-4"
        style={{ textShadow: embossFor(card) }}
      >
        <div className="flex items-start justify-between">
          <span className="text-base font-semibold uppercase tracking-[0.14em]">
            {card.bank ?? "Bank"}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.16em] opacity-70">
            {card.tier}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* The chip: gold contacts with etched lines. */}
          <div
            aria-hidden
            className="relative h-8 w-11 overflow-hidden rounded-[7px]"
            style={{
              background:
                "linear-gradient(135deg, #f6e3a8, #c79d4f 50%, #ecd38f)",
              boxShadow:
                "inset 0 0 0 1px rgba(90,60,10,0.35), 0 1px 1px rgba(0,0,0,0.25)",
            }}
          >
            <span className="absolute inset-x-0 top-1/3 h-px bg-black/25" />
            <span className="absolute inset-x-0 top-2/3 h-px bg-black/25" />
            <span className="absolute inset-y-0 left-1/2 w-px bg-black/25" />
            <span className="absolute inset-[30%] rounded-[3px] border border-black/25" />
          </div>
          {/* The hologram: a silver patch whose rainbow shifts with the tilt. */}
          <div
            aria-hidden
            className="relative h-9 w-[60px] overflow-hidden rounded-md"
            style={{
              background:
                "linear-gradient(135deg, #f4f5f7, #b8bcc2 45%, #e9ebee 60%, #9ea3aa)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.5), 0 1px 1px rgba(0,0,0,0.25)",
            }}
          >
            <span
              className="absolute inset-0 opacity-60 mix-blend-overlay"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, #ff9ad5, #9be7ff, #b8ffb0, #ffe59a, #ff9ad5)",
                backgroundSize: "300% 100%",
                backgroundPosition: "var(--sheen-x, 50%) 50%",
              }}
            />
            <span
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(60,64,70,0.55) 0.8px, transparent 1px)",
                backgroundSize: "4px 4px",
                maskImage:
                  "radial-gradient(ellipse 70% 60% at 50% 50%, #000 55%, transparent 75%)",
              }}
            />
          </div>
        </div>

        {/* The big embossed number. */}
        <p className="mt-3 whitespace-nowrap font-mono text-xl font-medium tracking-[0.08em]">
          {groups(card.number, card.network)}
        </p>

        <div className="mt-1 flex items-center gap-6 text-xs">
          <span className="font-mono tabular-nums opacity-70">
            {card.number.slice(0, 4)}
          </span>
          <span className="ml-auto mr-6 flex items-center gap-2">
            <span
              className="text-[length:inherit] uppercase leading-[1.05] tracking-[0.08em] opacity-60"
              style={{ fontSize: 8 * 1.5 }}
            >
              Expires
              <br />
              End
            </span>
            <span className="font-mono text-base tabular-nums">
              {card.expiry}
            </span>
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <span className="truncate text-sm font-medium uppercase tracking-[0.12em]">
            {card.holder}
          </span>
          <span className="shrink-0" style={{ textShadow: "none" }}>
            <Network network={card.network} ink={m.ink} />
          </span>
        </div>
      </div>
    </Plate>
  );
}

/** Back: service line, magnetic stripe, signature panel with the security code, and small print. */
function Back({ card, width }: { card: MetalCard; width: number }) {
  return (
    <Plate card={card} width={width}>
      <div className="relative flex h-full flex-col">
        <p className="truncate px-5 pt-3 text-xs opacity-80">
          For customer service, call +1 800 555 0142
        </p>
        <div
          aria-hidden
          className="mt-2 h-9 w-full"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1c, #050506 60%, #1f1f22)",
          }}
        />
        <div className="mt-3 flex items-center gap-2 px-5">
          <div
            aria-hidden
            className="h-8 flex-1 rounded-sm"
            style={{
              background:
                "repeating-linear-gradient(-8deg, #ffffff 0px, #ffffff 3px, #dfe7f3 3px, #dfe7f3 4px)",
            }}
          />
          <span className="grid h-8 w-12 place-items-center rounded-sm bg-white font-mono text-sm italic text-zinc-900">
            {card.cvv ?? "123"}
          </span>
        </div>
        <p className="mt-auto px-5 pb-4 text-xs leading-snug opacity-70">
          Use of this card is subject to the cardholder agreement. If found,
          please return it to any {card.bank ?? "branch"}.
        </p>
      </div>
    </Plate>
  );
}

export const MetalCardStack = React.forwardRef<
  HTMLDivElement,
  MetalCardStackProps
>(function MetalCardStack(
  { cards = DEFAULT_CARDS, width = 320, onChange, className },
  ref,
) {
  const still = !!useReducedMotion();
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => root.current as HTMLDivElement);
  const els = React.useRef<(HTMLDivElement | null)[]>([]);
  // order[k] is the index of the card at depth k (0 is the front).
  const order = React.useRef(cards.map((_, i) => i));
  const busy = React.useRef(false);
  const [front, setFront] = React.useState(0);
  const [side, setSide] = React.useState<"front" | "back">("front");
  const height = width / RATIO;
  const n = cards.length;

  // Fit narrow screens: the stack keeps its design and scales down as a whole
  // (never up), measured from the room the root is given.
  const [fit, setFit] = React.useState(1);
  React.useLayoutEffect(() => {
    const el = root.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const room = el.clientWidth;
      setFit(Math.min(1, Math.max(0.5, (room - 16) / width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  const fitRef = React.useRef(fit);
  fitRef.current = fit;

  /** Where a card sits at a given depth in the stack. */
  const slot = (depth: number) => {
    const d = Math.min(depth, VISIBLE - 1);
    return {
      x: 0,
      y: -d * 18,
      // Real depth, so a tilting card never cuts through the one behind it.
      z: -d * 48,
      scale: 1 - d * 0.06,
      rotation: 0,
      rotationX: 0,
      rotationY: 0,
      autoAlpha: depth < VISIBLE ? 1 : 0,
      zIndex: 100 - depth,
    };
  };
  /** Deeper cards sit in shade: a dark overlay inside the card, not a CSS filter, which would flatten the flip. */
  const shade = (el: HTMLElement, depth: number, duration: number) =>
    gsap.to(el.querySelector("[data-shade]"), {
      opacity: Math.min(depth, VISIBLE - 1) * 0.14,
      duration,
      ease: "power3.out",
    });
  const flips = React.useRef<(HTMLDivElement | null)[]>([]);
  const flipped = React.useRef<boolean[]>([]);

  const { contextSafe } = useGSAP(
    () => {
      order.current.forEach((i, depth) => {
        const el = els.current[i];
        if (!el) return;
        gsap.set(el, slot(depth));
        shade(el, depth, 0);
      });
    },
    { scope: root, dependencies: [n, width] },
  );

  /** Slide every card into its slot for the current order. */
  const settle = contextSafe((skip?: number) => {
    order.current.forEach((i, depth) => {
      const el = els.current[i];
      if (!el || i === skip) return;
      shade(el, depth, still ? 0 : 0.55);
      gsap.to(el, {
        ...slot(depth),
        duration: still ? 0 : 0.55,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  });

  const announce = () => {
    const i = order.current[0]!;
    setFront(i);
    onChange?.(cards[i]!, i);
  };

  /** Front to back: the front card flies off the way it was thrown and tucks in behind. */
  const sendBack = contextSafe((dir: "left" | "right" | "up" | "down") => {
    if (busy.current || n < 2) return;
    busy.current = true;
    const i = order.current[0]!;
    const el = els.current[i]!;
    order.current = [...order.current.slice(1), i];
    settle(i);
    const out = {
      left: { x: -width * 0.95, y: -10, z: 40, rotation: -14, rotationY: -18 },
      right: { x: width * 0.95, y: -10, z: 40, rotation: 14, rotationY: 18 },
      up: { x: 10, y: -height * 1.05, z: 40, rotation: 4, rotationX: 28 },
      down: { x: -10, y: height * 1.05, z: 40, rotation: -4, rotationX: -28 },
    }[dir];
    const back = slot(order.current.length - 1);
    unflip(i);
    shade(el, order.current.length - 1, still ? 0 : 0.8);
    gsap
      .timeline({ onComplete: () => void ((busy.current = false), announce()) })
      .to(el, { ...out, duration: still ? 0 : 0.32, ease: "power2.out" })
      .set(el, { zIndex: back.zIndex })
      .to(el, { ...back, duration: still ? 0 : 0.5, ease: "power3.out" });
  });

  /** Turn a card over to its back, or back to its face, with a small lift in the middle of the turn. */
  const flip = contextSafe((i: number) => {
    const f = flips.current[i];
    if (!f || busy.current) return;
    const to = !flipped.current[i];
    flipped.current[i] = to;
    setSide(to ? "back" : "front");
    if (still) return void gsap.set(f, { rotationY: to ? 180 : 0 });
    turn(f, to ? 180 : 0, 0.75, "power3.inOut");
  });
  const unflip = (i: number) => {
    const f = flips.current[i];
    if (!f || !flipped.current[i]) return;
    flipped.current[i] = false;
    setSide("front");
    if (still) return void gsap.set(f, { rotationY: 0, z: 0 });
    turn(f, 0, 0.5, "power3.out");
  };
  /**
   * Turn a card about its vertical axis without it cutting through the card
   * behind. Mid turn, its far half swings width / 2 back into the stack, so
   * the card rises toward the viewer by just that much, following the angle,
   * and sinks back as it lands flat.
   */
  const turn = (
    f: HTMLElement,
    rotationY: number,
    duration: number,
    ease: string,
  ) => {
    const reach = width / 2;
    const gap = 48 - 20; // slot spacing, less a margin for the hover lean
    gsap.to(f, {
      rotationY,
      duration,
      ease,
      overwrite: "auto",
      onUpdate: () => {
        const r =
          (gsap.getProperty(f, "rotationY") as number) * (Math.PI / 180);
        gsap.set(f, { z: Math.max(0, reach * Math.abs(Math.sin(r)) - gap) });
      },
    });
  };

  // Drag the front card: it follows the hand and leans into the move; a throw decides the rest.
  const dragging = React.useRef<{
    x: number;
    y: number;
    t: number;
    vx: number;
    vy: number;
    touch: boolean;
  } | null>(null);
  const onDown = contextSafe((e: React.PointerEvent) => {
    if (busy.current || e.button !== 0) return;
    dragging.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      vx: 0,
      vy: 0,
      touch: e.pointerType !== "mouse",
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  });
  const onMove = contextSafe((e: React.PointerEvent) => {
    const el = els.current[order.current[0]!];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    // Tilt toward the pointer and slide the sheen, even when not dragging.
    el.style.setProperty(
      "--sheen-x",
      `${Math.max(0, Math.min(100, px * 100))}%`,
    );
    el.style.setProperty(
      "--sheen-y",
      `${Math.max(0, Math.min(100, py * 100))}%`,
    );
    const g = dragging.current;
    if (!g) {
      // The tilt follows a mouse; a finger only moves the card while it drags.
      if (still || busy.current || e.pointerType !== "mouse") return;
      gsap.to(el, {
        rotationY: (px - 0.5) * 14,
        rotationX: -(py - 0.5) * 12,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
      return;
    }
    // Screen pixels to the stack's own, so the card stays under the finger when scaled.
    const k = fitRef.current;
    const dx = (e.clientX - g.x) / k;
    // On touch the page owns vertical moves; the card only travels sideways.
    const dy = g.touch ? 0 : (e.clientY - g.y) / k;
    const now = performance.now();
    const dt = Math.max(1, now - g.t);
    g.vx = (dx / dt) * 16;
    g.vy = (dy / dt) * 16;
    gsap.to(el, {
      x: dx,
      y: dy,
      rotation: dx * 0.04,
      rotationY: dx * 0.06,
      rotationX: -dy * 0.06,
      duration: 0.15,
      ease: "power2.out",
      overwrite: "auto",
    });
  });
  const onUp = contextSafe((e: React.PointerEvent) => {
    const g = dragging.current;
    dragging.current = null;
    if (!g) return;
    const k = fitRef.current;
    const dx = (e.clientX - g.x) / k;
    const dy = g.touch ? 0 : (e.clientY - g.y) / k;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    // A thumb swipe is shorter than a mouse drag, and a flick counts too.
    const reach = g.touch ? THROW * 0.6 : THROW;
    const flick = g.touch ? 8 : 12;
    const far = horizontal
      ? Math.abs(dx) > reach || Math.abs(g.vx) > flick
      : Math.abs(dy) > reach * 0.8 || Math.abs(g.vy) > flick;
    if (!far) {
      settle();
      // A press without a drag turns the front card over (a finger wobbles a little).
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) < (g.touch ? 10 : 6))
        flip(order.current[0]!);
      return;
    }
    if (horizontal) sendBack(dx < 0 ? "left" : "right");
    else sendBack(dy < 0 ? "up" : "down");
  });
  // The browser took the gesture (a page scroll): the card goes home, nothing is thrown.
  const onCancel = contextSafe(() => {
    if (!dragging.current) return;
    dragging.current = null;
    settle();
  });
  const onLeave = contextSafe(() => {
    if (dragging.current || busy.current) return;
    const el = els.current[order.current[0]!];
    if (el)
      gsap.to(el, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.6,
        ease: "power2.out",
      });
  });

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="card stack"
      aria-label="Payment cards"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          (e.preventDefault(), flip(order.current[0]!));
        else if (e.key === "ArrowLeft") (e.preventDefault(), sendBack("left"));
        else if (e.key === "ArrowUp") (e.preventDefault(), sendBack("up"));
        else if (e.key === "ArrowRight")
          (e.preventDefault(), sendBack("right"));
        else if (e.key === "ArrowDown") (e.preventDefault(), sendBack("down"));
      }}
      className={cn(
        "relative grid select-none place-items-center outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4",
        className,
      )}
      style={{
        width: width + 120,
        maxWidth: "100%",
        height: (height + 140) * fit,
        perspective: 1100,
      }}
    >
      {/* Scales the whole stack to fit, keeping its 3D. Negative margins
          shrink its layout box to the scaled size, so it stays centred. */}
      <div
        style={{
          transform: fit < 1 ? `scale(${fit})` : undefined,
          transformStyle: "preserve-3d",
          marginInline: fit < 1 ? (-width * (1 - fit)) / 2 : undefined,
          marginBlock: fit < 1 ? (-(height + 50) * (1 - fit)) / 2 : undefined,
        }}
      >
      <div
        className="relative cursor-grab touch-pan-y active:cursor-grabbing"
        style={{ width, height, marginTop: 50, transformStyle: "preserve-3d" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        onPointerLeave={onLeave}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            ref={(el) => void (els.current[i] = el)}
            aria-hidden={i !== front}
            className="absolute left-0 top-0 will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* The flipper holds both faces back to back; the edge slab rides along under them. */}
            <div
              ref={(el) => void (flips.current[i] = el)}
              className="relative"
              style={{ width, height, transformStyle: "preserve-3d" }}
            >
              <div
                aria-hidden
                className="absolute inset-x-[3px] top-[3px] rounded-[18px] [backface-visibility:hidden]"
                style={{
                  height,
                  background: METALS[card.finish].edge,
                  transform: "translateZ(-1px)",
                }}
              />
              <div className="absolute inset-0 rounded-[18px] shadow-[0_2px_4px_rgba(0,0,0,0.18),0_24px_44px_-18px_rgba(0,0,0,0.55)] [backface-visibility:hidden]">
                <Front card={card} width={width} />
              </div>
              <div
                className="absolute inset-0 rounded-[18px] shadow-[0_2px_4px_rgba(0,0,0,0.18),0_24px_44px_-18px_rgba(0,0,0,0.55)] [backface-visibility:hidden]"
                style={{ transform: "rotateY(180deg)" }}
              >
                <Back card={card} width={width} />
              </div>
              {/* Shade for cards deeper in the stack. */}
              <div
                data-shade
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[18px] bg-black opacity-0"
                style={{ transform: "translateZ(1px)" }}
              />
            </div>
          </div>
        ))}
      </div>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {`${cards[front]!.bank ?? "Card"} ${cards[front]!.tier ?? ""} ending in ${cards[front]!.number.slice(-4)}${side === "back" ? ", showing the back" : ""}, ${front + 1} of ${n}`}
      </span>
    </div>
  );
});