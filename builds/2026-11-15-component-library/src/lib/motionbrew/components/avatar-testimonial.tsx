"use client";

/**
 * AvatarTestimonial, from https://motion-brew.com/components/avatar-testimonial
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
import { Quote, Star } from "lucide-react";
import { animate, AnimatePresence, type AnimationPlaybackControls, motion, useMotionValue, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// AvatarTestimonial

/**
 * AvatarTestimonial
 *
 * Trigger: press (plus a timeline). A testimonial card driven by a row of
 * avatars. The quote reveals word by word, each word rising out of a soft blur,
 * and blurs away before the next one comes in. The card's height glides to fit.
 * The name and role roll in, the stars pop in one after another, and the active
 * avatar wears a ring that fills as time runs down to the next testimonial.
 * The other avatars sit back in gray and come back to color on hover. Click an avatar or use
 * the arrow keys to switch; autoplay pauses while the card is hovered or
 * focused. The avatars are real tabs. Reduced motion swaps quotes with a fade.
 *
 * Engine: motion/react (word blur reveal, height glide, progress ring driven by
 * a pausable animation, rolling captions and staggered stars).
 */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** Photo URL. Without it the avatar shows initials on `color`. */
  avatar?: string;
  /** Avatar color behind the initials. */
  color?: string;
  /** Stars out of five. Default `5`. */
  rating?: number;
}

export interface AvatarTestimonialProps {
  /** Testimonials, one per avatar. Default three. */
  items?: Testimonial[];
  /** Milliseconds each testimonial stays. `0` turns autoplay off. Default `6500`. */
  interval?: number;
  /** Show the star rating. Default `true`. */
  stars?: boolean;
  /** Called with the index when the testimonial changes. */
  onChange?: (index: number) => void;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const PALETTE = [
  "#3d66d6",
  "#d6498f",
  "#269a5a",
  "#9150e0",
  "#cf7a1c",
  "#2a9fbf",
];

const headshot = (id: string) =>
  `https://images.unsplash.com/${id}?w=96&h=96&fit=crop&crop=faces`;

const DEFAULT_ITEMS: Testimonial[] = [
  {
    quote:
      "The motion feels considered, not decorative. Our onboarding finally feels as fast as it actually is.",
    name: "Maya Lindqvist",
    role: "Design lead, Halcyon",
    avatar: headshot("photo-1438761681033-6461ffad8d80"),
  },
  {
    quote:
      "We dropped three components in on a Friday and shipped them Monday. Nobody believed it was that easy.",
    name: "Daniel Okafor",
    role: "Founder, Fieldwork",
    avatar: headshot("photo-1507003211169-0a1dd7228f2d"),
  },
  {
    quote:
      "Every interaction respects reduced motion out of the box. That alone saved us a week of audit work.",
    name: "Priya Raman",
    role: "Product engineer, Lumen",
    avatar: headshot("photo-1534528741775-53994a69daeb"),
  },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Animates its height to fit whatever is inside. */
function AutoHeight({
  children,
  still,
}: {
  children: React.ReactNode;
  still: boolean;
}) {
  const inner = React.useRef<HTMLDivElement>(null);
  const [h, setH] = React.useState<number | "auto">("auto");
  React.useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <motion.div
      animate={{ height: h }}
      initial={false}
      transition={{ duration: still ? 0 : 0.5, ease: GLIDE }}
      className="overflow-hidden"
    >
      <div ref={inner}>{children}</div>
    </motion.div>
  );
}

/** Text that rolls up out of a soft blur when it changes. */
function Roll({
  children,
  still,
  className,
  delay = 0,
}: {
  children: string;
  still: boolean;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={cn("relative grid overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={children}
          initial={
            still
              ? { opacity: 0 }
              : { y: "100%", opacity: 0, filter: "blur(4px)" }
          }
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={
            still
              ? { opacity: 0 }
              : { y: "-100%", opacity: 0, filter: "blur(4px)" }
          }
          transition={{
            duration: still ? 0 : 0.45,
            ease: GLIDE,
            delay: still ? 0 : delay,
          }}
          className="col-start-1 row-start-1 truncate"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export const AvatarTestimonial = React.forwardRef<
  HTMLDivElement,
  AvatarTestimonialProps
>(function AvatarTestimonial(
  { items = DEFAULT_ITEMS, interval = 6500, stars = true, onChange, className },
  ref,
) {
  const still = !!useReducedMotion();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const people = items.map((t, i) => ({
    ...t,
    color: t.color ?? PALETTE[i % PALETTE.length]!,
    rating: t.rating ?? 5,
  }));
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const pausedRef = React.useRef(false);
  pausedRef.current = paused;
  const progress = useMotionValue(0);
  const run = React.useRef<AnimationPlaybackControls | null>(null);
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const current = people[active] ?? people[0]!;

  const select = React.useCallback(
    (i: number) => {
      const next = (i + people.length) % people.length;
      setActive(next);
      onChange?.(next);
    },
    [people.length, onChange],
  );

  // The ring around the active avatar fills over the interval, then the next testimonial comes in.
  React.useEffect(() => {
    run.current?.stop();
    progress.set(0);
    if (!interval || people.length < 2) return;
    run.current = animate(progress, 1, {
      duration: interval / 1000,
      ease: "linear",
      onComplete: () => select(active + 1),
    });
    // Switching while hovered: the new ring waits until the pointer leaves.
    if (pausedRef.current) run.current.pause();
    return () => run.current?.stop();
  }, [active, interval, people.length, progress, select]);

  React.useEffect(() => {
    if (!run.current) return;
    if (paused) run.current.pause();
    else run.current.play();
  }, [paused]);

  const words = current.quote.split(" ");

  return (
    <figure
      ref={ref}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "w-[440px] max-w-full rounded-3xl bg-white px-6 pb-6 pt-6 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {stars ? (
          <span
            className="flex gap-0.5"
            role="img"
            aria-label={`${current.rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <motion.span
                key={`${active}-${i}`}
                initial={
                  still ? false : { scale: 0.3, opacity: 0, rotate: -40 }
                }
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 520,
                  damping: 18,
                  delay: still ? 0 : 0.1 + i * 0.05,
                }}
                className="flex"
              >
                <Star
                  className={cn(
                    "size-4",
                    i < current.rating
                      ? "fill-[#242423] text-[#242423] dark:fill-zinc-100 dark:text-zinc-100"
                      : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700",
                  )}
                  strokeWidth={1.5}
                />
              </motion.span>
            ))}
          </span>
        ) : (
          <span />
        )}
        <span
          className="grid size-9 place-items-center rounded-full bg-[#242423]/6 text-[#242423] dark:bg-white/8 dark:text-zinc-100"
          aria-hidden
        >
          <Quote className="size-4 fill-current" strokeWidth={0} />
        </span>
      </div>

      <AutoHeight still={still}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.blockquote
            key={active}
            id={`${uid}-quote`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${active}`}
            exit={
              still
                ? { opacity: 0 }
                : { opacity: 0, filter: "blur(6px)", y: -4 }
            }
            transition={{ duration: still ? 0.15 : 0.22, ease: "easeIn" }}
            className="pt-6 text-[24px] font-medium leading-[1.35] tracking-tight"
          >
            {/* Word by word: each rises out of a soft blur, a beat after the last. */}
            <span className="sr-only">{current.quote}</span>
            <span aria-hidden>
              {words.map((w, i) => (
                <React.Fragment key={i}>
                  <motion.span
                    className="inline-block"
                    initial={
                      still
                        ? { opacity: 0 }
                        : { opacity: 0, y: "0.35em", filter: "blur(8px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: still ? 0.2 : 0.55,
                      ease: GLIDE,
                      delay: still ? 0 : 0.05 + i * 0.035,
                    }}
                  >
                    {w}
                  </motion.span>{" "}
                </React.Fragment>
              ))}
            </span>
          </motion.blockquote>
        </AnimatePresence>
      </AutoHeight>

      <div className="mt-10 flex items-center justify-between gap-4">
        <figcaption className="min-w-0">
          <Roll
            still={still}
            className="text-[14px] font-semibold tracking-tight"
          >
            {current.name}
          </Roll>
          <Roll
            still={still}
            delay={0.05}
            className="text-[12px] text-zinc-500 dark:text-zinc-400"
          >
            {current.role}
          </Roll>
        </figcaption>

        <div
          role="tablist"
          aria-label="Testimonials"
          className="flex shrink-0 items-center gap-2"
          onKeyDown={(e) => {
            const step =
              e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (!step) return;
            e.preventDefault();
            const next = (active + step + people.length) % people.length;
            select(next);
            tabs.current[next]?.focus();
          }}
        >
          {people.map((p, i) => {
            const on = i === active;
            return (
              <motion.button
                key={p.name}
                ref={(el) => void (tabs.current[i] = el)}
                type="button"
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={on}
                aria-controls={`${uid}-quote`}
                aria-label={p.name}
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                initial={false}
                animate={{
                  scale: 1,
                  opacity: on ? 1 : 0.55,
                  filter: on ? "grayscale(0)" : "grayscale(1)",
                }}
                whileHover={
                  on || still
                    ? undefined
                    : { opacity: 1, filter: "grayscale(0)" }
                }
                whileTap={still ? undefined : { scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative size-9 shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4"
              >
                {/* Progress ring: drawn just outside the avatar, so it never shifts the layout. */}
                {on && interval > 0 && (
                  <svg
                    viewBox="0 0 44 44"
                    className="pointer-events-none absolute -inset-1 size-[calc(100%+8px)] -rotate-90"
                    aria-hidden
                  >
                    <circle
                      cx="22"
                      cy="22"
                      r="20.5"
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeWidth="2"
                    />
                    <motion.circle
                      cx="22"
                      cy="22"
                      r="20.5"
                      fill="none"
                      stroke={p.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{ pathLength: progress }}
                    />
                  </svg>
                )}
                <span
                  className="grid size-full place-items-center overflow-hidden rounded-full text-[12px] font-semibold tracking-tight text-white"
                  style={{ background: p.color }}
                >
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      alt=""
                      className="size-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    initials(p.name)
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </figure>
  );
});