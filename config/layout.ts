// Design frame and screen regions, in design pixels (1080 × 1920 portrait frame).

export const stage = {
  width: 1080,
  height: 1920,
  // 'contain' fits the whole frame (letterbox); on phones narrower than 9:16 this equals "match width".
  fit: 'contain' as 'contain' | 'width',
  letterboxColor: '#0a0510',
};

export const screenTransition = {
  introMs: 380,
  outroMs: 260,
};

// Game screen regions — HUD layout C: compact top HUD, edge-to-edge board, bottom drawer.
// The top-right corner (x ≥ 811, y < 234) stays free for the FDJ purse overlay.
export const gameLayout = {
  hud: {
    height: 244,
    avatar: { left: 28, top: 38, size: 84 },
    name: { left: 132, top: 38, fontSize: 42 },
    rank: { left: 132, top: 92, fontSize: 32, ofFontSize: 24, trophySize: 34, gap: 6 },
    timer: { left: 520, top: 38, width: 220, height: 84, fontSize: 56 },
    // 4-color territory bar, every share labelled
    shareBar: { left: 28, top: 152, width: 752, height: 62, fontSize: 26, humanFontSize: 34, minLabelShare: 0.07 },
  },
  // Round announce toast, over the top of the board (the drawer covers the bottom during a deal)
  toastTop: 420,
  drawer: {
    closedTop: 1510, // collapsed: only the next-round bar + the gauge legend show
    openTop: 1080, // open during a round: slides over the bottom of the board
    height: 840,
    radius: 44,
    slideMs: 420,
    contentFadeMs: 220,
    // collapsed content (relative to the drawer top)
    bar: { left: 26, top: 26, width: 1028, height: 92, barHeight: 68, badgeSize: 108, badgeFontSize: 50, fontSize: 34 },
    // gauge legend (« fill the gauge → special shot »): the same gauge as in the round, read-only
    legend: { left: 26, width: 1028, captionTop: 134, captionFontSize: 28, top: 176, headerHeight: 132, barHeight: 58, artSize: 84, nameFontSize: 28 },
    // open content (relative to the drawer top)
    handle: { top: 16, width: 100, height: 10 },
    prompt: { left: 40, top: 40, width: 1000, height: 58, fontSize: 32 },
    rivals: { left: 40, top: 116, width: 1000, height: 80, gap: 16, fontSize: 22, cellHeight: 16 },
    // powder cards: the deck on the left, the drawn cards + the level badge centered in [areaLeft, areaRight]
    cards: { top: 218, height: 170, cardScale: 1, deckLeft: 48, deckLabelFontSize: 24, areaLeft: 360, areaRight: 1040, levelSize: 150, levelGap: 26 },
    gauge: { left: 40, width: 1000, top: 402, headerHeight: 112, barHeight: 112, artSize: 70, nameFontSize: 26 },
    actions: { left: 40, top: 664, width: 1000, height: 148, gap: 32, titleFontSize: 60, subFontSize: 28 },
    // CHARGER / FEU ! are replaced by the round's result once it is resolved
    result: { titleFontSize: 66, subFontSize: 38 },
  },
};

// Power gauge geometry: cells are weighted so the shot zones are wide enough to carry their icon.
export const gaugeShape = {
  lowCellWeight: 1, // levels below the first zone
  zoneCellWeight: 2.6,
  jamCellWeight: 1.9, // the red « over the cap » cell at the end
  cellGap: 6,
  trackPad: 7, // dark track around the cells
  radius: 16,
  numberFontSize: 24,
};
