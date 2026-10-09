// Shell flow timings and links.

export const flow = {
  initialScreen: 'TitleScreen' as const,
  titleAutoAdvanceMs: 2500,
  regulationsUrl: '', // « Règlement de ce jeu » — URL to be provided by FDJ
  // Debug WIN/LOSE buttons on the Game screen + ?screen= deep links. Also enabled by ?dev=1.
  devMode: false,
};

export const matchmaking = {
  // Delay before each opponent slot is filled (ms, cumulative)
  slotFillDelaysMs: [900, 1700, 2600],
  // Pause on « C'EST PARTI ! » before entering the game
  readyHoldMs: 1100,
};

export const fireflies = {
  count: 26,
  minSize: 4,
  maxSize: 11,
  minDurationSec: 6,
  maxDurationSec: 14,
};

export const resultScreens = {
  revealDelayMs: 900, // pause before the prize amount appears
  countUpMs: 900,
  confettiCount: 70,
};
