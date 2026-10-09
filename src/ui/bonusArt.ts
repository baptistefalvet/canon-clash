// Bonus card artwork, rendered once with the in-game sprite code so cards and board always match.

import type { BonusId } from '../../config/bonuses';
import { buildPalette } from '../board/palette';
import { drawBombSprite } from '../bonuses/bombs';
import { drawDragon } from '../bonuses/dragon';
import { drawSawBlade } from '../bonuses/saw';
import { drawTurretSprite } from '../bonuses/turret';
import type { teams } from '../../config/players';

const SIZE = 220;
const cache = new Map<string, string>();

export function bonusArt(id: BonusId, team: keyof typeof teams = 'blue'): string {
  const key = `${id}-${team}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext('2d')!;
  const p = buildPalette(team);
  const m = SIZE / 2;
  switch (id) {
    case 'saw':
      drawSawBlade(ctx, m, m, 82, 0.3, p.light, p.tile, p.outline);
      break;
    case 'turret':
      ctx.save();
      ctx.translate(m - 10, m + 10);
      ctx.scale(1.55, 1.55);
      drawTurretSprite(ctx, 0, 0, 1, -0.5, 0.6, p);
      ctx.restore();
      break;
    case 'bombs':
      drawBombSprite(ctx, m + 34, m - 2, 40, p.tile, 0);
      drawBombSprite(ctx, m - 30, m + 30, 52, p.tile, 0.4);
      break;
    case 'dragon': {
      const segs = Array.from({ length: 9 }, (_, i) => ({
        x: m + 52 - i * 15,
        y: m - 24 + i * 12 + Math.sin(i * 0.9) * 14,
      }));
      ctx.save();
      ctx.translate(0, 26);
      drawDragon(ctx, segs, -0.6, 0.15, p, 0.95, false);
      ctx.restore();
      break;
    }
  }
  const url = c.toDataURL('image/png');
  cache.set(key, url);
  return url;
}
