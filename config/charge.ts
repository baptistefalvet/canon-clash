// Cannon charge round played by all 4 players at the same time, in the bottom drawer.
// Each card adds powder to the gauge. FEU ! fires the special shot of the zone reached; past `cap` the cannon jams.

export const charge = {
  cap: 10, // last safe level (Dragon zone); one more and the cannon jams
  minZone: 7, // first level that gives a special shot (below → no shot)
  // Powder cards, drawn from an infinite shoe: repeat a value to make it more likely.
  // With 1–4, every card past the first zone is a clean 25 / 50 / 75 % risk.
  deck: [1, 2, 3, 4] as number[],
  initialCards: 2,
  dealIntervalSec: 0.3, // delay between dealt cards
  decisionTimeSec: 7, // when this runs out the human fires automatically
  resultHoldSec: 1.6, // results visible before the shots
  // Bots: delay between two actions, and the level they fire at (picked per bot per match)
  botActionDelaySec: [0.8, 1.6] as [number, number],
  botFireAtChoices: [7, 8, 8, 9, 9] as number[],
};

// Overloaded cannon: stops painting for a while, smoking.
export const jam = {
  durationSec: 4,
  smokeEverySec: 0.12,
};

// When the shots go off once the round is over: the human first (alone, so it reads), then the rivals one by one.
export const shotTiming = {
  humanDelaySec: 0.55,
  rivalsDelaySec: 1.1,
  rivalStaggerSec: 0.35,
  blastRecoilPx: 26,
  blastShake: 10,
};

export const cardVisual = {
  width: 112,
  height: 156,
  spread: 124, // horizontal step between cards of the same hand (shrinks when the hand gets long)
  radius: 14,
  dealFlightMs: 260,
};
