// Name plates beside each cannon, plus (optional) the live blackjack bubble of each opponent.

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

    // Opponent blackjack bubble
    const round = m.round;
    if (!t.handBubble || !round || s.isHuman) continue;
    const h = round.hands[s.seat];
    if (!h.cards.length) continue;
    const resolved = h.status !== 'playing';
    const out = round.outcome(s.seat);
    let text = String(h.total);
    let bg = '#ffffff';
    let fg = '#1b1430';
    if (resolved && round.phase !== 'dealing') {
      if (out !== null) {
        bg = '#52e04c';
        fg = '#ffffff';
      } else {
        bg = '#fb586c';
        fg = '#ffffff';
        text = `${h.total} Raté`;
      }
    }
    ctx.font = `${t.fontSize}px 'Lilita One'`;
    const bw = Math.max(t.height * 1.6, ctx.measureText(text).width + 50);
    const bx = left ? x + w + 10 : x - 10 - bw;
    const by = y - t.height / 2;
    pill(ctx, bx, by, bw, t.height);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1b1430';
    ctx.stroke();
    // mini card icon
    ctx.save();
    ctx.translate(bx + 18, y);
    ctx.rotate(-0.15);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1b1430';
    ctx.lineWidth = 2;
    ctx.fillRect(-8, -11, 16, 22);
    ctx.strokeRect(-8, -11, 16, 22);
    ctx.fillStyle = '#e22e41';
    ctx.fillRect(-4, -6, 8, 12);
    ctx.restore();
    ctx.textAlign = 'left';
    if (fg === '#ffffff') outlinedText(ctx, text, bx + 34, y + 1, t.fontSize, fg);
    else {
      ctx.font = `${t.fontSize}px 'Lilita One'`;
      ctx.fillStyle = fg;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bx + 34, y + 1);
    }
  }
}
