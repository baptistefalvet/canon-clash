// Tile rendering: flat tiles with dark grout lines + 3D "pop" blocks for freshly captured tiles.

import { board } from '../../config/board';
import { easeOutBounce, easeOutCubic } from '../util/math';
import type { Grid } from './grid';
import type { TeamPalette } from './palette';

export function drawTiles(ctx: CanvasRenderingContext2D, grid: Grid, palettes: TeamPalette[]) {
  const { cols, rows, tile: t, x0, y0, owner, shade } = grid;
  const g = board.groutPx;
  const inner = t - g;

  // Grout: one rect per tile in the owner's grout color, then the face.
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * t;
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const p = palettes[owner[i]];
      ctx.fillStyle = p.grout;
      ctx.fillRect(x0 + c * t, y, t, t);
      ctx.fillStyle = p.shades[shade[i]];
      ctx.fillRect(x0 + c * t + g / 2, y + g / 2, inner, inner);
    }
  }

  // Raised blocks, top to bottom so lower blocks overlap upper ones.
  const pop = board.pop;
  for (let i = 0; i < owner.length; i++) {
    const age = grid.popAge[i];
    if (age < 0) continue;
    const k = Math.min(1, age / pop.durationSec);
    const elev = pop.heightPx * (1 - easeOutBounce(k));
    const s = 1 + (pop.scale - 1) * (1 - easeOutCubic(k));
    const w = t * s;
    const cx = x0 + (i % cols) * t + t / 2;
    const cy = y0 + Math.floor(i / cols) * t + t / 2;
    const x = cx - w / 2;
    const y = cy - w / 2 - elev;
    const p = palettes[owner[i]];
    const side = cy + t / 2 - (y + w);
    if (side > 0.5) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x + 3, y + w, w, side + 3);
      ctx.fillStyle = p.dark;
      ctx.fillRect(x, y + w - 1, w, side + 1);
    }
    ctx.fillStyle = p.grout;
    ctx.fillRect(x, y, w, w);
    ctx.fillStyle = p.light;
    ctx.fillRect(x + g / 2, y + g / 2, w - g, w - g);
    ctx.fillStyle = p.shades[shade[i]];
    ctx.globalAlpha = Math.min(1, k * 2.2);
    ctx.fillRect(x + g / 2, y + g / 2, w - g, w - g);
    ctx.globalAlpha = 1;
  }
}

/** Soft shadow cast by the frame walls on the board edges (drawn above tiles). */
export function drawEdgeShadow(ctx: CanvasRenderingContext2D, grid: Grid) {
  const s = board.edgeShadowPx;
  const { x0, y0, width: w, height: h } = grid;
  let grad = ctx.createLinearGradient(0, y0, 0, y0 + s);
  grad.addColorStop(0, 'rgba(25,10,60,0.45)');
  grad.addColorStop(1, 'rgba(25,10,60,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x0, y0, w, s);
  grad = ctx.createLinearGradient(x0, 0, x0 + s * 0.7, 0);
  grad.addColorStop(0, 'rgba(25,10,60,0.35)');
  grad.addColorStop(1, 'rgba(25,10,60,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x0, y0, s * 0.7, h);
  grad = ctx.createLinearGradient(x0 + w, 0, x0 + w - s * 0.7, 0);
  grad.addColorStop(0, 'rgba(25,10,60,0.35)');
  grad.addColorStop(1, 'rgba(25,10,60,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x0 + w - s * 0.7, y0, s * 0.7, h);
}
