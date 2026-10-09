// The 4 seats. Seat 0 is always the human player (bottom-left, blue like « You » in Color Clash).

export type Corner = 'BL' | 'BR' | 'TL' | 'TR';

export interface TeamColors {
  tile: string;
  tileAlt: string; // second shade used by the per-tile jitter
  grout: string;
  dark: string;
  light: string;
  outline: string;
}

export const teams: Record<'blue' | 'red' | 'green' | 'yellow', TeamColors> = {
  blue: { tile: '#34a2ff', tileAlt: '#2e98fb', grout: '#2486ea', dark: '#1a63c4', light: '#9ad6ff', outline: '#0f3f86' },
  red: { tile: '#fb586c', tileAlt: '#fc465b', grout: '#e22e41', dark: '#bb1f35', light: '#ffa2ad', outline: '#7d0f20' },
  green: { tile: '#3fd46b', tileAlt: '#33c95f', grout: '#22b04f', dark: '#178a3d', light: '#a3f2b9', outline: '#0b5a25' },
  yellow: { tile: '#ffc631', tileAlt: '#ffbb22', grout: '#eba315', dark: '#c17b06', light: '#ffe596', outline: '#7f4c00' },
};

export const seats: { corner: Corner; team: keyof typeof teams }[] = [
  { corner: 'BL', team: 'blue' },
  { corner: 'TR', team: 'red' },
  { corner: 'TL', team: 'green' },
  { corner: 'BR', team: 'yellow' },
];

export const humanName = 'Vous';

// Random opponent pseudos: a template is picked, then each {slot} is filled from its word list.
export const pseudo = {
  templates: ['{a}{b}', '{b}{a}', '{a}{b}{n}', '{a}{n}', '{a}_{b}', '{b}{a}{n}'],
  a: [
    'Mouette', 'Goéland', 'Piaf', 'Plume', 'Bec', 'Frite', 'Crevette', 'Sardine',
    'Moule', 'Bigorno', 'Hareng', 'Écume', 'Vague', 'Cui', 'Kaï', 'Mouss',
  ],
  b: [
    'Turbo', 'Ninja', 'Pirate', 'Zinzin', 'Furax', 'Boss', 'Pro', 'Max',
    'Star', 'Sauvage', 'Rapide', 'Magique', 'Cosmik', 'Gourmet', 'Yolo', 'Mega',
  ],
  numberMin: 2,
  numberMax: 99,
  /** Longer pseudos are re-rolled so they fit the standings cards. */
  maxLength: 11,
  maxRerolls: 30,
};
