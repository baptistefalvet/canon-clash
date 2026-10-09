// Blurred in-game scene used behind every shell screen (title, rules, menus, results).

import { useMemo } from 'react';
import { seats } from '../../config/players';
import { board } from '../../config/board';
import { stage } from '../../config/layout';
import { Grid } from '../board/grid';
import { buildPalette } from '../board/palette';
import { renderStaticDecor } from '../board/frame';
import { drawTiles } from '../board/render';
import { Cannon } from '../cannon/cannon';
import { Rng } from '../util/rng';
import { Fireflies } from './Fireflies';

let cached: string | null = null;

/** A plausible mid-game board: organic borders between the 4 colors. */
export function renderScene(pixelRatio: number, seed = 7): HTMLCanvasElement {
  const rng = new Rng(seed);
  const grid = new Grid(
    seats.map((s) => s.corner),
    rng,
    board.shadeLevels,
  );
  const palettes = seats.map((s) => buildPalette(s.team));
  const centers = seats.map((s) => ({
    x: (s.corner[1] === 'L' ? 0.3 : 0.7) * grid.cols + rng.range(-3, 3),
    y: (s.corner[0] === 'T' ? 0.3 : 0.7) * grid.rows + rng.range(-3, 3),
  }));
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const n = Math.sin(c * 0.7 + r * 0.3) * 1.6 + Math.cos(r * 0.9 - c * 0.4) * 1.4 + rng.range(-0.6, 0.6);
      let best = 0;
      let bestD = Infinity;
      centers.forEach((p, s) => {
        const d = Math.hypot(c - p.x, r - p.y) + (s === 0 ? -1.5 : 0) + n * (s % 2 ? 1 : -1);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      });
      grid.owner[grid.index(c, r)] = best;
    }
  }
  const { under, over } = renderStaticDecor(pixelRatio);
  const canvas = document.createElement('canvas');
  canvas.width = under.width;
  canvas.height = under.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(under, 0, 0);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawTiles(ctx, grid, palettes);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(over, 0, 0);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  seats.forEach((s, i) => {
    const cannon = new Cannon(i, s.corner, grid, 0);
    cannon.draw(ctx, palettes[i]);
  });
  return canvas;
}

function sceneUrl() {
  if (!cached) cached = renderScene(0.5).toDataURL('image/jpeg', 0.85);
  return cached;
}

export function Backdrop({ dim = 0.55, fireflies = true }: { dim?: number; fireflies?: boolean }) {
  const url = useMemo(sceneUrl, []);
  return (
    <div className="layer" style={{ overflow: 'hidden' }}>
      <img
        src={url}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: -60,
          top: -60,
          width: stage.width + 120,
          height: stage.height + 120,
          filter: 'blur(18px) saturate(1.15)',
        }}
      />
      <div
        className="layer"
        style={{
          background: `radial-gradient(ellipse at 50% 35%, rgba(20,8,45,${dim * 0.55}) 0%, rgba(10,5,22,${dim}) 60%, rgba(5,2,12,${Math.min(1, dim + 0.3)}) 100%)`,
        }}
      />
      {fireflies && <Fireflies />}
    </div>
  );
}
