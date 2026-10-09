// Seagull profile pictures: every trait is drawn at random from these lists (see src/avatar).

export const seagullTraits = {
  eyes: ['gull', 'derp', 'angry', 'sleepy', 'crazy', 'happy'],
  beaks: ['closed', 'squawk', 'fry', 'tongue'],
  hats: ['none', 'tuft', 'sailor', 'bandana', 'party', 'captain', 'beanie', 'crown', 'propeller'],
  faceGear: ['sunglasses', 'eyepatch', 'monocle'],
  neckGear: ['bowtie', 'scarf', 'chain'],
} as const;

export const seagullOdds = {
  faceGear: 0.3, // chance to wear something on the face
  neckGear: 0.35, // chance to wear something around the neck
  mirrored: 0.5, // chance to look left instead of right
};

/** Random head tilt, in degrees (±). */
export const seagullTiltDeg = 9;

export const seagullColors = {
  outline: '#1b1430',
  feather: ['#ffffff', '#f6f3ec', '#eef2f7', '#fff7e2'],
  wing: ['#9aa7b8', '#b6c0cd', '#7f8c9e', '#a99a8a'],
  wingTip: '#2a2733',
  beak: ['#ffcc33', '#ffb62e', '#ffd94f'],
  beakSpot: '#e8323f',
  mouth: '#7a1530',
  tongue: '#ff7a8a',
  blush: '#ff9fb8',
  iris: '#ffd23a',
  eyeRing: '#ff6a4a',
  fry: '#ffd65a',
  fryShade: '#e3a21a',
  gold: '#ffc631',
  goldDark: '#c17b06',
  hat: ['#e22e41', '#2f6fe0', '#22b04f', '#8a3fd6', '#ff8a1f', '#ff4fa3'],
  navy: '#1e2b5c',
  white: '#ffffff',
  dark: '#1b1430',
};
