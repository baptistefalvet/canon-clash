// Bonus unlocked by the blackjack total. Played automatically right after the deal.

export type BonusId = 'saw' | 'turret' | 'bombs' | 'dragon';

export interface BonusInfo {
  id: BonusId;
  total: number;
  name: string;
  description: string;
}

export const bonusByTotal: Record<number, BonusInfo> = {
  18: { id: 'saw', total: 18, name: 'Scie', description: 'Une scie géante découpe le territoire ennemi.' },
  19: { id: 'turret', total: 19, name: 'Tourelle', description: 'Une mitrailleuse se pose sur ta frontière.' },
  20: { id: 'bombs', total: 20, name: 'Bombes', description: 'Une pluie de bombes s’abat sur tes adversaires.' },
  21: { id: 'dragon', total: 21, name: 'Dragon', description: 'Le dragon ravage tout sur son passage !' },
};

export const saw = {
  durationSec: 5,
  speed: 360,
  radiusTiles: 1.2,
  visualRadius: 46,
  spinPerSec: 14,
  maxBounces: 6,
};

export const turret = {
  durationSec: 7,
  fireIntervalSec: 0.085,
  spreadDeg: 34,
  aimRetargetSec: 0.7,
  bulletSpeed: 820,
  dropInSec: 0.45,
};

export const bombs = {
  count: 7,
  radiusTiles: 2.25,
  flightSec: 0.85,
  staggerSec: 0.22,
  arcHeightPx: 260,
  minSpacingTiles: 3.5,
};

export const dragon = {
  durationSec: 9,
  speed: 330,
  turnRateDeg: 170,
  radiusTiles: 1.95,
  segments: 11,
  segmentSpacing: 24,
  retargetSec: 0.75,
  scale: 1,
};

export const bonusAnnounce = {
  bannerSec: 1.3, // « DRAGON ! » banner over the board for the human's bonus
  cardFlySec: 0.55,
};
