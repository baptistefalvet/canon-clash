// 10 — Dragon: leaves the cannon as a giant fireball, unfolds into a dragon and flies a sinuous path over enemy land,
// breathing fire and flipping a wide swath of tiles.

import { dragon as cfg } from '../../config/bonuses';
import { TAU, angleDiff, clamp, deg } from '../util/math';
import type { Sim } from '../game/sim';
import type { BonusEntity } from './types';
import type { TeamPalette } from '../board/palette';

const FLY_HEIGHT = 34;
const HEAD_LEN = 40;
const BODY_R = 30;
const EXIT_MARGIN = 220;

interface Pt {
  x: number;
  y: number;
}

export function drawDragon(
  ctx: CanvasRenderingContext2D,
  segs: Pt[],
  heading: number,
  age: number,
  p: TeamPalette,
  scale = 1,
  withShadow = true,
) {
  const n = segs.length;
  const radius = (i: number) => BODY_R * scale * (1 - (i / n) * 0.62);

  if (withShadow) {
    ctx.fillStyle = 'rgba(10,0,30,0.2)';
    for (let i = n - 1; i >= 0; i--) {
      ctx.beginPath();
      ctx.ellipse(segs[i].x + 18, segs[i].y + FLY_HEIGHT * scale + 10, radius(i), radius(i) * 0.6, 0, 0, TAU);
      ctx.fill();
    }
  }

  const lift = FLY_HEIGHT * scale;
  const dirAt = (i: number) => {
    const a = segs[Math.max(0, i - 1)];
    const b = segs[Math.min(n - 1, i + 1)];
    return i === 0 ? heading : Math.atan2(a.y - b.y, a.x - b.x);
  };

  // Tail tip
  {
    const t = segs[n - 1];
    const d = dirAt(n - 1);
    const r = radius(n - 1);
    ctx.beginPath();
    ctx.moveTo(t.x - Math.cos(d) * r * 3, t.y - lift - Math.sin(d) * r * 3);
    ctx.lineTo(t.x + Math.cos(d + Math.PI / 2) * r, t.y - lift + Math.sin(d + Math.PI / 2) * r);
    ctx.lineTo(t.x - Math.cos(d + Math.PI / 2) * r, t.y - lift - Math.sin(d + Math.PI / 2) * r);
    ctx.closePath();
    ctx.fillStyle = p.light;
    ctx.fill();
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Wings (attached to segment 2)
  const wingSeg = Math.min(2, n - 1);
  const w = segs[wingSeg];
  const wd = dirAt(wingSeg);
  const flap = Math.sin(age * 11);
  for (const side of [-1, 1]) {
    const span = (78 + 26 * flap) * scale;
    const perp = wd + (side * Math.PI) / 2;
    const bx = w.x;
    const by = w.y - lift;
    const tipX = bx + Math.cos(perp) * span - Math.cos(wd) * 30 * scale;
    const tipY = by + Math.sin(perp) * span - Math.sin(wd) * 30 * scale;
    const f1x = bx + Math.cos(perp) * span * 0.7 - Math.cos(wd) * 62 * scale;
    const f1y = by + Math.sin(perp) * span * 0.7 - Math.sin(wd) * 62 * scale;
    const f2x = bx + Math.cos(perp) * span * 0.35 - Math.cos(wd) * 66 * scale;
    const f2y = by + Math.sin(perp) * span * 0.35 - Math.sin(wd) * 66 * scale;
    const rootBack = { x: bx - Math.cos(wd) * 34 * scale, y: by - Math.sin(wd) * 34 * scale };
    const rootFront = { x: bx + Math.cos(wd) * 10 * scale, y: by + Math.sin(wd) * 10 * scale };
    ctx.beginPath();
    ctx.moveTo(rootFront.x, rootFront.y);
    ctx.quadraticCurveTo(
      bx + Math.cos(perp) * span * 0.6 + Math.cos(wd) * 20 * scale,
      by + Math.sin(perp) * span * 0.6 + Math.sin(wd) * 20 * scale,
      tipX,
      tipY,
    );
    ctx.quadraticCurveTo((tipX + f1x) / 2 + Math.cos(wd) * 8, (tipY + f1y) / 2 + Math.sin(wd) * 8, f1x, f1y);
    ctx.quadraticCurveTo((f1x + f2x) / 2 + Math.cos(wd) * 10, (f1y + f2y) / 2 + Math.sin(wd) * 10, f2x, f2y);
    ctx.quadraticCurveTo((f2x + rootBack.x) / 2 + Math.cos(wd) * 8, (f2y + rootBack.y) / 2 + Math.sin(wd) * 8, rootBack.x, rootBack.y);
    ctx.closePath();
    const wg = ctx.createLinearGradient(bx, by, tipX, tipY);
    wg.addColorStop(0, p.tile);
    wg.addColorStop(1, p.light);
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = p.dark;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(f1x, f1y);
    ctx.moveTo(bx, by);
    ctx.lineTo(f2x, f2y);
    ctx.stroke();
  }

  // Body, tail first
  for (let i = n - 1; i >= 1; i--) {
    const s = segs[i];
    const r = radius(i);
    const d = dirAt(i);
    // dorsal spike
    ctx.beginPath();
    ctx.moveTo(s.x + Math.cos(d) * r * 0.5, s.y - lift - r * 0.7 + Math.sin(d) * r * 0.5);
    ctx.lineTo(s.x - Math.cos(d) * r * 1.1, s.y - lift - r * 1.15 - Math.sin(d) * r * 1.1);
    ctx.lineTo(s.x - Math.cos(d) * r * 0.4, s.y - lift - r * 0.3 - Math.sin(d) * r * 0.4);
    ctx.closePath();
    ctx.fillStyle = p.light;
    ctx.fill();
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s.x, s.y - lift, r, 0, TAU);
    const g = ctx.createRadialGradient(s.x - r * 0.3, s.y - lift - r * 0.4, r * 0.1, s.x, s.y - lift, r);
    g.addColorStop(0, p.light);
    g.addColorStop(0.55, p.tile);
    g.addColorStop(1, p.dark);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = p.outline;
    ctx.stroke();
  }

  // Head
  const h = segs[0];
  const hx = h.x;
  const hy = h.y - lift;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(heading);
  const L = HEAD_LEN * scale;
  const W = BODY_R * scale * 1.05;
  // horns
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-L * 0.3, side * W * 0.5);
    ctx.quadraticCurveTo(-L * 0.9, side * W * 1.1, -L * 1.25, side * W * 0.95);
    ctx.quadraticCurveTo(-L * 0.8, side * W * 0.6, -L * 0.1, side * W * 0.25);
    ctx.closePath();
    ctx.fillStyle = '#fff4d6';
    ctx.fill();
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  // skull + snout
  ctx.beginPath();
  ctx.ellipse(-L * 0.1, 0, L * 0.7, W, 0, 0, TAU);
  ctx.moveTo(L * 0.2, -W * 0.62);
  ctx.ellipse(L * 0.45, 0, L * 0.62, W * 0.66, 0, 0, TAU);
  const hg = ctx.createRadialGradient(-L * 0.2, -W * 0.3, 2, 0, 0, L);
  hg.addColorStop(0, p.light);
  hg.addColorStop(0.6, p.tile);
  hg.addColorStop(1, p.dark);
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = 3;
  ctx.stroke();
  // nostrils
  ctx.fillStyle = p.outline;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(L * 0.95, side * W * 0.25, 3.5 * scale, 2.5 * scale, 0, 0, TAU);
    ctx.fill();
  }
  // eyes
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(-L * 0.05, side * W * 0.52, 9 * scale, 11 * scale, 0, 0, TAU);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(L * 0.02, side * W * 0.52, 3.5 * scale, 7 * scale, 0, 0, TAU);
    ctx.fillStyle = '#1b1430';
    ctx.fill();
  }
  ctx.restore();
}

export class Dragon implements BonusEntity {
  readonly layer = 'air' as const;
  done = false;
  private x: number;
  private y: number;
  private heading: number;
  private age = 0;
  private trail: Pt[] = [];
  private retarget = 0;
  private target: Pt;
  private breath = 0;

  /** Fireball phase: true until the dragon unfolds. */
  private hatching = true;

  constructor(readonly owner: number, sim: Sim) {
    const g = sim.grid;
    const c = sim.cannons[owner];
    c.pointAt(c.midAngle, 0.6);
    this.x = c.muzzleX;
    this.y = c.muzzleY;
    this.heading = c.midAngle;
    this.target = { x: g.x0 + g.width / 2, y: g.y0 + g.height / 2 };
  }

  private hatch(sim: Sim) {
    this.hatching = false;
    this.age = 0;
    this.trail = [];
    for (let i = 0; i < cfg.segments * cfg.segmentSpacing; i += 4) {
      this.trail.push({ x: this.x - Math.cos(this.heading) * i * 0.2, y: this.y - Math.sin(this.heading) * i * 0.2 });
    }
    const p = sim.palettes[this.owner];
    sim.particles.flash(this.x, this.y - FLY_HEIGHT, 160, p.light);
    sim.particles.ring(this.x, this.y - FLY_HEIGHT, 170, '#ffffff', 0.5);
    sim.particles.ring(this.x, this.y - FLY_HEIGHT, 120, '#ffc631', 0.6);
    sim.particles.sparks(this.x, this.y - FLY_HEIGHT, '#ffe36b', 26, 640);
    sim.shake(8);
  }

  private pickTarget(sim: Sim) {
    const g = sim.grid;
    let best: Pt | null = null;
    let bestScore = Infinity;
    for (let k = 0; k < 36; k++) {
      const i = sim.rng.int(0, g.total - 1);
      if (g.owner[i] === this.owner) continue;
      const x = g.centerX(i);
      const y = g.centerY(i);
      const d = Math.hypot(x - this.x, y - this.y);
      if (d < g.tile * 3) continue;
      const turn = Math.abs(angleDiff(this.heading, Math.atan2(y - this.y, x - this.x)));
      const score = d * 0.6 + turn * 260;
      if (score < bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
    if (best) this.target = best;
  }

  update(dt: number, sim: Sim) {
    const g = sim.grid;
    this.age += dt;
    if (this.hatching) {
      this.x += Math.cos(this.heading) * cfg.fireballSpeed * dt;
      this.y += Math.sin(this.heading) * cfg.fireballSpeed * dt;
      if (sim.rng.next() < 0.8) {
        sim.particles.add({
          kind: 'fire',
          x: this.x,
          y: this.y - FLY_HEIGHT * Math.min(1, this.age / cfg.fireballSec),
          vx: sim.rng.range(-60, 60),
          vy: sim.rng.range(-60, 60),
          life: 0.3,
          size: sim.rng.range(16, 26),
          color: '#ffb02e',
          color2: 'rgba(255,255,255,0)',
        });
      }
      if (this.age >= cfg.fireballSec) this.hatch(sim);
      return;
    }
    const exiting = this.age > cfg.durationSec;

    if (exiting) {
      // leave by the nearest side
      const cx = g.x0 + g.width / 2;
      this.target = { x: this.x < cx ? g.x0 - EXIT_MARGIN * 2 : g.x0 + g.width + EXIT_MARGIN * 2, y: this.y };
    } else {
      this.retarget -= dt;
      if (this.retarget <= 0 || Math.hypot(this.target.x - this.x, this.target.y - this.y) < g.tile * 1.5) {
        this.retarget = cfg.retargetSec;
        this.pickTarget(sim);
      }
    }

    // keep inside the arena while hunting
    let desired = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    const margin = g.tile * 2;
    if (!exiting && this.age > 0.6) {
      const inX = clamp(this.x, g.x0 + margin, g.x0 + g.width - margin);
      const inY = clamp(this.y, g.y0 + margin, g.y0 + g.height - margin);
      if (inX !== this.x || inY !== this.y) desired = Math.atan2(g.y0 + g.height / 2 - this.y, g.x0 + g.width / 2 - this.x);
    }
    const maxTurn = deg(cfg.turnRateDeg) * dt;
    this.heading += clamp(angleDiff(this.heading, desired), -maxTurn, maxTurn);
    const speed = cfg.speed * (exiting ? 1.5 : 1);
    this.x += Math.cos(this.heading) * speed * dt;
    this.y += Math.sin(this.heading) * speed * dt;

    // trail for the body segments
    this.trail.unshift({ x: this.x, y: this.y });
    const maxLen = cfg.segments * cfg.segmentSpacing + 40;
    let len = 0;
    for (let i = 1; i < this.trail.length; i++) {
      len += Math.hypot(this.trail[i].x - this.trail[i - 1].x, this.trail[i].y - this.trail[i - 1].y);
      if (len > maxLen) {
        this.trail.length = i + 1;
        break;
      }
    }

    if (!exiting && g.inside(this.x, this.y)) {
      g.captureCircle(this.x, this.y, cfg.radiusTiles * g.tile, this.owner);
      this.breath -= dt;
      if (this.breath <= 0) {
        this.breath = 0.03;
        const p = sim.palettes[this.owner];
        const a = this.heading + sim.rng.range(-0.35, 0.35);
        const sp = sim.rng.range(260, 420);
        sim.particles.add({
          kind: 'fire',
          x: this.x + Math.cos(this.heading) * 50,
          y: this.y - FLY_HEIGHT + Math.sin(this.heading) * 50,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp + 80,
          life: 0.35,
          size: sim.rng.range(14, 24),
          color: p.light,
          color2: 'rgba(255,255,255,0)',
        });
      }
    }

    if (exiting) {
      const off = this.x < g.x0 - EXIT_MARGIN || this.x > g.x0 + g.width + EXIT_MARGIN || this.y < g.y0 - EXIT_MARGIN || this.y > g.y0 + g.height + EXIT_MARGIN;
      if (off) this.done = true;
    }
  }

  private segments(): Pt[] {
    const out: Pt[] = [];
    let want = 0;
    let acc = 0;
    for (let i = 0; i < this.trail.length && out.length < cfg.segments; i++) {
      if (i > 0) acc += Math.hypot(this.trail[i].x - this.trail[i - 1].x, this.trail[i].y - this.trail[i - 1].y);
      if (acc >= want) {
        out.push(this.trail[i]);
        want += cfg.segmentSpacing;
      }
    }
    while (out.length < cfg.segments) out.push(out[out.length - 1]);
    return out;
  }

  draw(ctx: CanvasRenderingContext2D, sim: Sim) {
    if (this.hatching) {
      const k = Math.min(1, this.age / cfg.fireballSec);
      const r = cfg.fireballRadius * (0.5 + 0.5 * k);
      const z = FLY_HEIGHT * k;
      ctx.fillStyle = 'rgba(10,0,30,0.22)';
      ctx.beginPath();
      ctx.ellipse(this.x + 10, this.y + 12, r, r * 0.5, 0, 0, TAU);
      ctx.fill();
      const fg = ctx.createRadialGradient(this.x - r * 0.3, this.y - z - r * 0.3, r * 0.1, this.x, this.y - z, r * 1.4);
      fg.addColorStop(0, '#ffffff');
      fg.addColorStop(0.3, '#fff0a0');
      fg.addColorStop(0.6, '#ffb02e');
      fg.addColorStop(1, 'rgba(255,90,40,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(this.x, this.y - z, r * 1.4, 0, TAU);
      ctx.fill();
      return;
    }
    const grow = Math.min(1, 0.35 + this.age / 0.35);
    drawDragon(ctx, this.segments(), this.heading, this.age, sim.palettes[this.owner], cfg.scale * grow);
  }
}
