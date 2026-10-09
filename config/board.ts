// Territory grid. Coordinates in design pixels.

export const board = {
  cols: 24,
  rows: 28,
  // Edge-to-edge board (HUD layout C): 24 × 44 = 1056 px wide, 28 × 44 = 1232 px tall
  tileSize: 44,
  originX: 12,
  originY: 258,
  groutPx: 2.2, // dark line between tiles
  shadeVariance: 0.055, // per-tile brightness jitter (Color Clash look)
  shadeLevels: 6,
  edgeShadowPx: 16, // soft inner shadow under the frame walls
  // Capture "pop": the tile jumps up as a 3D block then settles
  pop: {
    durationSec: 0.42,
    heightPx: 12,
    scale: 1.12,
  },
};

export const boardFrame = {
  thickness: 12, // thin wall: the board runs edge to edge
  radius: 10,
  lipPx: 7, // light top lip on the inner edge
  colors: {
    outer: '#3c1784',
    face: '#6a2bd0',
    faceLight: '#9e5cf6',
    faceDark: '#5e2fa6',
    lip: '#e9e2ff',
    lipShadow: '#8e86a8',
    innerShadow: 'rgba(20,10,50,0.55)',
  },
  horns: {
    perSide: 0, // no room for horns beside an edge-to-edge board
    length: 70,
    baseWidth: 30,
    colors: ['#b07cff', '#7c3fe0', '#4c1fa3'],
  },
  crystals: {
    clusterRadius: 44,
    colors: ['#e2b6ff', '#c27cff', '#a14cf2', '#7a2ad6', '#5a1aa8'],
  },
};

export const background = {
  color: '#302653',
  hudBand: '#231c3f',
  vignette: 'rgba(5,2,15,0.55)',
};
