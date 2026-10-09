// Corner cannon: sinusoidal sweep over the player's quarter, steady fire, recoil + muzzle flash.

import { cannon as cfg } from '../../config/cannon';
import { fx } from '../../config/fx';
import type { Corner } from '../../config/players';
import type { Grid } from '../board/grid';
import type { TeamPalette } from '../board/palette';
import { TAU, deg } from '../util/math';
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

export class Cannon {
  readonly x: number;
  readonly y: number;
  /** Diagonal of the quarter, pointing into the board. */
  readonly midAngle: number;
  angle: number;
  firing = false;
  private phase: number;
  private fireTimer: number;
  private recoil = 0;
  private flash = 0;

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

  update(dt: number, sim: Sim) {
    const t = sim.time;
    this.angle = this.midAngle + deg(cfg.sweepAmplitudeDeg) * Math.sin((TAU * t) / cfg.sweepPeriodSec + this.phase);
    this.recoil = Math.max(0, this.recoil - (cfg.recoilPx / cfg.recoilRecoverSec) * dt);
    this.flash = Math.max(0, this.flash - dt);
    if (!this.firing) return;
    this.fireTimer -= dt;
    while (this.fireTimer <= 0) {
      this.fireTimer += cfg.fireIntervalSec;
      const mx = this.x + Math.cos(this.angle) * cfg.muzzleLength;
      const my = this.y + Math.sin(this.angle) * cfg.muzzleLength;
      sim.bullets.fire(this.seat, mx, my, this.angle);
      this.recoil = cfg.recoilPx;
      this.flash = fx.muzzleFlashSec;
    }
  }

  draw(ctx: CanvasRenderingContext2D, p: TeamPalette) {
    const v = cfg.visual;
    const B = v.baseSize;
    const { x, y } = this;

    // Ground shadow
    ctx.fillStyle = 'rgba(10,0,30,0.28)';
    ctx.beginPath();
    ctx.ellipse(x + 6, y + B * 0.42, B * 0.62, B * 0.3, 0, 0, TAU);
    ctx.fill();

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
    const bl = v.barrelLength;
    roundRectPath(ctx, -back, -bw / 2, bl, bw, 7);
    const brg = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
    brg.addColorStop(0, p.light);
    brg.addColorStop(0.45, p.tile);
    brg.addColorStop(1, p.dark);
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
    // Flash
    if (this.flash > 0) {
      const k = this.flash / fx.muzzleFlashSec;
      const fxr = 20 + 10 * k;
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
  }
}
