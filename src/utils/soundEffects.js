// Sound Effects — Web Audio API chiptune synthesis. No files required.

let _ctx = null;

function ac() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// Plays a single oscillator note with exponential gain decay.
// type: OscillatorType, freq/freqEnd: Hz, t: start time (ac.currentTime),
// dur: seconds, gain: peak volume (0–1)
function tone(type, freq, t, dur, gain = 0.25, freqEnd = null) {
  const c = ac();
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(c.destination);

  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (freqEnd != null) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
  o.connect(g);
  o.start(t);
  o.stop(t + dur + 0.01);
}

// Plays a short burst of band-filtered noise (percussion / impact).
function noise(t, dur, gain = 0.3, filterFreq = 1200) {
  const c = ac();
  const bufSize = c.sampleRate * dur;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;

  const flt = c.createBiquadFilter();
  flt.type = 'bandpass';
  flt.frequency.value = filterFreq;
  flt.Q.value = 1.5;

  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(flt);
  flt.connect(g);
  g.connect(c.destination);
  src.start(t);
  src.stop(t + dur + 0.01);
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Tile move left / right — crisp blip. */
export function playMove() {
  const t = ac().currentTime;
  tone('square', 330, t, 0.03, 0.18);
}

/** Hard drop — downward sweep + noise thud. */
export function playHardDrop() {
  const t = ac().currentTime;
  tone('square', 520, t, 0.12, 0.35, 60);
  noise(t, 0.07, 0.25, 800);
}

/** Merge — short two-note chime on every merge. */
export function playMerge() {
  const t = ac().currentTime;
  tone('sine', 440, t,        0.09, 0.22);
  tone('sine', 659, t + 0.06, 0.09, 0.18);
}

/**
 * Combo arpeggio — number of notes and speed scale with the streak.
 * mergeStreak < 2: silent (no combo display).
 * mergeStreak 2: 2 notes  (C5 G5)
 * mergeStreak 3: 3 notes  (C5 E5 G5)
 * mergeStreak 4: 4 notes  (C5 E5 G5 C6)
 * mergeStreak 5+: 5 notes fast (C5 E5 G5 C6 E6)
 */
export function playCombo(mergeStreak) {
  if (mergeStreak < 2) return;
  const t = ac().currentTime;
  const allNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6
  const count = Math.min(mergeStreak, 5);
  const step  = mergeStreak >= 5 ? 0.045 : 0.065;
  const dur   = mergeStreak >= 5 ? 0.10  : 0.13;
  const gain  = 0.20 + (count - 2) * 0.04; // slightly louder for bigger combos
  const notes = allNotes.slice(0, count);
  notes.forEach((freq, i) => tone('square', freq, t + i * step, dur, gain));
}

/** Level-up fanfare — four-note ascending square-wave arpeggio. */
export function playLevelUp() {
  const t = ac().currentTime;
  const seq = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  seq.forEach((freq, i) => {
    const isLast = i === seq.length - 1;
    tone('square', freq, t + i * 0.09, isLast ? 0.28 : 0.10, isLast ? 0.32 : 0.22);
  });
}

/** Game over — descending sad melody. */
export function playGameOver() {
  const t = ac().currentTime;
  // G4 E4 C4 … each note hangs longer
  const seq = [392, 329.63, 261.63, 196];
  seq.forEach((freq, i) => {
    tone('square', freq, t + i * 0.18, 0.22, 0.28);
  });
  // Low thud at the end
  tone('sine', 80, t + seq.length * 0.18, 0.35, 0.35, 40);
}

/** Garbage sent — sharp aggressive attack burst. */
export function playGarbageSend() {
  const t = ac().currentTime;
  tone('sawtooth', 880, t,        0.04, 0.30, 200);
  tone('sawtooth', 440, t + 0.04, 0.06, 0.20, 100);
  noise(t, 0.06, 0.20, 600);
}

/** Garbage received — warning alarm pulse (two short buzzes). */
export function playGarbageReceive() {
  const t = ac().currentTime;
  tone('square', 220, t,        0.06, 0.30, 180);
  tone('square', 220, t + 0.10, 0.06, 0.25, 180);
}

/** Button click sound. */
export function playClick() {
  const t = ac().currentTime;
  tone('square', 440, t, 0.04, 0.18, 380);
}

/** Button hover sound. */
export function playHover() {
  const t = ac().currentTime;
  tone('sine', 660, t, 0.03, 0.08);
}
