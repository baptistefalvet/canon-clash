// Static decor drawn once to an offscreen canvas: background, purple arena wall, horns, crystals.

import { background, board, boardFrame } from '../../config/board';
import { stage } from '../../config/layout';
import { gameLayout } from '../../config/layout';
import { Rng } from '../util/rng';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHorn(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1) {
  const h = boardFrame.horns;
  const [light, mid, dark] = h.colors;
  const L = h.length;
  const B = h.baseWidth;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.beginPath();
  ctx.moveTo(0, -B / 2);
  ctx.quadraticCurveTo(L * 0.75, -B * 0.55, L, -B * 1.6); // tip, curving up
  ctx.quadraticCurveTo(L * 0.55, B * 0.1, 0, B / 2);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -B, L * 0.6, B);
  g.addColorStop(0, light);
  g.addColorStop(0.5, mid);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,8,70,0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // highlight
  ctx.beginPath();
  ctx.moveTo(4, -B / 2 + 5);
  ctx.quadraticCurveTo(L * 0.6, -B * 0.5, L - 8, -B * 1.4);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

function drawCrystalCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, seed: number) {
  const rng = new Rng(seed);
  const cols = boardFrame.crystals.colors;
  const gems = 7;
  const items = Array.from({ length: gems }, (_, i) => {
    const a = (i / gems) * Math.PI * 2 + rng.range(-0.3, 0.3);
    const d = i === 0 ? 0 : radius * rng.range(0.35, 0.7);
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: radius * (i === 0 ? 0.55 : rng.range(0.3, 0.45)) };
  });
  items.sort((a, b) => a.y - b.y);
  for (const gem of items) {
    const sides = 7;
    const rot = rng.range(0, Math.PI);
    const pts: [number, number][] = [];
    for (let k = 0; k < sides; k++) {
      const a = rot + (k / sides) * Math.PI * 2;
      const rr = gem.r * rng.range(0.85, 1.05);
      pts.push([gem.x + Math.cos(a) * rr, gem.y + Math.sin(a) * rr]);
    }
    // body
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    const g = ctx.createRadialGradient(gem.x - gem.r * 0.35, gem.y - gem.r * 0.4, gem.r * 0.1, gem.x, gem.y, gem.r * 1.1);
    g.addColorStop(0, cols[0]);
    g.addColorStop(0.35, cols[1]);
    g.addColorStop(0.75, cols[2]);
    g.addColorStop(1, cols[3]);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = cols[4];
    ctx.lineWidth = 3;
    ctx.stroke();
    // facets
    ctx.beginPath();
    ctx.moveTo(gem.x - gem.r * 0.15, gem.y - gem.r * 0.1);
    for (let k = 0; k < 3; k++) ctx.lineTo(pts[(k * 2) % sides][0] * 0.55 + gem.x * 0.45, pts[(k * 2) % sides][1] * 0.55 + gem.y * 0.45);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(gem.x - gem.r * 0.35, gem.y - gem.r * 0.4, gem.r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fill();
  }
}

function makeLayer(pixelRatio: number) {
  const c = document.createElement('canvas');
  c.width = Math.round(stage.width * pixelRatio);
  c.height = Math.round(stage.height * pixelRatio);
  const ctx = c.getContext('2d')!;
  ctx.scale(pixelRatio, pixelRatio);
  return { c, ctx };
}

/** `under` is drawn before the tiles, `over` (corner crystals) after them. */
export function renderStaticDecor(pixelRatio: number): { under: HTMLCanvasElement; over: HTMLCanvasElement } {
  const { c, ctx } = makeLayer(pixelRatio);
  const { c: overCanvas, ctx: octx } = makeLayer(pixelRatio);

  // Background
  ctx.fillStyle = background.color;
  ctx.fillRect(0, 0, stage.width, stage.height);
  const hud = gameLayout.hud;
  const hg = ctx.createLinearGradient(0, 0, 0, hud.height);
  hg.addColorStop(0, background.hudBand);
  hg.addColorStop(1, background.color);
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, stage.width, hud.height);
  const vg = ctx.createRadialGradient(stage.width / 2, stage.height * 0.45, stage.width * 0.3, stage.width / 2, stage.height * 0.45, stage.width);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, background.vignette);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, stage.width, stage.height);

  const T = boardFrame.thickness;
  const bx = board.originX;
  const by = board.originY;
  const bw = board.cols * board.tileSize;
  const bh = board.rows * board.tileSize;
  const ox = bx - T;
  const oy = by - T;
  const ow = bw + T * 2;
  const oh = bh + T * 2;
  const col = boardFrame.colors;

  // Horns (behind the wall)
  const hornCount = boardFrame.horns.perSide;
  for (let i = 0; i < hornCount; i++) {
    const y = oy + oh * ((i + 0.7) / (hornCount + 0.4));
    drawHorn(ctx, ox + 6, y, -1);
    drawHorn(ctx, ox + ow - 6, y, 1);
  }

  // Wall shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, ox, oy, ow, oh, boardFrame.radius);
  ctx.fillStyle = col.outer;
  ctx.fill();
  ctx.restore();

  // Wall body
  roundRect(ctx, ox + 3, oy + 3, ow - 6, oh - 6, boardFrame.radius - 3);
  const wg = ctx.createLinearGradient(ox, oy, ox + ow, oy + oh);
  wg.addColorStop(0, col.faceLight);
  wg.addColorStop(0.35, col.face);
  wg.addColorStop(1, col.faceDark);
  ctx.fillStyle = wg;
  ctx.fill();
  // Top bevel line
  roundRect(ctx, ox + 7, oy + 6, ow - 14, oh - 12, boardFrame.radius - 6);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Board well
  ctx.fillStyle = '#1e1640';
  ctx.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
  // Light lip under the top wall (wall top face seen from above)
  ctx.fillStyle = col.lipShadow;
  ctx.fillRect(bx - 4, by - boardFrame.lipPx - 4, bw + 8, boardFrame.lipPx + 4);
  ctx.fillStyle = col.lip;
  ctx.fillRect(bx - 4, by - boardFrame.lipPx - 4, bw + 8, boardFrame.lipPx - 1);

  // Crystal clusters on the four corners
  const cr = boardFrame.crystals.clusterRadius;
  drawCrystalCluster(octx, ox + 8, oy + 18, cr * 0.8, 11);
  drawCrystalCluster(octx, ox + ow - 8, oy + 18, cr * 0.8, 23);
  drawCrystalCluster(octx, ox + 6, oy + oh - 10, cr, 37);
  drawCrystalCluster(octx, ox + ow - 6, oy + oh - 10, cr, 51);

  return { under: c, over: overCanvas };
}
