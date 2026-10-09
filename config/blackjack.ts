// Blackjack mini-round played by all 4 players at the same time, bottom of the screen.

export const blackjack = {
  target: 21,
  minBonusTotal: 18, // below → no bonus
  initialCards: 2,
  dealIntervalSec: 0.3, // delay between dealt cards
  decisionTimeSec: 7, // the human auto-stands when this runs out
  resultHoldSec: 1.6, // results visible before bonuses deploy
  // Bots: delay between two actions, and the total they stand on (picked per bot per match)
  botActionDelaySec: [0.8, 1.6] as [number, number],
  botStandOnChoices: [18, 18, 19, 19, 20] as number[],
  // Card values
  faceValue: 10,
  aceHigh: 11,
  aceLow: 1,
};

export const cardVisual = {
  width: 112,
  height: 156,
  overlap: 64, // horizontal step between cards of the same hand
  radius: 14,
  dealFlightMs: 260,
};
