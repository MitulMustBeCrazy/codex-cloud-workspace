"use client";

/**
 * DecayCard, from https://motion-brew.com/components/decay-card
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
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { twMerge } from "tailwind-merge";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// DecayCard

/**
 * DecayCard
 *
 * Trigger: hover. A full-bleed image card with its text laid over the
 * picture. When the pointer comes onto it, the picture decays from the inside
 * out: a hole opens right where the pointer entered and eats outward, its rim
 * torn and eroded, with chunks bitten out just past the edge and fine specks
 * sprayed beyond it, spreading until it has eaten the whole card and a second
 * picture shows through, easing in from a slight zoom. While it spreads the
 * rim keeps crawling and the hole drifts after the pointer.
 * Leaving lets the first picture grow back over the hole until it is whole
 * again. The card also sits in 3D: it leans toward the pointer and lifts a
 * touch, a soft glare slides across it and the text drifts against the lean
 * for depth. The text stays crisp on top. Reduced motion shows the plain
 * picture, flat.
 *
 * Engine: canvas 2D. The picture is drawn each frame and a rounded hole with
 * a noisy, gritty outline and scattered flecks is cut out of it with
 * destination-out, in one requestAnimationFrame loop that rests once the
 * picture is whole; motion/react eases the text in.
 */

export interface DecayCardProps {
  /** The picture. */
  src?: string;
  /** The picture the decay reveals underneath. */
  revealSrc?: string;
  /** Small label in the top corner. Default `"Field notes"`. */
  tag?: string;
  /** Title over the picture. Default `"Nothing stays"`. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** How far the decay eats, as a share of the card. Above about 1.5 it takes the whole card. Default `1.6`. */
  depth?: number;
  /** Speed of the decay and the mending. Default `1`. */
  speed?: number;
  /** How far the card leans toward the pointer, in degrees. `0` keeps it flat. Default `8`. */
  tilt?: number;
  /** A soft glare that follows the pointer across the card. Default `true`. */
  glare?: boolean;
  className?: string;
}

const GLIDE = [0.22, 1, 0.36, 1] as const;

export const DecayCard = React.forwardRef<HTMLDivElement, DecayCardProps>(
  function DecayCard(
    {
      src = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=720&h=940&fit=crop&q=80",
      revealSrc = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=720&h=940&fit=crop&q=80",
      tag = "Field notes",
      title = "Nothing stays",
      subtitle = "Hover the picture and watch it rot away from the inside.",
      depth = 1.6,
      speed = 1,
      tilt = 8,
      glare: showGlare = true,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const box = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => box.current as HTMLDivElement);
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const settings = React.useRef({ depth, speed, still });
    settings.current = { depth, speed, still };
    const kick = React.useRef<() => void>(() => {});
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
      const el = canvas.current;
      const host = box.current;
      if (!el || !host) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;

      // The ragged edge: a few slow waves plus fine fixed grit around the rim, so the
      // outline looks torn and eroded rather than round.
      const N = 260;
      const grit = Float32Array.from(
        { length: N },
        () => (Math.random() - 0.5) * 2,
      );
      const waves = [
        { f: 3, a: 0.07, p: Math.random() * 6 },
        { f: 5, a: 0.05, p: Math.random() * 6 },
        { f: 9, a: 0.035, p: Math.random() * 6 },
        { f: 17, a: 0.02, p: Math.random() * 6 },
      ];
      // Flecks and pits scattered around the rim: a few chunks bite out just past the edge,
      // and fine specks spray further out, like the splatter in a grunge frame.
      const flecks = Array.from({ length: 220 }, () => {
        const near = Math.random() < 0.55;
        return {
          a: Math.random() * Math.PI * 2,
          k: near ? 1 + Math.random() * 0.12 : 1.04 + Math.random() * 0.34,
          r: near ? 1.5 + Math.random() * 5 : 0.6 + Math.random() * 2.2,
        };
      });

      let raf = 0;
      let running = false;
      let w = 0;
      let h = 0;
      let dpr = 1;
      let ready = false;
      let p = 0;
      let target = 0;
      let time = 0;
      let last = 0;
      const centre = { x: 0, y: 0, tx: 0, ty: 0 };

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = src;

      const fit = () => {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        w = host.clientWidth;
        h = host.clientHeight;
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
      };

      const cover = () => {
        const ir = img.naturalWidth / img.naturalHeight;
        const br = w / h;
        if (ir > br) {
          const sw = img.naturalHeight * br;
          return [
            (img.naturalWidth - sw) / 2,
            0,
            sw,
            img.naturalHeight,
          ] as const;
        }
        const sh = img.naturalWidth / br;
        return [0, (img.naturalHeight - sh) / 2, img.naturalWidth, sh] as const;
      };

      /** Radius of a rounded-rectangle shape (a superellipse) in direction t, for half sizes a and b. */
      const rim = (t: number, a: number, b: number) => {
        const c = Math.abs(Math.cos(t)) / a;
        const s = Math.abs(Math.sin(t)) / b;
        return 1 / Math.pow(Math.pow(c, 4) + Math.pow(s, 4), 0.25);
      };

      const draw = () => {
        if (!ready) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, w, h);
        const [sx, sy, sw, sh] = cover();
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        if (p < 0.002) return;

        // Eat the hole out of the picture from the inside.
        const grow = p * settings.current.depth;
        const a = (w / 2) * grow;
        const b = (h / 2) * grow;
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000";
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const t = (i / N) * Math.PI * 2;
          let k = 1 + grit[i % N]! * 0.035;
          for (const wv of waves)
            k += Math.sin(t * wv.f + wv.p + time * (0.6 + wv.f * 0.05)) * wv.a;
          const r = rim(t, a, b) * k;
          const x = centre.x + Math.cos(t) * r;
          const y = centre.y + Math.sin(t) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        // The flecks only appear once the hole is open, and spread with it.
        for (const f of flecks) {
          const r = rim(f.a, a, b) * f.k;
          ctx.beginPath();
          ctx.arc(
            centre.x + Math.cos(f.a) * r,
            centre.y + Math.sin(f.a) * r,
            f.r * Math.min(1, p * 1.6),
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      };

      const loop = (now: number) => {
        const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
        last = now;
        const set = settings.current;
        // Decay creeps in and mends on the same easing, faster or slower with speed.
        // Eating in is a slow crawl; growing back is a little quicker.
        const rate = target > p ? 1.15 : 1.8;
        p += (target - p) * Math.min(1, dt * rate * set.speed);
        time += dt * (0.8 + p);
        // The hole drifts toward the pointer while it is small, and centres itself as it takes the card.
        const room = Math.max(0, 1 - set.depth * Math.max(p, 0.3));
        const limX = (w / 2) * room;
        const limY = (h / 2) * room;
        const gx = w / 2 + Math.max(-limX, Math.min(limX, centre.tx - w / 2));
        const gy = h / 2 + Math.max(-limY, Math.min(limY, centre.ty - h / 2));
        centre.x += (gx - centre.x) * Math.min(1, dt * 5);
        centre.y += (gy - centre.y) * Math.min(1, dt * 5);
        draw();
        if (target === 0 && p < 0.002) {
          p = 0;
          draw();
          running = false;
          return;
        }
        raf = requestAnimationFrame(loop);
      };

      const start = () => {
        if (running || settings.current.still) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(loop);
      };
      kick.current = start;

      img.onload = () => {
        ready = true;
        centre.x = centre.tx = w / 2;
        centre.y = centre.ty = h / 2;
        draw();
      };

      const local = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };
      const onEnter = (e: PointerEvent) => {
        if (!ready || settings.current.still) return;
        const q = local(e);
        // Start the decay right where the pointer comes in.
        if (p < 0.05) {
          centre.x = centre.tx = q.x;
          centre.y = centre.ty = q.y;
        }
        target = 1;
        setOpen(true);
        start();
      };
      const onMove = (e: PointerEvent) => {
        const q = local(e);
        centre.tx = q.x;
        centre.ty = q.y;
        if (target === 0 && e.pointerType !== "mouse") onEnter(e);
      };
      const onLeave = () => {
        target = 0;
        setOpen(false);
        start();
      };

      fit();
      const ro = new ResizeObserver(() => {
        fit();
        draw();
      });
      ro.observe(host);
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      };
    }, [src]);

    // 3D: the card leans toward the pointer, the text drifts against the lean for depth,
    // and a soft glare slides across the glass.
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const spring = { stiffness: 170, damping: 20 };
    const amount = still ? 0 : Math.max(0, tilt);
    const depth3d = amount / 12;
    const rotateX = useSpring(
      useTransform(py, (v) => (0.5 - v) * 2 * amount * 0.83),
      spring,
    );
    const rotateY = useSpring(
      useTransform(px, (v) => (v - 0.5) * 2 * amount),
      spring,
    );
    const lift = useSpring(1, spring);
    const textX = useSpring(
      useTransform(px, (v) => (v - 0.5) * 16 * depth3d),
      spring,
    );
    const textY = useSpring(
      useTransform(py, (v) => (v - 0.5) * 12 * depth3d),
      spring,
    );
    const glareX = useTransform(px, (v) => `${v * 100}%`);
    const glareY = useTransform(py, (v) => `${v * 100}%`);
    const glare = useMotionTemplate`radial-gradient(260px circle at ${glareX} ${glareY}, rgba(255,255,255,0.2), transparent 65%)`;
    const lean = (e: React.PointerEvent<HTMLDivElement>) => {
      if (still) return;
      const r = e.currentTarget.getBoundingClientRect();
      px.set((e.clientX - r.left) / r.width);
      py.set((e.clientY - r.top) / r.height);
    };

    const show = { opacity: 1, y: 0, filter: "blur(0px)" };
    const hide = { opacity: 0, y: 10, filter: "blur(4px)" };

    return (
      <div
        className={cn("aspect-[340/440] w-[340px] max-w-full", className)}
        style={{ perspective: 1000 }}
        onPointerMove={lean}
        onPointerEnter={() =>
          amount > 0 && lift.set(1 + 0.03 * Math.min(1, depth3d))
        }
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          lift.set(1);
        }}
      >
        <motion.div
          ref={box}
          style={{
            rotateX,
            rotateY,
            scale: lift,
          }}
          className="relative size-full overflow-hidden rounded-3xl bg-[#0b0b0c] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_24px_48px_-20px_rgba(0,0,0,0.45)] will-change-transform"
        >
          {/* The second picture waits under the first and shows through the decay,
            easing in from a slight zoom as the hole opens. */}
          <motion.img
            src={revealSrc}
            alt=""
            aria-hidden
            draggable={false}
            initial={false}
            animate={{ scale: open && !still ? 1 : 1.12 }}
            transition={{ duration: 1.4, ease: GLIDE }}
            className="absolute inset-0 size-full select-none object-cover"
          />
          {/* The plain picture, used only under reduced motion. */}
          <img
            src={src}
            alt=""
            aria-hidden
            draggable={false}
            className={cn(
              "absolute inset-0 size-full select-none object-cover",
              !still && "hidden",
            )}
          />
          <canvas
            ref={canvas}
            role="img"
            aria-label={title}
            className={cn("absolute inset-0 size-full", still && "hidden")}
          />

          {/* Text over the picture, on a soft dark wash so it always reads. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
          />
          <motion.span
            initial={still ? false : hide}
            animate={show}
            transition={{ duration: 0.5, ease: GLIDE, delay: 0.1 }}
            className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md"
          >
            {tag}
          </motion.span>
          {/* Glare on the glass, following the pointer. */}
          {!still && showGlare && (
            <motion.div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-300",
                open ? "opacity-100" : "opacity-0",
              )}
              style={{ background: glare }}
            />
          )}
          <motion.div
            style={{ x: textX, y: textY }}
            className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-white"
          >
            <motion.h3
              initial={still ? false : hide}
              animate={show}
              transition={{ duration: 0.55, ease: GLIDE, delay: 0.15 }}
              className="text-2xl font-semibold tracking-tight"
            >
              {title}
            </motion.h3>
            <motion.p
              initial={still ? false : hide}
              animate={show}
              transition={{ duration: 0.55, ease: GLIDE, delay: 0.25 }}
              className="mt-1.5 text-sm leading-relaxed text-white/75"
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    );
  },
);