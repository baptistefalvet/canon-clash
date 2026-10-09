// Synthesized sound effects. All functions are safe to call before audio is unlocked (they no-op).

import { audio as cfg } from '../../config/audio';
import { audioCtx, buses, noise } from './context';

type Wave = OscillatorType;

function tone(freq: number, dur: number, opts: { type?: Wave; vol?: number; slideTo?: number; delay?: number; attack?: number } = {}) {
  const ctx = audioCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = opts.type ?? 'square';
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
  const vol = opts.vol ?? 0.3;
  const attack = opts.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(buses().sfxBus);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function burst(dur: number, opts: { vol?: number; freq?: number; q?: number; type?: BiquadFilterType; slideTo?: number; delay?: number } = {}) {
  const ctx = audioCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const src = ctx.createBufferSource();
  src.buffer = noise();
  const f = ctx.createBiquadFilter();
  f.type = opts.type ?? 'bandpass';
  f.frequency.setValueAtTime(opts.freq ?? 1800, t0);
  if (opts.slideTo) f.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
  f.Q.value = opts.q ?? 1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(opts.vol ?? 0.4, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(buses().sfxBus);
  src.start(t0, Math.random() * 0.5);
  src.stop(t0 + dur + 0.02);
}

let lastCapture = 0;

export const sfx = {
  click() {
    tone(880, 0.07, { type: 'triangle', vol: 0.35, slideTo: 1320 });
  },
  shoot() {
    burst(0.05, { freq: 2600, q: 2, vol: 0.12 });
  },
  capture() {
    const now = performance.now();
    if (now - lastCapture < cfg.captureSfxMinIntervalMs) return;
    lastCapture = now;
    tone(1200 + Math.random() * 500, 0.05, { type: 'sine', vol: 0.12 });
  },
  deal() {
    burst(0.12, { freq: 3200, q: 0.8, vol: 0.25, slideTo: 1200 });
  },
  flip() {
    burst(0.06, { freq: 4500, q: 1.5, vol: 0.2 });
  },
  hit() {
    tone(520, 0.08, { type: 'triangle', vol: 0.3, slideTo: 700 });
  },
  stand() {
    tone(660, 0.1, { type: 'triangle', vol: 0.3 });
    tone(520, 0.12, { type: 'triangle', vol: 0.25, delay: 0.08 });
  },
  bust() {
    tone(320, 0.35, { type: 'sawtooth', vol: 0.2, slideTo: 90 });
  },
  good(total: number) {
    const base = 523.25 * Math.pow(2, (total - 18) / 12 * 2);
    [0, 4, 7, 12].forEach((s, i) => tone(base * Math.pow(2, s / 12), 0.16, { type: 'square', vol: 0.16, delay: i * 0.07 }));
  },
  tick() {
    tone(1500, 0.04, { type: 'square', vol: 0.12 });
  },
  countdown(final: boolean) {
    tone(final ? 1046 : 523, final ? 0.4 : 0.18, { type: 'square', vol: 0.22 });
  },
  explosion() {
    burst(0.5, { type: 'lowpass', freq: 1400, slideTo: 80, vol: 0.55 });
    tone(110, 0.3, { type: 'sine', vol: 0.4, slideTo: 40 });
  },
  saw() {
    tone(180, 0.6, { type: 'sawtooth', vol: 0.08, slideTo: 260 });
  },
  turret() {
    tone(300, 0.25, { type: 'square', vol: 0.15, slideTo: 600 });
  },
  dragon() {
    burst(1.1, { type: 'lowpass', freq: 600, slideTo: 2400, vol: 0.4 });
    tone(90, 0.9, { type: 'sawtooth', vol: 0.18, slideTo: 55 });
  },
  whoosh() {
    burst(0.35, { freq: 500, slideTo: 3000, q: 1.2, vol: 0.3 });
  },
  win() {
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, { type: 'square', vol: 0.18, delay: i * 0.11 }));
  },
  lose() {
    [392, 349, 311, 262].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.25, delay: i * 0.18 }));
  },
  coin() {
    tone(988, 0.08, { type: 'square', vol: 0.18 });
    tone(1318, 0.25, { type: 'square', vol: 0.18, delay: 0.08 });
  },
  error() {
    tone(200, 0.18, { type: 'square', vol: 0.2 });
    tone(150, 0.25, { type: 'square', vol: 0.2, delay: 0.12 });
  },
};
