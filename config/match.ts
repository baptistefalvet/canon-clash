// Round structure: a match lasts `durationSec`; a cannon charge round happens every `roundIntervalSec`.

export const match = {
  durationSec: 90,
  chargeRounds: 5,
  firstRoundAtSec: 7,
  roundIntervalSec: 16,
  countdownSec: 3, // « 3, 2, 1, GO » before the cannons start
  endBannerSec: 2.6, // « TEMPS ÉCOULÉ » + ranking before leaving the Game screen
  timeScale: 1, // global simulation speed (debug)
};
