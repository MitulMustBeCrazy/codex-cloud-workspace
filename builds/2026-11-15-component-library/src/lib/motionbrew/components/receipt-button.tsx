"use client";

/**
 * ReceiptButton, from https://motion-brew.com/components/receipt-button
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

// ReceiptButton

/**
 * ReceiptButton
 *
 * Trigger: press, then a timeline. Pressing pay lifts the label away while a
 * success fill washes across the button with a rippling water edge. A check draws itself and "Paid" rises
 * in letter by letter. Then a receipt feeds up from behind the button line by
 * line, like a thermal printer, and is torn off: its bottom edge rips into a
 * zigzag and the slip lifts away with a slight tilt. It resets after a delay,
 * or when the receipt is clicked. Reduced motion jumps straight to the end.
 *
 * Engine: gsap + @gsap/react (one timeline per payment, scoped with useGSAP,
 * contextSafe handlers, clip-path tween for the tear).
 */

gsap.registerPlugin(useGSAP);

export interface ReceiptItem {
  qty: number;
  name: string;
  price: number;
}

export interface ReceiptButtonProps {
  /** Line items on the receipt. The total is their sum. */
  items?: ReceiptItem[];
  /** Currency symbol. Default `"$"`. */
  currency?: string;
  /** Shop name at the top of the receipt. Default `"NORTH ROAST"`. */
  merchant?: string;
  /** Small line under the shop name. Default `"Coffee bar"`. */
  tagline?: string;
  /** Order number printed on the receipt. Default `"1042"`. */
  orderId?: string;
  /** Last line of the receipt. Default `"Thank you, come again"`. */
  footer?: string;
  /** Button label before paying. Default `Pay {total}`. */
  label?: React.ReactNode;
  /** Label once paid. Default `"Paid"`. */
  paidLabel?: string;
  /** How long the processing fill takes, in ms. Default `1200`. */
  processing?: number;
  /** Seconds per printed line. Lower prints faster. Default `0.09`. */
  feedSpeed?: number;
  /** Button color before paying. Default `"#141414"`. */
  color?: string;
  /** Fill and paid color. Default `"#2f8a4f"`. */
  successColor?: string;
  /** Reset this many ms after the tear. `null` keeps the receipt. Default `3200`. */
  resetAfter?: number | null;
  /** Called on press, when payment starts. */
  onPay?: () => void;
  /** Called once the receipt is torn off. */
  onComplete?: () => void;
  className?: string;
}

const DEFAULT_ITEMS: ReceiptItem[] = [
  { qty: 2, name: "Cortado", price: 6.8 },
  { qty: 1, name: "Cardamom bun", price: 4.2 },
  { qty: 1, name: "Sparkling water", price: 2.5 },
];
const TEETH = 18;
const TOOTH = 5;

/** Paper outline with a torn top and a bottom whose tear depth is `bottom` px (0 is a clean edge). */
function paperClip(bottom: number) {
  const pts: string[] = [];
  for (let i = 0; i <= TEETH * 2; i++) pts.push(`${(i / (TEETH * 2)) * 100}% ${i % 2 ? 0 : TOOTH}px`);
  for (let i = TEETH * 2; i >= 0; i--) pts.push(`${(i / (TEETH * 2)) * 100}% calc(100% - ${i % 2 ? bottom : 0}px)`);
  return `polygon(${pts.join(", ")})`;
}

/** Deterministic bar widths from the order id, so a receipt always gets the same barcode. */
function barcode(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 176) {
    h = Math.imul(h ^ (h >>> 13), 2654435761);
    const w = 1 + (Math.abs(h) % 3);
    const gap = 1 + (Math.abs(h >> 7) % 2);
    bars.push({ x, w });
    x += w + gap;
  }
  return bars;
}

const money = (n: number) => n.toFixed(2);

const WAVE_W = 14;
/**
 * Two periods of a vertical sine, filled to its left, in a 14 x 96 box. Drawn at
 * 200% of the button's height and scrolled by half its height, it loops seamlessly.
 */
function wavePath(amplitude: number, phase: number) {
  const pts: string[] = [];
  for (let y = 0; y <= 96; y += 4) {
    const x = WAVE_W / 2 + amplitude * Math.sin((y / 48) * Math.PI * 2 + phase);
    pts.push(`${x.toFixed(2)} ${y}`);
  }
  return `M0 0 L${pts.join(" L")} L0 96 Z`;
}
const WAVE_FRONT = wavePath(4, 0);
const WAVE_BACK = wavePath(5, Math.PI / 1.5);

export const ReceiptButton = React.forwardRef<HTMLDivElement, ReceiptButtonProps>(function ReceiptButton(
  {
    items = DEFAULT_ITEMS,
    currency = "$",
    merchant = "NORTH ROAST",
    tagline = "Coffee bar",
    orderId = "1042",
    footer = "Thank you, come again",
    label,
    paidLabel = "Paid",
    processing = 1200,
    feedSpeed = 0.09,
    color = "#141414",
    successColor = "#2f8a4f",
    resetAfter = 3200,
    onPay,
    onComplete,
    className,
  },
  forwardedRef,
) {
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement);
  const [phase, setPhase] = React.useState<"idle" | "paying" | "printed">("idle");
  const [stamp, setStamp] = React.useState("");
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const bars = React.useMemo(() => barcode(orderId), [orderId]);

  // Start state: receipt hidden below the slot line with a clean bottom edge.
  const { contextSafe } = useGSAP(
    () => {
      gsap.set("[data-receipt]", { yPercent: 100, y: 0, rotation: 0, autoAlpha: 1 });
      gsap.set("[data-paper]", { clipPath: paperClip(0) });
      gsap.set("[data-fill]", { xPercent: -100, x: -WAVE_W });
      gsap.set("[data-part]", { autoAlpha: 0, y: 8 });
      gsap.set("[data-check]", { strokeDashoffset: 24 });
      gsap.set("[data-label]", { autoAlpha: 1, y: 0 });
    },
    { scope: root },
  );

  React.useEffect(() => () => void (resetTimer.current && clearTimeout(resetTimer.current)), []);

  const reset = contextSafe(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    gsap
      .timeline({ onComplete: () => setPhase("idle") })
      .to("[data-receipt]", { y: "+=24", autoAlpha: 0, duration: 0.35, ease: "power2.in" })
      .to("[data-part]", { autoAlpha: 0, y: -8, duration: 0.2, stagger: 0.02 }, "<")
      .to("[data-fill]", { xPercent: 100, x: 0, duration: 0.5, ease: "power3.inOut" }, "<0.1")
      .to("[data-label]", { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.15")
      .add(() => {
        gsap.set("[data-receipt]", { yPercent: 100, y: 0, rotation: 0, autoAlpha: 1 });
        gsap.set("[data-paper]", { clipPath: paperClip(0) });
        gsap.set("[data-check]", { strokeDashoffset: 24 });
        gsap.set("[data-part]", { y: 8 });
        gsap.set("[data-fill]", { xPercent: -100, x: -WAVE_W });
      });
  });

  const pay = contextSafe(() => {
    if (phase !== "idle") return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    setStamp(
      `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${String(now.getFullYear()).slice(2)} · ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    );
    setPhase("paying");
    onPay?.();

    const rows = gsap.utils.toArray<HTMLElement>("[data-row]", root.current);
    const tear = { depth: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("printed");
        onComplete?.();
        if (resetAfter !== null) resetTimer.current = setTimeout(reset, resetAfter);
      },
    });

    // Water edge: two wave layers scroll in opposite directions while the fill rises across.
    const ripples = [
      gsap.fromTo("[data-wave=front]", { yPercent: 0 }, { yPercent: -50, duration: 0.7, ease: "none", repeat: -1 }),
      gsap.fromTo("[data-wave=back]", { yPercent: -50 }, { yPercent: 0, duration: 1.1, ease: "none", repeat: -1 }),
    ];

    tl.to("[data-label]", { autoAlpha: 0, y: -10, duration: 0.25, ease: "power2.in" })
      .to(
        "[data-fill]",
        {
          xPercent: 0,
          x: 0,
          duration: processing / 1000,
          ease: "power2.inOut",
          onComplete: () => ripples.forEach((r) => r.kill()),
        },
        "<",
      )
      .to("[data-check]", { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" })
      .to("[data-part]", { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out", stagger: 0.03 }, "<");

    // Paper feed: one short jerk per printed row, like a thermal printer.
    rows.forEach((_, i) => {
      tl.to("[data-receipt]", {
        yPercent: 100 - ((i + 1) / rows.length) * 100,
        duration: feedSpeed,
        ease: "power1.out",
      }).to({}, { duration: feedSpeed * 0.45 });
    });

    // Tear: a sideways tug, the bottom edge rips, the slip lifts free.
    tl.to("[data-receipt]", { x: -3, duration: 0.05, yoyo: true, repeat: 3, ease: "none" }, "+=0.2")
      .to(tear, {
        depth: TOOTH,
        duration: 0.12,
        ease: "power2.out",
        onUpdate: () => gsap.set("[data-paper]", { clipPath: paperClip(tear.depth) }),
      })
      .to("[data-receipt]", { y: -64, rotation: -3, duration: 0.7, ease: "back.out(1.6)" }, "<");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) tl.progress(1);
  });

  const printed = phase === "printed";

  return (
    <div ref={root} className={cn("relative inline-flex flex-col items-center pt-[26rem]", className)}>
      {/* Slot: clips only below the button's middle, so paper seems to come out of it. */}
      <div
        aria-hidden={phase === "idle"}
        className="absolute bottom-7 left-1/2 w-60 -translate-x-1/2"
        style={{ clipPath: "inset(-40rem -4rem 0 -4rem)" }}
      >
        <div
          data-receipt
          role={printed ? "button" : undefined}
          tabIndex={printed ? 0 : -1}
          onClick={() => printed && reset()}
          onKeyDown={(e) => {
            if (printed && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              reset();
            }
          }}
          aria-label={printed ? "Receipt. Press to dismiss." : undefined}
          className={cn(
            "block w-full text-left drop-shadow-[0_10px_18px_rgba(0,0,0,0.14)] outline-none",
            printed && "cursor-pointer",
          )}
        >
          <div data-paper className="bg-[#fdfcf8] px-5 pb-6 pt-6 font-mono text-[12px] text-zinc-800">
            <div data-row className="text-center">
              <p className="text-lg font-bold tracking-[0.25em] text-zinc-900">{merchant}</p>
              <p className="mt-0.5 uppercase tracking-[0.2em] text-zinc-500">{tagline}</p>
            </div>
            <div data-row className="mt-4 flex justify-between text-zinc-500">
              <span>Order #{orderId}</span>
              <span>{stamp}</span>
            </div>
            <div className="my-3 border-t border-dashed border-zinc-300" />
            {items.map((item) => (
              <div data-row key={item.name} className="flex justify-between py-0.5">
                <span>
                  {item.qty}× {item.name}
                </span>
                <span>{money(item.qty * item.price)}</span>
              </div>
            ))}
            <div className="my-3 border-t border-dashed border-zinc-300" />
            <div data-row className="flex items-baseline justify-between text-sm font-bold text-zinc-900">
              <span>TOTAL</span>
              <span>
                {currency}
                {money(total)}
              </span>
            </div>
            <div data-row className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
              <span>Card · tap</span>
              <span>Approved</span>
            </div>
            <div data-row className="mt-4 flex justify-center">
              <svg width="176" height="36" viewBox="0 0 176 36" aria-hidden>
                {bars.map((bar, i) => (
                  <rect key={i} x={bar.x} y="0" width={bar.w} height="36" fill="#18181b" />
                ))}
              </svg>
            </div>
            <p data-row className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {footer}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={pay}
        aria-disabled={phase !== "idle"}
        aria-live="polite"
        style={{ background: color }}
        className="relative isolate grid h-14 w-72 cursor-pointer place-items-center overflow-hidden rounded-full text-base font-semibold text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 aria-disabled:cursor-default"
      >
        <span data-fill aria-hidden className="absolute inset-0 -z-10" style={{ background: successColor }}>
          {/* Wavy leading edge, just past the fill's right side. */}
          <span className="absolute left-full top-0 h-full overflow-hidden" style={{ width: WAVE_W }}>
            <svg
              data-wave="back"
              viewBox={`0 0 ${WAVE_W} 96`}
              preserveAspectRatio="none"
              className="absolute left-0 top-0 h-[200%] w-full opacity-45"
            >
              <path d={WAVE_BACK} fill={successColor} />
            </svg>
            <svg
              data-wave="front"
              viewBox={`0 0 ${WAVE_W} 96`}
              preserveAspectRatio="none"
              className="absolute left-0 top-0 h-[200%] w-full"
            >
              <path d={WAVE_FRONT} fill={successColor} />
            </svg>
          </span>
        </span>
        <span data-label className="col-start-1 row-start-1">
          {label ?? `Pay ${currency}${money(total)}`}
        </span>
        <span data-paid className="col-start-1 row-start-1 flex items-center gap-2" aria-hidden={phase === "idle"}>
          <svg data-part viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.75}>
            <path data-check d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" />
          </svg>
          <span className="flex" aria-label={paidLabel}>
            {Array.from(paidLabel).map((ch, i) => (
              <span key={i} data-part aria-hidden className="inline-block whitespace-pre">
                {ch}
              </span>
            ))}
          </span>
        </span>
      </button>
    </div>
  );
});