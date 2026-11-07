/**
 * Chat sounds, synthesized so the app ships no audio assets and works offline.
 *
 * Browsers block audio until the user interacts with the page, so the context is
 * created lazily and unlocked by the first pointer/key event. Until then every
 * play is a silent no-op — never an error.
 */

type Tone = {
  frequency: number;
  /** Seconds from now. */
  start: number;
  duration: number;
};

const STORAGE_KEY = "bankybondy:chat-sound";

let audio: AudioContext | null = null;
let enabledCache: boolean | null = null;
const listeners = new Set<() => void>();

function readEnabled(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "1";
  } catch {
    // Storage can be blocked (private mode); default to sound on.
    return true;
  }
}

export function isChatSoundEnabled(): boolean {
  if (enabledCache === null) enabledCache = readEnabled();
  return enabledCache;
}

export function setChatSoundEnabled(value: boolean): void {
  enabledCache = value;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // Preference simply does not persist; the toggle still works this session.
    }
  }

  listeners.forEach((listener) => listener());
}

export function subscribeChatSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audio) {
    try {
      audio = new window.AudioContext();
    } catch {
      return null;
    }
  }

  if (audio.state === "suspended") void audio.resume();

  return audio;
}

function play(tones: Tone[]): void {
  if (!isChatSoundEnabled()) return;

  const context = audioContext();
  if (!context) return;

  const now = context.currentTime + 0.01;

  for (const tone of tones) {
    const start = now + tone.start;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(tone.frequency, start);

    // Tiny attack, exponential decay: a soft "pop", not a notification beep.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.05, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + tone.duration + 0.02);
  }
}

/** Short outgoing tick: the message left this device. */
export function playSendSound(): void {
  play([{ frequency: 880, start: 0, duration: 0.07 }]);
}

/** Two rising notes for a message from someone else. */
export function playReceiveSound(): void {
  play([
    { frequency: 659.25, start: 0, duration: 0.1 },
    { frequency: 880, start: 0.09, duration: 0.12 },
  ]);
}

if (typeof window !== "undefined") {
  const unlock = () => {
    const context = audioContext();
    if (context?.state === "suspended") void context.resume();

    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
}
