// Paint balls: travel through their owner's territory, flip the first enemy tile they touch and vanish.

import { bullet as cfg } from '../../config/cannon';
import { TAU } from '../util/math';
import type { Sim } from '../game/sim';

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: number;
  bounces: number;
  age: number;
  alive: boolean;
}

export class Bullets {
  items: Bullet[] = [];

  fire(owner: number, x: number, y: number, angle: number, speed = cfg.speed) {
    this.items.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, owner, bounces: 0, age: 0, alive: true });
  }

  update(dt: number, sim: Sim) {
    const { grid } = sim;
    const left = grid.x0 + cfg.radius;
    const top = grid.y0 + cfg.radius;
    const right = grid.x0 + grid.width - cfg.radius;
    const bottom = grid.y0 + grid.height - cfg.radius;

    for (const b of this.items) {
      b.age += dt;
      if (b.age > cfg.lifetimeSec) {
        b.alive = false;
        continue;
      }
      const dist = Math.hypot(b.vx, b.vy) * dt;
      const steps = Math.max(1, Math.ceil(dist / cfg.substepPx));
      const sdt = dt / steps;
      for (let s = 0; s < steps && b.alive; s++) {
        b.x += b.vx * sdt;
        b.y += b.vy * sdt;
        let bounced = false;
        if (b.x < left || b.x > right) {
          b.vx = -b.vx;
          b.x = b.x < left ? left : right;
          bounced = true;
        }
        if (b.y < top || b.y > bottom) {
          b.vy = -b.vy;
          b.y = b.y < top ? top : bottom;
          bounced = true;
        }
        if (bounced && ++b.bounces > cfg.maxBounces) {
          b.alive = false;
          break;
        }
        const i = grid.tileAt(b.x, b.y);
        if (i >= 0 && grid.owner[i] !== b.owner) {
          grid.capture(i, b.owner);
          b.alive = false;
        }
      }
    }
    this.items = this.items.filter((b) => b.alive);
  }

  draw(ctx: CanvasRenderingContext2D, sim: Sim) {
    const r = cfg.radius;
    // Shadows first
    ctx.fillStyle = 'rgba(10,0,30,0.22)';
    for (const b of this.items) {
      ctx.beginPath();
      ctx.ellipse(b.x + 2, b.y + cfg.shadowOffsetY, r * 0.9, r * 0.55, 0, 0, TAU);
      ctx.fill();
    }
    ctx.lineCap = 'round';
    for (const b of this.items) {
      ctx.strokeStyle = sim.palettes[b.owner].light;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = r * 1.3;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * cfg.trailLength, b.y - b.vy * cfg.trailLength);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const b of this.items) {
      const p = sim.palettes[b.owner];
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, TAU);
      ctx.fillStyle = p.outline;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, r - 2.2, 0, TAU);
      ctx.fillStyle = p.tile;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x - r * 0.15, b.y - r * 0.2, r * 0.55, 0, TAU);
      ctx.fillStyle = p.light;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x - r * 0.3, b.y - r * 0.35, r * 0.22, 0, TAU);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }
}
