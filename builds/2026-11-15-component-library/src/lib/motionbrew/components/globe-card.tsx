"use client";

/**
 * GlobeCard, from https://motion-brew.com/components/globe-card
 *
 * One self contained file: the component and the cn()
 * helper. Needs React 18 or 19 and Tailwind CSS v4.
 */

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";
import * as THREE from "three";

// cn(): merges Tailwind classes, later ones win.
/** Merge Tailwind classes, letting later classes win conflicts. */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// GlobeCard

/**
 * GlobeCard
 *
 * Trigger: drag (plus hover and in view). A feature card, for a team or about
 * page or anywhere else, with a dotted 3D globe rising from its bottom edge
 * over a soft colored glow. People sit in cities around the world; arcs draw
 * between them with a small glowing comet at the head, and each landing pops
 * that person's avatar with a ripple. The globe turns slowly, leans toward the
 * cursor on hover and spins and tips under a drag with momentum. When the card
 * scrolls into view the title and body rise out of a soft blur, followed by a
 * gray ghost button whose arrow slides through on hover. Rendering pauses off
 * screen. The globe is decorative; the text stays real content. Reduced motion
 * shows a still globe with its arcs already drawn.
 *
 * Engine: three.js for the globe, dots, arcs and avatars (one WebGL canvas),
 * with motion/react for the text reveal.
 */

export interface GlobeMember {
  name: string;
  city: string;
  lat: number;
  lon: number;
  /** Avatar color. Default from the palette. */
  color?: string;
}

export interface GlobeCardProps {
  /** Card title. Default `"Global team"`. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Button label. Default `"Meet the team"`. */
  cta?: string;
  /** Where the button goes. Without it the button calls `onCta`. */
  href?: string;
  /** Teammates and where they are. Default ten people around the world. */
  members?: GlobeMember[];
  /** Arcs in flight at once. Default `6`. */
  arcs?: number;
  /** Seconds per full turn. `0` holds the globe still. Default `70`. */
  turn?: number;
  /** Called by the button when there is no `href`. */
  onCta?: () => void;
  className?: string;
}

const PALETTE = [
  "#9150e0",
  "#3d66d6",
  "#d6498f",
  "#269a5a",
  "#cf7a1c",
  "#2a9fbf",
];
const GLIDE = [0.22, 1, 0.36, 1] as const;

const DEFAULT_MEMBERS: GlobeMember[] = [
  { name: "Ava Chen", city: "San Francisco", lat: 37.8, lon: -122.4 },
  { name: "Leo Martins", city: "São Paulo", lat: -23.5, lon: -46.6 },
  { name: "Maya Lindqvist", city: "Stockholm", lat: 59.3, lon: 18.1 },
  { name: "Daniel Okafor", city: "Lagos", lat: 6.5, lon: 3.4 },
  { name: "Priya Raman", city: "Bengaluru", lat: 12.97, lon: 77.6 },
  { name: "Kenji Sato", city: "Tokyo", lat: 35.7, lon: 139.7 },
  { name: "Grace Hill", city: "Sydney", lat: -33.9, lon: 151.2 },
  { name: "Omar Haddad", city: "Dubai", lat: 25.2, lon: 55.3 },
  { name: "Sofia Ruiz", city: "Mexico City", lat: 19.4, lon: -99.1 },
  { name: "Tom Becker", city: "Berlin", lat: 52.5, lon: 13.4 },
];

// ---------------------------------------------------------------------------
// Land mask: 360 by 180 cells (1 degree each, rows from the north), one bit per cell, packed and base64 encoded.
// Generated from Natural Earth land (110m) via the world-atlas package; Natural Earth is public domain.

const LAND =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADf//8AAf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////D//////n/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gf/x////////wAAAAAbgAAB4AAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAf//8A///////+AAAAB/ngAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAcH3Hv/5////////8AAAAA/gAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAcIAAQP/AH///////+AAAAAPCAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAADwDAc+f+AP///////4AAAAAAAAAAAAAB4AAAAB/8AAAAAAAAAAAAAAAAAAAAAH9wc374AAAf/////8AAAAAAAAAAAAH4AAAA////AAAB/gAAAAAAAAAAAAAAAAwAAA+QAAAH/////8AAAAAAAAAAAAOAAAAP///wAAAAAAAAAAAAAAAAAAAAP8AYe+c3AAAD/////4AAAAAAAAAAAA4AAAH////++HgAOAAAAAAAAAAAAAAAfv+4+w/4gAAB/////wAAAAAAAAAAADwAHgH///////4AfwAAAAAgAAAAAAAAPf/4O4//9AAB/////wAAAAAAAAAAADwAPb////////4m//gAAAAAAAf+AAAAAAf+A8f//4AB////8gAAAAAAA/gAAAAAfv/////////////8AAAAAB///+H//H/+PeDwf+AA3////AAAAAAA//4AAAA8fv///////////////P8wAf////////A4CPz4H8AAP///wAAAAAAD///wADH/n3/////////////////8AD////////////34Z/wA///4AAAAAAAP///+M////n/////////////////+4E/////////////gD/8Af//gAAIAAAAf//4+P////f/////////////////fw/////////////6AD8YAf/wAAf8AAAA/8f+D///////////////////////AgEf///////////zw7/AAP/gAAP4AAAB/4/+f//////////////////////8AMAf//////////+DIA/gAH/gAAAAAAAH/z/////////////////////////+AAH///////////8AwgGAAD+AAAAAAAA//H/////////////////////////6AAP///////////wAA/AAAB+AAAAAAAB/+H//////////////////////nP+AAAH//z////////wAA/wAAAOAAAAAAAB//D/////////////////////+A/4AAAA/zAD///////gAA/4wAAAAAAAAAAB//Ab///////////////////+eDgAAAAABwAA///////4AA/94AAAAAAAAAYA5+A///////////////////4AAHAAAAAADcAAD//////4AAf/8AAAAAAAAA8AC+C///////////////////wAAfgAAAAAMAAAA///////wAf/8AAAAAAAAA4AO8H///////////////////AAA/gAAAABgAAAA///////8A///AAAAAAAAA8ANwH//////////////////8AAB/AAAAAEAAAAAf///////z///4AAAAAAAHOAEDv//////////////////+AAA+AAAAAAAAAABH///////x///8AAAAAAAHHAf/////////////////////6AA8AAAAAAAAAAAD///////x///8AAAAAAAGPz//////////////////////6AAwAAAAAAAAAAAD///////9///6AAAAAAAAPj//////////////////////6AAQAAAAAAAAAAAC///////////MAAAAAAAAYf//////////////////////7AAAAAAAAAAAAAABv////////+MNAAAAAAAAD///////////////////////zAAAAAAAAAAAAAAAH////////7gfgAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAL/////////gCgAAAAAAAH///////////////////////iAAAAAAAAAAAAAAAP/////////pAAAAAAAAAD/////uP/x//////////////DAAAAAAAAAAAAAAAP/////////+AAAAAAAAAB//v//Gf/B/////////////+AAAAAAAAAAAAAAAAP////////8wAAAAAAAAAB//H/+AP+P/////////////8CAAAAAAAAAAAAAAAP////////wAAAAAAAAADj/jz/8AD/H/////////////4HgAAAAAAAAAAAAAAP////////gAAAAAAAAAH/4Bw/8AA/B////////////+APAAAAAAAAAAAAAAAP////////gAAAAAAAAAH/wA8f8Ph/g////////////8AAAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/gMHfJ///x///////////v4AMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/AMCOP///h//////////+JwAMAAAAAAAAAAAAAAAH///////4AAAAAAAAAAH/AAAHP///g//////////8BwAIAAAAAAAAAAAAAAAH///////wAAAAAAAAAAH+AAYGH///w//////////+w4A4AAAAAAAAAAAAAAAD///////wAAAAAAAAAAAgf+ACBs//////////////g4D4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAAj/+AAAA//////////////AYf4AAAAAAAAAAAAAAAA///////gAAAAAAAAAAB//8AAAA//////////////Ah2AAAAAAAAAAAAAAAAAP/////+AAAAAAAAAAAD//+AAAB//////////////gDwAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAH///4GAB//////////////gDAAAAAAAAAAAAAAAAAAG/////4AAAAAAAAAAAP///8P4h//////////////wCAAAAAAAAAAAAAAAAAACf////4AAAAAAAAAAAP////v////////////////gAAAAAAAAAAAAAAAAAAABP//hgYAAAAAAAAAAAP//////3//P///////////wAAAAAAAAAAAAAAAAAAAAv//AAYAAAAAAAAAAAf//////9//H///////////wAAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAB///////4//h///////////gAAAAAAAAAAAAAAAAAAAAR/+AANAAAAAAAAAAD///////8//wH//////////AAAAAAAAAAAAAAAAAAAAAJ/+AAEAAAAAAAAAAH///////+f/0B/////////+AAAAAAAAAAAAAAAAAAAAAI/8AAAAAAAAAAAAAH///////+f/44Af///////+QAAAAAAAAAAAAAAAAAAAAAf8AAAAAAAAAAAAAP////////H//+AP///////4gAAAAAAAAAAAAAAAAAAAAAP8AAuAAAAAAAAAAP////////H///AD///v///ggAAAAAAAAAAAAAAAAAAAAAH+AABgAAAAAAAAAf////////n//+AD//4P//YAAAAAAAAAAAAAAAAAAAAAAAP+A4AYAAAAAAAAAP////////j//+AAf/4H/+AAAAAAAAAAAAAAAAgAAAAAAAH/B4ABwAAAAAAAAP////////h//8AAf/gD/8YAAAAAAAAAAAAAAAAAAAAAAAD/nwAD9AAAAAAAAP////////x//4AAf/AD/8QAAAAAAAAAAAAAAAAAAAAAAAAf/wAAAAAAAAAAAP////////4//gAAf+AD/+AAwAAAAAAAAAAAAAAAAAAAAAAH/wAAAAAAAAAAAf////////4f+AAAf8AD//AAwAAAAAAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAf////////8f8AAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf////////+fgAAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAf/////////eAAAAHwAAP/gAMAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAf/////////gAAAAHwAAM/gACAAAAAAAAAAAAAAAAAAAAAAAADABAAAAAAAAAP/////////gYAAADwAAEfgAJAAAAAAAAAAAAAAAAAAAAAAAADgPfKAAAAAAAH/////////34AAADwAAIOABAAAAAAAAAAAAAAAAAAAAAAAAAAyPf+AAAAAAAD//////////4AAADoAAIEACBAAAAAAAAAAAAAAAAAAAAAAAAA8///AAAAAAAB//////////wAAABIAAMAAAFAAAAAAAAAAAAAAAAAAAAAAAAAE///gAAAAAAB//////////wAAAAMAAEAAALgAAAAAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAf/////////gAAAAMAADAAMCAAAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAP/B///////gAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAf///wAAAAAACAA///////AAAAAAAAxgA+AAAAAAAAAAAAAAAAAAAAAAAAAAAf///4AAAAAAAAAD/////+AAAAAAAAZgB4AAAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAD/////8AAAAAAAAMwH8AAAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAH/////4AAAAAAAAHQf8AIAAAAAAAAAAAAAAAAAAAAAAAAD////8AAAAAAAAAH/////gAAAAAAAAHgf88IAAAAAAAAAAAAAAAAAAAAAAAAD////+AAAAAAAAAH/////AAAAAAAAADwf8AAgAAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAH/////AAAAAAAAABwP5wBwAAAAAAAAAAAAAAAAAAAAAAAH/////6AAAAAAAAD////+AAAAAAAAAB8P5wATwAAAAAAAAAAAAAAAAAAAAAAD//////4AAAAAAAB////8AAAAAAAAAA8AxQif+AAAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAB////4AAAAAAAAAAcAAIAD/gAAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAMAAIAI/ywAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAADgAAAI/8BAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///4AAAAAAAAAAB+AAAA/4AIAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///4AAAAAAAAAAAAmogAOMAAAAAAAAAAAAAAAAAAAAAB///////AAAAAAAAf///8AAAAAAAAAAAABCAAAGADAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAf///8AAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAf/////+AAAAAAAAP///8AAAAAAAAAAAAAAAgCAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAB+CAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAAf///+AQAAAAAAAAAAAAD8DAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+AwAAAAAAAAAAAA38DgAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////8BwAAAAAAAAAAAD/8DgAAAAAAAAAAAAAAAAAAAAAAB/////4AAAAAAAA////8PwAAAAAAAAAAAD//HwAABABAAAAAAAAAAAAAAAAAAf////4AAAAAAAA////wPgAAAAAAAAAAAP//3wAAAACAAAAAAAAAAAAAAAAAAP////wAAAAAAAA////APgAAAAAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAAf///4AAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAD////+AAIAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP//+AfAAAAAAAAAAAf////+AAEAAAAAAAAAAAAAAAAAAAAP////AAAAAAAAAP///AfAAAAAAAAAAA//////AAAAAAAAAAAAAAAAAAAAAAAP///4AAAAAAAAAP//+APAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAH//+AOAAAAAAAAAAB//////wAAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AEAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAD//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAAf//8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAAAAA//AAAAAAAAAAAAAAP/////4AAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAAAAA/+AAAAAAAAAAAAAAP/AP//wAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA/4AAAAAAAAAAAAAAf8AG//gAAAAAAAAAAAAAAAAAAAAAA//3AAAAAAAAAAAAYAAAAAAAAAAAAAAAOAAF//gAAAAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAABAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAgAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAQAAAAAAAAAAAAAAAAAB//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAAAcAAAAAAAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAADQAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAHAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAOAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAH4AAAAAAB4HgAD8AAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAA//AAAD//////////wAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAf///4Af///////////AAAAAAAAAAAAAAAAAAAAAAAz4AAAAAAAAAAAAAAAPz////8B/////////////wAAAAAAAAAAAAAAAAAAAAA78AAAAAAAAAAA8/8///////wf/////////////+AAAAAAAAAAAAAAAAAAAAH9+AAAAAAAAZ////////////w////////////////4AAAAAAAAAAAAAAAAAAAB+AAAAAAAB//////////////////////////////4AAAAAAAAABmAAB8f+HB/+AAAAAAAP//////////////////////////////gAAAAAAAAP/Y/oAf/////4AAAAAAAP/////////////////////////////8AAAAAAAD/////////////gAAAAAAB//////////////////////////////wAAAAAAAD////////////wAAAAAAP///////////////////////////////wAAAAAD/////////////4AAAAAAD////////////////////////////////wAAAADh/////////////AAAAB8A/////////////////////////////////+AAAAA4Af///////////gAAAH+AA///////////////////////////////+AAAAAAAAH///////////+A/A/wAA///////////////////////////////8AAAAAAAf//////////////gAAAf////////////////////////////////+AAAAAAAH///////////////h////////////////////////////////////wAAAAAAP/////////////////////////////////////////////////////gA+/gAAH/////////////////////////////////////////////////////8/////v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////";

let landBits: Uint8Array | null = null;
function isLand(lat: number, lon: number) {
  if (!landBits) {
    const raw = atob(LAND);
    landBits = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) landBits[i] = raw.charCodeAt(i);
  }
  const r = Math.min(179, Math.max(0, Math.floor(90 - lat)));
  const c = Math.min(359, Math.max(0, Math.floor(lon + 180)));
  const i = r * 360 + c;
  return (landBits[i >> 3]! >> (7 - (i & 7))) & 1;
}

/** Latitude and longitude to a point on a sphere of radius r (y up, lon 0 facing +z). */
function toVec(lat: number, lon: number, r = 1) {
  const phi = (lat * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(phi) * Math.sin(lam),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.cos(lam),
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function canvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D) => void,
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A soft round dot for the land points. */
const dotTexture = () =>
  canvasTexture(64, 64, (g) => {
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(32, 32, 26, 0, Math.PI * 2);
    g.fill();
  });

/** A round glow: the comet head and the atmosphere. */
const glowTexture = (color: string, inner = 0.0) =>
  canvasTexture(128, 128, (g) => {
    const grad = g.createRadialGradient(64, 64, 64 * inner, 64, 64, 64);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  });

/** A teammate avatar: initials on a colored disc with a white ring and a soft shadow. */
const avatarTexture = (name: string, color: string) =>
  canvasTexture(128, 128, (g) => {
    g.shadowColor = "rgba(0,0,0,0.22)";
    g.shadowBlur = 12;
    g.shadowOffsetY = 4;
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(64, 60, 46, 0, Math.PI * 2);
    g.fill();
    g.shadowColor = "transparent";
    g.fillStyle = color;
    g.beginPath();
    g.arc(64, 60, 39, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fff";
    g.font = "600 32px ui-sans-serif, system-ui, -apple-system, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(initials(name), 64, 62);
  });

interface Flight {
  line: THREE.Line;
  comet: THREE.Sprite;
  heads: THREE.Sprite[];
  rings: THREE.Mesh[];
  path: THREE.Vector3[];
  born: number;
}

const DRAW = 1.4;
const HOLD = 1.8;
const FADE = 0.9;
const LIFE = DRAW + HOLD + FADE;
const SEGMENTS = 80;

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

export const GlobeCard = React.forwardRef<HTMLDivElement, GlobeCardProps>(
  function GlobeCard(
    {
      title = "Global team",
      subtitle = "We are designers, engineers and writers spread across ten countries. Wherever you are, someone on the team is awake and building.",
      cta = "Meet the team",
      href,
      members = DEFAULT_MEMBERS,
      arcs = 6,
      turn = 70,
      onCta,
      className,
    },
    ref,
  ) {
    const still = !!useReducedMotion();
    const card = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => card.current as HTMLDivElement);
    const mount = React.useRef<HTMLDivElement>(null);
    const inView = useInView(card, { once: true, amount: 0.4 });
    const show = still || inView;
    const people = React.useMemo(
      () =>
        members.map((m, i) => ({
          ...m,
          color: m.color ?? PALETTE[i % PALETTE.length]!,
        })),
      [members],
    );
    const settings = React.useRef({ turn, arcs, still, people });
    settings.current = { turn, arcs, still, people };
    const pointer = React.useRef({
      x: 0,
      y: 0,
      inside: false,
      dragging: false,
      lastX: 0,
      lastY: 0,
      lastT: 0,
      vx: 0,
      vy: 0,
    });

    React.useEffect(() => {
      const host = mount.current;
      if (!host) return;
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0, 4.4);

      // The globe rises from the bottom edge, centered; the pivot takes hover tilt and drag, the globe its slow turn.
      const pivot = new THREE.Group();
      pivot.position.set(0, -1.32, 0);
      scene.add(pivot);
      const tilt = new THREE.Group();
      tilt.rotation.x = 0.38;
      pivot.add(tilt);
      const globe = new THREE.Group();
      globe.rotation.y = -0.25;
      tilt.add(globe);

      scene.add(new THREE.AmbientLight(0xffffff, 2.3));
      const sun = new THREE.DirectionalLight(0xffffff, 1.1);
      sun.position.set(-2.5, 3, 4);
      scene.add(sun);

      // A faint atmosphere halo behind the globe.
      const haloTex = glowTexture("rgba(145, 80, 224, 0.16)", 0.62);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: haloTex,
          transparent: true,
          depthWrite: false,
        }),
      );
      halo.scale.set(2.6, 2.6, 1);
      halo.renderOrder = -1;
      pivot.add(halo);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.992, 80, 80),
        new THREE.MeshLambertMaterial({ color: 0xf0f0ef }),
      );
      globe.add(sphere);

      // Land dots: an even spread over the sphere, kept only where there is land.
      const pts: number[] = [];
      const N = 22000;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const rad = Math.sqrt(1 - y * y);
        const th = golden * i;
        const x = Math.cos(th) * rad;
        const z = Math.sin(th) * rad;
        const lat = (Math.asin(y) * 180) / Math.PI;
        const lon = (Math.atan2(x, z) * 180) / Math.PI;
        if (isLand(lat, lon)) pts.push(x * 1.001, y * 1.001, z * 1.001);
      }
      const dotsGeo = new THREE.BufferGeometry();
      dotsGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(pts, 3),
      );
      const dotTex = dotTexture();
      const dots = new THREE.Points(
        dotsGeo,
        new THREE.PointsMaterial({
          color: 0xa9a9a5,
          size: 0.02,
          map: dotTex,
          transparent: true,
          alphaTest: 0.4,
          sizeAttenuation: true,
        }),
      );
      globe.add(dots);

      // Every teammate's city gets a small colored dot that is always there.
      const cityGeo = new THREE.BufferGeometry();
      const cityPos: number[] = [];
      const cityCol: number[] = [];
      for (const m of settings.current.people) {
        const v = toVec(m.lat, m.lon, 1.004);
        cityPos.push(v.x, v.y, v.z);
        const c = new THREE.Color(m.color);
        cityCol.push(c.r, c.g, c.b);
      }
      cityGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(cityPos, 3),
      );
      cityGeo.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(cityCol, 3),
      );
      const cities = new THREE.Points(
        cityGeo,
        new THREE.PointsMaterial({
          size: 0.045,
          map: dotTex,
          vertexColors: true,
          transparent: true,
          alphaTest: 0.4,
          sizeAttenuation: true,
        }),
      );
      globe.add(cities);

      const textures = new Map<string, THREE.Texture>();
      const tex = (key: string, make: () => THREE.Texture) => {
        if (!textures.has(key)) textures.set(key, make());
        return textures.get(key)!;
      };

      // Arcs between random pairs of teammates.
      const flights: Flight[] = [];
      const launch = (now: number, settled = false) => {
        const list = settings.current.people;
        if (list.length < 2) return;
        const a = list[Math.floor(Math.random() * list.length)]!;
        let b = a;
        while (b === a) b = list[Math.floor(Math.random() * list.length)]!;
        const va = toVec(a.lat, a.lon);
        const vb = toVec(b.lat, b.lon);
        const angle = va.angleTo(vb);
        const lift = 0.1 + 0.42 * (angle / Math.PI);
        const s = Math.max(1e-4, Math.sin(angle));
        const path: THREE.Vector3[] = [];
        for (let i = 0; i <= SEGMENTS; i++) {
          const t = i / SEGMENTS;
          // Along the great circle, lifted in the middle.
          const q = va
            .clone()
            .multiplyScalar(Math.sin((1 - t) * angle) / s)
            .add(vb.clone().multiplyScalar(Math.sin(t * angle) / s))
            .normalize()
            .multiplyScalar(1.004 + lift * Math.sin(Math.PI * t));
          path.push(q);
        }
        const geo = new THREE.BufferGeometry().setFromPoints(path);
        geo.setDrawRange(0, settled ? path.length : 0);
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color: b.color,
            transparent: true,
            opacity: 0.85,
          }),
        );
        globe.add(line);
        const comet = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex("glow" + b.color, () => glowTexture(b.color, 0.05)),
            transparent: true,
            depthWrite: false,
          }),
        );
        comet.scale.set(0.16, 0.16, 1);
        comet.visible = false;
        globe.add(comet);
        const heads: THREE.Sprite[] = [];
        const rings: THREE.Mesh[] = [];
        for (const [m, v] of [
          [a, va],
          [b, vb],
        ] as const) {
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: tex("av" + m.name, () => avatarTexture(m.name, m.color)),
              transparent: true,
              depthWrite: false,
            }),
          );
          sprite.center.set(0.5, 0.1);
          sprite.position.copy(v).multiplyScalar(1.006);
          sprite.scale.set(0, 0, 1);
          globe.add(sprite);
          heads.push(sprite);
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.022, 0.03, 40),
            new THREE.MeshBasicMaterial({
              color: m.color,
              transparent: true,
              opacity: 0,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          ring.position.copy(v).multiplyScalar(1.005);
          ring.lookAt(v.clone().multiplyScalar(2));
          globe.add(ring);
          rings.push(ring);
        }
        flights.push({
          line,
          comet,
          heads,
          rings,
          path,
          born: settled ? now - DRAW - 0.4 : now,
        });
      };

      const drop = (f: Flight) => {
        globe.remove(f.line, f.comet, ...f.heads, ...f.rings);
        f.line.geometry.dispose();
        (f.line.material as THREE.Material).dispose();
        f.comet.material.dispose();
        f.heads.forEach((h) => h.material.dispose());
        f.rings.forEach((r) => {
          r.geometry.dispose();
          (r.material as THREE.Material).dispose();
        });
      };

      const size = { w: 0, h: 0 };
      const resize = () => {
        size.w = host.clientWidth;
        size.h = host.clientHeight;
        renderer.setSize(size.w, size.h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = size.w / Math.max(1, size.h);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      let visible = true;
      const io = new IntersectionObserver(
        ([e]) => void (visible = !!e?.isIntersecting),
      );
      io.observe(host);

      if (settings.current.still)
        for (let i = 0; i < settings.current.arcs; i++) launch(0, true);

      let last = performance.now();
      let elapsed = 0;
      let nextLaunch = 0.3;
      let raf = 0;
      const easeOut = (t: number) => 1 - (1 - t) ** 3;

      const frame = () => {
        raf = requestAnimationFrame(frame);
        const t = performance.now();
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (!visible || !size.w) return;
        elapsed += dt;
        const now = elapsed;
        const s = settings.current;
        const p = pointer.current;

        if (!s.still) {
          // Slow turn plus drag momentum, which eases back down.
          const base = s.turn > 0 ? (Math.PI * 2) / s.turn : 0;
          if (!p.dragging) {
            p.vx *= Math.exp(-dt * 2.2);
            p.vy *= Math.exp(-dt * 3);
          }
          globe.rotation.y += (base + p.vx) * dt;
          tilt.rotation.x = Math.max(
            0,
            Math.min(0.9, tilt.rotation.x + p.vy * dt),
          );
          // Lean toward the cursor while it is over the card.
          const lean = p.inside && !p.dragging ? 1 : 0;
          pivot.rotation.y +=
            (p.x * 0.28 * lean - pivot.rotation.y) * Math.min(1, dt * 4);
          pivot.rotation.x +=
            (p.y * 0.14 * lean - pivot.rotation.x) * Math.min(1, dt * 4);

          if (now >= nextLaunch && flights.length < s.arcs) {
            launch(now);
            nextLaunch =
              now + LIFE / Math.max(1, s.arcs) + Math.random() * 0.25;
          }
        }

        for (let i = flights.length - 1; i >= 0; i--) {
          const f = flights[i]!;
          const age = s.still ? DRAW + 0.4 : now - f.born;
          const n = f.path.length;
          const geo = f.line.geometry;
          let head = n - 1;
          if (age < DRAW) {
            head = Math.max(1, Math.floor(easeOut(age / DRAW) * (n - 1)));
            geo.setDrawRange(0, head + 1);
          } else if (age < DRAW + HOLD) geo.setDrawRange(0, n);
          else {
            // The tail draws away toward the destination.
            const k = Math.min(1, (age - DRAW - HOLD) / FADE);
            const start = Math.floor(easeOut(k) * n);
            geo.setDrawRange(start, n - start);
          }
          // A glowing comet rides the head while the arc draws.
          f.comet.visible = !s.still && age < DRAW + 0.15;
          if (f.comet.visible) {
            f.comet.position.copy(f.path[Math.min(head, n - 1)]!);
            (f.comet.material as THREE.SpriteMaterial).opacity =
              age < DRAW ? 1 : 1 - (age - DRAW) / 0.15;
          }
          const fade =
            age > DRAW + HOLD ? 1 - Math.min(1, (age - DRAW - HOLD) / FADE) : 1;
          // Avatars: the start pops at once, the end when the arc lands, each with a little overshoot.
          f.heads.forEach((h, j) => {
            const at = j === 0 ? 0 : DRAW * 0.94;
            const k = Math.max(0, Math.min(1, (age - at) / 0.4));
            const pop = 1 + Math.sin(k * Math.PI) * 0.3 * (1 - k);
            const sc = 0.13 * Math.min(1, k * 1.8) * pop * fade;
            h.scale.set(sc, sc, 1);
            (h.material as THREE.SpriteMaterial).opacity = fade;
          });
          f.rings.forEach((r, j) => {
            const at = j === 0 ? 0 : DRAW * 0.94;
            const k = (age - at) / 1.1;
            const m = r.material as THREE.MeshBasicMaterial;
            if (k < 0 || k > 1 || s.still) return void (m.opacity = 0);
            r.scale.setScalar(1 + k * 3.4);
            m.opacity = (1 - k) * 0.55 * fade;
          });
          if (!s.still && age >= LIFE) {
            drop(f);
            flights.splice(i, 1);
          }
        }
        renderer.render(scene, camera);
      };
      frame();

      // Drag spins the globe (sideways) and tips it (up and down), leaving momentum behind.
      const local = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        return {
          x: ((e.clientX - r.left) / r.width) * 2 - 1,
          y: ((e.clientY - r.top) / r.height) * 2 - 1,
        };
      };
      const onEnter = () => void (pointer.current.inside = true);
      const onLeave = () =>
        Object.assign(pointer.current, { inside: false, x: 0, y: 0 });
      const onDown = (e: PointerEvent) => {
        if (settings.current.still) return;
        Object.assign(pointer.current, {
          dragging: true,
          lastX: e.clientX,
          lastY: e.clientY,
          lastT: performance.now(),
        });
        host.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        const p = pointer.current;
        Object.assign(p, local(e));
        if (!p.dragging) return;
        const now = performance.now();
        const dts = Math.max(1, now - p.lastT) / 1000;
        const dx = (e.clientX - p.lastX) * 0.008;
        const dy = (e.clientY - p.lastY) * 0.006;
        globe.rotation.y += dx;
        tilt.rotation.x = Math.max(0, Math.min(0.9, tilt.rotation.x + dy));
        p.vx = p.vx * 0.5 + (dx / dts) * 0.5;
        p.vy = p.vy * 0.5 + (dy / dts) * 0.5;
        Object.assign(p, { lastX: e.clientX, lastY: e.clientY, lastT: now });
      };
      const onUp = () => {
        const p = pointer.current;
        p.dragging = false;
        p.vx = Math.max(-6, Math.min(6, p.vx));
        p.vy = Math.max(-2, Math.min(2, p.vy));
      };
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerup", onUp);
      host.addEventListener("pointercancel", onUp);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerup", onUp);
        host.removeEventListener("pointercancel", onUp);
        flights.forEach(drop);
        sphere.geometry.dispose();
        (sphere.material as THREE.Material).dispose();
        dotsGeo.dispose();
        (dots.material as THREE.Material).dispose();
        cityGeo.dispose();
        (cities.material as THREE.Material).dispose();
        halo.material.dispose();
        haloTex.dispose();
        dotTex.dispose();
        textures.forEach((x) => x.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    }, []);

    return (
      <div
        ref={card}
        className={cn(
          "relative h-[400px] w-[440px] max-w-full overflow-hidden rounded-3xl bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      >
        {/* A soft colored glow under the globe. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 opacity-[0.09]"
          style={{
            background:
              "radial-gradient(70% 90% at 50% 100%, #9150e0 0%, #3d66d6 45%, transparent 80%)",
          }}
        />
        <div
          ref={mount}
          aria-hidden
          className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        />

        <div className="pointer-events-none relative px-6 pt-6">
          <Reveal
            text={title}
            show={show}
            still={still}
            className="block text-2xl font-semibold tracking-tight"
          />
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