// Visual effects tuning.

export const fx = {
  capture: { debrisPerTile: 2, debrisLifeSec: 0.45, debrisSize: 7, gravity: 1400 },
  explosion: { ringLifeSec: 0.5, debris: 18, flashLifeSec: 0.18, shake: 9 },
  muzzleFlashSec: 0.07,
  shakeDecayPerSec: 6,
  maxParticles: 900,
  // Name tags drawn beside each cannon, on the board (the edge-to-edge board has no wall room).
  // offsetY pushes the tag toward the board edge, out of the barrel's sweep.
  nameTag: { fontSize: 26, padX: 14, height: 40, offsetX: 46, offsetY: 30 },
};
