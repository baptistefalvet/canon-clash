// 7 — Saw: the cannon fires a spinning blade that rolls in a straight line, bouncing on the walls, flipping every tile it crosses.

import { saw as cfg } from '../../config/bonuses';
import { TAU } from '../util/math';
import { strongestOpponent, type Sim } from '../game/sim';
import type { BonusEntity } from './types';

const FADE_SEC = 0.35;

export function drawSawBlade(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, light: string, mid: string, dark: string) {
  const teeth = 14;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * TAU;
    const a1 = ((i + 0.55) / teeth) * TAU;
    const a2 = ((i + 1) / teeth) * TAU;
    ctx.lineTo(Math.cos(a0) * r * 0.8, Math.sin(a0) * r * 0.8);
    ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
    ctx.lineTo(Math.cos(a2) * r * 0.8, Math.sin(a2) * r * 0.8);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.45, light);
  g.addColorStop(1, mid);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = dark;
  ctx.stroke();
  // grooves
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.52, (i / 3) * TAU, (i / 3) * TAU + 1.2);
    ctx.stroke();
  }
  // hub
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, TAU);
  ctx.fillStyle = dark;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.09, 0, TAU);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

export class Saw implements BonusEntity {
  readonly layer = 'ground' as const;
  done = false;
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private age = 0;
  private rot = 0;
  private bounces = 0;

  constructor(readonly owner: number, sim: Sim) {
    const c = sim.cannons[owner];
    const target = sim.grid.centroid(strongestOpponent(sim, owner)) ?? { x: sim.grid.x0 + sim.grid.width / 2, y: sim.grid.y0 + sim.grid.height / 2 };
    const a = Math.atan2(target.y - c.y, target.x - c.x) + sim.rng.range(-0.25, 0.25);
    c.pointAt(a, 0.6);
    this.x = c.x + Math.cos(a) * 70;
    this.y = c.y + Math.sin(a) * 70;
    this.vx = Math.cos(a) * cfg.speed;
    this.vy = Math.sin(a) * cfg.speed;
  }

  update(dt: number, sim: Sim) {
    this.age += dt;
    this.rot += cfg.spinPerSec * dt;
    if (this.age > cfg.durationSec + FADE_SEC) {
      this.done = true;
      return;
    }
    if (this.age > cfg.durationSec || this.bounces > cfg.maxBounces) return;
    const g = sim.grid;
    const r = cfg.visualRadius * 0.6;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < g.x0 + r || this.x > g.x0 + g.width - r) {
      this.vx = -this.vx;
      this.x = Math.min(Math.max(this.x, g.x0 + r), g.x0 + g.width - r);
      this.bounces++;
      sim.particles.sparks(this.x, this.y, '#fff3b0', 10);
    }
    if (this.y < g.y0 + r || this.y > g.y0 + g.height - r) {
      this.vy = -this.vy;
      this.y = Math.min(Math.max(this.y, g.y0 + r), g.y0 + g.height - r);
      this.bounces++;
      sim.particles.sparks(this.x, this.y, '#fff3b0', 10);
    }
    const n = g.captureCircle(this.x, this.y, cfg.radiusTiles * g.tile, this.owner);
    if (n > 0) sim.particles.sparks(this.x, this.y + cfg.visualRadius * 0.6, '#fff6c8', 2, 300);
  }

  draw(ctx: CanvasRenderingContext2D, sim: Sim) {
    const p = sim.palettes[this.owner];
    const appear = Math.min(1, this.age / 0.2);
    const fade = this.age > cfg.durationSec ? 1 - (this.age - cfg.durationSec) / FADE_SEC : 1;
    const s = Math.max(0, appear * fade);
    const r = cfg.visualRadius * s;
    if (r <= 0) return;
    ctx.fillStyle = 'rgba(10,0,30,0.28)';
    ctx.beginPath();
    ctx.ellipse(this.x + 8, this.y + r * 0.75, r * 0.95, r * 0.4, 0, 0, TAU);
    ctx.fill();
    drawSawBlade(ctx, this.x, this.y - 6, r, this.rot, p.light, p.tile, p.outline);
  }
}
