"use client";

/**
 * ReactionCard, from https://motion-brew.com/components/reaction-card
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
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ReactionCard

/**
 * ReactionCard
 *
 * Trigger: hover and press (long press on touch). A white post card with
 * three reaction buttons, each with its own pop-up of choices in the spirit
 * of a social feed. React opens a row of faces, Love a row of coloured
 * hearts, and Boost a row of numbers to add. Hovering a button for a moment,
 * or holding it on touch, springs the pop-up open with each choice rising in
 * turn; the choice under the pointer swells and lifts with its name above
 * it. Picking one closes the pop-up, pops the choice into the button with a
 * small burst of copies flying out, and rolls the count. A quick press
 * without opening the pop-up toggles the first choice, and Boost adds one
 * each time with a +1 that floats up. The summary line above the buttons
 * stacks the faces picked so far. With the keyboard, Arrow Up opens a
 * pop-up, arrows move through it, Enter picks and Escape closes. Reduced
 * motion swaps the springs and bursts for fades.
 *
 * Engine: motion/react (spring pop-ups, staggered choices, bursts and
 * rolling counts).
 */

export interface Reaction {
  key: string;
  /** What shows in the pop-up and on the button. */
  emoji: string;
  /** Name shown above it in the pop-up and on the button once picked. */
  label: string;
  /** For Boost style buttons, how much a pick adds. */
  amount?: number;
}

export interface ReactionCardProps {
  /** Who posted. Default `"Maya Lindqvist"`. */
  author?: string;
  /** Their photo. */
  avatar?: string;
  /** When they posted. Default `"2h"`. */
  time?: string;
  /** The post itself. */
  text?: string;
  /** Faces for the React button. */
  faces?: Reaction[];
  /** Hearts for the Love button. */
  hearts?: Reaction[];
  /** Amounts for the Boost button. */
  boosts?: Reaction[];
  /** Reactions before yours. Default `128`. */
  reactions?: number;
  /** Loves before yours. Default `64`. */
  loves?: number;
  /** Boost total before yours. Default `320`. */
  boosted?: number;
  /** Called whenever any button changes, with all three values. */
  onChange?: (state: {
    face: string | null;
    heart: string | null;
    boost: number;
  }) => void;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 520, damping: 26 } as const;
const OPEN_DELAY = 380;
const CLOSE_DELAY = 280;

const DEFAULT_FACES: Reaction[] = [
  { key: "like", emoji: "👍", label: "Like" },
  { key: "love", emoji: "😍", label: "Adore" },
  { key: "haha", emoji: "😂", label: "Haha" },
  { key: "wow", emoji: "😮", label: "Wow" },
  { key: "sad", emoji: "😢", label: "Sad" },
  { key: "angry", emoji: "😡", label: "Angry" },
];

const DEFAULT_HEARTS: Reaction[] = [
  { key: "red", emoji: "❤️", label: "Love" },
  { key: "pink", emoji: "🩷", label: "Sweet" },
  { key: "orange", emoji: "🧡", label: "Warm" },
  { key: "green", emoji: "💚", label: "Fresh" },
  { key: "blue", emoji: "💙", label: "Calm" },
  { key: "purple", emoji: "💜", label: "Dreamy" },
];

const DEFAULT_BOOSTS: Reaction[] = [
  { key: "1", emoji: "+1", label: "Nice", amount: 1 },
  { key: "5", emoji: "+5", label: "Great", amount: 5 },
  { key: "10", emoji: "+10", label: "Superb", amount: 10 },
  { key: "25", emoji: "+25", label: "Epic", amount: 25 },
  { key: "50", emoji: "+50", label: "Legend", amount: 50 },
];

const DEFAULT_TEXT =
  "Shipped the new onboarding today. Three screens instead of seven, and the first test group finished it in under a minute.";

const format = (n: number) =>
  n >= 10_000
    ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`
    : n.toLocaleString("en-US");

/** A number or label that rolls up out of a blur when it changes. */
function Rolling({
  text,
  still,
  down = false,
}: {
  text: string;
  still: boolean;
  down?: boolean;
}) {
  const from = down ? "-70%" : "70%";
  const to = down ? "70%" : "-70%";
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="whitespace-nowrap tabular-nums"
          initial={
            still
              ? { opacity: 0 }
              : { opacity: 0, y: from, filter: "blur(3px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            still ? { opacity: 0 } : { opacity: 0, y: to, filter: "blur(3px)" }
          }
          transition={{ duration: 0.3, ease: GLIDE }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Copies of the picked choice that fly out of the button and fade. */
function Burst({ emoji, still }: { emoji: string; still: boolean }) {
  if (still) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return (
          <motion.span
            key={i}
            className="absolute text-xs"
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{
              x: Math.cos(a) * 26,
              y: Math.sin(a) * 22 - 6,
              scale: 0.9,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {emoji}
          </motion.span>
        );
      })}
    </span>
  );
}

interface ButtonProps {
  name: string;
  /** What shows before anything is picked. */
  rest: React.ReactNode;
  options: Reaction[];
  /** "pick" keeps one choice and toggles it; "add" keeps adding amounts. */
  mode: "pick" | "add";
  picked: string | null;
  count: number;
  onPick: (r: Reaction | null) => void;
  /** Which edge the pop-up lines up with, so it stays inside the card. */
  align: "start" | "center" | "end";
  still: boolean;
}

/** One reaction button with its pop-up of choices. */
function ReactionButton({
  name,
  rest,
  options,
  mode,
  picked,
  count,
  onPick,
  align,
  still,
}: ButtonProps) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState<number>(-1);
  const [burst, setBurst] = React.useState<{ n: number; emoji: string } | null>(
    null,
  );
  const [floats, setFloats] = React.useState<{ n: number; text: string }[]>([]);
  const timer = React.useRef<number>(0);
  const held = React.useRef(false);
  const button = React.useRef<HTMLButtonElement>(null);
  const items = React.useRef<(HTMLButtonElement | null)[]>([]);
  const current = options.find((o) => o.key === picked) ?? null;

  const later = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const choose = (r: Reaction | null, keyboard = false) => {
    setOpen(false);
    setHover(-1);
    onPick(r);
    if (r) {
      setBurst({
        n: Date.now(),
        emoji: r.emoji.startsWith("+") ? "✨" : r.emoji,
      });
      // Clear the burst once it has flown, so its copies leave the page.
      window.setTimeout(() => setBurst(null), 700);
      if (mode === "add")
        setFloats((f) => [...f.slice(-3), { n: Date.now(), text: r.emoji }]);
    }
    if (keyboard) button.current?.focus();
  };

  // A quick press toggles the first choice; Boost adds one every time.
  const quick = () => {
    if (held.current) {
      held.current = false;
      return;
    }
    if (open) return;
    if (mode === "add") return choose(options[0]!);
    choose(current ? null : options[0]!);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
        setHover(0);
        requestAnimationFrame(() => items.current[0]?.focus());
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      button.current?.focus();
    }
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (step) {
      e.preventDefault();
      const next = (hover + step + options.length) % options.length;
      setHover(next);
      items.current[next]?.focus();
    }
  };

  const label = mode === "pick" && current ? current.label : name;

  return (
    <div
      className="relative flex-1"
      onPointerEnter={(e) =>
        e.pointerType === "mouse" && later(() => setOpen(true), OPEN_DELAY)
      }
      onPointerLeave={(e) =>
        e.pointerType === "mouse" && later(() => setOpen(false), CLOSE_DELAY)
      }
      onKeyDown={onKey}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-menu`}
            role="menu"
            aria-label={`${name} choices`}
            initial={
              still
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.9, filter: "blur(4px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              still
                ? { opacity: 0 }
                : { opacity: 0, y: 6, scale: 0.95, filter: "blur(4px)" }
            }
            transition={{ duration: 0.22, ease: GLIDE }}
            style={{
              transformOrigin:
                align === "start"
                  ? "0% 100%"
                  : align === "end"
                    ? "100% 100%"
                    : "50% 100%",
            }}
            onPointerEnter={() => window.clearTimeout(timer.current)}
            onPointerLeave={() => setHover(-1)}
            className={cn(
              "absolute bottom-full z-30 mb-3 flex items-end gap-1",
              align === "start" && "left-0",
              align === "center" && "left-1/2 -translate-x-1/2",
              align === "end" && "right-0",
              "rounded-full bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_40px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10",
            )}
          >
            {options.map((o, i) => {
              const on = hover === i;
              const number = o.emoji.startsWith("+");
              return (
                <motion.button
                  key={o.key}
                  ref={(el) => void (items.current[i] = el)}
                  type="button"
                  role="menuitemradio"
                  aria-checked={o.key === picked}
                  aria-label={o.label}
                  tabIndex={on ? 0 : -1}
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onClick={(e) => choose(o, e.detail === 0)}
                  initial={still ? false : { opacity: 0, y: 12, scale: 0.4 }}
                  animate={{
                    opacity: 1,
                    y: on && !still ? -8 : 0,
                    scale: on && !still ? 1.35 : 1,
                  }}
                  transition={{
                    ...SPRING,
                    delay: still ? 0 : on ? 0 : i * 0.035,
                  }}
                  className={cn(
                    "relative grid size-10 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                    number
                      ? "bg-zinc-100 text-xs font-semibold tabular-nums text-zinc-900 dark:bg-white/10 dark:text-zinc-100"
                      : "text-2xl",
                  )}
                >
                  <span aria-hidden>{o.emoji}</span>
                  <AnimatePresence>
                    {on && (
                      <motion.span
                        initial={{ opacity: 0, y: 4, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 / 1.35 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="pointer-events-none absolute bottom-full mb-1.5 whitespace-nowrap rounded-full bg-[#242423] px-2.5 py-1 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
                      >
                        {o.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        aria-pressed={mode === "pick" ? !!current : undefined}
        aria-label={`${label}, ${count}`}
        onClick={quick}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          held.current = false;
          later(() => {
            held.current = true;
            setOpen(true);
          }, 420);
        }}
        onPointerUp={(e) =>
          e.pointerType !== "mouse" &&
          !held.current &&
          window.clearTimeout(timer.current)
        }
        onContextMenu={(e) => e.preventDefault()}
        whileTap={still ? undefined : { scale: 0.94 }}
        className={cn(
          "relative flex h-11 w-full cursor-pointer select-none items-center justify-center gap-2 rounded-full text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 [-webkit-touch-callout:none]",
          (mode === "pick" && current) ||
            (mode === "add" && count > 0 && current)
            ? "bg-zinc-200/80 text-zinc-900 dark:bg-white/12 dark:text-zinc-100"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10",
        )}
      >
        <span className="relative grid size-5 place-items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={mode === "add" ? "rest" : (current?.key ?? "rest")}
              className={cn(
                "grid place-items-center",
                current && mode === "pick" && "text-lg leading-none",
              )}
              initial={
                still ? { opacity: 0 } : { scale: 0.2, opacity: 0, rotate: -30 }
              }
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={still ? { opacity: 0 } : { scale: 0.2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
            >
              {mode === "pick" && current ? current.emoji : rest}
            </motion.span>
          </AnimatePresence>
          {burst && <Burst key={burst.n} emoji={burst.emoji} still={still} />}
        </span>
        <Rolling text={label} still={still} />
        <AnimatePresence>
          {floats.map((f) => (
            <motion.span
              key={f.n}
              aria-hidden
              className="pointer-events-none absolute -top-2 right-6 rounded-full bg-[#242423] px-2 py-0.5 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
              initial={{ opacity: 0, y: 6, scale: 0.6 }}
              animate={{ opacity: [0, 1, 1, 0], y: -26, scale: 1 }}
              transition={{ duration: still ? 0.3 : 0.9, ease: "easeOut" }}
              onAnimationComplete={() =>
                setFloats((all) => all.filter((x) => x.n !== f.n))
              }
            >
              {f.text}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

export const ReactionCard = React.forwardRef<HTMLDivElement, ReactionCardProps>(
  function ReactionCard(
    {
      author = "Maya Lindqvist",
      avatar = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces",
      time = "2h",
      text = DEFAULT_TEXT,
      faces = DEFAULT_FACES,
      hearts = DEFAULT_HEARTS,
      boosts = DEFAULT_BOOSTS,
      reactions = 128,
      loves = 64,
      boosted = 320,
      onChange,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const [face, setFace] = React.useState<string | null>(null);
    const [heart, setHeart] = React.useState<string | null>(null);
    const [boost, setBoost] = React.useState(0);
    const [lastBoost, setLastBoost] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState("");

    const changed = React.useRef(false);
    React.useEffect(() => {
      if (!changed.current) return void (changed.current = true);
      onChange?.({ face, heart, boost });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [face, heart, boost]);

    // The summary stacks the most common faces, with yours in front once picked.
    const mine = faces.find((f) => f.key === face);
    const stack = [mine, ...faces.filter((f) => f.key !== face)]
      .filter(Boolean)
      .slice(0, 3) as Reaction[];
    const total = reactions + (face ? 1 : 0);

    return (
      <div
        ref={ref}
        className={cn(
          "w-[400px] max-w-full rounded-3xl bg-white p-6 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt=""
            draggable={false}
            className="size-10 rounded-full bg-zinc-200 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{author}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{time}</p>
          </div>
        </div>
        <p className="mt-4 text-base leading-relaxed">{text}</p>

        {/* Summary: the faces picked so far, then the numbers for all three buttons. */}
        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex -space-x-1">
              <AnimatePresence initial={false} mode="popLayout">
                {stack.map((f, i) => (
                  <motion.span
                    key={f.key}
                    layout
                    className="grid size-7 place-items-center rounded-full bg-zinc-100 text-sm ring-2 ring-white dark:bg-zinc-800 dark:ring-zinc-900"
                    style={{ zIndex: 3 - i }}
                    initial={still ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={still ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                    transition={SPRING}
                  >
                    {f.emoji}
                  </motion.span>
                ))}
              </AnimatePresence>
            </span>
            <span className="truncate">
              {face ? (
                <>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    You
                  </span>{" "}
                  and <Rolling text={format(total - 1)} still={still} /> others
                </>
              ) : (
                <>
                  <Rolling text={format(total)} still={still} /> reactions
                </>
              )}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2 text-xs">
            <span>
              <Rolling text={format(loves + (heart ? 1 : 0))} still={still} />{" "}
              loves
            </span>
            <span
              aria-hidden
              className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-600"
            />
            <span>
              <Rolling text={format(boosted + boost)} still={still} /> boosts
            </span>
          </span>
        </div>

        <div className="-mx-6 mt-4 h-px bg-zinc-100 dark:bg-white/8" />

        <div className="mt-4 flex gap-2">
          <ReactionButton
            name="React"
            rest={
              <svg
                viewBox="0 0 20 20"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="10" cy="10" r="7.25" />
                <path d="M7.25 11.75c.75 1 1.65 1.5 2.75 1.5s2-.5 2.75-1.5" />
                <circle
                  cx="7.5"
                  cy="8.25"
                  r=".9"
                  fill="currentColor"
                  stroke="none"
                />
                <circle
                  cx="12.5"
                  cy="8.25"
                  r=".9"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            }
            options={faces}
            mode="pick"
            align="start"
            picked={face}
            count={total}
            onPick={(r) => {
              setFace(r?.key ?? null);
              setStatus(r ? `Reacted with ${r.label}.` : "Reaction removed.");
            }}
            still={still}
          />
          <ReactionButton
            name="Love"
            rest={
              <svg
                viewBox="0 0 20 20"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M10 16.25s-6.25-3.6-6.25-8.1A3.4 3.4 0 0 1 10 6.35a3.4 3.4 0 0 1 6.25 1.8c0 4.5-6.25 8.1-6.25 8.1Z" />
              </svg>
            }
            options={hearts}
            mode="pick"
            align="center"
            picked={heart}
            count={loves + (heart ? 1 : 0)}
            onPick={(r) => {
              setHeart(r?.key ?? null);
              setStatus(r ? `Loved with ${r.label}.` : "Love removed.");
            }}
            still={still}
          />
          <ReactionButton
            name="Boost"
            rest={
              <svg
                viewBox="0 0 20 20"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M10 16V4.5M5.5 9 10 4.5 14.5 9" />
              </svg>
            }
            options={boosts}
            mode="add"
            align="end"
            picked={lastBoost}
            count={boosted + boost}
            onPick={(r) => {
              if (!r) return;
              setBoost((b) => b + (r.amount ?? 1));
              setLastBoost(r.key);
              setStatus(`Boosted by ${r.amount ?? 1}.`);
            }}
            still={still}
          />
        </div>

        <span role="status" aria-live="polite" className="sr-only">
          {status}
        </span>
      </div>
    );
  },
);