// Money is always stored as an integer number of cents.

export const economy = {
  startingPurseCents: 2000,
  betCents: 100,
  // Prize paid to the match winner (largest territory), picked by the winner's final territory share.
  // First matching tier wins (sorted from highest share to lowest).
  winnerPrizeTiers: [
    { minShare: 0.5, prizeCents: 800, label: 'DOMINATION !' },
    { minShare: 0.4, prizeCents: 400, label: 'GRANDE VICTOIRE !' },
    { minShare: 0, prizeCents: 200, label: 'VICTOIRE !' },
  ],
  // Displayed on Title/BetMenu (« GAGNEZ JUSQU'À »)
  advertisedMaxCents: 800,
};
