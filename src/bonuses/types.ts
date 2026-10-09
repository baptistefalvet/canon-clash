import type { Sim } from '../game/sim';

export interface BonusEntity {
  readonly owner: number;
  done: boolean;
  update(dt: number, sim: Sim): void;
  /** Drawn under bullets (ground units) or above everything (flying units). */
  readonly layer: 'ground' | 'air';
  draw(ctx: CanvasRenderingContext2D, sim: Sim): void;
}
