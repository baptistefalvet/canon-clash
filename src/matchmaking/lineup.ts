// Random opponent profiles for the simulated matchmaking: seagull avatars + generated pseudos.

import { humanName, seats } from '../../config/players';
import type { PlayerProfile } from '../app/store';
import { randomAvatarSeed } from '../avatar/seagull';
import { randomPseudos } from './pseudo';

// The player keeps the same seagull for the whole session
const humanAvatar = randomAvatarSeed();

export function randomLineup(): PlayerProfile[] {
  const names = randomPseudos(seats.length - 1);
  return seats.map((_, i) =>
    i === 0
      ? { name: humanName, avatar: humanAvatar, isHuman: true }
      : { name: names[i - 1], avatar: randomAvatarSeed(), isHuman: false },
  );
}
