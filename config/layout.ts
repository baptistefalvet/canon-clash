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
    closedTop: 1510, // collapsed: only the next-deal gauge + the bonus table show
    openTop: 1080, // open during a deal: slides over the bottom of the board
    height: 840,
    radius: 44,
    slideMs: 420,
    contentFadeMs: 220,
    // collapsed content (relative to the drawer top)
    gauge: { left: 26, top: 26, width: 1028, height: 92, barHeight: 68, badgeSize: 108, badgeFontSize: 50, fontSize: 34 },
    // bonus table (« hand total → bonus »): flat read-only tiles, not buttons
    legend: {
      left: 26,
      width: 1028,
      captionTop: 134,
      captionFontSize: 28,
      top: 182,
      height: 200,
      gap: 16,
      radius: 22,
      artSize: 104,
      nameFontSize: 30,
      // the total is shown on a mini playing card so it reads as a hand total
      card: { width: 62, height: 86, radius: 10, fontSize: 44, tiltDeg: -6 },
    },
    // open content (relative to the drawer top)
    handle: { top: 16, width: 100, height: 10 },
    prompt: { left: 40, top: 44, width: 1000, height: 58, fontSize: 32 },
    rivals: { left: 40, top: 126, width: 1000, height: 56, gap: 16, fontSize: 22 },
    hand: { top: 222, height: 250, cardScale: 1.5, totalSize: 160, gap: 30 },
    // cards fly in from above the drawer (the board side), in drawer coordinates
    dealFrom: { x: 540, y: -160 },
    chips: { left: 40, top: 500, width: 1000, height: 110, gap: 16, artSize: 64, totalFontSize: 38, nameFontSize: 24 },
    actions: { left: 40, top: 650, width: 1000, height: 148, gap: 32, titleFontSize: 60, subFontSize: 26 },
    // HIT / STAND are replaced by the hand's result once it is resolved
    result: { titleFontSize: 64, subFontSize: 38 },
  },
};
