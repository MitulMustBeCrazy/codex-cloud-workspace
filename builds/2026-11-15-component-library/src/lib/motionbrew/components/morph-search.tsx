"use client";

/**
 * MorphSearch, from https://motion-brew.com/components/morph-search
 *
 * One self contained file: the component, its animated icons and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 *
 * The animated icons are adapted from lucide-animated (https://lucide-animated.com),
 * MIT License, Copyright (c) 2024-2026 pqoqubbw. Icon shapes from Lucide
 * (https://lucide.dev), ISC License. Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software, to deal in it
 * without restriction, provided the above copyright notice and this
 * permission notice are included in all copies or substantial portions.
 */

import * as React from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { Meh } from "lucide-react";
import { AnimatePresence, motion, useAnimate, useAnimation, useReducedMotion, type Variants } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Animated icon: search
const SearchIcon = (() => {
interface SearchIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SearchIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const SearchIcon = forwardRef<SearchIconHandle, SearchIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );
    // Play with the nearest interactive parent, or whenever `active` is set.
    // Reduced motion keeps the icon still.
    const wrap = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();
    const [hosted, setHosted] = useState(false);
    useEffect(() => {
      const fake = {} as React.MouseEvent<HTMLSpanElement>;
      if (reduced) {
        setHosted(true);
        return;
      }
      if (active !== undefined) {
        setHosted(true);
        (active ? handleMouseEnter : handleMouseLeave)(fake);
        return;
      }
      const host = wrap.current?.parentElement?.closest<HTMLElement>("button, a, [role=button], [role=menuitem], [role=tab], [role=switch], [role=radio], label");
      setHosted(!!host);
      if (!host) return;
      const on = () => handleMouseEnter(fake);
      const off = () => handleMouseLeave(fake);
      host.addEventListener("pointerenter", on);
      host.addEventListener("pointerleave", off);
      return () => {
        host.removeEventListener("pointerenter", on);
        host.removeEventListener("pointerleave", off);
      };
    }, [active, reduced, handleMouseEnter, handleMouseLeave]);

    return (
      <span
        ref={wrap}
        className={cn("inline-grid size-6 shrink-0 place-items-center align-middle [&>svg]:size-full", className)}
        style={size ? { width: size, height: size, ...style } : style}
        onMouseEnter={hosted ? undefined : handleMouseEnter}
        onMouseLeave={hosted ? undefined : handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          transition={{
            duration: 1,
            bounce: 0.3,
          }}
          variants={{
            normal: { x: 0, y: 0 },
            animate: {
              x: [0, 0, -3, 0],
              y: [0, -4, 0, 0],
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </motion.svg>
      </span>
    );
  }
);

SearchIcon.displayName = "SearchIcon";
  return SearchIcon;
})();

// Animated icon: x
const XIcon = (() => {
interface XIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface XIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in px; by default it follows className, like a lucide icon. */
  size?: number;
  /** Play while true; when set, hover no longer drives it. */
  active?: boolean;
  /** Line weight, like a lucide icon's. Default `2`. */
  strokeWidth?: number | string;
}

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
};

const XIcon = forwardRef<XIconHandle, XIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size, active, style, strokeWidth, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );
    // Play with the nearest interactive parent, or whenever `active` is set.
    // Reduced motion keeps the icon still.
    const wrap = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();
    const [hosted, setHosted] = useState(false);
    useEffect(() => {
      const fake = {} as React.MouseEvent<HTMLSpanElement>;
      if (reduced) {
        setHosted(true);
        return;
      }
      if (active !== undefined) {
        setHosted(true);
        (active ? handleMouseEnter : handleMouseLeave)(fake);
        return;
      }
      const host = wrap.current?.parentElement?.closest<HTMLElement>("button, a, [role=button], [role=menuitem], [role=tab], [role=switch], [role=radio], label");
      setHosted(!!host);
      if (!host) return;
      const on = () => handleMouseEnter(fake);
      const off = () => handleMouseLeave(fake);
      host.addEventListener("pointerenter", on);
      host.addEventListener("pointerleave", off);
      return () => {
        host.removeEventListener("pointerenter", on);
        host.removeEventListener("pointerleave", off);
      };
    }, [active, reduced, handleMouseEnter, handleMouseLeave]);

    return (
      <span
        ref={wrap}
        className={cn("inline-grid size-6 shrink-0 place-items-center align-middle [&>svg]:size-full", className)}
        style={size ? { width: size, height: size, ...style } : style}
        onMouseEnter={hosted ? undefined : handleMouseEnter}
        onMouseLeave={hosted ? undefined : handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth ?? 2}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={controls}
            d="M18 6 6 18"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="m6 6 12 12"
            transition={{ delay: 0.2 }}
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

XIcon.displayName = "XIcon";
  return XIcon;
})();

// MorphSearch

/**
 * MorphSearch
 *
 * Trigger: focus, then type. A search pill that turns into a white card on
 * focus. Each typed letter rises out of a light blur while the real input stays
 * underneath, so the caret, selection and paste behave normally. Matches grow
 * the card and cascade in, re-flowing smoothly as the list narrows, with the
 * matched part of each name marked by a soft highlighter tint. No matches
 * gives a small head-shake. Arrow keys move a sliding highlight, Enter picks, Escape
 * clears then closes. Reduced motion drops the letter and list motion.
 *
 * Engine: motion/react (state-driven card morph, per-letter enter, layout list,
 * layoutId highlight, AnimatePresence for the clear button and results).
 */

const GLIDE = [0.22, 1, 0.36, 1] as const;

export interface SearchItem {
  /** Main line; matching runs against it. */
  title: string;
  /** Second line. */
  subtitle?: string;
}

export interface MorphSearchProps {
  /** Items to search. Default a small address book. */
  items?: SearchItem[];
  /** Placeholder text. Default `"Search people"`. */
  placeholder?: string;
  /** Most results to show. Default `5`. */
  limit?: number;
  /** Called when a result is picked with a click or Enter. */
  onSelect?: (item: SearchItem) => void;
  className?: string;
}

const DEFAULT_ITEMS: SearchItem[] = [
  { title: "Johnathan Doe", subtitle: "2972 Westheimer Rd, Austin" },
  { title: "Johnny Williams", subtitle: "1901 Thornridge Cir, Shiloh" },
  { title: "John Smith", subtitle: "4140 Parker Rd, Allentown" },
  { title: "Maria Johnson", subtitle: "8502 Preston Rd, Inglewood" },
  { title: "Ava Thompson", subtitle: "3891 Ranchview Dr, Richardson" },
  { title: "Liam Carter", subtitle: "6391 Elgin St, Celina" },
  { title: "Sofia Martinez", subtitle: "2118 Thornridge Cir, Syracuse" },
  { title: "Noah Bennett", subtitle: "4517 Washington Ave, Manchester" },
];

/** The title in ink, with the matched run marked by a soft highlighter tint. */
function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[4px] bg-[#242423]/10 px-px text-inherit dark:bg-white/15">
        {text.slice(at, at + query.length)}
      </mark>
      {text.slice(at + query.length)}
    </>
  );
}

export const MorphSearch = React.forwardRef<HTMLDivElement, MorphSearchProps>(function MorphSearch(
  { items = DEFAULT_ITEMS, placeholder = "Search people", limit = 5, onSelect, className },
  forwardedRef,
) {
  const reduceMotion = !!useReducedMotion();
  const uid = React.useId();
  const listId = `${uid}-list`;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [card, animateCard] = useAnimate<HTMLDivElement>();
  React.useImperativeHandle(forwardedRef, () => card.current as HTMLDivElement);
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [tilt, setTilt] = React.useState(0);

  const q = query.trim();
  const results = React.useMemo(
    () => (q ? items.filter((it) => it.title.toLowerCase().includes(q.toLowerCase())).slice(0, limit) : []),
    [items, q, limit],
  );
  const open = focused && q.length > 0;
  const lifted = focused || query.length > 0;

  React.useEffect(() => setActive(0), [q]);

  // A small head-shake when a query finds nothing.
  const prevCount = React.useRef(results.length);
  React.useEffect(() => {
    if (open && results.length === 0 && prevCount.current !== 0 && !reduceMotion && card.current) {
      animateCard(card.current, { x: [0, -6, 6, -4, 4, -2, 0] }, { duration: 0.4, ease: "easeOut" });
    }
    prevCount.current = results.length;
  }, [results.length, open, reduceMotion, animateCard, card]);

  const pick = (item: SearchItem) => {
    setQuery(item.title);
    onSelect?.(item);
    inputRef.current?.blur();
  };

  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-[320px] max-w-full", className)}>
      <motion.div
        ref={card}
        animate={{
          scale: lifted ? 1.02 : 1,
        }}
        transition={{ duration: 0.3, ease: GLIDE }}
        className={cn(
          "overflow-hidden rounded-[22px] transition-colors duration-300",
          lifted ? "bg-white dark:bg-zinc-900" : "bg-[#242423]/6 dark:bg-white/8",
        )}
      >
        <div className="flex h-12 items-center gap-2.5 px-4">
          <motion.span
            animate={{ rotate: tilt, scale: focused ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className={cn("flex shrink-0", focused ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500")}
          >
            <SearchIcon className="size-[18px]" strokeWidth={2.25} />
          </motion.span>

          {/* The real input carries caret and selection; the letters you see are drawn over it. */}
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={open && results[active] ? `${uid}-opt-${active}` : undefined}
              aria-label={placeholder}
              value={query}
              maxLength={40}
              placeholder={placeholder}
              spellCheck={false}
              onFocus={() => {
                setFocused(true);
                setTilt(-14);
                window.setTimeout(() => setTilt(0), 160);
              }}
              onBlur={() => setFocused(false)}
              onChange={(e) => {
                setQuery(e.target.value);
                setTilt((t) => (t === 0 ? -8 : 0));
                window.setTimeout(() => setTilt(0), 120);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && results.length)
                  (e.preventDefault(), setActive((a) => (a + 1) % results.length));
                if (e.key === "ArrowUp" && results.length)
                  (e.preventDefault(), setActive((a) => (a - 1 + results.length) % results.length));
                if (e.key === "Enter" && open && results[active]) (e.preventDefault(), pick(results[active]!));
                if (e.key === "Escape") query ? (e.preventDefault(), setQuery("")) : inputRef.current?.blur();
              }}
              className="w-full bg-transparent text-[14px] text-transparent caret-zinc-900 outline-none selection:bg-[#242423]/15 selection:text-transparent dark:selection:bg-white/20 placeholder:text-zinc-500 dark:caret-zinc-100 dark:placeholder:text-zinc-400"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center whitespace-pre text-[14px] text-zinc-900 dark:text-zinc-100"
            >
              {Array.from(query).map((ch, i) => (
                <motion.span
                  key={`${i}-${ch}`}
                  className="inline-block"
                  initial={reduceMotion ? false : { opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.28, ease: GLIDE }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {query && (
              <motion.button
                key="clear"
                type="button"
                aria-label="Clear search"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clear}
                initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: 90 }}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.25, ease: GLIDE }}
                className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-500 transition-colors hover:bg-[#242423]/6 hover:text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
              >
                <XIcon className="size-4" strokeWidth={2.25} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="results"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: GLIDE }}
            >
              <div className="mx-4 h-px bg-zinc-100 dark:bg-zinc-800" />
              <ul
                id={listId}
                role="listbox"
                aria-label="Results"
                className="relative p-1.5"
                onPointerLeave={() => setActive(0)}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.length ? (
                    results.map((item, i) => (
                      <motion.li
                        key={item.title}
                        id={`${uid}-opt-${i}`}
                        role="option"
                        aria-selected={i === active}
                        layout={!reduceMotion}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: GLIDE, delay: i * 0.04 } }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                        transition={{ layout: { duration: 0.3, ease: GLIDE } }}
                        onPointerEnter={() => setActive(i)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(item)}
                        className="relative cursor-pointer rounded-2xl px-3 py-2.5"
                      >
                        {i === active && (
                          <motion.span
                            layoutId={`${uid}-hl`}
                            transition={{ duration: 0.22, ease: GLIDE }}
                            className="absolute inset-0 rounded-2xl bg-[#242423]/5 dark:bg-white/8"
                          />
                        )}
                        <p className="relative text-sm font-medium tracking-[-0.01em] text-zinc-900 dark:text-zinc-100">
                          <Highlight text={item.title} query={q} />
                        </p>
                        {item.subtitle && (
                          <p className="relative mt-0.5 text-[12px] text-zinc-400 dark:text-zinc-500">
                            {item.subtitle}
                          </p>
                        )}
                      </motion.li>
                    ))
                  ) : (
                    <motion.li
                      key="empty"
                      role="option"
                      aria-selected={false}
                      aria-disabled
                      initial="hidden"
                      animate="shown"
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      variants={{ shown: { transition: { staggerChildren: 0.06 } } }}
                      className="flex flex-col items-center px-4 pb-4 pt-5 text-center"
                    >
                      {/* Empty state: a puzzled face tilts its head while a "?" pops up beside it. */}
                      <motion.span
                        variants={{ hidden: { opacity: 0, scale: 0.7 }, shown: { opacity: 1, scale: 1 } }}
                        transition={{ type: "spring", stiffness: 420, damping: 22 }}
                        className="relative grid size-11 place-items-center rounded-full bg-[#242423]/6 text-zinc-500 dark:bg-white/8 dark:text-zinc-400"
                      >
                        <motion.span
                          initial={{ rotate: 0 }}
                          animate={reduceMotion ? undefined : { rotate: [0, -12, 10, -6, 0] }}
                          transition={{ duration: 0.9, ease: "easeInOut", delay: 0.15 }}
                          className="flex"
                        >
                          <Meh className="size-5" strokeWidth={2} />
                        </motion.span>
                        <motion.span
                          aria-hidden
                          initial={{ opacity: 0, scale: 0.4, x: -4, y: 4 }}
                          animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: reduceMotion ? 0 : [0, 14, -10, 6, 0] }}
                          transition={{
                            opacity: { duration: 0.2, delay: 0.3 },
                            scale: { type: "spring", stiffness: 500, damping: 16, delay: 0.3 },
                            x: { type: "spring", stiffness: 500, damping: 16, delay: 0.3 },
                            y: { type: "spring", stiffness: 500, damping: 16, delay: 0.3 },
                            rotate: { duration: 0.8, ease: "easeInOut", delay: 0.45 },
                          }}
                          className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-white text-[12px] font-semibold text-zinc-700 shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          ?
                        </motion.span>
                      </motion.span>
                      <motion.p
                        variants={{ hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.3, ease: GLIDE }}
                        className="mt-3 max-w-full truncate text-sm font-medium text-zinc-900 dark:text-zinc-100"
                      >
                        No matches for “{q}”
                      </motion.p>
                      <motion.p
                        variants={{ hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.3, ease: GLIDE }}
                        className="mt-1 text-[12px] text-zinc-500 dark:text-zinc-400"
                      >
                        Check the spelling or try a shorter name.
                      </motion.p>
                      <motion.button
                        type="button"
                        variants={{ hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.3, ease: GLIDE }}
                        whileTap={{ scale: 0.95 }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={clear}
                        className="mt-3.5 cursor-pointer rounded-full bg-[#242423]/6 px-3.5 py-1.5 text-[12px] font-medium text-[#242423] transition-colors hover:bg-[#242423]/10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/8 dark:text-zinc-100 dark:hover:bg-white/12"
                      >
                        Clear search
                      </motion.button>
                    </motion.li>
                  )}
                </AnimatePresence>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <span className="sr-only" aria-live="polite">
        {open
          ? results.length
            ? `${results.length} ${results.length === 1 ? "result" : "results"}`
            : "No matches"
          : ""}
      </span>
    </div>
  );
});