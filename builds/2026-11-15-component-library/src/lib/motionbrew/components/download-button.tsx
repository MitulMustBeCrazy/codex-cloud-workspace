"use client";

/**
 * DownloadButton, from https://motion-brew.com/components/download-button
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
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

// DownloadButton

/**
 * DownloadButton
 *
 * Trigger: press (plus hover). An ink pill that shows a download from start
 * to finish. The icon is a page with a folded corner and an arrow on it; on
 * hover the arrow eases down a touch. A press sets the arrow floating on a
 * slow, even bob while the page fills from the bottom like liquid, its
 * surface rolling gently sideways and rising in step with the progress. A
 * lighter fill sweeps across the button behind a softly waving edge, the
 * label rolls to Downloading and a percentage counts up in uneven bursts the
 * way real downloads do. At the end the arrow settles and shrinks away, the
 * corner gives a little flip, a check draws on the page, the button turns
 * green and the label rolls to Downloaded with the file size. Pressing again
 * resets it. Progress is announced at the start and end, and reduced motion
 * keeps the fills but drops the bob and the rolling surface.
 *
 * Engine: gsap + @gsap/react (one timeline per download for the fill, the
 * percentage and the icon, scoped with useGSAP), with motion/react for the
 * rolling label.
 */

gsap.registerPlugin(useGSAP);

export interface DownloadButtonProps {
  /** Label at rest. Default `"Download"`. */
  label?: string;
  /** File size shown once done. Default `"4.2 MB"`. */
  size?: string;
  /** Seconds the demo download takes. Default `2.6`. */
  duration?: number;
  /**
   * Called on press. Return a promise to hold the fill near the end until it
   * settles; a rejection resets the button.
   */
  onDownload?: () => void | Promise<unknown>;
  className?: string;
}

type Phase = "idle" | "loading" | "done";

const GLIDE = [0.22, 1, 0.36, 1] as const;
const INK = "#242423";
const SUCCESS = "#269a5a";

/** A label that rolls up out of a blur whenever it changes. */
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

export const DownloadButton = React.forwardRef<
  HTMLButtonElement,
  DownloadButtonProps
>(function DownloadButton(
  {
    label = "Download",
    size = "4.2 MB",
    duration = 2.6,
    onDownload,
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const root = React.useRef<HTMLButtonElement>(null);
  React.useImperativeHandle(ref, () => root.current as HTMLButtonElement);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const clip = `${React.useId().replace(/:/g, "")}-clip`;
  const timeline = React.useRef<gsap.core.Timeline | null>(null);
  const bob = React.useRef<gsap.core.Tween | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      gsap.set("[data-fill]", { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set("[data-check]", { strokeDashoffset: 1 });
      gsap.set("[data-liquid]", { y: 16 });
      gsap.set("[data-arrow]", {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        svgOrigin: "9.75 10.75",
      });
      gsap.set("[data-bg]", { backgroundColor: INK });
      if (still) return;
      // The fill's waving edge and the liquid's surface roll forever; they only show while filling.
      gsap.to("[data-wave]", {
        yPercent: -50,
        duration: 0.9,
        ease: "none",
        repeat: -1,
      });
      gsap.to("[data-surface]", {
        x: -8,
        duration: 1.2,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: root },
  );

  const hover = contextSafe((on: boolean) => {
    if (phase !== "idle" || still) return;
    gsap.to("[data-arrow]", {
      y: on ? 1.5 : 0,
      duration: 0.45,
      ease: "sine.inOut",
    });
  });

  const reset = contextSafe(() => {
    timeline.current?.kill();
    bob.current?.kill();
    gsap.to("[data-fill]", {
      scaleX: 0,
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.inOut",
    });
    gsap.to("[data-bg]", { backgroundColor: INK, duration: 0.3 });
    gsap.to("[data-check]", { strokeDashoffset: 1, duration: 0.2 });
    gsap.to("[data-liquid]", {
      y: 16,
      autoAlpha: 1,
      duration: 0.5,
      ease: "sine.inOut",
    });
    gsap.fromTo(
      "[data-arrow]",
      { y: -3, autoAlpha: 0, scale: 1 },
      { y: 0, autoAlpha: 1, duration: 0.5, ease: "sine.out", delay: 0.15 },
    );
    setPhase("idle");
  });

  const start = contextSafe(() => {
    setPhase("loading");
    const pct = root.current!.querySelector<HTMLElement>("[data-pct]")!;
    const liquid = root.current!.querySelector<SVGElement>("[data-liquid]")!;
    const state = { p: 0 };
    // The number and the page's liquid move together.
    const show = () => {
      pct.textContent = `${Math.round(state.p * 100)}%`;
      gsap.set(liquid, { y: 16 * (1 - state.p) });
    };
    show();

    // Uneven bursts read like a real download: quick, stall, quick, crawl.
    const d = Math.max(0.6, duration);
    const steps: [number, number][] = [
      [0.34, 0.24],
      [0.41, 0.14],
      [0.78, 0.3],
      [0.92, 0.18],
    ];
    const tl = gsap.timeline();
    timeline.current = tl;

    // The arrow floats on a slow, even bob while the page fills.
    bob.current = still
      ? null
      : gsap.to("[data-arrow]", {
          y: 1.75,
          duration: 0.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

    steps.forEach(([to, share]) =>
      tl.to(state, {
        p: to,
        duration: d * share,
        ease: "power2.out",
        onUpdate: show,
      }),
    );
    tl.to("[data-fill]", { scaleX: 0.92, duration: d * 0.86, ease: "none" }, 0);

    const pending = Promise.resolve(onDownload?.());
    tl.add(() => {
      tl.pause();
      pending.then(
        () => tl.resume(),
        () => reset(),
      );
    });

    // Landing: the last stretch, then the arrow settles away, the corner flips and a check draws.
    tl.to(state, {
      p: 1,
      duration: d * 0.14,
      ease: "power2.inOut",
      onUpdate: show,
    })
      .to(
        "[data-fill]",
        { scaleX: 1, duration: d * 0.14, ease: "power2.inOut" },
        "<",
      )
      .add(() => {
        bob.current?.kill();
        setPhase("done");
      })
      .to("[data-arrow]", {
        y: 0,
        autoAlpha: 0,
        scale: 0.5,
        duration: 0.3,
        ease: "sine.in",
      })
      .to("[data-liquid]", { autoAlpha: 0, duration: 0.35 }, "<")
      .to("[data-bg]", { backgroundColor: SUCCESS, duration: 0.35 }, "<")
      .to("[data-fill]", { autoAlpha: 0, duration: 0.3 }, "<")
      .fromTo(
        "[data-fold]",
        { scale: 1 },
        {
          scale: 1.35,
          duration: 0.18,
          ease: "sine.out",
          yoyo: true,
          repeat: 1,
          svgOrigin: "15.5 2.5",
        },
        "<0.05",
      )
      .to(
        "[data-check]",
        { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" },
        "-=0.1",
      )
      .set("[data-fill]", { scaleX: 0, autoAlpha: 1 });
  });

  const press = () => {
    if (phase === "idle") start();
    else if (phase === "done") reset();
  };

  const text =
    phase === "loading"
      ? "Downloading"
      : phase === "done"
        ? "Downloaded"
        : label;

  return (
    <motion.button
      ref={root}
      type="button"
      onClick={press}
      onPointerEnter={() => hover(true)}
      onPointerLeave={() => hover(false)}
      aria-busy={phase === "loading"}
      whileTap={still || phase === "loading" ? undefined : { scale: 0.97 }}
      className={cn(
        "group relative flex h-12 w-[240px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-full text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
        phase === "loading" && "cursor-progress",
        className,
      )}
    >
      <span
        data-bg
        aria-hidden
        className="absolute inset-0"
        style={{ background: INK }}
      />
      {/* The fill and its waving edge. */}
      <span data-fill aria-hidden className="absolute inset-y-0 left-0 w-full">
        <span className="absolute inset-0 bg-white/14" />
        <span className="absolute -right-2 top-0 h-full w-2 overflow-hidden">
          <svg
            data-wave
            viewBox="0 0 8 96"
            preserveAspectRatio="none"
            className="absolute left-0 top-0 h-[200%] w-2 fill-white/14"
          >
            <path d="M0 0h2c3 6 3 6 0 12s-3 6 0 12 3 6 0 12-3 6 0 12 3 6 0 12-3 6 0 12 3 6 0 12-3 6 0 12H0Z" />
          </svg>
        </span>
      </span>

      <span className="relative flex items-center gap-2">
        <svg
          viewBox="0 0 20 20"
          className="size-5 overflow-visible"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {/* The page's shape, used to keep the liquid inside it. */}
          <clipPath id={clip}>
            <path d="M5.5 2.5h6l4 4v9.75a1.5 1.5 0 0 1-1.5 1.5H5.5a1.5 1.5 0 0 1-1.5-1.5V4a1.5 1.5 0 0 1 1.5-1.5Z" />
          </clipPath>
          {/* Liquid that rises with the progress; its surface rolls sideways. */}
          <g clipPath={`url(#${clip})`}>
            <g data-liquid>
              <path
                data-surface
                d="M0 2.5q2-1.5 4 0t4 0 4 0 4 0 4 0 4 0 4 0V22H0Z"
                fill="currentColor"
                fillOpacity="0.35"
                stroke="none"
              />
            </g>
          </g>
          {/* Page and folded corner */}
          <path d="M11.5 2.5h-6A1.5 1.5 0 0 0 4 4v12.25a1.5 1.5 0 0 0 1.5 1.5H14a1.5 1.5 0 0 0 1.5-1.5V6.5" />
          <path data-fold d="M11.5 2.5v3.25a.75.75 0 0 0 .75.75h3.25Z" />
          {/* Arrow on the page */}
          <g data-arrow>
            <path d="M9.75 8.25v5" />
            <path d="m7.75 11.25 2 2 2-2" />
          </g>
          {/* Check that draws on the page once done */}
          <path
            data-check
            d="m7.25 12 1.75 1.75 3.5-3.75"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </svg>
        <Rolling text={text} still={still} />
        <span
          data-pct
          className={cn(
            "tabular-nums text-white/70 transition-opacity duration-200",
            phase === "loading" ? "opacity-100" : "hidden",
          )}
        />
        {phase === "done" && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: GLIDE, delay: 0.15 }}
            className="text-white/75"
          >
            {size}
          </motion.span>
        )}
      </span>

      <span role="status" aria-live="polite" className="sr-only">
        {phase === "loading"
          ? "Downloading."
          : phase === "done"
            ? `Download complete, ${size}.`
            : ""}
      </span>
    </motion.button>
  );
});