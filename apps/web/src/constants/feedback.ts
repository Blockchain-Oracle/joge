/**
 * Every cue's sound (synthesised notes, no files) and feel (vibration pattern; switch clicks on iPhone). Money events
 * are heard when sound is on; taps and sheets are only felt.
 */
export type Cue =
  | "tap"
  | "open"
  | "close"
  | "send"
  | "arrive"
  | "fill"
  | "win"
  | "loss"
  | "error"
  | "tick"
  | "go"
  | "profit"
  | "adverse"
  | "stamp";

export interface Note {
  /** Hz; for noise, the band-pass centre. */
  f: number;
  /** Start, seconds after the cue. */
  at: number;
  /** Length, seconds. */
  len: number;
  type?: OscillatorType;
  gain?: number;
  /** Glide to this frequency over the note. */
  to?: number;
  /** A filtered noise tick instead of a tone (the value is the filter's Q). */
  noise?: number;
}

export const NOTES: Record<Cue, Note[]> = {
  tap: [
    { f: 3200, at: 0, len: 0.012, noise: 1.2, gain: 0.9 },
    { f: 190, to: 120, at: 0, len: 0.018, gain: 0.35 },
  ],
  open: [
    { f: 660, at: 0, len: 0.06, type: "triangle" },
    { f: 990, at: 0.05, len: 0.07, type: "triangle" },
  ],
  close: [
    { f: 990, at: 0, len: 0.06, type: "triangle", gain: 0.7 },
    { f: 660, at: 0.05, len: 0.07, type: "triangle", gain: 0.7 },
  ],
  /** Money leaves for a ticket: C–E–G chord. */
  send: [
    { f: 523.25, at: 0, len: 0.42, type: "triangle", gain: 0.5 },
    { f: 659.25, at: 0.07, len: 0.4, type: "triangle", gain: 0.45 },
    { f: 783.99, at: 0.14, len: 0.52, type: "triangle", gain: 0.45 },
  ],
  arrive: [
    { f: 1318.5, at: 0, len: 0.45, type: "sine" },
    { f: 1975.5, at: 0.08, len: 0.3, type: "sine", gain: 0.35 },
  ],
  fill: [
    { f: 784, at: 0, len: 0.08, type: "triangle" },
    { f: 1175, at: 0.07, len: 0.12, type: "triangle" },
  ],
  win: [
    { f: 1046.5, at: 0, len: 0.14, type: "triangle" },
    { f: 1318.5, at: 0.09, len: 0.14, type: "triangle" },
    { f: 1568, at: 0.18, len: 0.3, type: "triangle" },
  ],
  loss: [
    { f: 784, at: 0, len: 0.16, type: "sine" },
    { f: 659.3, at: 0.12, len: 0.16, type: "sine" },
    { f: 523.3, at: 0.24, len: 0.3, type: "sine" },
  ],
  error: [
    { f: 220, at: 0, len: 0.09, type: "square", gain: 0.25 },
    { f: 196, at: 0.1, len: 0.14, type: "square", gain: 0.25 },
  ],
  /** One click a second over the last five. */
  tick: [
    { f: 880, at: 0, len: 0.06, type: "sine", gain: 0.7 },
    { f: 4200, at: 0, len: 0.01, noise: 1.4, gain: 0.5 },
  ],
  /** The round turns over: the GO of 3-2-1-GO. */
  go: [
    { f: 1760, at: 0, len: 0.16, type: "sine", gain: 0.6 },
    { f: 880, at: 0, len: 0.12, type: "triangle", gain: 0.3 },
  ],
  /** One step your way; played up a pentatonic ladder (`cue("profit", step)`). */
  profit: [
    { f: 523.25, at: 0, len: 0.16, type: "sine", gain: 0.55 },
    { f: 1046.5, at: 0, len: 0.09, type: "triangle", gain: 0.15 },
  ],
  /** One step against you (262 → 196 Hz, quiet). */
  adverse: [{ f: 261.63, to: 196, at: 0, len: 0.11, type: "sine", gain: 0.35 }],
  /** A verdict stamp pressing in (receipt thud). */
  stamp: [
    { f: 90, to: 48, at: 0, len: 0.18, type: "sine", gain: 1 },
    { f: 1800, at: 0, len: 0.02, noise: 0.8, gain: 0.5 },
  ],
};

/** The profit ladder: major pentatonic over two octaves. */
export const LADDER_SEMITONES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
export const SEMITONES_PER_OCTAVE = 12;

/** Felt, never heard. */
export const SILENT: ReadonlySet<Cue> = new Set(["tap", "open", "close"]);

/** navigator.vibrate patterns (ms). */
export const BUZZ: Record<Cue, number | number[]> = {
  tap: 8,
  open: 10,
  close: 6,
  send: [12, 40, 12],
  arrive: [20, 60, 30],
  fill: [15, 30, 15],
  win: [15, 40, 15, 40, 25],
  loss: 45,
  error: [40, 50, 40],
  tick: 6,
  go: [10, 30, 20],
  profit: 5,
  adverse: 5,
  stamp: 30,
};

/** iPhone has no vibrate API: each click of a hidden native switch plays the system tick (iOS 18+). */
export const IOS_CLICKS: Record<Cue, number> = {
  tap: 1,
  open: 1,
  close: 1,
  send: 1,
  arrive: 3,
  fill: 1,
  win: 5,
  loss: 1,
  error: 2,
  tick: 1,
  go: 2,
  profit: 1,
  adverse: 1,
  stamp: 1,
};
export const IOS_GAP_MS = 70;

export const MASTER_GAIN = 0.06;
export const ATTACK_S = 0.006;
export const SILENCE = 0.0001;
export const NOISE_S = 0.05;
