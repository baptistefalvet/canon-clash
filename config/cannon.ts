// Basic corner cannon. Its angle sweeps the player's quarter sinusoidally.

export const cannon = {
  insetTiles: 1.35, // pivot distance from the board corner, in tiles
  sweepPeriodSec: 4.6,
  sweepAmplitudeDeg: 41, // ± around the corner diagonal (45° = full quarter)
  fireIntervalSec: 0.28,
  muzzleLength: 54,
  recoilPx: 9,
  recoilRecoverSec: 0.12,
  visual: {
    baseSize: 74,
    baseDepth: 12,
    headRadius: 29,
    barrelWidth: 24,
    barrelLength: 56,
  },
  // Segmented charge ring drawn around the cannon during a charge round (one segment per level)
  chargeRing: {
    radius: 52,
    width: 11,
    arcDeg: 300, // open at the side facing the board edge
    gapDeg: 4,
    emptyColor: 'rgba(20,12,40,0.55)',
    lowColor: '#ffffff', // levels below the first zone
    jamColor: '#ff3b52',
  },
  // Aim blend when a special shot (Mitraille) takes over the barrel
  aimBlendSec: 0.25,
  gatlingBarrelLength: 66,
};

export const bullet = {
  speed: 760,
  radius: 11,
  trailLength: 0.035, // seconds of travel drawn as a fading streak
  maxBounces: 2,
  lifetimeSec: 4,
  substepPx: 10,
  shadowOffsetY: 7,
};
