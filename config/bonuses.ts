// Special shots, unlocked by the charge level reached when the player hits FEU !
// Every shot leaves from the player's cannon.

export type BonusId = 'saw' | 'gatling' | 'bombs' | 'dragon';

export interface BonusInfo {
  id: BonusId;
  level: number;
  name: string;
  description: string;
  /** Zone color on the gauge. */
  color: string;
  /** Darker shade for outlines / the zone's 3D edge. */
  dark: string;
}

export const bonusByLevel: Record<number, BonusInfo> = {
  7: { id: 'saw', level: 7, name: 'Scie', description: 'Le canon tire une scie géante qui rebondit chez l’ennemi.', color: '#6be04a', dark: '#2a8a1e' },
  8: { id: 'gatling', level: 8, name: 'Mitraille', description: 'Le canon passe en tir rapide pendant quelques secondes.', color: '#33c3ff', dark: '#1475b8' },
  9: { id: 'bombs', level: 9, name: 'Obus', description: 'Une salve d’obus s’abat sur vos adversaires.', color: '#b07cff', dark: '#6232c0' },
  10: { id: 'dragon', level: 10, name: 'Dragon', description: 'Un boulet de feu géant se change en dragon !', color: '#ffc631', dark: '#b06e05' },
};

export const saw = {
  durationSec: 5,
  speed: 360,
  radiusTiles: 1.2,
  visualRadius: 46,
  spinPerSec: 14,
  maxBounces: 6,
};

// Mitraille: the cannon itself fires a fast, spread stream at the nearest enemy land.
export const gatling = {
  durationSec: 7,
  fireIntervalSec: 0.085,
  spreadDeg: 30,
  aimRetargetSec: 0.7,
  aimTurnPerSec: 4,
  bulletSpeed: 820,
  spinUpSec: 0.35, // barrels spin up before the first bullet
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
  // Leaves the barrel as a fireball, then unfolds into the dragon
  fireballSec: 0.45,
  fireballSpeed: 520,
  fireballRadius: 34,
};

export const bonusAnnounce = {
  bannerSec: 1.3, // « DRAGON ! » banner over the board for the human's shot
};
