"use client";

/**
 * BlurAccordion, from https://motion-brew.com/components/blur-accordion
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useVelocity } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// BlurAccordion

/**
 * BlurAccordion
 *
 * Trigger: press. An accordion whose panels open on a spring and smear with a
 * vertical motion blur while they move, scaled by how fast the height changes,
 * so the blur peaks mid-travel and clears as the panel settles. The plus icon
 * folds into a minus, the open row picks up a soft tint, and the content rises
 * out of a light blur. Arrow keys, Home and End move between headers. Reduced
 * motion opens and closes instantly with no blur.
 *
 * Engine: motion/react (spring-driven height motion value, useVelocity feeding
 * an SVG vertical blur, variants on the icon and content).
 */

export interface BlurAccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface BlurAccordionProps {
  /** Rows, top to bottom. Default a short FAQ. */
  items?: BlurAccordionItem[];
  /** Let several panels stay open at once. Default `false`. */
  multiple?: boolean;
  /** Ids open on first render. Default the first item. */
  defaultOpen?: string[];
  /** Strongest vertical blur mid-travel, in px. `0` turns it off. Default `6`. */
  blur?: number;
  /** Spring stiffness for the height. Higher is snappier. Default `380`. */
  stiffness?: number;
  /** Called with the open ids whenever they change. */
  onOpenChange?: (open: string[]) => void;
  className?: string;
}

const DEFAULT_ITEMS: BlurAccordionItem[] = [
  {
    id: "install",
    title: "How do I add a component?",
    content: "Copy the file into your project, or install the package and import it. Each one only needs Motion or GSAP, plus a small cn() helper.",
  },
  {
    id: "motion",
    title: "Does it respect reduced motion?",
    content: "Yes. Every component reads the system setting and swaps travel, blur and springs for instant changes, so nothing moves that does not have to.",
  },
  {
    id: "license",
    title: "Can I use it in client work?",
    content: "Yes. It is free and open source under the MIT license, for personal and commercial projects alike.",
  },
  {
    id: "style",
    title: "How do I change the style?",
    content: "Everything is plain Tailwind. Pass a className to restyle the shell, or edit the copied file directly. Nothing is locked away.",
  },
];

const MASS = 1;
const critical = (k: number) => 2 * Math.sqrt(k * MASS);

const PANEL_CONTENT = {
  closed: { opacity: 0, y: -6, filter: "blur(4px)" },
  open: { opacity: 1, y: 0, filter: "blur(0px)" },
};

interface RowProps {
  item: BlurAccordionItem;
  open: boolean;
  onToggle: () => void;
  blur: number;
  stiffness: number;
  still: boolean;
  uid: string;
  headerRef: (el: HTMLButtonElement | null) => void;
}

function Row({ item, open, onToggle, blur, stiffness, still, uid, headerRef }: RowProps) {
  const filterId = `${uid}-blur-${item.id}`;
  const headerId = `${uid}-h-${item.id}`;
  const panelId = `${uid}-p-${item.id}`;
  const inner = React.useRef<HTMLDivElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const blurNode = React.useRef<SVGFEGaussianBlurElement>(null);
  const placed = React.useRef(false);

  const height = useMotionValue(0);
  const speed = useVelocity(height);

  // Motion blur from the panel's speed, vertical only; the filter is attached only while it moves.
  useMotionValueEvent(speed, "change", (v) => {
    const sd = blur > 0 && !still ? Math.min(blur, Math.abs(v) / 110) : 0;
    blurNode.current?.setAttribute("stdDeviation", `0 ${sd.toFixed(2)}`);
    if (panel.current) panel.current.style.filter = sd > 0.05 ? `url(#${filterId})` : "none";
  });

  React.useLayoutEffect(() => {
    const target = open ? (inner.current?.offsetHeight ?? 0) : 0;
    if (!placed.current || still) {
      height.set(target);
      placed.current = true;
      return;
    }
    const controls = animate(height, target, {
      type: "spring",
      stiffness,
      damping: critical(stiffness) * 0.92,
      mass: MASS,
    });
    return () => controls.stop();
  }, [open, still, stiffness, height]);

  // Follow content size changes while open (fonts loading, resizes).
  React.useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (open && Math.abs(speed.get()) < 1) height.set(el.offsetHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, height, speed]);

  return (
    <motion.div
      initial={false}
      animate={open ? "open" : "closed"}
      className={cn(
        "rounded-[18px] transition-colors duration-300",
        open ? "bg-[#242423]/[0.045] dark:bg-white/[0.06]" : "bg-transparent",
      )}
    >
      <svg aria-hidden className="absolute size-0">
        <filter id={filterId} x="-5%" y="-20%" width="110%" height="140%">
          <feGaussianBlur ref={blurNode} stdDeviation="0 0" />
        </filter>
      </svg>
      <h3 className="m-0">
        <motion.button
          ref={headerRef}
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          whileTap={still ? undefined : { scale: 0.985 }}
          className={cn(
            "group flex w-full cursor-pointer items-center justify-between gap-4 rounded-[18px] px-5 py-4 text-left text-base font-medium outline-none",
            "focus-visible:ring-2 focus-visible:ring-zinc-400",
            open ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
          )}
        >
          {item.title}
          <span
            aria-hidden
            className={cn(
              "relative grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-300",
              open
                ? "bg-[#242423] text-white dark:bg-white dark:text-zinc-900"
                : "bg-[#242423]/6 text-zinc-700 group-hover:bg-[#242423]/11 dark:bg-white/10 dark:text-zinc-200",
            )}
          >
            <span className="absolute h-[1.75px] w-3 rounded-full bg-current" />
            <motion.span
              className="absolute h-3 w-[1.75px] rounded-full bg-current"
              variants={{ closed: { rotate: 0, scaleY: 1 }, open: { rotate: 90, scaleY: 0 } }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
        </motion.button>
      </h3>
      <motion.div
        ref={panel}
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!open}
        style={{ height }}
        className="overflow-hidden"
      >
        <motion.div
          ref={inner}
          variants={PANEL_CONTENT}
          transition={{ duration: still ? 0 : 0.4, ease: [0.22, 1, 0.36, 1], delay: open && !still ? 0.06 : 0 }}
          className="px-5 pb-5 text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400"
        >
          {item.content}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export const BlurAccordion = React.forwardRef<HTMLDivElement, BlurAccordionProps>(function BlurAccordion(
  { items = DEFAULT_ITEMS, multiple = false, defaultOpen, blur = 6, stiffness = 380, onOpenChange, className },
  ref,
) {
  const still = !!useReducedMotion();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const [openIds, setOpenIds] = React.useState<string[]>(defaultOpen ?? (items[0] ? [items[0].id] : []));
  const headers = React.useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      const next = isOpen ? prev.filter((x) => x !== id) : multiple ? [...prev, id] : [id];
      onOpenChange?.(next);
      return next;
    });
  };

  const focusAt = (i: number) => headers.current[(i + items.length) % items.length]?.focus();

  return (
    <div
      ref={ref}
      onKeyDown={(e) => {
        const at = headers.current.indexOf(document.activeElement as HTMLButtonElement);
        if (at < 0) return;
        if (e.key === "ArrowDown") (e.preventDefault(), focusAt(at + 1));
        if (e.key === "ArrowUp") (e.preventDefault(), focusAt(at - 1));
        if (e.key === "Home") (e.preventDefault(), focusAt(0));
        if (e.key === "End") (e.preventDefault(), focusAt(items.length - 1));
      }}
      className={cn(
        "flex w-[420px] max-w-full flex-col gap-1 rounded-[26px] bg-white p-2 dark:bg-zinc-900",
        className,
      )}
    >
      {items.map((item, i) => (
        <Row
          key={item.id}
          item={item}
          open={openIds.includes(item.id)}
          onToggle={() => toggle(item.id)}
          blur={blur}
          stiffness={stiffness}
          still={still}
          uid={uid}
          headerRef={(el) => void (headers.current[i] = el)}
        />
      ))}
    </div>
  );
});