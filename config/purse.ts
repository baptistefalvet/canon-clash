// FDJ mandatory top-right purse + settings button.
// Measured from the FDJ reference capture (715 px wide) and converted to the 1080 design frame (×1.5105).
// Do not tweak these values: the FDJ chart requires them pixel-exact.

export const purseOverlay = {
  pill: {
    right: 29,
    top: 38,
    width: 240,
    height: 84,
    background: '#D2D0D4',
    textColor: '#08050C',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize: 40,
    letterSpacing: -0.5,
    // Gap between amount and "€" (narrow space in the reference)
    currencyGap: 7,
    currencyScaleX: 0.82, // the reference « € » is narrower than Montserrat's
    // The reference shows « 20 € »: whole amounts drop « ,00 »
    hideZeroCents: true,
  },
  settings: {
    right: 29,
    top: 151,
    size: 83,
    background: '#D2D0D4',
    iconColor: '#08050C',
    // Gear: 6 teeth, centered slightly left/down of the button center
    gear: {
      offsetX: -8,
      offsetY: 3.5,
      outerRadius: 21,
      bodyRadius: 15.5,
      holeRadius: 5.6,
      teeth: 6,
      toothWidth: 11,
    },
    // Superscript question mark, top-right of the gear
    question: {
      left: 52,
      top: 8,
      fontSize: 35,
      fontWeight: 700,
      outlineColor: '#D2D0D4',
      outlineWidth: 4,
    },
  },
};
