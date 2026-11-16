"use client";

/**
 * PaymentForm, from https://motion-brew.com/components/payment-form
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { useGSAP } from "@gsap/react";
import { type ClassValue, clsx } from "clsx";
import gsap from "gsap";
import { ArrowRight, CalendarDays, CreditCard, Plus, UserRound } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useAnimationControls, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// PaymentForm

/**
 * PaymentForm
 *
 * Trigger: type (plus focus and press). A white card for adding a payment
 * card. Every field is a soft gray pill with a label that floats up on focus,
 * and one ink focus ring glides from field to field as you move through the
 * form; each field's icon gives the same quick pop and tilt when it takes
 * focus. The card number groups itself as you type and the card network logo
 * rolls in when the number is recognised. The expiry adds its own slash.
 * Valid fields draw a light check; a field left wrong shakes once and rolls
 * in a hint. A spring switch saves the card. The button stays muted until the
 * form is complete, its lock shackle snapping shut when it is ready; a press
 * runs a spinner, then the button turns green and draws a check. Then the
 * whole card becomes a confirmation in the style of VerifyFlow: the green seal
 * spins in, draws its check and bursts sparks, a pill shows the card's logo,
 * last four and expiry, and Add another and Continue sit side by side. When
 * the card scrolls into view, the title, fields, switch and button rise out of
 * a soft blur one after another; Add another blurs the confirmation away and plays the
 * same rise back into a fresh form with the cursor in the number field. Errors and results are announced, and reduced motion
 * swaps the movement for fades.
 *
 * Engine: motion/react for the fields, focus ring, switch, button and
 * confirmation layout; gsap + @gsap/react for the seal (scoped with
 * useGSAP).
 */

gsap.registerPlugin(useGSAP);

export interface PaymentDetails {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  brand: string | null;
  save: boolean;
}

export interface PaymentFormProps {
  /** Card title. Default `"Payment details"`. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Button label. Default `"Save card"`. */
  cta?: string;
  /** Button label once saved. Default `"Card saved"`. */
  doneLabel?: string;
  /** Whether the save switch starts on. Default `true`. */
  defaultSave?: boolean;
  /** Confirmation button label. Default `"Continue to checkout"`. */
  continueLabel?: string;
  /** Called by the confirmation's continue button. */
  onContinue?: () => void;
  /** Called on submit. Return a promise to hold the spinner until it settles; a rejection returns to the form. */
  onSubmit?: (details: PaymentDetails) => void | Promise<unknown>;
  className?: string;
}

type Phase = "idle" | "loading" | "done";
type FieldId = "number" | "name" | "expiry" | "cvc";

const GLIDE = [0.22, 1, 0.36, 1] as const;
const RING = { type: "spring", stiffness: 420, damping: 34 } as const;
const POP = { type: "spring", stiffness: 520, damping: 22 } as const;
const SUCCESS = "#269a5a";

/** The form's own states: rest, leaving for the confirmation, and coming back with its rows rising in one by one. */
const FORM = {
  hidden: {},
  shown: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: GLIDE,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  away: {
    opacity: 0,
    scale: 0.97,
    filter: "blur(6px)",
    transition: { duration: 0.35, ease: GLIDE, delay: 0.35 },
  },
};
const ROW = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: GLIDE },
  },
};
const ERROR = "#d6453d";

// ---------------------------------------------------------------------------
// Card rules

const digitsOf = (v: string) => v.replace(/\D/g, "");

function brandOf(digits: string) {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(011|5)/.test(digits)) return "Discover";
  return null;
}

/** Groups of four, or 4 6 5 for Amex. */
function formatNumber(digits: string) {
  const amex = brandOf(digits) === "Amex";
  const d = digits.slice(0, amex ? 15 : 19);
  if (amex)
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  return d.replace(/(.{4})(?=.)/g, "$1 ");
}

function luhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

function formatExpiry(raw: string) {
  let d = digitsOf(raw).slice(0, 4);
  // A first digit above 1 can only be a single digit month.
  if (d.length === 1 && Number(d) > 1) d = `0${d}`;
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function expiryValid(v: string) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1)
  );
}

// ---------------------------------------------------------------------------
// Pieces

type Brand = NonNullable<ReturnType<typeof brandOf>>;

/** Small card network marks, drawn inline so nothing loads at runtime. */
function BrandLogo({ brand }: { brand: Brand }) {
  const tile =
    "block h-6 w-9 overflow-hidden rounded-[6px] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.08)]";
  const font =
    "ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif";
  if (brand === "Mastercard")
    return (
      <svg
        viewBox="0 0 36 24"
        className={tile}
        role="img"
        aria-label="Mastercard"
      >
        <rect width="36" height="24" fill="#fff" />
        <circle cx="14.5" cy="12" r="6.5" fill="#eb001b" />
        <circle cx="21.5" cy="12" r="6.5" fill="#f79e1b" />
        <path
          d="M18 6.52a6.5 6.5 0 0 1 0 10.96 6.5 6.5 0 0 1 0-10.96Z"
          fill="#ff5f00"
        />
      </svg>
    );
  if (brand === "Amex")
    return (
      <svg
        viewBox="0 0 36 24"
        className={tile}
        role="img"
        aria-label="American Express"
      >
        <rect width="36" height="24" fill="#016fd0" />
        <text
          x="18"
          y="15.5"
          textAnchor="middle"
          fill="#fff"
          fontFamily={font}
          fontSize="8.5"
          fontWeight="800"
          letterSpacing="0.3"
        >
          AMEX
        </text>
      </svg>
    );
  if (brand === "Discover")
    return (
      <svg
        viewBox="0 0 36 24"
        className={tile}
        role="img"
        aria-label="Discover"
      >
        <rect width="36" height="24" fill="#fff" />
        <path d="M20 24 36 16v8Z" fill="#f48120" opacity="0.9" />
        <text
          x="3"
          y="13.9"
          fill="#231f20"
          fontFamily={font}
          fontSize="5.2"
          fontWeight="800"
          letterSpacing="0.1"
        >
          DISC
        </text>
        <circle cx="18.4" cy="12.1" r="2.1" fill="#f48120" />
        <text
          x="20.9"
          y="13.9"
          fill="#231f20"
          fontFamily={font}
          fontSize="5.2"
          fontWeight="800"
        >
          VER
        </text>
      </svg>
    );
  return (
    <svg viewBox="0 0 36 24" className={tile} role="img" aria-label="Visa">
      <rect width="36" height="24" fill="#fff" />
      <text
        x="18"
        y="16"
        textAnchor="middle"
        fill="#1a1f71"
        fontFamily={font}
        fontSize="11"
        fontStyle="italic"
        fontWeight="900"
        letterSpacing="-0.2"
      >
        VISA
      </text>
    </svg>
  );
}

/** A label that rolls up out of a blur whenever its text changes. */
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

/** The back of a card: stripe and code box. */
function CvcIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <rect x="2" y="4.5" width="16" height="11" rx="2.5" />
      <rect
        x="2"
        y="7"
        width="16"
        height="2.5"
        fill="currentColor"
        stroke="none"
      />
      <rect x="11" y="11" width="4.5" height="2.5" rx="0.75" />
    </svg>
  );
}

/** A lock whose shackle lifts open while the form is incomplete and snaps shut once it is ready. */
function LockIcon({ shut, still }: { shut: boolean; still: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <motion.path
        d="M5 7.5V5.25a3 3 0 0 1 6 0V7.5"
        initial={false}
        animate={{ y: shut ? 0 : -2.25, rotate: shut ? 0 : -14 }}
        style={{ originX: "11px", originY: "7.5px" }}
        transition={
          still
            ? { duration: 0 }
            : { type: "spring", stiffness: 600, damping: 16 }
        }
      />
      <rect
        x="3.25"
        y="7.5"
        width="9.5"
        height="6.5"
        rx="1.75"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

interface FieldProps {
  id: FieldId;
  label: string;
  value: string;
  onChange: (v: string) => void;
  focused: FieldId | null;
  setFocused: (f: FieldId | null) => void;
  icon: React.ReactNode;
  valid: boolean;
  /** Message shown once the field has been left in a bad state. */
  error: string;
  right?: React.ReactNode;
  disabled: boolean;
  still: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
  uid: string;
  /** Room on the right for a badge as well as the check. */
  wide?: boolean;
}

/** A soft gray well: the label floats on focus, the shared ring glides in, a check pops when valid and a bad blur shakes. */
function Field({
  id,
  label,
  value,
  onChange,
  focused,
  setFocused,
  icon,
  valid,
  error,
  right,
  disabled,
  still,
  inputProps,
  className,
  uid,
  wide,
}: FieldProps) {
  const [touched, setTouched] = React.useState(false);
  const shake = useAnimationControls();
  const isFocused = focused === id;
  const floated = isFocused || value.length > 0;
  const showError = touched && !isFocused && !valid && value.length > 0;
  const inputId = `${uid}-${id}`;

  return (
    <motion.div variants={still ? undefined : ROW} className={className}>
      <motion.div
        animate={shake}
        className={cn(
          "relative h-14 rounded-full bg-zinc-100 transition-colors duration-200 dark:bg-white/6",
          !isFocused &&
            !disabled &&
            "hover:bg-zinc-200/70 dark:hover:bg-white/10",
        )}
      >
        {isFocused && (
          <motion.span
            layoutId={`${uid}-ring`}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-inset ring-[#242423] dark:ring-white"
            transition={still ? { duration: 0 } : RING}
          />
        )}
        {showError && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: `inset 0 0 0 2px ${ERROR}80` }}
          />
        )}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200",
            isFocused
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-400 dark:text-zinc-500",
          )}
        >
          {/* Every icon answers focus the same way: a quick pop with a small tilt. */}
          <motion.span
            className="grid"
            initial={false}
            animate={
              isFocused && !still
                ? { scale: [1, 1.18, 1], rotate: [0, -10, 6, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.45, ease: GLIDE }}
          >
            {icon}
          </motion.span>
        </span>
        <motion.label
          htmlFor={inputId}
          className="pointer-events-none absolute left-[52px] top-1/2 origin-left -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400"
          initial={false}
          animate={{ y: floated ? -11 : 0, scale: floated ? 12 / 14 : 1 }}
          transition={
            still
              ? { duration: 0 }
              : { type: "spring", stiffness: 500, damping: 34 }
          }
        >
          {label}
        </motion.label>
        <input
          id={inputId}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(id)}
          onBlur={() => {
            setFocused(null);
            if (value.length) setTouched(true);
            if (value.length && !valid && !still)
              shake.start({
                x: [0, -6, 6, -4, 4, 0],
                transition: { duration: 0.4 },
              });
          }}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? `${inputId}-error` : undefined}
          className={cn(
            "absolute inset-0 w-full rounded-full bg-transparent pb-1.5 pl-[52px] pt-5 text-base tabular-nums text-zinc-900 outline-none placeholder:text-transparent disabled:cursor-not-allowed dark:text-zinc-100",
            wide ? "pr-32" : "pr-14",
          )}

          {...inputProps}
        />
        <span className="pointer-events-none absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {right}
          <AnimatePresence>
            {valid && (
              <motion.span
                key="ok"
                className="grid size-5 place-items-center"
                style={{ color: SUCCESS }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* A light check that draws itself in. */}
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                  <motion.path
                    d="M3.5 8.5 6.5 11.5 12.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: still ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, ease: GLIDE }}
                  />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.div>
      <AnimatePresence initial={false}>
        {showError && (
          <motion.p
            id={`${inputId}-error`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: still ? 0 : 0.25, ease: GLIDE }}
            className="overflow-hidden px-5 text-xs"
            style={{ color: ERROR }}
          >
            <span className="block pt-1.5">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Confirmation (the same seal as VerifyFlow)

/** Scalloped seal outline, centred in a 100 by 100 box. */
function sealPath(bumps = 9, depth = 0.085, r = 42) {
  const pts: string[] = [];
  for (let i = 0; i <= 180; i++) {
    const t = (i / 180) * Math.PI * 2;
    const rr = r * (1 + depth * Math.cos(bumps * t));
    pts.push(
      `${(50 + Math.cos(t) * rr).toFixed(2)} ${(50 + Math.sin(t) * rr).toFixed(2)}`,
    );
  }
  return `M${pts.join(" L")}Z`;
}
const SEAL = sealPath();

/** Green seal that spins in, draws its check and bursts sparks, then floats. One GSAP timeline on mount, the same seal as VerifyFlow. */
function SuccessSeal({ accent, still }: { accent: string; still: boolean }) {
  const ref = React.useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const q = (sel: string) => ref.current!.querySelectorAll(sel);
      if (still) {
        gsap.set(q(".seal-tick"), { strokeDashoffset: 0 });
        return;
      }
      gsap
        .timeline({ delay: 0.6 })
        .from(q(".seal"), {
          scale: 0,
          rotation: -60,
          svgOrigin: "60 60",
          duration: 0.7,
          ease: "back.out(1.9)",
        })
        .to(
          q(".seal-tick"),
          { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" },
          0.32,
        )
        .fromTo(
          q(".spark"),
          {
            autoAlpha: 1,
            attr: { "stroke-dashoffset": 1 },
            scale: 0.6,
            svgOrigin: "60 60",
          },
          {
            attr: { "stroke-dashoffset": 0 },
            scale: 1,
            duration: 0.35,
            ease: "power3.out",
            stagger: 0.02,
          },
          0.28,
        )
        .to(
          q(".spark"),
          {
            autoAlpha: 0,
            scale: 1.18,
            svgOrigin: "60 60",
            duration: 0.45,
            ease: "power2.in",
            stagger: 0.02,
          },
          0.62,
        )
        .fromTo(
          q(".dot"),
          { autoAlpha: 1, scale: 0.3, svgOrigin: "60 60" },
          {
            scale: 1.35,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.03,
          },
          0.3,
        )
        .to(
          q(".seal-wrap"),
          { y: -3, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true },
          1.1,
        );
    },
    { scope: ref },
  );
  const sparks = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + 0.2;
    return {
      x1: 60 + Math.cos(a) * 48,
      y1: 60 + Math.sin(a) * 48,
      x2: 60 + Math.cos(a) * 58,
      y2: 60 + Math.sin(a) * 58,
    };
  });
  const dots = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    return { cx: 60 + Math.cos(a) * 54, cy: 60 + Math.sin(a) * 54 };
  });
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 120"
      className="size-[104px] overflow-visible"
      aria-hidden
    >
      {sparks.map((p, i) => (
        <line
          key={i}
          className="spark"
          {...p}
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ visibility: "hidden" }}
        />
      ))}
      {dots.map((p, i) => (
        <circle
          key={i}
          className="dot"
          {...p}
          r="2.4"
          fill={i % 2 ? "#f5c542" : accent}
          style={{ visibility: "hidden" }}
        />
      ))}
      <g className="seal-wrap">
        <g className="seal">
          <path d={SEAL} transform="translate(10 10)" fill={accent} />
          <path
            className="seal-tick"
            d="M44 61l11 11 22-23"
            fill="none"
            stroke="#fff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </g>
      </g>
    </svg>
  );
}

/** The ink continue button; its arrow slides through on hover. */
function ContinueButton({
  label,
  onClick,
  still,
}: {
  label: string;
  onClick?: () => void;
  still: boolean;
}) {
  const arrow =
    "absolute inset-0 size-4 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={still ? undefined : { scale: 0.97 }}
      className="group flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#242423] px-5 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-900 dark:focus-visible:ring-offset-zinc-900"
    >
      {label}
      <span aria-hidden className="relative size-4 shrink-0 overflow-hidden">
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
    </motion.button>
  );
}

/** The whole card turns into the confirmation once the card is saved. */
function Confirmation({
  brand,
  last4,
  expiry,
  title,
  cta,
  onContinue,
  onAnother,
  still,
}: {
  brand: Brand | null;
  last4: string;
  expiry: string;
  title: string;
  cta: string;
  onContinue?: () => void;
  onAnother: () => void;
  still: boolean;
}) {
  const heading = React.useRef<HTMLParagraphElement>(null);
  React.useEffect(() => heading.current?.focus(), []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col gap-4 p-6"
      initial={{ opacity: 0, y: still ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        still
          ? { opacity: 0, transition: { duration: 0 } }
          : {
              opacity: 0,
              scale: 0.96,
              filter: "blur(6px)",
              transition: { duration: 0.28, ease: GLIDE },
            }
      }
      transition={{ duration: 0.4, ease: GLIDE, delay: still ? 0 : 0.45 }}
    >
      <div className="flex flex-1 flex-col items-center justify-center rounded-[22px] bg-[#242423]/[0.035] px-4 pb-5 pt-6 text-center dark:bg-white/5">
        <SuccessSeal accent={SUCCESS} still={still} />
        <p
          ref={heading}
          tabIndex={-1}
          className="mt-3 text-lg font-semibold tracking-tight outline-none"
        >
          {title}
        </p>
        <motion.div
          initial={still ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: GLIDE, delay: still ? 0 : 1.15 }}
          className="mt-2 flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-xs text-zinc-500 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-zinc-800 dark:text-zinc-400"
        >
          {brand && (
            <span className="grid origin-left scale-[0.8]">
              <BrandLogo brand={brand} />
            </span>
          )}
          <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
            •••• {last4}
          </span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">Expires {expiry}</span>
        </motion.div>
      </div>
      <div className="flex gap-2">
        <motion.button
          type="button"
          onClick={onAnother}
          whileTap={still ? undefined : { scale: 0.96 }}
          className="group flex h-12 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-zinc-100 px-4 text-sm font-medium outline-none transition-colors hover:bg-zinc-200/80 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/6 dark:hover:bg-white/10"
        >
          <Plus
            className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90"
            strokeWidth={2.25}
            aria-hidden
          />
          Add another
        </motion.button>
        <ContinueButton label={cta} onClick={onContinue} still={still} />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------

export const PaymentForm = React.forwardRef<HTMLFormElement, PaymentFormProps>(
  function PaymentForm(
    {
      title = "Payment details",
      subtitle = "Add a card to finish setting up your plan. You can remove it any time.",
      cta = "Save card",
      doneLabel = "Card saved",
      defaultSave = true,
      onSubmit,
      continueLabel = "Continue to checkout",
      onContinue,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const uid = React.useId();
    const [focused, setFocused] = React.useState<FieldId | null>(null);
    const [number, setNumber] = React.useState("");
    const [name, setName] = React.useState("");
    const [expiry, setExpiry] = React.useState("");
    const [cvc, setCvc] = React.useState("");
    const [save, setSave] = React.useState(defaultSave);
    const [phase, setPhase] = React.useState<Phase>("idle");
    const [round, setRound] = React.useState(0);
    const form = React.useRef<HTMLFormElement>(null);
    const card = React.useRef<HTMLDivElement>(null);
    // The form plays in once the card scrolls into view, and again each time it comes back for another card.
    const inView = useInView(card, { once: true, amount: 0.3 });
    const show = still || inView || round > 0;
    React.useImperativeHandle(ref, () => form.current as HTMLFormElement);
    React.useEffect(() => {
      if (form.current) form.current.inert = phase === "done";
    }, [phase]);

    /** Clear everything for another card; the fields remount so their hints reset too. */
    const another = () => {
      setNumber("");
      setName("");
      setExpiry("");
      setCvc("");
      setSave(defaultSave);
      setPhase("idle");
      setRound((r) => r + 1);
    };

    const digits = digitsOf(number);
    const brand = brandOf(digits);
    const amex = brand === "Amex";
    // Full length for the brand (15 for Amex, 16 otherwise) and a passing Luhn check.
    const numberOk = digits.length === (amex ? 15 : 16) && luhn(digits);
    const nameOk = name.trim().length > 1;
    const expiryOk = expiryValid(expiry);
    const cvcOk = cvc.length === (amex ? 4 : 3);
    const ready = numberOk && nameOk && expiryOk && cvcOk;
    const locked = phase !== "idle";

    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!ready || locked) return;
      setPhase("loading");
      try {
        await Promise.all([
          onSubmit?.({
            number: digits,
            name: name.trim(),
            expiry,
            cvc,
            brand,
            save,
          }),
          new Promise((r) => setTimeout(r, still ? 200 : 1000)),
        ]);
        setPhase("done");
      } catch {
        setPhase("idle");
      }
    };

    const muted = "#f4f4f5";

    return (
      <div
        ref={card}
        className={cn(
          "relative w-[400px] max-w-full overflow-hidden rounded-3xl bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        <motion.form
          key={round}
          ref={form}
          onSubmit={submit}
          noValidate
          aria-hidden={phase === "done"}
          variants={still ? undefined : FORM}
          initial={still ? false : "hidden"}
          animate={
            phase === "done"
              ? still
                ? { opacity: 0 }
                : "away"
              : still
                ? { opacity: 1 }
                : show
                  ? "shown"
                  : "hidden"
          }
          onAnimationComplete={(def) => {
            // Coming back for another card: put the cursor in the number field.
            if (def === "shown" && round > 0)
              form.current?.querySelector("input")?.focus();
          }}
          className="p-6"
        >
          <motion.div variants={still ? undefined : ROW}>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-1 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          </motion.div>

          <LayoutGroup id={uid}>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Field
                uid={uid}
                id="number"
                wide
                label="Card number"
                value={number}
                onChange={(v) => setNumber(formatNumber(digitsOf(v)))}
                focused={focused}
                setFocused={setFocused}
                valid={numberOk}
                error="Check the card number."
                disabled={locked}
                still={still}
                className="col-span-2"
                icon={<CreditCard className="size-5" strokeWidth={1.75} />}
                right={
                  <AnimatePresence mode="popLayout">
                    {brand && (
                      <motion.span
                        key={brand}
                        initial={
                          still
                            ? { opacity: 0 }
                            : { opacity: 0, y: 8, filter: "blur(4px)" }
                        }
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={
                          still
                            ? { opacity: 0 }
                            : { opacity: 0, y: -8, filter: "blur(4px)" }
                        }
                        transition={{ duration: 0.3, ease: GLIDE }}
                        className="grid"
                      >
                        <BrandLogo brand={brand} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                }
                inputProps={{
                  inputMode: "numeric",
                  autoComplete: "cc-number",
                  maxLength: 23,
                }}
              />
              <Field
                uid={uid}
                id="name"
                label="Name on card"
                value={name}
                onChange={(v) =>
                  setName(v.replace(/[^\p{L}\s'.-]/gu, "").slice(0, 40))
                }
                focused={focused}
                setFocused={setFocused}
                valid={nameOk}
                error="Enter the name on the card."
                disabled={locked}
                still={still}
                className="col-span-2"
                icon={<UserRound className="size-5" strokeWidth={1.75} />}
                inputProps={{
                  autoComplete: "cc-name",
                  autoCapitalize: "words",
                }}
              />
              <Field
                uid={uid}
                id="expiry"
                label="Expiry"
                value={expiry}
                onChange={(v) =>
                  // Let backspace pass through the slash.
                  setExpiry(
                    v.length < expiry.length && expiry.endsWith("/")
                      ? v.replace("/", "")
                      : formatExpiry(v),
                  )
                }
                focused={focused}
                setFocused={setFocused}
                valid={expiryOk}
                error="Use a future date, MM/YY."
                disabled={locked}
                still={still}
                icon={<CalendarDays className="size-5" strokeWidth={1.75} />}
                inputProps={{
                  inputMode: "numeric",
                  autoComplete: "cc-exp",
                  maxLength: 5,
                }}
              />
              <Field
                uid={uid}
                id="cvc"
                label="CVC"
                value={cvc}
                onChange={(v) => setCvc(digitsOf(v).slice(0, amex ? 4 : 3))}
                focused={focused}
                setFocused={setFocused}
                valid={cvcOk}
                error={
                  amex
                    ? "Four digits on the front."
                    : "Three digits on the back."
                }
                disabled={locked}
                still={still}
                icon={<CvcIcon />}
                inputProps={{
                  inputMode: "numeric",
                  autoComplete: "cc-csc",
                  maxLength: 4,
                }}
              />
            </div>
          </LayoutGroup>

          {/* Save switch */}
          <motion.div variants={still ? undefined : ROW}>
            <button
              type="button"
              role="switch"
              aria-checked={save}
              disabled={locked}
              onClick={() => setSave((v) => !v)}
              className="group mt-5 flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed"
            >
              <span>Save card for future payments</span>
              <span
                className={cn(
                  "relative flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
                  save
                    ? "justify-end bg-[#242423] dark:bg-white"
                    : "justify-start bg-zinc-200 dark:bg-white/15",
                )}
              >
                <motion.span
                  layout
                  transition={
                    still
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 600, damping: 32 }
                  }
                  className="block size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] group-active:w-6 dark:bg-zinc-900"
                />
              </span>
            </button>
          </motion.div>

          <motion.div variants={still ? undefined : ROW}>
            <motion.button
              type="submit"
              aria-disabled={!ready || locked}
              whileTap={
                ready && !locked && !still ? { scale: 0.98 } : undefined
              }
              animate={{
                backgroundColor:
                  phase === "done"
                    ? SUCCESS
                    : ready || locked
                      ? "#242423"
                      : muted,
                color: ready || locked ? "#ffffff" : "#a1a1aa",
              }}
              transition={{ duration: still ? 0 : 0.3, ease: GLIDE }}
              className={cn(
                "mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
                ready && !locked ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span className="relative grid size-4 place-items-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  {phase === "loading" ? (
                    <motion.span
                      key="spin"
                      className="size-4 rounded-full border-2 border-white/30 border-t-white"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: still ? 0 : 360,
                      }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{
                        rotate: {
                          duration: 0.8,
                          ease: "linear",
                          repeat: Infinity,
                        },
                        default: { duration: 0.2 },
                      }}
                    />
                  ) : phase === "done" ? (
                    <motion.svg
                      key="check"
                      viewBox="0 0 16 16"
                      className="size-4"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={POP}
                      aria-hidden
                    >
                      <motion.path
                        d="M3.5 8.5 6.5 11.5 12.5 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.25}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: still ? 1 : 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 0.35,
                          ease: GLIDE,
                          delay: 0.08,
                        }}
                      />
                    </motion.svg>
                  ) : (
                    <motion.span
                      key="lock"
                      className="grid"
                      exit={{ opacity: 0, scale: 0.6 }}
                    >
                      <LockIcon shut={ready} still={still} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <Rolling
                text={
                  phase === "loading"
                    ? "Saving card"
                    : phase === "done"
                      ? doneLabel
                      : cta
                }
                still={still}
              />
            </motion.button>
          </motion.div>
        </motion.form>

        <AnimatePresence>
          {phase === "done" && (
            <Confirmation
              key="done"
              brand={brand}
              last4={digits.slice(-4)}
              expiry={expiry}
              title={doneLabel}
              cta={continueLabel}
              onContinue={onContinue}
              onAnother={another}
              still={still}
            />
          )}
        </AnimatePresence>

        <span role="status" aria-live="polite" className="sr-only">
          {phase === "loading"
            ? "Saving card."
            : phase === "done"
              ? `${brand ?? "Card"} ending in ${digits.slice(-4)} saved.`
              : ""}
        </span>
      </div>
    );
  },
);