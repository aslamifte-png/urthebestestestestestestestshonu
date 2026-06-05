import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import heroImg from "@/assets/lalaland-hero.jpg";
import pianoImg from "@/assets/lalaland-piano.jpg";
import starsImg from "@/assets/lalaland-stars.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const lyrics = [
  "City of stars,",
  "are you shining just for her?",
  "City of stars,",
  "there's so much that I can't see.",
  "Who knows? I felt it from the first embrace I shared with Fathima,",
  "that now our dreams may finally come true…",
];

type Track = { id: string; title: string; src: string };
const TRACKS: Track[] = [
  { id: "theme",       title: "Mia & Sebastian's Theme", src: "/music/mia-and-sebastian.mp3" },
  { id: "city",        title: "City of Stars",            src: "/music/city-of-stars.mp3" },
  { id: "fools",       title: "Audition (Fools Who Dream)", src: "/music/auditions.mp3" },
  { id: "planetarium", title: "Planetarium",              src: "/music/planetarium.mp3" },
  { id: "epilogue",    title: "Epilogue",                 src: "/music/epilogue.mp3" },
];

// ---------- shared little secret unlocked when all 4 gold hearts are pressed
type SecretCtx = {
  press: (i: number) => void;
  pressed: Set<number>;
};

function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 4,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[var(--gold)]"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 4}px var(--gold)`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  );
}

// ---------- Confetti burst (one-shot on landing)
function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 90 }).map((_, i) => ({
        id: i,
        left: 50 + (Math.random() - 0.5) * 20,
        dx: (Math.random() - 0.5) * 160,
        dy: 60 + Math.random() * 80,
        rot: Math.random() * 720 - 360,
        size: 6 + Math.random() * 8,
        delay: Math.random() * 0.3,
        color: [
          "var(--gold)",
          "oklch(0.72 0.20 150)", // green
          "oklch(0.72 0.20 15)",  // rose
          "oklch(0.95 0.18 85)",  // pale gold
          "oklch(0.82 0.18 140)", // mint
        ][i % 5],
      })),
    [],
  );
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 3200);
    return () => clearTimeout(t);
  }, []);
  if (done) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: `${p.dx}vw`, y: `${p.dy}vh`, opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: 2.6, delay: p.delay, ease: "easeOut" }}
          className="absolute top-[10vh] block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            borderRadius: 2,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Floating green hearts that pop in-place
function FloatingHearts() {
  type H = { id: number; left: number; delay: number; duration: number; size: number };
  type Pop = { id: number; x: number; y: number };
  const make = (i: number): H => ({
    id: Date.now() + i + Math.random(),
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 10,
    size: 20 + Math.random() * 22,
  });
  const [hearts, setHearts] = useState<H[]>(() => Array.from({ length: 14 }).map((_, i) => make(i)));
  const [pops, setPops] = useState<Pop[]>([]);

  const pop = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const popId = Date.now() + Math.random();
    setPops((arr) => [...arr, { id: popId, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
    setHearts((hs) => hs.filter((h) => h.id !== id).concat(make(id)));
    window.setTimeout(() => {
      setPops((arr) => arr.filter((p) => p.id !== popId));
    }, 1400);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
        {hearts.map((h) => (
          <motion.button
            key={h.id}
            onClick={(e) => pop(h.id, e)}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-20vh", opacity: [0, 1, 1, 0] }}
            transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: "linear" }}
            whileHover={{ scale: 1.6 }}
            className="pointer-events-auto absolute select-none"
            style={{
              left: `${h.left}%`,
              fontSize: h.size,
              color: "oklch(0.72 0.20 150)",
              textShadow: "0 0 14px oklch(0.82 0.22 150), 0 0 28px oklch(0.72 0.20 150 / 0.6)",
            }}
            aria-label="tap to pop"
          >
            💚
          </motion.button>
        ))}
      </div>
      <div className="pointer-events-none fixed inset-0 z-[55]">
        <AnimatePresence>
          {pops.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0, scale: 0.4, y: 0 }}
              animate={{ opacity: 1, scale: 1.15, y: -50 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.2 }}
              className="absolute -translate-x-1/2 whitespace-nowrap font-[var(--font-display)] text-lg font-bold uppercase tracking-[0.25em] md:text-2xl"
              style={{
                left: p.x,
                top: p.y,
                color: "oklch(0.82 0.22 150)",
                textShadow:
                  "0 0 18px oklch(0.82 0.22 150), 0 0 40px oklch(0.72 0.20 150 / 0.7), 0 0 90px oklch(0.72 0.20 150 / 0.4)",
              }}
            >
              I LOVE YOU
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

// ---------- Iron Man gauntlet (unchanged behavior)
function IronManHand({ sectionIds }: { sectionIds: string[] }) {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });
  const ringDash = useTransform(smooth, (v) => {
  const progress = Math.min(Math.max(v, 0), 1);
  return `${progress * 264} 264`;
});
  const tilt = useTransform(smooth, [0, 1], [-12, 12]);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [blasts, setBlasts] = useState<number[]>([]);

  const scrubFromPointer = useCallback((clientY: number) => {
    const el = ringRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    const max = Math.max (document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: p * max, behavior: "auto" });
  }, []);
  
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => scrubFromPointer(e.clientY);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, scrubFromPointer]);

  const jumpNext = () => {
    const y = window.scrollY + 10;
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top + window.scrollY > y + 40) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    document.getElementById(sectionIds[0])?.scrollIntoView({ behavior: "smooth" });
  };

  const fireBlast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBlasts((b) => [...b, Date.now()]);
    jumpNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotate: -10 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ delay: 1.2, duration: 1 }}
      className="fixed bottom-6 right-4 z-50 hidden md:block"
    >
      <div
        ref={ringRef}
        className="relative h-40 w-32 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-arc]")) return;
          setDragging(true);
          requestAnimationFrame(() => scrubFromPointer(e.clientY));
        }}
        title="drag the gauntlet to scroll · tap the arc reactor to blast"
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 160">
          <rect x="6" y="6" width="116" height="148" rx="58" fill="none" stroke="oklch(0.85 0.17 80 / 0.15)" strokeWidth="2" />
          <motion.rect
            x="6" y="6" width="116" height="148" rx="58" fill="none"
            stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"
            style={{ strokeDasharray: ringDash, filter: "drop-shadow(0 0 6px var(--gold))" }}
          />
        </svg>
        <motion.svg
          viewBox="0 0 120 160"
          className="absolute inset-0"
          style={{ rotate: tilt, filter: "drop-shadow(0 0 22px oklch(0.85 0.17 80 / 0.55))" }}
        >
          <defs>
            <linearGradient id="gold-plate" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.96 0.16 88)" />
              <stop offset="45%" stopColor="oklch(0.85 0.18 78)" />
              <stop offset="100%" stopColor="oklch(0.55 0.16 55)" />
            </linearGradient>
            <linearGradient id="red-plate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.22 25)" />
              <stop offset="100%" stopColor="oklch(0.40 0.20 22)" />
            </linearGradient>
          </defs>
          <path d="M30 150 L90 150 L96 128 L24 128 Z" fill="url(#red-plate)" stroke="oklch(0.30 0.08 25)" strokeWidth="1" />
          <line x1="30" y1="139" x2="90" y2="139" stroke="oklch(0.95 0.10 85)" strokeWidth="0.8" opacity="0.5" />
          <path
            d="M22 70 Q22 50 40 46 L80 46 Q98 50 98 70 L96 122 Q90 132 76 132 L44 132 Q30 132 24 122 Z"
            fill="url(#gold-plate)" stroke="oklch(0.45 0.14 55)" strokeWidth="1.2"
          />
          <rect x="32" y="22" width="14" height="30" rx="4" fill="url(#gold-plate)" stroke="oklch(0.45 0.14 55)" />
          <rect x="50" y="14" width="14" height="38" rx="4" fill="url(#gold-plate)" stroke="oklch(0.45 0.14 55)" />
          <rect x="68" y="20" width="14" height="32" rx="4" fill="url(#gold-plate)" stroke="oklch(0.45 0.14 55)" />
          <rect x="84" y="32" width="12" height="22" rx="4" fill="url(#gold-plate)" stroke="oklch(0.45 0.14 55)" />
          <path d="M16 88 Q6 82 10 70 Q14 60 24 64 L26 86 Z" fill="url(#gold-plate)" stroke="oklch(0.45 0.14 55)" />
          <path d="M22 92 L98 92" stroke="oklch(0.40 0.12 55)" strokeWidth="0.8" opacity="0.7" />
          <path d="M22 110 L98 110" stroke="oklch(0.40 0.12 55)" strokeWidth="0.8" opacity="0.5" />
          <circle cx="60" cy="92" r="18" fill="oklch(0.25 0.04 60)" stroke="oklch(0.95 0.16 85)" strokeWidth="1.2" />
        </motion.svg>
        <motion.button
          data-arc
          onClick={fireBlast}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 30, height: 30,
            background: "radial-gradient(circle, oklch(1 0 0) 0%, oklch(0.92 0.18 220) 45%, oklch(0.45 0.22 245) 100%)",
            boxShadow: "0 0 18px oklch(0.92 0.18 220), 0 0 40px oklch(0.55 0.22 240 / 0.7)",
          }}
          aria-label="fire repulsor blast"
        >
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inset-1 rounded-full"
            style={{ background: "radial-gradient(circle, oklch(1 0 0), transparent 70%)" }}
          />
        </motion.button>
        <AnimatePresence>
          {blasts.map((b) => (
            <motion.span
              key={b}
              initial={{ opacity: 0.9, scale: 0.2 }}
              animate={{ opacity: 0, scale: 6 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              onAnimationComplete={() =>
                setBlasts((arr) => arr.filter((x) => x !== b))
              }
              className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 30, height: 30,
                border: "2px solid oklch(0.92 0.18 220)",
                boxShadow: "0 0 30px oklch(0.92 0.18 220), inset 0 0 20px oklch(1 0 0)",
              }}
            />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {blasts.length > 0 && (
            <motion.div
              key={blasts[blasts.length - 1] + "-flash"}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none fixed inset-0 z-40"
              style={{ background: "radial-gradient(circle at 90% 80%, oklch(0.95 0.18 220 / 0.4), transparent 60%)" }}
            />
          )}
        </AnimatePresence>
        <span className="pointer-events-none absolute -bottom-5 left-0 right-0 text-center text-[8px] tracking-[0.3em] uppercase text-[var(--gold)]/80 font-[var(--font-code)]">
          {dragging ? "scrubbing" : "drag · blast"}
        </span>
      </div>
    </motion.div>
  );
}

function MusicPlayer({
  audioRef, playing, setPlaying, current,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  current: Track;
}) {
  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else {
      try { await a.play(); setPlaying(true); } catch { setPlaying(false); }
    }
  };
  return (
    <motion.button
      onClick={toggle}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="fixed left-6 top-6 z-50 flex items-center gap-3 rounded-full border border-[var(--gold)]/40 bg-background/40 px-4 py-2 backdrop-blur-md transition hover:border-[var(--gold)] hover:bg-background/60"
      aria-label={playing ? "Pause music" : "Play"}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] ${playing ? "animate-ping opacity-75" : "opacity-40"}`} />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--gold)]" />
      </span>
      <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--gold)] font-[var(--font-code)]">
        {playing ? `♪ ${current.title}` : `play · ${current.title}`}
      </span>
    </motion.button>
  );
}

// ---------- Gold heart with steady popup (no glitch) + secret unlock
function GoldHeart({ note, index, secret }: { note: string; index: number; secret: SecretCtx }) {
  const [open, setOpen] = useState(false);
  const gradId = `g-${index}`;
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => {
          setOpen((v) => !v);
          secret.press(index);
        }}
        className="relative inline-flex h-16 w-16 items-center justify-center"
        aria-label={note}
      >
        <motion.span
          aria-hidden
          animate={{ scale: open ? [1, 1.4, 1.2] : [1, 1.15, 1], opacity: open ? 0.9 : 0.55 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-14 w-14 rounded-full blur-xl"
          style={{ background: "var(--gold)" }}
        />
        <motion.svg
          viewBox="0 0 32 29"
          width="56"
          height="52"
          animate={{ scale: open ? 1.15 : 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
          style={{ filter: "drop-shadow(0 0 18px var(--gold)) drop-shadow(0 0 6px oklch(0.95 0.18 85))" }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.95 0.18 85)" />
              <stop offset="50%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="oklch(0.65 0.18 55)" />
            </linearGradient>
          </defs>
          <path
            d="M16 28s-13-7.3-13-17a7 7 0 0 1 13-3.7A7 7 0 0 1 29 11c0 9.7-13 17-13 17z"
            fill={`url(#${gradId})`}
            stroke="oklch(0.98 0.10 90)"
            strokeWidth="0.8"
          />
          <ellipse cx="11" cy="9" rx="2.5" ry="1.6" fill="oklch(1 0 0 / 0.55)" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute left-1/2 top-[calc(100%+1rem)] z-40 w-72 -translate-x-1/2 rounded-xl border-2 border-[var(--gold)] bg-background/90 px-5 py-4 text-center font-[var(--font-code)] text-[11px] font-bold uppercase tracking-[0.18em] leading-relaxed text-[var(--gold)] backdrop-blur-md md:w-80 md:text-sm"
            style={{
              boxShadow:
                "0 0 0 1px oklch(0.95 0.18 85 / 0.45), 0 0 26px oklch(0.85 0.17 80 / 0.75), 0 0 70px oklch(0.85 0.17 80 / 0.55), 0 0 140px oklch(0.85 0.17 80 / 0.35)",
            }}
          >
            {note}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const GOLD_NOTES = [
  "I LOVE SACRIFICING MY SLEEP TO BE ON CALL WITH YOU 💛",
  "YOU MAKE ME THE HAPPIEST MAN ON EARTH 💛",
  "YOU ARE THE COOLEST AND MOST LOVING PERSON EVER 💛",
  "IF I HAD A MILLION LIVES I'D CHOOSE YOU, OVER AND OVER, WITHOUT A DOUBT 💛",
];

// ---------- Secret modal that unlocks after all 4 gold hearts pressed
function SecretReveal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/85 px-6 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -4, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 14 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--gold)]/40 rounded-2xl border-2 border-[var(--gold)] bg-card/90 px-8 py-10 text-center"
            style={{
              boxShadow:
                "0 0 0 1px oklch(0.95 0.18 85 / 0.4), 0 0 40px oklch(0.85 0.17 80 / 0.8), 0 0 120px oklch(0.85 0.17 80 / 0.5)",
            }}
          >
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--gold)]">
              ✦ secret unlocked ✦
            </p>
            <h3
              className="mt-6 font-[var(--font-script)] text-5xl text-[var(--gold)] md:text-6xl"
              style={{
                textShadow:
                  "0 0 30px oklch(0.85 0.17 80 / 0.9), 0 0 60px oklch(0.85 0.17 80 / 0.5)",
              }}
            >
              you found them all, fifi
            </h3>
            <p className="mt-6 font-[var(--font-display)] text-xl italic leading-relaxed text-foreground/90 md:text-2xl">
              every heart on this page is a tiny version of mine.
              <br />
              you collected all four, muthe, jaani —
              <br />
              now you're holding the whole thing. 💛
              <br />
              I hope it makes you smile as much as you make me smile every day.
              <br />
              I love you so much, Fathima.
              <br />
              I hope I can keep giving you reasons to smile forever.
              <br />
              Here's to many more late-night calls, inside jokes, movie nights, and all the stupidly sweet things we do and will do together.
              <br />
              Come with me for Spider-Man Brand New Day and let's keep making memories together.
              <br />
              Here is to us
              <br /> 
              Two fools that dream of being happy together against all odds.
            </p>
            <p className="mt-6 font-[var(--font-code)] text-[10px] uppercase tracking-[0.4em] text-foreground/60">
              happy birthday, shonu
            </p>
            <button
              onClick={onClose}
              className="mt-8 rounded-full border border-[var(--gold)] px-6 py-2 font-[var(--font-code)] text-xs uppercase tracking-[0.3em] text-[var(--gold)] transition hover:bg-[var(--gold)]/10"
            >
              close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Index() {
  const [revealedLyrics, setRevealedLyrics] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Secret tracker
  const [pressed, setPressed] = useState<Set<number>>(new Set());
  const [secretOpen, setSecretOpen] = useState(false);
  const secret: SecretCtx = {
    pressed,
    press: (i: number) => {
      setPressed((prev) => {
        if (prev.has(i)) return prev;
        const next = new Set(prev);
        next.add(i);
        if (next.size === GOLD_NOTES.length) {
          window.setTimeout(() => setSecretOpen(true), 600);
        }
        return next;
      });
    },
  };

  const sectionIds = ["hero", "lyrics", "piano", "planetarium", "finale"];
  const sectionToTrack: Record<string, number> = {
    hero: 0, lyrics: 1, piano: 2, planetarium: 3, finale: 4,
  };

  useEffect(() => {
    if (revealedLyrics >= lyrics.length) return;
    const t = setTimeout(() => setRevealedLyrics((n) => n + 1), 1400);
    return () => clearTimeout(t);
  }, [revealedLyrics]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = sectionToTrack[visible.target.id];
          if (typeof idx === "number") setTrackIdx(idx);
        }
      },
      { threshold: [0.35, 0.6] },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const wasPlaying = !a.paused;
    a.src = TRACKS[trackIdx].src;
    a.load();
    if (wasPlaying || playing) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx]);

  const current = TRACKS[trackIdx];

  // Heading glow used by big titles
  const headingGlow =
    "0 0 18px oklch(0.85 0.17 80 / 0.55), 0 0 40px oklch(0.85 0.17 80 / 0.4), 0 0 90px oklch(0.85 0.17 80 / 0.25)";

  return (
    <main className="relative min-h-screen overflow-x-hidden font-[var(--font-body)] text-foreground">
      <audio ref={audioRef} src={TRACKS[0].src} loop preload="auto" />
      <ConfettiBurst />
      <MusicPlayer audioRef={audioRef} playing={playing} setPlaying={setPlaying} current={current} />
      <IronManHand sectionIds={sectionIds} />
      <FloatingHearts />
      <SecretReveal open={secretOpen} onClose={() => setSecretOpen(false)} />

      {/* hint of progress on the secret */}
      <div className="fixed bottom-4 left-4 z-40 hidden gap-1 md:flex" aria-hidden>
        {GOLD_NOTES.map((_, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full transition"
            style={{
              background: pressed.has(i) ? "var(--gold)" : "oklch(0.85 0.17 80 / 0.2)",
              boxShadow: pressed.has(i) ? "0 0 10px var(--gold)" : "none",
            }}
          />
        ))}
      </div>

      {/* HERO */}
      <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-sky)" }} />
        <div
          className="absolute inset-0 opacity-60 mix-blend-screen"
          style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        <Starfield />

        <div className="relative z-10 px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
            className="text-sm tracking-[0.5em] uppercase text-[var(--gold)]/80 font-[var(--font-mono)]"
          >
            for my shonu 💛
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, delay: 0.4 }}
            className="mt-6 font-[var(--font-script)] text-7xl leading-none text-[var(--gold)] md:text-9xl"
            style={{ textShadow: headingGlow }}
          >
            Happy Birthday,
            <br />
            Fathima
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1.6 }}
            className="mt-4 font-[var(--font-display)] text-2xl italic text-foreground/90 md:text-4xl"
          >
            my muthe, my jaani, my fifi — my dearest dreamer
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 2.4 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <span className="text-xs tracking-[0.4em] uppercase text-foreground/60 font-[var(--font-code)]">
              tap the floating hearts · drag the gauntlet · find all 4 gold hearts
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-12 w-px bg-gradient-to-b from-[var(--gold)] to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* CITY OF STARS — LYRICS */}
      <section id="lyrics" className="relative px-6 py-32 md:py-48">
        <Starfield />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-[var(--font-mono)] text-sm tracking-[0.4em] uppercase text-[var(--gold)]">
            Act I — City of Stars · for Fifi
          </p>
          <div className="mt-12 space-y-6">
            {lyrics.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={i < revealedLyrics ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ duration: 1.6, ease: "easeOut" }}
                whileHover={{ scale: 1.03, color: "var(--gold)" }}
                className="cursor-pointer font-[var(--font-display)] text-2xl italic text-foreground/90 md:text-4xl"
              >
                {line}
              </motion.p>
            ))}
          </div>
          <div className="mt-16 flex justify-center"><GoldHeart note={GOLD_NOTES[0]} index={0} secret={secret} /></div>
        </div>
      </section>

      {/* PIANO INTERLUDE */}
      <section id="piano" className="relative">
        <div className="relative min-h-[80vh] bg-cover bg-center" style={{ backgroundImage: `url(${pianoImg})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="relative z-10 flex min-h-[80vh] items-center px-6 py-24 md:px-24">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.4 }}
              className="max-w-xl"
            >
              <p className="font-[var(--font-mono)] text-sm tracking-[0.4em] uppercase text-[var(--gold)]">
                Act II — Audition · for muthe
              </p>
              <h2
                className="mt-6 font-[var(--font-script)] text-5xl text-foreground md:text-7xl"
                style={{ textShadow: headingGlow }}
              >
                Here's to the ones who dream
              </h2>
              <p className="mt-8 font-[var(--font-display)] text-xl italic leading-relaxed text-foreground/80 md:text-2xl">
                Foolish as they may seem. Here's to the hearts that ache —
                and here's to you, muthe, the softest part of mine.
              </p>
              <div className="mt-10 flex items-end gap-6">
                <GoldHeart note={GOLD_NOTES[1]} index={1} secret={secret} />
                <span className="text-xs uppercase tracking-[0.3em] font-[var(--font-code)] text-foreground/50">tap me</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PLANETARIUM DANCE */}
      <section id="planetarium" className="relative px-6 py-32 md:py-48">
        <Starfield />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.6 }}
            whileHover={{ scale: 1.02, rotate: -0.5 }}
            className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-sm"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <img src={starsImg} alt="A couple dancing among the stars" loading="lazy" width={1280} height={896} className="h-full w-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, delay: 0.2 }}
          >
            <p className="font-[var(--font-mono)] text-sm tracking-[0.4em] uppercase text-[var(--gold)]">
              Act III — Planetarium · for jaani
            </p>
            <h2
              className="mt-6 font-[var(--font-script)] text-6xl text-foreground md:text-8xl"
              style={{ textShadow: headingGlow }}
            >
              For you, Fifi
            </h2>
            <div className="mt-8 space-y-4 font-[var(--font-display)] text-xl leading-relaxed text-foreground/85 md:text-2xl">
              <p>If I had a stage, I'd build it just to watch you walk onto it.</p>
              <p>If I had a song, I'd write it in the key of the way you laugh, jaani.</p>
              <p className="italic text-[var(--gold)]">
                And if I had a wish on every one of these stars —
                they would all be the same: you, Fathima, always. 💛
              </p>
            </div>
            <div className="mt-10 flex justify-start"><GoldHeart note={GOLD_NOTES[2]} index={2} secret={secret} /></div>
          </motion.div>
        </div>
      </section>

      {/* FINALE */}
      <section id="finale" className="relative px-6 py-32 text-center md:py-48">
        <Starfield />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="relative mx-auto max-w-2xl"
        >
          <p className="font-[var(--font-mono)] text-sm tracking-[0.4em] uppercase text-[var(--gold)]">
            Finale — Epilogue
          </p>
          <h2
            className="mt-8 font-[var(--font-script)] text-7xl text-foreground md:text-9xl"
            style={{ textShadow: headingGlow }}
          >
            I love you, shonu 💛
          </h2>
          <p className="mt-8 font-[var(--font-display)] text-2xl italic text-foreground/80">
            — to the moon, the city, and every star above it.
            <br />
            yours always, fifi.
          </p>
          <div className="mt-12 flex justify-center">
            <GoldHeart note={GOLD_NOTES[3]} index={3} secret={secret} />
          </div>
          <p className="mt-16 text-xs tracking-[0.4em] uppercase text-foreground/40 font-[var(--font-code)]">
            fin.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
