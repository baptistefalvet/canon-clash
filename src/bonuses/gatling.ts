// 8 — Mitraille: the owner's cannon turns into a gatling and sprays paint balls at the nearest enemy land.

import { gatling as cfg } from '../../config/bonuses';
import { TAU, angleDiff, clamp, deg } from '../util/math';
import type { Sim } from '../game/sim';
import type { BonusEntity } from './types';
import type { TeamPalette } from '../board/palette';

/** Card / rules artwork: the cannon in gatling mode, with a stream of balls. */
export function drawGatlingSprite(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, aim: number, spin: number, p: TeamPalette) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const B = 64;
  // base
  ctx.fillStyle = p.outline;
  ctx.beginPath();
  ctx.roundRect(-B / 2, -B / 2 + 10, B, B, 14);
  ctx.fill();
  const bg = ctx.createLinearGradient(0, -B / 2, 0, B / 2);
  bg.addColorStop(0, p.tile);
  bg.addColorStop(1, p.dark);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(-B / 2, -B / 2, B, B, 14);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = p.outline;
  ctx.stroke();
  // balls
  for (let i = 0; i < 4; i++) {
    const d = 78 + i * 26;
    const a = aim + (i % 2 ? 0.12 : -0.1);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, -4 + Math.sin(a) * d, 8 - i, 0, TAU);
    ctx.fillStyle = p.outline;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, -4 + Math.sin(a) * d, 5.5 - i * 0.8, 0, TAU);
    ctx.fillStyle = p.light;
    ctx.fill();
  }
  // barrels
  ctx.save();
  ctx.translate(0, -4);
  ctx.rotate(aim);
  for (let b = 0; b < 3; b++) {
    const off = Math.sin(spin + (b * TAU) / 3) * 8;
    ctx.fillStyle = b === 1 ? p.light : p.tile;
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(4, off - 5, 58, 10, 3);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = p.dark;
  ctx.fillRect(50, -15, 10, 30);
  ctx.strokeRect(50, -15, 10, 30);
  ctx.restore();
  // dome
  ctx.beginPath();
  ctx.arc(0, -4, 25, 0, TAU);
  const hg = ctx.createRadialGradient(-9, -16, 3, 0, -4, 25);
  hg.addColorStop(0, '#ffffff');
  hg.addColorStop(0.3, p.light);
  hg.addColorStop(1, p.dark);
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = p.outline;
  ctx.stroke();
  ctx.restore();
}

export class Gatling implements BonusEntity {
  readonly layer = 'ground' as const;
  done = false;
  private age = 0;
  private aim: number;
  private targetAim: number;
  private fireTimer = cfg.spinUpSec;
  private retarget = 0;

  constructor(readonly owner: number, sim: Sim) {
    const c = sim.cannons[owner];
    c.gatlingLeft = cfg.durationSec;
    this.aim = this.targetAim = c.angle;
    this.pickTarget(sim);
  }

  private pickTarget(sim: Sim) {
    const g = sim.grid;
    const c = sim.cannons[this.owner];
    let best = -1;
    let bestScore = Infinity;
    for (let k = 0; k < 40; k++) {
      const i = sim.rng.int(0, g.total - 1);
      if (g.owner[i] === this.owner) continue;
      const d = Math.hypot(g.centerX(i) - c.x, g.centerY(i) - c.y);
      const turn = Math.abs(angleDiff(this.aim, Math.atan2(g.centerY(i) - c.y, g.centerX(i) - c.x)));
      const score = d + turn * 120;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    if (best >= 0) this.targetAim = Math.atan2(g.centerY(best) - c.y, g.centerX(best) - c.x);
  }

  update(dt: number, sim: Sim) {
    const c = sim.cannons[this.owner];
    this.age += dt;
    if (this.age > cfg.durationSec) {
      c.aimOverride = null;
      c.gatlingLeft = 0;
      this.done = true;
      return;
    }
    this.retarget -= dt;
    if (this.retarget <= 0) {
      this.retarget = cfg.aimRetargetSec;
      this.pickTarget(sim);
    }
    this.aim += clamp(angleDiff(this.aim, this.targetAim), -cfg.aimTurnPerSec * dt, cfg.aimTurnPerSec * dt);
    c.aimOverride = this.aim;
    this.fireTimer -= dt;
    while (this.fireTimer <= 0) {
      this.fireTimer += cfg.fireIntervalSec;
      const a = c.angle + deg(cfg.spreadDeg) * (sim.rng.next() - 0.5);
      sim.bullets.fire(this.owner, c.muzzleX, c.muzzleY + 4, a, cfg.bulletSpeed);
      c.kick();
    }
  }

  draw(ctx: CanvasRenderingContext2D, sim: Sim) {
    // remaining-time ring around the cannon
    const c = sim.cannons[this.owner];
    const left = 1 - this.age / cfg.durationSec;
    ctx.beginPath();
    ctx.arc(c.x, c.y - 4, 66, -Math.PI / 2, -Math.PI / 2 + TAU * left);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
