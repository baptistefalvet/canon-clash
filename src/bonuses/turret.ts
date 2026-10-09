// 19 — Turret: a gatling turret drops on the owner's frontier and sprays paint balls at the nearest enemies.

import { turret as cfg } from '../../config/bonuses';
import { TAU, angleDiff, clamp, deg, easeOutBounce } from '../util/math';
import { strongestOpponent, type Sim } from '../game/sim';
import type { BonusEntity } from './types';
import type { TeamPalette } from '../board/palette';

const DROP_HEIGHT = 420;
const FADE_SEC = 0.3;

export function drawTurretSprite(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, aim: number, spin: number, p: TeamPalette) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // hex base
  const hexR = 44;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) ctx.lineTo(Math.cos((i / 6) * TAU + Math.PI / 6) * hexR, Math.sin((i / 6) * TAU + Math.PI / 6) * hexR * 0.8 + 12);
  ctx.closePath();
  ctx.fillStyle = p.outline;
  ctx.fill();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) ctx.lineTo(Math.cos((i / 6) * TAU + Math.PI / 6) * hexR, Math.sin((i / 6) * TAU + Math.PI / 6) * hexR * 0.8);
  ctx.closePath();
  const bg = ctx.createLinearGradient(0, -hexR, 0, hexR);
  bg.addColorStop(0, p.tile);
  bg.addColorStop(1, p.dark);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = p.outline;
  ctx.stroke();

  // gatling barrels
  ctx.save();
  ctx.translate(0, -10);
  ctx.rotate(aim);
  for (let b = 0; b < 3; b++) {
    const off = Math.sin(spin + (b * TAU) / 3) * 8;
    ctx.fillStyle = b === 1 ? p.light : p.tile;
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(10, off - 5, 50, 10);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = p.dark;
  ctx.fillRect(48, -14, 10, 28);
  ctx.strokeRect(48, -14, 10, 28);
  ctx.restore();

  // body dome
  ctx.beginPath();
  ctx.arc(0, -10, 26, 0, TAU);
  const hg = ctx.createRadialGradient(-9, -22, 3, 0, -10, 26);
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

export class Turret implements BonusEntity {
  readonly layer = 'ground' as const;
  done = false;
  private x: number;
  private y: number;
  private age = 0;
  private aim: number;
  private targetAim: number;
  private fireTimer = 0;
  private retarget = 0;
  private spin = 0;
  private landed = false;

  constructor(readonly owner: number, sim: Sim) {
    const g = sim.grid;
    const goal = g.centroid(strongestOpponent(sim, owner)) ?? { x: g.x0 + g.width / 2, y: g.y0 + g.height / 2 };
    // Ignore isolated islands: the turret lands on the main body of our territory
    const own = (i: number) => g.owner[i] === owner;
    const front = g.frontier(owner).filter((i) => {
      const c = i % g.cols;
      const r = Math.floor(i / g.cols);
      const n = (c > 0 && own(i - 1) ? 1 : 0) + (c < g.cols - 1 && own(i + 1) ? 1 : 0) + (r > 0 && own(i - g.cols) ? 1 : 0) + (r < g.rows - 1 && own(i + g.cols) ? 1 : 0);
      return n >= 2;
    });
    let best = -1;
    let bestD = Infinity;
    for (const i of front) {
      const d = Math.hypot(g.centerX(i) - goal.x, g.centerY(i) - goal.y) + sim.rng.range(0, g.tile * 3);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    const c = sim.cannons[owner];
    this.x = best >= 0 ? g.centerX(best) : c.x;
    this.y = best >= 0 ? g.centerY(best) : c.y;
    // keep the body fully on the board
    this.x = clamp(this.x, g.x0 + g.tile * 1.2, g.x0 + g.width - g.tile * 1.2);
    this.y = clamp(this.y, g.y0 + g.tile * 1.2, g.y0 + g.height - g.tile * 1.2);
    this.aim = this.targetAim = Math.atan2(goal.y - this.y, goal.x - this.x);
  }

  private pickTarget(sim: Sim) {
    const g = sim.grid;
    let best = -1;
    let bestScore = Infinity;
    for (let k = 0; k < 40; k++) {
      const i = sim.rng.int(0, g.total - 1);
      if (g.owner[i] === this.owner) continue;
      const d = Math.hypot(g.centerX(i) - this.x, g.centerY(i) - this.y);
      const turn = Math.abs(angleDiff(this.aim, Math.atan2(g.centerY(i) - this.y, g.centerX(i) - this.x)));
      const score = d + turn * 120;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    if (best >= 0) this.targetAim = Math.atan2(g.centerY(best) - this.y, g.centerX(best) - this.x);
  }

  update(dt: number, sim: Sim) {
    this.age += dt;
    if (this.age > cfg.durationSec + FADE_SEC) {
      this.done = true;
      return;
    }
    if (this.age < cfg.dropInSec) return;
    if (!this.landed) {
      this.landed = true;
      sim.grid.captureCircle(this.x, this.y, sim.grid.tile * 1.1, this.owner);
      sim.particles.smoke(this.x, this.y + 20, 8, 'rgba(255,255,255,0.45)');
      sim.particles.ring(this.x, this.y + 10, 90, '#ffffff', 0.35);
      sim.shake(5);
    }
    if (this.age > cfg.durationSec) return;
    this.retarget -= dt;
    if (this.retarget <= 0) {
      this.retarget = cfg.aimRetargetSec;
      this.pickTarget(sim);
    }
    this.aim += clamp(angleDiff(this.aim, this.targetAim), -6 * dt, 6 * dt);
    this.spin += dt * 30;
    this.fireTimer -= dt;
    while (this.fireTimer <= 0) {
      this.fireTimer += cfg.fireIntervalSec;
      const a = this.aim + deg(cfg.spreadDeg) * (sim.rng.next() - 0.5);
      sim.bullets.fire(this.owner, this.x + Math.cos(this.aim) * 50, this.y - 10 + Math.sin(this.aim) * 50, a, cfg.bulletSpeed);
    }
  }

  draw(ctx: CanvasRenderingContext2D, sim: Sim) {
    const p = sim.palettes[this.owner];
    const k = clamp(this.age / cfg.dropInSec, 0, 1);
    const z = DROP_HEIGHT * (1 - easeOutBounce(k));
    const fade = this.age > cfg.durationSec ? clamp(1 - (this.age - cfg.durationSec) / FADE_SEC, 0, 1) : 1;
    const s = fade;
    if (s <= 0) return;
    const { x } = this;
    const y = this.y - z;

    // shadow
    ctx.fillStyle = `rgba(10,0,30,${0.3 * (0.4 + 0.6 * k)})`;
    ctx.beginPath();
    ctx.ellipse(this.x + 6, this.y + 26, 48 * s * (0.6 + 0.4 * k), 22 * s, 0, 0, TAU);
    ctx.fill();

    drawTurretSprite(ctx, x, y, s, this.aim, this.spin, p);

    // remaining-time ring
    if (k >= 1 && this.age < cfg.durationSec) {
      const left = 1 - this.age / cfg.durationSec;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 10, 58, -Math.PI / 2, -Math.PI / 2 + TAU * left);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }
}
