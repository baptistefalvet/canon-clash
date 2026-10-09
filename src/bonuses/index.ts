// Special-shot factory: charge level → entity fired from that seat's cannon.

import { bonusByLevel, type BonusId } from '../../config/bonuses';
import type { Sim } from '../game/sim';
import { BombStrike } from './bombs';
import { Dragon } from './dragon';
import { Gatling } from './gatling';
import { Saw } from './saw';
import type { BonusEntity } from './types';
import { sfx } from '../audio/sfx';

export function bonusForLevel(level: number) {
  return bonusByLevel[level] ?? null;
}

export function spawnBonus(id: BonusId, owner: number, sim: Sim): BonusEntity {
  switch (id) {
    case 'saw':
      sfx.saw();
      return new Saw(owner, sim);
    case 'gatling':
      sfx.gatling();
      return new Gatling(owner, sim);
    case 'bombs':
      sfx.whoosh();
      return new BombStrike(owner, sim);
    case 'dragon':
      sfx.dragon();
      return new Dragon(owner, sim);
  }
}
