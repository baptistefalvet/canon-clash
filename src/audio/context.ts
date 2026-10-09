// Shared WebAudio context, unlocked on the first user gesture. Music and SFX have their own buses.

import { audio as cfg } from '../../config/audio';
import { getState, subscribe } from '../app/store';

let ctx: AudioContext | null = null;
let master: GainNode;
let musicBus: GainNode;
let sfxBus: GainNode;
let noiseBuffer: AudioBuffer;
const readyCallbacks: (() => void)[] = [];

function applyFlags() {
  if (!ctx) return;
  const s = getState();
  const now = ctx.currentTime;
  musicBus.gain.setTargetAtTime(s.musicOn ? cfg.musicVolume : 0, now, 0.05);
  sfxBus.gain.setTargetAtTime(s.sfxOn ? cfg.sfxVolume : 0, now, 0.02);
}

function create() {
  if (ctx) return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = cfg.masterVolume;
  master.connect(ctx.destination);
  musicBus = ctx.createGain();
  sfxBus = ctx.createGain();
  musicBus.connect(master);
  sfxBus.connect(master);
  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  applyFlags();
  subscribe(applyFlags);
  readyCallbacks.splice(0).forEach((cb) => cb());
}

export function installAudioUnlock() {
  const unlock = () => {
    create();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  };
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });
}

export function onAudioReady(cb: () => void) {
  if (ctx) cb();
  else readyCallbacks.push(cb);
}

export function audioCtx() {
  return ctx;
}

export function buses() {
  return { musicBus, sfxBus };
}

export function noise() {
  return noiseBuffer;
}
