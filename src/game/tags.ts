// Name plates beside each cannon (the live charge gauge is the ring drawn around the cannon itself).

import { fx } from '../../config/fx';
import { TAU } from '../util/math';
import type { Match } from './match';

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
}

function outlinedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, fill: string) {
  ctx.font = `${size}px 'Lilita One'`;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.24;
  ctx.strokeStyle = '#1b1430';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

export function drawSeatTags(ctx: CanvasRenderingContext2D, m: Match) {
  const t = fx.nameTag;
  for (const s of m.seats) {
    const c = m.cannons[s.seat];
    const left = s.corner[1] === 'L';
    const top = s.corner[0] === 'T';
    const y = top ? c.y - t.offsetY : c.y + t.offsetY;
    ctx.font = `${t.fontSize}px 'Lilita One'`;
    const label = s.name;
    const textW = ctx.measureText(label).width;
    const dot = t.height - 10;
    const w = t.padX * 2 + dot + 8 + textW;
    const x = left ? c.x + t.offsetX : c.x - t.offsetX - w;

    pill(ctx, x, y - t.height / 2, w, t.height);
    ctx.fillStyle = 'rgba(27,20,48,0.9)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = s.palette.tile;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + t.padX + dot / 2 - 4, y, dot / 2, 0, TAU);
    ctx.fillStyle = s.palette.tile;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.textAlign = 'left';
    outlinedText(ctx, label, x + t.padX + dot + 4, y + 1, t.fontSize, '#ffffff');
  }
}
