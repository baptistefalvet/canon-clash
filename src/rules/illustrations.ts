// Canvas illustrations for the rules, built from the real game renderers.

import { board, boardFrame } from '../../config/board';
import { cannon as cannonCfg } from '../../config/cannon';
import { seats } from '../../config/players';
import { Grid } from '../board/grid';
import { buildPalette } from '../board/palette';
import { drawTiles } from '../board/render';
import { Cannon } from '../cannon/cannon';
import { renderScene } from '../ui/Backdrop';
import { Rng } from '../util/rng';
import { deg } from '../util/math';

let scene: HTMLCanvasElement | null = null;

/** Whole arena (frame included), scaled into w×h. */
export function drawBoardMini(ctx: CanvasRenderingContext2D, w: number, h: number) {
  scene ??= renderScene(1, 21);
  const T = boardFrame.thickness;
  const sx = board.originX - T - 10;
  const sy = board.originY - T - 10;
  const sw = board.cols * board.tileSize + (T + 10) * 2;
  const sh = board.rows * board.tileSize + (T + 10) * 2;
  const k = Math.min(w / sw, h / sh);
  ctx.drawImage(scene, sx, sy, sw, sh, (w - sw * k) / 2, (h - sh * k) / 2, sw * k, sh * k);
}

/** Bottom-left corner: your cannon sweeping its quarter. */
export function drawCannonDemo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rng = new Rng(3);
  const grid = new Grid(
    seats.map((s) => s.corner),
    rng,
    board.shadeLevels,
  );
  const palettes = seats.map((s) => buildPalette(s.team));
  // a ragged frontier with the two neighbours
  const tl = seats.findIndex((s) => s.corner === 'TL');
  const br = seats.findIndex((s) => s.corner === 'BR');
  for (let r = grid.rows / 2; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols / 2; c++) {
      const i = grid.index(c, r);
      if (r < grid.rows / 2 + 3 + Math.round(Math.sin(c * 1.1) * 1.5)) grid.owner[i] = tl;
      else if (c > grid.cols / 2 - 3 + Math.round(Math.cos(r * 0.8) * 1.2)) grid.owner[i] = br;
    }
  }
  const view = { x: board.originX, y: board.originY + board.tileSize * 13, w: board.tileSize * 12, h: board.tileSize * 15 };
  const k = Math.max(w / view.w, h / view.h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  ctx.scale(k, k);
  ctx.translate(-view.x, -view.y);
  drawTiles(ctx, grid, palettes);
  const cannon = new Cannon(0, 'BL', grid, 0);
  // sweep arc
  ctx.setLineDash([16, 12]);
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  const a0 = cannon.midAngle - deg(cannonCfg.sweepAmplitudeDeg);
  const a1 = cannon.midAngle + deg(cannonCfg.sweepAmplitudeDeg);
  ctx.arc(cannon.x, cannon.y, 230, a0, a1);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const a of [a0, a1]) {
    const x = cannon.x + Math.cos(a) * 230;
    const y = cannon.y + Math.sin(a) * 230;
    const t = a === a0 ? a + Math.PI / 2 : a - Math.PI / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t);
    ctx.beginPath();
    ctx.moveTo(-18, 14);
    ctx.lineTo(0, -14);
    ctx.lineTo(18, 14);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
  cannon.angle = cannon.midAngle + 0.3;
  cannon.draw(ctx, palettes[0]);
  // a stream of paint balls
  const p = palettes[0];
  for (let i = 1; i <= 5; i++) {
    const d = 70 + i * 62;
    const x = cannon.x + Math.cos(cannon.angle) * d;
    const y = cannon.y - 4 + Math.sin(cannon.angle) * d;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = p.outline;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = p.light;
    ctx.fill();
  }
  ctx.restore();
}
