// Per-seat color palette, derived once from the team colors.

import { board } from '../../config/board';
import { teams, type TeamColors } from '../../config/players';
import { mix, shade } from '../util/color';

export interface TeamPalette extends TeamColors {
  key: keyof typeof teams;
  shades: string[]; // tile fill variants for the per-tile jitter
}

export function buildPalette(key: keyof typeof teams): TeamPalette {
  const t = teams[key];
  const n = board.shadeLevels;
  const shades: string[] = [];
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1); // 0..1
    const base = mix(t.tileAlt, t.tile, k);
    shades.push(shade(base, (k - 0.5) * board.shadeVariance));
  }
  return { ...t, key, shades };
}
