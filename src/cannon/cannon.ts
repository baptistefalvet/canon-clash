// Corner cannon: sinusoidal sweep over the player's quarter, steady fire, recoil + muzzle flash.
// During a charge round it wears a segmented charge ring; it can jam (smoke, no fire) or turn into a gatling (Mitraille).

import { bonusByLevel } from '../../config/bonuses';
import { cannon as cfg } from '../../config/cannon';
import { charge as chargeCfg, jam as jamCfg, shotTiming } from '../../config/charge';
import { fx } from '../../config/fx';
import type { Corner } from '../../config/players';
import type { Grid } from '../board/grid';
import type { TeamPalette } from '../board/palette';
import type { GaugeStatus } from '../charge/round';
import { TAU, angleDiff, clamp, deg } from '../util/math';
import type { Sim } from '../game/sim';

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Color of one gauge level: white below the first zone, then the zone (special shot) color. */
export function levelColor(level: number): string {
  return bonusByLevel[level]?.color ?? cfg.chargeRing.lowColor;
}

export class Cannon {
  readonly x: number;
  readonly y: number;
  /** Diagonal of the quarter, pointing into the board. */
  readonly midAngle: number;
  angle: number;
  firing = false;
  /** Live charge gauge during a round (null between rounds). */
  gauge: { level: number; status: GaugeStatus } | null = null;
  /** Seconds left with the cannon jammed (no fire). */
  jamLeft = 0;
  /** Seconds left in gatling mode (Mitraille), set by the bonus. */
  gatlingLeft = 0;
  /** Barrel direction requested by a special shot; the sweep resumes when null. */
  aimOverride: number | null = null;
  private aimHeld = 0;
  private holdLeft = 0;
  private aimBlend = 0;
  private phase: number;
  private fireTimer: number;
  private recoil = 0;
  private flash = 0;
  private flashScale = 1;
  private spin = 0;
  private smokeTimer = 0;
  private age = 0;

  constructor(readonly seat: number, readonly corner: Corner, grid: Grid, phase: number) {
    const inset = cfg.insetTiles * grid.tile;
    const left = corner[1] === 'L';
    const top = corner[0] === 'T';
    this.x = left ? grid.x0 + inset : grid.x0 + grid.width - inset;
    this.y = top ? grid.y0 + inset : grid.y0 + grid.height - inset;
    const dx = left ? 1 : -1;
    const dy = top ? 1 : -1;
    this.midAngle = Math.atan2(dy, dx);
    this.phase = phase;
    this.angle = this.midAngle;
    this.fireTimer = phase / TAU * cfg.fireIntervalSec;
  }

  get muzzleX() {
    return this.x + Math.cos(this.angle) * cfg.muzzleLength;
  }

  get muzzleY() {
    return this.y - 4 + Math.sin(this.angle) * cfg.muzzleLength;
  }

  /** Special shot leaving the barrel: big recoil, flash, ring and shake. */
  blast(sim: Sim, color: string) {
    this.recoil = shotTiming.blastRecoilPx;
    this.flash = fx.muzzleFlashSec * 3;
    this.flashScale = 2.6;
    sim.particles.flash(this.muzzleX, this.muzzleY, 120, color);
    sim.particles.ring(this.muzzleX, this.muzzleY, 130, '#ffffff', 0.45);
    sim.particles.ring(this.x, this.y, 90, color, 0.55);
    sim.particles.sparks(this.muzzleX, this.muzzleY, color, 22, 620);
    sim.particles.smoke(this.muzzleX, this.muzzleY, 6);
    sim.shake(shotTiming.blastShake);
  }

  /** Snap the barrel toward `angle` and keep it there for `holdSec` (special shots aim before leaving). */
  pointAt(angle: number, holdSec: number) {
    this.aimOverride = this.aimHeld = this.angle = angle;
    this.aimBlend = 1;
    this.holdLeft = holdSec;
  }

  /** Overloaded: stop firing for `jam.durationSec`, with a puff of smoke and sparks. */
  jam(sim: Sim) {
    this.jamLeft = jamCfg.durationSec;
    this.recoil = cfg.recoilPx * 2;
    sim.particles.smoke(this.x, this.y - 10, 14, 'rgba(70,64,90,0.75)');
    sim.particles.sparks(this.x, this.y - 10, '#ffb04a', 18, 520);
    sim.particles.flash(this.x, this.y, 90, cfg.chargeRing.jamColor);
    sim.shake(6);
  }

  update(dt: number, sim: Sim) {
    const t = sim.time;
    this.age += dt;
    if (this.holdLeft > 0) {
      this.holdLeft -= dt;
      if (this.holdLeft <= 0) this.aimOverride = null;
    }
    const sweep = this.midAngle + deg(cfg.sweepAmplitudeDeg) * Math.sin((TAU * t) / cfg.sweepPeriodSec + this.phase);
    if (this.aimOverride !== null) this.aimHeld = this.aimOverride;
    this.aimBlend = clamp(this.aimBlend + (this.aimOverride !== null ? dt : -dt) / cfg.aimBlendSec, 0, 1);
    this.angle = sweep + angleDiff(sweep, this.aimHeld) * this.aimBlend;
    this.recoil = Math.max(0, this.recoil - (cfg.recoilPx / cfg.recoilRecoverSec) * dt);
    this.flash = Math.max(0, this.flash - dt);
    if (this.flash <= 0) this.flashScale = 1;
    this.gatlingLeft = Math.max(0, this.gatlingLeft - dt);
    this.spin += dt * (this.gatlingLeft > 0 ? 30 : 0);

    if (this.jamLeft > 0) {
      this.jamLeft = Math.max(0, this.jamLeft - dt);
      this.smokeTimer -= dt;
      if (this.smokeTimer <= 0) {
        this.smokeTimer = jamCfg.smokeEverySec;
        sim.particles.smoke(this.muzzleX, this.muzzleY - 6, 1, 'rgba(90,84,110,0.6)');
      }
      return;
    }
    if (!this.firing) return;
    this.fireTimer -= dt;
    while (this.fireTimer <= 0) {
      this.fireTimer += cfg.fireIntervalSec;
      sim.bullets.fire(this.seat, this.muzzleX, this.muzzleY + 4, this.angle);
      this.recoil = Math.max(this.recoil, cfg.recoilPx);
      this.flash = Math.max(this.flash, fx.muzzleFlashSec);
    }
  }

  /** Muzzle flash / gatling stream: extra visual kick for special shots that fire through the cannon. */
  kick() {
    this.recoil = Math.max(this.recoil, cfg.recoilPx * 0.7);
    this.flash = Math.max(this.flash, fx.muzzleFlashSec);
  }

  private drawChargeRing(ctx: CanvasRenderingContext2D) {
    const g = this.gauge;
    const jammed = this.jamLeft > 0;
    if (!g && !jammed) return;
    const R = cfg.chargeRing;
    const cap = chargeCfg.cap;
    const span = deg(R.arcDeg);
    const gap = deg(R.gapDeg);
    const seg = (span - gap * (cap - 1)) / cap;
    // The opening faces the board corner, behind the cannon
    const start = this.midAngle + Math.PI + (TAU - span) / 2;
    const cy = this.y - 4;
    const blink = 0.55 + 0.45 * Math.sin(this.age * 18);
    const over = jammed || g?.status === 'jammed';
    const level = g?.level ?? 0;

    // dark backing so the ring reads on any territory color
    ctx.beginPath();
    ctx.arc(this.x, cy, R.radius, start - gap, start + span + gap);
    ctx.strokeStyle = 'rgba(20,12,40,0.6)';
    ctx.lineWidth = R.width + 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    for (let i = 0; i < cap; i++) {
      const a0 = start + i * (seg + gap);
      const lit = over || i < level;
      ctx.beginPath();
      ctx.arc(this.x, cy, R.radius, a0, a0 + seg);
      ctx.lineCap = 'butt';
      ctx.lineWidth = R.width;
      if (over) {
        ctx.strokeStyle = R.jamColor;
        ctx.globalAlpha = blink;
      } else {
        ctx.strokeStyle = lit ? levelColor(i + 1) : R.emptyColor;
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // zone reached: soft glow in its color
    if (!over && level >= chargeCfg.minZone) {
      const pulse = 0.5 + 0.5 * Math.sin(this.age * 8);
      ctx.beginPath();
      ctx.arc(this.x, cy, R.radius + R.width, 0, TAU);
      ctx.strokeStyle = levelColor(level);
      ctx.globalAlpha = 0.25 + 0.25 * pulse;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // jam countdown: a shrinking white arc over the red ring
    if (jammed) {
      const k = this.jamLeft / jamCfg.durationSec;
      ctx.beginPath();
      ctx.arc(this.x, cy, R.radius + R.width + 2, -Math.PI / 2, -Math.PI / 2 + TAU * k);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  draw(ctx: CanvasRenderingContext2D, p: TeamPalette) {
    const v = cfg.visual;
    const B = v.baseSize;
    const { x, y } = this;
    const jammed = this.jamLeft > 0;

    // Ground shadow
    ctx.fillStyle = 'rgba(10,0,30,0.28)';
    ctx.beginPath();
    ctx.ellipse(x + 6, y + B * 0.42, B * 0.62, B * 0.3, 0, 0, TAU);
    ctx.fill();

    this.drawChargeRing(ctx);

    // Base block (3D)
    roundRectPath(ctx, x - B / 2, y - B / 2 + v.baseDepth, B, B, 16);
    ctx.fillStyle = p.outline;
    ctx.fill();
    roundRectPath(ctx, x - B / 2, y - B / 2, B, B, 16);
    const bg = ctx.createLinearGradient(x, y - B / 2, x, y + B / 2);
    bg.addColorStop(0, p.tile);
    bg.addColorStop(1, p.dark);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = p.outline;
    ctx.stroke();
    roundRectPath(ctx, x - B / 2 + 6, y - B / 2 + 5, B - 12, B - 12, 11);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Bolts
    ctx.fillStyle = p.light;
    for (const [bx, by] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      ctx.beginPath();
      ctx.arc(x + bx * (B / 2 - 12), y + by * (B / 2 - 12), 4, 0, TAU);
      ctx.fill();
    }

    // Barrel (rotates)
    const back = this.recoil;
    ctx.save();
    ctx.translate(x, y - 4);
    ctx.rotate(this.angle);
    const bw = v.barrelWidth;
    if (this.gatlingLeft > 0) {
      // Mitraille: three spinning barrels
      const bl = cfg.gatlingBarrelLength;
      for (let b = 0; b < 3; b++) {
        const off = Math.sin(this.spin + (b * TAU) / 3) * bw * 0.36;
        roundRectPath(ctx, -back, off - bw * 0.24, bl, bw * 0.48, 4);
        ctx.fillStyle = b === 1 ? p.light : p.tile;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = p.outline;
        ctx.stroke();
      }
      roundRectPath(ctx, bl - back - 14, -bw / 2 - 5, 12, bw + 10, 4);
      ctx.fillStyle = p.dark;
      ctx.fill();
      ctx.stroke();
      roundRectPath(ctx, 18 - back, -bw / 2 - 4, 12, bw + 8, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      const bl = v.barrelLength;
      roundRectPath(ctx, -back, -bw / 2, bl, bw, 7);
      const brg = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      brg.addColorStop(0, jammed ? '#9a96ad' : p.light);
      brg.addColorStop(0.45, jammed ? '#6d6886' : p.tile);
      brg.addColorStop(1, jammed ? '#45405c' : p.dark);
      ctx.fillStyle = brg;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = p.outline;
      ctx.stroke();
      // Muzzle ring
      roundRectPath(ctx, bl - back - 12, -bw / 2 - 4, 14, bw + 8, 5);
      ctx.fillStyle = p.dark;
      ctx.fill();
      ctx.stroke();
    }
    // Flash
    if (this.flash > 0) {
      const bl = this.gatlingLeft > 0 ? cfg.gatlingBarrelLength : v.barrelLength;
      const k = Math.min(1, this.flash / fx.muzzleFlashSec);
      const fxr = (20 + 10 * k) * this.flashScale;
      const mg = ctx.createRadialGradient(bl - back + 8, 0, 0, bl - back + 8, 0, fxr);
      mg.addColorStop(0, 'rgba(255,255,255,1)');
      mg.addColorStop(0.4, 'rgba(255,240,170,0.9)');
      mg.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(bl - back + 8, 0, fxr, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Head dome
    const hr = v.headRadius;
    ctx.beginPath();
    ctx.arc(x, y - 4, hr, 0, TAU);
    const hg = ctx.createRadialGradient(x - hr * 0.35, y - 4 - hr * 0.45, hr * 0.1, x, y - 4, hr);
    hg.addColorStop(0, p.light);
    hg.addColorStop(0.5, p.tile);
    hg.addColorStop(1, p.dark);
    ctx.fillStyle = hg;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = p.outline;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x - hr * 0.35, y - 4 - hr * 0.42, hr * 0.32, hr * 0.18, -0.6, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();

    // Jammed: a red « ! » warning over the dome
    if (jammed) {
      const bob = Math.sin(this.age * 10) * 3;
      ctx.beginPath();
      ctx.arc(x, y - 4 - bob, 15, 0, TAU);
      ctx.fillStyle = cfg.chargeRing.jamColor;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.font = "24px 'Lilita One'";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('!', x, y - 3 - bob);
    }
  }
}
