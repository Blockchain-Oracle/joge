"use client";

/**
 * Kakure's win confetti: two emitters near the bottom corners (18 % and 82 % of the width), 34 pieces each, gravity
 * 0.14 px/frame², gone in 1.1 s, fading over the second half of their life. Colours are the plates and the brand.
 */
const LEFT_EMITTER = 0.18;
const RIGHT_EMITTER = 0.82;
const SHARES = [LEFT_EMITTER, RIGHT_EMITTER];
const PIECES = 34;
const LIFE_MS = 1_100;
const GRAVITY = 0.14;
const SPEED_MIN = 9;
const SPEED_SPREAD = 7;
/** The fan each emitter throws into, around straight up (radians either side). */
const FAN = 0.55;
/** Each emitter leans inward by this much. */
const LEAN = 0.35;
const SIZE_MIN = 5;
const SIZE_SPREAD = 5;
const SPIN = 0.3;
const FADE_FROM = 0.5;
const TONES = ["--up", "--vermilion", "--down", "--gold"];
const HALF = 0.5;

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  color: string;
}

export function confetti() {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  const ratio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none" });
  canvas.style.zIndex = "var(--z-toast)";
  document.body.append(canvas);
  const context = canvas.getContext("2d");
  if (!context) {
    canvas.remove();
    return;
  }
  context.scale(ratio, ratio);
  const styles = getComputedStyle(document.documentElement);
  const colors = TONES.map((tone) => styles.getPropertyValue(tone).trim() || "#fff");
  const pieces: Piece[] = SHARES.flatMap((share, emitter) =>
    Array.from({ length: PIECES }, () => {
      const lean = emitter === 0 ? LEAN : -LEAN;
      const angle = -Math.PI / 2 + lean + (Math.random() - HALF) * 2 * FAN;
      const speed = SPEED_MIN + Math.random() * SPEED_SPREAD;
      return {
        x: width * share,
        y: height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: SIZE_MIN + Math.random() * SIZE_SPREAD,
        angle: Math.random() * Math.PI,
        spin: (Math.random() - HALF) * SPIN,
        color: colors[Math.floor(Math.random() * colors.length)] ?? "#fff",
      };
    }),
  );
  const started = performance.now();
  const frame = (now: number) => {
    const age = (now - started) / LIFE_MS;
    if (age >= 1) {
      canvas.remove();
      return;
    }
    context.clearRect(0, 0, width, height);
    context.globalAlpha = age < FADE_FROM ? 1 : (1 - age) / (1 - FADE_FROM);
    for (const piece of pieces) {
      piece.vy += GRAVITY;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.angle += piece.spin;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size * HALF * HALF, piece.size, piece.size * HALF);
      context.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
