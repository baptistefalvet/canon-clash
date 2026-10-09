// End of match: standings, prize tier, purse credit and navigation to Win / Lose.

import { economy } from '../../config/economy';
import { credit, navigate, setResult, type MatchResult, type MatchStanding } from '../app/store';
import type { Match } from './match';

export function computeResult(m: Match): MatchResult {
  const shares = m.shares();
  const ranks = m.ranks();
  const standings: MatchStanding[] = m.seats
    .map((s) => ({ seat: s.seat, name: s.name, avatar: s.avatar, isHuman: s.isHuman, share: shares[s.seat], rank: ranks[s.seat] }))
    .sort((a, b) => a.rank - b.rank || (a.isHuman ? -1 : 1));
  const human = standings.find((s) => s.isHuman)!;
  const won = human.rank === 1;
  const tier = economy.winnerPrizeTiers.find((t) => human.share >= t.minShare)!;
  return { won, prizeCents: won ? tier.prizeCents : 0, prizeLabel: won ? tier.label : '', standings };
}

/** The prize is credited as the Win screen is entered. */
export function finishMatch(result: MatchResult) {
  setResult(result);
  if (result.won) {
    credit(result.prizeCents);
    navigate('Win');
  } else {
    navigate('Lose');
  }
}
