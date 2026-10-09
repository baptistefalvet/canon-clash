// Light looping chiptune (bass + arpeggio + hats), scheduled ahead on the WebAudio clock.

import { audio as cfg } from '../../config/audio';
import { audioCtx, buses, noise, onAudioReady } from './context';

// Chord roots (semitones from A2) and qualities for an 8-bar loop
const PROGRESSION: [number, number[]][] = [
  [3, [0, 4, 7, 12]], // C
  [10, [0, 4, 7, 12]], // G
  [0, [0, 3, 7, 12]], // Am
  [8, [0, 4, 7, 12]], // F
  [3, [0, 4, 7, 12]],
  [10, [0, 4, 7, 12]],
  [8, [0, 4, 7, 12]],
  [10, [0, 4, 7, 14]],
];
const A2 = 110;
const STEPS_PER_BAR = 16;

let timer: number | null = null;
let step = 0;
let nextTime = 0;

const freq = (semi: number) => A2 * Math.pow(2, semi / 12);

function note(f: number, t: number, dur: number, type: OscillatorType, vol: number, cutoff?: number) {
  const ctx = audioCtx()!;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = f;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = osc;
  if (cutoff) {
    const f2 = ctx.createBiquadFilter();
    f2.type = 'lowpass';
    f2.frequency.value = cutoff;
    node.connect(f2);
    node = f2;
  }
  node.connect(g).connect(buses().musicBus);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function hat(t: number, vol: number) {
  const ctx = audioCtx()!;
  const src = ctx.createBufferSource();
  src.buffer = noise();
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  src.connect(f).connect(g).connect(buses().musicBus);
  src.start(t, Math.random() * 0.5);
  src.stop(t + 0.06);
}

function schedule() {
  const ctx = audioCtx();
  if (!ctx) return;
  const stepDur = 60 / cfg.musicBpm / 4;
  while (nextTime < ctx.currentTime + 0.15) {
    const bar = Math.floor(step / STEPS_PER_BAR) % PROGRESSION.length;
    const s = step % STEPS_PER_BAR;
    const [root, chord] = PROGRESSION[bar];
    if (s % 4 === 0) note(freq(root - 12), nextTime, stepDur * 3, 'triangle', 0.9);
    if (s % 4 === 2) note(freq(root), nextTime, stepDur * 1.2, 'triangle', 0.5);
    const arp = chord[(s * 3) % chord.length];
    note(freq(root + 12 + arp), nextTime, stepDur * 0.9, 'square', 0.18, 2400);
    if (s % 2 === 0) hat(nextTime, s % 4 === 2 ? 0.25 : 0.12);
    nextTime += stepDur;
    step++;
  }
}

export function startMusic() {
  onAudioReady(() => {
    if (timer !== null) return;
    const ctx = audioCtx();
    if (!ctx) return;
    nextTime = ctx.currentTime + 0.05;
    timer = window.setInterval(schedule, 40);
  });
}

export function stopMusic() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
}
