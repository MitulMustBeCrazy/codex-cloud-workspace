"use client";

/**
 * OrbitCard, from https://motion-brew.com/components/orbit-card
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
import { ArrowRight, Heart, MessageCircle, Send } from "lucide-react";
import { motion, type Transition, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// OrbitCard

/**
 * OrbitCard
 *
 * Trigger: drag (plus hover and in view). A feature card for a community,
 * a network or a user count. Avatars and small app chips circle a center mark
 * on three faint rings that turn at their own speeds, rising from the bottom
 * of the card. Every few seconds someone joins: a spark leaves the center,
 * lands on a member with a pop, a ripple spreads from the mark and the count
 * in the title rolls up by one. Hover slows the rings and pulls nearby people
 * gently toward the cursor; hovering a person stops them and shows who they
 * are. Drag spins the whole system, and it keeps spinning with momentum when
 * let go. The title, body and a gray ghost button rise out of a soft blur when
 * the card scrolls into view. The rings are decorative; the text stays real
 * content. Reduced motion shows a still system and a still count.
 *
 * Engine: motion/react for the reveal, rolling digits, ripples and pops, with
 * one requestAnimationFrame loop placing the orbiting items.
 */

export interface OrbitMember {
  name: string;
  /** Shown under the name on hover, like a role or a city. */
  role: string;
  /** Photo URL. Without one, initials on a colored disc. */
  avatar?: string;
}

export interface OrbitCardProps {
  /** The number in the title. It rolls up by one each time someone joins. Default `24816`. */
  count?: number;
  /** Words after the number. Default `"creators"`. */
  label?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Button label. Default `"Join the community"`. */
  cta?: string;
  /** Where the button goes. Without it the button calls `onCta`. */
  href?: string;
  /** People on the rings, up to six. Default six members. */
  members?: OrbitMember[];
  /** The mark in the center. Default a four-point star. */
  logo?: React.ReactNode;
  /** Ring speed multiplier. `0` holds the rings still. Default `1`. */
  speed?: number;
  /** Seconds between joins. `0` turns joining off. Default `2.6`. */
  joinEvery?: number;
  /** Called by the button when there is no `href`. */
  onCta?: () => void;
  className?: string;
}

const PALETTE = ["#9150e0", "#3d66d6", "#d6498f", "#269a5a", "#cf7a1c"];
const GLIDE = [0.22, 1, 0.36, 1] as const;
const ROLL: Transition = { type: "spring", stiffness: 260, damping: 26 };

const headshot = (id: string) =>
  `https://images.unsplash.com/${id}?w=96&h=96&fit=crop&crop=faces`;

const DEFAULT_MEMBERS: OrbitMember[] = [
  {
    name: "Maya",
    role: "Product designer",
    avatar: headshot("photo-1438761681033-6461ffad8d80"),
  },
  {
    name: "Daniel",
    role: "Founder",
    avatar: headshot("photo-1507003211169-0a1dd7228f2d"),
  },
  {
    name: "Sofia",
    role: "Illustrator",
    avatar: headshot("photo-1534528741775-53994a69daeb"),
  },
  {
    name: "Leo",
    role: "Engineer",
    avatar: headshot("photo-1500648767791-00dcc994a43e"),
  },
  {
    name: "Ava",
    role: "Writer",
    avatar: headshot("photo-1494790108377-be9c29b29330"),
  },
  {
    name: "Omar",
    role: "Motion designer",
    avatar: headshot("photo-1472099645785-5658abf4ff4e"),
  },
];

/** Card height and where the rings are centered, px. The rings rise from the bottom and run off the sides. */
const CARD_H = 568;
const CENTER_Y = 448;
const RADII = [100, 156, 216];
/** Degrees per second for each ring; the middle one turns the other way. */
const RING_SPEED = [11, -7, 5];

type Item =
  | { id: string; kind: "member"; ring: number; angle: number; member: number }
  | {
      id: string;
      kind: "chip";
      ring: number;
      angle: number;
      icon: typeof Heart;
      color: string;
      label: string;
    }
  | { id: string; kind: "dot"; ring: number; angle: number; color: string };

/** Where everything sits at rest, in degrees (0 is right, 90 is down). */
function layout(members: number): Item[] {
  const slots: [ring: number, angle: number][] = [
    [0, 205],
    [1, 160],
    [1, 300],
    [2, 192],
    [2, 252],
    [2, 338],
  ];
  const items: Item[] = slots.slice(0, members).map(([ring, angle], i) => ({
    id: `m${i}`,
    kind: "member",
    ring,
    angle,
    member: i,
  }));
  items.push(
    {
      id: "c0",
      kind: "chip",
      ring: 0,
      angle: 330,
      icon: MessageCircle,
      color: PALETTE[0]!,
      label: "Feedback",
    },
    {
      id: "c1",
      kind: "chip",
      ring: 1,
      angle: 20,
      icon: Send,
      color: PALETTE[1]!,
      label: "Shared",
    },
    {
      id: "c2",
      kind: "chip",
      ring: 2,
      angle: 120,
      icon: Heart,
      color: PALETTE[2]!,
      label: "Liked",
    },
    { id: "d0", kind: "dot", ring: 0, angle: 80, color: PALETTE[4]! },
    { id: "d1", kind: "dot", ring: 1, angle: 232, color: PALETTE[0]! },
    { id: "d2", kind: "dot", ring: 2, angle: 296, color: PALETTE[1]! },
  );
  return items;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** One odometer column that springs to its digit. */
function Digit({ digit, still }: { digit: number; still: boolean }) {
  return (
    <span className="relative inline-block h-[1.2em] w-[0.6em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-digit * 10}%` }}
        transition={still ? { duration: 0 } : ROLL}
      >
        {DIGITS.map((d) => (
          <span key={d} className="flex h-[1.2em] items-center justify-center">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** A grouped number whose digits roll like an odometer. */
function Count({ value, still }: { value: number; still: boolean }) {
  const text = Math.max(0, Math.round(value)).toLocaleString("en-US");
  const digits = [...text].filter((c) => c !== ",").length;
  let seen = 0;
  return (
    <span aria-hidden className="inline-flex tabular-nums">
      {[...text].map((c, i) => {
        if (c === ",") return <span key={`s${i}`}>,</span>;
        // Key from the right so a column keeps its identity as the number grows.
        const key = digits - seen++;
        return <Digit key={key} digit={Number(c)} still={still} />;
      })}
    </span>
  );
}

/** Words that rise out of a soft blur one after another once the card is in view. */
function Reveal({
  text,
  show,
  delay = 0,
  still,
  className,
}: {
  text: string;
  show: boolean;
  delay?: number;
  still: boolean;
  className?: string;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <React.Fragment key={i}>
          <motion.span
            aria-hidden
            className="inline-block"
            initial={
              still ? false : { opacity: 0, y: "0.35em", filter: "blur(6px)" }
            }
            animate={
              show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined
            }
            transition={{
              duration: 0.55,
              ease: GLIDE,
              delay: delay + i * 0.05,
            }}
          >
            {w}
          </motion.span>{" "}
        </React.Fragment>
      ))}
    </span>
  );
}

/**
 * Soft gray ghost button. On hover the arrow slides out to the right while a fresh one slides in from the left;
 * pressing deepens the tint and presses in a touch.
 */
function GhostButton({
  label,
  href,
  onClick,
  still,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  still: boolean;
}) {
  const Tag = href ? "a" : "button";
  const arrow =
    "absolute inset-0 size-4 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <Tag
      {...(href ? { href } : { type: "button" as const, onClick })}
      className={cn(
        "group pointer-events-auto inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#242423]/6 px-4 text-sm font-medium text-[#242423] outline-none transition-[background-color,transform] duration-200 hover:bg-[#242423]/10 focus-visible:ring-2 focus-visible:ring-zinc-400 active:bg-[#242423]/[0.14] dark:bg-white/8 dark:text-zinc-100 dark:hover:bg-white/12",
        !still && "active:scale-[0.97]",
      )}
    >
      {label}
      <span aria-hidden className="relative size-4 overflow-hidden">
        <ArrowRight
          className={cn(arrow, !still && "group-hover:translate-x-[140%]")}
          strokeWidth={2.25}
        />
        <ArrowRight
          className={cn(
            arrow,
            "-translate-x-[140%]",
            !still && "group-hover:translate-x-0 group-hover:delay-75",
          )}
          strokeWidth={2.25}
        />
      </span>
    </Tag>
  );
}

/** The default center mark: a four-point star. */
function Star() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
      <path d="M12 2c.6 5.2 3.8 8.4 10 10-6.2 1.6-9.4 4.8-10 10-.6-5.2-3.8-8.4-10-10 6.2-1.6 9.4-4.8 10-10Z" />
    </svg>
  );
}

function Avatar({ member, index }: { member: OrbitMember; index: number }) {
  const [broken, setBroken] = React.useState(false);
  return (
    <span className="relative block size-11 overflow-hidden rounded-full bg-white p-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_16px_-6px_rgba(0,0,0,0.25)] dark:bg-zinc-800">
      {member.avatar && !broken ? (
        <img
          src={member.avatar}
          alt={member.name}
          draggable={false}
          onError={() => setBroken(true)}
          className="size-full rounded-full object-cover"
        />
      ) : (
        <span
          className="grid size-full place-items-center rounded-full text-xs font-semibold text-white"
          style={{ background: PALETTE[index % PALETTE.length] }}
        >
          {initials(member.name)}
        </span>
      )}
    </span>
  );
}

export const OrbitCard = React.forwardRef<HTMLDivElement, OrbitCardProps>(
  function OrbitCard(
    {
      count = 24816,
      label = "creators",
      subtitle = "Designers, founders and makers trade feedback here every day. Someone new joins every few seconds.",
      cta = "Join the community",
      href,
      members = DEFAULT_MEMBERS,
      logo,
      speed = 1,
      joinEvery = 2.6,
      onCta,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const card = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => card.current as HTMLDivElement);
    const field = React.useRef<HTMLDivElement>(null);
    const spark = React.useRef<HTMLSpanElement>(null);
    const nodes = React.useRef(new Map<string, HTMLElement>());
    const inView = useInView(card, { once: true, amount: 0.4 });
    const visible = useInView(card, { amount: 0 });
    const show = still || inView;

    const people = members.slice(0, 6);
    const items = React.useMemo(() => layout(people.length), [people.length]);
    const [joined, setJoined] = React.useState(0);
    const [hovered, setHovered] = React.useState<string | null>(null);

    // Restart the count when the base number changes.
    React.useEffect(() => setJoined(0), [count]);

    const settings = React.useRef({ speed, joinEvery, still, hovered });
    settings.current = { speed, joinEvery, still, hovered };
    const motionState = React.useRef({
      turn: [0, 0, 0],
      spin: 0,
      spinVel: 0,
      calm: 1,
      pointer: { x: 0, y: 0, inside: false },
      drag: null as null | { angle: number; t: number },
      pull: new Map<string, { x: number; y: number }>(),
      pops: new Map<string, number>(),
      sinceJoin: 0,
      flight: null as null | { id: string; t: number },
    });

    React.useEffect(() => {
      const host = field.current;
      if (!host) return;
      const s = motionState.current;
      let raf = 0;
      let last = performance.now();
      const FLY = 0.6;

      const frame = () => {
        // Off screen the system is placed once and the loop rests.
        if (visible) raf = requestAnimationFrame(frame);
        const now = performance.now();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const set = settings.current;
        const cx = host.clientWidth / 2;
        const moving = !set.still && visible;

        if (moving) {
          // Hovering the field calms the rings; hovering a person stops them.
          const target = set.hovered ? 0 : s.pointer.inside ? 0.35 : 1;
          s.calm += (target - s.calm) * Math.min(1, dt * 5);
          for (let r = 0; r < 3; r++)
            s.turn[r]! += RING_SPEED[r]! * set.speed * s.calm * dt;
          if (!s.drag) {
            s.spin += s.spinVel * dt;
            s.spinVel *= Math.exp(-dt * 1.6);
          }

          // Someone joins: a spark flies from the center to a member, then the count rolls.
          if (set.joinEvery > 0 && !s.flight) {
            s.sinceJoin += dt;
            if (s.sinceJoin >= set.joinEvery) {
              s.sinceJoin = 0;
              const members = items.filter((i) => i.kind === "member");
              const pick = members[Math.floor(Math.random() * members.length)];
              if (pick) s.flight = { id: pick.id, t: 0 };
            }
          }
        }

        const where = (it: Item) => {
          const a = ((it.angle + s.turn[it.ring]! + s.spin) * Math.PI) / 180;
          return {
            x: cx + Math.cos(a) * RADII[it.ring]!,
            y: CENTER_Y + Math.sin(a) * RADII[it.ring]!,
          };
        };

        for (const it of items) {
          const el = nodes.current.get(it.id);
          if (!el) continue;
          const p = where(it);
          // Nearby items lean toward the cursor, a little more the closer they are.
          let pull = s.pull.get(it.id);
          if (!pull) s.pull.set(it.id, (pull = { x: 0, y: 0 }));
          let tx = 0;
          let ty = 0;
          if (moving && s.pointer.inside && !s.drag && it.kind !== "dot") {
            const dx = s.pointer.x - p.x;
            const dy = s.pointer.y - p.y;
            const d = Math.hypot(dx, dy);
            if (d < 110) {
              const k = (1 - d / 110) * 0.22;
              tx = Math.max(-12, Math.min(12, dx * k));
              ty = Math.max(-12, Math.min(12, dy * k));
            }
          }
          pull.x += (tx - pull.x) * Math.min(1, dt * 10);
          pull.y += (ty - pull.y) * Math.min(1, dt * 10);
          // A landing spark pops the member with a little overshoot.
          const popAt = s.pops.get(it.id);
          let scale = 1;
          if (popAt !== undefined) {
            const k = (now - popAt) / 520;
            if (k >= 1) s.pops.delete(it.id);
            else scale = 1 + Math.sin(k * Math.PI) * 0.22 * (1 - k * 0.5);
          }
          el.style.transform = `translate3d(${p.x + pull.x}px, ${p.y + pull.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        }

        const dot = spark.current;
        if (dot) {
          const f = s.flight;
          if (!f || !moving) dot.style.opacity = "0";
          else {
            f.t += dt / FLY;
            const it = items.find((i) => i.id === f.id)!;
            const p = where(it);
            const k = Math.min(1, f.t);
            const e = 1 - Math.pow(1 - k, 3);
            const x = cx + (p.x - cx) * e;
            const y = CENTER_Y + (p.y - CENTER_Y) * e;
            dot.style.opacity = String(Math.min(1, k * 4) * (1 - k * 0.3));
            dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
            if (f.t >= 1) {
              s.pops.set(f.id, now);
              s.flight = null;
              setJoined((j) => j + 1);
            }
          }
        }
      };
      frame();

      // Pointer: hover calms and pulls, a drag spins the system around its center.
      const local = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };
      const angleOf = (p: { x: number; y: number }) =>
        (Math.atan2(p.y - CENTER_Y, p.x - host.clientWidth / 2) * 180) /
        Math.PI;
      const onMove = (e: PointerEvent) => {
        const p = local(e);
        Object.assign(s.pointer, p, { inside: true });
        if (!s.drag) return;
        const a = angleOf(p);
        let da = a - s.drag.angle;
        if (da > 180) da -= 360;
        if (da < -180) da += 360;
        const now = performance.now();
        const dts = Math.max(1, now - s.drag.t) / 1000;
        s.spin += da;
        s.spinVel = s.spinVel * 0.5 + (da / dts) * 0.5;
        s.drag = { angle: a, t: now };
      };
      const onDown = (e: PointerEvent) => {
        if (settings.current.still) return;
        s.drag = { angle: angleOf(local(e)), t: performance.now() };
        s.spinVel = 0;
        host.setPointerCapture(e.pointerId);
      };
      const onUp = () => {
        s.drag = null;
        s.spinVel = Math.max(-540, Math.min(540, s.spinVel));
      };
      const onLeave = () => {
        if (!s.drag) s.pointer.inside = false;
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointerup", onUp);
      host.addEventListener("pointercancel", onUp);
      host.addEventListener("pointerleave", onLeave);
      return () => {
        cancelAnimationFrame(raf);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointerup", onUp);
        host.removeEventListener("pointercancel", onUp);
        host.removeEventListener("pointerleave", onLeave);
      };
    }, [items, visible]);

    const total = count + joined;

    return (
      <div
        ref={card}
        className={cn(
          "relative w-[440px] max-w-full overflow-hidden rounded-3xl bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
        style={{ height: CARD_H }}
      >
        {/* The orbit system. It fades out toward the top so it never fights the text. */}
        <div
          ref={field}
          aria-hidden
          className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 176px, #000 248px)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 176px, #000 248px)",
          }}
        >
          <motion.div
            className="absolute inset-0"
            initial={still ? false : { opacity: 0, scale: 0.92 }}
            animate={show ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.9, ease: GLIDE, delay: 0.2 }}
            style={{ transformOrigin: `50% ${CENTER_Y}px` }}
          >
            <svg className="absolute inset-0 size-full overflow-visible">
              <circle
                cx="50%"
                cy={CENTER_Y}
                r={64}
                className="fill-zinc-100/70 dark:fill-white/[0.04]"
              />
              {RADII.map((r) => (
                <circle
                  key={r}
                  cx="50%"
                  cy={CENTER_Y}
                  r={r}
                  fill="none"
                  strokeWidth={1}
                  className="stroke-zinc-200 dark:stroke-white/10"
                />
              ))}
            </svg>

            {/* Ripples from the mark, one per join. */}
            {!still &&
              joined > 0 &&
              [0, 0.18].map((d) => (
                <motion.span
                  key={`${joined}-${d}`}
                  className="absolute left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-300 dark:border-white/20"
                  style={{ top: CENTER_Y }}
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 3.2, opacity: 0 }}
                  transition={{ duration: 1.4, ease: GLIDE, delay: d }}
                />
              ))}

            {/* The center mark, which bumps each time someone joins. */}
            <motion.div
              key={joined}
              className="absolute left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_28px_-10px_rgba(0,0,0,0.28)] dark:bg-zinc-800"
              style={{ top: CENTER_Y }}
              initial={still || joined === 0 ? false : { scale: 1 }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.5, ease: GLIDE }}
            >
              <span className="grid size-14 place-items-center rounded-full bg-[#242423] text-white dark:bg-white dark:text-[#242423]">
                {logo ?? <Star />}
              </span>
            </motion.div>

            <span
              ref={spark}
              className="absolute left-0 top-0 size-2 rounded-full bg-[#242423] opacity-0 shadow-[0_0_0_4px_rgba(36,36,35,0.12)] dark:bg-white"
            />

            {items.map((it) => {
              const isHovered = hovered === it.id;
              const name =
                it.kind === "member"
                  ? people[it.member]!.name
                  : it.kind === "chip"
                    ? it.label
                    : null;
              const role =
                it.kind === "member" ? people[it.member]!.role : null;
              return (
                <div
                  key={it.id}
                  ref={(el) => {
                    if (el) nodes.current.set(it.id, el);
                    else nodes.current.delete(it.id);
                  }}
                  className={cn(
                    "absolute left-0 top-0 will-change-transform",
                    isHovered ? "z-20" : "z-10",
                  )}
                  onPointerEnter={() => it.kind !== "dot" && setHovered(it.id)}
                  onPointerLeave={() =>
                    setHovered((h) => (h === it.id ? null : h))
                  }
                >
                  <div
                    className={cn(
                      "relative transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isHovered && "scale-[1.14]",
                    )}
                  >
                    {it.kind === "member" && (
                      <Avatar member={people[it.member]!} index={it.member} />
                    )}
                    {it.kind === "chip" && (
                      <span
                        className="grid size-10 place-items-center rounded-full text-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.3)]"
                        style={{ background: it.color }}
                      >
                        <it.icon className="size-[18px]" strokeWidth={2.25} />
                      </span>
                    )}
                    {it.kind === "dot" && (
                      <span
                        className="block size-2 rounded-full"
                        style={{ background: it.color }}
                      />
                    )}
                  </div>
                  {name && (
                    <span
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(0,0,0,0.25)] transition-[opacity,translate] duration-200 dark:bg-zinc-800",
                        isHovered
                          ? "translate-y-0 opacity-100"
                          : "-translate-y-1 opacity-0",
                      )}
                    >
                      <span className="font-medium">{name}</span>
                      {role && (
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {" "}
                          {role}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="pointer-events-none relative px-6 pt-6">
          <motion.h3
            aria-label={`${total.toLocaleString("en-US")} ${label}`}
            initial={still ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={
              show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined
            }
            transition={{ duration: 0.55, ease: GLIDE }}
            className="flex items-center gap-[0.3em] text-2xl font-semibold leading-[1.2] tracking-tight"
          >
            <Count value={total} still={still} />
            <span aria-hidden>{label}</span>
          </motion.h3>
          <Reveal
            text={subtitle}
            show={show}
            delay={0.12}
            still={still}
            className="mt-2 block text-base leading-relaxed text-zinc-500 dark:text-zinc-400"
          />
          <motion.div
            initial={still ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={
              show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined
            }
            transition={{ duration: 0.5, ease: GLIDE, delay: 0.3 }}
            className="mt-5"
          >
            <GhostButton
              label={cta}
              href={href}
              onClick={onCta}
              still={still}
            />
          </motion.div>
        </div>
      </div>
    );
  },
);