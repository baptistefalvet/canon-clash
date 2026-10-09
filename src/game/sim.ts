// Shared simulation context handed to every gameplay system (cannons, bullets, bonuses).

import type { Grid } from '../board/grid';
import type { TeamPalette } from '../board/palette';
import type { Particles } from '../fx/particles';
import type { Rng } from '../util/rng';
import type { Bullets } from '../bullets/bullets';
import type { Cannon } from '../cannon/cannon';

export interface Sim {
  grid: Grid;
  rng: Rng;
  palettes: TeamPalette[];
  particles: Particles;
  bullets: Bullets;
  cannons: Cannon[];
  humanSeat: number;
  /** Seconds since the match started (cannons firing). */
  time: number;
  shake(amount: number): void;
}

/** The opponent the bonuses should hurt most: the current leader among the other seats. */
export function strongestOpponent(sim: Sim, seat: number): number {
  let best = -1;
  for (let s = 0; s < sim.grid.counts.length; s++) {
    if (s === seat) continue;
    if (best < 0 || sim.grid.counts[s] > sim.grid.counts[best]) best = s;
  }
  return best;
}
