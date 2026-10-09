// Bonus factory: blackjack total → entity played automatically for that seat.

import { bonusByTotal, type BonusId } from '../../config/bonuses';
import type { Sim } from '../game/sim';
import { BombStrike } from './bombs';
import { Dragon } from './dragon';
import { Saw } from './saw';
import { Turret } from './turret';
import type { BonusEntity } from './types';
import { sfx } from '../audio/sfx';

export function bonusForTotal(total: number) {
  return bonusByTotal[total] ?? null;
}

export function spawnBonus(id: BonusId, owner: number, sim: Sim): BonusEntity {
  switch (id) {
    case 'saw':
      sfx.saw();
      return new Saw(owner, sim);
    case 'turret':
      sfx.turret();
      return new Turret(owner, sim);
    case 'bombs':
      sfx.whoosh();
      return new BombStrike(owner, sim);
    case 'dragon':
      sfx.dragon();
      return new Dragon(owner, sim);
  }
}
