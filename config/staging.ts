// Bottom drawer staging: what is highlighted, hidden or animated depending on what the player is asked to do.

export const staging = {
  readySec: 3, // last seconds before a deal: « LES CARTES ARRIVENT ! » state (gauge glows, drawer handle bounces)
  urgentDecisionK: 0.35, // share of decision time left below which the timer turns red / « VITE ! »
  // HIT / STAND buttons pop in once the player can act
  buttonPopMs: 320,
  buttonStaggerMs: 90,
  // Cards fly in from above the drawer, starting at this scale
  dealFromDeckScale: 0.62,
  // Prompt / result text swap animation
  hintPopMs: 360,
  // Rival chips fade when the rival is out of the deal (bust / missed)
  rivalOutOpacity: 0.6,
  // Bonus chips that the current hand cannot give
  chipDimOpacity: 0.45,
  // The reachable bonus chip grows a little
  chipTargetScale: 1.06,
};

export const stagingCopy = {
  targetTag: 'SI VOUS RESTEZ',
  barNextDeal: 'PROCHAINE DONNE',
  barReady: 'LES CARTES ARRIVENT !',
  legendCaption: 'TOTAL DE VOTRE MAIN  →  BONUS',
  barLastStretch: 'FIN DE LA PARTIE',
  dealCounter: 'DONNE', // « PROCHAINE DONNE · 3/5 »
  promptDealing: 'DISTRIBUTION…',
  promptDecide: 'À VOUS DE JOUER !',
  promptUrgent: 'VITE !',
  promptWaitRivals: 'LES AUTRES JOUENT…',
  promptResults: 'RÉSULTATS',
  hitTitle: 'CARTE',
  hitSafe: '+ 1 carte',
  hitRisky: 'risqué !',
  standTitle: 'RESTER',
  standNoBonus: 'pas de bonus',
  rivalPlaying: 'joue…',
  rivalStood: 'RESTE',
  rivalBust: 'SAUTÉ',
  rivalMissed: 'RATÉ',
  resultBlackjack: 'BLACKJACK !',
  resultUnlocked: 'débloqué',
  resultBust: 'SAUTÉ !',
  resultMissed: 'RATÉ !',
};
