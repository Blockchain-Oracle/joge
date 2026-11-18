import {
  ATTACK_S,
  BUZZ,
  type Cue,
  IOS_CLICKS,
  IOS_GAP_MS,
  LADDER_SEMITONES,
  MASTER_GAIN,
  NOISE_S,
  NOTES,
  type Note,
  SEMITONES_PER_OCTAVE,
  SILENCE,
  SILENT,
} from "../constants/feedback.ts";

export type { Cue } from "../constants/feedback.ts";

export interface FeedbackPrefs {
  sound: boolean;
  haptics: boolean;
}

const PREF_KEY = "joge:feedback";
/** Sound is opt-in (F22); haptics are on. */
const DEFAULTS: FeedbackPrefs = { sound: false, haptics: true };

let prefs: FeedbackPrefs | null = null;
let audio: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let iosSwitch: HTMLInputElement | null = null;

export function feedbackPrefs(): FeedbackPrefs {
  if (prefs) return prefs;
  try {
    prefs = { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}") as Partial<FeedbackPrefs>) };
  } catch {
    prefs = { ...DEFAULTS };
  }
  return prefs;
}

export function setFeedbackPrefs(next: Partial<FeedbackPrefs>) {
  prefs = { ...feedbackPrefs(), ...next };
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    // The choice still holds for this page.
  }
}

const isAppleTouch = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/**
 * Called once from the shell: browsers only start audio after a gesture, so the context resumes on the first tap or
 * key; on iPhone a hidden native switch is installed for haptics.
 */
export function primeFeedback() {
  const resume = () => {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
  };
  window.addEventListener("pointerdown", resume, { once: true, capture: true });
  window.addEventListener("keydown", resume, { once: true, capture: true });
  if (iosSwitch || typeof navigator.vibrate === "function" || !isAppleTouch()) return;
  const holder = document.createElement("label");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText = "position:fixed;left:-9999em;top:0;opacity:0;pointer-events:none";
  iosSwitch = document.createElement("input");
  iosSwitch.type = "checkbox";
  iosSwitch.setAttribute("switch", "");
  iosSwitch.tabIndex = -1;
  holder.appendChild(iosSwitch);
  document.body.appendChild(holder);
}

function play(context: BaseAudioContext, master: GainNode, note: Note, transpose: number, at = context.currentTime) {
  const start = at + note.at;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(note.gain ?? 1, start + ATTACK_S);
  gain.gain.exponentialRampToValueAtTime(SILENCE, start + note.len);
  gain.connect(master);
  if (note.noise !== undefined) {
    if (!noise) {
      noise = context.createBuffer(1, Math.ceil(context.sampleRate * NOISE_S), context.sampleRate);
      const data = noise.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    source.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = note.f;
    filter.Q.value = note.noise;
    source.connect(filter).connect(gain);
    source.start(start);
    source.stop(start + note.len);
    return;
  }
  const oscillator = context.createOscillator();
  oscillator.type = note.type ?? "sine";
  oscillator.frequency.setValueAtTime(note.f * transpose, start);
  if (note.to) oscillator.frequency.exponentialRampToValueAtTime(note.to * transpose, start + note.len);
  oscillator.connect(gain);
  oscillator.start(start);
  oscillator.stop(start + note.len);
}

function haptic(name: Cue) {
  // Browsers refuse vibration before the visitor's first tap (and log it): wait for one.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  try {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(BUZZ[name]);
      return;
    }
    const target = iosSwitch;
    if (!target) return;
    for (let click = 0; click < IOS_CLICKS[name]; click += 1) setTimeout(() => target.click(), click * IOS_GAP_MS);
  } catch {
    // Silent where neither method exists.
  }
}

/**
 * Plays a cue: felt when haptics are on, heard when sound is on (money and time moments only). `step` climbs the profit
 * ladder (each favourable move one note higher).
 */
export function cue(name: Cue, step = 0) {
  if (typeof window === "undefined") return;
  const { sound, haptics } = feedbackPrefs();
  if (haptics) haptic(name);
  if (sound) playCue(name, step);
}

/**
 * A replay's soundtrack (Senryo's films): heard whatever the Sound setting says, because the viewer pressed play, and
 * muted only by the player's own switch. No haptics: a film is watched, not felt.
 */
export function filmCue(name: Cue, step = 0) {
  if (typeof window === "undefined") return;
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
  playCue(name, step);
}

const MS_PER_SECOND = 1_000;
const RENDER_RATE = 44_100;
const RENDER_CHANNELS = 2;

/**
 * A replay's soundtrack rendered offline for a saved video (Senryo's `soundtrack`): every cue through the same voices
 * the app plays, at its film time. Ignores the Sound setting; the person asked for the file.
 */
export async function renderCues(cues: Array<{ at: number; cue: Cue; step: number }>, totalMs: number) {
  const context = new OfflineAudioContext(
    RENDER_CHANNELS,
    Math.ceil((RENDER_RATE * totalMs) / MS_PER_SECOND),
    RENDER_RATE,
  );
  const master = context.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(context.destination);
  for (const { at, cue: name, step } of cues) {
    if (SILENT.has(name)) continue;
    const semitones = LADDER_SEMITONES[Math.min(step, LADDER_SEMITONES.length - 1)] ?? 0;
    const transpose = 2 ** (semitones / SEMITONES_PER_OCTAVE);
    for (const note of NOTES[name]) play(context, master, note, transpose, at / MS_PER_SECOND);
  }
  return context.startRendering();
}

function playCue(name: Cue, step: number) {
  if (SILENT.has(name) || audio?.state !== "running") return;
  const master = audio.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(audio.destination);
  const semitones = LADDER_SEMITONES[Math.min(step, LADDER_SEMITONES.length - 1)] ?? 0;
  const transpose = 2 ** (semitones / SEMITONES_PER_OCTAVE);
  for (const note of NOTES[name]) play(audio, master, note, transpose);
}
