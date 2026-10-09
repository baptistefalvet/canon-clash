// 9 — Obus: a salvo lobbed from the owner's cannon onto enemy land; each blast flips a disc of tiles.

import { bombs as cfg } from '../../config/bonuses';
import { fx } from '../../config/fx';
import { TAU, easeInOutSine, lerp } from '../util/math';
import type { Sim } from '../game/sim';
import type { BonusEntity } from './types';
import { sfx } from '../audio/sfx';

interface Bomb {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  delay: number;
  t: number;
  launched: boolean;
  exploded: boolean;
}

export function drawBombSprite(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, band: string, t: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, '#6d6488');
  g.addColorStop(0.5, '#2c2540');
  g.addColorStop(1, '#120d1f');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#0b0714';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.98, Math.PI * 0.15, Math.PI * 0.85);
  ctx.strokeStyle = band;
  ctx.lineWidth = r * 0.32;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.28, r * 0.17, -0.7, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();
  // cap + fuse
  ctx.fillStyle = '#4a4262';
  ctx.fillRect(x - r * 0.25, y - r * 1.15, r * 0.5, r * 0.3);
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.15);
  ctx.quadraticCurveTo(x + r * 0.4, y - r * 1.6, x + r * 0.55, y - r * 1.35);
  ctx.strokeStyle = '#c9a26b';
  ctx.lineWidth = 3;
  ctx.stroke();
  const flick = 0.7 + 0.3 * Math.sin(t * 50);
  ctx.beginPath();
  ctx.arc(x + r * 0.55, y - r * 1.35, r * 0.25 * flick, 0, TAU);
  ctx.fillStyle = '#ffe36b';
  ctx.fill();
}

export class BombStrike implements BonusEntity {
  readonly layer = 'air' as const;
  done = false;
  private bombs: Bomb[] = [];
  private age = 0;

  constructor(readonly owner: number, sim: Sim) {
    const g = sim.grid;
    const c = sim.cannons[owner];
    const home = g.centroid(owner) ?? { x: c.x, y: c.y };
    // Enemy tiles sorted by distance to our land: aim at the nearest third, spread out
    const enemy = g
      .enemyTiles(owner)
      .map((i) => ({ i, d: Math.hypot(g.centerX(i) - home.x, g.centerY(i) - home.y) + sim.rng.range(0, g.tile * 4) }))
      .sort((a, b) => a.d - b.d);
    const pool = enemy.slice(0, Math.max(cfg.count, Math.floor(enemy.length * 0.4)));
    sim.rng.shuffle(pool);
    const minD = cfg.minSpacingTiles * g.tile;
    const targets: { x: number; y: number }[] = [];
    for (const e of pool) {
      if (targets.length >= cfg.count) break;
      const x = g.centerX(e.i);
      const y = g.centerY(e.i);
      if (targets.every((t) => Math.hypot(t.x - x, t.y - y) >= minD)) targets.push({ x, y });
    }
    targets.forEach((t, k) => {
      this.bombs.push({ sx: c.x, sy: c.y - 10, tx: t.x, ty: t.y, delay: k * cfg.staggerSec, t: 0, launched: false, exploded: false });
    });
    if (this.bombs.length === 0) this.done = true;
    else c.pointAt(Math.atan2(this.bombs[0].ty - c.y, this.bombs[0].tx - c.x), cfg.staggerSec);
  }

  update(dt: number, sim: Sim) {
    this.age += dt;
    let alive = false;
    for (const b of this.bombs) {
      if (b.exploded) continue;
      alive = true;
      if (this.age < b.delay) continue;
      if (!b.launched) {
        // each shell leaves the barrel: aim, kick, puff
        b.launched = true;
        const c = sim.cannons[this.owner];
        c.pointAt(Math.atan2(b.ty - c.y, b.tx - c.x), cfg.staggerSec + 0.1);
        c.kick();
        sim.particles.smoke(c.muzzleX, c.muzzleY, 2);
      }
      b.t += dt / cfg.flightSec;
      if (b.t >= 1) {
        b.exploded = true;
        const r = cfg.radiusTiles * sim.grid.tile;
        sim.grid.captureCircle(b.tx, b.ty, r, this.owner);
        const p = sim.palettes[this.owner];
        sim.particles.flash(b.tx, b.ty, r * 1.3, p.light);
        sim.particles.ring(b.tx, b.ty, r * 1.25, '#ffffff');
        sim.particles.ring(b.tx, b.ty, r, p.tile, fx.explosion.ringLifeSec * 1.3);
        sim.particles.debris(b.tx, b.ty, p.tile, fx.explosion.debris, 1.8);
        sim.particles.sparks(b.tx, b.ty, '#fff3b0', 14, 600);
        sim.particles.smoke(b.tx, b.ty, 6);
        sim.shake(fx.explosion.shake);
        sfx.explosion();
      }
    }
    if (!alive) this.done = true;
  }

  draw(ctx: CanvasRenderingContext2D, sim: Sim) {
    const p = sim.palettes[this.owner];
    for (const b of this.bombs) {
      if (b.exploded) continue;
      const k = Math.max(0, Math.min(1, b.t));
      // target reticle
      const pulse = 0.85 + 0.15 * Math.sin(this.age * 14);
      const rr = cfg.radiusTiles * sim.grid.tile * pulse;
      ctx.beginPath();
      ctx.arc(b.tx, b.ty, rr, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.setLineDash([12, 10]);
      ctx.lineWidth = 4;
      ctx.strokeStyle = p.light;
      ctx.stroke();
      ctx.setLineDash([]);
      if (this.age < b.delay) continue;
      const e = easeInOutSine(k);
      const x = lerp(b.sx, b.tx, e);
      const gy = lerp(b.sy, b.ty, e);
      const z = cfg.arcHeightPx * 4 * k * (1 - k);
      ctx.fillStyle = `rgba(10,0,30,${0.15 + 0.2 * k})`;
      ctx.beginPath();
      ctx.ellipse(x, gy + 6, 22 * (0.5 + 0.5 * k), 10 * (0.5 + 0.5 * k), 0, 0, TAU);
      ctx.fill();
      drawBombSprite(ctx, x, gy - z, 22 + 6 * Math.sin(k * Math.PI), p.tile, this.age);
    }
  }
}
