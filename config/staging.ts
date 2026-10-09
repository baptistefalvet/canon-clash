// Bottom drawer staging: what is highlighted, hidden or animated depending on what the player is asked to do.

export const staging = {
  readySec: 3, // last seconds before a charge round: « PRÉPAREZ-VOUS ! » state (bar glows)
  urgentDecisionK: 0.35, // share of decision time left below which the timer turns red / « VITE ! »
  // CHARGER / FEU ! buttons pop in once the player can act
  buttonPopMs: 320,
  buttonStaggerMs: 90,
  // Cards fly in from above the drawer, starting at this scale
  dealFromDeckScale: 0.62,
  // Prompt / result text swap animation
  hintPopMs: 360,
  // Rival chips fade when the rival is out of the round (jammed / too weak)
  rivalOutOpacity: 0.6,
  // Gauge: zone headers the current level does not give, during a round
  zoneDimOpacity: 0.5,
  // The zone reached grows a little
  zoneTargetScale: 1.1,
  // Gauge cells fill one after the other, like powder being poured
  cellPourMs: 70,
  // Risk shown on CHARGER: at or above this share the label turns red
  highRisk: 0.5,
};

export const stagingCopy = {
  barNextRound: 'PROCHAINE CHARGE',
  barReady: 'PRÉPAREZ-VOUS !',
  barJammed: 'CANON ENRAYÉ',
  legendCaption: 'REMPLISSEZ LA JAUGE  →  TIR SPÉCIAL',
  barLastStretch: 'FIN DE LA PARTIE',
  roundCounter: 'CHARGE', // « PROCHAINE CHARGE · 3/5 »
  promptDealing: 'CHARGEMENT…',
  promptBelowZone: 'CHARGEZ JUSQU’À UNE ZONE DE TIR !',
  promptInZone: 'FEU ! … OU ENCORE UNE CHARGE ?',
  promptUrgent: 'VITE !',
  promptWaitRivals: 'LES AUTRES CHARGENT…',
  promptResults: 'RÉSULTATS',
  loadTitle: 'CHARGER',
  loadSafe: 'sans risque',
  loadRisk: 'risque', // « risque 25 % »
  fireTitle: 'FEU !',
  fireNone: 'trop faible',
  deckLabel: 'par carte', // « +1 à +4 par carte »
  zoneNone: 'PAS DE TIR',
  zoneJam: 'ENRAYÉ',
  zoneTag: 'TIR PRÊT',
  rivalCharging: 'charge…',
  rivalJammed: 'ENRAYÉ',
  rivalWeak: 'RATÉ',
  resultFull: 'JAUGE PLEINE !',
  resultReady: 'prêt à tirer !',
  resultJam: 'ENRAYÉ !',
  resultJamSub: 'Votre canon est bloqué', // « … 4 s »
  resultWeak: 'TROP FAIBLE !',
  resultWeakSub: 'Il fallait atteindre', // « … 7 »
};
