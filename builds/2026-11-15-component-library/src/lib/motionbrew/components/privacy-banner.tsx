"use client";

/**
 * PrivacyBanner, from https://motion-brew.com/components/privacy-banner
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// PrivacyBanner

/**
 * PrivacyBanner
 *
 * Trigger: press (plus hover and in view). A white cookie consent card. It
 * rises in from below while its outline cookie rolls in and settles; hovering
 * the cookie makes its chips hop and takes a bite out of it. Three actions sit
 * at the bottom: Customize, Reject all and an ink Accept all whose arrow slides
 * through on hover. Customize grows the card on a spring to show a switch for
 * each kind of cookie (essential stays on), and its button becomes Save
 * choices. Any choice turns the whole card into a short confirmation: a check
 * draws itself in a circle, the title rolls to what was chosen, and a small
 * link opens the settings again. Reduced motion keeps the states without
 * movement.
 *
 * Engine: motion/react (a layout animation for the card's height,
 * AnimatePresence for the panel and the confirmation, springs for the
 * switches, pathLength for the check, variants on the cookie's SVG parts).
 */

export interface CookieKind {
  id: string;
  label: string;
  description: string;
  /** Always on and cannot be switched off. */
  required?: boolean;
}

export type CookieChoices = Record<string, boolean>;

export interface PrivacyBannerProps {
  title?: string;
  description?: React.ReactNode;
  /** The kinds of cookie shown under Customize. Default essential, analytics, marketing. */
  kinds?: CookieKind[];
  /** Called with every kind switched on. */
  onAccept?: (choices: CookieChoices) => void;
  /** Called with only the required kinds on. */
  onReject?: (choices: CookieChoices) => void;
  /** Called with the switches as set under Customize. */
  onSave?: (choices: CookieChoices) => void;
  className?: string;
}

const DEFAULT_KINDS: CookieKind[] = [
  {
    id: "essential",
    label: "Essential",
    description: "Sign in, security and your basket.",
    required: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Helps us see which pages work.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Ads that match what you like.",
  },
];

const GLIDE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/** An outline cookie. It rolls in, and on hover its chips hop and a bite is taken. */
function CookieIcon({ hover, still }: { hover: boolean; still: boolean }) {
  const chips: [number, number][] = [
    [8.5, 8.5],
    [16, 15.5],
    [12, 17],
    [11, 12],
    [7, 14.5],
  ];
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-5 overflow-visible"
      initial={still ? false : { rotate: -120, x: -14, opacity: 0 }}
      animate={{
        rotate: hover && !still ? [0, -10, 6, 0] : 0,
        x: 0,
        opacity: 1,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.2 }}
    >
      {/* The edge, with a bite that deepens on hover. */}
      <motion.path
        initial={false}
        animate={{
          d:
            hover && !still
              ? "M12 2a10 10 0 1 0 10 10 5.2 5.2 0 0 1-6-6 5.2 5.2 0 0 1-4-4"
              : "M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      />
      {chips.map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={0.6}
          fill="currentColor"
          initial={false}
          animate={{ y: hover && !still ? [0, -2, 0] : 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
        />
      ))}
      {/* Crumbs that fall from the bite. */}
      {[0, 1].map((i) => (
        <motion.circle
          key={`c${i}`}
          cx={19 + i * 2}
          cy={7 + i}
          r={0.6}
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={
            hover && !still
              ? { y: [0, 8], opacity: [1, 0] }
              : { y: 0, opacity: 0 }
          }
          transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: "easeIn" }}
        />
      ))}
    </motion.svg>
  );
}

/** A small spring switch. */
function Switch({
  on,
  disabled,
  onChange,
  label,
  still,
}: {
  on: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
  still: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn(
        "relative flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        on
          ? "justify-end bg-[#242423] dark:bg-zinc-100"
          : "justify-start bg-[#242423]/15 dark:bg-white/15",
        disabled && "opacity-50",
      )}
    >
      <motion.span
        layout
        transition={
          still
            ? { duration: 0 }
            : { type: "spring", stiffness: 600, damping: 32 }
        }
        className="size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:bg-zinc-900"
      />
    </button>
  );
}

type Done = "accept" | "reject" | "save";

export const PrivacyBanner = React.forwardRef<
  HTMLDivElement,
  PrivacyBannerProps
>(function PrivacyBanner(
  {
    title = "Cookies, your call",
    description = "We use a few cookies to keep things running and to learn what works. Pick what you are happy with; you can change it any time.",
    kinds = DEFAULT_KINDS,
    onAccept,
    onReject,
    onSave,
    className,
  },
  ref,
) {
  const still = !!useReducedMotion();
  const root = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => root.current!);
  const inView = useInView(root, { once: true, amount: 0.4 });
  const shown = inView || still;

  const all = (v: boolean) =>
    Object.fromEntries(
      kinds.map((k) => [k.id, k.required ? true : v]),
    ) as CookieChoices;
  const [choices, setChoices] = React.useState<CookieChoices>(() => all(false));
  const [custom, setCustom] = React.useState(false);
  const [done, setDone] = React.useState<Done | null>(null);
  const [cookieHover, setCookieHover] = React.useState(false);

  const finish = (kind: Done) => {
    if (kind === "accept") {
      const c = all(true);
      setChoices(c);
      onAccept?.(c);
    } else if (kind === "reject") {
      const c = all(false);
      setChoices(c);
      onReject?.(c);
    } else onSave?.(choices);
    setDone(kind);
  };

  const on = kinds.filter((k) => choices[k.id]).length;
  const summary =
    done === "accept"
      ? "All cookies are on."
      : on <= kinds.filter((k) => k.required).length
        ? "Only the essentials are on."
        : `${on} of ${kinds.length} kinds are on.`;

  const fade = {
    initial: still ? false : { opacity: 0, y: 8, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: still ? undefined : { opacity: 0, y: -6, filter: "blur(4px)" },
    transition: { duration: 0.3, ease: GLIDE },
  } as const;

  return (
    <motion.div
      ref={root}
      layout
      role="region"
      aria-label="Cookie settings"
      initial={still ? false : { opacity: 0, y: 40 }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...SPRING, layout: still ? { duration: 0 } : SPRING }}
      className={cn(
        "@container w-[400px] max-w-full overflow-hidden rounded-3xl bg-white p-6 text-[#242423] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
      style={{ borderRadius: 24 }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {done ? (
          <motion.div key="done" {...fade} className="flex items-center gap-4">
            {/* A check that draws itself inside a circle. */}
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#269a5a]/10 text-[#269a5a]">
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  initial={still ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, delay: 0.15, ease: GLIDE }}
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold tracking-tight">
                You are all set
              </p>
              <p
                className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400"
                role="status"
              >
                {summary}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setCustom(true);
              }}
              className="h-9 shrink-0 cursor-pointer rounded-full px-3 text-sm font-medium text-zinc-500 outline-none transition-colors hover:bg-[#242423]/[0.05] hover:text-[#242423] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Change
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="ask"
            {...fade}
            transition={{ ...fade.transition, delay: 0 }}
          >
            <div className="flex items-center gap-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[#242423]/[0.06] dark:bg-white/[0.08]"
                onPointerEnter={() => setCookieHover(true)}
                onPointerLeave={() => setCookieHover(false)}
              >
                <CookieIcon hover={cookieHover} still={still} />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            </div>
            <p className="mt-3 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              {description}
            </p>

            {/* The settings panel, grown in on Customize. */}
            <AnimatePresence initial={false}>
              {custom && (
                <motion.div
                  key="panel"
                  initial={still ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={still ? undefined : { height: 0, opacity: 0 }}
                  transition={{ ...SPRING, opacity: { duration: 0.2 } }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 divide-y divide-black/5 rounded-2xl bg-[#242423]/[0.04] px-4 dark:divide-white/10 dark:bg-white/[0.04]">
                    {kinds.map((k, i) => (
                      <motion.div
                        key={k.id}
                        className="flex items-center gap-3 py-3"
                        initial={still ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.08 + i * 0.05,
                          ease: GLIDE,
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {k.label}
                            {k.required && (
                              <span className="ml-2 text-xs font-normal text-zinc-500">
                                Always on
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {k.description}
                          </p>
                        </div>
                        <Switch
                          on={!!choices[k.id]}
                          disabled={k.required}
                          label={k.label}
                          still={still}
                          onChange={(v) =>
                            setChoices((c) => ({ ...c, [k.id]: v }))
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* One row when the card is wide; on a narrow card Reject and
                Accept share a row and Customize sits under them, full width. */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <motion.button
                type="button"
                onClick={() => (custom ? finish("save") : setCustom(true))}
                whileTap={still ? undefined : { scale: 0.96 }}
                className="order-last w-full shrink-0 whitespace-nowrap relative h-10 cursor-pointer overflow-hidden rounded-full px-4 text-sm font-medium text-[#242423] outline-none transition-colors hover:bg-[#242423]/[0.05] @[20rem]:order-none @[20rem]:w-auto focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-100 dark:hover:bg-white/[0.06]"
              >
                {/* The label rolls to Save choices once the panel is open. */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={custom ? "save" : "custom"}
                    className="inline-block"
                    initial={still ? false : { y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={still ? undefined : { y: -16, opacity: 0 }}
                    transition={SPRING}
                  >
                    {custom ? "Save choices" : "Customize"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <span className="hidden flex-1 @[20rem]:block" />
              <motion.button
                type="button"
                onClick={() => finish("reject")}
                whileTap={still ? undefined : { scale: 0.96 }}
                className="flex-1 shrink-0 whitespace-nowrap h-10 cursor-pointer rounded-full bg-[#242423]/[0.06] px-4 @[20rem]:flex-none text-sm font-medium text-[#242423] outline-none transition-colors hover:bg-[#242423]/[0.1] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:text-zinc-100"
              >
                Reject all
              </motion.button>
              <motion.button
                type="button"
                onClick={() => finish("accept")}
                whileTap={still ? undefined : { scale: 0.96 }}
                className="flex-1 justify-center shrink-0 whitespace-nowrap group/accept flex h-10 cursor-pointer items-center gap-1.5 overflow-hidden rounded-full bg-[#242423] pl-4 pr-3.5 @[20rem]:flex-none text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-[#242423]"
              >
                Accept all
                <span className="relative size-4 overflow-hidden">
                  <ArrowRight
                    aria-hidden
                    className="absolute inset-0 size-4 transition-transform duration-300 ease-out group-hover/accept:translate-x-5"
                  />
                  <ArrowRight
                    aria-hidden
                    className="absolute inset-0 size-4 -translate-x-5 transition-transform duration-300 ease-out group-hover/accept:translate-x-0"
                  />
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});